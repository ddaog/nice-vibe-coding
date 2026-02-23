-- ICE Framework: Impact, Confidence, Ease (1-10 each)
-- Score = (Impact + Confidence + Ease) / 3

ALTER TABLE projects_nvc
  ADD COLUMN ice_impact SMALLINT CHECK (ice_impact >= 1 AND ice_impact <= 10),
  ADD COLUMN ice_confidence SMALLINT CHECK (ice_confidence >= 1 AND ice_confidence <= 10),
  ADD COLUMN ice_ease SMALLINT CHECK (ice_ease >= 1 AND ice_ease <= 10);
