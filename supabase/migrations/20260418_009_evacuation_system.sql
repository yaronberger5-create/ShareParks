-- ============================================================
-- Phase 11: Emergency Evacuation System
-- Owner "I'm coming home" → Driver gets real-time alert
-- ============================================================

-- Add availability window to parkings
ALTER TABLE parkings
  ADD COLUMN IF NOT EXISTS available_from TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS available_until TIMESTAMPTZ;

-- Add evacuation fields to bookings
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS is_emergency_evacuation BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS evacuation_requested_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS evacuation_confirmed_at TIMESTAMPTZ;

-- Index for active evacuations
CREATE INDEX idx_bookings_evacuation
  ON bookings (parking_id)
  WHERE is_emergency_evacuation = true AND evacuation_confirmed_at IS NULL;

-- ─── Notify driver on evacuation ────────────────────────────
CREATE OR REPLACE FUNCTION notify_driver_evacuation()
RETURNS TRIGGER AS $$
DECLARE
  v_parking RECORD;
BEGIN
  IF old.is_emergency_evacuation = false AND new.is_emergency_evacuation = true THEN
    SELECT address INTO v_parking FROM parkings WHERE id = new.parking_id;

    -- In-app notification
    INSERT INTO notifications (user_id, type, title, body, data)
    VALUES (
      new.renter_id,
      'system',
      '⚠️ בעל החניה חוזר!',
      format('יש לפנות את החניה ב-%s תוך 5 דקות.', v_parking.address),
      jsonb_build_object(
        'booking_id', new.id,
        'parking_id', new.parking_id,
        'evacuation_requested_at', new.evacuation_requested_at,
        'urgency', 'high'
      )
    );

    -- Realtime broadcast
    PERFORM pg_notify(
      'evacuation_alert',
      json_build_object(
        'booking_id', new.id,
        'renter_id', new.renter_id,
        'parking_id', new.parking_id
      )::text
    );
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_evacuation_alert
  AFTER UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION notify_driver_evacuation();

-- ─── Auto-complete booking on evacuation confirm ────────────
CREATE OR REPLACE FUNCTION handle_evacuation_confirmed()
RETURNS TRIGGER AS $$
BEGIN
  IF old.evacuation_confirmed_at IS NULL AND new.evacuation_confirmed_at IS NOT NULL THEN
    -- Calculate partial price (actual time used)
    new.actual_end_timestamp := new.evacuation_confirmed_at;
    new.status := 'completed';

    -- Recalculate price based on actual duration
    DECLARE
      v_parking RECORD;
      v_actual_hours NUMERIC;
      v_new_price NUMERIC;
    BEGIN
      SELECT price_per_hour INTO v_parking FROM parkings WHERE id = new.parking_id;
      v_actual_hours := EXTRACT(EPOCH FROM (new.evacuation_confirmed_at - new.start_timestamp)) / 3600;
      v_new_price := ROUND(v_parking.price_per_hour * v_actual_hours, 2);
      new.final_price := GREATEST(v_new_price, new.total_price * 0.5); -- minimum 50% charge
    END;
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_evacuation_confirmed
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION handle_evacuation_confirmed();
