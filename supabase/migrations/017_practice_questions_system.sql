-- ==================== PRACTICE QUESTIONS ENHANCEMENT SYSTEM ====================
-- Migration: 017_practice_questions_system
-- Description: Comprehensive practice questions system with adaptive difficulty,
--               mistake tracking, pattern analysis, and spaced repetition integration

set check_function_bodies = off;

-- ==================== PRACTICE SESSIONS ====================

-- Practice Sessions: Track complete practice sessions
create table if not exists public.practice_sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(user_id) on delete cascade,
  subject text,
  topic text,
  difficulty_level text not null default 'medium' check (difficulty_level in ('easy', 'medium', 'hard')),
  total_questions integer not null default 0 check (total_questions >= 0),
  correct_answers integer not null default 0 check (correct_answers >= 0),
  accuracy decimal(5,2) check (accuracy >= 0 and accuracy <= 100),
  time_spent_seconds integer check (time_spent_seconds >= 0),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  metadata jsonb default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists practice_sessions_student_idx on public.practice_sessions(student_id);
create index if not exists practice_sessions_subject_topic_idx on public.practice_sessions(subject, topic);
create index if not exists practice_sessions_completed_idx on public.practice_sessions(completed_at);

-- ==================== PRACTICE QUESTIONS ====================

-- Practice Questions: Store generated questions
create table if not exists public.practice_questions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(user_id) on delete cascade,
  session_id uuid references public.practice_sessions(id) on delete set null,
  question_text text not null,
  options jsonb not null, -- Array of answer options
  correct_answer_index integer not null check (correct_answer_index >= 0),
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  topic text,
  subject text,
  explanation text,
  generated_at timestamptz not null default now(),
  metadata jsonb default '{}'
);

create index if not exists practice_questions_student_idx on public.practice_questions(student_id);
create index if not exists practice_questions_session_idx on public.practice_questions(session_id);
create index if not exists practice_questions_topic_subject_idx on public.practice_questions(topic, subject);

-- ==================== PRACTICE ATTEMPTS ====================

-- Practice Attempts: Track individual question attempts
create table if not exists public.practice_attempts (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.practice_questions(id) on delete cascade,
  student_id uuid not null references public.students(user_id) on delete cascade,
  session_id uuid references public.practice_sessions(id) on delete set null,
  selected_answer_index integer,
  is_correct boolean not null,
  time_spent_seconds integer check (time_spent_seconds >= 0),
  attempted_at timestamptz not null default now(),
  metadata jsonb default '{}'
);

create index if not exists practice_attempts_question_idx on public.practice_attempts(question_id);
create index if not exists practice_attempts_student_idx on public.practice_attempts(student_id);
create index if not exists practice_attempts_session_idx on public.practice_attempts(session_id);
create index if not exists practice_attempts_attempted_idx on public.practice_attempts(attempted_at);

-- ==================== MISTAKE PATTERNS ====================

-- Mistake Patterns: Analyze and track mistake patterns
create table if not exists public.mistake_patterns (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(user_id) on delete cascade,
  topic text not null,
  subject text,
  mistake_type text not null check (mistake_type in ('conceptual', 'calculation', 'time_management', 'reading_comprehension', 'application', 'other')),
  frequency integer not null default 1 check (frequency >= 1),
  last_occurred_at timestamptz not null default now(),
  pattern_data jsonb default '{}', -- Stores additional pattern analysis
  updated_at timestamptz not null default now(),
  constraint mistake_patterns_unique unique (student_id, topic, mistake_type)
);

create index if not exists mistake_patterns_student_idx on public.mistake_patterns(student_id);
create index if not exists mistake_patterns_topic_subject_idx on public.mistake_patterns(topic, subject);
create index if not exists mistake_patterns_frequency_idx on public.mistake_patterns(frequency desc);

-- ==================== ADAPTIVE DIFFICULTY ====================

