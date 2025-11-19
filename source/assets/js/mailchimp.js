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
                    showMessage(form, 'Thank you for subscribing! Please check your email to confirm.', 'success');
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
    }
})();

