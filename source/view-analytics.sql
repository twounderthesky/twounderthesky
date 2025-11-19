-- View Analytics Queries
-- Run these in Supabase SQL Editor to see your private view statistics

-- ============================================
-- 1. Total Views Per Page/Post
-- ============================================
SELECT 
    page_identifier,
    COUNT(*) as total_views,
    COUNT(DISTINCT user_identifier) as unique_visitors
FROM page_views
GROUP BY page_identifier
ORDER BY total_views DESC;

-- ============================================
-- 2. Views Per Post (Last 30 Days)
-- ============================================
SELECT 
    page_identifier,
    COUNT(*) as views_last_30_days,
    COUNT(DISTINCT user_identifier) as unique_visitors_30_days
FROM page_views
WHERE viewed_at >= NOW() - INTERVAL '30 days'
GROUP BY page_identifier
ORDER BY views_last_30_days DESC;

-- ============================================
-- 3. Daily View Statistics
-- ============================================
SELECT 
    DATE(viewed_at) as view_date,
    COUNT(*) as total_views,
    COUNT(DISTINCT user_identifier) as unique_visitors,
    COUNT(DISTINCT page_identifier) as pages_viewed
FROM page_views
GROUP BY DATE(viewed_at)
ORDER BY view_date DESC
LIMIT 30;

-- ============================================
-- 4. Most Popular Posts (All Time)
-- ============================================
SELECT 
    page_identifier,
    COUNT(*) as total_views,
    COUNT(DISTINCT user_identifier) as unique_visitors,
    MIN(viewed_at) as first_view,
    MAX(viewed_at) as last_view
FROM page_views
GROUP BY page_identifier
ORDER BY total_views DESC
LIMIT 20;

-- ============================================
-- 5. Views by Referrer (Top Sources)
-- ============================================
SELECT 
    CASE 
        WHEN referrer IS NULL OR referrer = '' THEN 'Direct'
        WHEN referrer LIKE '%google%' THEN 'Google'
        WHEN referrer LIKE '%facebook%' THEN 'Facebook'
        WHEN referrer LIKE '%twitter%' OR referrer LIKE '%x.com%' THEN 'Twitter/X'
        WHEN referrer LIKE '%linkedin%' THEN 'LinkedIn'
        WHEN referrer LIKE '%github%' THEN 'GitHub'
        ELSE 'Other'
    END as referrer_source,
    COUNT(*) as views
FROM page_views
GROUP BY referrer_source
ORDER BY views DESC;

-- ============================================
-- 6. Hourly View Distribution (Last 7 Days)
-- ============================================
SELECT 
    EXTRACT(HOUR FROM viewed_at) as hour_of_day,
    COUNT(*) as views
FROM page_views
WHERE viewed_at >= NOW() - INTERVAL '7 days'
GROUP BY EXTRACT(HOUR FROM viewed_at)
ORDER BY hour_of_day;

-- ============================================
-- 7. Views by Page with Like Counts
-- ============================================
SELECT 
    pv.page_identifier,
    COUNT(DISTINCT pv.user_identifier) as unique_views,
    COUNT(pv.id) as total_views,
    COALESCE(like_counts.like_count, 0) as likes
FROM page_views pv
LEFT JOIN (
    SELECT post_slug, COUNT(*) as like_count
    FROM likes
    GROUP BY post_slug
) like_counts ON pv.page_identifier = like_counts.post_slug
GROUP BY pv.page_identifier, like_counts.like_count
ORDER BY total_views DESC;

-- ============================================
-- 8. Recent Views (Last 50)
-- ============================================
SELECT 
    page_identifier,
    viewed_at,
    referrer,
    user_identifier
FROM page_views
ORDER BY viewed_at DESC
LIMIT 50;

