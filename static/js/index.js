// ====================== API CONFIGS ====================== 
const API_KEY = "3c1a2f72d6fdb0c8cdf454c4996353af";
const BASE_URL = "https://api.themoviedb.org/3";
const MOVIES_API = `${BASE_URL}/discover/movie?sort_by=popularity.desc&api_key=${API_KEY}`;
const SERIES_API = `${BASE_URL}/discover/tv?sort_by=popularity.desc&api_key=${API_KEY}`;
const IMG_PATH = "https://image.tmdb.org/t/p/w1280";
const SEARCH_MOVIE = `${BASE_URL}/search/movie?&api_key=${API_KEY}&query=`;
const SEARCH_SERIES = `${BASE_URL}/search/tv?&api_key=${API_KEY}&query=`;

// ====================== ENHANCED MOVIE AVAILABILITY CHECKER ======================
// Site configurations with improved search patterns and availability indicators
const SITE_CONFIGS = {
    waploaded: {
        searchUrl: (query) => `https://www.waploaded.com/search?q=${encodeURIComponent(query)}`,
        corsProxy: 'https://api.allorigins.win/raw?url=',
        availabilityIndicators: ['.post-title', '.entry-title', '.movie-item', '.title', 'h1', 'h2', 'h3'],
        timeout: 10000,
        exactMatchSelectors: ['.post-title a', '.entry-title a', '.movie-item a']
    },
    nkiri: {
        searchUrl: (query) => `https://nkiri.com/?s=${encodeURIComponent(query)}`,
        corsProxy: 'https://api.allorigins.win/raw?url=',
        availabilityIndicators: ['.post-title', '.entry-title', 'h2 a', '.title'],
        timeout: 10000,
        exactMatchSelectors: ['.post-title a', 'h2 a']
    },
    stagatv: {
        searchUrl: (query) => `https://www.stagatv.com/?s=${encodeURIComponent(query)}`,
        corsProxy: 'https://api.allorigins.win/raw?url=',
        availabilityIndicators: ['.post-title', '.entry-title', '.movie-title', '.title'],
        timeout: 10000,
        exactMatchSelectors: ['.post-title a', '.movie-title a']
    },
    netnaija: {
        searchUrl: (query) => `https://www.thenetnaija.net/search?t=${encodeURIComponent(query)}`,
        corsProxy: 'https://api.allorigins.win/raw?url=',
        availabilityIndicators: ['.post-title', '.entry-title', '.movie-link', '.title'],
        timeout: 10000,
        exactMatchSelectors: ['.post-title a', '.movie-link a']
    },
    fzmovies: {
        searchUrl: (query) => `https://fzmovie.co.za/search.php?searchname=${encodeURIComponent(query)}`,
        corsProxy: 'https://api.allorigins.win/raw?url=',
        availabilityIndicators: ['.mainbox', '.movie-title', 'td a', '.title', '.movies-list', '.content', '.post', '.movie-item', '.entry-content', '.search-result'],
        timeout: 15000,
        exactMatchSelectors: ['.movie-title a', 'td a', '.post a', '.movie-item a', '.entry-content a', '.search-result a'],
        // Custom handler for FZMovies
        customHandler: async (html, query) => {
            // Try multiple approaches to find the movie
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Approach 1: Look for direct links with the movie title
            const links = doc.querySelectorAll('a');
            for (const link of links) {
                const linkText = link.textContent.toLowerCase();
                const queryLower = query.toLowerCase();
                
                // Check if the link contains the movie title
                if (linkText.includes(queryLower) || queryLower.includes(linkText)) {
                    // Check if it's a movie link (contains movie-related keywords)
                    const href = link.getAttribute('href') || '';
                    if (href.includes('movie') || href.includes('download') || href.includes('watch')) {
                        return true;
                    }
                }
            }
            
            // Approach 2: Look for search result containers
            const searchResults = doc.querySelectorAll('.mainbox, .search-result, .movie-item');
            for (const result of searchResults) {
                const resultText = result.textContent.toLowerCase();
                if (resultText.includes(queryLower)) {
                    return true;
                }
            }
            
            // Approach 3: Check for any mention of the movie title
            const bodyText = doc.body.textContent.toLowerCase();
            if (bodyText.includes(queryLower)) {
                // Make sure it's not in a "no results" message
                const noResultsTexts = ['no results', 'not found', '0 results'];
                const hasNoResults = noResultsTexts.some(text => bodyText.includes(text));
                if (!hasNoResults) {
                    return true;
                }
            }
            
            return false;
        }
    },
    o2tvseries: {
        searchUrl: (query) => `https://o2tvseries.com/search?q=${encodeURIComponent(query)}`,
        corsProxy: 'https://api.allorigins.win/raw?url=',
        availabilityIndicators: ['.post-title', '.entry-title', '.series-title', '.title', '.content', '.post'],
        timeout: 10000,
        exactMatchSelectors: ['.post-title a', '.series-title a', '.post a']
    },
    // Additional sites for better detection
    toxicwap: {
        searchUrl: (query) => `https://www.toxicwap.com/search?q=${encodeURIComponent(query)}`,
        corsProxy: 'https://api.allorigins.win/raw?url=',
        availabilityIndicators: ['.post-title', '.entry-title', '.movie-title', '.title'],
        timeout: 10000,
        exactMatchSelectors: ['.post-title a', '.movie-title a']
    },
    '9jarocks': {
        searchUrl: (query) => `https://www.9jarocks.com/?s=${encodeURIComponent(query)}`,
        corsProxy: 'https://api.allorigins.win/raw?url=',
        availabilityIndicators: ['.post-title', '.entry-title', '.movie-item', '.title'],
        timeout: 10000,
        exactMatchSelectors: ['.post-title a', '.movie-item a']
    },
    netflix: {
        searchUrl: (query) => `https://www.netflix.com/search?q=${encodeURIComponent(query)}`,
        corsProxy: 'https://api.allorigins.win/raw?url=',
        availabilityIndicators: ['.title-card', '.slider-item', '.movie-title', '.title'],
        timeout: 10000,
        exactMatchSelectors: ['.title-card a', '.slider-item a']
    },
    amazon: {
        searchUrl: (query) => `https://www.amazon.com/s?k=${encodeURIComponent(query)}`,
        corsProxy: 'https://api.allorigins.win/raw?url=',
        availabilityIndicators: ['.s-result-item', '.a-text-normal', '.product-title', '.title'],
        timeout: 10000,
        exactMatchSelectors: ['.s-result-item a', '.product-title a']
    }
};

// ====================== INTERNET CONNECTION MONITOR ======================
let internetStatusToast = null;
let isOnline = navigator.onLine;

// Monitor internet connection
window.addEventListener('online', () => {
    if (!isOnline) {
        isOnline = true;
        showInternetStatus(true);
    }
});

window.addEventListener('offline', () => {
    if (isOnline) {
        isOnline = false;
        showInternetStatus(false);
    }
});

