-- Project Collaboration Tables
-- Allow students to work together on projects

-- Team Projects (grouped project instances)
CREATE TABLE IF NOT EXISTS team_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  subject_id TEXT,
  project_type TEXT,
  created_by UUID NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
  institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  batch_id TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  deadline TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team Project Members
CREATE TABLE IF NOT EXISTS team_project_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_project_id UUID NOT NULL REFERENCES team_projects(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'collaborator', 'viewer')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_project_id, student_id)
);

-- Project Notes (shared notes/comments on projects)
CREATE TABLE IF NOT EXISTS project_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_project_id UUID NOT NULL REFERENCES team_projects(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  note_type TEXT DEFAULT 'comment' CHECK (note_type IN ('comment', 'question', 'idea', 'update')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Shared Resources (links, files, etc.)
CREATE TABLE IF NOT EXISTS project_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_project_id UUID NOT NULL REFERENCES team_projects(id) ON DELETE CASCADE,
  added_by UUID NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT,
  resource_type TEXT DEFAULT 'link' CHECK (resource_type IN ('link', 'file', 'document')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_team_projects_created_by ON team_projects(created_by);
CREATE INDEX idx_team_projects_institute_id ON team_projects(institute_id);
CREATE INDEX idx_team_project_members_team_project_id ON team_project_members(team_project_id);
CREATE INDEX idx_team_project_members_student_id ON team_project_members(student_id);
CREATE INDEX idx_project_notes_team_project_id ON project_notes(team_project_id);
CREATE INDEX idx_project_resources_team_project_id ON project_resources(team_project_id);

-- RLS Policies
ALTER TABLE team_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students can view team projects from their institute" ON team_projects
  FOR SELECT USING (
    institute_id IN (
      SELECT institute_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Students can create team projects" ON team_projects
  FOR INSERT WITH CHECK (
    created_by IN (
      SELECT user_id FROM students WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Project owners can update their projects" ON team_projects
  FOR UPDATE USING (
    created_by IN (
      SELECT user_id FROM students WHERE user_id = auth.uid()
    )
  );

ALTER TABLE team_project_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students can view members of their team projects" ON team_project_members
  FOR SELECT USING (
    team_project_id IN (
      SELECT id FROM team_projects WHERE institute_id IN (
        SELECT institute_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Students can join team projects" ON team_project_members
  FOR INSERT WITH CHECK (
    student_id IN (
      SELECT user_id FROM students WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Students can leave team projects" ON team_project_members
  FOR DELETE USING (
    student_id IN (
      SELECT user_id FROM students WHERE user_id = auth.uid()
    )
  );

ALTER TABLE project_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students can view notes on their team projects" ON project_notes
  FOR SELECT USING (
    team_project_id IN (
      SELECT id FROM team_projects WHERE institute_id IN (
        SELECT institute_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Students can add notes to their team projects" ON project_notes
  FOR INSERT WITH CHECK (
    student_id IN (
      SELECT user_id FROM students WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Students can update their own notes" ON project_notes
  FOR UPDATE USING (
    student_id IN (
      SELECT user_id FROM students WHERE user_id = auth.uid()
    )
  );

ALTER TABLE project_resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students can view resources on their team projects" ON project_resources
  FOR SELECT USING (
    team_project_id IN (
      SELECT id FROM team_projects WHERE institute_id IN (
        SELECT institute_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Students can add resources to their team projects" ON project_resources
  FOR INSERT WITH CHECK (
    added_by IN (
      SELECT user_id FROM students WHERE user_id = auth.uid()
    )
  );

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_team_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER team_projects_updated_at
  BEFORE UPDATE ON team_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_team_projects_updated_at();

