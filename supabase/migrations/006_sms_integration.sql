-- SMS Integration Migration
-- Add SMS functionality to Mentark Quantum

-- Add phone number and SMS settings to students table
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS sms_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sms_opt_in_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS sms_opt_out_date TIMESTAMP;

-- Add phone number to parents table
ALTER TABLE parents 
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS sms_enabled BOOLEAN DEFAULT false;

-- Add phone number to teachers table
ALTER TABLE teachers 
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS sms_enabled BOOLEAN DEFAULT false;

-- SMS Conversations table
CREATE TABLE IF NOT EXISTS sms_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    phone_number TEXT NOT NULL,
    twilio_sid TEXT UNIQUE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'ended')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Ensure one active conversation per student per phone number
    UNIQUE(student_id, phone_number, status) DEFERRABLE INITIALLY DEFERRED
);

-- SMS Messages table
CREATE TABLE IF NOT EXISTS sms_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES sms_conversations(id) ON DELETE CASCADE,
    direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    message TEXT NOT NULL,
    twilio_sid TEXT UNIQUE,
    status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'failed', 'received')),
    error_code TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Index for efficient querying
    INDEX idx_sms_messages_conversation_id ON sms_messages(conversation_id),
    INDEX idx_sms_messages_created_at ON sms_messages(created_at),
    INDEX idx_sms_messages_twilio_sid ON sms_messages(twilio_sid)
);