function showInternetStatus(online) {
    // Remove existing toast if any
    if (internetStatusToast) {
        internetStatusToast.remove();
        internetStatusToast = null;
    }
    
    const toast = document.createElement("div");
    toast.className = `internet-status ${online ? 'online' : 'offline'}`;
    toast.innerHTML = `<span>${online ? 'Internet Restored' : 'No Internet Connection'}</span>`;
    
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        height: 2.5rem;
        padding: 0 1.5rem;
        border-radius: 4px;
        color: #fff;
        font-weight: 600;
        font-size: 1rem;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        transition: all 0.3s ease;
    `;
    
    if (online) {
        toast.style.background = "linear-gradient(45deg, #4CAF50, #45a049)";
        // Auto hide after 5 seconds for online status
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.opacity = "0";
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.remove();
                    }
                }, 300);
            }
        }, 5000);
    } else {
        toast.style.background = "linear-gradient(45deg, #f44336, #d32f2f)";
        // Keep showing until connection is restored
        internetStatusToast = toast;
    }
    
    document.body.appendChild(toast);
    
    // Animate in
    requestAnimationFrame(() => {
        toast.style.opacity = "1";
    });
}

// Check initial connection status
if (!isOnline) {
    showInternetStatus(false);
}

/**
 * Helper function to try a single search query
 */
async function trySearchQuery(config, searchQuery, siteName, itemType) {
    console.log(`Checking ${siteName} for: "${searchQuery}" (Type: ${itemType})`);
    const searchUrl = config.searchUrl(searchQuery);
    const proxyUrl = config.corsProxy + encodeURIComponent(searchUrl);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);
    
    let html = '';
    try {
        const response = await fetch(proxyUrl, {
            method: 'GET',
            signal: controller.signal,
            headers: {
                'Accept': 'text/html,application/xhtml+xml',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        if (!response.ok) {
            console.log(`${siteName}: HTTP ${response.status}`);
            return false;
        }
        
        html = await response.text();
    } catch (fetchError) {
        console.log(`${siteName}: Fetch error - ${fetchError.message}`);
        // Try alternative proxy if available
        try {
            const altProxyUrl = `https://cors-anywhere.herokuapp.com/${searchUrl}`;
            const altResponse = await fetch(altProxyUrl, {
                method: 'GET',
                signal: controller.signal,
                headers: {
                    'Accept': 'text/html,application/xhtml+xml',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            
            if (altResponse.ok) {
                html = await altResponse.text();
            } else {
                return false;
            }
        } catch (altError) {
            console.log(`${siteName}: Alternative proxy failed - ${altError.message}`);
            return false;
        }
    }
    
    clearTimeout(timeoutId);
    
    // Use custom handler if available
    if (config.customHandler) {
        try {
            const customResult = await config.customHandler(html, searchQuery);
            console.log(`${siteName}: Custom handler result - ${customResult}`);
            return customResult;
        } catch (error) {
            console.log(`${siteName}: Custom handler error - ${error.message}`);
            // Fall back to standard detection
        }
    }
    
    // Standard detection
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Check for exact matches first
    let hasExactMatch = false;
    if (config.exactMatchSelectors) {
        for (const selector of config.exactMatchSelectors) {
            const elements = doc.querySelectorAll(selector);
            if (elements.length > 0) {
                for (const element of elements) {
                    const text = element.textContent.toLowerCase();
                    const queryLower = searchQuery.toLowerCase();
                    
                    // Enhanced matching for exact title match
                    if (text.includes(queryLower) || queryLower.includes(text)) {
                        hasExactMatch = true;
                        break;
                    }
                }
                if (hasExactMatch) break;
            }
        }
    }
    
    // If no exact match, try partial matching
    let hasPartialMatch = false;
    if (!hasExactMatch) {
        for (const selector of config.availabilityIndicators) {
            const elements = doc.querySelectorAll(selector);
            if (elements.length > 0) {
                for (const element of elements) {
                    const text = element.textContent.toLowerCase();
                    const queryWords = searchQuery.toLowerCase().split(' ').filter(word => word.length > 2);
                    
                    // Enhanced matching for series
                    let matchCount = 0;
                    queryWords.forEach(word => {
                        if (text.includes(word)) matchCount++;
                    });
                    
                    // For series, also check for common series indicators
                    if (itemType === 'tv' || itemType === 'series') {
                        const seriesIndicators = ['season', 'episode', 'series', 'tv show', 'episodes'];
                        const hasSeriesIndicator = seriesIndicators.some(indicator => text.includes(indicator));
                        if (hasSeriesIndicator) matchCount += 1;
                    }
                    
                    // Reduced required matches for better results
                    const requiredMatches = Math.max(1, Math.ceil(queryWords.length * 0.2)); // Reduced from 0.3 to 0.2
                    if (matchCount >= requiredMatches) {
                        hasPartialMatch = true;
                        break;
                    }
                }
                if (hasPartialMatch) break;
            }
        }
    }
    
    // Check for "no results" indicators
    const noResultsIndicators = [
        'no results found',
        'nothing found',
        'no posts found',
        'no movies found',
        'no series found',
        'search returned no results',
        'sorry, no posts matched',
        'your search did not match any documents'
    ];
    
    const bodyText = doc.body?.textContent?.toLowerCase() || '';
    const hasNoResultsIndicator = noResultsIndicators.some(indicator => 
        bodyText.includes(indicator)
    );
    
    const isAvailable = (hasExactMatch || hasPartialMatch) && !hasNoResultsIndicator;
    console.log(`${siteName}: ${isAvailable ? 'AVAILABLE' : 'NOT AVAILABLE'} (${itemType}) - Exact: ${hasExactMatch}, Partial: ${hasPartialMatch}, NoResults: ${hasNoResultsIndicator}`);
    
    return isAvailable;
}

/**
 * Check if a movie/series is available on a specific site using hierarchical search
 */
async function checkSiteAvailability(siteName, query, year = '', itemType = 'movie', season = null, episode = null) {
    const config = SITE_CONFIGS[siteName];
    if (!config) return false;
    
    try {
        // For movies, just use the basic format with optional year
        if (itemType === 'movie') {
            const searchQuery = year ? `${query} ${year}` : query;
            return await trySearchQuery(config, searchQuery, siteName, itemType);
        }
        
        // For series, use hierarchical search
        console.log(`🔍 Starting hierarchical search for ${query} on ${siteName}`);
        
        // Step 1: Search for just the series name
        console.log(`Step 1: Searching for series name "${query}" on ${siteName}`);
        const hasSeries = await trySearchQuery(config, query, siteName, itemType);
        
        if (!hasSeries) {
            console.log(`Series "${query}" not found on ${siteName}`);
            return false;
        }
        
        console.log(`Series "${query}" found on ${siteName}`);
        
        // If no season and episode specified, just return that the series is available
        if (season === null) {
            return true;
        }
        
        // Step 2: Search for the season
        const seasonFormats = [
            `${query} Season ${season}`,
            `${query} S${season}`,
            `${query} S${season.toString().padStart(2, '0')}`
        ];
        
        let hasSeason = false;
        let successfulSeasonFormat = '';
        
        for (const format of seasonFormats) {
            console.log(`Step 2: Trying season format "${format}" on ${siteName}`);
            hasSeason = await trySearchQuery(config, format, siteName, itemType);
            if (hasSeason) {
                successfulSeasonFormat = format;
                break;
            }
        }
        
        if (!hasSeason) {
            console.log(`Season ${season} of "${query}" not found on ${siteName}, but series is available`);
            return true; // Return true because at least the series is available
        }
        
        console.log(`Season ${season} of "${query}" found on ${siteName} using format: "${successfulSeasonFormat}"`);
        
        // If no episode specified, just return that the season is available
        if (episode === null) {
            return true;
        }
        
        // Step 3: Search for the episode
        const episodeFormats = [
            `${query} Season ${season} Episode ${episode}`,
            `${query} S${season}E${episode}`,
            `${query} S${season.toString().padStart(2, '0')}E${episode.toString().padStart(2, '0')}`
        ];
        
        let hasEpisode = false;
        let successfulEpisodeFormat = '';
        
        for (const format of episodeFormats) {
            console.log(`Step 3: Trying episode format "${format}" on ${siteName}`);
            hasEpisode = await trySearchQuery(config, format, siteName, itemType);
            if (hasEpisode) {
                successfulEpisodeFormat = format;
                break;
            }
        }
        
        if (!hasEpisode) {
            console.log(`Episode ${episode} of Season ${season} of "${query}" not found on ${siteName}, but season is available`);
            return true; // Return true because at least the season is available
        }
        
        console.log(`Episode ${episode} of Season ${season} of "${query}" found on ${siteName} using format: "${successfulEpisodeFormat}"`);
        return true;
        
    } catch (error) {
        if (error.name === 'AbortError') {
            console.log(`${siteName}: Request timed out`);
        } else {
            console.log(`${siteName}: Error - ${error.message}`);
        }
        return false;
    }
}

/**
 * Check availability across all sites for a movie/series with fallback
 */
async function checkAllSitesAvailability(item) {
    const title = currentType === "movie" ? item.title : item.name;
    const year = item.release_date ? new Date(item.release_date).getFullYear() : 
                 item.first_air_date ? new Date(item.first_air_date).getFullYear() : '';
    const season = item.season_number || null;
    const episode = item.episode_number || null;
    
    console.log(`🔍 Checking availability for: "${title}" (${year}) - Type: ${currentType}, Season: ${season}, Episode: ${episode}`);
    const siteNames = Object.keys(SITE_CONFIGS);
    const availabilityPromises = siteNames.map(async (siteName) => {
        const isAvailable = await checkSiteAvailability(siteName, title, year, currentType, season, episode);
        return { site: siteName, available: isAvailable };
    });
    try {
        const results = await Promise.allSettled(availabilityPromises);
        const availability = {};
        
        results.forEach((result, index) => {
            const siteName = siteNames[index];
            if (result.status === 'fulfilled') {
                availability[siteName] = result.value.available;
            } else {
                console.log(`${siteName}: Promise rejected - ${result.reason}`);
                availability[siteName] = false;
            }
        });
        return availability;
    } catch (error) {
        console.error('Error checking site availability:', error);
        const availability = {};
        siteNames.forEach(site => availability[site] = false);
        return availability;
    }
}

/**
 * Update download buttons based on availability with better visual feedback
 */
function updateDownloadButtons(availability) {
    const sourceButtons = document.querySelectorAll(".source-btn");
    
    sourceButtons.forEach(button => {
        const site = button.getAttribute("data-site");
        const isAvailable = availability[site];
        
        // Remove all existing indicators
        const existingIndicators = button.querySelectorAll('.loading-indicator, .available-indicator, .unavailable-indicator');
        existingIndicators.forEach(indicator => indicator.remove());
        
        if (isAvailable === false) {
            button.style.opacity = '0.5';
            button.style.cursor = 'not-allowed';
            button.style.filter = 'grayscale(80%)';
            button.disabled = true;
            
            const indicator = document.createElement('span');
            indicator.className = 'unavailable-indicator';
            indicator.innerHTML = ' ❌';
            indicator.style.cssText = `
                color: #ff4444;
                font-size: 0.8em;
            `;
            button.appendChild(indicator);
            
            button.onclick = (e) => {
                e.preventDefault();
                showToast(`Not available on ${site.charAt(0).toUpperCase() + site.slice(1)}`, "error");
                return false;
            };
        } else {
            button.style.opacity = '1';
            button.style.cursor = 'pointer';
            button.style.filter = 'none';
            button.disabled = false;
            
            const indicator = document.createElement('span');
            indicator.className = 'available-indicator';
            indicator.innerHTML = ' ✅';
            indicator.style.cssText = `
                color: #4CAF50;
                font-size: 0.8em;
            `;
            button.appendChild(indicator);
            
            // Restore original click functionality
            button.onclick = () => {
                const query = encodeURIComponent(modalTitle.textContent);
                let searchUrl = "";
                switch(site) {
                    case "waploaded": searchUrl = `https://www.waploaded.com/search?q=${query}`; break;
                    case "nkiri": searchUrl = `https://nkiri.com/?s=${query}`; break;
                    case "stagatv": searchUrl = `https://www.stagatv.com/?s=${query}`; break;
                    case "netnaija": searchUrl = `https://www.thenetnaija.net/search?t=${query}`; break;
                    case "fzmovies": searchUrl = `https://fzmovie.co.za/search.php?searchname=${query}`; break;
                    case "o2tvseries": searchUrl = `https://o2tvseries.com/search?q=${query}`; break;
                    case "toxicwap": searchUrl = `https://www.toxicwap.com/search?q=${query}`; break;
                    case "9jarocks": searchUrl = `https://www.9jarocks.com/?s=${query}`; break;
                    case "netflix": searchUrl = `https://www.netflix.com/search?q=${query}`; break;
                    case "amazon": searchUrl = `https://www.amazon.com/s?k=${query}`; break;
                }
                if (searchUrl) {
                    window.open(searchUrl, "_blank");
                    showToast(`Opening ${site.charAt(0).toUpperCase() + site.slice(1)}...`, "info");
                }
            };
        }
    });
}

/**
 * Show compact loading state for download buttons
 */
function showAvailabilityLoading() {
    const sourceButtons = document.querySelectorAll(".source-btn");
    
    sourceButtons.forEach(button => {
        // Reset button state
        const existingIndicators = button.querySelectorAll('.loading-indicator, .available-indicator, .unavailable-indicator');
        existingIndicators.forEach(indicator => indicator.remove());
        
        button.style.opacity = '0.6';
        button.disabled = true;
        
        const indicator = document.createElement('span');
        indicator.className = 'loading-indicator';
        indicator.innerHTML = ' 🔄';
        indicator.style.cssText = `
            animation: spin 1s linear infinite;
            display: inline-block;
        `;
        button.appendChild(indicator);
    });
    
    // Add CSS for spin animation if it doesn't exist
    if (!document.getElementById('availability-loader-css')) {
        const style = document.createElement('style');
        style.id = 'availability-loader-css';
        style.textContent = `
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
}

/**
 * Hide loading state
 */
function hideAvailabilityLoading() {
    const loadingIndicators = document.querySelectorAll('.loading-indicator');
    loadingIndicators.forEach(indicator => indicator.remove());
}

/**
 * Main function to check and update availability with better UX
 */
async function checkAndUpdateAvailability(item) {
    showAvailabilityLoading();
    showToast("Checking availability...", "info");
    
    try {
        const availability = await checkAllSitesAvailability(item);
        
        hideAvailabilityLoading();
        updateDownloadButtons(availability);
        
        const availableCount = Object.values(availability).filter(Boolean).length;
        const totalSites = Object.keys(availability).length;
        
        if (availableCount === 0) {
            showToast("Not available on any site", "error");
        } else {
            const itemType = currentType === "movie" ? "movie" : "series";
            showToast(`Available on ${availableCount}/${totalSites} sites`, "success");
        }
        
        console.log('Availability Summary:', availability);
        
    } catch (error) {
        hideAvailabilityLoading();
        showToast("Error checking availability", "error");
        console.error('Availability check failed:', error);
    }
}

// ====================== DOM ELEMENTS ======================
const main = document.getElementById("section");
const form = document.getElementById("form");
const search = document.getElementById("query");
const trailerContainer = document.querySelector(".slider-container");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const paginationContainer = document.getElementById("pagination");

// Modal and review elements
const modal = document.getElementById("movieModal");
const modalImage = document.getElementById("modalImage");
const modalTitle = document.getElementById("modalTitle");
const modalRating = document.getElementById("modalRating");
const modalGenres = document.getElementById("modalGenres");
const modalRuntime = document.getElementById("modalRuntime");
const modalOverview = document.getElementById("modalOverview");
const trailerEmbed = document.getElementById("trailerEmbed");
const downloadMovieBtn = document.getElementById("downloadMovie");
const movieSizeSpan = document.getElementById("movieSize");
const closeModal = document.querySelector(".modal .close");
const reviewInput = document.getElementById("reviewInput");
const submitReviewBtn = document.getElementById("submitReview");
const allReviewsList = document.getElementById("allReviewsList");
const reviewsPopup = document.getElementById("reviewsPopup");
const openReviewsBtn = document.getElementById("openReviews");
const backToMovieBtn = document.querySelector(".back-to-movie");
const addFavoriteBtn = document.getElementById("addFavorite");

// Tabs
const moviesTab = document.getElementById("moviesTab");
const seriesTab = document.getElementById("seriesTab");
const favoritesTab = document.getElementById("favoritesTab");

// Series Download Container
const seriesDownloadContainer = document.getElementById("seriesDownloadContainer");
const seasonsList = document.getElementById("seasonsList");
const downloadAllBtn = document.getElementById("downloadAllBtn");

// ====================== PAGINATION ======================
let currentPage = 1;
let totalPages = 20;
let currentType = "movie"; // "movie" or "tv"
let currentAPIUrl = MOVIES_API;

// ====================== COMPACT TOAST NOTIFICATIONS (2rem height) ======================
function showToast(message, type) {
    // Remove existing toasts to prevent stacking
    const existingToasts = document.querySelectorAll('.compact-toast');
    existingToasts.forEach(toast => toast.remove());
    
    const toast = document.createElement("div");
    toast.className = `compact-toast ${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    
    // Compact styling - exactly 2rem height
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        height: 2rem;
        padding: 0 1rem;
        border-radius: 4px;
        color: #fff;
        font-weight: 500;
        font-size: 0.9rem;
        z-index: 9999;
        min-width: 200px;
        max-width: 300px;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    `;
    
    // Color based on type
    if (type === "success") {
        toast.style.background = "linear-gradient(45deg, #4CAF50, #45a049)";
    } else if (type === "error") {
        toast.style.background = "linear-gradient(45deg, #f44336, #d32f2f)";
    } else if (type === "info") {
        toast.style.background = "linear-gradient(45deg, #2196F3, #1976D2)";
    } else {
        toast.style.background = "linear-gradient(45deg, #ff9800, #f57c00)";
    }
    
    document.body.appendChild(toast);
    
    // Animate in
    requestAnimationFrame(() => {
        toast.style.opacity = "1";
        toast.style.transform = "translateX(0)";
    });
    
    // Animate out and remove
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(100%)";
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 300);
    }, 2500);
}

// ====================== TRAILER STOP FUNCTION ======================
function stopAllTrailers() {
    // Stop main slider trailer
    if (trailerContainer) {
        trailerContainer.innerHTML = "";
    }
    
    // Stop modal trailer
    if (trailerEmbed) {
        trailerEmbed.innerHTML = "";
        trailerEmbed.style.display = "none";
    }
    
    // Show modal image again if modal is open
    if (modalImage && modal.style.display === "flex") {
        modalImage.style.display = "block";
    }
}

// ====================== FETCH ITEMS ======================
async function returnItems(url, page = 1) {
    const res = await fetch(`${url}&page=${page}`);
    const data = await res.json();
    renderItems(data.results);
    renderPagination(data.total_pages);
}

// ====================== RENDER ITEMS ======================
function renderItems(items) {
    main.innerHTML = "";
    items.forEach(item => {
        const div_card = document.createElement("div");
        div_card.className = "card";
        const image = document.createElement("img");
        image.className = "thumbnail";
        image.src = item.poster_path ? IMG_PATH + item.poster_path : "https://via.placeholder.com/300x450?text=No+Image";
        const title = document.createElement("h3");
        title.textContent = currentType === "movie" ? item.title : item.name;
        div_card.appendChild(image);
        div_card.appendChild(title);
        main.appendChild(div_card);
        // OPEN MODAL WHEN CLICKED
        div_card.addEventListener("click", () => openModal(item));
    });
}

// ====================== RECOMMENDATIONS SYSTEM ======================
async function getRecommendations(item) {
    try {
        // First try to get similar items using TMDb recommendations API
        const recRes = await fetch(`${BASE_URL}/${currentType}/${item.id}/recommendations?api_key=${API_KEY}&page=1`);
        const recData = await recRes.json();
        
        if (recData.results && recData.results.length > 0) {
            return recData.results.slice(0, 8);
        }
        
        // Fallback: Get recommendations by genre
        const genreIds = item.genre_ids ? item.genre_ids.slice(0, 2).join(',') : '';
        if (genreIds) {
            const genreUrl = `${BASE_URL}/discover/${currentType}?api_key=${API_KEY}&with_genres=${genreIds}&sort_by=popularity.desc&page=1`;
            const genreRes = await fetch(genreUrl);
            const genreData = await genreRes.json();
            
            // Filter out the current item
            const filtered = genreData.results.filter(rec => rec.id !== item.id);
            return filtered.slice(0, 8);
        }
        
        return [];
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        return [];
    }
}

function createRecommendationsPanel(recommendations, originalItem) {
    // Remove existing panel if it exists
    const existingPanel = document.getElementById('recommendationsPanel');
    if (existingPanel) {
        existingPanel.remove();
    }
    
    const panel = document.createElement('div');
    panel.id = 'recommendationsPanel';
    panel.style.cssText = `
        position: fixed;
        left: -400px;
        top: 50%;
        transform: translateY(-50%);
        width: 380px;
        height: 80vh;
        background: linear-gradient(150deg, black, #1f1f1f);
        border: 2px solid #f5c518;
        border-radius: 15px;
        padding: 20px;
        z-index: 1001;
        overflow-y: auto;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        transition: left 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        
        /* Custom scrollbar styles */
        scrollbar-width: thin;
        scrollbar-color: #f5c518 transparent;
    `;
    
    // Add webkit scrollbar styles via CSS
    const style = document.createElement('style');
    style.textContent = `
        #recommendationsPanel::-webkit-scrollbar {
            width: 7px;
        }
        
        #recommendationsPanel::-webkit-scrollbar-track {
            background: transparent;
            border-radius: 10px;
        }
        
        #recommendationsPanel::-webkit-scrollbar-thumb {
            background: #f5c518;
            border-radius: 10px;
            border: none;
        }
        
        #recommendationsPanel::-webkit-scrollbar-thumb:hover {
            background: #e6b814;
        }
    `;
    document.head.appendChild(style);
    
    const header = document.createElement('div');
    header.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        border-bottom: 2px solid #f5c518;
        padding-bottom: 10px;
    `;
    
    const title = document.createElement('h3');
    title.textContent = 'Recommended';
    title.style.cssText = `
        color: #f5c518;
        margin: 0;
        font-size: 1.5rem;
        font-weight: bold;
    `;
    
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: #f5c518;
        font-size: 2rem;
        cursor: pointer;
        padding: 0;
        line-height: 1;
    `;
    
    closeBtn.addEventListener('click', () => {
        panel.style.left = '-400px';
        setTimeout(() => panel.remove(), 400);
    });
    
    header.appendChild(title);
    header.appendChild(closeBtn);
    panel.appendChild(header);
    
    // Create recommendations grid
    const grid = document.createElement('div');
    grid.style.cssText = `
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
    `;
    
    recommendations.forEach(rec => {
        const card = document.createElement('div');
        card.style.cssText = `
            background: rgba(255,255,255,0.05);
            border-radius: 10px;
            padding: 10px;
            cursor: pointer;
            transition: all 0.3s ease;
            border: 1px solid transparent;
        `;
        
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'scale(1.05)';
            card.style.borderColor = '#f5c518';
            card.style.background = 'rgba(245,197,24,0.1)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'scale(1)';
            card.style.borderColor = 'transparent';
            card.style.background = 'rgba(255,255,255,0.05)';
        });
        
        const img = document.createElement('img');
        img.src = rec.poster_path ? IMG_PATH + rec.poster_path : "https://via.placeholder.com/200x300?text=No+Image";
        img.style.cssText = `
            width: 100%;
            height: 120px;
            object-fit: cover;
            border-radius: 8px;
            margin-bottom: 8px;
        `;
        
        const recTitle = document.createElement('p');
        recTitle.textContent = (currentType === "movie" ? rec.title : rec.name) || 'Unknown Title';
        recTitle.style.cssText = `
            color: #fff;
            font-size: 0.85rem;
            margin: 0;
            text-align: center;
            font-weight: 500;
            line-height: 1.2;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
        `;
        
        const rating = document.createElement('div');
        rating.textContent = `⭐ ${rec.vote_average ? rec.vote_average.toFixed(1) : 'N/A'}`;
        rating.style.cssText = `
            color: #f5c518;
            font-size: 0.75rem;
            text-align: center;
            margin-top: 5px;
            font-weight: bold;
        `;
        
        card.appendChild(img);
        card.appendChild(recTitle);
        card.appendChild(rating);
        
        // Click to open recommendation in modal
        card.addEventListener('click', async () => {
            // Close recommendations panel
            panel.style.left = '-400px';
            setTimeout(() => panel.remove(), 400);
            
            // Store current type for the recommendation
            const recType = currentType;
            await openModal(rec);
        });
        
        grid.appendChild(card);
    });
    
    panel.appendChild(grid);
    document.body.appendChild(panel);
    
    // Animate in
    setTimeout(() => {
        panel.style.left = '20px';
    }, 100);
    
    return panel;
}

// ====================== FIXED MODAL FUNCTION ======================
async function openModal(item) {
    modal.style.display = "flex";
    modal.dataset.movieId = item.id; // store ID
    trailerEmbed.style.display = "none";
    modalImage.style.display = "block";
    modalImage.src = item.poster_path ? IMG_PATH + item.poster_path : "https://via.placeholder.com/300x450?text=No+Image";
    modalTitle.textContent = currentType === "movie" ? item.title : item.name;
    modalRating.textContent = item.vote_average ? item.vote_average.toFixed(1) : "N/A";
    
    // Get and show recommendations
    const recommendations = await getRecommendations(item);
    
    // Add or update recommendations button after reviews button but before movie size
    let recButton = document.getElementById('showRecommendations');
    if (!recButton) {
        recButton = document.createElement('button');
        recButton.id = 'showRecommendations';
        recButton.innerHTML = '<i class="fas fa-thumbs-up"></i> Recommended';
        recButton.className = 'recommendations-btn';
        recButton.style.cssText = `
            background: linear-gradient(45deg, #f5c518, #e6b800);
            color: #000;
            border: none;
            padding: 10px 15px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            margin: 5px;
            transition: all 0.3s ease;
        `;
        
        // Find the reviews button and insert after it
        const reviewsBtn = document.getElementById('openReviews');
        if (reviewsBtn && reviewsBtn.nextSibling) {
            reviewsBtn.parentNode.insertBefore(recButton, reviewsBtn.nextSibling);
        } else {
            // Fallback: append to modal actions
            const modalActions = document.querySelector('.modal-actions');
            if (modalActions) {
                modalActions.appendChild(recButton);
            }
        }
    }
    
    // Remove existing event listener and add new one
    recButton.onclick = () => {
        createRecommendationsPanel(recommendations, item);
    };
    
    // Show/hide based on recommendations availability
    if (recommendations.length > 0) {
        recButton.style.display = 'inline-block';
    } else {
        recButton.style.display = 'none';
    }
    
    // Get movie/series details to estimate size
    try {
        const url = currentType === "movie"
            ? `${BASE_URL}/movie/${item.id}?api_key=${API_KEY}&language=en-US`
            : `${BASE_URL}/tv/${item.id}?api_key=${API_KEY}&language=en-US`;
        const res = await fetch(url);
        const details = await res.json();
        
        modalGenres.textContent = `Genres: ${details.genres.map(g => g.name).join(", ")}`;
        modalRuntime.textContent = currentType === "movie" 
            ? (details.runtime || "N/A") 
            : (details.episode_run_time[0] || "N/A");
        modalOverview.textContent = details.overview || "Overview: N/A";
        
        // Estimate file size based on runtime and type
        let estimatedSize = "Unknown";
        if (currentType === "movie" && details.runtime) {
            // Estimate based on runtime (assuming ~1.5GB per hour for HD movies)
            const hours = details.runtime / 60;
            const sizeInGB = (hours * 1.5).toFixed(1);
            estimatedSize = `~${sizeInGB}GB`;
        } else if (currentType === "tv" && details.episode_run_time && details.episode_run_time[0]) {
            // Estimate based on episode runtime (assuming ~800MB per hour for TV episodes)
            const hours = details.episode_run_time[0] / 60;
            const sizeInGB = (hours * 0.8).toFixed(1);
            estimatedSize = `~${sizeInGB}GB/episode`;
        }
        
        movieSizeSpan.textContent = `Size: ${estimatedSize}`;
        
        // 🔥 FIXED TRAILER BUTTON - Works for both movies AND series
        const trailerBtn = document.getElementById("watchTrailer");
        
        // Remove any existing click handlers by cloning the element
        const newTrailerBtn = trailerBtn.cloneNode(true);
        trailerBtn.parentNode.replaceChild(newTrailerBtn, trailerBtn);
        
        newTrailerBtn.onclick = async () => {
            console.log(`Fetching trailer for ${currentType} with ID: ${item.id}`);
            
            try {
                const videosRes = await fetch(`${BASE_URL}/${currentType}/${item.id}/videos?api_key=${API_KEY}`);
                const videosData = await videosRes.json();
                
                console.log("Videos data:", videosData);
                
                const trailer = videosData.results.find(v => v.type === "Trailer" && v.site === "YouTube");
                if (trailer) {
                    console.log("Trailer found:", trailer.key);
                    
                    modalImage.style.display = "none";
                    trailerEmbed.style.display = "block";
                    trailerEmbed.innerHTML = `
                        <iframe
                            width="100%"
                            height="100%"
                            src="https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0&modestbranding=1"
                            frameborder="0"
                            allow="autoplay; encrypted-media; clipboard-write; gyroscope; picture-in-picture"
                            allowfullscreen>
                        </iframe>
                    `;
                } else {
                    console.log("No trailer found");
                    showToast("No trailer available ❌", "error");
                }
            } catch (error) {
                console.error("Error fetching trailer:", error);
                showToast("Error loading trailer ❌", "error");
            }
        };
    } catch (err) {
        console.error("Error fetching movie details:", err);
        movieSizeSpan.textContent = "Size: Unknown";
    }
    
    // Download panel elements
    const downloadPanel = document.getElementById("downloadOptions");
    
    if (currentType === "tv") {
        await showSeriesDownloads(item);
    } else {
        seriesDownloadContainer.style.display = "none";
        downloadPanel.style.display = "block";
        const currentMovieTitle = currentType === "movie" ? item.title : item.name;
        
        document.querySelectorAll(".source-btn").forEach(btn => {
            btn.onclick = () => {
                const site = btn.getAttribute("data-site");
                const query = encodeURIComponent(currentMovieTitle);
                let searchUrl = "";
                switch(site) {
                    case "waploaded": searchUrl = `https://www.waploaded.com/search?q=${query}`; break;
                    case "nkiri": searchUrl = `https://nkiri.com/?s=${query}`; break;
                    case "stagatv": searchUrl = `https://www.stagatv.com/?s=${query}`; break;
                    case "netnaija": searchUrl = `https://www.thenetnaija.net/search?t=${query}`; break;
                    case "fzmovies": searchUrl = `https://fzmovie.co.za/search.php?searchname=${query}`; break;
                    case "o2tvseries": searchUrl = `https://o2tvseries.com/search?q=${query}`; break;
                    case "toxicwap": searchUrl = `https://www.toxicwap.com/search?q=${query}`; break;
                    case "9jarocks": searchUrl = `https://www.9jarocks.com/?s=${query}`; break;
                    case "netflix": searchUrl = `https://www.netflix.com/search?q=${query}`; break;
                    case "amazon": searchUrl = `https://www.amazon.com/s?k=${query}`; break;
                }
                if (searchUrl) {
                    window.open(searchUrl, "_blank");
                    showToast(`Opening ${site.charAt(0).toUpperCase() + site.slice(1)}...`, "info");
                }
            };
        });
        
        // ✨ CHECK MOVIE AVAILABILITY AFTER SETTING UP BUTTONS
        await checkAndUpdateAvailability(item);
    }
    
    updateFavoriteButton(item);
}

