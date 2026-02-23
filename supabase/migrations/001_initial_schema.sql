-- Nice Vibe Coding - Initial Schema
-- Projects and Activities with RLS

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects table (nice vibe coding)
CREATE TABLE projects_nvc (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'idea' CHECK (status IN ('idea', 'building', 'blocked', 'launched')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  github_repo_id BIGINT
);

-- Activities table (nice vibe coding)
CREATE TABLE activities_nvc (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects_nvc(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('dev', 'marketing', 'monetization', 'analytics', 'planning')),
  intensity SMALLINT NOT NULL CHECK (intensity >= 1 AND intensity <= 3),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, project_id, date, type)
);

-- Indexes for date-heavy queries (activity heatmap, streaks)
CREATE INDEX idx_activities_nvc_user_date ON activities_nvc(user_id, date DESC);
CREATE INDEX idx_activities_nvc_user_project_date ON activities_nvc(user_id, project_id, date DESC);
CREATE INDEX idx_activities_nvc_user_type_date ON activities_nvc(user_id, type, date DESC);

-- Index for project lookups
CREATE INDEX idx_projects_nvc_user_id ON projects_nvc(user_id);

-- RLS
ALTER TABLE projects_nvc ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities_nvc ENABLE ROW LEVEL SECURITY;

-- Projects: user can only access own
CREATE POLICY "Users can view own projects_nvc" ON projects_nvc
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects_nvc" ON projects_nvc
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects_nvc" ON projects_nvc
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects_nvc" ON projects_nvc
  FOR DELETE USING (auth.uid() = user_id);

-- Activities: user can only access own
CREATE POLICY "Users can view own activities_nvc" ON activities_nvc
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activities_nvc" ON activities_nvc
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activities_nvc" ON activities_nvc
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own activities_nvc" ON activities_nvc
  FOR DELETE USING (auth.uid() = user_id);
