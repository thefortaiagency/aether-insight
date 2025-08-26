-- Fix matches that have video_url but no video_id
-- Extract the video ID from the URL and update the video_id field

-- First, let's see what we have
SELECT 
  id,
  wrestler_name,
  opponent_name,
  video_url,
  video_id,
  has_video
FROM matches
WHERE video_url IS NOT NULL
  AND (video_id IS NULL OR video_id = '');

-- Update matches to extract video ID from URL
UPDATE matches
SET video_id = 
  CASE 
    -- Extract from URLs like: https://videodelivery.net/VIDEO_ID/manifest/video.m3u8
    WHEN video_url LIKE '%videodelivery.net/%' THEN
      SUBSTRING(video_url FROM 'videodelivery\.net/([a-f0-9]{32})/')
    -- Extract from URLs like: https://customer-xxx.cloudflarestream.com/VIDEO_ID/manifest/video.m3u8
    WHEN video_url LIKE '%cloudflarestream.com/%' THEN
      SUBSTRING(video_url FROM 'cloudflarestream\.com/([a-f0-9]{32})/')
    ELSE NULL
  END
WHERE video_url IS NOT NULL
  AND (video_id IS NULL OR video_id = '');

-- Also add cloudflare_video_id column if it doesn't exist
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS cloudflare_video_id TEXT;

-- Copy video_id to cloudflare_video_id for consistency
UPDATE matches
SET cloudflare_video_id = video_id
WHERE video_id IS NOT NULL 
  AND cloudflare_video_id IS NULL;