// ====================== RENDER PAGINATION ======================
function renderPagination(total) {
    paginationContainer.innerHTML = "";
    const prev = document.createElement("button");
    prev.textContent = "Prev";
    prev.disabled = currentPage === 1;
    prev.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            returnItems(currentAPIUrl, currentPage);
            localStorage.setItem("currentPage", currentPage);
        }
    });
    paginationContainer.appendChild(prev);
    let maxPages = Math.min(total, 20);
    for (let i = 1; i <= maxPages; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        btn.className = "page-number";
        if (i === currentPage) btn.classList.add("active");
        btn.addEventListener("click", () => {
            currentPage = i;
            returnItems(currentAPIUrl, currentPage);
            localStorage.setItem("currentPage", currentPage);
        });
        paginationContainer.appendChild(btn);
    }
    const next = document.createElement("button");
    next.textContent = "Next";
    next.disabled = currentPage === total || currentPage === 20;
    next.addEventListener("click", () => {
        if (currentPage < total && currentPage < 20) {
            currentPage++;
            returnItems(currentAPIUrl, currentPage);
            localStorage.setItem("currentPage", currentPage);
        }
    });
    paginationContainer.appendChild(next);
}

// ====================== SEARCH ======================
form.addEventListener("submit", (e) => {
    e.preventDefault();
    const searchItem = search.value.trim();
    if (!searchItem) return;
    if (currentType === "movie") {
        currentAPIUrl = SEARCH_MOVIE + searchItem;
    } else {
        currentAPIUrl = SEARCH_SERIES + searchItem;
    }
    currentPage = 1;
    returnItems(currentAPIUrl, currentPage);
    search.value = "";
});

