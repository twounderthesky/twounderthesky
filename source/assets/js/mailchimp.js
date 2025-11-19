/**
 * Mailchimp Email Subscription
 * Handles email subscription form submission
 */

(function() {
    'use strict';

    // Initialize when DOM is ready
    function initWhenReady() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initMailchimp);
        } else {
            initMailchimp();
        }
    }
    
    // Start initialization
    initWhenReady();

    function initMailchimp() {
        const subscribeForm = document.querySelector('.subscribe-form form, #subscribe form');
        if (!subscribeForm) return;

        subscribeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleSubscribe(subscribeForm);
        });
    }

    async function handleSubscribe(form) {
        const emailInput = form.querySelector('input[type="email"], .subscribe-email');
        const submitButton = form.querySelector('button[type="submit"]');

        if (!emailInput) {
            console.error('Email input not found');
            return;
        }

        const email = emailInput.value.trim();

        if (!email || !isValidEmail(email)) {
            alert('Please enter a valid email address.');
            return;
        }

        // Disable submit button
        if (submitButton) {
            submitButton.disabled = true;
            const originalText = submitButton.textContent || submitButton.innerHTML;
            submitButton.textContent = 'Subscribing...';
            submitButton.innerHTML = submitButton.innerHTML.replace(originalText, 'Subscribing...');
        }

        try {
            // Get Mailchimp configuration
            let mailchimpUrl = window.MAILCHIMP_URL || form.getAttribute('data-mailchimp-url');
            
            if (!mailchimpUrl) {
                throw new Error('Mailchimp URL not configured');
            }

            // Decode HTML entities (convert &amp; to &)
            mailchimpUrl = mailchimpUrl.replace(/&amp;/g, '&');
            
            // Convert to JSON endpoint if it's a regular post URL (better for AJAX)
            if (mailchimpUrl.includes('/subscribe/post?') && !mailchimpUrl.includes('/post-json')) {
                mailchimpUrl = mailchimpUrl.replace('/subscribe/post?', '/subscribe/post-json?') + '&c=?';
            }

            // Build the URL with email parameter
            const url = new URL(mailchimpUrl);
            url.searchParams.set('EMAIL', email);

            // Add any additional fields if present
            const nameInput = form.querySelector('input[name="name"], input[name="FNAME"]');
            if (nameInput && nameInput.value.trim()) {
                url.searchParams.set('FNAME', nameInput.value.trim());
            }

            // Use JSONP for Mailchimp (works better than no-cors)
            const script = document.createElement('script');
            const callbackName = 'mailchimp_callback_' + Date.now();
            
            window[callbackName] = function(data) {
                delete window[callbackName];
                document.body.removeChild(script);
                
                if (data.result === 'success') {
                    // Clear the form
                    emailInput.value = '';
                    if (nameInput) nameInput.value = '';
                    // Show success message
                    showMessage(form, 'Thank you for subscribing!', 'success');
                } else {
                    showMessage(form, data.msg || 'Unable to subscribe. Please try again later.', 'error');
                }
            };

            url.searchParams.set('c', callbackName);
            script.src = url.toString();
            document.body.appendChild(script);

        } catch (error) {
            console.error('Error subscribing:', error);
            showMessage(form, 'Unable to subscribe. Please try again later.', 'error');
        } finally {
            // Re-enable submit button
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = 'Subscribe';
                submitButton.innerHTML = submitButton.innerHTML.replace('Subscribing...', 'Subscribe');
            }
        }
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function showMessage(form, message, type) {
        // Remove existing messages
        const existingMessage = form.querySelector('.subscription-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = `subscription-message ${type}`;
        messageEl.textContent = message;
        messageEl.style.cssText = `
            margin-top: 10px;
            padding: 10px;
            border-radius: 4px;
            ${type === 'success' ? 'background-color: #d4edda; color: #155724;' : 'background-color: #f8d7da; color: #721c24;'}
        `;

        // Insert after form
        form.parentNode.insertBefore(messageEl, form.nextSibling);

        // Remove message after 5 seconds
        setTimeout(function() {
            messageEl.remove();
        }, 5000);

        if (type === 'success') {
            autoCloseSubscribeOverlay(form);
            showSuccessToast(message);
        }
    }

    function autoCloseSubscribeOverlay(form) {
        if (!form || typeof form.closest !== 'function') return;

        const overlay = form.closest('#subscribe');
        if (!overlay) return;

        setTimeout(function() {
            const closeTrigger = overlay.querySelector('.subscribe-overlay-close');
            if (closeTrigger && typeof closeTrigger.click === 'function') {
                closeTrigger.click();
                return;
            }

            if (window.location.hash === '#subscribe') {
                if (history.replaceState) {
                    history.replaceState(null, document.title, window.location.pathname + window.location.search);
                } else {
                    window.location.hash = '';
                }
            }
        }, 1500);
    }

    function showSuccessToast(message) {
        const toastId = 'subscription-success-toast';
        let toast = document.getElementById(toastId);

        if (!toast) {
            toast = document.createElement('div');
            toast.id = toastId;
            toast.className = 'subscription-toast';
            toast.style.cssText = `
                position: fixed;
                bottom: 24px;
                right: 24px;
                z-index: 9999;
                background: rgba(30, 41, 59, 0.95);
                color: #fff;
                padding: 14px 18px;
                border-radius: 10px;
                box-shadow: 0 10px 25px rgba(15, 23, 42, 0.3);
                font-size: 15px;
                line-height: 1.4;
                max-width: 320px;
                opacity: 0;
                transform: translateY(15px);
                transition: opacity 0.3s ease, transform 0.3s ease;
            `;
            document.body.appendChild(toast);
        }

        toast.textContent = message;
        requestAnimationFrame(function() {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        });

        clearTimeout(toast.hideTimeout);
        toast.hideTimeout = setTimeout(function() {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(15px)';
            setTimeout(function() {
                if (toast && toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 4000);
    }
})();

