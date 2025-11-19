/**
 * Comments Functionality
 * Handles comment submission and display
 */

(function() {
    'use strict';

    // Initialize when DOM is ready
    function initWhenReady() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initCommentsFeature);
        } else {
            initCommentsFeature();
        }
    }
    
    function initCommentsFeature() {
        if (typeof window.BlogSupabase === 'undefined') {
            // Show "no comments" if Supabase isn't available
            const container = document.getElementById('comments-container');
            if (container) {
                container.innerHTML = '<p class="no-comments">No comments yet. Be the first to comment!</p>';
            }
            return;
        }

        // Initialize Supabase and wait for it to be ready
        const initPromise = window.BlogSupabase.init();
        
        if (initPromise && initPromise.then) {
            initPromise.then(function() {
                setTimeout(initComments, 100);
            }).catch(function(error) {
                console.error('Failed to initialize Supabase:', error);
                // Show "no comments" on error
                const container = document.getElementById('comments-container');
                if (container) {
                    container.innerHTML = '<p class="no-comments">No comments yet. Be the first to comment!</p>';
                }
            });
        } else {
            setTimeout(initComments, 500);
        }
    }
    
    // Start initialization
    initWhenReady();

    function initComments() {
        const commentForm = document.getElementById('comment-form');
        const commentsContainer = document.getElementById('comments-container');
        
        if (!commentForm) {
            return;
        }

        // Get post slug from data attribute, or fallback to URL path
        let postSlug = commentForm.getAttribute('data-post-slug');
        if (!postSlug) {
            // Use current page URL as identifier
            postSlug = window.location.pathname.replace(/\/$/, '').replace(/^\//, '') || 'index';
        }

        // Load existing comments
        loadComments(postSlug, commentsContainer);

        // Handle form submission
        commentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitComment(postSlug, commentForm, commentsContainer);
        });
    }

    async function loadComments(postSlug, container) {
        try {
            const client = window.BlogSupabase.getClient();
            if (!client) {
                console.error('Supabase client not initialized');
                displayComments([], container); // Show "no comments" if client not ready
                return;
            }

            const { data, error } = await client
                .from('comments')
                .select('*')
                .eq('post_slug', postSlug)
                .eq('approved', true) // Only show approved comments
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error loading comments:', error);
                displayComments([], container); // Show "no comments" on error
                return;
            }

            displayComments(data || [], container);
        } catch (error) {
            console.error('Error in loadComments:', error);
            displayComments([], container); // Show "no comments" on error
        }
    }

    function displayComments(comments, container) {
        if (!container) return;

        if (comments.length === 0) {
            container.innerHTML = '<p class="no-comments">No comments yet. Be the first to comment!</p>';
            return;
        }

        let html = '<div class="comments-list">';
        comments.forEach(function(comment) {
            const date = new Date(comment.created_at);
            const formattedDate = date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            html += `
                <div class="comment-item">
                    <div class="comment-header">
                        <strong class="comment-author">${escapeHtml(comment.name || 'Anonymous')}</strong>
                        <span class="comment-date">${formattedDate}</span>
                    </div>
                    <div class="comment-body">${escapeHtml(comment.comment).replace(/\n/g, '<br>')}</div>
                </div>
            `;
        });
        html += '</div>';

        container.innerHTML = html;
    }

    async function submitComment(postSlug, form, container) {
        const nameInput = form.querySelector('#comment-name');
        const commentInput = form.querySelector('#comment-text');
        const submitButton = form.querySelector('button[type="submit"]');

        const name = nameInput ? nameInput.value.trim() : '';
        const comment = commentInput ? commentInput.value.trim() : '';

        if (!comment) {
            alert('Please enter a comment.');
            return;
        }

        // Disable submit button
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Submitting...';
        }

        try {
            const userIdentifier = await window.BlogSupabase.getUserIdentifier();
            const client = window.BlogSupabase.getClient();
            if (!client) {
                throw new Error('Supabase client not initialized');
            }

            // Insert comment without created_at (let database handle it)
            // Comments are auto-approved now
            const { data, error } = await client
                .from('comments')
                .insert({
                    post_slug: postSlug,
                    name: name || null,
                    comment: comment,
                    user_identifier: userIdentifier,
                    approved: true
                    // Don't set created_at - let the database default handle it
                });

            if (error) {
                throw error;
            }

            // Clear form
            if (commentInput) commentInput.value = '';
            if (nameInput) nameInput.value = '';

            // Show success message (inline, not popup)
            showCommentMessage(form, 'Thank you for your comment!', 'success');

            // Reload comments (won't show new one until approved)
            loadComments(postSlug, container);
        } catch (error) {
            console.error('Error submitting comment:', error);
            console.error('Error details:', {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint
            });
            let errorMessage = 'Unable to submit comment. Please try again.';
            if (error.message) {
                errorMessage += ' Error: ' + error.message;
            }
            showCommentMessage(form, errorMessage, 'error');
        } finally {
            // Re-enable submit button
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = 'Post Comment';
            }
        }
    }

    // Show comment submission message (inline)
    function showCommentMessage(form, message, type) {
        // Remove existing messages
        const existingMessage = form.querySelector('.comment-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = `comment-message ${type}`;
        messageEl.textContent = message;
        messageEl.style.cssText = `
            margin-top: 15px;
            padding: 12px 16px;
            border-radius: 6px;
            font-size: 14px;
            line-height: 1.5;
            ${type === 'success' 
                ? 'background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb;' 
                : 'background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;'}
        `;

        // Insert after form
        form.parentNode.insertBefore(messageEl, form.nextSibling);

        // Remove message after 5 seconds (only for success)
        if (type === 'success') {
            setTimeout(function() {
                if (messageEl.parentNode) {
                    messageEl.style.transition = 'opacity 0.3s';
                    messageEl.style.opacity = '0';
                    setTimeout(function() {
                        if (messageEl.parentNode) {
                            messageEl.remove();
                        }
                    }, 300);
                }
            }, 5000);
        }
    }

    // Simple HTML escape function
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
})();