// ====================== TRAILER SLIDER ======================
let trailers = [];
let currentIndex = 0;
const trailerFrameWidth = "90vw";
const trailerFrameHeight = "80vh";
let trailerInterval = null;

async function returnTrailers() {
    // Clear any existing interval
    if (trailerInterval) {
        clearInterval(trailerInterval);
        trailerInterval = null;
    }
    
    trailers = [];
    trailerContainer.innerHTML = "";
    let data;
    if (currentType === "tv") {
        const res = await fetch(SERIES_API);
        data = await res.json();
    } else {
        const res = await fetch(MOVIES_API);
        data = await res.json();
    }
    const items = data.results.slice(0, 5); // Top 5 trending
    for (let item of items) {
        const videosRes = await fetch(`${BASE_URL}/${currentType}/${item.id}/videos?api_key=${API_KEY}`);
        const videosData = await videosRes.json();
        const trailer = videosData.results.find(v => v.type === "Trailer" && v.site === "YouTube");
        if (trailer) trailers.push(trailer.key);
    }
    
    if (trailers.length > 0) {
        playTrailer(currentIndex);
        
        // Set up auto-advance for trailers - INCREASED TO 3 MINUTES
        trailerInterval = setInterval(() => {
            currentIndex = (currentIndex + 1) % trailers.length;
            playTrailer(currentIndex);
        }, 180000); // Change trailer every 3 minutes (180 seconds)
    } else {
        trailerContainer.innerHTML = "<p style='color:#fff; text-align:center;'>No trailers available 😢</p>";
    }
}

