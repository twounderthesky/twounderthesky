-- Supabase Database Schema
-- Run this in your Supabase SQL Editor

-- Create likes table
CREATE TABLE IF NOT EXISTS likes (
    id BIGSERIAL PRIMARY KEY,
    post_slug TEXT NOT NULL,
    user_identifier TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_slug, user_identifier)
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
    id BIGSERIAL PRIMARY KEY,
    post_slug TEXT NOT NULL,
    name TEXT,
    comment TEXT NOT NULL,
    user_identifier TEXT NOT NULL,
    approved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create page_views table
CREATE TABLE IF NOT EXISTS page_views (
    id BIGSERIAL PRIMARY KEY,
    page_identifier TEXT NOT NULL,
    user_identifier TEXT NOT NULL,
    viewed_at TIMESTAMPTZ DEFAULT NOW(),
    referrer TEXT,
    user_agent TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_likes_post_slug ON likes(post_slug);
CREATE INDEX IF NOT EXISTS idx_comments_post_slug ON comments(post_slug);
CREATE INDEX IF NOT EXISTS idx_comments_approved ON comments(approved);
CREATE INDEX IF NOT EXISTS idx_page_views_page_identifier ON page_views(page_identifier);
CREATE INDEX IF NOT EXISTS idx_page_views_user_identifier ON page_views(user_identifier);
CREATE INDEX IF NOT EXISTS idx_page_views_viewed_at ON page_views(viewed_at);

-- Note: We're not creating a unique constraint for page_views because:
-- 1. PostgreSQL has issues with date functions in unique indexes
-- 2. The JavaScript already prevents duplicate views in the same session using sessionStorage
-- 3. We can track all views and count unique users in queries if needed

-- Enable Row Level Security (RLS)
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read on likes" ON likes FOR SELECT USING (true);
CREATE POLICY "Allow public insert on likes" ON likes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete on likes" ON likes FOR DELETE USING (true);

CREATE POLICY "Allow public read approved comments" ON comments FOR SELECT USING (approved = true);
CREATE POLICY "Allow public insert comments" ON comments FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read on page_views" ON page_views FOR SELECT USING (true);
CREATE POLICY "Allow public insert on page_views" ON page_views FOR INSERT WITH CHECK (true);

-- Optional: Create a view for like counts (for easier querying)
CREATE OR REPLACE VIEW like_counts AS
SELECT 
    post_slug,
    COUNT(*) as count
FROM likes
GROUP BY post_slug;

-- Optional: Create a view for view counts
CREATE OR REPLACE VIEW view_counts AS
SELECT 
    page_identifier,
    COUNT(DISTINCT user_identifier) as unique_views,
    COUNT(*) as total_views
FROM page_views
GROUP BY page_identifier;

