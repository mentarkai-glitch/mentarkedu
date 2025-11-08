// ==================== USER & AUTH TYPES ====================

export type UserRole = "admin" | "teacher" | "student";

export type PlanType = "neuro" | "quantum";

export interface Institute {
  id: string;
  name: string;
  plan_type: PlanType;
  logo_url?: string;
  settings: Record<string, any>;
  created_at: string;
}

export interface User {
  id: string;
  institute_id: string;
  role: UserRole;
  email: string;
  profile_data: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
    phone?: string;
  };
  created_at: string;
}

export interface Student {
  user_id: string;
  grade: string;
  batch: string;
  interests: string[];
  goals: string[];
  risk_score: number;
  onboarding_profile?: StudentProfile;
}

// ==================== ONBOARDING TYPES ====================

export type StudentLevel = "junior" | "middle" | "senior";

export type QuestionType = "single_choice" | "multiple_choice" | "slider";

export interface OnboardingQuestion {
  id: string;
  question: string;
  type: QuestionType;
  options?: string[];
  min?: number;
  max?: number;
  required: boolean;
  category: string;
}

export interface OnboardingAnswer {
  question_id: string;
  answer: string | number | string[];
}

export interface StudentProfile {
  level: StudentLevel;
  grade: string;
  school_type: string;
  location: string;
  board?: string;
  stream?: string;
  coaching?: boolean;
  career_clarity: string;
  motivation_level: number;
  stress_level: number;
  confidence_level: number;
  study_hours: string;
  learning_style: string;
  support_system: string;
  financial_comfort: string;
  digital_access: string;
  exam_prep?: string;
  biggest_challenges: string[];
  interests: string[];
  goals: string[];
  answers: OnboardingAnswer[];
  completed_at: string;
}

export interface Teacher {
  user_id: string;
  specialization: string[];
  assigned_batches: string[];
}

export interface Admin {
  user_id: string;
  permissions: string[];
}

// ==================== ARK SYSTEM TYPES ====================

export interface StudentARKData {
  // Step 1: Category Selection
  categoryId: string;
  
  // Step 2: Goal Statement
  goalStatement: string;
  
  // Step 3: Timeframe (academic calendar-based)
  timeframeId: string;
  timeframeDuration: string;
  timeframeDurationWeeks: number;
  
  // Step 4: Profile Refinement (from onboarding + editable)
  currentLevel: string; // beginner, intermediate, advanced
  weeklyHours: number;
  learningStyle: string;
  specificFocus?: string; // category-specific question answer
  
  // Step 5: Institute Context (optional template)
  useInstituteTemplate: boolean;
  instituteTemplateId?: string;
  batchAlignment?: string;
  
  // Step 6: Psychology Quick Check
  motivation: number; // 0-10
  stress: number; // 0-10
  confidence: number; // 0-10
  
  // Step 7: Commitment
  hoursPerWeek: number;
  reminders: boolean;
  accountabilityStyle: 'self' | 'peer' | 'teacher';
  
  // Pre-filled from onboarding profile
  onboardingProfile?: StudentProfile;
}

export interface InstituteARKTemplate {
  id: string;
  institute_id: string;
  category_id: string;
  title: string;
  description: string;
  target_batch: string;
  target_grade: string;
  milestones: any[];
  resources: any[];
  created_by: string;
  is_published: boolean;
  created_at: string;
}

// ==================== TEACHER & ADMIN TYPES ====================

export interface TeacherStudentAssignment {
  id: string;
  teacher_id: string;
  student_id: string;
  batch: string;
  subject?: string;
  assigned_at: string;
  is_active: boolean;
}

export interface Intervention {
  id: string;
  teacher_id: string;
  student_id: string;
  type: 'note' | 'meeting' | 'task' | 'alert' | 'praise';
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  due_date?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  resolution_notes?: string;
  metadata?: Record<string, any>;
}