async function returnSeriesTrailers() {
    // Clear any existing interval
    if (trailerInterval) {
        clearInterval(trailerInterval);
        trailerInterval = null;
    }
    
    const res = await fetch(SERIES_API);
    const data = await res.json();
    const trailerContainer = document.querySelector(".slider-container");
    trailerContainer.innerHTML = "";
    let trailers = [];
    for (let i = 0; i < 5 && i < data.results.length; i++) {
        const series = data.results[i];
        const videosRes = await fetch(`${BASE_URL}/tv/${series.id}/videos?api_key=${API_KEY}`);
        const videosData = await videosRes.json();
        const trailer = videosData.results.find(v => v.type === "Trailer" && v.site === "YouTube");
        if (trailer) trailers.push(trailer.key);
    }
    
    if (trailers.length === 0) {
        trailerContainer.innerHTML = "<p style='color:#fff; text-align:center;'>No trailers available 😢</p>";
        return;
    }
    
    let currentIndex = 0;
    
    function playTrailer(index) {
        trailerContainer.innerHTML = "";
        const iframe = document.createElement("iframe");
        iframe.width = "90vw";
        iframe.height = "80vh";
        iframe.src = `https://www.youtube.com/embed/${trailers[index]}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`;
        iframe.frameBorder = "0";
        iframe.allow = "autoplay; encrypted-media; clipboard-write; gyroscope; picture-in-picture";
        iframe.allowFullscreen = true;
        trailerContainer.appendChild(iframe);
    }
    
    playTrailer(currentIndex);
    
    // Set up auto-advance for trailers - INCREASED TO 3 MINUTES
    trailerInterval = setInterval(() => {
        currentIndex = (currentIndex + 1) % trailers.length;
        playTrailer(currentIndex);
    }, 180000); // Change trailer every 3 minutes (180 seconds)
    
    // Prev/Next buttons
    document.getElementById("prevBtn").onclick = () => {
        currentIndex = (currentIndex - 1 + trailers.length) % trailers.length;
        playTrailer(currentIndex);
        
        // Reset the interval
        clearInterval(trailerInterval);
        trailerInterval = setInterval(() => {
            currentIndex = (currentIndex + 1) % trailers.length;
            playTrailer(currentIndex);
        }, 180000);
    };
    
    document.getElementById("nextBtn").onclick = () => {
        currentIndex = (currentIndex + 1) % trailers.length;
        playTrailer(currentIndex);
        
        // Reset the interval
        clearInterval(trailerInterval);
        trailerInterval = setInterval(() => {
            currentIndex = (currentIndex + 1) % trailers.length;
            playTrailer(currentIndex);
        }, 180000);
    };
}

function playTrailer(index) {
    trailerContainer.innerHTML = "";
    const iframe = document.createElement("iframe");
    iframe.width = trailerFrameWidth;
    iframe.height = trailerFrameHeight;
    iframe.src = `https://www.youtube.com/embed/${trailers[index]}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`;
    iframe.frameBorder = "0";
    iframe.allow = "autoplay; encrypted-media; clipboard-write; gyroscope; picture-in-picture";
    iframe.allowFullscreen = true;
    trailerContainer.appendChild(iframe);
}

prevBtn.addEventListener("click", () => {
    if (trailers.length > 0) {
        currentIndex = (currentIndex - 1 + trailers.length) % trailers.length;
        playTrailer(currentIndex);
        
        // Reset the interval
        clearInterval(trailerInterval);
        trailerInterval = setInterval(() => {
            currentIndex = (currentIndex + 1) % trailers.length;
            playTrailer(currentIndex);
        }, 180000);
    }
});

nextBtn.addEventListener("click", () => {
    if (trailers.length > 0) {
        currentIndex = (currentIndex + 1) % trailers.length;
        playTrailer(currentIndex);
        
        // Reset the interval
        clearInterval(trailerInterval);
        trailerInterval = setInterval(() => {
            currentIndex = (currentIndex + 1) % trailers.length;
            playTrailer(currentIndex);
        }, 180000);
    }
});

const tag = document.createElement("script");
tag.src = "https://www.youtube.com/iframe_api";
document.body.appendChild(tag);

