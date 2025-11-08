-- Phase 7 Sidebar Enhancements: Daily Assistant & Study Analyzer
-- This migration introduces supporting tables, views, and helper functions
-- to enable smart scheduling, energy tracking, adaptive study analytics,
-- and content recommendations.

set check_function_bodies = off;

-- //////////////////////////////
-- Daily Assistant Structures
-- //////////////////////////////

create table if not exists public.daily_agenda_items (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(user_id) on delete cascade,
  title text not null,
  description text,
  category text,
  start_at timestamptz,
  end_at timestamptz,
  energy_target text check (energy_target in ('low','medium','high')),
  priority smallint default 0,
  status text not null default 'planned' check (status in ('planned','in_progress','completed','skipped')),
  source text default 'manual' check (source in ('manual','ai','mentor')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists daily_agenda_items_student_idx on public.daily_agenda_items(student_id);
create index if not exists daily_agenda_items_window_idx on public.daily_agenda_items(start_at, end_at);

create table if not exists public.daily_task_dependencies (
  id uuid primary key default gen_random_uuid(),
  agenda_item_id uuid not null references public.daily_agenda_items(id) on delete cascade,
  depends_on_item_id uuid not null references public.daily_agenda_items(id) on delete cascade,
  dependency_type text not null default 'blocking' check (dependency_type in ('blocking','supporting')),
  created_at timestamptz not null default now(),
  constraint daily_task_dependencies_unique unique (agenda_item_id, depends_on_item_id)
);

create index if not exists daily_task_dependencies_parent_idx on public.daily_task_dependencies(agenda_item_id);

create table if not exists public.energy_snapshots (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(user_id) on delete cascade,
  captured_at timestamptz not null default now(),
  energy_score smallint not null check (energy_score between 1 and 5),
  focus_score smallint check (focus_score between 1 and 5),
  notes text,
  source text not null default 'checkin' check (source in ('checkin','sensor','manual'))
);

create index if not exists energy_snapshots_student_idx on public.energy_snapshots(student_id, captured_at desc);

create table if not exists public.productivity_metrics (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(user_id) on delete cascade,
  metric_date date not null,
  planned_minutes integer default 0,
  actual_minutes integer default 0,
  deep_work_minutes integer default 0,
  context_switches integer default 0,
  ai_suggestions_accepted integer default 0,
  ai_suggestions_rejected integer default 0,
  created_at timestamptz not null default now(),
  constraint productivity_metrics_unique unique (student_id, metric_date)
);

create index if not exists productivity_metrics_student_idx on public.productivity_metrics(student_id, metric_date desc);

-- //////////////////////////////
-- Study Analyzer Structures
-- //////////////////////////////

create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(user_id) on delete cascade,
  ark_id uuid references public.arks(id) on delete set null,
  session_type text default 'solo' check (session_type in ('solo','group','mentor')),
  material_type text,
  started_at timestamptz not null,
  ended_at timestamptz,
  notes text,
  tags text[],
  created_at timestamptz not null default now()
);

create index if not exists study_sessions_student_idx on public.study_sessions(student_id, started_at desc);

create table if not exists public.study_performance_snapshots (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(user_id) on delete cascade,
  session_id uuid references public.study_sessions(id) on delete set null,
  snapshot_date date not null,
  engagement_score numeric(5,2),
  retention_score numeric(5,2),
  completion_rate numeric(5,2),
  difficulty_rating numeric(5,2),
  ml_confidence numeric(5,2),
  created_at timestamptz not null default now(),
  constraint study_performance_unique unique (student_id, snapshot_date, session_id)
);

create index if not exists study_performance_student_idx on public.study_performance_snapshots(student_id, snapshot_date desc);

create table if not exists public.learning_path_nodes (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(user_id) on delete cascade,
  topic_id text not null,
  topic_name text,
  mastery_level numeric(5,2) default 0,
  last_assessed_at timestamptz,
  recommended_next jsonb,
  created_at timestamptz not null default now(),
  constraint learning_path_nodes_unique unique (student_id, topic_id)
);

create index if not exists learning_path_nodes_student_idx on public.learning_path_nodes(student_id);

create table if not exists public.content_recommendations (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(user_id) on delete cascade,
  resource_id text,
  resource_type text,
  source text,
  score numeric(5,2),
  presented_at timestamptz not null default now(),
  action text check (action in ('accepted','snoozed','dismissed','ignored')),
  feedback_notes text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists content_recommendations_student_idx on public.content_recommendations(student_id, presented_at desc);

create table if not exists public.spaced_repetition_queue (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(user_id) on delete cascade,
  card_identifier text not null,
  origin text default 'study_session' check (origin in ('study_session','practice_questions','manual')),
  due_at timestamptz not null,
  interval_days integer default 1,
  ease_factor numeric(5,2) default 2.5,
  success_streak integer default 0,
  last_reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint spaced_repetition_unique unique (student_id, card_identifier)
);

create index if not exists spaced_repetition_queue_due_idx on public.spaced_repetition_queue(student_id, due_at);

-- //////////////////////////////
-- Views & Helper Functions
-- //////////////////////////////

create or replace view public.view_daily_productivity_summary as
with agenda as (
  select
    id,
    student_id,
    start_at,
    end_at,
    date_trunc('day', start_at)::date as agenda_day
  from public.daily_agenda_items
),
joined as (
  select
    agenda.id,
    agenda.student_id,
    agenda.start_at,
    agenda.end_at,
    agenda.agenda_day,
    pm.metric_date as pm_metric_date,
    pm.planned_minutes,
    pm.actual_minutes,
    pm.deep_work_minutes,
    pm.context_switches,
    coalesce(pm.metric_date, agenda.agenda_day) as metric_date
  from agenda
  left join public.productivity_metrics pm
    on pm.student_id = agenda.student_id
   and pm.metric_date = agenda.agenda_day
)
select
  joined.student_id,
  joined.metric_date,
  count(distinct joined.id) as agenda_items,
  sum(
    extract(epoch from (coalesce(joined.end_at, joined.start_at) - joined.start_at)) / 60
  ) filter (where joined.end_at is not null and joined.start_at is not null) as planned_minutes_calc,
  joined.planned_minutes,
  joined.actual_minutes,
  joined.deep_work_minutes,
  joined.context_switches
from joined
group by joined.student_id, joined.metric_date, joined.planned_minutes, joined.actual_minutes, joined.deep_work_minutes, joined.context_switches;

create or replace function public.fn_recompute_energy_bands(p_student_id uuid)
returns table (
  band text,
  score numeric
)
language plpgsql
as $$
begin
  return query
  select
    case
      when energy_score <= 2 then 'low'
      when energy_score = 3 then 'medium'
      else 'high'
    end as band,
    avg(energy_score)::numeric(4,2) as score
  from public.energy_snapshots
  where student_id = p_student_id
    and captured_at >= now() - interval '7 days'
  group by band;
end;
$$;

create or replace function public.fn_study_path_progress(p_student_id uuid)
returns jsonb
language plpgsql
as $$
declare
  result jsonb;
begin
  select coalesce(jsonb_agg(jsonb_build_object(
    'topicId', topic_id,
    'topicName', topic_name,
    'masteryLevel', mastery_level,
    'lastAssessedAt', last_assessed_at,
    'recommendedNext', recommended_next
  ) order by mastery_level desc), '[]'::jsonb)
  into result
  from public.learning_path_nodes
  where student_id = p_student_id;

  return result;
end;
$$;

-- //////////////////////////////
-- Row Level Security Policies
-- //////////////////////////////

alter table public.daily_agenda_items enable row level security;
alter table public.daily_task_dependencies enable row level security;
alter table public.energy_snapshots enable row level security;
alter table public.productivity_metrics enable row level security;
alter table public.study_sessions enable row level security;
alter table public.study_performance_snapshots enable row level security;
alter table public.learning_path_nodes enable row level security;
alter table public.content_recommendations enable row level security;
alter table public.spaced_repetition_queue enable row level security;

-- Generic policy helper: allow students to manage their own rows
create policy student_manage_daily_agenda_items on public.daily_agenda_items
  using (student_id = auth.uid())
  with check (student_id = auth.uid());

create policy student_manage_daily_task_dependencies on public.daily_task_dependencies
  using (exists (
    select 1 from public.daily_agenda_items dai
    where dai.id = daily_task_dependencies.agenda_item_id
      and dai.student_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.daily_agenda_items dai
    where dai.id = daily_task_dependencies.agenda_item_id
      and dai.student_id = auth.uid()
  ));

create policy student_manage_energy_snapshots on public.energy_snapshots
  using (student_id = auth.uid())
  with check (student_id = auth.uid());

create policy student_manage_productivity_metrics on public.productivity_metrics
  using (student_id = auth.uid())
  with check (student_id = auth.uid());

create policy student_manage_study_sessions on public.study_sessions
  using (student_id = auth.uid())
  with check (student_id = auth.uid());

create policy student_manage_study_performance on public.study_performance_snapshots
  using (student_id = auth.uid())
  with check (student_id = auth.uid());

create policy student_manage_learning_path_nodes on public.learning_path_nodes
  using (student_id = auth.uid())
  with check (student_id = auth.uid());

create policy student_manage_content_recommendations on public.content_recommendations
  using (student_id = auth.uid())
  with check (student_id = auth.uid());

create policy student_manage_spaced_repetition_queue on public.spaced_repetition_queue
  using (student_id = auth.uid())
  with check (student_id = auth.uid());

-- Allow mentors/admins to read student data for analytics dashboards
create policy staff_read_daily_agenda_items on public.daily_agenda_items
  for select using (auth.role() = 'service_role');

-- Similar staff read policies can be added if required per table (reuse views when possible)

comment on view public.view_daily_productivity_summary is
  'Aggregated daily productivity metrics combining agenda items and stored productivity stats.';

comment on function public.fn_recompute_energy_bands(uuid) is
  'Returns average energy scores over the last week grouped into low/medium/high bands.';

comment on function public.fn_study_path_progress(uuid) is
  'Returns a JSON array describing mastery progression and recommended next steps for a student.';