-- Adaptive Difficulty: Track per-student difficulty for topics
create table if not exists public.adaptive_difficulty (
  student_id uuid not null references public.students(user_id) on delete cascade,
  topic text not null,
  subject text,
  current_difficulty text not null default 'medium' check (current_difficulty in ('easy', 'medium', 'hard')),
  performance_score decimal(5,2) check (performance_score >= 0 and performance_score <= 100),
  total_attempts integer not null default 0 check (total_attempts >= 0),
  correct_attempts integer not null default 0 check (correct_attempts >= 0),
  streak_count integer not null default 0 check (streak_count >= 0),
  last_updated_at timestamptz not null default now(),
  metadata jsonb default '{}',
  primary key (student_id, topic, subject),
  constraint adaptive_difficulty_performance check (correct_attempts <= total_attempts)
);

create index if not exists adaptive_difficulty_student_idx on public.adaptive_difficulty(student_id);
create index if not exists adaptive_difficulty_topic_subject_idx on public.adaptive_difficulty(topic, subject);
create index if not exists adaptive_difficulty_performance_idx on public.adaptive_difficulty(performance_score desc);

-- ==================== HELPER FUNCTIONS ====================

-- Function to update practice session accuracy
create or replace function public.update_practice_session_accuracy()
returns trigger as $$
begin
  if new.completed_at is not null and new.total_questions > 0 then
    new.accuracy := round((new.correct_answers::decimal / new.total_questions::decimal) * 100, 2);
  end if;
  return new;
end;
$$ language plpgsql;

-- Trigger to auto-update accuracy when session is completed
create trigger practice_sessions_accuracy_trigger
  before update on public.practice_sessions
  for each row
  execute function public.update_practice_session_accuracy();

-- Function to update adaptive difficulty performance score
create or replace function public.update_adaptive_difficulty_performance()
returns trigger as $$
begin
  if new.total_attempts > 0 then
    new.performance_score := round((new.correct_attempts::decimal / new.total_attempts::decimal) * 100, 2);
  else
    new.performance_score := null;
  end if;
  new.last_updated_at := now();
  return new;
end;
$$ language plpgsql;

-- Trigger to auto-update performance score
create trigger adaptive_difficulty_performance_trigger
  before insert or update on public.adaptive_difficulty
  for each row
  execute function public.update_adaptive_difficulty_performance();

-- ==================== ROW LEVEL SECURITY ====================

-- Enable RLS on all tables
alter table public.practice_sessions enable row level security;
alter table public.practice_questions enable row level security;
alter table public.practice_attempts enable row level security;
alter table public.mistake_patterns enable row level security;
alter table public.adaptive_difficulty enable row level security;

-- RLS Policies for practice_sessions
create policy student_manage_practice_sessions on public.practice_sessions
  for all
  using (auth.uid() = student_id)
  with check (auth.uid() = student_id);

-- RLS Policies for practice_questions
create policy student_manage_practice_questions on public.practice_questions
  for all
  using (auth.uid() = student_id)
  with check (auth.uid() = student_id);

-- RLS Policies for practice_attempts
create policy student_manage_practice_attempts on public.practice_attempts
  for all
  using (auth.uid() = student_id)
  with check (auth.uid() = student_id);

-- RLS Policies for mistake_patterns
create policy student_manage_mistake_patterns on public.mistake_patterns
  for all
  using (auth.uid() = student_id)
  with check (auth.uid() = student_id);

-- RLS Policies for adaptive_difficulty
create policy student_manage_adaptive_difficulty on public.adaptive_difficulty
  for all
  using (auth.uid() = student_id)
  with check (auth.uid() = student_id);

-- ==================== COMMENTS ====================

comment on table public.practice_sessions is 'Tracks complete practice sessions with performance metrics';
comment on table public.practice_questions is 'Stores AI-generated practice questions';
comment on table public.practice_attempts is 'Records individual question attempts and results';
comment on table public.mistake_patterns is 'Analyzes and tracks mistake patterns for targeted improvement';
comment on table public.adaptive_difficulty is 'Tracks per-student difficulty level for adaptive learning';

