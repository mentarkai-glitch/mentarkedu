-- ==================== DASHBOARD ENHANCEMENTS ====================
-- Migration: 018_dashboard_enhancements
-- Description: Adds tables and features for enhanced teacher and student dashboards

-- ==================== STUDENT GOALS ====================

create table if not exists public.student_goals (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(user_id) on delete cascade,
  title text not null,
  description text,
  category text,
  target_value decimal,
  current_value decimal default 0,
  deadline date,
  status text default 'active' check (status in ('active', 'completed', 'paused', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists student_goals_student_idx on public.student_goals(student_id);
create index if not exists student_goals_status_idx on public.student_goals(student_id, status);

-- ==================== ATTENDANCE ====================

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(user_id) on delete cascade,
  date date not null,
  status text not null check (status in ('present', 'absent', 'late', 'excused')),
  marked_by uuid references public.users(id),
  notes text,
  created_at timestamptz not null default now(),
  constraint unique_attendance unique (student_id, date)
);

create index if not exists attendance_student_date_idx on public.attendance(student_id, date);
create index if not exists attendance_date_idx on public.attendance(date);

-- ==================== ENGAGEMENT LOGS ====================

create table if not exists public.engagement_logs (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(user_id) on delete cascade,
  date date not null,
  login_count integer default 0,
  time_spent_minutes integer default 0,
  features_used text[] default '{}',
  created_at timestamptz not null default now(),
  constraint unique_engagement_log unique (student_id, date)
);

create index if not exists engagement_logs_student_date_idx on public.engagement_logs(student_id, date);
create index if not exists engagement_logs_date_idx on public.engagement_logs(date);

-- ==================== ASSIGNMENTS ====================

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.teachers(user_id) on delete cascade,
  batch_id text not null,
  title text not null,
  description text,
  due_date timestamptz,
  max_marks decimal,
  resources jsonb default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists assignments_teacher_idx on public.assignments(teacher_id);
create index if not exists assignments_batch_idx on public.assignments(batch_id);

-- ==================== ASSIGNMENT SUBMISSIONS ====================

create table if not exists public.assignment_submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  student_id uuid not null references public.students(user_id) on delete cascade,
  submission_data jsonb,
  submitted_at timestamptz,
  marks_obtained decimal,
  feedback text,
  status text default 'pending' check (status in ('pending', 'submitted', 'graded', 'late')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint unique_submission unique (assignment_id, student_id)
);

create index if not exists assignment_submissions_assignment_idx on public.assignment_submissions(assignment_id);
create index if not exists assignment_submissions_student_idx on public.assignment_submissions(student_id);
create index if not exists assignment_submissions_status_idx on public.assignment_submissions(status);

-- ==================== DASHBOARD PREFERENCES ====================

create table if not exists public.dashboard_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  role text not null check (role in ('student', 'teacher', 'admin')),
  widget_layout jsonb default '{}',
  preferences jsonb default '{}',
  updated_at timestamptz not null default now(),
  constraint unique_dashboard_preferences unique (user_id, role)
);

create index if not exists dashboard_preferences_user_idx on public.dashboard_preferences(user_id);

-- ==================== RLS POLICIES ====================

-- Student Goals
alter table public.student_goals enable row level security;
create policy "Students can view and manage their own goals" on public.student_goals
  for all using (student_id = auth.uid()) with check (student_id = auth.uid());

create policy "Teachers can view goals of their assigned students" on public.student_goals
  for select using (
    student_id in (
      select user_id from public.students
      where batch = any(select unnest(assigned_batches) from public.teachers where user_id = auth.uid())
    )
  );

-- Attendance
alter table public.attendance enable row level security;
create policy "Students can view their own attendance" on public.attendance
  for select using (student_id = auth.uid());

create policy "Teachers can view and manage attendance of their assigned students" on public.attendance
  for all using (
    student_id in (
      select user_id from public.students
      where batch = any(select unnest(assigned_batches) from public.teachers where user_id = auth.uid())
    )
  );

-- Engagement Logs
alter table public.engagement_logs enable row level security;
create policy "Students can view their own engagement logs" on public.engagement_logs
  for select using (student_id = auth.uid());

create policy "Teachers can view engagement logs of their assigned students" on public.engagement_logs
  for select using (
    student_id in (
      select user_id from public.students
      where batch = any(select unnest(assigned_batches) from public.teachers where user_id = auth.uid())
    )
  );

create policy "System can insert engagement logs" on public.engagement_logs
  for insert with check (true);

-- Assignments
alter table public.assignments enable row level security;
create policy "Teachers can view and manage their own assignments" on public.assignments
  for all using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());

create policy "Students can view assignments for their batch" on public.assignments
  for select using (
    batch_id in (
      select batch from public.students where user_id = auth.uid()
    )
  );

-- Assignment Submissions
alter table public.assignment_submissions enable row level security;
create policy "Students can view and manage their own submissions" on public.assignment_submissions
  for all using (student_id = auth.uid()) with check (student_id = auth.uid());

create policy "Teachers can view submissions for their assignments" on public.assignment_submissions
  for select using (
    assignment_id in (
      select id from public.assignments where teacher_id = auth.uid()
    )
  );

create policy "Teachers can grade submissions for their assignments" on public.assignment_submissions
  for update using (
    assignment_id in (
      select id from public.assignments where teacher_id = auth.uid()
    )
  );

-- Dashboard Preferences
alter table public.dashboard_preferences enable row level security;
create policy "Users can view and manage their own dashboard preferences" on public.dashboard_preferences
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ==================== FUNCTIONS ====================

-- Function to update student_goals updated_at
create or replace function update_student_goals_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_student_goals_updated_at_trigger
  before update on public.student_goals
  for each row
  execute function update_student_goals_updated_at();

-- Function to update assignments updated_at
create or replace function update_assignments_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_assignments_updated_at_trigger
  before update on public.assignments
  for each row
  execute function update_assignments_updated_at();

-- Function to update assignment_submissions updated_at
create or replace function update_assignment_submissions_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_assignment_submissions_updated_at_trigger
  before update on public.assignment_submissions
  for each row
  execute function update_assignment_submissions_updated_at();

-- Function to calculate engagement score
create or replace function calculate_engagement_score(p_student_id uuid, p_date date default current_date)
returns decimal as $$
declare
  v_login_count integer;
  v_time_spent_minutes integer;
  v_features_count integer;
  v_score decimal;
begin
  select 
    coalesce(login_count, 0),
    coalesce(time_spent_minutes, 0),
    coalesce(array_length(features_used, 1), 0)
  into v_login_count, v_time_spent_minutes, v_features_count
  from public.engagement_logs
  where student_id = p_student_id and date = p_date;
  
  -- Calculate score (0-100)
  -- Login: 30 points (max 30)
  -- Time spent: 40 points (max 40 for 2+ hours)
  -- Features used: 30 points (max 30 for 5+ features)
  v_score := least(v_login_count * 10, 30) +
             least(v_time_spent_minutes / 3, 40) +
             least(v_features_count * 6, 30);
  
  return least(v_score, 100);
end;
$$ language plpgsql security definer;

