-- Add call_booked_video_url column to blueprint_settings
ALTER TABLE blueprint_settings ADD COLUMN IF NOT EXISTS call_booked_video_url text;