// ====================== ENHANCED SERIES DOWNLOAD WITH AVAILABILITY ======================
async function showSeriesDownloads(tvShow) {
    if (currentType !== "tv") {
        seriesDownloadContainer.style.display = "none";
        return;
    }
    try {
        const res = await fetch(`${BASE_URL}/tv/${tvShow.id}?api_key=${API_KEY}&language=en-US`);
        const data = await res.json();
        seasonsList.innerHTML = "";
        seriesDownloadContainer.style.display = "block";
        // Position the container
        seriesDownloadContainer.style.position = "fixed";
        seriesDownloadContainer.style.top = "100px";
        seriesDownloadContainer.style.right = "20px";
        seriesDownloadContainer.style.width = "320px";
        seriesDownloadContainer.style.maxHeight = "20rem";
        seriesDownloadContainer.style.overflowY = "auto";
        seriesDownloadContainer.style.zIndex = "999";
        seriesDownloadContainer.style.transition = "transform 0.3s ease";
        seriesDownloadContainer.style.transform = "translateY(0)";
        // Movie source panel
        const downloadOptions = document.getElementById("downloadOptions");
        downloadOptions.style.display = "none";
        downloadOptions.style.position = "fixed";
        downloadOptions.style.bottom = "20px";
        downloadOptions.style.right = "20px";
        downloadOptions.style.width = "350px";
        downloadOptions.style.zIndex = "998";
        // Back button for episode downloads
        if (!document.getElementById("backToEpisodes")) {
            const backBtn = document.createElement("button");
            backBtn.id = "backToEpisodes";
            backBtn.innerHTML = "← Back";
            backBtn.style.cssText = `
                color: #f5c518;
                background: rgba(245,197,24,0.1);
                border: 1px solid #f5c518;
                padding: 0.5rem 1rem;
                border-radius: 4px;
                font-size: 0.9rem;
                cursor: pointer;
                margin-bottom: 10px;
                width: 100%;
                transition: all 0.3s ease;
            `;
            
            backBtn.addEventListener('mouseenter', () => {
                backBtn.style.background = 'rgba(245,197,24,0.2)';
            });
            
            backBtn.addEventListener('mouseleave', () => {
                backBtn.style.background = 'rgba(245,197,24,0.1)';
            });
            
            downloadOptions.prepend(backBtn);
            backBtn.addEventListener("click", () => {
                downloadOptions.style.display = "none";
                seriesDownloadContainer.style.transform = "translateY(0)";
                document.querySelectorAll(".episode-btn").forEach(btn => btn.classList.remove("active-episode"));
            });
        }
        data.seasons.forEach((season, seasonIndex) => {
            const seasonBox = document.createElement("div");
            seasonBox.className = "season-box";
            const seasonTitle = document.createElement("div");
            seasonTitle.textContent = `${season.name} (${season.episode_count} eps)`;
            seasonTitle.className = "season-title";
            seasonTitle.style.cursor = "pointer";
            const episodesContainer = document.createElement("div");
            episodesContainer.className = "episodes-container";
            episodesContainer.style.display = "none";
            episodesContainer.style.maxHeight = "25vh";
            episodesContainer.style.overflowY = "auto";
            for (let ep = 1; ep <= season.episode_count; ep++) {
                const epBtn = document.createElement("button");
                epBtn.className = "episode-btn";
                epBtn.textContent = `Episode ${ep}`;
                epBtn.dataset.title = `${tvShow.name} Season ${season.season_number} Episode ${ep}`;
                epBtn.style.transition = "background 0.3s";
                episodesContainer.appendChild(epBtn);
                epBtn.addEventListener("click", async () => {
                    document.querySelectorAll(".episode-btn").forEach(btn => {
                        btn.classList.remove("active-episode");
                        btn.style.background = "";
                        btn.style.color = "";
                    });
                    epBtn.classList.add("active-episode");
                    epBtn.style.backgroundColor = "#f5c518";
                    epBtn.style.color = "#000";
                    downloadOptions.style.display = "block";
                    seriesDownloadContainer.style.transform = "translateY(20rem)";
                    const episodeTitle = document.getElementById("episodeTitle");
                    if (episodeTitle) episodeTitle.textContent = epBtn.dataset.title;
                    // Create episode item for availability check
                    const episodeItem = {
                        title: tvShow.name, // Use series name for better search results
                        name: tvShow.name,
                        first_air_date: tvShow.first_air_date,
                        season_number: season.season_number,
                        episode_number: ep
                    };
                    
                    // Set up download buttons first
                    document.querySelectorAll(".source-btn").forEach(btn => {
                        const site = btn.getAttribute("data-site");
                        const originalOnClick = () => {
                            let query = "";
                            let searchUrl = "";
                            switch(site) {
                                case "waploaded":
                                    query = encodeURIComponent(`${tvShow.name} Season ${season.season_number} Episode ${ep}`);
                                    searchUrl = `https://www.waploaded.com/search?q=${query}`;
                                    break;
                                case "nkiri":
                                    query = encodeURIComponent(`${tvShow.name} Season ${season.season_number} Episode ${ep}`);
                                    searchUrl = `https://nkiri.com/?s=${query}`;
                                    break;
                                case "stagatv":
                                    query = encodeURIComponent(`${tvShow.name} Season ${season.season_number} Episode ${ep}`);
                                    searchUrl = `https://www.stagatv.com/?s=${query}`;
                                    break;
                                case "netnaija":
                                    query = encodeURIComponent(`${tvShow.name} Season ${season.season_number} Episode ${ep}`);
                                    searchUrl = `https://www.thenetnaija.net/search?t=${query}`;
                                    break;
                                case "fzmovies":
                                    query = encodeURIComponent(`${tvShow.name} Season ${season.season_number}`);
                                    searchUrl = `https://fzmovie.co.za/search.php?searchname=${query}`;
                                    break;
                                case "o2tvseries":
                                    query = encodeURIComponent(`${tvShow.name} Season ${season.season_number}`);
                                    searchUrl = `https://o2tvseries.com/search?q=${query}`;
                                    break;
                                case "toxicwap":
                                    query = encodeURIComponent(`${tvShow.name} Season ${season.season_number} Episode ${ep}`);
                                    searchUrl = `https://www.toxicwap.com/search?q=${query}`;
                                    break;
                                case "9jarocks":
                                    query = encodeURIComponent(`${tvShow.name} Season ${season.season_number} Episode ${ep}`);
                                    searchUrl = `https://www.9jarocks.com/?s=${query}`;
                                    break;
                                case "netflix":
                                    query = encodeURIComponent(`${tvShow.name} Season ${season.season_number}`);
                                    searchUrl = `https://www.netflix.com/search?q=${query}`;
                                    break;
                                case "amazon":
                                    query = encodeURIComponent(`${tvShow.name} Season ${season.season_number}`);
                                    searchUrl = `https://www.amazon.com/s?k=${query}`;
                                    break;
                            }
                            if (searchUrl) {
                                window.open(searchUrl, "_blank");
                                showToast(`Opening ${site.charAt(0).toUpperCase() + site.slice(1)}...`, "info");
                            }
                        };
                        
                        btn.onclick = originalOnClick;
                    });
                    
                    // Check availability for this specific episode
                    await checkAndUpdateAvailability(episodeItem);
                });
            }
            seasonTitle.addEventListener("click", () => {
                document.querySelectorAll(".episodes-container").forEach(ec => {
                    if (ec !== episodesContainer) ec.style.display = "none";
                });
                episodesContainer.style.display = episodesContainer.style.display === "block" ? "none" : "block";
            });
            seasonBox.appendChild(seasonTitle);
            seasonBox.appendChild(episodesContainer);
            seasonsList.appendChild(seasonBox);
        });
    } catch (err) {
        console.error(err);
        seriesDownloadContainer.style.display = "none";
        showToast("Error loading series data", "error");
    }
}

// ====================== CLOSE MODAL ======================
closeModal.addEventListener("click", () => {
    modal.style.display = "none";
    modalImage.style.display = "block";
    trailerEmbed.style.display = "none";
    trailerEmbed.innerHTML = "";
    
    // Close recommendations panel if open
    const recPanel = document.getElementById('recommendationsPanel');
    if (recPanel) {
        recPanel.style.left = '-400px';
        setTimeout(() => recPanel.remove(), 400);
    }
});

window.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
        modalImage.style.display = "block";
        trailerEmbed.style.display = "none";
        trailerEmbed.innerHTML = "";
        
        // Close recommendations panel if open
        const recPanel = document.getElementById('recommendationsPanel');
        if (recPanel) {
            recPanel.style.left = '-400px';
            setTimeout(() => recPanel.remove(), 400);
        }
    }
});

// ====================== FAVORITES ======================
let movieFavorites = JSON.parse(localStorage.getItem("movieFavorites")) || [];
let seriesFavorites = JSON.parse(localStorage.getItem("seriesFavorites")) || [];
const section = document.getElementById("section");
const pagination = document.getElementById("pagination");
const trailerSlider = document.getElementById("trailer-slider");
const favoritesContainer = document.getElementById("favoritesContainer");
let currentTypes = "movie";

function updateFavoriteButton(item) {
    const favorites = currentType === "movie" ? movieFavorites : seriesFavorites;
    const title = currentType === "movie" ? item.title : item.name;
    const isFav = favorites.some(f => f.title === title);
    
    addFavoriteBtn.innerHTML = isFav ? '<i class="fas fa-heart"></i> Favorite' : '<i class="fas fa-heart"></i> Add Favorite';
    if (isFav) addFavoriteBtn.classList.add("favorited");
    else addFavoriteBtn.classList.remove("favorited");
}

addFavoriteBtn.addEventListener("click", () => {
    const title = modalTitle.textContent;
    const poster = modalImage.src;
    
    let favorites = currentType === "movie" ? movieFavorites : seriesFavorites;
    const index = favorites.findIndex(f => f.title === title);
    if (index > -1) {
        favorites.splice(index, 1);
        addFavoriteBtn.innerHTML = '<i class="fas fa-heart"></i> Add Favorite';
        addFavoriteBtn.classList.remove("favorited");
    } else {
        favorites.push({ title, poster, type: currentType });
        addFavoriteBtn.innerHTML = '<i class="fas fa-heart"></i> Favorite';
        addFavoriteBtn.classList.add("favorited");
    }
    if (currentType === "movie") {
        movieFavorites = favorites;
        localStorage.setItem("movieFavorites", JSON.stringify(movieFavorites));
    } else {
        seriesFavorites = favorites;
        localStorage.setItem("seriesFavorites", JSON.stringify(seriesFavorites));
    }
    renderFavorites();
});

