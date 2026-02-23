-- 프로젝트 상태 짧은 메모 (최대 200자)
ALTER TABLE projects_nvc
  ADD COLUMN status_note VARCHAR(200);
