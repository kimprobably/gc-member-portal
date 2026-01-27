-- Add video_url column to lms_action_items for Loom tutorial videos
ALTER TABLE lms_action_items ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Add a comment to describe the field
COMMENT ON COLUMN lms_action_items.video_url IS 'Optional Loom or video URL showing how to complete this action item';
