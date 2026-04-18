-- ============================================================
-- Phase 12: Penalties, Fairness & Smart Pricing
-- Overtime penalties, karma system, load balancing
-- ============================================================

-- ─── 1. OVERTIME PENALTY SYSTEM ─────────────────────────────

-- Add penalty fields to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS karma_score NUMERIC(3,1) NOT NULL DEFAULT 5.0,
  ADD COLUMN IF NOT EXISTS violation_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS blocked_until TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS blocked_reason TEXT;

-- Add overtime rate config
INSERT INTO platform_config (key, value) VALUES
  ('overtime_rate_multiplier', '3'::jsonb),     -- x3 per minute after grace
  ('overtime_grace_minutes', '5'::jsonb),        -- 5 min grace period
  ('max_violations_before_block', '3'::jsonb),   -- 3 strikes = blocked
  ('min_karma_for_premium', '4.5'::jsonb)        -- min karma for premium parkings
ON CONFLICT (key) DO NOTHING;

-- Add penalty tracking to bookings
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS penalty_amount NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_violation BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS violation_notified_at TIMESTAMPTZ;

-- ─── Auto-detect overtime violations ────────────────────────

CREATE OR REPLACE FUNCTION check_overtime_violation()
RETURNS TRIGGER AS $$
DECLARE
  v_grace INT;
  v_multiplier INT;
  v_parking RECORD;
  v_overtime_minutes INT;
  v_penalty NUMERIC;
  v_max_violations INT;
BEGIN
  -- Only on status change to 'completed' with actual overtime
  IF new.status = 'completed' AND new.overtime_minutes > 0 THEN
    SELECT (value)::int INTO v_grace FROM platform_config WHERE key = 'overtime_grace_minutes';
    SELECT (value)::int INTO v_multiplier FROM platform_config WHERE key = 'overtime_rate_multiplier';
    SELECT (value)::int INTO v_max_violations FROM platform_config WHERE key = 'max_violations_before_block';

    -- Beyond grace period = violation
    IF new.overtime_minutes > v_grace THEN
      v_overtime_minutes := new.overtime_minutes - v_grace;

      SELECT price_per_hour INTO v_parking FROM parkings WHERE id = new.parking_id;

      -- Penalty: overtime_minutes × (price_per_hour / 60) × multiplier
      v_penalty := ROUND(v_overtime_minutes * (v_parking.price_per_hour / 60) * v_multiplier, 2);

      new.penalty_amount := v_penalty;
      new.is_violation := true;
      new.final_price := COALESCE(new.final_price, new.total_price) + v_penalty;

      -- Update renter karma and violation count
      UPDATE profiles
      SET violation_count = violation_count + 1,
          karma_score = GREATEST(1.0, karma_score - 0.5)
      WHERE id = new.renter_id;

      -- Check if should be blocked
      IF (SELECT violation_count FROM profiles WHERE id = new.renter_id) >= v_max_violations THEN
        UPDATE profiles
        SET is_blocked = true,
            blocked_until = now() + interval '7 days',
            blocked_reason = format('חריגת זמן %s פעמים. חסום עד %s',
              v_max_violations, to_char(now() + interval '7 days', 'DD/MM/YYYY'))
        WHERE id = new.renter_id;
      END IF;

      -- Notify renter about penalty
      INSERT INTO notifications (user_id, type, title, body, data)
      VALUES (
        new.renter_id, 'system',
        format('⚠️ חריגת זמן — קנס %s ש"ח', v_penalty),
        format('חרגת ב-%s דקות מעבר לזמן ההזמנה. חיוב נוסף: %s ש"ח (תעריף x%s).', v_overtime_minutes, v_penalty, v_multiplier),
        jsonb_build_object('booking_id', new.id, 'penalty', v_penalty, 'overtime_minutes', v_overtime_minutes)
      );

      -- "Virtual tow" warning notification
      INSERT INTO notifications (user_id, type, title, body, data)
      VALUES (
        new.renter_id, 'system',
        '🚨 התראת גרירה',
        'זמנך הסתיים. פרטיך (ת.ז ורישיון) הועברו לבעל החניה. אנא פנה את החניה מיידית.',
        jsonb_build_object('booking_id', new.id, 'urgency', 'critical')
      );
    END IF;
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_check_overtime_violation
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION check_overtime_violation();

