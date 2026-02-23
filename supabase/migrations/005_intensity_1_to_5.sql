-- 강도 1-3 → 1-5로 확장
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.activities_nvc'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%intensity%'
  )
  LOOP
    EXECUTE format('ALTER TABLE activities_nvc DROP CONSTRAINT %I', r.conname);
  END LOOP;
END $$;

ALTER TABLE activities_nvc
  ADD CONSTRAINT activities_nvc_intensity_check
  CHECK (intensity >= 1 AND intensity <= 5);
