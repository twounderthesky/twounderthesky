(function() {
    'use strict';

    function initWhenReady(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function initShareFeature() {
        var shareButton = document.getElementById('share-button');
        if (!shareButton) {
            return;
        }

        var feedbackEl = document.getElementById('share-feedback');
        var defaultUrl = shareButton.getAttribute('data-share-url') || window.location.href.split('#')[0];
        var pageTitle = document.querySelector('.post-full-title');
        var shareTitle = shareButton.getAttribute('data-share-title') || (pageTitle ? pageTitle.textContent.trim() : document.title);
        var shareText = shareButton.getAttribute('data-share-text') || 'Thought you might enjoy this post.';

        shareButton.addEventListener('click', function() {
            handleShare(shareButton, feedbackEl, {
                title: shareTitle,
                text: shareText,
                url: defaultUrl
            });
        });
    }

    async function handleShare(button, feedbackEl, payload) {
        clearFeedback(feedbackEl);
        setButtonState(button, true);

        try {
            if (navigator.share) {
                await navigator.share(payload);
                showFeedback(feedbackEl, 'Thanks for sharing!', 'success');
            } else {
                await copyToClipboard(payload.url);
                showFeedback(feedbackEl, 'Link copied to your clipboard.', 'success');
            }
        } catch (error) {
            if (error && error.name === 'AbortError') {
                showFeedback(feedbackEl, 'Share cancelled.', 'neutral');
            } else {
                console.warn('Share failed, trying to copy instead.', error);
                try {
                    await copyToClipboard(payload.url);
                    showFeedback(feedbackEl, 'Link copied to your clipboard.', 'success');
                } catch (copyError) {
                    console.error('Copy failed.', copyError);
                    showFeedback(feedbackEl, 'Could not share automatically. Please copy the link manually.', 'error');
                }
            }
        } finally {
            setButtonState(button, false);
            hideFeedbackLater(feedbackEl);
        }
    }

    async function copyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(text);
        }

        return new Promise(function(resolve, reject) {
            var textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.top = '-9999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            try {
                var successful = document.execCommand('copy');
                document.body.removeChild(textArea);
                successful ? resolve() : reject(new Error('execCommand failed'));
            } catch (err) {
                document.body.removeChild(textArea);
                reject(err);
            }
        });
    }

    function setButtonState(button, isBusy) {
        if (!button) return;
        if (isBusy) {
            button.setAttribute('disabled', 'disabled');
            button.classList.add('share-button-working');
        } else {
            button.removeAttribute('disabled');
            button.classList.remove('share-button-working');
        }
    }

    function showFeedback(el, message, state) {
        if (!el) return;
        el.textContent = message || '';
        el.dataset.state = state || '';
        if (message) {
            el.classList.add('visible');
        }
    }

    function clearFeedback(el) {
        if (!el) return;
        el.textContent = '';
        el.dataset.state = '';
        el.classList.remove('visible');
    }

    function hideFeedbackLater(el) {
        if (!el) return;
        setTimeout(function() {
            clearFeedback(el);
        }, 5000);
    }

    initWhenReady(initShareFeature);
})();


