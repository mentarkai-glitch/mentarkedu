-- ==================== ENHANCED ARK SYSTEM ====================
-- Migration: 012_enhanced_ark_system.sql
-- Purpose: Add missing fields for complete ARK functionality
-- Note: Tables milestone_resources and ark_timeline already exist from previous migrations

-- Add provider to ark_resources if missing
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ark_resources' AND column_name='provider') THEN
    ALTER TABLE ark_resources ADD COLUMN provider TEXT;
  END IF;
END $$;

-- Add exam_date and start_date to arks
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='arks' AND column_name='exam_date') THEN
    ALTER TABLE arks ADD COLUMN exam_date DATE;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='arks' AND column_name='start_date') THEN
    ALTER TABLE arks ADD COLUMN start_date DATE DEFAULT CURRENT_DATE;
  END IF;
END $$;

-- Add updated_at trigger for ark_milestones
CREATE OR REPLACE FUNCTION update_ark_milestones_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_ark_milestones_updated_at ON ark_milestones;
CREATE TRIGGER trigger_update_ark_milestones_updated_at
  BEFORE UPDATE ON ark_milestones
  FOR EACH ROW
  EXECUTE FUNCTION update_ark_milestones_updated_at();

-- Add comments for documentation
COMMENT ON TABLE milestone_resources IS 'Junction table linking milestones to their resources';
COMMENT ON TABLE ark_timeline IS 'Daily timeline of tasks for ARKs with scheduling and completion tracking';
COMMENT ON COLUMN ark_milestones.metadata IS 'JSONB storing tasks, weekly_schedule, and other milestone data';
COMMENT ON COLUMN ark_resources.provider IS 'Provider/platform of the resource (Khan Academy, YouTube, etc.)';

