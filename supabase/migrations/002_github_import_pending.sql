-- GitHub import pending: temporary storage for repos fetched during OAuth callback
-- Replaces cookie (4KB limit) with DB storage

CREATE TABLE github_import_pending (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  repos JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Expire after 5 min (cleanup can run periodically, or we just overwrite on next import)
CREATE INDEX idx_github_import_pending_created ON github_import_pending(created_at);

ALTER TABLE github_import_pending ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own github_import_pending" ON github_import_pending
  FOR ALL USING (auth.uid() = user_id);
