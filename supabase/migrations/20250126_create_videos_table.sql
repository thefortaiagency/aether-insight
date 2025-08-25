-- Create videos table for storing video metadata
CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cloudflare_id text UNIQUE NOT NULL,
  title text NOT NULL,
  url text,
  thumbnail_url text,
  duration integer DEFAULT 0, -- in seconds
  size bigint DEFAULT 0, -- in bytes
  match_id uuid REFERENCES matches(id) ON DELETE SET NULL,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add video fields to matches table if they don't exist
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS video_id text,
ADD COLUMN IF NOT EXISTS video_url text;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_videos_match_id ON videos(match_id);
CREATE INDEX IF NOT EXISTS idx_videos_uploaded_by ON videos(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_matches_video_id ON matches(video_id);

-- Enable Row Level Security
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for videos table
-- Allow authenticated users to view all videos
CREATE POLICY "Videos are viewable by authenticated users" 
  ON videos FOR SELECT 
  TO authenticated 
  USING (true);

-- Allow users to insert their own videos
CREATE POLICY "Users can insert their own videos" 
  ON videos FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = uploaded_by);

-- Allow users to update their own videos
CREATE POLICY "Users can update their own videos" 
  ON videos FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = uploaded_by);

-- Allow users to delete their own videos  
CREATE POLICY "Users can delete their own videos" 
  ON videos FOR DELETE 
  TO authenticated 
  USING (auth.uid() = uploaded_by);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();