-- ─── 2. FAIRNESS ALGORITHM (LOAD BALANCING) ─────────────────

-- Add usage tracking to parkings
ALTER TABLE parkings
  ADD COLUMN IF NOT EXISTS monthly_revenue NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS monthly_bookings INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS usage_score NUMERIC(5,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_pct NUMERIC(3,1) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_recommended BOOLEAN DEFAULT false;

-- Function to calculate usage score and set discounts
CREATE OR REPLACE FUNCTION update_parking_usage_scores()
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_avg_revenue NUMERIC;
  v_parking RECORD;
BEGIN
  -- Get average monthly revenue across all active parkings
  SELECT COALESCE(AVG(monthly_revenue), 0) INTO v_avg_revenue
  FROM parkings WHERE is_active = true;

  -- Update each parking's usage score and discount
  FOR v_parking IN SELECT id, monthly_revenue FROM parkings WHERE is_active = true
  LOOP
    UPDATE parkings
    SET
      -- Lower score = less used = should appear higher
      usage_score = CASE
        WHEN v_avg_revenue = 0 THEN 0
        ELSE ROUND((v_parking.monthly_revenue / NULLIF(v_avg_revenue, 0)) * 100, 2)
      END,
      -- Discount for underused parkings (earned less than 50% of average)
      discount_pct = CASE
        WHEN v_avg_revenue > 0 AND v_parking.monthly_revenue < (v_avg_revenue * 0.5) THEN 10.0
        WHEN v_avg_revenue > 0 AND v_parking.monthly_revenue < (v_avg_revenue * 0.75) THEN 5.0
        ELSE 0
      END,
      -- Recommend underused parkings
      is_recommended = (v_avg_revenue > 0 AND v_parking.monthly_revenue < (v_avg_revenue * 0.5))
    WHERE id = v_parking.id;
  END LOOP;
END;
$$;

-- ─── 3. SMART SEARCH WITH FAIRNESS ─────────────────────────

-- Enhanced search that includes fairness sorting
CREATE OR REPLACE FUNCTION search_parkings_fair(
  user_lat FLOAT,
  user_lng FLOAT,
  radius_meters INT DEFAULT 1000,
  min_karma FLOAT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  owner_id UUID,
  address TEXT,
  city TEXT,
  description TEXT,
  images TEXT[],
  price_per_hour NUMERIC,
  distance_meters FLOAT,
  discount_pct NUMERIC,
  is_recommended BOOLEAN,
  avg_rating NUMERIC,
  effective_price NUMERIC
)
LANGUAGE SQL STABLE AS $$
  SELECT
    p.id,
    p.owner_id,
    p.address,
    p.city,
    p.description,
    p.images,
    p.price_per_hour,
    ST_Distance(
      p.coordinates,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
    ) AS distance_meters,
    p.discount_pct,
    p.is_recommended,
    p.avg_rating,
    ROUND(p.price_per_hour * (1 - p.discount_pct / 100), 2) AS effective_price
  FROM parkings p
  WHERE p.is_active = true
    AND ST_DWithin(
      p.coordinates,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
      radius_meters
    )
  ORDER BY
    p.is_recommended DESC,          -- Recommended first
    p.usage_score ASC,              -- Less used first (fairness)
    distance_meters ASC;            -- Then by distance
$$;

-- ─── 4. OWNER PREFERENCE: MIN KARMA ────────────────────────

ALTER TABLE parkings
  ADD COLUMN IF NOT EXISTS min_karma_required NUMERIC(3,1) DEFAULT 0;
