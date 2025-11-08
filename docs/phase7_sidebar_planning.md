## Phase 7 – Daily Assistant & Study Analyzer Planning

This document captures the data-model and API plan for the upcoming sidebar enhancements. It will guide the Supabase migration work and the Next.js/ML integration tasks that follow once Phase 7 starts in earnest.

---

### 1. Overview
- **Daily Assistant**: smart scheduling, productivity insights, energy-based planning, task dependencies.
- **Study Analyzer**: adaptive learning paths, performance tracking, content recommendations, spaced repetition signals.

The goal is to add structured tables that let us feed both the UI and the ML predictors (dropout, burnout, difficulty) without duplicating data.

---

### 2. Supabase Schema Updates

#### 2.1 Daily Assistant Tables
| Table | Purpose | Key Columns |
| --- | --- | --- |
| `daily_agenda_items` | Stores scheduled tasks/blocks with metadata. | `id (uuid)`, `student_id`, `title`, `description`, `category`, `start_at`, `end_at`, `energy_target` (`enum low/medium/high`), `priority`, `status (enum planned/in_progress/completed)`, `source` (`manual`, `ai`, `mentor`). |
| `daily_task_dependencies` | Captures dependencies between agenda items for Gantt-style ordering. | `id`, `agenda_item_id`, `depends_on_item_id`, `type (blocking/supporting)`. |
| `energy_snapshots` | Tracks energy/mood inputs (from check-ins or wearable data). | `id`, `student_id`, `captured_at`, `energy_score (1-5)`, `focus_score (1-5)`, `notes`, `source` (`checkin`, `sensor`, `manual`). |
| `productivity_metrics` | Aggregated daily stats used for insights. | `id`, `student_id`, `date`, `planned_minutes`, `actual_minutes`, `deep_work_minutes`, `context_switches`, `ai_suggestions_accepted`, `ai_suggestions_rejected`.

> **Existing tables leveraged**: `daily_checkins`, `ml_feature_store`, `student_outcomes` remain the source for mood/burnout signals. The new tables join on `student_id` for analytics dashboards.

#### 2.2 Study Analyzer Tables
| Table | Purpose | Key Columns |
| --- | --- | --- |
| `study_sessions` | Default log for each focused study block. | `id`, `student_id`, `ark_id (nullable)`, `session_type (solo/group/mentor)`, `started_at`, `ended_at`, `material_type (video/article/problemset)`, `notes`, `tags[]`. |
| `study_performance_snapshots` | Stores computed KPIs per session/day. | `id`, `student_id`, `session_id (nullable)`, `date`, `engagement_score`, `retention_score`, `completion_rate`, `difficulty_rating`, `ml_confidence`. |
| `learning_path_nodes` | Personalized skill graph per student. | `id`, `student_id`, `topic_id`, `topic_name`, `mastery_level (0-100)`, `last_assessed_at`, `recommended_next (jsonb)`. |
| `content_recommendations` | AI-curated resources with feedback loops. | `id`, `student_id`, `resource_id`, `resource_type`, `source` (`semantic_scholar`, `youtube`, `internal`), `score`, `presented_at`, `action` (`accepted`, `snoozed`, `dismissed`), `feedback_notes`. |
| `spaced_repetition_queue` | Supports repetitive practice (SM-2 style). | `id`, `student_id`, `card_id`, `due_at`, `interval_days`, `ease_factor`, `success_streak`, `last_reviewed_at`, `origin` (`study_session`, `practice_questions`). |

> **Reuse**: tie `study_sessions` to ARKs (`ark_id`) and tasks in `daily_agenda_items` to maintain a cohesive pipeline from planning → execution → analytics.

#### 2.3 Views & Functions
- `view_daily_productivity_summary`: join `daily_agenda_items` + `productivity_metrics` for dashboards.
- `fn_recompute_energy_bands(student_id)` (SQL function): aggregates recent energy snapshots for ML.
- `fn_study_path_progress(student_id)`: returns JSON representing mastery progression (`learning_path_nodes`).

---

### 3. API Surface (Next.js App Router)

| Endpoint | Method | Description |
| --- | --- | --- |
| `/api/daily-assistant/agenda` | `GET` | Fetch agenda items + dependencies for the logged in student (date range, status filters). |
| `/api/daily-assistant/agenda` | `POST` | Create/update agenda items, including dependencies and AI-suggested blocks. |
| `/api/daily-assistant/energy` | `POST` | Submit energy snapshot (from check-in or smartwatch webhook). |
| `/api/daily-assistant/insights` | `GET` | Return productivity insights (uses `productivity_metrics`, `fn_recompute_energy_bands`). |
| `/api/study-analyzer/sessions` | `POST` | Log study session events from the sidebar UI. |
| `/api/study-analyzer/recommendations` | `GET` | Retrieve learning path nodes + content recommendations (calls ML service + `content_recommendations`). |
| `/api/study-analyzer/spaced-repetition` | `POST` | Record review result and compute next due date (updates `spaced_repetition_queue`). |

> ML-serving dependencies: `/api/study-analyzer/recommendations` will call the FastAPI risk/difficulty endpoints and the new Semantic Scholar service for academic paper recommendations.

---

### 4. Frontend Components & Sidebar Wiring
- **Daily Assistant Panel**
  - `DailyScheduleBoard` (current list view) → extends with dependency badges and energy icons.
  - `EnergyTrendWidget` → uses `/api/daily-assistant/insights`.
  - `TaskDependencyModal` → CRUD dependencies across agenda items.

- **Study Analyzer Panel**
  - `AdaptivePathTimeline` → renders nodes from `learning_path_nodes`.
  - `ContentRecommendationCarousel` → surfaces `content_recommendations` with action buttons.
  - `SpacedRepetitionQueueList` → displays due cards and records results.

- **Cross-Sidebar Notifications**
  - Trigger toast + badge updates when ML generates new recommendations.
  - Use PostHog events: `daily_assistant_task_completed`, `study_analyzer_resource_opened`, etc.

---

### 5. Data Flow Summary
1. Student logs energy / schedules tasks → data stored in `daily_agenda_items`, `energy_snapshots`.
2. Study sessions and assessments populate `study_sessions`, `study_performance_snapshots`.
3. Background job updates `learning_path_nodes` and `content_recommendations` using ML predictions + Semantic Scholar API.
4. Sidebar UIs read data through the new API routes; analytics/ML modules ingest updated metrics for Phase 8 improvements.

---

### 6. Next Steps Checklist
- [ ] Draft migration SQL (014+) for the tables above.
- [ ] Update Supabase types in `lib/types/index.ts` once migrations land.
- [ ] Implement the `/api/daily-assistant/*` and `/api/study-analyzer/*` routes.
- [ ] Create UI components and hook them into existing sidebar layout.
- [ ] Backfill historical data (optional): derive initial productivity metrics from existing check-ins/ARK progress.
- [ ] Instrument PostHog and Sentry for the new flows.

This document should be kept in sync as we adjust requirements during implementation.

