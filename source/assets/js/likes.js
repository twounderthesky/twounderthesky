/**
 * Likes Functionality
 * Handles like/unlike actions and displays like counts
 */

(function() {
    'use strict';

    // Initialize when DOM is ready
    function initWhenReady() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initLikesFeature);
        } else {
            initLikesFeature();
        }
    }
    
    function initLikesFeature() {
        // Wait for Supabase to be available
        if (typeof window.BlogSupabase === 'undefined') {
            return;
        }
        
        // Initialize Supabase and wait for it to be ready
        const initPromise = window.BlogSupabase.init();
        
        if (initPromise && initPromise.then) {
            initPromise.then(function() {
                setTimeout(initLikes, 100);
            }).catch(function(error) {
                console.error('Failed to initialize Supabase:', error);
            });
        } else {
            setTimeout(initLikes, 500);
        }
    }
    
    // Start initialization
    initWhenReady();

    function initLikes() {
        const likeButton = document.getElementById('like-button');
        const likeCount = document.getElementById('like-count');
        
        if (!likeButton) return;

        // Get post slug from data attribute, or fallback to URL path
        let postSlug = likeButton.getAttribute('data-post-slug');
        if (!postSlug) {
            // Use current page URL as identifier
            postSlug = window.location.pathname.replace(/\/$/, '').replace(/^\//, '') || 'index';
        }

        // Check if user has already liked
        checkUserLiked(postSlug, likeButton);
        
        // Load current like count
        loadLikeCount(postSlug, likeCount);

        // Handle like button click
        likeButton.addEventListener('click', function(e) {
            e.preventDefault();
            handleLike(postSlug, likeButton, likeCount);
        });
    }

    async function loadLikeCount(postSlug, likeCountElement) {
        try {
            const client = window.BlogSupabase.getClient();
            if (!client) {
                if (likeCountElement) likeCountElement.textContent = '0';
                return;
            }

            const { count, error } = await client
                .from('likes')
                .select('*', { count: 'exact', head: true })
                .eq('post_slug', postSlug);

            if (error) {
                if (likeCountElement) likeCountElement.textContent = '0';
                return;
            }

            const likeCount = count || 0;
            if (likeCountElement) likeCountElement.textContent = likeCount;
        } catch (error) {
            console.error('Error in loadLikeCount:', error);
            if (likeCountElement) likeCountElement.textContent = '0';
        }
    }

    async function checkUserLiked(postSlug, likeButton) {
        try {
            const userIdentifier = await window.BlogSupabase.getUserIdentifier();
            const client = window.BlogSupabase.getClient();
            if (!client) return;

            const { data, error } = await client
                .from('likes')
                .select('id')
                .eq('post_slug', postSlug)
                .eq('user_identifier', userIdentifier)
                .limit(1);

            if (error) {
                console.error('Error checking like status:', error);
                return;
            }

            const hasLiked = data && data.length > 0;
            if (hasLiked) {
                likeButton.classList.add('liked');
                likeButton.setAttribute('aria-pressed', 'true');
            }
            updateLikeButtonDisplay(likeButton);
        } catch (error) {
            console.error('Error in checkUserLiked:', error);
        }
    }

    // Update button display based on like status
    function updateLikeButtonDisplay(likeButton) {
        const isLiked = likeButton.classList.contains('liked');
        const likeText = likeButton.querySelector('.like-button-text');
        const likeIcon = likeButton.querySelector('.like-button-icon');
        
        if (isLiked) {
            if (likeText) likeText.textContent = 'Liked';
            if (likeIcon) likeIcon.textContent = '❤️';
        } else {
            if (likeText) likeText.textContent = 'Like';
            if (likeIcon) likeIcon.textContent = '♡';
        }
    }

    async function handleLike(postSlug, likeButton, likeCountElement) {
        try {
            const client = window.BlogSupabase.getClient();
            if (!client) {
                console.error('Supabase client not initialized');
                alert('Unable to connect. Please check your Supabase configuration.');
                return;
            }

            const userIdentifier = await window.BlogSupabase.getUserIdentifier();

            const isLiked = likeButton.classList.contains('liked');

            if (isLiked) {
                // Unlike: Remove the like
                const { error } = await client
                    .from('likes')
                    .delete()
                    .eq('post_slug', postSlug)
                    .eq('user_identifier', userIdentifier);

                if (error) {
                    console.error('Error unliking:', error);
                    alert('Unable to unlike. Please try again.');
                    return;
                }

                likeButton.classList.remove('liked');
                likeButton.setAttribute('aria-pressed', 'false');
                updateLikeButtonDisplay(likeButton);
            } else {
                // Like: Add the like
                const { error } = await client
                    .from('likes')
                    .insert({
                        post_slug: postSlug,
                        user_identifier: userIdentifier,
                        created_at: new Date().toISOString()
                    });

                if (error) {
                    console.error('Error liking:', error);
                    // Check if it's a duplicate (user already liked)
                    if (error.code === '23505') {
                        likeButton.classList.add('liked');
                        likeButton.setAttribute('aria-pressed', 'true');
                        updateLikeButtonDisplay(likeButton);
                    } else {
                        alert('Unable to like. Please try again.');
                    }
                    return;
                }

                likeButton.classList.add('liked');
                likeButton.setAttribute('aria-pressed', 'true');
                updateLikeButtonDisplay(likeButton);
            }

            // Update like count
            loadLikeCount(postSlug, likeCountElement);
        } catch (error) {
            console.error('Error in handleLike:', error);
            alert('An error occurred. Please try again.');
        }
    }
})();

