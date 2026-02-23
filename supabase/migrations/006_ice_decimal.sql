-- ICE: allow decimal values 1.0–10.0 (one decimal place)
ALTER TABLE projects_nvc
  ALTER COLUMN ice_impact TYPE REAL USING ice_impact::REAL,
  ALTER COLUMN ice_confidence TYPE REAL USING ice_confidence::REAL,
  ALTER COLUMN ice_ease TYPE REAL USING ice_ease::REAL;