// ====================== ENHANCED FAVORITES WITH RECOMMENDATIONS ======================
async function renderFavorites() {
    favoritesContainer.style.paddingTop = "2rem";
    favoritesContainer.style.display = "flex";
    favoritesContainer.style.flexDirection = "column";
    favoritesContainer.innerHTML = "";
    const allFavorites = [...movieFavorites, ...seriesFavorites];
    
    if (allFavorites.length > 0) {
        const headerDiv = document.createElement("div");
        headerDiv.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            width: 90%;
        `;
        
        const favTitle = document.createElement("h2");
        favTitle.textContent = "Your Favorites";
        favTitle.style.cssText = `
            color: #f5c518;
            font-size: 2.5rem;
            margin: 0;
        `;
        
        const clearBtn = document.createElement("button");
        clearBtn.innerHTML = '<i class="fas fa-trash"></i> Clear All';
        clearBtn.style.cssText = `
            background: linear-gradient(45deg, #ff4444, #cc0000);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 0.8rem 1.5rem;
            cursor: pointer;
            font-weight: bold;
            font-size: 1.2rem;
            transition: all 0.3s ease;
        `;
        
        clearBtn.addEventListener('mouseenter', () => {
            clearBtn.style.transform = 'scale(1.05)';
            clearBtn.style.boxShadow = '0 5px 15px rgba(255,68,68,0.4)';
        });
        
        clearBtn.addEventListener('mouseleave', () => {
            clearBtn.style.transform = 'scale(1)';
            clearBtn.style.boxShadow = 'none';
        });
        
        clearBtn.addEventListener("click", () => {
            if (confirm('Are you sure you want to clear all favorites?')) {
                movieFavorites = [];
                seriesFavorites = [];
                localStorage.setItem("movieFavorites", JSON.stringify(movieFavorites));
                localStorage.setItem("seriesFavorites", JSON.stringify(seriesFavorites));
                renderFavorites();
            }
        });
        
        headerDiv.appendChild(favTitle);
        headerDiv.appendChild(clearBtn);
        favoritesContainer.appendChild(headerDiv);
        
        // Add recommendation section
        await addFavoritesRecommendations(allFavorites);
    }
    if (allFavorites.length === 0) {
        favoritesContainer.innerHTML = `
            <div style="text-align: center; margin-top: 10rem;">
                <h1 style="color:#f5c518; font-size:4rem; margin-bottom: 1rem;">No Favorites Yet 😿</h1>
                <p style="color:#fff; font-size:1.2rem;">Start adding movies and series to your favorites!</p>
            </div>
        `;
        return;
    }
    allFavorites.forEach((fav, index) => {
        const card = document.createElement("div");
        card.className = "favorite-card";
        card.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 1rem;
            width: 90%;
            margin-bottom: 1rem;
            background: ${index % 2 === 0 ? 'linear-gradient(135deg, #1a1a2e, #16213e)' : 'linear-gradient(135deg, #16213e, #0f0f23)'};
            border-radius: 15px;
            border: 1px solid rgba(245,197,24,0.2);
            transition: all 0.3s ease;
            cursor: pointer;
        `;
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-2px)';
            card.style.boxShadow = '0 10px 25px rgba(245,197,24,0.2)';
            card.style.borderColor = '#f5c518';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = 'none';
            card.style.borderColor = 'rgba(245,197,24,0.2)';
        });
        const leftDiv = document.createElement("div");
        leftDiv.style.cssText = `
            display: flex;
            align-items: center;
            gap: 1.5rem;
        `;
        const img = document.createElement("img");
        img.src = fav.poster;
        img.style.cssText = `
            width: 100px;
            height: 150px;
            object-fit: cover;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        `;
        const infoDiv = document.createElement("div");
        
        const title = document.createElement("div");
        title.textContent = fav.title;
        title.style.cssText = `
            color: #f5c518;
            font-weight: bold;
            font-size: 1.3rem;
            margin-bottom: 0.5rem;
        `;
        
        const typeLabel = document.createElement("div");
        typeLabel.textContent = fav.type === 'movie' ? '🎬 Movie' : '📺 Series';
        typeLabel.style.cssText = `
            color: #888;
            font-size: 0.9rem;
            margin-bottom: 0.5rem;
        `;
        infoDiv.appendChild(title);
        infoDiv.appendChild(typeLabel);
        leftDiv.appendChild(img);
        leftDiv.appendChild(infoDiv);
        const rightDiv = document.createElement("div");
        rightDiv.style.cssText = `
            display: flex;
            align-items: center;
            gap: 1rem;
        `;
        const infoBtn = document.createElement("button");
        infoBtn.innerHTML = '<i class="fas fa-info-circle"></i>';
        infoBtn.title = 'View Details';
        infoBtn.style.cssText = `
            background: linear-gradient(45deg, #f5c518, #e6b800);
            color: #000;
            border: none;
            border-radius: 50%;
            width: 45px;
            height: 45px;
            cursor: pointer;
            font-size: 1.2rem;
            transition: all 0.3s ease;
        `;
        
        infoBtn.addEventListener('mouseenter', () => {
            infoBtn.style.transform = 'scale(1.1)';
            infoBtn.style.boxShadow = '0 5px 15px rgba(245,197,24,0.4)';
        });
        
        infoBtn.addEventListener('mouseleave', () => {
            infoBtn.style.transform = 'scale(1)';
            infoBtn.style.boxShadow = 'none';
        });
        
        infoBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            openModalWithFavorite(fav);
        });
        const delBtn = document.createElement("button");
        delBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
        delBtn.title = 'Remove from Favorites';
        delBtn.style.cssText = `
            background: linear-gradient(45deg, #ff4444, #cc0000);
            color: white;
            border: none;
            border-radius: 50%;
            width: 45px;
            height: 45px;
            cursor: pointer;
            font-size: 1.2rem;
            transition: all 0.3s ease;
        `;
        
        delBtn.addEventListener('mouseenter', () => {
            delBtn.style.transform = 'scale(1.1)';
            delBtn.style.boxShadow = '0 5px 15px rgba(255,68,68,0.4)';
        });
        
        delBtn.addEventListener('mouseleave', () => {
            delBtn.style.transform = 'scale(1)';
            delBtn.style.boxShadow = 'none';
        });
        
        delBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (fav.type === "movie") {
                movieFavorites = movieFavorites.filter(f => f.title !== fav.title);
                localStorage.setItem("movieFavorites", JSON.stringify(movieFavorites));
            } else {
                seriesFavorites = seriesFavorites.filter(f => f.title !== fav.title);
                localStorage.setItem("seriesFavorites", JSON.stringify(seriesFavorites));
            }
            renderFavorites();
        });
        rightDiv.appendChild(infoBtn);
        rightDiv.appendChild(delBtn);
        card.appendChild(leftDiv);
        card.appendChild(rightDiv);
        // Click card to view details
        card.addEventListener("click", () => {
            openModalWithFavorite(fav);
        });
        favoritesContainer.appendChild(card);
    });
}

// ====================== FAVORITES RECOMMENDATIONS ======================
async function addFavoritesRecommendations(favorites) {
    if (favorites.length === 0) return;
    
    const recSection = document.createElement("div");
    recSection.style.cssText = `
        width: 90%;
        margin: 2rem 0;
        padding: 2rem;
        background: linear-gradient(135deg, rgba(245,197,24,0.1), rgba(245,197,24,0.05));
        border-radius: 20px;
        border: 2px solid rgba(245,197,24,0.3);
    `;
    
    const recTitle = document.createElement("h3");
    recTitle.textContent = "";
    const icon = document.createElement('i');
    icon.className = 'fas fa-film';
    recTitle.appendChild(icon);
    // Add a space and the text
    recTitle.appendChild(document.createTextNode(' Recommended For You'));
    recTitle.style.cssText = `
        color: #f5c518;
        font-size: 2rem;
        margin-bottom: 1.5rem;
        text-align: center;
    `;
    
    recSection.appendChild(recTitle);
    
    try {
        // Get genres from favorites
        const favoriteGenres = new Set();
        for (let fav of favorites.slice(0, 3)) { // Use first 3 favorites
            try {
                const searchAPI = fav.type === "movie" ? SEARCH_MOVIE : SEARCH_SERIES;
                const searchRes = await fetch(searchAPI + encodeURIComponent(fav.title));
                const searchData = await searchRes.json();
                
                if (searchData.results && searchData.results[0]) {
                    const item = searchData.results[0];
                    if (item.genre_ids) {
                        item.genre_ids.forEach(genreId => favoriteGenres.add(genreId));
                    }
                }
            } catch (e) {
                console.log('Error getting genres for:', fav.title);
            }
        }
        
        if (favoriteGenres.size > 0) {
            const genreArray = Array.from(favoriteGenres).slice(0, 3);
            const genreIds = genreArray.join(',');
            
            // Get recommendations based on favorite genres
            const recURL = `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreIds}&sort_by=popularity.desc&page=1`;
            const recRes = await fetch(recURL);
            const recData = await recRes.json();
            
            if (recData.results && recData.results.length > 0) {
                const recGrid = document.createElement("div");
                recGrid.style.cssText = `
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 2rem;
                    margin-top: 1.5rem;
                `;
                
                recData.results.slice(0, 6).forEach(rec => {
                    const recCard = document.createElement("div");
                    recCard.style.cssText = `
                        background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
                        border-radius: 15px;
                        padding: 1.5rem;
                        text-align: center;
                        cursor: pointer;
                        transition: all 0.4s ease;
                        border: 2px solid transparent;
                    `;
                    
                    recCard.addEventListener('mouseenter', () => {
                        recCard.style.transform = 'translateY(-10px) scale(1.02)';
                        recCard.style.borderColor = '#f5c518';
                        recCard.style.background = 'linear-gradient(135deg, rgba(245,197,24,0.2), rgba(245,197,24,0.1))';
                        recCard.style.boxShadow = '0 15px 30px rgba(245,197,24,0.3)';
                    });
                    
                    recCard.addEventListener('mouseleave', () => {
                        recCard.style.transform = 'translateY(0) scale(1)';
                        recCard.style.borderColor = 'transparent';
                        recCard.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))';
                        recCard.style.boxShadow = 'none';
                    });
                    
                    const recImg = document.createElement("img");
                    recImg.src = rec.poster_path ? IMG_PATH + rec.poster_path : "https://via.placeholder.com/300x450?text=No+Image";
                    recImg.style.cssText = `
                        width: 100%;
                        height: 250px;
                        object-fit: cover;
                        border-radius: 10px;
                        margin-bottom: 1rem;
                        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                    `;
                    
                    const recTitleEl = document.createElement("h4");
                    recTitleEl.textContent = rec.title || rec.name;
                    recTitleEl.style.cssText = `
                        color: #fff;
                        margin: 0.5rem 0;
                        font-size: 1.1rem;
                        font-weight: bold;
                    `;
                    
                    const recRating = document.createElement("p");
                    recRating.textContent = `⭐ ${rec.vote_average ? rec.vote_average.toFixed(1) : 'N/A'}/10`;
                    recRating.style.cssText = `
                        color: #f5c518;
                        margin: 0;
                        font-weight: bold;
                    `;
                    
                    recCard.appendChild(recImg);
                    recCard.appendChild(recTitleEl);
                    recCard.appendChild(recRating);
                    
                    recCard.addEventListener('click', async () => {
                        currentType = "movie"; // Set type for recommendation
                        await openModal(rec);
                    });
                    
                    recGrid.appendChild(recCard);
                });
                
                recSection.appendChild(recGrid);
            }
        }
    } catch (error) {
        console.error('Error fetching recommendations:', error);
    }
    
    favoritesContainer.appendChild(recSection);
}

