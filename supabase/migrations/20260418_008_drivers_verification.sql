-- ============================================================
-- Phase 10: Driver Verification System
-- ID card, driver license, car registration verification
-- ============================================================

CREATE TABLE drivers_verification (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  full_name             TEXT NOT NULL,
  license_plate         TEXT NOT NULL,
  id_card_url           TEXT,
  driver_license_url    TEXT,
  car_registration_url  TEXT,

  verification_status   TEXT NOT NULL DEFAULT 'pending'
    CHECK (verification_status IN ('pending', 'approved', 'rejected')),

  rejection_reason      TEXT,
  verified_at           TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT unique_user_verification UNIQUE (user_id)
);

CREATE INDEX idx_verification_user ON drivers_verification (user_id);
CREATE INDEX idx_verification_status ON drivers_verification (verification_status)
  WHERE verification_status = 'pending';

CREATE TRIGGER trg_verification_updated_at
  BEFORE UPDATE ON drivers_verification
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE drivers_verification ENABLE ROW LEVEL SECURITY;

CREATE POLICY "verification_select_own"
  ON drivers_verification FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "verification_insert_own"
  ON drivers_verification FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "verification_update_own"
  ON drivers_verification FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Add verification status to profiles
ALTER TABLE profiles
  ADD COLUMN is_verified BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN license_plate TEXT;

-- Auto-update profile when verification is approved
CREATE OR REPLACE FUNCTION handle_verification_approved()
RETURNS TRIGGER AS $$
BEGIN
  IF old.verification_status != 'approved' AND new.verification_status = 'approved' THEN
    UPDATE profiles
    SET is_verified = true,
        license_plate = new.license_plate
    WHERE id = new.user_id;

    new.verified_at := now();

    INSERT INTO notifications (user_id, type, title, body, data)
    VALUES (
      new.user_id,
      'system',
      'האימות אושר! ✅',
      'החשבון שלך אומת בהצלחה. עכשיו אתה יכול להזמין חניות.',
      jsonb_build_object('verification_id', new.id)
    );
  END IF;

  IF old.verification_status != 'rejected' AND new.verification_status = 'rejected' THEN
    INSERT INTO notifications (user_id, type, title, body, data)
    VALUES (
      new.user_id,
      'system',
      'האימות נדחה',
      format('סיבה: %s. אנא העלה מסמכים מחדש.', new.rejection_reason),
      jsonb_build_object('verification_id', new.id, 'reason', new.rejection_reason)
    );
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_verification_status_change
  BEFORE UPDATE ON drivers_verification
  FOR EACH ROW
  EXECUTE FUNCTION handle_verification_approved();