-- SMS Templates table for automated messages
CREATE TABLE IF NOT EXISTS sms_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institute_id UUID REFERENCES institutes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    template TEXT NOT NULL,
    message_type TEXT NOT NULL CHECK (message_type IN ('checkin', 'reminder', 'alert', 'motivation', 'announcement')),
    variables TEXT[], -- Array of variable names like ['{name}', '{date}']
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES teachers(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- SMS Campaigns table for bulk messaging
CREATE TABLE IF NOT EXISTS sms_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institute_id UUID REFERENCES institutes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    template_id UUID REFERENCES sms_templates(id),
    target_students UUID[] DEFAULT '{}', -- Array of student IDs
    target_criteria JSONB, -- Criteria for targeting students
    scheduled_at TIMESTAMP,
    sent_at TIMESTAMP,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
    total_recipients INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES teachers(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- SMS Delivery Log table for tracking delivery status
CREATE TABLE IF NOT EXISTS sms_delivery_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES sms_campaigns(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    phone_number TEXT NOT NULL,
    message_sid TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('sent', 'delivered', 'failed', 'undelivered')),
    error_code TEXT,
    delivered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE sms_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_delivery_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for SMS Conversations
CREATE POLICY "Students can view own SMS conversations" ON sms_conversations
    FOR SELECT USING (
        student_id IN (
            SELECT id FROM students WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Teachers can view student SMS conversations" ON sms_conversations
    FOR SELECT USING (
        student_id IN (
            SELECT s.id FROM students s
            JOIN teacher_student_assignments tsa ON s.id = tsa.student_id
            WHERE tsa.teacher_id IN (
                SELECT id FROM teachers WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Admins can view all SMS conversations" ON sms_conversations
    FOR ALL USING (
        student_id IN (
            SELECT s.id FROM students s
            JOIN institutes i ON s.institute_id = i.id
            WHERE i.admin_id IN (
                SELECT id FROM admins WHERE user_id = auth.uid()
            )
        )
    );

-- RLS Policies for SMS Messages
CREATE POLICY "Students can view own SMS messages" ON sms_messages
    FOR SELECT USING (
        conversation_id IN (
            SELECT id FROM sms_conversations WHERE student_id IN (
                SELECT id FROM students WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Teachers can view student SMS messages" ON sms_messages
    FOR SELECT USING (
        conversation_id IN (
            SELECT sc.id FROM sms_conversations sc
            JOIN students s ON sc.student_id = s.id
            JOIN teacher_student_assignments tsa ON s.id = tsa.student_id
            WHERE tsa.teacher_id IN (
                SELECT id FROM teachers WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Admins can view all SMS messages" ON sms_messages
    FOR ALL USING (
        conversation_id IN (
            SELECT sc.id FROM sms_conversations sc
            JOIN students s ON sc.student_id = s.id
            JOIN institutes i ON s.institute_id = i.id
            WHERE i.admin_id IN (
                SELECT id FROM admins WHERE user_id = auth.uid()
            )
        )
    );

-- RLS Policies for SMS Templates
CREATE POLICY "Teachers can manage SMS templates" ON sms_templates
    FOR ALL USING (
        institute_id IN (
            SELECT t.institute_id FROM teachers t
            WHERE t.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all SMS templates" ON sms_templates
    FOR ALL USING (
        institute_id IN (
            SELECT id FROM institutes WHERE admin_id IN (
                SELECT id FROM admins WHERE user_id = auth.uid()
            )
        )
    );

-- RLS Policies for SMS Campaigns
CREATE POLICY "Teachers can manage SMS campaigns" ON sms_campaigns
    FOR ALL USING (
        institute_id IN (
            SELECT t.institute_id FROM teachers t
            WHERE t.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all SMS campaigns" ON sms_campaigns
    FOR ALL USING (
        institute_id IN (
            SELECT id FROM institutes WHERE admin_id IN (
                SELECT id FROM admins WHERE user_id = auth.uid()
            )
        )
    );

-- RLS Policies for SMS Delivery Log
CREATE POLICY "Teachers can view SMS delivery log" ON sms_delivery_log
    FOR SELECT USING (
        campaign_id IN (
            SELECT id FROM sms_campaigns WHERE institute_id IN (
                SELECT t.institute_id FROM teachers t
                WHERE t.user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Admins can view all SMS delivery log" ON sms_delivery_log
    FOR SELECT USING (
        campaign_id IN (
            SELECT id FROM sms_campaigns WHERE institute_id IN (
                SELECT id FROM institutes WHERE admin_id IN (
                    SELECT id FROM admins WHERE user_id = auth.uid()
                )
            )
        )
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_phone_number ON students(phone_number);
CREATE INDEX IF NOT EXISTS idx_students_sms_enabled ON students(sms_enabled);
CREATE INDEX IF NOT EXISTS idx_sms_conversations_student_id ON sms_conversations(student_id);
CREATE INDEX IF NOT EXISTS idx_sms_conversations_phone_number ON sms_conversations(phone_number);
CREATE INDEX IF NOT EXISTS idx_sms_conversations_status ON sms_conversations(status);
CREATE INDEX IF NOT EXISTS idx_sms_messages_conversation_id ON sms_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_sms_messages_created_at ON sms_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_sms_templates_institute_id ON sms_templates(institute_id);
CREATE INDEX IF NOT EXISTS idx_sms_templates_message_type ON sms_templates(message_type);
CREATE INDEX IF NOT EXISTS idx_sms_campaigns_institute_id ON sms_campaigns(institute_id);
CREATE INDEX IF NOT EXISTS idx_sms_campaigns_status ON sms_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_sms_delivery_log_campaign_id ON sms_delivery_log(campaign_id);
CREATE INDEX IF NOT EXISTS idx_sms_delivery_log_student_id ON sms_delivery_log(student_id);

-- Create functions for SMS management
CREATE OR REPLACE FUNCTION update_sms_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update timestamp on SMS conversations
CREATE TRIGGER update_sms_conversations_timestamp
    BEFORE UPDATE ON sms_conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_sms_conversation_timestamp();

-- Function to get SMS conversation stats
CREATE OR REPLACE FUNCTION get_sms_conversation_stats(student_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_conversations', COUNT(DISTINCT sc.id),
        'total_messages', COUNT(sm.id),
        'last_message_at', MAX(sm.created_at),
        'active_conversations', COUNT(DISTINCT CASE WHEN sc.status = 'active' THEN sc.id END)
    ) INTO result
    FROM sms_conversations sc
    LEFT JOIN sms_messages sm ON sc.id = sm.conversation_id
    WHERE sc.student_id = student_uuid;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Insert default SMS templates
INSERT INTO sms_templates (institute_id, name, template, message_type, variables, is_active) VALUES
-- Daily check-in template
(NULL, 'Daily Check-in', 'Hi {name}! 👋 How are you feeling today? Reply with a number 1-5 (1=very sad, 5=very happy) 📊', 'checkin', ARRAY['{name}'], true),

-- Study reminder template
(NULL, 'Study Reminder', 'Hey {name}! 📚 Time for your {subject} practice. You''ve got this! 💪', 'reminder', ARRAY['{name}', '{subject}'], true),

-- Motivational template
(NULL, 'Motivational Message', '🌟 {name}, remember: Every expert was once a beginner. Keep pushing forward! You''re doing amazing! 🚀', 'motivation', ARRAY['{name}'], true),

-- Achievement template
(NULL, 'Achievement Alert', '🎉 Congratulations {name}! You just earned the "{achievement}" badge! Keep up the great work! ⭐', 'announcement', ARRAY['{name}', '{achievement}'], true),

-- Parent notification template
(NULL, 'Parent Progress Update', '📊 Weekly Update for {student_name}: Mood avg: {avg_mood}/5, Check-ins: {checkin_count} days. Keep encouraging them! 👨‍👩‍👧‍👦', 'announcement', ARRAY['{student_name}', '{avg_mood}', '{checkin_count}'], true);

-- Add some sample data for testing (optional)
-- This will create sample SMS conversations for existing students
-- Uncomment if you want to test with sample data
/*
INSERT INTO sms_conversations (student_id, phone_number, status)
SELECT 
    id,
    '+1234567890', -- Replace with actual test phone number
    'active'
FROM students 
WHERE phone_number IS NOT NULL
LIMIT 5;
*/

