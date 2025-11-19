/**
 * Page View Tracking
 * Tracks page views and displays view counts
 */

(function() {
    'use strict';

    // Initialize when DOM is ready
    function initWhenReady() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initPageViewsFeature);
        } else {
            initPageViewsFeature();
        }
    }
    
    function initPageViewsFeature() {
        if (typeof window.BlogSupabase === 'undefined') {
            console.error('Supabase client not loaded');
            return;
        }

        // Initialize Supabase and wait for it to be ready
        const initPromise = window.BlogSupabase.init();
        
        if (initPromise && initPromise.then) {
            // Async initialization
            initPromise.then(function() {
                setTimeout(initPageViews, 100);
            }).catch(function(error) {
                console.error('Failed to initialize Supabase:', error);
            });
        } else {
            // Sync initialization
            setTimeout(initPageViews, 500);
        }
    }
    
    // Start initialization
    initWhenReady();

    function initPageViews() {
        const viewCountElement = document.getElementById('view-count');
        
        // Get page identifier from data attribute, or use current URL path
        let pageIdentifier = null;
        if (viewCountElement) {
            pageIdentifier = viewCountElement.getAttribute('data-post-slug');
        }
        
        // Fallback to current page URL
        if (!pageIdentifier) {
            pageIdentifier = window.location.pathname.replace(/\/$/, '').replace(/^\//, '') || 'index';
        }
        
        trackPageView(pageIdentifier, viewCountElement);
    }

    async function trackPageView(pageIdentifier, viewCountElement) {
        try {
            const userIdentifier = await window.BlogSupabase.getUserIdentifier();
            const client = window.BlogSupabase.getClient();
            if (!client) {
                console.error('Supabase client not initialized');
                return;
            }

            // Check if we've already tracked this view in this session
            const sessionKey = `viewed_${pageIdentifier}`;
            if (sessionStorage.getItem(sessionKey)) {
                // Just load the count, don't increment
                loadViewCount(pageIdentifier, viewCountElement);
                return;
            }

            // Record the view
            const { error } = await client
                .from('page_views')
                .insert({
                    page_identifier: pageIdentifier,
                    user_identifier: userIdentifier,
                    viewed_at: new Date().toISOString(),
                    referrer: document.referrer || null,
                    user_agent: navigator.userAgent.substring(0, 200) // Limit length
                });

            if (error) {
                // If it's a duplicate, that's okay - just load the count
                if (error.code !== '23505') {
                    console.error('Error tracking page view:', error);
                }
            } else {
                // Mark as viewed in this session
                sessionStorage.setItem(sessionKey, 'true');
            }

            // Load and display view count
            loadViewCount(pageIdentifier, viewCountElement);
        } catch (error) {
            console.error('Error in trackPageView:', error);
            // Still try to load the count
            loadViewCount(pageIdentifier, viewCountElement);
        }
    }

    async function loadViewCount(pageIdentifier, viewCountElement) {
        try {
            const client = window.BlogSupabase.getClient();
            if (!client) return;

            const { data, error } = await client
                .from('page_views')
                .select('id', { count: 'exact', head: true })
                .eq('page_identifier', pageIdentifier);

            if (error) {
                console.error('Error loading view count:', error);
                return;
            }

            const count = data || 0;
            if (viewCountElement) {
                viewCountElement.textContent = count.toLocaleString();
                viewCountElement.style.display = 'inline';
            }
        } catch (error) {
            console.error('Error in loadViewCount:', error);
        }
    }
})();

