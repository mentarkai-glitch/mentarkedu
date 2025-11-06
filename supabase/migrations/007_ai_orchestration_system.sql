-- AI Orchestration System Migration
-- This migration adds tables for intelligent AI model selection, usage tracking, and orchestration

-- AI Usage Logs Table
CREATE TABLE ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model TEXT NOT NULL,
  task TEXT NOT NULL,
  tokens_used INTEGER NOT NULL,
  cost DECIMAL(10, 8) NOT NULL,
  duration INTEGER NOT NULL, -- milliseconds
  success BOOLEAN NOT NULL,
  quality_score DECIMAL(3, 2), -- 0.00 to 10.00
  used_fallback BOOLEAN DEFAULT false,
  original_model TEXT,
  user_id UUID REFERENCES users(id),
  complexity_score INTEGER, -- 0-10
  emotional_content_score INTEGER, -- 0-10
  selection_reason TEXT, -- Why this model was chosen
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Model Health Status Table
CREATE TABLE model_health_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('healthy', 'degraded', 'down')),
  uptime_percentage DECIMAL(5, 2) NOT NULL,
  avg_response_time INTEGER NOT NULL, -- milliseconds
  error_rate DECIMAL(5, 2) NOT NULL, -- percentage
  last_check TIMESTAMP DEFAULT NOW(),
  consecutive_failures INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Orchestration Decisions Table
CREATE TABLE orchestration_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  task TEXT NOT NULL,
  prompt TEXT NOT NULL,
  selected_model TEXT NOT NULL,
  alternative_models TEXT[], -- Array of other models considered
  selection_score DECIMAL(5, 2) NOT NULL, -- 0-100
  complexity_score INTEGER NOT NULL, -- 0-10
  emotional_content_score INTEGER NOT NULL, -- 0-10
  reasoning_required BOOLEAN DEFAULT false,
  creativity_required BOOLEAN DEFAULT false,
  empathy_required BOOLEAN DEFAULT false,
  max_cost DECIMAL(10, 8),
  max_latency INTEGER, -- milliseconds
  min_quality INTEGER, -- 0-100
  user_tier TEXT CHECK (user_tier IN ('free', 'premium', 'enterprise')),
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Model Capabilities Registry Table
CREATE TABLE model_capabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name TEXT UNIQUE NOT NULL,
  speed INTEGER NOT NULL, -- tokens per second
  quality_score INTEGER NOT NULL, -- 0-100
  context_window INTEGER NOT NULL, -- max tokens
  multimodal BOOLEAN DEFAULT false,
  cost_per_token DECIMAL(10, 8) NOT NULL,
  cost_per_request DECIMAL(10, 8) DEFAULT 0,
  strengths TEXT[], -- Array of task types this model excels at
  languages TEXT[], -- Supported languages
  features TEXT[], -- Array of features like 'reasoning', 'empathy', etc.
  uptime_percentage DECIMAL(5, 2) DEFAULT 99.0,
  avg_response_time INTEGER DEFAULT 1000, -- milliseconds
  error_rate DECIMAL(5, 2) DEFAULT 0.1, -- percentage
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Cost Analytics Table
CREATE TABLE cost_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  model TEXT NOT NULL,
  task TEXT NOT NULL,
  total_requests INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  total_cost DECIMAL(10, 8) DEFAULT 0,
  avg_cost_per_request DECIMAL(10, 8) DEFAULT 0,
  avg_tokens_per_request DECIMAL(10, 2) DEFAULT 0,
  success_rate DECIMAL(5, 2) DEFAULT 0, -- percentage
  avg_response_time INTEGER DEFAULT 0, -- milliseconds
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(date, model, task)
);

