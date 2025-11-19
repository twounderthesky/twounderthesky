/**
 * Supabase Client Configuration
 * 
 * IMPORTANT: For production, these values should be set via environment variables
 * during build time, or use Supabase Row Level Security (RLS) to protect your data.
 * 
 * The anon key is safe to expose in client-side code when RLS is properly configured.
 */

// Configuration - These will be injected during build or set via config
// Check if values are placeholders
function isPlaceholder(value) {
    return !value || 
           value === 'YOUR_SUPABASE_URL' || 
           value === 'YOUR_SUPABASE_ANON_KEY' ||
           value.includes('YOUR_');
}

const SUPABASE_CONFIG = {
    url: window.SUPABASE_URL || 'YOUR_SUPABASE_URL',
    anonKey: window.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'
};

// Initialize Supabase client
let supabaseClient = null;

// Check if Supabase config is valid
function isConfigValid() {
    return !isPlaceholder(SUPABASE_CONFIG.url) && 
           !isPlaceholder(SUPABASE_CONFIG.anonKey);
}

// Lazy load Supabase JS library
function initSupabase() {
    if (supabaseClient) {
        return supabaseClient;
    }

    // Check if config is valid
    if (!isConfigValid()) {
        console.error('Supabase configuration is missing or invalid. Please check _config.yml');
        return null;
    }

    // Load Supabase JS from CDN if not already loaded
    if (typeof supabase === 'undefined') {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
            script.onload = function() {
                try {
                    supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
                    resolve(supabaseClient);
                } catch (error) {
                    console.error('Error creating Supabase client:', error);
                    reject(error);
                }
            };
            script.onerror = function() {
                console.error('Failed to load Supabase library');
                reject(new Error('Failed to load Supabase library'));
            };
            document.head.appendChild(script);
        });
    } else {
        try {
            supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
            return supabaseClient;
        } catch (error) {
            console.error('Error creating Supabase client:', error);
            return null;
        }
    }
}

// Get client instance (waits for initialization if needed)
function getSupabaseClient() {
    if (supabaseClient) {
        return supabaseClient;
    }
    
    if (!isConfigValid()) {
        console.error('Supabase configuration is missing or invalid');
        return null;
    }

    if (typeof supabase !== 'undefined') {
        try {
            supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
            return supabaseClient;
        } catch (error) {
            console.error('Error creating Supabase client:', error);
            return null;
        }
    }
    
    return null;
}

// Hash function for IP addresses (simple hash, not cryptographically secure)
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
}

// Get a unique identifier for the user (browser fingerprint + IP hash)
async function getUserIdentifier() {
    // Get IP address (using a free service)
    let ipHash = 'unknown';
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        ipHash = simpleHash(data.ip);
    } catch (e) {
        // Fallback: use a combination of browser features
        const fingerprint = navigator.userAgent + 
                          navigator.language + 
                          screen.width + 
                          screen.height + 
                          new Date().getTimezoneOffset();
        ipHash = simpleHash(fingerprint);
    }
    
    // Combine with localStorage ID for better uniqueness
    let browserId = localStorage.getItem('blog_browser_id');
    if (!browserId) {
        browserId = simpleHash(Date.now().toString() + Math.random().toString());
        localStorage.setItem('blog_browser_id', browserId);
    }
    
    return simpleHash(ipHash + browserId);
}

// Export functions
window.BlogSupabase = {
    init: initSupabase,
    getClient: getSupabaseClient,
    getUserIdentifier: getUserIdentifier,
    config: SUPABASE_CONFIG
};