export interface InstituteBilling {
  id: string;
  institute_id: string;
  plan_type: 'neuro' | 'quantum';
  student_count: number;
  amount_per_student: number;
  billing_cycle: 'monthly' | 'yearly';
  next_billing_date?: string;
  last_payment_date?: string;
  last_payment_amount?: number;
  status: 'active' | 'trial' | 'suspended' | 'cancelled';
  trial_ends_at?: string;
  discount_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface PaymentHistory {
  id: string;
  institute_id: string;
  billing_id?: string;
  amount: number;
  student_count: number;
  plan_type: string;
  payment_method?: string;
  transaction_id?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paid_at?: string;
  created_at: string;
  invoice_url?: string;
  metadata?: Record<string, any>;
}

export interface BatchAnalytics {
  id: string;
  institute_id: string;
  batch: string;
  teacher_id?: string;
  student_count: number;
  active_arks_count: number;
  completed_arks_count: number;
  avg_completion_rate: number;
  avg_motivation: number;
  avg_stress: number;
  avg_confidence: number;
  high_risk_count: number;
  medium_risk_count: number;
  low_risk_count: number;
  last_updated: string;
}

export interface TeacherNote {
  id: string;
  teacher_id: string;
  student_id: string;
  content: string;
  tags: string[];
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

// ==================== ML RISK & SENTIMENT TYPES ====================

export interface BehavioralPattern {
  id: string;
  student_id: string;
  pattern_date: string;
  daily_checkin_completed: boolean;
  chat_message_count: number;
  ark_progress_delta: number;
  avg_energy_level: number;
  avg_emotion_score: number;
  avg_progress_rating: number;
  engagement_score: number;
  wellbeing_score: number;
  performance_score: number;
  missed_checkin_streak: number;
  declining_progress_days: number;
  high_stress_days: number;
  xp_earned?: number;
  milestone_completed_count?: number;
  intervention_count?: number;
}

export interface RiskPrediction {
  id: string;
  student_id: string;
  prediction_date: string;
  dropout_risk_score: number;
  burnout_risk_score: number;
  disengagement_risk_score: number;
  risk_level: 'critical' | 'high' | 'medium' | 'low';
  primary_risk_factors: string[];
  protective_factors: string[];
  recommended_interventions: any[];
  early_warning_flags: string[];
  model_version: string;
  model_source?: string;
  confidence_score: number;
  metadata?: Record<string, any>;
}

export interface RiskAlert {
  id: string;
  student_id: string;
  teacher_id?: string;
  alert_type: 'dropout_risk' | 'burnout_risk' | 'disengagement_risk' | 'sudden_change';
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  risk_score: number;
  recommended_actions: any[];
  status: 'new' | 'acknowledged' | 'addressed' | 'resolved' | 'false_alarm';
  created_at: string;
}

export interface SentimentRecord {
  id: string;
  student_id: string;
  record_date: string;
  overall_sentiment: number; // -1 to 1
  emotional_valence: number;
  arousal_level: number;
  avg_energy_level?: number; // Optional: 0-10 scale
  joy: number;
  sadness: number;
  anger: number;
  fear: number;
  surprise: number;
  trust: number;
  sentiment_change_from_previous: number;
  sentiment_7day_avg: number;
  sentiment_30day_avg: number;
  ai_model_used: string;
  confidence_score: number;
}

export interface StudentEvent {
  id: string;
  student_id: string;
  event_type: string;
  event_title: string;
  event_description?: string;
  event_date: string;
  sentiment_before?: number;
  sentiment_after?: number;
  sentiment_impact?: number;
  is_positive_event: boolean;
  is_milestone: boolean;
  metadata?: Record<string, any>;
}

export interface EventSentimentCorrelation {
  id: string;
  student_id: string;
  event_type: string;
  correlation_strength: number; // -1 to 1
  avg_sentiment_impact: number;
  occurrence_count: number;
  typical_delay_hours: number;
  consistency_score: number;
}

// ==================== PHASE 7 SIDEBAR TYPES ====================

export type AgendaEnergyTarget = "low" | "medium" | "high";
export type AgendaStatus = "planned" | "in_progress" | "completed" | "skipped";
export type AgendaSource = "manual" | "ai" | "mentor";

export interface DailyAgendaItem {
  id: string;
  student_id: string;
  title: string;
  description?: string;
  category?: string;
  start_at?: string;
  end_at?: string;
  energy_target?: AgendaEnergyTarget;
  priority: number;
  status: AgendaStatus;
  source: AgendaSource;
  created_at: string;
  updated_at: string;
}

export type TaskDependencyType = "blocking" | "supporting";

export interface DailyTaskDependency {
  id: string;
  agenda_item_id: string;
  depends_on_item_id: string;
  dependency_type: TaskDependencyType;
  created_at: string;
}

export type EnergySnapshotSource = "checkin" | "sensor" | "manual";

export interface EnergySnapshot {
  id: string;
  student_id: string;
  captured_at: string;
  energy_score: number;
  focus_score?: number;
  notes?: string;
  source: EnergySnapshotSource;
}

export interface ProductivityMetric {
  id: string;
  student_id: string;
  metric_date: string;
  planned_minutes: number;
  actual_minutes: number;
  deep_work_minutes: number;
  context_switches: number;
  ai_suggestions_accepted: number;
  ai_suggestions_rejected: number;
  created_at: string;
}

export type StudySessionType = "solo" | "group" | "mentor";

export interface StudySession {
  id: string;
  student_id: string;
  ark_id?: string;
  session_type: StudySessionType;
  material_type?: string;
  started_at: string;
  ended_at?: string;
  notes?: string;
  tags?: string[];
  created_at: string;
}

export interface StudyPerformanceSnapshot {
  id: string;
  student_id: string;
  session_id?: string;
  snapshot_date: string;
  engagement_score?: number;
  retention_score?: number;
  completion_rate?: number;
  difficulty_rating?: number;
  ml_confidence?: number;
  created_at: string;
}

export interface LearningPathNode {
  id: string;
  student_id: string;
  topic_id: string;
  topic_name?: string;
  mastery_level: number;
  last_assessed_at?: string;
  recommended_next?: any;
  created_at: string;
}

export interface StudyPathProgressEntry {
  topicId: string;
  topicName?: string;
  masteryLevel: number;
  lastAssessedAt?: string;
  recommendedNext?: any;
}

export type RecommendationAction = "accepted" | "snoozed" | "dismissed" | "ignored";

export interface ContentRecommendation {
  id: string;
  student_id: string;
  resource_id?: string;
  resource_type?: string;
  source?: string;
  score?: number;
  presented_at: string;
  action?: RecommendationAction;
  feedback_notes?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export type SpacedRepetitionOrigin = "study_session" | "practice_questions" | "manual";

export interface SpacedRepetitionQueueItem {
  id: string;
  student_id: string;
  card_identifier: string;
  origin: SpacedRepetitionOrigin;
  due_at: string;
  interval_days: number;
  ease_factor: number;
  success_streak: number;
  last_reviewed_at?: string;
  created_at: string;
}

export interface SentimentAnomaly {
  id: string;
  student_id: string;
  anomaly_date: string;
  sentiment_score: number;
  expected_score: number;
  deviation: number;
  anomaly_type: 'sudden_drop' | 'sudden_spike' | 'unusual_pattern';
  severity: 'minor' | 'moderate' | 'severe';
  potential_triggers: string[];
  correlated_events: any[];
  status: 'new' | 'investigating' | 'explained' | 'resolved';
}

export type ARKCategory =
  | "academic"
  | "personal"
  | "career"
  | "emotional"
  | "health";

export type ARKDuration = "short" | "mid" | "long";

export type ARKStatus = "active" | "completed" | "paused" | "archived";

export interface ARK {
  id: string;
  student_id: string;
  title: string;
  category: ARKCategory;
  duration: ARKDuration;
  status: ARKStatus;
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface ARKMilestone {
  id: string;
  ark_id: string;
  title: string;
  description: string;
  order: number;
  completed: boolean;
  completed_at?: string;
  // Enhanced fields
  order_index: number;
  target_date?: string;
  actual_start_date?: string;
  actual_completion_date?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'blocked';
  progress_percentage: number;
  difficulty: 'easy' | 'medium' | 'hard';
  required_hours?: number;
  completed_hours: number;
  skills_to_gain: string[];
  prerequisite_milestones: string[];
  checkpoint_questions: string[];
  celebration_message?: string;
  notes?: string;
  estimated_duration?: string;
  metadata?: Record<string, any>;
}

export type ResourceType =
  | "video"
  | "article"
  | "course"
  | "book"
  | "podcast"
  | "tool"
  | "website"
  | "platform"
  | "app";

export interface ARKResource {
  id: string;
  ark_id: string;
  type: ResourceType;
  title: string;
  url: string;
  thumbnail_url?: string;
  provider?: string;
  author?: string;
  duration_minutes?: number;
  is_free: boolean;
  is_verified: boolean;
  quality_score: number;
  student_rating?: number;
  completion_rate?: number;
  tags: string[];
  prerequisites?: string[];
  learning_outcomes?: string[];
  access_count?: number;
  bookmark_count?: number;
  metadata: {
    source?: string;
    duration?: string;
    description?: string;
  };
}

export interface ARKTimelineEntry {
  id: string;
  ark_id: string;
  milestone_id?: string;
  task_date: string;
  task_title: string;
  task_description?: string;
  task_type: 'learning' | 'practice' | 'assessment' | 'review' | 'rest' | 'checkpoint' | 'celebration';
  is_completed: boolean;
  completed_at?: string;
  estimated_hours: number;
  actual_hours?: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  auto_generated: boolean;
  created_at: string;
}

export interface MilestoneResourceLink {
  id: string;
  milestone_id: string;
  resource_id: string;
  is_required: boolean;
  order_index: number;
  recommended_completion_days?: number;
  assigned_at: string;
}

export interface GlobalResource {
  id: string;
  title: string;
  description?: string;
  type: ResourceType;
  url: string;
  thumbnail_url?: string;
  provider: string;
  author?: string;
  duration_minutes?: number;
  is_free: boolean;
  cost_amount: number;
  cost_currency: string;
  quality_score: number;
  verification_status: 'unverified' | 'pending' | 'verified' | 'rejected' | 'deprecated';
  verified_by?: string;
  verified_at?: string;
  last_verified?: string;
  tags: string[];
  categories: string[];
  subject_area: string[];
  grade_level: string[];
  prerequisite_knowledge: string[];
  learning_outcomes: string[];
  metadata?: Record<string, any>;
  access_count: number;
  rating_count: number;
  average_rating: number;
  created_at: string;
  updated_at: string;
}

export interface EducationalPartner {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  logo_url?: string;
  api_endpoint?: string;
  resource_count: number;
  quality_rating: number;
  is_active: boolean;
  integration_status: 'manual' | 'api' | 'scraping' | 'none';
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// ==================== AI INTERACTION TYPES ====================

export type MentorPersona =
  | "friendly"
  | "strict"
  | "calm"
  | "logical"
  | "spiritual";

export interface ChatSession {
  id: string;
  user_id: string;
  mentor_persona: MentorPersona;
  context_summary: string;
  created_at: string;
  updated_at: string;
}

export type MessageRole = "user" | "assistant" | "system";

export interface Message {
  id: string;
  session_id: string;
  role: MessageRole;
  content: string;
  emotion_score?: number;
  timestamp: string;
}

export interface DailyCheckIn {
  id: string;
  student_id: string;
  energy: number; // 1-5
  focus: number; // 1-5
  emotion: string;
  notes?: string;
  date: string;
}

// ==================== GAMIFICATION TYPES ====================

export interface StudentStats {
  user_id: string;
  xp: number;
  level: number;
  streak_days: number;
  coins: number;
  badges: string[];
}

export type AchievementType =
  | "streak"
  | "ark_completion"
  | "daily_checkin"
  | "chat_engagement"
  | "milestone";

export interface Achievement {
  id: string;
  type: AchievementType;
  title: string;
  description: string;
  criteria: Record<string, any>;
  icon_url: string;
}

export interface UserAchievement {
  user_id: string;
  achievement_id: string;
  earned_at: string;
}

// ==================== ANALYTICS TYPES ====================

export interface EmotionTimeline {
  id: string;
  student_id: string;
  date: string;
  sentiment_score: number; // -1 to 1
  context?: string;
}

export interface DropoutPrediction {
  student_id: string;
  risk_score: number; // 0-100
  factors: string[];
  predicted_date?: string;
  created_at: string;
}

export interface CareerDNA {
  student_id: string;
  clusters: string[];
  strengths: string[];
  recommendations: string[];
  updated_at: string;
}

export interface PeerMatch {
  student_id: string;
  matched_student_id: string;
  compatibility_score: number;
  reason: string;
}

export interface BatchHealth {
  id: string;
  institute_id: string;
  batch_id: string;
  metrics: {
    average_motivation: number;
    burnout_risk: number;
    engagement_rate: number;
    ark_completion_rate: number;
  };
  timestamp: string;
}

export interface TeacherEffectiveness {
  teacher_id: string;
  metrics: {
    student_engagement: number;
    response_time: number;
    insight_quality: number;
  };
  period: string;
  insights: string[];
}

// ==================== NOTIFICATION TYPES ====================

export type NotificationType =
  | "ark_reminder"
  | "daily_checkin"
  | "ark_milestone"
  | "teacher_message"
  | "achievement"
  | "parent_report"
  | "system";

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  content: string;
  read: boolean;
  sent_at: string;
}

export type ReportDeliveryMethod = "email" | "whatsapp" | "both";

export interface ParentReport {
  id: string;
  student_id: string;
  period: string;
  content: string;
  sent_via: ReportDeliveryMethod;
  sent_at: string;
}

// ==================== CERTIFICATE TYPES ====================

export interface Certificate {
  id: string;
  student_id: string;
  ark_id: string;
  hash: string;
  metadata: Record<string, any>;
  issued_at: string;
  blockchain_tx?: string; // For future NFT integration
}

// ==================== AI ORCHESTRATION TYPES ====================

export type AITask =
  | "roadmap"
  | "emotion"
  | "insights"
  | "research"
  | "prediction"
  | "resource_recommendation"
  | "mentor_chat";

export type AIModel = 
  | "gpt-4o" 
  | "gpt-4o-mini"
  | "o1-preview"
  | "o1-mini"
  | "claude-opus" 
  | "claude-sonnet"
  | "gemini-pro"
  | "gemini-2.5-flash"
  | "perplexity-pro"
  | "cohere-command-r-plus"
  | "cohere-command-r"
  | "mistral-large"
  | "hume-emotional-analysis"
  | "llama-3.1"
  | "deepl-translation";

export interface AIContext {
  task: AITask;
  user_id?: string;
  session_id?: string;
  history?: Message[];
  metadata?: Record<string, any>;
}

export interface AIResponse {
  content: string;
  model: AIModel;
  tokens_used?: number;
  emotion_score?: number;
  confidence?: number;
  cached?: boolean;
}

// ==================== API RESPONSE TYPES ====================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    has_more: boolean;
  };
}

