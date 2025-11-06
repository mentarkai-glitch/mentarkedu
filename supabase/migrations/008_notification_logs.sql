-- Create notification_logs table for tracking push notifications
CREATE TABLE notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  type TEXT NOT NULL, -- 'daily_checkin_reminder', 'milestone_achieved', 'intervention_alert', etc.
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'sent', -- 'sent', 'failed', 'pending'
  metadata JSONB, -- Additional data like ark_id, milestone_title, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_fcm_tokens table for storing FCM tokens
CREATE TABLE user_fcm_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  token TEXT NOT NULL UNIQUE,
  device_type TEXT, -- 'web', 'android', 'ios'
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notification_topics table for topic subscriptions
CREATE TABLE notification_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  topic TEXT NOT NULL, -- 'daily_reminders', 'ark_updates', 'interventions', etc.
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, topic)
);

-- Add RLS policies
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to view their own notification logs" ON notification_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow service role to insert notification logs" ON notification_logs FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Allow service role to update notification logs" ON notification_logs FOR UPDATE USING (auth.role() = 'service_role');

ALTER TABLE user_fcm_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to manage their own FCM tokens" ON user_fcm_tokens FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Allow service role to manage all FCM tokens" ON user_fcm_tokens FOR ALL USING (auth.role() = 'service_role');

ALTER TABLE notification_topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to manage their own topic subscriptions" ON notification_topics FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Allow service role to manage all topic subscriptions" ON notification_topics FOR ALL USING (auth.role() = 'service_role');

-- Create indexes for better performance
CREATE INDEX idx_notification_logs_user_id ON notification_logs(user_id);
CREATE INDEX idx_notification_logs_type ON notification_logs(type);
CREATE INDEX idx_notification_logs_sent_at ON notification_logs(sent_at);
CREATE INDEX idx_user_fcm_tokens_user_id ON user_fcm_tokens(user_id);
CREATE INDEX idx_user_fcm_tokens_active ON user_fcm_tokens(is_active);
CREATE INDEX idx_notification_topics_user_id ON notification_topics(user_id);
CREATE INDEX idx_notification_topics_topic ON notification_topics(topic);

-- Create function to clean up old notification logs
CREATE OR REPLACE FUNCTION cleanup_old_notification_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM notification_logs 
  WHERE sent_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Create function to deactivate old FCM tokens
CREATE OR REPLACE FUNCTION deactivate_old_fcm_tokens()
RETURNS void AS $$
BEGIN
  UPDATE user_fcm_tokens 
  SET is_active = FALSE 
  WHERE updated_at < NOW() - INTERVAL '90 days' AND is_active = TRUE;
END;
$$ LANGUAGE plpgsql;