-- Performance Metrics Table
CREATE TABLE performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model TEXT NOT NULL,
  task TEXT,
  metric_type TEXT NOT NULL, -- 'response_time', 'quality', 'cost', 'success_rate'
  metric_value DECIMAL(10, 4) NOT NULL,
  sample_size INTEGER DEFAULT 1,
  time_window TEXT NOT NULL, -- 'hour', 'day', 'week', 'month'
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_ai_usage_logs_model_task ON ai_usage_logs(model, task);
CREATE INDEX idx_ai_usage_logs_timestamp ON ai_usage_logs(timestamp DESC);
CREATE INDEX idx_ai_usage_logs_user_id ON ai_usage_logs(user_id);
CREATE INDEX idx_ai_usage_logs_success ON ai_usage_logs(success);

CREATE INDEX idx_model_health_model ON model_health_status(model);
CREATE INDEX idx_model_health_status ON model_health_status(status);
CREATE INDEX idx_model_health_last_check ON model_health_status(last_check DESC);

CREATE INDEX idx_orchestration_decisions_user_id ON orchestration_decisions(user_id);
CREATE INDEX idx_orchestration_decisions_timestamp ON orchestration_decisions(timestamp DESC);
CREATE INDEX idx_orchestration_decisions_model ON orchestration_decisions(selected_model);

CREATE INDEX idx_cost_analytics_date ON cost_analytics(date DESC);
CREATE INDEX idx_cost_analytics_model ON cost_analytics(model);
CREATE INDEX idx_cost_analytics_task ON cost_analytics(task);

CREATE INDEX idx_performance_metrics_model ON performance_metrics(model);
CREATE INDEX idx_performance_metrics_timestamp ON performance_metrics(timestamp DESC);
CREATE INDEX idx_performance_metrics_type ON performance_metrics(metric_type);

-- Enable Row Level Security
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_health_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE orchestration_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_capabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow authenticated users to read their own usage logs
CREATE POLICY "Users can view their own AI usage logs" ON ai_usage_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Allow authenticated users to insert their own usage logs (or NULL for anonymous)
CREATE POLICY "Users can insert their own AI usage logs" ON ai_usage_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Allow authenticated users to read their own orchestration decisions
CREATE POLICY "Users can view their own orchestration decisions" ON orchestration_decisions
  FOR SELECT USING (auth.uid() = user_id);

-- Allow authenticated users to insert their own orchestration decisions
CREATE POLICY "Users can insert their own orchestration decisions" ON orchestration_decisions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow all authenticated users to read model capabilities and health status
CREATE POLICY "Authenticated users can read model capabilities" ON model_capabilities
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read model health status" ON model_health_status
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow all authenticated users to read cost analytics and performance metrics
CREATE POLICY "Authenticated users can read cost analytics" ON cost_analytics
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read performance metrics" ON performance_metrics
  FOR SELECT USING (auth.role() = 'authenticated');

-- Insert initial model capabilities data
INSERT INTO model_capabilities (model_name, speed, quality_score, context_window, multimodal, cost_per_token, strengths, languages, features, uptime_percentage, avg_response_time, error_rate) VALUES
('gpt-4o', 80, 90, 128000, true, 0.000005, ARRAY['roadmap', 'mentor_chat', 'resource_recommendation'], ARRAY['en'], ARRAY['reasoning', 'creativity'], 99.9, 1200, 0.1),
('o1-preview', 30, 98, 128000, false, 0.000015, ARRAY['prediction', 'insights', 'roadmap'], ARRAY['en'], ARRAY['reasoning', 'analysis'], 99.5, 5000, 0.5),
('claude-opus', 60, 95, 200000, true, 0.000015, ARRAY['emotion', 'mentor_chat', 'insights'], ARRAY['en'], ARRAY['empathy', 'reasoning', 'creativity'], 99.8, 1500, 0.2),
('gemini-pro', 90, 85, 2000000, true, 0.0000025, ARRAY['research', 'analysis'], ARRAY['en'], ARRAY['reasoning', 'analysis'], 99.7, 1000, 0.3),
('claude-sonnet', 70, 88, 200000, true, 0.000003, ARRAY['mentor_chat', 'emotion'], ARRAY['en'], ARRAY['empathy', 'reasoning'], 99.6, 1100, 0.2),
('gpt-4o-mini', 100, 80, 128000, true, 0.00000015, ARRAY['mentor_chat', 'resource_recommendation'], ARRAY['en'], ARRAY['reasoning', 'creativity'], 99.8, 800, 0.1),
('mistral-large', 75, 82, 32000, false, 0.000008, ARRAY['reasoning', 'analysis'], ARRAY['en', 'fr', 'de', 'es'], ARRAY['reasoning', 'analysis'], 99.5, 900, 0.3),
('llama-3.1', 65, 78, 128000, false, 0.000005, ARRAY['reasoning', 'analysis'], ARRAY['en'], ARRAY['reasoning', 'analysis'], 99.4, 1200, 0.4);