function openModalWithFavorite(fav) {
    modal.style.display = "flex";
    modalTitle.textContent = fav.title;
    modalImage.src = fav.poster;
    currentTypes = fav.type;
    currentType = fav.type;
    const favorites = currentType === "movie" ? movieFavorites : seriesFavorites;
    const isFav = favorites.some(f => f.title === fav.title);
    addFavoriteBtn.innerHTML = isFav ? '<i class="fas fa-heart"></i> Favorite' : '<i class="fas fa-heart"></i> Add Favorite';
    if (isFav) addFavoriteBtn.classList.add("favorited");
    else addFavoriteBtn.classList.remove("favorited");
}

// ====================== TAB SWITCHING WITH TRAILER STOP ======================
function removeActive() {
    const navLinks = document.querySelectorAll(".topnav .menu a");
    navLinks.forEach(link => link.classList.remove("active"));
}

moviesTab.addEventListener("click", (e) => {
    e.preventDefault();
    currentType = "movie";
    currentAPIUrl = MOVIES_API;
    currentPage = 1;
    returnItems(currentAPIUrl, currentPage);
    section.style.display = "flex";
    pagination.style.display = "flex";
    trailerSlider.style.display = "flex";
    favoritesContainer.style.display = "none";
    removeActive();
    moviesTab.classList.add("active");
    localStorage.setItem("currentType", currentType);
    localStorage.setItem("currentPage", currentPage);
    localStorage.setItem("activeTab", "movies");
    returnTrailers();
});

seriesTab.addEventListener("click", (e) => {
    e.preventDefault();
    currentType = "tv";
    currentAPIUrl = SERIES_API;
    currentPage = 1;
    returnItems(currentAPIUrl, currentPage);
    section.style.display = "flex";
    pagination.style.display = "flex";
    trailerSlider.style.display = "block";
    favoritesContainer.style.display = "none";
    removeActive();
    seriesTab.classList.add("active");
    localStorage.setItem("currentType", currentType);
    localStorage.setItem("currentPage", currentPage);
    localStorage.setItem("activeTab", "series");
    returnSeriesTrailers();
});

favoritesTab.addEventListener("click", (e) => {
    e.preventDefault();
    
    // STOP ALL TRAILERS WHEN SWITCHING TO FAVORITES
    stopAllTrailers();
    
    section.style.display = "none";
    pagination.style.display = "none";
    trailerSlider.style.display = "none";
    favoritesContainer.style.display = "flex";
    favoritesContainer.style.flexDirection = "column";
    favoritesContainer.style.alignItems = "center";
    favoritesContainer.style.justifyContent = "flex-start";
    favoritesContainer.style.minHeight = "70vh";
    favoritesContainer.style.gap = "1rem";
    removeActive();
    favoritesTab.classList.add("active");
    localStorage.setItem("activeTab", "favorites");
    renderFavorites();
});

// ====================== REVIEWS ======================
submitReviewBtn.addEventListener("click", () => {
    const reviewText = reviewInput.value.trim();
    if (!reviewText) return showToast("Failed ❌ - Empty Review", "error");
    const currentMovieTitle = modalTitle.textContent;
    const reviewItem = document.createElement("div");
    reviewItem.className = "review-bubble";
    reviewItem.innerHTML = `<strong>${currentMovieTitle}</strong>${reviewText}`;
    allReviewsList.appendChild(reviewItem);
    allReviewsList.scrollTo({
        top: allReviewsList.scrollHeight,
        behavior: "smooth"
    });
    reviewInput.value = "";
    reviewsPopup.classList.add("show");
    showToast("Review Submitted ✅", "success");
});

openReviewsBtn.addEventListener("click", () => reviewsPopup.classList.add("show"));
backToMovieBtn.addEventListener("click", () => reviewsPopup.classList.remove("show"));

// ====================== DOWNLOAD HANDLING ======================
const downloadBtn = document.getElementById("downloadMovie");
const downloadPanel = document.getElementById("downloadOptions");
if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
        downloadPanel.classList.toggle("active");
    });
}

function openDownload(url) {
    const newTab = window.open(url, "_blank");
    if (!newTab) {
        showToast("❌ File not found or popup blocked!", "error");
        return;
    }
    showToast("Attempting download...", "success");
}

// ====================== SMART SEARCH & AUTOCOMPLETE ======================
const suggestionsContainer = document.createElement("div");
suggestionsContainer.id = "searchSuggestions";
suggestionsContainer.style.position = "absolute";
suggestionsContainer.style.backgroundColor = "#1f1f1f";
suggestionsContainer.style.color = "#fff";
suggestionsContainer.style.width = search.offsetWidth + "px";
suggestionsContainer.style.zIndex = "1000";
suggestionsContainer.style.border = "1px solid #f5c518";
suggestionsContainer.style.display = "none";
search.parentNode.appendChild(suggestionsContainer);

search.addEventListener("input", async () => {
    const query = search.value.trim();
    suggestionsContainer.innerHTML = "";
    if (!query) {
        suggestionsContainer.style.display = "none";
        return;
    }
    try {
        const searchAPI = currentType === "movie" ? SEARCH_MOVIE : SEARCH_SERIES;
        const res = await fetch(searchAPI + encodeURIComponent(query));
        const data = await res.json();
        if (data.results.length > 0) {
            data.results.slice(0, 5).forEach(item => {
                const div = document.createElement("div");
                div.textContent = currentType === "movie" ? item.title : item.name;
                div.style.padding = "5px 10px";
                div.style.cursor = "pointer";
                
                div.addEventListener("click", () => {
                    search.value = currentType === "movie" ? item.title : item.name;
                    suggestionsContainer.style.display = "none";
                    
                    currentAPIUrl = searchAPI + encodeURIComponent(search.value);
                    currentPage = 1;
                    returnItems(currentAPIUrl, currentPage);
                    search.value = "";
                });
                
                div.addEventListener("mouseover", () => div.style.backgroundColor = "#f5c518");
                div.addEventListener("mouseout", () => div.style.backgroundColor = "transparent");
                
                suggestionsContainer.appendChild(div);
            });
            suggestionsContainer.style.display = "block";
        } else {
            suggestionsContainer.style.display = "none";
        }
    } catch (error) {
        console.error("Search suggestion error:", error);
        suggestionsContainer.style.display = "none";
    }
});

// Close suggestions when clicking outside
document.addEventListener("click", e => {
    if (!suggestionsContainer.contains(e.target) && e.target !== search) {
        suggestionsContainer.style.display = "none";
    }
});

// ====================== EPISODE SEARCH FORMATS ======================
function getEpisodeSearchFormats(tvShowName, seasonNumber, epNumber) {
    const formats = [
        `${tvShowName} S${seasonNumber.toString().padStart(2,'0')}E${epNumber}`,
        `${tvShowName} ${seasonNumber}x${epNumber}`,
        `${tvShowName} Season ${seasonNumber} Episode ${epNumber}`,
        `${tvShowName} Season ${seasonNumber}`
    ];
    return formats;
}

// ====================== INITIALIZATION ======================
document.addEventListener("DOMContentLoaded", () => {
    // Load saved state
    const savedType = localStorage.getItem("currentType") || "movie";
    const savedPage = parseInt(localStorage.getItem("currentPage")) || 1;
    const activeTab = localStorage.getItem("activeTab") || "movies";
    currentType = savedType;
    currentPage = savedPage;
    currentAPIUrl = currentType === "movie" ? MOVIES_API : SERIES_API;
    
    // Set active tab
    removeActive();
    if (activeTab === "favorites") {
        favoritesTab.classList.add("active");
        favoritesTab.click();
    } else if (activeTab === "series") {
        seriesTab.classList.add("active");
        currentType = "tv";
        currentAPIUrl = SERIES_API;
    } else {
        moviesTab.classList.add("active");
        currentType = "movie";
        currentAPIUrl = MOVIES_API;
    }
    
    // Initialize the app
    returnItems(currentAPIUrl, currentPage);
    returnTrailers();
    
    // Load favorites
    renderFavorites();
});

// ====================== PERSISTENCE HANDLING ======================
function loadFavorites() {
    const savedFavorites = JSON.parse(localStorage.getItem("favorites")) || [];
    return savedFavorites;
}

function displayReview(reviewItem) {
    const reviewDiv = document.createElement("div");
    reviewDiv.className = "review-bubble";
    reviewDiv.innerHTML = `<strong>${reviewItem.title}</strong>: ${reviewItem.text}`;
    allReviewsList.appendChild(reviewDiv);
    allReviewsList.scrollTo({ top: allReviewsList.scrollHeight, behavior: "smooth" });
}

// Load existing reviews on page load
document.addEventListener("DOMContentLoaded", () => {
    const reviews = JSON.parse(localStorage.getItem("reviews")) || [];
    reviews.forEach(review => displayReview(review));
});

// Enhanced review submission with persistence
if (submitReviewBtn) {
    submitReviewBtn.addEventListener("click", () => {
        const reviewText = reviewInput.value.trim();
        if (!reviewText) return showToast("Failed ❌ - Empty Review", "error");
        const reviews = JSON.parse(localStorage.getItem("reviews")) || [];
        const reviewItem = { title: modalTitle.textContent, text: reviewText };
        reviews.push(reviewItem);
        localStorage.setItem("reviews", JSON.stringify(reviews));
        displayReview(reviewItem);
        reviewInput.value = "";
        reviewsPopup.classList.add("show");
        showToast("Review Submitted ✅", "success");
    });
}