-- Insert initial model health status
INSERT INTO model_health_status (model, status, uptime_percentage, avg_response_time, error_rate) VALUES
('gpt-4o', 'healthy', 99.9, 1200, 0.1),
('o1-preview', 'healthy', 99.5, 5000, 0.5),
('claude-opus', 'healthy', 99.8, 1500, 0.2),
('gemini-pro', 'healthy', 99.7, 1000, 0.3),
('claude-sonnet', 'healthy', 99.6, 1100, 0.2),
('gpt-4o-mini', 'healthy', 99.8, 800, 0.1),
('mistral-large', 'healthy', 99.5, 900, 0.3),
('llama-3.1', 'healthy', 99.4, 1200, 0.4);

-- Create function to update model health status
CREATE OR REPLACE FUNCTION update_model_health_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the health status based on recent performance
  UPDATE model_health_status 
  SET 
    avg_response_time = (
      SELECT COALESCE(AVG(duration), avg_response_time)
      FROM ai_usage_logs 
      WHERE model = NEW.model 
      AND timestamp > NOW() - INTERVAL '1 hour'
    ),
    error_rate = (
      SELECT COALESCE(
        (COUNT(*) - COUNT(*) FILTER (WHERE success = true)) * 100.0 / COUNT(*), 
        error_rate
      )
      FROM ai_usage_logs 
      WHERE model = NEW.model 
      AND timestamp > NOW() - INTERVAL '1 hour'
    ),
    updated_at = NOW()
  WHERE model = NEW.model;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update health status when usage logs are inserted
CREATE TRIGGER trigger_update_model_health
  AFTER INSERT ON ai_usage_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_model_health_status();

-- Create function to update cost analytics
CREATE OR REPLACE FUNCTION update_cost_analytics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO cost_analytics (date, model, task, total_requests, total_tokens, total_cost, avg_cost_per_request, avg_tokens_per_request, success_rate, avg_response_time)
  VALUES (
    CURRENT_DATE,
    NEW.model,
    NEW.task,
    1,
    NEW.tokens_used,
    NEW.cost,
    NEW.cost,
    NEW.tokens_used,
    CASE WHEN NEW.success THEN 100.0 ELSE 0.0 END,
    NEW.duration
  )
  ON CONFLICT (date, model, task)
  DO UPDATE SET
    total_requests = cost_analytics.total_requests + 1,
    total_tokens = cost_analytics.total_tokens + NEW.tokens_used,
    total_cost = cost_analytics.total_cost + NEW.cost,
    avg_cost_per_request = (cost_analytics.total_cost + NEW.cost) / (cost_analytics.total_requests + 1),
    avg_tokens_per_request = (cost_analytics.total_tokens + NEW.tokens_used)::DECIMAL / (cost_analytics.total_requests + 1),
    success_rate = (
      CASE WHEN NEW.success THEN 
        (cost_analytics.success_rate * cost_analytics.total_requests + 100.0) / (cost_analytics.total_requests + 1)
      ELSE 
        (cost_analytics.success_rate * cost_analytics.total_requests) / (cost_analytics.total_requests + 1)
      END
    ),
    avg_response_time = (cost_analytics.avg_response_time * cost_analytics.total_requests + NEW.duration) / (cost_analytics.total_requests + 1),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update cost analytics when usage logs are inserted
CREATE TRIGGER trigger_update_cost_analytics
  AFTER INSERT ON ai_usage_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_cost_analytics();
