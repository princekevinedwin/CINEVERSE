const API_KEY = "3c1a2f72d6fdb0c8cdf454c4996353af";
const BASE_URL = "https://api.themoviedb.org/3";
const MOVIES_API = `${BASE_URL}/discover/movie?sort_by=popularity.desc&api_key=${API_KEY}`;
const SERIES_API = `${BASE_URL}/discover/tv?sort_by=popularity.desc&api_key=${API_KEY}`;
const IMG_PATH = "https://image.tmdb.org/t/p/w1280";
const SEARCH_MOVIE = `${BASE_URL}/search/movie?&api_key=${API_KEY}&query=`;
const SEARCH_SERIES = `${BASE_URL}/search/tv?&api_key=${API_KEY}&query=`;
// News API (using the provided APItube API)
const NEWS_API_KEY = "api_live_pzfpHxqjMmq9tRle4GpyebEhkt46bAWMnor4xu61MlSldy8EFfZM";
const NEWS_API_URL = "https://apitube.org/v1/news";
// Additional news APIs
const NEWSAPI_KEY = "8602accfad284b4e9ee12b8a9f4319a0"; // Updated NewsAPI key
const GNEWS_API_KEY = "d4ea11c49c7766c92e887b415c857790"; // Replace with your actual GNews key
// ====================== MULTIPLE CORS PROXIES ======================
const CORS_PROXIES = [
    'https://api.allorigins.win/raw?url=',
    'https://cors-anywhere.herokuapp.com/',
    'https://thingproxy.freeboard.io/fetch/',
    'https://yacdn.org/proxy/',
    'https://api.codetabs.com/v1/proxy?quest='
];
// ====================== ENHANCED SITE CONFIGS ======================
const SITE_CONFIGS = {
    waploaded: {
        searchUrl: (query) => `https://www.waploaded.com/search?q=${encodeURIComponent(query)}`,
        availabilityIndicators: ['.post-title', '.entry-title', '.movie-item', '.title', 'h1', 'h2', 'h3'],
        timeout: 15000,
        exactMatchSelectors: ['.post-title a', '.entry-title a', '.movie-item a'],
        contentPatterns: ['download', 'watch', 'mp4', 'mkv', 'hd']
    },
    nkiri: {
        searchUrl: (query) => `https://nkiri.com/?s=${encodeURIComponent(query)}`,
        availabilityIndicators: ['.post-title', '.entry-title', 'h2 a', '.title'],
        timeout: 15000,
        exactMatchSelectors: ['.post-title a', 'h2 a'],
        contentPatterns: ['download', 'watch', 'mp4', 'mkv']
    },
    stagatv: {
        searchUrl: (query) => `https://www.stagatv.com/?s=${encodeURIComponent(query)}`,
        availabilityIndicators: ['.post-title', '.entry-title', '.movie-title', '.title'],
        timeout: 15000,
        exactMatchSelectors: ['.post-title a', '.movie-title a'],
        contentPatterns: ['download', 'watch', 'mp4', 'mkv']
    },
    netnaija: {
        searchUrl: (query) => `https://www.thenetnaija.net/search?t=${encodeURIComponent(query)}`,
        availabilityIndicators: ['.post-title', '.entry-title', '.movie-link', '.title'],
        timeout: 15000,
        exactMatchSelectors: ['.post-title a', '.movie-link a'],
        contentPatterns: ['download', 'mp4', 'mkv', 'hd']
    },
    fzmovies: {
        searchUrl: (query) => `https://fzmovie.co.za/search.php?searchname=${encodeURIComponent(query)}`,
        availabilityIndicators: ['.mainbox', '.movie-title', 'td a', '.title', '.movies-list', '.content', '.post', '.movie-item', '.entry-content', '.search-result'],
        timeout: 20000,
        exactMatchSelectors: ['.movie-title a', 'td a', '.post a', '.movie-item a', '.entry-content a', '.search-result a'],
        contentPatterns: ['download', 'mp4', 'mkv', 'bluray', 'hdrip'],
        customHandler: async (html, query) => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Clean the query for better matching
            const cleanQuery = query.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
            const queryWords = cleanQuery.split(' ').filter(word => word.length > 2);
            
            // Look for direct links with the movie title
            const links = doc.querySelectorAll('a');
            for (const link of links) {
                const linkText = link.textContent.toLowerCase();
                const cleanLinkText = linkText.replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
                const href = link.getAttribute('href') || '';
                
                // Check if the link contains the movie title (flexible matching)
                if (cleanLinkText.includes(cleanQuery) || cleanQuery.includes(cleanLinkText)) {
                    // Check if it's a movie link
                    if (href.includes('movie') || href.includes('download') || href.includes('watch') || 
                        href.includes('2025') || href.includes('2024') || href.includes('2023')) {
                        return true;
                    }
                }
            }
            
            // Look for search result containers
            const searchResults = doc.querySelectorAll('.mainbox, .search-result, .movie-item, .movies-list, .content, .post');
            for (const result of searchResults) {
                const resultText = result.textContent.toLowerCase();
                const cleanResultText = resultText.replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
                
                if (cleanResultText.includes(cleanQuery)) {
                    return true;
                }
            }
            
            // Check for individual word matches
            const bodyText = doc.body.textContent.toLowerCase();
            const cleanBodyText = bodyText.replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
            
            let matchCount = 0;
            for (const word of queryWords) {
                if (cleanBodyText.includes(word)) {
                    matchCount++;
                }
            }
            
            // Require at least 50% of words to match
            const requiredMatches = Math.max(1, Math.ceil(queryWords.length * 0.5));
            if (matchCount >= requiredMatches) {
                return true;
            }
            
            // Check for any mention of the movie title
            if (cleanBodyText.includes(cleanQuery)) {
                // Make sure it's not in a "no results" message
                const noResultsTexts = ['no results', 'not found', '0 results', 'nothing found', 'no movies found'];
                const hasNoResults = noResultsTexts.some(text => cleanBodyText.includes(text));
                if (!hasNoResults) {
                    return true;
                }
            }
            
            return false;
        }
    },
    o2tvseries: {
        searchUrl: (query) => `https://o2tvseries.com/search?q=${encodeURIComponent(query)}`,
        availabilityIndicators: ['.post-title', '.entry-title', '.series-title', '.title', '.content', '.post'],
        timeout: 15000,
        exactMatchSelectors: ['.post-title a', '.series-title a', '.post a'],
        contentPatterns: ['download', 'mp4', 'mkv', 'season', 'episode']
    },
    toxicwap: {
        searchUrl: (query) => `https://newtoxic.com/search.php?search=${encodeURIComponent(query)}`,
        availabilityIndicators: ['.post-title', '.entry-title', '.movie-title', '.title', '.movie-item', '.content', '.movie-info'],
        timeout: 15000,
        exactMatchSelectors: ['.post-title a', '.movie-title a', '.movie-item a'],
        contentPatterns: ['download', 'mp4', 'mkv', 'hd'],
        customHandler: async (html, query) => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Look for direct links with the movie title
            const links = doc.querySelectorAll('a');
            for (const link of links) {
                const linkText = link.textContent.toLowerCase();
                const queryLower = query.toLowerCase();
                
                // Check if the link contains the movie title
                if (linkText.includes(queryLower) || queryLower.includes(linkText)) {
                    // Check if it's a movie link
                    const href = link.getAttribute('href') || '';
                    if (href.includes('movie') || href.includes('download') || href.includes('watch') || 
                        href.includes('New_Movies') || href.includes('2025') || href.includes('2024') ||
                        href.includes('.php')) {
                        return true;
                    }
                }
            }
            
            // Look for movie items
            const movieItems = doc.querySelectorAll('.movie-item, .post, .content, .movie-info');
            for (const item of movieItems) {
                const itemText = item.textContent.toLowerCase();
                if (itemText.includes(queryLower)) {
                    return true;
                }
            }
            
            // Check for any mention of the movie title
            const bodyText = doc.body.textContent.toLowerCase();
            if (bodyText.includes(queryLower)) {
                // Make sure it's not in a "no results" message
                const noResultsTexts = ['no results', 'not found', '0 results', 'nothing found'];
                const hasNoResults = noResultsTexts.some(text => bodyText.includes(text));
                if (!hasNoResults) {
                    return true;
                }
            }
            
            return false;
        }
    },
    '9jarocks': {
        searchUrl: (query) => `https://9jarocks.net/search?q=${encodeURIComponent(query)}`,
        availabilityIndicators: ['.post-title', '.entry-title', '.movie-item', '.title', '.videodownload', '.video-item'],
        timeout: 15000,
        exactMatchSelectors: ['.post-title a', '.movie-item a', '.videodownload a'],
        contentPatterns: ['download', 'mp4', 'mkv', 'video'],
        customHandler: async (html, query) => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Look for direct links with the movie title
            const links = doc.querySelectorAll('a');
            for (const link of links) {
                const linkText = link.textContent.toLowerCase();
                const queryLower = query.toLowerCase();
                
                // Check if the link contains the movie title
                if (linkText.includes(queryLower) || queryLower.includes(linkText)) {
                    // Check if it's a movie link
                    const href = link.getAttribute('href') || '';
                    if (href.includes('videodownload') || href.includes('movie') || href.includes('download') || 
                        href.includes('2025') || href.includes('2024') || href.includes('.html')) {
                        return true;
                    }
                }
            }
            
            // Look for video download items
            const videoItems = doc.querySelectorAll('.videodownload, .movie-item, .post, .video-item');
            for (const item of videoItems) {
                const itemText = item.textContent.toLowerCase();
                if (itemText.includes(queryLower)) {
                    return true;
                }
            }
            
            // Check for any mention of the movie title
            const bodyText = doc.body.textContent.toLowerCase();
            if (bodyText.includes(queryLower)) {
                // Make sure it's not in a "no results" message
                const noResultsTexts = ['no results', 'not found', '0 results', 'nothing found'];
                const hasNoResults = noResultsTexts.some(text => bodyText.includes(text));
                if (!hasNoResults) {
                    return true;
                }
            }
            
            return false;
        }
    },
    // Add Netflix as a source
    netflix: {
        searchUrl: (query) => `https://www.netflix.com/search?q=${encodeURIComponent(query)}`,
        availabilityIndicators: ['.title-card', '.slider-item', '.track-name', '.title'],
        timeout: 15000,
        exactMatchSelectors: ['.title-card a', '.slider-item a'],
        contentPatterns: ['netflix', 'watch', 'stream'],
        customHandler: async (html, query) => {
            // Netflix has a complex API, so we'll use a simpler approach
            // Just check if the query contains Netflix-related terms
            const netflixTerms = ['netflix', 'stream', 'watch on netflix'];
            const queryLower = query.toLowerCase();
            return netflixTerms.some(term => queryLower.includes(term));
        }
    },
    // Additional movie sources
    yts: {
        searchUrl: (query) => `https://yts.mx/browse-movies/${encodeURIComponent(query)}`,
        availabilityIndicators: ['.browse-movie-wrap', '.movie-info', '.movie-title'],
        timeout: 15000,
        exactMatchSelectors: ['.browse-movie-title'],
        contentPatterns: ['download', 'torrent', 'yts', 'yify'],
        customHandler: async (html, query) => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Look for movie titles
            const movieTitles = doc.querySelectorAll('.browse-movie-title');
            for (const title of movieTitles) {
                const titleText = title.textContent.toLowerCase();
                const queryLower = query.toLowerCase();
                
                if (titleText.includes(queryLower) || queryLower.includes(titleText)) {
                    return true;
                }
            }
            
            // Check for any mention of the movie title
            const bodyText = doc.body.textContent.toLowerCase();
            if (bodyText.includes(query.toLowerCase())) {
                // Make sure it's not in a "no results" message
                const noResultsTexts = ['no results', 'not found', '0 results', 'nothing found'];
                const hasNoResults = noResultsTexts.some(text => bodyText.includes(text));
                if (!hasNoResults) {
                    return true;
                }
            }
            
            return false;
        }
    },
    eztv: {
        searchUrl: (query) => `https://eztv.re/search/${encodeURIComponent(query)}`,
        availabilityIndicators: ['.forum_header_border', '.torrent_name', '.ep_info'],
        timeout: 15000,
        exactMatchSelectors: ['.torrent_name a'],
        contentPatterns: ['download', 'torrent', 'eztv'],
        customHandler: async (html, query) => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Look for torrent names
            const torrentNames = doc.querySelectorAll('.torrent_name');
            for (const name of torrentNames) {
                const nameText = name.textContent.toLowerCase();
                const queryLower = query.toLowerCase();
                
                if (nameText.includes(queryLower) || queryLower.includes(nameText)) {
                    return true;
                }
            }
            
            // Check for any mention of the movie title
            const bodyText = doc.body.textContent.toLowerCase();
            if (bodyText.includes(query.toLowerCase())) {
                // Make sure it's not in a "no results" message
                const noResultsTexts = ['no results', 'not found', '0 results', 'nothing found'];
                const hasNoResults = noResultsTexts.some(text => bodyText.includes(text));
                if (!hasNoResults) {
                    return true;
                }
            }
            
            return false;
        }
    },
    piratebay: {
        searchUrl: (query) => `https://thepiratebay.org/search.php?q=${encodeURIComponent(query)}`,
        availabilityIndicators: ['.detName', '.detLink'],
        timeout: 15000,
        exactMatchSelectors: ['.detLink'],
        contentPatterns: ['download', 'torrent'],
        customHandler: async (html, query) => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Look for torrent names
            const torrentNames = doc.querySelectorAll('.detName');
            for (const name of torrentNames) {
                const nameText = name.textContent.toLowerCase();
                const queryLower = query.toLowerCase();
                
                if (nameText.includes(queryLower) || queryLower.includes(nameText)) {
                    return true;
                }
            }
            
            // Check for any mention of the movie title
            const bodyText = doc.body.textContent.toLowerCase();
            if (bodyText.includes(query.toLowerCase())) {
                // Make sure it's not in a "no results" message
                const noResultsTexts = ['no results', 'not found', '0 results', 'nothing found'];
                const hasNoResults = noResultsTexts.some(text => bodyText.includes(text));
                if (!hasNoResults) {
                    return true;
                }
            }
            
            return false;
        }
    },
    limetorrents: {
        searchUrl: (query) => `https://www.limetorrents.lol/search/all/${encodeURIComponent(query)}/`,
        availabilityIndicators: ['.tt-name', '.tdnormal'],
        timeout: 15000,
        exactMatchSelectors: ['.tt-name a'],
        contentPatterns: ['download', 'torrent'],
        customHandler: async (html, query) => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Look for torrent names
            const torrentNames = doc.querySelectorAll('.tt-name');
            for (const name of torrentNames) {
                const nameText = name.textContent.toLowerCase();
                const queryLower = query.toLowerCase();
                
                if (nameText.includes(queryLower) || queryLower.includes(nameText)) {
                    return true;
                }
            }
            
            // Check for any mention of the movie title
            const bodyText = doc.body.textContent.toLowerCase();
            if (bodyText.includes(query.toLowerCase())) {
                // Make sure it's not in a "no results" message
                const noResultsTexts = ['no results', 'not found', '0 results', 'nothing found'];
                const hasNoResults = noResultsTexts.some(text => bodyText.includes(text));
                if (!hasNoResults) {
                    return true;
                }
            }
            
            return false;
        }
    }
};
// ====================== GENRE CONFIGS ======================
const GENRES = {
    movie: [
        { id: 28, name: "Action" },
        { id: 12, name: "Adventure" },
        { id: 16, name: "Animation" },
        { id: 35, name: "Comedy" },
        { id: 80, name: "Crime" },
        { id: 99, name: "Documentary" },
        { id: 18, name: "Drama" },
        { id: 10751, name: "Family" },
        { id: 14, name: "Fantasy" },
        { id: 36, name: "History" },
        { id: 27, name: "Horror" },
        { id: 10402, name: "Music" },
        { id: 9648, name: "Mystery" },
        { id: 10749, name: "Romance" },
        { id: 878, name: "Science Fiction" },
        { id: 10770, name: "TV Movie" },
        { id: 53, name: "Thriller" },
        { id: 10752, name: "War" },
        { id: 37, name: "Western" }
    ],
    tv: [
        { id: 10759, name: "Action & Adventure" },
        { id: 16, name: "Animation" },
        { id: 35, name: "Comedy" },
        { id: 80, name: "Crime" },
        { id: 99, name: "Documentary" },
        { id: 18, name: "Drama" },
        { id: 10751, name: "Family" },
        { id: 10762, name: "Kids" },
        { id: 9648, name: "Mystery" },
        { id: 10763, name: "News" },
        { id: 10764, name: "Reality" },
        { id: 10765, name: "Sci-Fi & Fantasy" },
        { id: 10766, name: "Soap" },
        { id: 10767, name: "Talk" },
        { id: 10768, name: "War & Politics" },
        { id: 37, name: "Western" }
    ]
};
// ====================== MOVIE CLASSES CONFIGS ======================
const MOVIE_CLASSES = [
    { 
        id: 'hollywood', 
        name: 'United States', 
        description: 'American cinema productions', 
        icon: '🇺🇸', 
        countryCode: 'US',
        flagUrl: 'https://flagcdn.com/w320/us.png'
    },
    { 
        id: 'bollywood', 
        name: 'India', 
        description: 'Indian Hindi cinema', 
        icon: '🇮🇳', 
        countryCode: 'IN',
        flagUrl: 'https://flagcdn.com/w320/in.png'
    },
    { 
        id: 'nollywood', 
        name: 'Nigeria', 
        description: 'Nigerian trending films', 
        icon: '🇳🇬',
        countryCode: 'NG',
        keywords: ['nigeria', 'nigerian', 'nollywood', 'african cinema', 'genevieve nnaji', 'omotola jalade', 'ramsey nouah', '2023', '2024', 'the black book', 'breath of life', 'gangs of lagos'],
        flagUrl: 'https://flagcdn.com/w320/ng.png'
    },
    { 
        id: 'kdrama', 
        name: 'South Korea', 
        description: 'Current Korean series', 
        icon: '🇰🇷', 
        countryCode: 'KR',
        flagUrl: 'https://flagcdn.com/w320/kr.png'
    },
    { 
        id: 'anime', 
        name: 'Japan', 
        description: 'Japanese animation', 
        icon: '🇯🇵', 
        countryCode: 'JP',
        flagUrl: 'https://flagcdn.com/w320/jp.png'
    },
    { 
        id: 'british', 
        name: 'United Kingdom', 
        description: 'United Kingdom film productions', 
        icon: '🇬🇧', 
        countryCode: 'GB',
        flagUrl: 'https://flagcdn.com/w320/gb.png'
    },
    { 
        id: 'french', 
        name: 'France', 
        description: 'French film productions', 
        icon: '🇫🇷', 
        countryCode: 'FR',
        flagUrl: 'https://flagcdn.com/w320/fr.png'
    },
    { 
        id: 'chinese', 
        name: 'China', 
        description: 'Chinese film industry', 
        icon: '🇨🇳', 
        countryCode: 'CN',
        flagUrl: 'https://flagcdn.com/w320/cn.png'
    },
    { 
        id: 'lollywood', 
        name: 'Pakistan', 
        description: 'Pakistani cinema', 
        icon: '🇵🇰', 
        countryCode: 'PK',
        flagUrl: 'https://flagcdn.com/w320/pk.png'
    },
    { 
        id: 'ghallywood', 
        name: 'Ghana', 
        description: 'Ghanaian film industry', 
        icon: '🇬🇭', 
        countryCode: 'GH',
        flagUrl: 'https://flagcdn.com/w320/gh.png'
    },
    { 
        id: 'philippines', 
        name: 'Philippines', 
        description: 'Filipino trending films', 
        icon: '🇵🇭', 
        countryCode: 'PH', 
        keywords: ['philippines', 'filipino', 'tagalog', 'philippine cinema'],
        flagUrl: 'https://flagcdn.com/w320/ph.png'
    },
    { 
        id: 'southafrica', 
        name: 'South Africa', 
        description: 'South African trending films', 
        icon: '🇿🇦', 
        countryCode: 'ZA', 
        keywords: ['south africa', 'south african', 'african cinema', 'zulu'],
        flagUrl: 'https://flagcdn.com/w320/za.png'
    },
    { 
        id: 'kenya', 
        name: 'Kenya', 
        description: 'Kenyan trending films', 
        icon: '🇰🇪', 
        countryCode: 'KE', 
        keywords: ['kenya', 'kenyan', 'african cinema', 'swahili'],
        flagUrl: 'https://flagcdn.com/w320/ke.png'
    },
    // Additional countries with flag URLs
    { 
        id: 'canada', 
        name: 'Canada', 
        description: 'Canadian film productions', 
        icon: '🇨🇦', 
        countryCode: 'CA',
        flagUrl: 'https://flagcdn.com/w320/ca.png'
    },
    { 
        id: 'australia', 
        name: 'Australia', 
        description: 'Australian cinema', 
        icon: '🇦🇺', 
        countryCode: 'AU',
        flagUrl: 'https://flagcdn.com/w320/au.png'
    },
    { 
        id: 'mexico', 
        name: 'Mexico', 
        description: 'Mexican film industry', 
        icon: '🇲🇽', 
        countryCode: 'MX',
        flagUrl: 'https://flagcdn.com/w320/mx.png'
    },
    { 
        id: 'brazil', 
        name: 'Brazil', 
        description: 'Brazilian cinema', 
        icon: '🇧🇷', 
        countryCode: 'BR',
        flagUrl: 'https://flagcdn.com/w320/br.png'
    },
    { 
        id: 'russia', 
        name: 'Russia', 
        description: 'Russian film productions', 
        icon: '🇷🇺', 
        countryCode: 'RU',
        flagUrl: 'https://flagcdn.com/w320/ru.png'
    },
    { 
        id: 'italy', 
        name: 'Italy', 
        description: 'Italian cinema', 
        icon: '🇮🇹', 
        countryCode: 'IT',
        flagUrl: 'https://flagcdn.com/w320/it.png'
    },
    { 
        id: 'spain', 
        name: 'Spain', 
        description: 'Spanish film industry', 
        icon: '🇪🇸', 
        countryCode: 'ES',
        flagUrl: 'https://flagcdn.com/w320/es.png'
    },
    { 
        id: 'egypt', 
        name: 'Egypt', 
        description: 'Egyptian cinema', 
        icon: '🇪🇬', 
        countryCode: 'EG',
        flagUrl: 'https://flagcdn.com/w320/eg.png'
    },
    { 
        id: 'thailand', 
        name: 'Thailand', 
        description: 'Thai film industry', 
        icon: '🇹🇭', 
        countryCode: 'TH',
        flagUrl: 'https://flagcdn.com/w320/th.png'
    },
    { 
        id: 'turkey', 
        name: 'Turkey', 
        description: 'Turkish cinema', 
        icon: '🇹🇷', 
        countryCode: 'TR',
        flagUrl: 'https://flagcdn.com/w320/tr.png'
    },
    { 
        id: 'germany', 
        name: 'Germany', 
        description: 'German film productions', 
        icon: '🇩🇪', 
        countryCode: 'DE',
        flagUrl: 'https://flagcdn.com/w320/de.png'
    }
];
// ====================== DOM ELEMENTS ======================
const main = document.getElementById("section");
const form = document.getElementById("form");
const search = document.getElementById("query");
const trailerContainer = document.querySelector(".slider-container");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const paginationContainer = document.getElementById("pagination");
// ====================== COUNTRY EXPLORER DOM ELEMENTS ======================
const countriesTab = document.getElementById("countriesTab");
const countriesContainer = document.getElementById("countriesContainer");
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
const homeTab = document.getElementById("homeTab");
const moviesTab = document.getElementById("moviesTab");
const seriesTab = document.getElementById("seriesTab");
const favoritesTab = document.getElementById("favoritesTab");
const genresTab = document.getElementById("genresTab");
const newsTab = document.getElementById("newsTab");
// Series Download Container
const seriesDownloadContainer = document.getElementById("seriesDownloadContainer");
const seasonsList = document.getElementById("seasonsList");
const downloadAllBtn = document.getElementById("downloadAllBtn");
// News container
const newsContainer = document.createElement("div");
newsContainer.id = "newsContainer";
newsContainer.className = "news-container";
// Landing page container
const landingPageContainer = document.createElement("div");
landingPageContainer.id = "landingPageContainer";
landingPageContainer.className = "landing-page-container";
document.body.appendChild(landingPageContainer);
let currentMediaType = 'movie'; // Default to movies
// Add these with your other global variables
let currentCountryCode = '';
let currentCountryName = '';
// Add these with your other global variables
let isCountryMode = false;
// ====================== PAGINATION ======================
let currentPage = 1;
let totalPages = 20;
let currentType = "movie";
let currentAPIUrl = MOVIES_API;
// ====================== INTERNET CONNECTION MONITOR ======================
let internetStatusToast = null;
let isOnline = navigator.onLine;
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
        internetStatusToast = toast;
    }
    
    document.body.appendChild(toast);
    
    requestAnimationFrame(() => {
        toast.style.opacity = "1";
    });
}
if (!isOnline) {
    showInternetStatus(false);
}

// Make sure this function is in the global scope
function changeHero(direction) {
    // Clear the current interval
    if (heroRotationInterval) {
        clearInterval(heroRotationInterval);
    }
    
    // Update current index
    currentHeroIndex = (currentHeroIndex + direction + heroItems.length) % heroItems.length;
    
    // Update hero content
    updateHeroContent();
    
    // Restart the interval
    heroRotationInterval = setInterval(updateHeroContent, 6000);
}

// ====================== LANDING PAGE ======================
async function fetchLandingPageData() {
    try {
        // Fetch top movies of the week
        const topMoviesRes = await fetch(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}`);
        const topMoviesData = await topMoviesRes.json();
        
        // Fetch top series of the week
        const topSeriesRes = await fetch(`${BASE_URL}/trending/tv/week?api_key=${API_KEY}`);
        const topSeriesData = await topSeriesRes.json();
        
        // Fetch popular movies for "Movies you'll like"
        const popularMoviesRes = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`);
        const popularMoviesData = await popularMoviesRes.json();
        
        // Fetch popular series for "Series you'll like"
        const popularSeriesRes = await fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}`);
        const popularSeriesData = await popularSeriesRes.json();
        
        // Fetch most searched (trending all)
        const trendingAllRes = await fetch(`${BASE_URL}/trending/all/week?api_key=${API_KEY}`);
        const trendingAllData = await trendingAllRes.json();
        
        // Fetch 10 movies for hero rotation
        const heroMoviesRes = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`);
        const heroMoviesData = await heroMoviesRes.json();
        
        // Fetch 10 series for hero rotation
        const heroSeriesRes = await fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}`);
        const heroSeriesData = await heroSeriesRes.json();
        
        return {
            topMovies: topMoviesData.results.slice(0, 10),
            topSeries: topSeriesData.results.slice(0, 10),
            popularMovies: popularMoviesData.results.slice(0, 10),
            popularSeries: popularSeriesData.results.slice(0, 10),
            trendingAll: trendingAllData.results.slice(0, 10),
            heroMovies: heroMoviesData.results.slice(0, 10),
            heroSeries: heroSeriesData.results.slice(0, 10)
        };
    } catch (error) {
        console.error('Error fetching landing page data:', error);
        return {
            topMovies: [],
            topSeries: [],
            popularMovies: [],
            popularSeries: [],
            trendingAll: [],
            heroMovies: [],
            heroSeries: []
        };
    }
}
function renderLandingPage(data) {
    landingPageContainer.innerHTML = '';
    
    // Add CSS for landing page
    const landingStyles = document.createElement('style');
    landingStyles.textContent = `
        body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #121212;
            color: #ffffff;
        }
        
        .landing-section {
            max-width: 100%;
            margin: 0 auto;
            padding: 0 2rem;
        }
        
        /* HERO SECTION */
        .hero-section {
            position: relative;
            width: 100%;
            height: 100vh;
            overflow: hidden;
            margin-bottom: 2rem;
        }
        
        .hero-background {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-size: cover;
            background-position: center;
            transition: background-image 1s ease-in-out;
        }
        
        .hero-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.6);
        }
        
        .hero-content {
            position: relative;
            z-index: 1;
            display: flex;
            height: 100%;
            padding: 2rem 2rem 2rem 4rem; /* Added more left padding for nav buttons */
        }
        
        .left-content {
            max-width: 600px;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        
        .logo {
            font-size: 2rem;
            font-weight: bold;
            color: #f5c518;
            margin-bottom: 0.5rem;
        }
        
        .whats-new {
            color: #ccc;
            font-size: 1rem;
            margin-bottom: 1rem;
        }
        
        .whats-new span {
            font-weight: bold;
            color: #f5c518;
        }
        
        .movie-title {
            font-size: 4rem;
            font-weight: bold;
            color: white;
            margin: 0 0 1rem 0;
        }
        
        .rating-container {
            display: flex;
            align-items: center;
            margin-bottom: 1rem;
        }
        
        .rating-circle {
            position: relative;
            width: 60px;
            height: 60px;
            margin-right: 1rem;
        }
        
        .rating-value {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-weight: bold;
            font-size: 1rem;
        }
        
        .rating-imdb {
            position: absolute;
            bottom: -15px;
            left: 50%;
            transform: translateX(-50%);
            color: #f5c518;
            font-size: 0.7rem;
            font-weight: bold;
        }
        
        .rating-svg {
            transform: rotate(-90deg);
        }
        
        .rating-bg {
            stroke: #333;
        }
        
        .rating-progress {
            stroke: #f5c518;
            transition: stroke-dasharray 0.5s ease;
        }
        
        .movie-time {
            color: #ccc;
            font-size: 1rem;
            display: flex;
            align-items: center;
        }
        
        .movie-time i {
            margin-right: 0.5rem;
            color: #f5c518;
        }
        
        .movie-summary {
            color: #ddd;
            font-size: 1rem;
            margin-bottom: 1rem;
            line-height: 1.5;
        }
        
        .movie-cast, .movie-genre {
            color: #ccc;
            font-size: 0.9rem;
            margin-bottom: 0.5rem;
        }
        
        .movie-cast span, .movie-genre span {
            font-weight: bold;
            color: #f5c518;
        }
        
        .watch-trailer-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f5c518;
            color: black;
            border: none;
            padding: 0.8rem 1.5rem;
            font-size: 1rem;
            font-weight: bold;
            border-radius: 5px;
            cursor: pointer;
            width: fit-content;
            transition: all 0.3s ease;
        }
        
        .watch-trailer-btn:hover {
            background: #e6b800;
            transform: scale(1.05);
        }
        
        .watch-trailer-btn i {
            margin-right: 0.5rem;
        }
        
        .trailer-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .trailer-container {
            position: relative;
            width: 90%;
            height: 90%;
        }
        
        .close-trailer {
            position: absolute;
            top: -40px;
            right: 0;
            background: none;
            border: none;
            color: white;
            font-size: 2rem;
            cursor: pointer;
        }
        
        /* Hero Navigation Buttons */
        .hero-nav-btn {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(0, 0, 0, 0.5);
            color: white;
            border: none;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            font-size: 1.5rem;
            cursor: pointer;
            z-index: 10;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .hero-nav-btn:hover {
            background: rgba(245, 197, 24, 0.7);
        }
        
        .prev-btn {
            left: 20px;
        }
        
        .next-btn {
            right: 20px;
        }
        
        /* TOP 10 SECTION */
        .top-10-section {
            margin-bottom: 5rem;
        }
        
        .section-title {
            font-size: 3rem;
            color: #f5c518;
            margin-bottom: 2.5rem;
            text-align: center;
            position: relative;
            padding-bottom: 1.5rem;
            font-weight: 700;
        }
        
        .section-title::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 120px;
            height: 4px;
            background: linear-gradient(45deg, #f5c518, #e6b800);
        }
        
        .dual-top10-container {
            display: flex;
            gap: 2rem;
            height: 400px;
        }
        
        .top10-column {
            flex: 1;
            background: linear-gradient(135deg, rgba(30,30,30,0.9), rgba(20,20,20,0.9));
            border-radius: 20px;
            padding: 1.5rem;
            border: 1px solid rgba(245,197,24,0.3);
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            position: relative;
            overflow: hidden;
        }
        
        .top10-header {
            color: #f5c518;
            font-size: 1.5rem;
            font-weight: bold;
            margin-bottom: 1rem;
            text-align: center;
        }
        
        .top10-scroll-container {
            position: relative;
            height: 320px;
            overflow: hidden;
        }
        
        .top10-scroll {
            position: absolute;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
        }
        
        .top10-scroll.movies {
            animation: scrollRight 20s linear infinite;
        }
        
        .top10-scroll.series {
            animation: scrollLeft 20s linear infinite;
        }
        
        @keyframes scrollRight {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(0%); }
        }
        
        @keyframes scrollLeft {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-100%); }
        }
        
        .top10-item {
            display: flex;
            align-items: center;
            padding: 0.8rem;
            margin: 0 0.5rem;
            border-radius: 10px;
            transition: all 0.3s ease;
            min-width: 280px;
            background: rgba(255,255,255,0.05);
        }
        
        .top10-item:hover {
            background: rgba(245,197,24,0.15);
            transform: scale(1.05);
        }
        
        .top10-item.center {
            transform: scale(1.1);
            background: rgba(245,197,24,0.2);
            box-shadow: 0 5px 15px rgba(245,197,24,0.3);
        }
        
        .top10-rank {
            font-size: 1.5rem;
            font-weight: bold;
            color: #f5c518;
            margin-right: 1rem;
            min-width: 30px;
            text-align: center;
        }
        
        .top10-poster {
            width: 60px;
            height: 90px;
            object-fit: cover;
            border-radius: 8px;
            margin-right: 1rem;
            box-shadow: 0 4px 15px rgba(0,0,0,0.5);
        }
        
        .top10-info {
            flex-grow: 1;
        }
        
        .top10-title {
            font-weight: bold;
            margin-bottom: 0.5rem;
            font-size: 1.1rem;
            color: #ffffff;
        }
        
        .top10-meta {
            font-size: 0.9rem;
            color: #cccccc;
        }
        
        /* RECOMMENDATIONS SECTIONS */
        .recommendations-section {
            margin-bottom: 5rem;
        }
        
        .recommendation-container {
            display: flex;
            align-items: center;
            margin-bottom: 2rem;
        }
        
        .recommendation-header {
            flex: 0 0 300px;
            padding-right: 2rem;
            display: flex;
            flex-direction: column;
        }
        
        .recommendation-titles {
            font-size: 3rem;
            font-weight: bold;
            color: #f5c518;
            margin: 0 0 0.5rem 0;
        }
        
        .recommendation-subtitle {
            font-size: 1rem;
            color: #ffffff;
            margin: 0;
            line-height: 1.4;
        }
        
        .recommendation-scroll-container {
            flex: 1;
            overflow-x: auto;
            padding-bottom: 1rem;
        }
        
        .recommendation-scroll {
            display: flex;
            gap: 1.5rem;
        }
        
        .recommendation-card {
            position: relative;
            flex: 0 0 200px;
            height: 300px;
            background: linear-gradient(135deg, rgba(40,40,40,0.8), rgba(30,30,30,0.8));
            border-radius: 15px;
            overflow: hidden;
            transition: all 0.4s ease;
            border: 1px solid rgba(245,197,24,0.2);
            cursor: pointer;
            box-shadow: 0 8px 25px rgba(0,0,0,0.4);
        }
        
        .recommendation-card:hover {
            transform: translateY(-15px);
            box-shadow: 0 20px 40px rgba(245,197,24,0.3);
            border-color: #f5c518;
        }
        
        .recommendation-poster {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.5s ease;
        }
        
        .recommendation-card:hover .recommendation-poster {
            transform: scale(1.05);
        }
        
        .recommendation-number {
            position: absolute;
            top: 10px;
            right: 10px;
            font-size: 1.5rem;
            font-weight: bold;
            color: rgba(245, 197, 24, 0.7);
            background: rgba(0, 0, 0, 0.5);
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            z-index: 3;
        }
        
        .recommendation-info {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            padding: 1rem;
            background: linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.7) 60%, transparent);
            z-index: 2;
            transform: translateY(80%);
            transition: transform 0.5s ease;
        }
        
        .recommendation-card:hover .recommendation-info {
            transform: translateY(0);
        }
        
        .recommendation-title {
            font-weight: bold;
            color: #ffffff;
            font-size: 1rem;
            margin: 0 0 0.5rem 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        
        .recommendation-rating {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: #f5c518;
            font-size: 0.9rem;
            font-weight: bold;
        }
        
        /* ABOUT SECTION */
        .about-section {
            background: linear-gradient(135deg, rgba(245,197,24,0.1), rgba(245,197,24,0.05));
            border-radius: 25px;
            padding: 4rem 3rem;
            margin-bottom: 4rem;
            border: 2px solid rgba(245,197,24,0.3);
            box-shadow: 0 15px 35px rgba(0,0,0,0.5);
        }
        
        .about-content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 4rem;
            align-items: center;
        }
        
        .about-text h2 {
            color: #f5c518;
            font-size: 3rem;
            margin-bottom: 2rem;
            font-weight: 700;
        }
        
        .about-text p {
            font-size: 1.2rem;
            line-height: 1.8;
            color: #e0e0e0;
            margin-bottom: 2rem;
        }
        
        .about-features {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 2rem;
            margin-top: 3rem;
        }
        
        .about-feature {
            display: flex;
            align-items: center;
            gap: 1.5rem;
            background: rgba(255,255,255,0.05);
            padding: 1.5rem;
            border-radius: 15px;
            transition: all 0.3s ease;
        }
        
        .about-feature:hover {
            background: rgba(245,197,24,0.1);
            transform: translateY(-5px);
        }
        
        .about-feature-icon {
            width: 60px;
            height: 60px;
            background: rgba(245,197,24,0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.8rem;
            color: #f5c518;
        }
        
        .about-feature-text {
            font-weight: bold;
            font-size: 1.2rem;
            color: #ffffff;
        }
        
        .about-image {
            text-align: center;
        }
        
        .about-image img {
            max-width: 100%;
            border-radius: 20px;
            box-shadow: 0 15px 40px rgba(0,0,0,0.7);
        }
        
        /* Stats Section */
        .stats-section {
            display: flex;
            justify-content: space-around;
            margin: 4rem 0;
            padding: 2rem 0;
            align-items: center;
            background: transparent;
            border-radius: 20px;
            margin-left: -2rem;
            margin-right: -2rem;
            flex-direction:column;
        }
        
        .stat-item {
            margin: 0 3rem;
            text-align: center;
            position: relative;
            width: 150px;
            height: 150px;
        }
        
        .stat-circle {
            position: relative;
            width: 120px;
            height: 120px;
            margin: 0 auto 1rem;
        }
        
        .stat-number {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 2rem;
            font-weight: bold;
            color: #f5c518;
        }
        
        .stat-label {
            font-size: 1.2rem;
            color: #ffffff;
            margin-top: 1rem;
        }
        
        /* Coming Soon Section */
        .coming-soon-section {
            margin: 4rem 0;
        }
        
        .coming-soon-container {
            display: flex;
            gap: 1.5rem;
            overflow-x: auto;
            padding: 1rem 0;
            scrollbar-width: thin;
            scrollbar-color: #f5c518 transparent;
        }
        
        .coming-soon-container::-webkit-scrollbar {
            height: 8px;
        }
        
        .coming-soon-container::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 10px;
        }
        
        .coming-soon-container::-webkit-scrollbar-thumb {
            background: #f5c518;
            border-radius: 10px;
        }
        
        .coming-soon-card {
            flex: 0 0 250px;
            background: linear-gradient(135deg, rgba(40,40,40,0.8), rgba(30,30,30,0.8));
            border-radius: 15px;
            overflow: hidden;
            transition: all 0.3s ease;
            border: 1px solid rgba(245,197,24,0.2);
            cursor: pointer;
        }
        
        .coming-soon-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 15px 30px rgba(245,197,24,0.3);
            border-color: #f5c518;
        }
        
        .coming-soon-poster {
            width: 100%;
            height: 350px;
            object-fit: cover;
        }
        
        .coming-soon-info {
            padding: 1rem;
        }
        
        .coming-soon-title {
            color: #f5c518;
            font-weight: bold;
            margin-bottom: 0.5rem;
            font-size: 1.1rem;
        }
        
        .coming-soon-date {
            color: #ffffff;
            font-size: 0.9rem;
        }
        
        /* Hide scrollbar for horizontal scrolling */
        .recommendation-scroll-container::-webkit-scrollbar {
            display: none;
        }
        
        .recommendation-scroll-container {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        
        @media (max-width: 1200px) {
            .recommendation-header {
                flex: 0 0 250px;
            }
            
            .recommendation-title {
                font-size: 2rem;
            }
        }
        
        @media (max-width: 768px) {
            .dual-top10-container {
                flex-direction: column;
                height: auto;
            }
            
            .top10-column {
                height: 300px;
                margin-bottom: 2rem;
            }
            
            .recommendation-container {
                flex-direction: column;
                align-items: flex-start;
            }
            
            .recommendation-header {
                flex: none;
                width: 100%;
                padding-right: 0;
                margin-bottom: 1rem;
            }
            
            .recommendation-scroll-container {
                width: 100%;
            }
            
            .about-content {
                grid-template-columns: 1fr;
            }
            
            .about-features {
                grid-template-columns: 1fr;
            }
            
            .stats-section {
                flex-direction: column;
                gap: 2rem;
            }
        }
    `;
    document.head.appendChild(landingStyles);
    
    // Create hero section
    const heroSection = document.createElement('div');
    heroSection.className = 'hero-section';
    heroSection.innerHTML = `
        <div class="hero-background" id="heroBackground"></div>
        <div class="hero-overlay"></div>
        <div class="hero-content">
            <div class="left-content">
                <div class="logo">Cineverse</div>
                <div class="whats-new">What's new in <span id="type-indicator">movies</span></div>
                <h1 class="movie-title" id="landing-title">Loading...</h1>
                <div class="rating-container">
                    <div class="rating-circle">
                        <div class="rating-value" id="landing-rating">0.0</div>
                        <div class="rating-imdb">IMDb</div>
                        <svg class="rating-svg" viewBox="0 0 36 36">
                            <path class="rating-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#333" stroke-width="3"/>
                            <path class="rating-progress" id="rating-progress" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f5c518" stroke-width="3" stroke-dasharray="0, 100"/>
                        </svg>
                    </div>
                    <div class="movie-time" id="landing-runtime">
                        <i class="far fa-clock"></i> --
                    </div>
                </div>
                <div class="movie-summary" id="landing-summary">Loading...</div>
                <div class="movie-cast" id="landing-cast"><span>Starring:</span> --</div>
                <div class="movie-genre" id="landing-genre"><span>Genre:</span> --</div>
                <button class="watch-trailer-btn" id="landing-trailer-btn">
                    <i class="fas fa-play"></i> Watch Trailer
                </button>
            </div>
        </div>
        <button class="hero-nav-btn prev-btn" onclick="changeHero(-1)">❮</button>
        <button class="hero-nav-btn next-btn" onclick="changeHero(1)">❯</button>
    `;
    landingPageContainer.appendChild(heroSection);
    
    // Set up hero rotation with 10 movies and 10 series
    setupHeroRotation(data.heroMovies, data.heroSeries);
    
    // Stats Section
    const statsSection = document.createElement('div');
    statsSection.className = 'landing-section stats-section';
    statsSection.innerHTML = '<h2 class="section-title">Platform Statistics</h2>';
    
    const statsContainer = document.createElement('div');
    statsContainer.className = 'stats-container';
    
    // Create circular stats
    createCircularStat(statsContainer, 10000, "Movies & TV Shows",95);
    createCircularStat(statsContainer, 500, "Genres & Categories",75);
    createCircularStat(statsContainer, 12, "Download Sources",42);
    createCircularStat(statsContainer, 24, "Countries",68);
    
    statsSection.appendChild(statsContainer);
    landingPageContainer.appendChild(statsSection);
    
    // Top 10 of the Week Section
    const top10Section = document.createElement('div');
    top10Section.className = 'landing-section top-10-section';
    top10Section.innerHTML = '<h2 class="section-title">Top 10 of the Week</h2>';
    
    const dualContainer = document.createElement('div');
    dualContainer.className = 'dual-top10-container';
    
    // Movies column
    const moviesColumn = document.createElement('div');
    moviesColumn.className = 'top10-column';
    moviesColumn.innerHTML = '<div class="top10-header"><i class="fas fa-film"></i> Movies</div>';
    
    const moviesScrollContainer = document.createElement('div');
    moviesScrollContainer.className = 'top10-scroll-container';
    
    const moviesScroll = document.createElement('div');
    moviesScroll.className = 'top10-scroll movies';
    
    // Clone movies list for seamless scrolling
    const moviesList1 = createTop10Items(data.topMovies, 'movie');
    const moviesList2 = createTop10Items(data.topMovies, 'movie');
    
    moviesScroll.appendChild(moviesList1);
    moviesScroll.appendChild(moviesList2);
    moviesScrollContainer.appendChild(moviesScroll);
    moviesColumn.appendChild(moviesScrollContainer);
    
    // Series column
    const seriesColumn = document.createElement('div');
    seriesColumn.className = 'top10-column';
    seriesColumn.innerHTML = '<div class="top10-header"><i class="fas fa-tv"></i> Series</div>';
    
    const seriesScrollContainer = document.createElement('div');
    seriesScrollContainer.className = 'top10-scroll-container';
    
    const seriesScroll = document.createElement('div');
    seriesScroll.className = 'top10-scroll series';
    
    // Clone series list for seamless scrolling
    const seriesList1 = createTop10Items(data.topSeries, 'tv');
    const seriesList2 = createTop10Items(data.topSeries, 'tv');
    
    seriesScroll.appendChild(seriesList1);
    seriesScroll.appendChild(seriesList2);
    seriesScrollContainer.appendChild(seriesScroll);
    seriesColumn.appendChild(seriesScrollContainer);
    
    dualContainer.appendChild(moviesColumn);
    dualContainer.appendChild(seriesColumn);
    top10Section.appendChild(dualContainer);
    landingPageContainer.appendChild(top10Section);
    
    // Movies You'll Like Section
    const moviesLikeSection = document.createElement('div');
    moviesLikeSection.className = 'landing-section recommendations-section';
    
    const moviesContainer = document.createElement('div');
    moviesContainer.className = 'recommendation-container';
    
    const moviesHeader = document.createElement('div');
    moviesHeader.className = 'recommendation-header';
    moviesHeader.innerHTML = `
        <h2 class="recommendation-titles">Movies You May Like</h2>
        <p class="recommendation-subtitle">Check out this week's most popular movies and find out where to watch them.</p>
    `;
    moviesContainer.appendChild(moviesHeader);
    
    const moviesScrollContainers = document.createElement('div');
    moviesScrollContainers.className = 'recommendation-scroll-container';
    
    const moviesScrolls = document.createElement('div');
    moviesScrolls.className = 'recommendation-scroll';
    
    data.popularMovies.slice(0, 10).forEach((movie, index) => {
        const card = createRecommendationCard(movie, 'movie', index);
        moviesScrolls.appendChild(card);
    });
    
    moviesScrollContainers.appendChild(moviesScrolls);
    moviesContainer.appendChild(moviesScrollContainers);
    moviesLikeSection.appendChild(moviesContainer);
    landingPageContainer.appendChild(moviesLikeSection);
    
    // Series You'll Like Section
    const seriesLikeSection = document.createElement('div');
    seriesLikeSection.className = 'landing-section recommendations-section';
    
    const seriesContainer = document.createElement('div');
    seriesContainer.className = 'recommendation-container';
    
    const seriesHeader = document.createElement('div');
    seriesHeader.className = 'recommendation-header';
    seriesHeader.innerHTML = `
        <h2 class="recommendation-titles">Series You May Like</h2>
        <p class="recommendation-subtitle">Check out this week's most popular series and find out where to watch them.</p>
    `;
    seriesContainer.appendChild(seriesHeader);
    
    const seriesScrollContainers = document.createElement('div');
    seriesScrollContainers.className = 'recommendation-scroll-container';
    
    const seriesScrolls = document.createElement('div');
    seriesScrolls.className = 'recommendation-scroll';
    
    data.popularSeries.slice(0, 10).forEach((series, index) => {
        const card = createRecommendationCard(series, 'tv', index);
        seriesScrolls.appendChild(card);
    });
    seriesScrollContainers.appendChild(seriesScrolls);
    seriesContainer.appendChild(seriesScrollContainers);
    seriesLikeSection.appendChild(seriesContainer);
    landingPageContainer.appendChild(seriesLikeSection);
    
    // Coming Soon Section
    const comingSoonSection = document.createElement('div');
    comingSoonSection.className = 'landing-section coming-soon-section';
    comingSoonSection.innerHTML = '<h2 class="section-title">Coming Soon</h2>';
    
    const comingSoonContainer = document.createElement('div');
    comingSoonContainer.className = 'coming-soon-container';
    
    // Fetch upcoming movies using NewsAPI
    fetchUpcomingMovies().then(movies => {
        if (movies.length === 0) {
            comingSoonContainer.innerHTML = '<p style="text-align: center; color: #ccc;">Unable to load upcoming movies</p>';
            return;
        }
        
        movies.forEach(movie => {
            const card = document.createElement('div');
            card.className = 'coming-soon-card';
            
            // Use poster if available, otherwise use backdrop or placeholder
            const imageUrl = movie.poster_path 
                ? IMG_PATH + movie.poster_path 
                : movie.backdrop_path 
                    ? movie.backdrop_path 
                    : 'https://via.placeholder.com/250x350';
            
            card.innerHTML = `
                <img src="${imageUrl}" 
                     alt="${movie.title}" class="coming-soon-poster"
                     onerror="this.src='https://picsum.photos/seed/movie${movie.id || Math.random()}/250/350.jpg'">
                <div class="coming-soon-info">
                    <div class="coming-soon-title">${movie.title}</div>
                    <div class="coming-soon-date">${movie.release_date ? new Date(movie.release_date).toLocaleDateString() : 'TBA'}</div>
                </div>
            `;
            
            card.addEventListener('click', () => {
                if (movie.id) {
                    currentType = 'movie';
                    openModal(movie);
                } else if (movie.url) {
                    window.open(movie.url, '_blank');
                }
            });
            
            comingSoonContainer.appendChild(card);
        });
    });
    
    comingSoonSection.appendChild(comingSoonContainer);
    landingPageContainer.appendChild(comingSoonSection);
    
    // About Section
    const aboutSection = document.createElement('div');
    aboutSection.className = 'landing-section about-section';
    aboutSection.innerHTML = `
        <div class="about-content">
            <div class="about-text">
                <h2>About Cineverse</h2>
                <p>Cineverse is your ultimate destination for discovering and exploring movies and TV shows from around the world. With a vast library of content and intuitive features, we make it easy to find your next favorite film or series.</p>
                <p>Our platform provides comprehensive information about movies and TV shows, including ratings, reviews, trailers, and availability across multiple streaming platforms.</p>
                <div class="about-features">
                    <div class="about-feature">
                        <div class="about-feature-icon"><i class="fas fa-film"></i></div>
                        <div class="about-feature-text">Extensive Movie Library</div>
                    </div>
                    <div class="about-feature">
                        <div class="about-feature-icon"><i class="fas fa-tv"></i></div>
                        <div class="about-feature-text">Popular TV Series</div>
                    </div>
                    <div class="about-feature">
                        <div class="about-feature-icon"><i class="fas fa-search"></i></div>
                        <div class="about-feature-text">Smart Search</div>
                    </div>
                    <div class="about-feature">
                        <div class="about-feature-icon"><i class="fas fa-star"></i></div>
                        <div class="about-feature-text">Personalized Recommendations</div>
                    </div>
                </div>
            </div>
            <div class="about-image">
                <img src="https://picsum.photos/seed/cinema/600/400.jpg" alt="Cinema">
            </div>
        </div>
    `;
    landingPageContainer.appendChild(aboutSection);
}
function createCircularStat(container, targetValue, label, fillPercentage) {
    const statItem = document.createElement('div');
    statItem.className = 'stat-item';
    
    const statCircle = document.createElement('div');
    statCircle.className = 'stat-circle';
    
    // Increase the size of the circle
    const circleSize = 150; // Increased from 120px to 150px
    statCircle.style.width = `${circleSize}px`;
    statCircle.style.height = `${circleSize}px`;
    statCircle.style.margin = '0 auto 1rem';
    
    const statSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    statSvg.setAttribute('viewBox', '0 0 100 100');
    statSvg.setAttribute('width', circleSize);
    statSvg.setAttribute('height', circleSize);
    
    const radius = 45; // Keep the same radius for viewBox
    const circumference = 2 * Math.PI * radius;
    
    const statBg = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    statBg.setAttribute('cx', '50');
    statBg.setAttribute('cy', '50');
    statBg.setAttribute('r', radius);
    statBg.setAttribute('fill', 'none');
    statBg.setAttribute('stroke', '#333');
    // Increase stroke width for more prominent border
    statBg.setAttribute('stroke-width', '10'); // Increased from 8 to 10
    
    const statProgress = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    statProgress.setAttribute('cx', '50');
    statProgress.setAttribute('cy', '50');
    statProgress.setAttribute('r', radius);
    statProgress.setAttribute('fill', 'none');
    statProgress.setAttribute('stroke', '#f5c518');
    // Increase stroke width for more prominent border
    statProgress.setAttribute('stroke-width', '10'); // Increased from 8 to 10
    // Set initial dasharray to 0
    statProgress.setAttribute('stroke-dasharray', '0, 100');
    statProgress.setAttribute('stroke-dashoffset', '0');
    statProgress.setAttribute('transform', 'rotate(-90 50 50)');
    statProgress.style.transition = 'stroke-dasharray 2s ease-out';
    
    const statNumber = document.createElement('div');
    statNumber.className = 'stat-number';
    statNumber.textContent = '0';
    // Increase font size for the number
    statNumber.style.fontSize = '2.5rem'; // Increased from 2rem
    
    const statLabel = document.createElement('div');
    statLabel.className = 'stat-label';
    statLabel.textContent = label;
    // Increase font size for the label
    statLabel.style.fontSize = '1.4rem'; // Increased from 1.2rem
    
    statSvg.appendChild(statBg);
    statSvg.appendChild(statProgress);
    statCircle.appendChild(statSvg);
    statCircle.appendChild(statNumber);
    statItem.appendChild(statCircle);
    statItem.appendChild(statLabel);
    container.appendChild(statItem);
    
    // Use Intersection Observer to trigger animation when visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateStat(statProgress, statNumber, targetValue, fillPercentage);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    observer.observe(statItem);
}

// Update the animateStat function to use the fill percentage
function animateStat(progressElement, numberElement, targetValue, fillPercentage) {
    const circumference = 2 * Math.PI * 45; // r = 45
    const offset = circumference - (fillPercentage / 100) * circumference;
    
    // Set the circle to the desired fill percentage
    progressElement.style.strokeDasharray = `${circumference} ${circumference}`;
    progressElement.style.strokeDashoffset = offset;
    
    // Animate the number
    let currentValue = 0;
    const increment = targetValue / 50; // Adjust for animation speed
    
    const updateNumber = () => {
        currentValue += increment;
        if (currentValue < targetValue) {
            numberElement.textContent = Math.floor(currentValue);
            requestAnimationFrame(updateNumber);
        } else {
            numberElement.textContent = targetValue;
        }
    };
    
    updateNumber();
}
async function fetchUpcomingMovies() {
    try {
        // First try TMDb API for upcoming movies
        const tmdbResponse = await fetch(`${BASE_URL}/movie/upcoming?api_key=${API_KEY}`);
        const tmdbData = await tmdbResponse.json();
        
        if (tmdbData.results && tmdbData.results.length > 0) {
            return tmdbData.results.slice(0, 8);
        } else {
            // Fallback to NewsAPI
            const newsResponse = await fetch(`https://newsapi.org/v2/everything?q=upcoming+movies&apiKey=${NEWSAPI_KEY}&pageSize=8`);
            const newsData = await newsResponse.json();
            
            if (newsData.articles && newsData.articles.length > 0) {
                // Transform news articles to movie-like objects
                return newsData.articles.map(article => ({
                    title: article.title,
                    poster_path: null,
                    release_date: article.publishedAt,
                    overview: article.description,
                    backdrop_path: article.urlToImage
                }));
            }
        }
        
        return [];
    } catch (error) {
        console.error('Error fetching upcoming movies:', error);
        return [];
    }
}
function createTop10Items(items, type) {
    const container = document.createElement('div');
    container.style.display = 'flex';
    
    items.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'top10-item';
        itemDiv.innerHTML = `
            <div class="top10-rank">${index + 1}</div>
            <img src="${item.poster_path ? IMG_PATH + item.poster_path : 'https://via.placeholder.com/60x90'}" 
                 alt="${type === 'movie' ? item.title : item.name}" class="top10-poster"
                 onerror="this.src='https://picsum.photos/seed/${type}${item.id}/60/90.jpg'">
            <div class="top10-info">
                <div class="top10-title">${type === 'movie' ? item.title : item.name}</div>
                <div class="top10-meta">
                    <i class="fas fa-star"></i> ${item.vote_average ? item.vote_average.toFixed(1) : 'N/A'}
                </div>
            </div>
        `;
        
        itemDiv.addEventListener('click', () => {
            currentType = type;
            openModal(item);
        });
        
        container.appendChild(itemDiv);
    });
    
    return container;
}
function createRecommendationCard(item, type, index) {
    const card = document.createElement('div');
    card.className = 'recommendation-card';
    card.innerHTML = `
        <img src="${item.poster_path ? IMG_PATH + item.poster_path : 'https://via.placeholder.com/200x300'}" 
             alt="${type === 'movie' ? item.title : item.name}" class="recommendation-poster"
             onerror="this.src='https://picsum.photos/seed/${type}${item.id}/200/300.jpg'">
        <div class="recommendation-number">${String(index + 1).padStart(2, '0')}</div>
        <div class="recommendation-info">
            <div class="recommendation-title">${type === 'movie' ? item.title : item.name}</div>
            <div class="recommendation-rating">
                <i class="fas fa-star"></i> ${item.vote_average ? item.vote_average.toFixed(1) : 'N/A'}
            </div>
        </div>
    `;
    
    card.addEventListener('click', () => {
        currentType = type;
        openModal(item);
    });
    
    return card;
}
// Function to change hero item manually
function changeHero(direction) {
    // Clear the current interval
    if (heroRotationInterval) {
        clearInterval(heroRotationInterval);
    }
    
    // Update current index
    currentHeroIndex = (currentHeroIndex + direction + heroItems.length) % heroItems.length;
    
    // Update hero content
    updateHeroContent();
    
    // Restart the interval
    heroRotationInterval = setInterval(updateHeroContent, 6000);
}
// ====================== HERO ROTATION ======================
let heroRotationInterval;
let currentHeroIndex = 0;
let heroItems = [];
function setupHeroRotation(movies, series) {
    // Create array with 10 movies and 10 series, alternating
    heroItems = [];
    for (let i = 0; i < 10; i++) {
        if (movies[i]) heroItems.push({ type: 'movie', data: movies[i] });
        if (series[i]) heroItems.push({ type: 'tv', data: series[i] });
    }
    
    // Start rotation
    updateHeroContent();
    heroRotationInterval = setInterval(updateHeroContent, 6000);
}
function updateHeroContent() {
    const item = heroItems[currentHeroIndex];
    const type = item.type;
    const data = item.data;
    
    // Check if we're on mobile (425px or smaller)
    const isMobile = window.innerWidth <= 425.5;
    
    // Update background - use poster for mobile, backdrop for desktop
    const heroBackground = document.getElementById('heroBackground');
    if (isMobile) {
        // Use portrait poster for mobile
        const posterUrl = data.poster_path 
            ? IMG_PATH + data.poster_path 
            : `https://via.placeholder.com/400x600?text=No+Poster`;
        heroBackground.style.backgroundImage = `url('${posterUrl}')`;
        heroBackground.style.backgroundSize = 'cover';
        heroBackground.style.backgroundPosition = 'center top';
    } else {
        // Use landscape backdrop for desktop
        const backdropUrl = data.backdrop_path 
            ? IMG_PATH + data.backdrop_path 
            : `https://via.placeholder.com/1280x720?text=No+Image`;
        heroBackground.style.backgroundImage = `url('${backdropUrl}')`;
        heroBackground.style.backgroundSize = 'cover';
        heroBackground.style.backgroundPosition = 'center center';
    }
    
    // Update title
    document.getElementById('landing-title').textContent = type === 'movie' ? data.title : data.name;
    
    // Update type indicator
    document.getElementById('type-indicator').textContent = type === 'movie' ? 'movies' : 'series';
    
    // Update rating
    const rating = data.vote_average ? data.vote_average.toFixed(1) : "N/A";
    document.getElementById('landing-rating').textContent = rating;
    
    // Update rating circle
    if (rating !== "N/A") {
        const percentage = (parseFloat(rating) / 10) * 100;
        const progressPath = document.getElementById('rating-progress');
        progressPath.style.strokeDasharray = `${percentage}, 100`;
    }
    
    // Update summary
    document.getElementById('landing-summary').textContent = data.overview || "No summary available.";
    
    // Get additional details
    fetchHeroDetails(data.id, type);
    
    // Move to next item
    currentHeroIndex = (currentHeroIndex + 1) % heroItems.length;
}
async function fetchHeroDetails(id, type) {
    try {
        // Get movie/series details
        const detailsRes = await fetch(`${BASE_URL}/${type}/${id}?api_key=${API_KEY}&language=en-US`);
        const details = await detailsRes.json();
        
        // Update runtime
        const runtime = type === 'movie' 
            ? (details.runtime ? formatRuntime(details.runtime) : 'N/A')
            : (details.episode_run_time && details.episode_run_time.length > 0 ? formatRuntime(details.episode_run_time[0]) : 'N/A');
        document.getElementById('landing-runtime').innerHTML = `
            <i class="far fa-clock"></i> ${runtime}
        `;
        
        // Update genres
        const genres = details.genres ? details.genres.map(g => g.name).join(', ') : 'N/A';
        document.getElementById('landing-genre').innerHTML = `<span>Genre:</span> ${genres}`;
        
        // Get cast
        const creditsRes = await fetch(`${BASE_URL}/${type}/${id}/credits?api_key=${API_KEY}`);
        const credits = await creditsRes.json();
        const cast = credits.cast && credits.cast.length > 0 
            ? credits.cast.slice(0, 3).map(actor => actor.name).join(', ') 
            : 'N/A';
        document.getElementById('landing-cast').innerHTML = `<span>Starring:</span> ${cast}`;
        
        // Set up trailer button
        const trailerBtn = document.getElementById('landing-trailer-btn');
        trailerBtn.onclick = async () => {
            try {
                const videosRes = await fetch(`${BASE_URL}/${type}/${id}/videos?api_key=${API_KEY}`);
                const videosData = await videosRes.json();
                const trailer = videosData.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
                
                if (trailer) {
                    // Create full-screen trailer overlay
                    const trailerOverlay = document.createElement('div');
                    trailerOverlay.className = 'trailer-overlay';
                    trailerOverlay.innerHTML = `
                        <div class="trailer-container">
                            <iframe width="100%" height="100%" src="https://www.youtube.com/embed/${trailer.key}?autoplay=1" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
                            <button class="close-trailer">&times;</button>
                        </div>
                    `;
                    document.body.appendChild(trailerOverlay);
                    
                    // Close trailer when button is clicked
                    const closeTrailerBtn = trailerOverlay.querySelector('.close-trailer');
                    closeTrailerBtn.addEventListener('click', () => {
                        trailerOverlay.remove();
                    });
                } else {
                    showToast('No trailer available', 'error');
                }
            } catch (error) {
                console.error('Error loading trailer:', error);
                showToast('Error loading trailer', 'error');
            }
        };
    } catch (error) {
        console.error('Error fetching details for hero:', error);
    }
}
function formatRuntime(minutes) {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
}
// Function to show the landing page
async function showLandingPage() {
    // Hide all other sections
    section.style.display = "none";
    pagination.style.display = "none";
    trailerSlider.style.display = "none";
    favoritesContainer.style.display = "none";
    newsContainer.style.display = "none";
    
    // Show landing page
    landingPageContainer.style.display = 'block';
    
    // Set active tab
    removeActive();
    homeTab.classList.add("active");
    localStorage.setItem("activeTab", "home");
    
    // Fetch and render landing page data if not already loaded
    if (landingPageContainer.children.length === 0) {
        await fetchLandingPageData().then(data => {
            renderLandingPage(data);
            
            // After rendering, update hero content to use mobile images if needed
            if (window.innerWidth <= 425.5) {
                updateHeroContent();
            }
        });
    } else {
        // If landing page is already loaded, update hero content for mobile
        if (window.innerWidth <= 425.5) {
            updateHeroContent();
        }
    }
}
// ====================== TAB SWITCHING WITH TRAILER STOP ======================
function removeActive() {
    const navLinks = document.querySelectorAll(".topnav .menu a");
    navLinks.forEach(link => link.classList.remove("active"));
}
// Home tab functionality
homeTab.addEventListener("click", (e) => {
    e.preventDefault();
    
    // Close genre popup if open
    const genrePopup = document.getElementById('genreSelectionPopup');
    if (genrePopup) {
        genrePopup.remove();
    }

      // Reset country mode
    isCountryMode = false;
    
    // STOP ALL TRAILERS WHEN SWITCHING TO HOME
    stopAllTrailers();
    
    showLandingPage();
    removeActive();
    homeTab.classList.add("active");
    localStorage.setItem("activeTab", "home");
});
moviesTab.addEventListener("click", (e) => {
    e.preventDefault();
    
    // Close genre popup if open
    const genrePopup = document.getElementById('genreSelectionPopup');
    if (genrePopup) {
        genrePopup.remove();
    }

    // Reset country mode
    isCountryMode = false;
    
    currentType = "movie";
    currentAPIUrl = MOVIES_API; 
    currentPage = 1;
    returnItems(currentAPIUrl, currentPage);
    section.style.display = "grid";
    pagination.style.display = "flex";
    trailerSlider.style.display = "flex";
    favoritesContainer.style.display = "none";
    newsContainer.style.display = "none";
    countriesContainer.style.display = "none";
    landingPageContainer.style.display = "none";
    removeActive();
    moviesTab.classList.add("active");
    localStorage.setItem("currentType", currentType);
    localStorage.setItem("currentPage", currentPage);
    localStorage.setItem("activeTab", "movies");
    returnTrailers();
});
seriesTab.addEventListener("click", (e) => {
    e.preventDefault();
    
    // Close genre popup if open
    const genrePopup = document.getElementById('genreSelectionPopup');
    if (genrePopup) {
        genrePopup.remove();
    }

      // Reset country mode
    isCountryMode = false;
    
    currentType = "tv";
    currentAPIUrl = SERIES_API;
    currentPage = 1;
    returnItems(currentAPIUrl, currentPage);
    section.style.display = "grid";
    pagination.style.display = "flex";
    trailerSlider.style.display = "block";
    favoritesContainer.style.display = "none";
    newsContainer.style.display = "none";
    countriesContainer.style.display = "none";
    landingPageContainer.style.display = "none";
    removeActive();
    seriesTab.classList.add("active");
    localStorage.setItem("currentType", currentType);
    localStorage.setItem("currentPage", currentPage);
    localStorage.setItem("activeTab", "series");
    returnSeriesTrailers();
});
favoritesTab.addEventListener("click", (e) => {
    e.preventDefault();
    
    // Close genre popup if open
    const genrePopup = document.getElementById('genreSelectionPopup');
    if (genrePopup) {
        genrePopup.remove();
    }
    
    // STOP ALL TRAILERS WHEN SWITCHING TO FAVORITES
    stopAllTrailers();
    
  // Reset country mode
    isCountryMode = false;

    section.style.display = "none";
    pagination.style.display = "none";
    trailerSlider.style.display = "none";
    favoritesContainer.style.display = "flex";
    favoritesContainer.style.flexDirection = "column";
    favoritesContainer.style.alignItems = "center";
    favoritesContainer.style.justifyContent = "flex-start";
    favoritesContainer.style.minHeight = "70vh";
    favoritesContainer.style.gap = "1rem";
    newsContainer.style.display = "none";
    landingPageContainer.style.display = "none";
    removeActive();
    favoritesTab.classList.add("active");
    localStorage.setItem("activeTab", "favorites");
    renderFavorites();
});
// Genre tab functionality
// Genre tab functionality
genresTab.addEventListener("click", (e) => {
    e.preventDefault();
    
    // STOP ALL TRAILERS WHEN SWITCHING TO GENRES
    stopAllTrailers();
    
    section.style.display = "flex";
    pagination.style.display = "none";
    trailerSlider.style.display = "none";
    favoritesContainer.style.display = "none";
    newsContainer.style.display = "none";
    landingPageContainer.style.display = "none";
    removeActive();
    genresTab.classList.add("active");
    localStorage.setItem("activeTab", "genres");
    
    // Show genre selection as part of the page
    showGenreSelection();
});
// Countries tab functionality
countriesTab.addEventListener("click", (e) => {
    e.preventDefault();
    
    // Stop all trailers when switching to countries
    stopAllTrailers();
    
    // Hide all other sections
    section.style.display = "none";
    pagination.style.display = "none";
    trailerSlider.style.display = "none";
    favoritesContainer.style.display = "none";
    newsContainer.style.display = "none";
    landingPageContainer.style.display = "none";
    
    // Show countries container
    countriesContainer.style.display = "flex";
    
    // Set active tab
    removeActive();
    countriesTab.classList.add("active");
    localStorage.setItem("activeTab", "countries");
    
    // Initialize country explorer if not already done
    if (countriesContainer.children.length === 0) {
        initializeCountryExplorer();
    }
});
// News tab functionality
newsTab.addEventListener("click", async (e) => {
    e.preventDefault();
    
    // Close genre popup if open
    const genrePopup = document.getElementById('genreSelectionPopup');
    if (genrePopup) {
        genrePopup.remove();
    }
    
    // STOP ALL TRAILERS WHEN SWITCHING TO NEWS
    stopAllTrailers();
    
  // Reset country mode
    isCountryMode = false;

    section.style.display = "none";
    pagination.style.display = "none";
    trailerSlider.style.display = "none";
    favoritesContainer.style.display = "none";
    countriesContainer.style.display = "none";
    newsContainer.style.display = "flex";
    newsContainer.style.flexDirection = "column";
    newsContainer.style.zIndex = "10"; // Ensure news container is above other elements
    landingPageContainer.style.display = "none"; // This was missing
    removeActive();
    newsTab.classList.add("active");
    localStorage.setItem("activeTab", "news");
    
    // Fetch and display news
    const newsData = await fetchMovieNews();
    renderNewsPage(newsData);
    
    // Start auto-refresh
    startNewsAutoRefresh();
});
// ====================== INITIALIZATION ======================
document.addEventListener("DOMContentLoaded", async () => {
    // Setup landing page
    await fetchLandingPageData().then(data => {
        renderLandingPage(data);
    });
    
    // Add news container to the body
    document.body.appendChild(newsContainer);
    
    // Add refresh button
    addRefreshButton();
    
    // Add footer
    addFooter();
    
    // Remove the modal close button
    if (closeModal) {
        closeModal.style.display = "none";
    }
    
    // Enhance modal close button
    if (closeModal) {
        closeModal.style.cssText = `
            position: absolute;
            top: 15px;
            right: 25px;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: rgba(245, 197, 24, 0.2);
            color: #f5c518;
            font-size: 24px;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
            z-index: 1001;
            display: none;
        `;
        
        closeModal.addEventListener('mouseenter', () => {
            closeModal.style.background = 'rgba(245, 197, 24, 0.4)';
            closeModal.style.transform = 'scale(1.1)';
        });
        
        closeModal.addEventListener('mouseleave', () => {
            closeModal.style.background = 'rgba(245, 197, 24, 0.2)';
            closeModal.style.transform = 'scale(1)';
        });
    }
    
    // Add this to your DOMContentLoaded event listener
function initHeroSwipe() {
    const heroSection = document.querySelector('.hero-section');
    if (!heroSection) return;
    
    let touchStartX = 0;
    let touchEndX = 0;
    let swipeThreshold = 50; // Minimum distance to be considered a swipe
    
    // Touch start event
    heroSection.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    }, false);
    
    // Touch end event
    heroSection.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, false);
    
    // Handle swipe direction
    function handleSwipe() {
        const swipeDistance = touchEndX - touchStartX;
        
        // Swipe right (previous)
        if (swipeDistance > swipeThreshold) {
            changeHero(-1);
        }
        // Swipe left (next)
        else if (swipeDistance < -swipeThreshold) {
            changeHero(1);
        }
    }
    
    // Optional: Add visual feedback for swiping
    heroSection.addEventListener('touchmove', function(e) {
        const currentX = e.changedTouches[0].screenX;
        const diff = currentX - touchStartX;
        
        // Only apply transform if we're actually swiping (not a tap)
        if (Math.abs(diff) > 5) {
            // Apply a subtle transform to give visual feedback
            heroSection.style.transform = `translateX(${diff * 0.2}px)`;
        }
    }, false);
    
    // Reset transform when touch ends
    heroSection.addEventListener('touchend', function() {
        heroSection.style.transform = '';
    }, false);
}

    // Initialize swipe functionality on mobile
    if (window.innerWidth <= 425.5) {
        initHeroSwipe();
    }

    // Re-initialize on resize if needed
    window.addEventListener('resize', function() {
        if (window.innerWidth <= 425.5) {
            initHeroSwipe();
        }
    });


// Add resize handler for hero images
let resizeTimer;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
            // Only update if we're on the landing page
            if (landingPageContainer.style.display === 'block') {
                updateHeroContent();
            }
        }, 250);
    });

    // Load saved state
    const savedType = localStorage.getItem("currentType") || "movie";
    const savedPage = parseInt(localStorage.getItem("currentPage")) || 1;
    const activeTab = localStorage.getItem("activeTab") || "home";
       
    if (activeTab === "countries") {
        countriesTab.classList.add("active");
        countriesContainer.style.display = "flex";
        if (countriesContainer.children.length === 0) {
            initializeCountryExplorer();
        }
    }
    currentType = savedType;
    currentPage = savedPage;
    currentAPIUrl = currentType === "movie" ? MOVIES_API : SERIES_API;
    
    // Check if user has visited before
    const hasVisited = sessionStorage.getItem('hasVisited');
    
    if (!hasVisited) {
        // First visit - show landing page
        sessionStorage.setItem('hasVisited', 'true');
        showLandingPage();
    } else {
        // Returning visitor - show saved tab
        // Set active tab
        removeActive();
        if (activeTab === "favorites") {
            favoritesTab.classList.add("active");
            favoritesTab.click();
        } else if (activeTab === "news") {
            newsTab.classList.add("active");
            newsTab.click();
        } else if (activeTab === "genres") {
            genresTab.classList.add("active");
            showGenreSelection();
        } else if (activeTab === "series") {
            seriesTab.classList.add("active");
            currentType = "tv";
            currentAPIUrl = SERIES_API;
        } else if (activeTab === "home") {
            homeTab.classList.add("active");
            showLandingPage();
        } else {
            moviesTab.classList.add("active");
            currentType = "movie";
            currentAPIUrl = MOVIES_API;
        }
        
        // Initialize the app
        returnItems(currentAPIUrl, currentPage);
        returnTrailers();
    }
    
    // Load favorites
    renderFavorites();
});

// Add this to your existing JavaScript file, preferably near the DOMContentLoaded event

// Hamburger menu functionality
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const menu = document.querySelector('.topnav .menu');
    const menuOverlay = document.createElement('div');
    menuOverlay.className = 'menu-overlay';
    document.body.appendChild(menuOverlay);

    // Toggle menu function
    function toggleMenu() {
        hamburger.classList.toggle('active');
        menu.classList.toggle('active');
        menuOverlay.classList.toggle('active');
        
        // Prevent body scroll when menu is open
        if (menu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }

    // Hamburger click event
    hamburger.addEventListener('click', toggleMenu);

    // Close menu when clicking on overlay
    menuOverlay.addEventListener('click', toggleMenu);

    // Close menu when clicking on a menu item
    const menuItems = menu.querySelectorAll('a');
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            // Only close menu if we're on mobile (where hamburger is visible)
            if (window.innerWidth <= 1300) {
                toggleMenu();
            }
        });
    });

    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            // If window is resized above mobile breakpoint, ensure menu is properly reset
            if (window.innerWidth > 1300) {
                hamburger.classList.remove('active');
                menu.classList.remove('active');
                menuOverlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        }, 250);
    });

    // Close menu with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && menu.classList.contains('active')) {
            toggleMenu();
        }
    });
});


function handleHeroImageError(img, isMobile) {
    if (isMobile) {
        // Mobile fallback
        img.style.backgroundImage = "url('https://via.placeholder.com/400x600?text=No+Poster')";
    } else {
        // Desktop fallback
        img.style.backgroundImage = "url('https://via.placeholder.com/1280x720?text=No+Image')";
    }
}

// Add this to your DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', function() {
    const heroBackground = document.getElementById('heroBackground');
    if (heroBackground) {
        heroBackground.addEventListener('error', function() {
            const isMobile = window.innerWidth <= 425.5;
            handleHeroImageError(heroBackground, isMobile);
        });
    }
});


// Also, update your existing navigation event listeners to work with the new structure
// For example, your tab event listeners should still work fine, but make sure they're not interfering
    // ====================== NEWS AND UPDATES ======================
    async function fetchMovieNews() {
        try {
            // Use NewsAPI.org for real-time movie news
            const newsApiResponse = await fetch(`https://newsapi.org/v2/everything?q=movies&apiKey=${NEWSAPI_KEY}&pageSize=20&sortBy=publishedAt`);
            const newsApiData = await newsApiResponse.json();
            
            // Also fetch upcoming movies from TMDb
            const upcomingResponse = await fetch(`${BASE_URL}/movie/upcoming?api_key=${API_KEY}&language=en-US&page=1`);
            const upcomingData = await upcomingResponse.json();
            
            // Fetch popular people from TMDb
            const peopleResponse = await fetch(`${BASE_URL}/person/popular?api_key=${API_KEY}&language=en-US&page=1`);
            const peopleData = await peopleResponse.json();
            
            // Fetch additional details for upcoming movies
            const enhancedMovies = await Promise.all(upcomingData.results.slice(0, 5).map(async movie => {
                try {
                    const detailsResponse = await fetch(`${BASE_URL}/movie/${movie.id}?api_key=${API_KEY}&language=en-US`);
                    const details = await detailsResponse.json();
                    
                    // Get videos for trailers
                    const videosResponse = await fetch(`${BASE_URL}/movie/${movie.id}/videos?api_key=${API_KEY}&language=en-US`);
                    const videos = await videosResponse.json();
                    
                    // Get cast information
                    const creditsResponse = await fetch(`${BASE_URL}/movie/${movie.id}/credits?api_key=${API_KEY}&language=en-US`);
                    const credits = await creditsResponse.json();
                    
                    return {
                        ...movie,
                        runtime: details.runtime || 0,
                        genres: details.genres || [],
                        trailer: videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube'),
                        cast: credits.cast.slice(0, 5)
                    };
                } catch (error) {
                    console.error(`Error fetching details for ${movie.title}:`, error);
                    return movie;
                }
            }));
            
            // Format NewsAPI data
            const formattedNews = newsApiData.articles.map(article => ({
                title: article.title,
                description: article.description,
                url: article.url,
                image_url: article.urlToImage,
                published_at: article.publishedAt,
                source: article.source.name || 'NewsAPI',
                category: 'entertainment'
            }));
            
            return {
                news: formattedNews,
                upcomingMovies: enhancedMovies,
                popularPeople: peopleData.results.slice(0, 5)
            };
        } catch (error) {
            console.error('Error fetching news data:', error);
            return {
                news: [],
                upcomingMovies: [],
                popularPeople: []
            };
        }
    }
    function renderNewsPage(data) {
        newsContainer.innerHTML = '';
        
        // Add CSS for news section
        const newsStyles = document.createElement('style');
        newsStyles.textContent = `
            .news-header {
                text-align: center;
                margin-bottom: 2rem;
                padding: 1.5rem;
                background: linear-gradient(135deg, rgba(245,197,24,0.1), rgba(245,197,24,0.05));
                border-radius: 15px;
                border: 1px solid rgba(245,197,24,0.3);
            }
            
            .news-header h1 {
                color: #f5c518;
                font-size: 2.5rem;
                margin-bottom: 0.5rem;
                text-shadow: 0 2px 4px rgba(0,0,0,0.5);
            }
            
            .news-header p {
                color: #ccc;
                font-size: 1.1rem;
                margin: 0;
            }
            
            .news-controls {
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 1rem;
                margin-top: 1rem;
            }
            
            .refresh-btn {
                background: linear-gradient(45deg, #f5c518, #e6b800);
                color: #000;
                border: none;
                border-radius: 8px;
                padding: 0.8rem 1.5rem;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .refresh-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(245,197,24,0.4);
            }
            
            .last-updated {
                color: #aaa;
                font-size: 0.9rem;
            }
            
            .news-status {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
                margin-top: 1rem;
                color: #4CAF50;
            }
            
            .status-indicator {
                width: 10px;
                height: 10px;
                border-radius: 50%;
                background: #4CAF50;
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.5; }
                100% { opacity: 1; }
            }
            
            .news-categories {
                display: flex;
                justify-content: center;
                gap: 1rem;
                margin-bottom: 2rem;
                flex-wrap: wrap;
            }
            
            .news-category {
                background: rgba(255,255,255,0.1);
                color: #fff;
                border: 1px solid rgba(245,197,24,0.3);
                border-radius: 25px;
                padding: 0.7rem 1.5rem;
                cursor: pointer;
                transition: all 0.3s ease;
                font-weight: 500;
            }
            
            .news-category:hover {
                background: rgba(245,197,24,0.2);
                border-color: #f5c518;
            }
            
            .news-category.active {
                background: linear-gradient(45deg, #f5c518, #e6b800);
                color: #000;
                border-color: #f5c518;
            }
            
            .featured-news {
                margin-bottom: 3rem;
            }
            
            .featured-news-card {
                background: linear-gradient(135deg, rgba(0,0,0,0.7), rgba(0,0,0,0.9));
                border-radius: 15px;
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                border: 1px solid rgba(245,197,24,0.3);
            }
            
            .featured-news-image {
                position: relative;
                height: 400px;
                overflow: hidden;
            }
            
            .featured-news-image img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: transform 0.5s ease;
            }
            
            .featured-news-card:hover .featured-news-image img {
                transform: scale(1.05);
            }
            
            .news-card-category {
                position: absolute;
                top: 1rem;
                left: 1rem;
                background: linear-gradient(45deg, #f5c518, #e6b800);
                color: #000;
                padding: 0.5rem 1rem;
                border-radius: 20px;
                font-size: 0.8rem;
                font-weight: bold;
            }
            
            .featured-news-content {
                padding: 2rem;
            }
            
            .featured-news-title {
                color: #f5c518;
                font-size: 2rem;
                margin-bottom: 1rem;
                line-height: 1.2;
            }
            
            .featured-news-excerpt {
                color: #ccc;
                font-size: 1.1rem;
                line-height: 1.6;
                margin-bottom: 1.5rem;
            }
            
            .featured-news-meta {
                display: flex;
                gap: 2rem;
                color: #aaa;
                font-size: 0.9rem;
            }
            
            .news-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                gap: 2rem;
                margin-bottom: 3rem;
            }
            
            .news-card {
                background: linear-gradient(135deg, rgba(0,0,0,0.7), rgba(0,0,0,0.9));
                border-radius: 15px;
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                border: 1px solid rgba(245,197,24,0.3);
                transition: all 0.3s ease;
                cursor: pointer;
                display: flex;
                flex-direction: column;
            }
            
            .news-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 15px 40px rgba(245,197,24,0.3);
                border-color: #f5c518;
            }
            
            .news-card-image {
                position: relative;
                height: 200px;
                overflow: hidden;
            }
            
            .news-card-image img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: transform 0.5s ease;
            }
            
            .news-card:hover .news-card-image img {
                transform: scale(1.05);
            }
            
            .news-card-content {
                padding: 1.5rem;
                flex-grow: 1;
                display: flex;
                flex-direction: column;
            }
            
            .news-card-title {
                color: #f5c518;
                font-size: 1.3rem;
                margin-bottom: 0.8rem;
                line-height: 1.3;
            }
            
            .news-card-excerpt {
                color: #ccc;
                font-size: 0.95rem;
                line-height: 1.5;
                flex-grow: 1;
            }
            
            .news-card-meta {
                display: flex;
                justify-content: space-between;
                margin-top: 1rem;
                color: #aaa;
                font-size: 0.8rem;
            }
            
            .trailer-section {
                margin-bottom: 3rem;
            }
            
            .trailer-section h2 {
                color: #f5c518;
                font-size: 2rem;
                margin-bottom: 1.5rem;
                text-align: center;
            }
            
            .trailer-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 1.5rem;
            }
            
            .trailer-card {
                background: linear-gradient(135deg, rgba(0,0,0,0.7), rgba(0,0,0,0.9));
                border-radius: 15px;
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                border: 1px solid rgba(245,197,24,0.3);
                transition: all 0.3s ease;
                cursor: pointer;
            }
            
            .trailer-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 15px 40px rgba(245,197,24,0.3);
                border-color: #f5c518;
            }
            
            .trailer-card-thumbnail {
                position: relative;
                height: 180px;
                overflow: hidden;
            }
            
            .trailer-card-thumbnail img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: transform 0.5s ease;
            }
            
            .trailer-card:hover .trailer-card-thumbnail img {
                transform: scale(1.05);
            }
            
            .trailer-card-play {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 60px;
                height: 60px;
                background: rgba(245,197,24,0.8);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #000;
                font-size: 1.5rem;
                transition: all 0.3s ease;
            }
            
            .trailer-card:hover .trailer-card-play {
                background: #f5c518;
                transform: translate(-50%, -50%) scale(1.1);
            }
            
            .trailer-card-title {
                padding: 1rem;
                color: #fff;
                font-size: 1rem;
                text-align: center;
                font-weight: 500;
            }
            
            .social-media-section {
                margin-bottom: 3rem;
            }
            
            .social-media-section h2 {
                color: #f5c518;
                font-size: 2rem;
                margin-bottom: 1.5rem;
                text-align: center;
            }
            
            .social-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 1.5rem;
            }
            
            .social-feed {
                background: linear-gradient(135deg, rgba(0,0,0,0.7), rgba(0,0,0,0.9));
                border-radius: 15px;
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                border: 1px solid rgba(245,197,24,0.3);
            }
            
            .social-header {
                padding: 1rem;
                background: rgba(245,197,24,0.1);
                color: #f5c518;
                font-weight: bold;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .social-content {
                padding: 1rem;
            }
            
            .tweet, .instagram-post {
                margin-bottom: 1rem;
                padding-bottom: 1rem;
                border-bottom: 1px solid rgba(255,255,255,0.1);
            }
            
            .tweet:last-child, .instagram-post:last-child {
                margin-bottom: 0;
                padding-bottom: 0;
                border-bottom: none;
            }
            
            .tweet-header, .post-header {
                display: flex;
                gap: 0.5rem;
                margin-bottom: 0.5rem;
            }
            
            .tweet-avatar, .post-image {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: rgba(245,197,24,0.2);
            }
            
            .tweet-user, .post-caption {
                flex-grow: 1;
            }
            
            .tweet-name, .post-caption strong {
                color: #f5c518;
                font-weight: bold;
            }
            
            .tweet-handle, .post-time {
                color: #aaa;
                font-size: 0.8rem;
            }
            
            .tweet-content, .post-caption {
                color: #ccc;
                line-height: 1.4;
            }
            
            .newsletter-section {
                margin: 3rem 0;
                padding: 3rem 0;
                background: linear-gradient(135deg, rgba(245,197,24,0.1), rgba(245,197,24,0.05));
                border-radius: 20px;
                border: 2px solid rgba(245,197,24,0.3);
            }
            
            .newsletter-container {
                max-width: 800px;
                margin: 0 auto;
                text-align: center;
                padding: 0 2rem;
            }
            
            .newsletter-icon {
                font-size: 3rem;
                color: #f5c518;
                margin-bottom: 1rem;
            }
            
            .newsletter-title {
                color: #f5c518;
                font-size: 2.5rem;
                margin-bottom: 1rem;
                font-weight: bold;
                text-shadow: 0 2px 4px rgba(0,0,0,0.3);
            }
            
            .newsletter-description {
                color: #ccc;
                font-size: 1.2rem;
                line-height: 1.6;
                margin-bottom: 2rem;
            }
            
            .newsletter-form {
                display: flex;
                gap: 1rem;
                max-width: 500px;
                margin: 0 auto;
            }
            
            .newsletter-form input {
                flex-grow: 1;
                padding: 1rem;
                border: 2px solid rgba(245,197,24,0.5);
                border-radius: 50px;
                background: rgba(0,0,0,0.5);
                color: #fff;
                font-size: 1rem;
                outline: none;
                transition: all 0.3s ease;
            }
            
            .newsletter-form input:focus {
                border-color: #f5c518;
                box-shadow: 0 0 10px rgba(245,197,24,0.3);
            }
            
            .subscribe-btn {
                background: linear-gradient(45deg, #f5c518, #e6b800);
                color: #000;
                border: none;
                border-radius: 50px;
                padding: 1rem 2rem;
                font-size: 1rem;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                white-space: nowrap;
            }
            
            .subscribe-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(245,197,24,0.4);
            }
            
            .newsletter-privacy {
                color: #aaa;
                font-size: 0.9rem;
                margin-top: 1rem;
            }
            
            .upcoming-movie-card .movie-details {
                display: flex;
                flex-wrap: wrap;
                gap: 1rem;
                margin: 1rem 0;
            }
            
            .movie-detail {
                background: rgba(245, 197, 24, 0.7);
                border-radius: 20px;
                padding: 0.5rem 1rem;
                font-size: 0.9rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .movie-genres, .movie-cast {
                margin: 1rem 0;
                color: #aaa;
                font-size: 0.9rem;
            }
            
            .actor-details {
                display: flex;
                flex-wrap: wrap;
                gap: 1rem;
                margin: 1rem 0;
            }
            
            .actor-detail {
                background: rgba(245, 197, 24, 0.7);
                border-radius: 20px;
                padding: 0.5rem 1rem;
                font-size: 0.9rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .actor-bio {
                color: #ccc;
                font-size: 0.9rem;
                line-height: 1.5;
                margin: 1rem 0;
            }
            
            .trailer-badge {
                position: absolute;
                top: 1rem;
                right: 1rem;
                background: rgba(76,175,80,0.8);
                color: #fff;
                padding: 0.5rem 1rem;
                border-radius: 20px;
                font-size: 0.8rem;
                font-weight: bold;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .trailer-badge:hover {
                background: #4CAF50;
            }
            
            .error-message {
                text-align: center;
                padding: 2rem;
                color: #ff4444;
                background: rgba(255,68,68,0.1);
                border-radius: 10px;
                border: 1px solid rgba(255,68,68,0.3);
            }
            
            /* Actor Detail Card Styles */
            .actor-detail-card {
                background: linear-gradient(135deg, rgba(30,30,30,0.9), rgba(20,20,20,0.9));
                border-radius: 15px;
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                border: 1px solid rgba(245,197,24,0.3);
                margin-bottom: 2rem;
                transition: all 0.3s ease;
            }
            
            .actor-detail-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 15px 40px rgba(245,197,24,0.3);
                border-color: #f5c518;
            }
            
            .actor-header {
                display: flex;
                padding: 1.5rem;
                background: rgba(245,197,24,0.1);
                border-bottom: 1px solid rgba(245,197,24,0.3);
            }
            
            .actor-profile {
                width: 80px;
                height: 80px;
                border-radius: 50%;
                object-fit: cover;
                margin-right: 1.5rem;
                border: 2px solid rgba(245,197,24,0.5);
            }
            
            .actor-info h3 {
                color: #f5c518;
                font-size: 1.5rem;
                margin: 0 0 0.5rem 0;
            }
            
            .actor-info p {
                color: #ccc;
                margin: 0;
                font-size: 0.9rem;
            }
            
            .actor-content {
                padding: 1.5rem;
            }
            
            .actor-bio {
                color: #ddd;
                line-height: 1.6;
                margin-bottom: 1.5rem;
            }
            
            .actor-movies {
                margin-bottom: 1.5rem;
            }
            
            .actor-movies h4 {
                color: #f5c518;
                font-size: 1.2rem;
                margin: 0 0 1rem 0;
            }
            
            .movie-list {
                display: flex;
                flex-wrap: wrap;
                gap: 0.8rem;
            }
            
            .movie-tag {
                background: rgba(245,197,24,0.2);
                color: #f5c518;
                border-radius: 20px;
                padding: 0.5rem 1rem;
                font-size: 0.8rem;
                font-weight: 500;
            }
            
            .actor-awards {
                margin-bottom: 1.5rem;
            }
            
            .actor-awards h4 {
                color: #f5c518;
                font-size: 1.2rem;
                margin: 0 0 1rem 0;
            }
            
            .award-item {
                display: flex;
                align-items: center;
                margin-bottom: 0.8rem;
            }
            
            .award-icon {
                color: #f5c518;
                margin-right: 0.8rem;
                font-size: 1.2rem;
            }
            
            .award-details {
                flex-grow: 1;
            }
            
            .award-name {
                color: #fff;
                font-weight: bold;
                margin-bottom: 0.2rem;
            }
            
            .award-year {
                color: #aaa;
                font-size: 0.8rem;
            }
            
            .actor-stats {
                display: flex;
                justify-content: space-between;
                margin-top: 1.5rem;
                padding-top: 1.5rem;
                border-top: 1px solid rgba(255,255,255,0.1);
            }
            
            .stat-item {
                text-align: center;
            }
            
            .stat-value {
                color: #f5c518;
                font-size: 1.5rem;
                font-weight: bold;
            }
            
            .stat-label {
                color: #aaa;
                font-size: 0.8rem;
            }
        `;
        
        document.head.appendChild(newsStyles);
        
        const header = document.createElement('div');
        header.className = 'news-header';
        header.innerHTML = `
            <h1>Cineverse News & Updates</h1>
            <div class="news-controls">
                <button id="manualRefreshBtn" class="refresh-btn">
                    <i class="fas fa-sync-alt"></i> Refresh Now
                </button>
                <div class="last-updated">
                    Last updated: <span id="lastUpdateTime">${new Date().toLocaleTimeString()}</span>
                </div>
            </div>
            <p>Real-time movie news and updates from NewsAPI.org</p>
            <div class="news-status">
                <div class="status-indicator online"></div>
                <span>Live updates from NewsAPI.org</span>
            </div>
        `;
        newsContainer.appendChild(header);
        
        // Manual refresh button functionality
        document.getElementById('manualRefreshBtn').addEventListener('click', async () => {
            const btn = document.getElementById('manualRefreshBtn');
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> Refreshing...';
            
            const newsData = await fetchMovieNews();
            renderNewsPage(newsData);
            
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh Now';
            showToast("News refreshed successfully", "success");
        });
        
        // Update last updated time
        document.getElementById('lastUpdateTime').textContent = new Date().toLocaleTimeString();
        
        // Create category tabs
        const categories = document.createElement('div');
        categories.className = 'news-categories';
        categories.innerHTML = `
            <div class="news-category active" data-category="all">All News</div>
            <div class="news-category" data-category="movies">Movies</div>
            <div class="news-category" data-category="actors">Actors</div>
            <div class="news-category" data-category="upcoming">Upcoming</div>
            <div class="news-category" data-category="trending">Trending</div>
        `;
        newsContainer.appendChild(categories);
        
        const featuredSection = document.createElement('div');
        featuredSection.className = 'featured-news';
        
        if (data.news.length > 0) {
            const featuredNews = data.news[0];
            const featuredCard = document.createElement('div');
            featuredCard.className = 'featured-news-card';
            featuredCard.innerHTML = `
                <div class="featured-news-image">
                    <img src="${featuredNews.image_url || 'https://via.placeholder.com/800x400?text=Movie+News'}" 
                         alt="${featuredNews.title}"
                         onerror="this.src='https://picsum.photos/seed/movie${Math.floor(Math.random() * 1000)}/800/400.jpg'">
                    <div class="news-card-category">Featured</div>
                </div>
                <div class="featured-news-content">
                    <h2 class="featured-news-title">${featuredNews.title}</h2>
                    <p class="featured-news-excerpt">${featuredNews.description ? featuredNews.description.substring(0, 200) + '...' : 'No description available'}</p>
                    <div class="featured-news-meta">
                        <div class="news-card-date">
                            <i class="far fa-calendar"></i>
                            ${new Date(featuredNews.published_at).toLocaleDateString()}
                        </div>
                        <div class="news-card-source">
                            <i class="far fa-newspaper"></i>
                            ${featuredNews.source || 'Unknown Source'}
                        </div>
                    </div>
                </div>
            `;
            featuredSection.appendChild(featuredCard);
        }
        
        newsContainer.appendChild(featuredSection);
        
        const newsGrid = document.createElement('div');
        newsGrid.className = 'news-grid';
        
        // Add regular news articles
        data.news.forEach((article, index) => {
            if (index === 0) return; // Skip the first one as it's featured
            
            const newsCard = document.createElement('div');
            newsCard.className = 'news-card news-article';
            newsCard.setAttribute('data-category', 'movies');
            newsCard.innerHTML = `
                <div class="news-card-image">
                    <img src="${article.image_url || 'https://via.placeholder.com/400x200?text=Movie+News'}" 
                         alt="${article.title}"
                         onerror="this.src='https://picsum.photos/seed/news${Math.floor(Math.random() * 1000)}/400/200.jpg'">
                    <div class="news-card-category">News</div>
                </div>
                <div class="news-card-content">
                    <h3 class="news-card-title">${article.title}</h3>
                    <p class="news-card-excerpt">${article.description ? article.description.substring(0, 120) + '...' : 'No description available'}</p>
                    <div class="news-card-meta">
                        <div class="news-card-date">
                            <i class="far fa-calendar"></i>
                            ${new Date(article.publishedAt).toLocaleDateString()}
                        </div>
                        <div class="news-card-source">
                            <i class="far fa-newspaper"></i>
                            ${article.source || 'Unknown Source'}
                        </div>
                    </div>
                </div>
            `;
            
            newsCard.addEventListener('click', () => {
                if (article.url) {
                    window.open(article.url, '_blank');
                }
            });
            
            newsGrid.appendChild(newsCard);
        });
        
        // Add upcoming movies section
        data.upcomingMovies.forEach(movie => {
            const newsCard = document.createElement('div');
            newsCard.className = 'news-card upcoming-movie-card';
            newsCard.setAttribute('data-category', 'upcoming');
            
            // Format runtime
            const hours = Math.floor(movie.runtime / 60);
            const minutes = movie.runtime % 60;
            const runtimeStr = movie.runtime ? `${hours}h ${minutes}m` : 'Runtime unknown';
            
            // Format genres
            const genresStr = movie.genres && movie.genres.length > 0 
                ? movie.genres.map(g => g.name).join(', ') 
                : 'Genres unknown';
            
            // Format cast
            const castStr = movie.cast && movie.cast.length > 0 
                ? movie.cast.map(a => a.name).join(', ') 
                : 'Cast unknown';
            
            newsCard.innerHTML = `
                <div class="news-card-image">
                    <img src="${movie.poster_path ? IMG_PATH + movie.poster_path : 'https://via.placeholder.com/400x200?text=Movie+Poster'}" 
                         alt="${movie.title}"
                         onerror="this.src='https://picsum.photos/seed/movie${movie.id}/400/200.jpg'">
                    <div class="news-card-category">Upcoming</div>
                    ${movie.trailer ? '<div class="trailer-badge"><i class="fas fa-play"></i> Trailer</div>' : ''}
                </div>
                <div class="news-card-content">
                    <h3 class="news-card-title">${movie.title}</h3>
                    <p class="news-card-excerpt">${movie.overview ? movie.overview.substring(0, 120) + '...' : 'No overview available'}</p>
                    <div class="movie-details">
                        <div class="movie-detail"><i class="far fa-calendar"></i> ${movie.release_date ? new Date(movie.release_date).toLocaleDateString() : 'TBA'}</div>
                        <div class="movie-detail"><i class="far fa-clock"></i> ${runtimeStr}</div>
                        <div class="movie-detail"><i class="fas fa-star"></i> ${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</div>
                    </div>
                    <div class="movie-genres">${genresStr}</div>
                    <div class="movie-cast"><strong>Cast:</strong> ${castStr}</div>
                </div>
            `;
            
            // Add click event for trailer
            if (movie.trailer) {
                newsCard.addEventListener('click', (e) => {
                    // Check if the click was on the trailer badge
                    if (e.target.closest('.trailer-badge')) {
                        window.open(`https://www.youtube.com/watch?v=${movie.trailer.key}`, '_blank');
                    } else {
                        // Open movie details modal
                        openModal(movie);
                    }
                });
            } else {
                newsCard.addEventListener('click', () => {
                    openModal(movie);
                });
            }
            
            newsGrid.appendChild(newsCard);
        });
        
        // Add actors section with enhanced information
        data.popularPeople.forEach(person => {
            const newsCard = document.createElement('div');
            newsCard.className = 'news-card actor-card';
            newsCard.setAttribute('data-category', 'actors');
            
            // Format birthday
            const birthdayStr = person.birthday && person.birthday !== 'Unknown' 
                ? new Date(person.birthday).toLocaleDateString() 
                : 'Unknown';
            
            // Format known for movies
            const knownForStr = person.known_for_department || 'Acting';
            
            newsCard.innerHTML = `
                <div class="news-card-image">
                    <img src="${person.profile_path ? IMG_PATH + person.profile_path : 'https://via.placeholder.com/400x200?text=Actor+Photo'}" 
                         alt="${person.name}"
                         onerror="this.src='https://picsum.photos/seed/actor${person.id}/400/200.jpg'">
                    <div class="news-card-category">Actor</div>
                </div>
                <div class="news-card-content">
                    <h3 class="news-card-title">${person.name}</h3>
                    <p class="news-card-excerpt"><strong>Known for:</strong> ${knownForStr}</p>
                    <div class="actor-details">
                        <div class="actor-detail"><i class="far fa-calendar"></i> Born: ${birthdayStr}</div>
                        <div class="actor-detail"><i class="fas fa-map-marker-alt"></i> ${person.place_of_birth || 'Unknown'}</div>
                        <div class="actor-detail"><i class="fas fa-fire"></i> Popularity: ${Math.round(person.popularity)}</div>
                    </div>
                    <div class="actor-bio">${person.biography ? person.biography.substring(0, 150) + '...' : 'No biography available'}</div>
                </div>
            `;
            
            newsCard.addEventListener('click', () => {
                // Show detailed actor information
                showActorDetails(person);
            });
            
            newsGrid.appendChild(newsCard);
        });
        
        // Add trending section (simulated)
        const trendingTopics = [
            { title: "Marvel Studios", description: "New Phase 5 movies announced", category: "trending" },
            { title: "DC Universe", description: "James Gunn reveals new lineup", category: "trending" },
            { title: "Oscar Nominations", description: "2023 Academy Awards predictions", category: "trending" },
            { title: "Streaming Wars", description: "Netflix vs Disney+ vs HBO Max", category: "trending" }
        ];
        
        trendingTopics.forEach(topic => {
            const newsCard = document.createElement('div');
            newsCard.className = 'news-card trending-card';
            newsCard.setAttribute('data-category', 'trending');
            newsCard.innerHTML = `
                <div class="news-card-image">
                    <img src="https://picsum.photos/seed/${topic.title.replace(/\s+/g, '')}/400/200.jpg" 
                         alt="${topic.title}"
                         onerror="this.src='https://via.placeholder.com/400x200?text=Image+Not+Available'">
                    <div class="news-card-category">Trending</div>
                </div>
                <div class="news-card-content">
                    <h3 class="news-card-title">${topic.title}</h3>
                    <p class="news-card-excerpt">${topic.description}</p>
                    <div class="news-card-meta">
                        <div class="news-card-date">
                            <i class="far fa-calendar"></i>
                            ${new Date().toLocaleDateString()}
                        </div>
                        <div class="news-card-source">
                            <i class="far fa-newspaper"></i>
                            Trending Now
                        </div>
                    </div>
                </div>
            `;
            
            newsCard.addEventListener('click', () => {
                showToast(`More information about ${topic.title}`, 'info');
            });
            
            newsGrid.appendChild(newsCard);
        });
        
        newsContainer.appendChild(newsGrid);
        
        const trailerSection = document.createElement('div');
        trailerSection.className = 'trailer-section';
        trailerSection.innerHTML = '<h2>Latest Trailers</h2>';
        
        const trailerGrid = document.createElement('div');
        trailerGrid.className = 'trailer-grid';
        
        fetchLatestTrailers(trailerGrid);
        
        trailerSection.appendChild(trailerGrid);
        newsContainer.appendChild(trailerSection);
        
        // Add social media feeds
        addSocialMediaFeeds(newsContainer);
        
        // Add newsletter section
        addNewsletterSection(newsContainer);
        
        const categoryButtons = document.querySelectorAll('.news-category');
        categoryButtons.forEach(button => {
            button.addEventListener('click', () => {
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                const category = button.getAttribute('data-category');
                const newsCards = document.querySelectorAll('.news-card');
                
                newsCards.forEach(card => {
                    if (category === 'all') {
                        card.style.display = 'flex';
                    } else {
                        const cardCategory = card.getAttribute('data-category');
                        if (cardCategory === category) {
                            card.style.display = 'flex';
                        } else {
                            // Check if it's a news article and matches by keyword
                            if (card.classList.contains('news-article')) {
                                const title = card.querySelector('.news-card-title').textContent.toLowerCase();
                                const excerpt = card.querySelector('.news-card-excerpt').textContent.toLowerCase();
                                
                                if (category === 'actors') {
                                    const actorKeywords = ['actor', 'actress', 'celebrity', 'star', 'hollywood', 'cast'];
                                    const hasActorKeyword = actorKeywords.some(keyword => 
                                        title.includes(keyword) || excerpt.includes(keyword)
                                    );
                                    
                                    if (hasActorKeyword) {
                                        card.style.display = 'flex';
                                    } else {
                                        card.style.display = 'none';
                                    }
                                } else if (category === 'upcoming') {
                                    const upcomingKeywords = ['upcoming', 'release', 'premiere', 'coming soon', 'future'];
                                    const hasUpcomingKeyword = upcomingKeywords.some(keyword => 
                                        title.includes(keyword) || excerpt.includes(keyword)
                                    );
                                    
                                    if (hasUpcomingKeyword) {
                                        card.style.display = 'flex';
                                    } else {
                                        card.style.display = 'none';
                                    }
                                } else {
                                    card.style.display = 'none';
                                }
                            } else {
                                card.style.display = 'none';
                            }
                        }
                    }
                });
            });
        });
    }
    
    // Function to show detailed actor information
    async function showActorDetails(actor) {
        try {
            // Fetch detailed actor information
            const actorDetails = await fetchActorDetails(actor.id);
            
            if (!actorDetails) {
                showToast('Unable to load actor details', 'error');
                return;
            }
            
            // Create actor detail modal
            const actorModal = document.createElement('div');
            actorModal.className = 'actor-detail-modal';
            actorModal.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 90%;
                max-width: 800px;
                max-height: 90vh;
                background: linear-gradient(135deg, #000000, #1f1f1f);
                border: 2px solid #f5c518;
                border-radius: 15px;
                padding: 0;
                z-index: 1002;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                overflow: hidden;
                display: flex;
                flex-direction: column;
            `;
            
            // Format birthday
            const birthdayStr = actorDetails.birthday 
                ? new Date(actorDetails.birthday).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })
                : 'Unknown';
            
            // Calculate age if birthday is available
            let ageStr = 'Unknown';
            if (actorDetails.birthday) {
                const birthDate = new Date(actorDetails.birthday);
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();
                
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }
                
                ageStr = `${age} years old`;
            }
            
            // Modal content
            actorModal.innerHTML = `
                <div class="actor-header">
                    <img src="${actorDetails.profile_path ? IMG_PATH + actorDetails.profile_path : 'https://via.placeholder.com/80x80?text=Actor'}" 
                         alt="${actorDetails.name}" class="actor-profile"
                         onerror="this.src='https://picsum.photos/seed/actor${actorDetails.id}/80/80.jpg'">
                    <div class="actor-info">
                        <h3>${actorDetails.name}</h3>
                        <p><i class="fas fa-birthday-cake"></i> ${birthdayStr} (${ageStr})</p>
                        <p><i class="fas fa-map-marker-alt"></i> ${actorDetails.place_of_birth || 'Unknown birthplace'}</p>
                    </div>
                    <button class="close-actor-modal" style="background: none; border: none; color: #f5c518; font-size: 1.5rem; cursor: pointer; padding: 0.5rem;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="actor-content">
                    <div class="actor-bio">
                        ${actorDetails.biography || 'No biography available.'}
                    </div>
                    
                    <div class="actor-movies">
                        <h4><i class="fas fa-film"></i> Popular Movies</h4>
                        <div class="movie-list">
                            ${actorDetails.popularMovies.map(movie => 
                                `<span class="movie-tag">${movie.title || movie.name} (${movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'})</span>`
                            ).join('')}
                        </div>
                    </div>
                    
                    <div class="actor-tv">
                        <h4><i class="fas fa-tv"></i> TV Shows</h4>
                        <div class="movie-list">
                            ${actorDetails.popularTVShows.map(show => 
                                `<span class="movie-tag">${show.title || show.name} (${show.first_air_date ? new Date(show.first_air_date).getFullYear() : 'N/A'})</span>`
                            ).join('')}
                        </div>
                    </div>
                    
                    ${actorDetails.upcomingMovies.length > 0 ? `
                        <div class="actor-upcoming">
                            <h4><i class="fas fa-calendar-alt"></i> Upcoming Projects</h4>
                            <div class="movie-list">
                                ${actorDetails.upcomingMovies.map(movie => 
                                    `<span class="movie-tag">${movie.title} (${movie.release_date ? new Date(movie.release_date).toLocaleDateString() : 'TBA'})</span>`
                                ).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="actor-stats">
                        <div class="stat-item">
                            <div class="stat-value">${actorDetails.totalMovies || 0}</div>
                            <div class="stat-label">Movies</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${actorDetails.totalTVShows || 0}</div>
                            <div class="stat-label">TV Shows</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${Math.round(actorDetails.popularity)}</div>
                            <div class="stat-label">Popularity</div>
                        </div>
                    </div>
                </div>
            `;
            
            // Add modal to body
            document.body.appendChild(actorModal);
            
            // Close modal functionality
            const closeBtn = actorModal.querySelector('.close-actor-modal');
            closeBtn.addEventListener('click', () => {
                actorModal.remove();
            });
            
            // Close modal when clicking outside
            window.addEventListener('click', function closeOnOutsideClick(e) {
                if (!actorModal.contains(e.target)) {
                    actorModal.remove();
                    window.removeEventListener('click', closeOnOutsideClick);
                }
            });
            
        } catch (error) {
            console.error('Error showing actor details:', error);
            showToast('Error loading actor details', 'error');
        }
    }
    
    // Function to fetch detailed actor information
    async function fetchActorDetails(actorId) {
        try {
            // Fetch actor details
            const detailsRes = await fetch(`${BASE_URL}/person/${actorId}?api_key=${API_KEY}&language=en-US`);
            const details = await detailsRes.json();
            
            // Fetch actor movie credits
            const creditsRes = await fetch(`${BASE_URL}/person/${actorId}/movie_credits?api_key=${API_KEY}&language=en-US`);
            const credits = await creditsRes.json();
            
            // Fetch actor TV credits
            const tvCreditsRes = await fetch(`${BASE_URL}/person/${actorId}/tv_credits?api_key=${API_KEY}&language=en-US`);
            const tvCredits = await tvCreditsRes.json();
            
            // Get popular movies (top 5 by popularity)
            const popularMovies = credits.cast
                .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
                .slice(0, 5);
            
            // Get popular TV shows (top 3 by popularity)
            const popularTVShows = tvCredits.cast
                .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
                .slice(0, 3);
            
            // Get upcoming movies
            const upcomingMovies = credits.cast
                .filter(movie => movie.release_date && new Date(movie.release_date) > new Date())
                .sort((a, b) => new Date(a.release_date) - new Date(b.release_date))
                .slice(0, 3);
            
            return {
                ...details,
                popularMovies,
                popularTVShows,
                upcomingMovies,
                totalMovies: credits.cast.length,
                totalTVShows: tvCredits.cast.length
            };
        } catch (error) {
            console.error(`Error fetching details for actor ${actorId}:`, error);
            return null;
        }
    }
    
    function addNewsletterSection(container) {
        const newsletterSection = document.createElement('div');
        newsletterSection.className = 'newsletter-section';
        newsletterSection.innerHTML = `
            <div class="newsletter-container">
                <div class="newsletter-icon">
                    <i class="fas fa-envelope-open-text"></i>
                </div>
                <h2 class="newsletter-title">Cineverse Newsletter</h2>
                <p class="newsletter-description">
                    Subscribe to our newsletter and get the latest movie news, reviews, and exclusive content delivered directly to your inbox.
                </p>
                <div class="newsletter-form">
                    <input type="email" id="newsletterEmail" placeholder="Enter your email address" required>
                    <button id="subscribeBtn" class="subscribe-btn">Subscribe</button>
                </div>
                <p class="newsletter-privacy">
                    We respect your privacy. Unsubscribe at any time.
                </p>
            </div>
        `;
        
        container.appendChild(newsletterSection);
        
        // Add subscription functionality
        document.getElementById('subscribeBtn').addEventListener('click', () => {
            const emailInput = document.getElementById('newsletterEmail');
            const email = emailInput.value.trim();
            
            if (!email) {
                showToast("Please enter your email address", "error");
                return;
            }
            
            // Simple email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showToast("Please enter a valid email address", "error");
                return;
            }
            
            // Show loading state
            const subscribeBtn = document.getElementById('subscribeBtn');
            const originalText = subscribeBtn.textContent;
            subscribeBtn.disabled = true;
            subscribeBtn.textContent = "Subscribing...";
            
            // Simulate API call
            setTimeout(() => {
                // Reset button
                subscribeBtn.disabled = false;
                subscribeBtn.textContent = originalText;
                
                // Clear input
                emailInput.value = "";
                
                // Show success popup
                showNewsletterSuccessPopup();
            }, 1500);
        });
    }
    function showNewsletterSuccessPopup() {
        // Remove existing popup if any
        const existingPopup = document.getElementById('newsletterSuccessPopup');
        if (existingPopup) {
            existingPopup.remove();
        }
        
        // Create popup container
        const popup = document.createElement('div');
        popup.id = 'newsletterSuccessPopup';
        popup.className = 'newsletter-success-popup';
        popup.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 90%;
            max-width: 500px;
            background: linear-gradient(135deg, #000000, #1f1f1f);
            border: 2px solid #f5c518;
            border-radius: 15px;
            padding: 30px;
            z-index: 1002;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            text-align: center;
            color: #fff;
            animation: fadeIn 0.3s ease;
        `;
        
        // Add animation keyframes if not already added
        if (!document.getElementById('fadeInKeyframes')) {
            const style = document.createElement('style');
            style.id = 'fadeInKeyframes';
            style.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
                    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Create popup content
        const icon = document.createElement('div');
        icon.className = 'popup-icon';
        icon.innerHTML = '<i class="fas fa-check-circle" style="color: #4CAF50; font-size: 3rem;"></i>';
        
        const title = document.createElement('h3');
        title.textContent = 'Successfully Subscribed!';
        title.style.cssText = `
            color: #4CAF50;
            margin: 20px 0 10px 0;
            font-size: 1.8rem;
            font-weight: bold;
        `;
        
        const message = document.createElement('p');
        message.textContent = 'Thank you for subscribing to Cineverse newsletter. You will now receive daily movie news and updates.';
        message.style.cssText = `
            font-size: 1.1rem;
            margin: 0 0 20px 0;
            line-height: 1.4;
        `;
        
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Close';
        closeBtn.style.cssText = `
            background: linear-gradient(45deg, #f5c518, #e6b800);
            color: #fff;
            border: none;
            border-radius: 8px;
            padding: 10px 25px;
            font-size: 1rem;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
        `;
        
        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.transform = 'scale(1.05)';
            closeBtn.style.boxShadow = '0 5px 15px rgba(76, 175, 80, 0.4)';
        });
        
        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.transform = 'scale(1)';
            closeBtn.style.boxShadow = 'none';
        });
        
        closeBtn.addEventListener('click', () => {
            popup.remove();
        });
        
        popup.appendChild(icon);
        popup.appendChild(title);
        popup.appendChild(message);
        popup.appendChild(closeBtn);
        
        document.body.appendChild(popup);
        
        // Auto-close after 5 seconds
        setTimeout(() => {
            if (popup.parentNode) {
                popup.style.animation = 'fadeOut 0.3s ease';
                setTimeout(() => {
                    if (popup.parentNode) {
                        popup.remove();
                    }
                }, 300);
            }
        }, 5000);
        
        // Add fadeOut animation if not already added
        if (!document.getElementById('fadeOutKeyframes')) {
            const style = document.createElement('style');
            style.id = 'fadeOutKeyframes';
            style.textContent = `
                @keyframes fadeOut {
                    from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                    to { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
                }
            `;
            document.head.appendChild(style);
        }
    }
    async function fetchLatestTrailers(container) {
        try {
            const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=1`);
            const data = await response.json();
            
            const trailerPromises = data.results.slice(0, 6).map(async movie => {
                try {
                    const videoResponse = await fetch(`${BASE_URL}/movie/${movie.id}/videos?api_key=${API_KEY}`);
                    const videoData = await videoResponse.json();
                    
                    const trailer = videoData.results.find(video => 
                        video.type === 'Trailer' && video.site === 'YouTube'
                    );
                    
                    if (trailer) {
                        return {
                            title: movie.title,
                            trailerKey: trailer.key,
                            thumbnail: IMG_PATH + movie.backdrop_path
                        };
                    }
                    return null;
                } catch (error) {
                    console.error('Error fetching trailer for movie:', movie.title, error);
                    return null;
                }
            });
            
            const trailers = await Promise.all(trailerPromises);
            
            trailers.filter(trailer => trailer !== null).forEach(trailer => {
                const trailerCard = document.createElement('div');
                trailerCard.className = 'trailer-card';
                trailerCard.innerHTML = `
                    <div class="trailer-card-thumbnail">
                        <img src="${trailer.thumbnail || 'https://via.placeholder.com/400x225?text=Trailer'}" 
                             alt="${trailer.title}"
                             onerror="this.src='https://picsum.photos/seed/trailer${Math.floor(Math.random() * 1000)}/400/225.jpg'">
                        <div class="trailer-card-play">
                            <i class="fas fa-play"></i>
                        </div>
                    </div>
                    <div class="trailer-card-title">${trailer.title}</div>
                `;
                
                trailerCard.addEventListener('click', () => {
                    window.open(`https://www.youtube.com/watch?v=${trailer.trailerKey}`, '_blank');
                });
                
                container.appendChild(trailerCard);
            });
        } catch (error) {
            console.error('Error fetching latest trailers:', error);
            
            container.innerHTML = `
                <div class="error-message">
                    <p>Unable to load trailers at this time. Please check your internet connection.</p>
                </div>
            `;
        }
    }
    function addSocialMediaFeeds(container) {
        const socialSection = document.createElement('div');
        socialSection.className = 'social-media-section';
        socialSection.innerHTML = '<h2>Social Media Buzz</h2>';
        
        const socialGrid = document.createElement('div');
        socialGrid.className = 'social-grid';
        
        // Add Twitter feed placeholder
        const twitterFeed = document.createElement('div');
        twitterFeed.className = 'social-feed twitter-feed';
        twitterFeed.innerHTML = `
            <div class="social-header">
                <i class="fab fa-twitter"></i> Twitter
            </div>
            <div class="social-content">
                <div class="tweet">
                    <div class="tweet-header">
                        <div class="tweet-avatar"></div>
                        <div class="tweet-user">
                            <div class="tweet-name">CineverseNews</div>
                            <div class="tweet-handle">@cinerversenews</div>
                        </div>
                    </div>
                    <div class="tweet-content">
                        New trailer just dropped for the upcoming superhero movie! #movies #trailer
                    </div>
                    <div class="tweet-time">2h ago</div>
                </div>
                <div class="tweet">
                    <div class="tweet-header">
                        <div class="tweet-avatar"></div>
                        <div class="tweet-user">
                            <div class="tweet-name">CinemaInsider</div>
                            <div class="tweet-handle">@cinemainsider</div>
                        </div>
                    </div>
                    <div class="tweet-content">
                        Box office records broken this weekend by the new blockbuster! #boxoffice #records
                    </div>
                    <div class="tweet-time">5h ago</div>
                </div>
            </div>
        `;
        
        // Add Instagram feed placeholder
        const instagramFeed = document.createElement('div');
        instagramFeed.className = 'social-feed instagram-feed';
        instagramFeed.innerHTML = `
            <div class="social-header">
                <i class="fab fa-instagram"></i> Instagram
            </div>
            <div class="social-content">
                <div class="instagram-post">
                    <div class="post-image"></div>
                    <div class="post-caption">
                        <strong>ActorName</strong> On set today filming our new project! Coming soon to theaters near you. 🎬
                    </div>
                    <div class="post-time">5h ago</div>
                </div>
                <div class="instagram-post">
                    <div class="post-image"></div>
                    <div class="post-caption">
                        <strong>DirectorName</strong> Behind the scenes magic happening right now! Can't wait to share this with you all. 🎥✨
                    </div>
                    <div class="post-time">1d ago</div>
                </div>
            </div>
        `;
        
        socialGrid.appendChild(twitterFeed);
        socialGrid.appendChild(instagramFeed);
        socialSection.appendChild(socialGrid);
        container.appendChild(socialSection);
    }
    // ====================== COMPACT TOAST NOTIFICATIONS ======================
    function showToast(message, type) {
        const existingToasts = document.querySelectorAll('.compact-toast');
        existingToasts.forEach(toast => toast.remove());
        
        const toast = document.createElement("div");
        toast.className = `compact-toast ${type}`;
        toast.innerHTML = `<span>${message}</span>`;
        
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
        
        requestAnimationFrame(() => {
            toast.style.opacity = "1";
            toast.style.transform = "translateX(0)";
        });
        
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
        if (trailerContainer) {
            trailerContainer.innerHTML = "";
        }
        
        if (trailerEmbed) {
            trailerEmbed.innerHTML = "";
            trailerEmbed.style.display = "none";
        }
        
        if (modalImage && modal.style.display === "flex") {
            modalImage.style.display = "block";
        }
    }
    // ====================== YOUTUBE PLAYER MANAGEMENT ======================
    let player;
    let trailerPlayers = [];
    let currentTrailerIndex = 0;
    function onYouTubeIframeAPIReady() {
        console.log("YouTube IFrame API is ready");
    }
    function createYouTubePlayer(containerId, videoId, index) {
        return new YT.Player(containerId, {
            videoId: videoId,
            playerVars: {
                'autoplay': 1,
                'controls': 0,
                'rel': 0,
                'modestbranding': 1,
                'showinfo': 0
            },
            events: {
                'onStateChange': function(event) {
                    if (event.data == YT.PlayerState.ENDED) {
                        currentTrailerIndex = (index + 1) % trailers.length;
                        playTrailer(currentTrailerIndex);
                    }
                }
            }
        });
    }
    // ====================== FETCH ITEMS ======================
    async function returnItems(url, page = 1) {
    try {
        const fullUrl = `${url}&page=${page}`;
        console.log("Fetching URL:", fullUrl);
        
        const res = await fetch(fullUrl);
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        console.log("API Response:", data);
        
        if (data.results && data.results.length > 0) {
            renderItemsInGrid(data.results);
            renderPagination(data.total_pages);
        } else {
            console.log("No results found");
            showToast("No results found", "info");
            main.innerHTML = `<div style="text-align: center; padding: 2rem; color: #f5c518;">
                <h2>No results found</h2>
                <p>Try a different search term</p>
            </div>`;
        }
    } catch (error) {
        console.error("Error in returnItems:", error);
        showToast("Error loading content. Please try again.", "error");
        main.innerHTML = `<div style="text-align: center; padding: 2rem; color: #ff4444;">
            <h2>Error loading content</h2>
            <p>Please check your internet connection and try again</p>
        </div>`;
    }
}

function renderItemsInGrid(items) {
    main.innerHTML = "";
    
    // Create a grid container
    const gridContainer = document.createElement("div");
    gridContainer.className = "items-grid-container";
    
    items.forEach(item => {
        const card = document.createElement("div");
        card.className = "movie-card";
        
        // Create poster container
        const posterContainer = document.createElement("div");
        posterContainer.className = "movie-poster-container";
        
        const image = document.createElement("img");
        image.className = "movie-poster";
        image.src = item.poster_path ? IMG_PATH + item.poster_path : "https://via.placeholder.com/300x450?text=No+Image";
        image.alt = currentType === "movie" ? item.title : item.name;
        
        // Create play button
        const playButton = document.createElement("div");
        playButton.className = "play-button";
        
        // Create year badge
        const yearBadge = document.createElement("div");
        yearBadge.className = "year-badge";
        const year = item.release_date ? new Date(item.release_date).getFullYear() : 
                     item.first_air_date ? new Date(item.first_air_date).getFullYear() : 'N/A';
        yearBadge.textContent = year;
        
        // Create genre tags (placeholder - you can fetch actual genres if needed)
        const genreTags = document.createElement("div");
        genreTags.className = "genre-tags";
        
        // Add some placeholder genre tags
        const genres = ['Action', 'Drama', 'Thriller']; // Replace with actual genres
        genres.slice(0, 2).forEach(genre => {
            const tag = document.createElement("span");
            tag.className = "genre-tag";
            tag.textContent = genre;
            genreTags.appendChild(tag);
        });
        
        // Create movie info
        const movieInfo = document.createElement("div");
        movieInfo.className = "movie-info";
        
        const title = document.createElement("h3");
        title.className = "movie-title";
        title.textContent = currentType === "movie" ? item.title : item.name;
        
        const movieMeta = document.createElement("div");
        movieMeta.className = "movie-meta";
        
        const rating = document.createElement("div");
        rating.className = "movie-rating";
        rating.innerHTML = `<i class="fas fa-star"></i> ${item.vote_average ? item.vote_average.toFixed(1) : 'N/A'}`;
        
        // Build the structure
        posterContainer.appendChild(image);
        posterContainer.appendChild(playButton);
        posterContainer.appendChild(yearBadge);
        posterContainer.appendChild(genreTags);
        
        movieMeta.appendChild(rating);
        movieInfo.appendChild(title);
        movieInfo.appendChild(movieMeta);
        
        card.appendChild(posterContainer);
        card.appendChild(movieInfo);
        
        gridContainer.appendChild(card);
        
        card.addEventListener("click", () => openModal(item));
    });
    
    main.appendChild(gridContainer);
}
    // ====================== RENDER ITEMS ======================
    function renderItems(items) {
    main.innerHTML = "";
    
    // Create a wrapper div for the grid
    const gridWrapper = document.createElement("div");
    gridWrapper.className = "movies-grid-wrapper";
    
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
        gridWrapper.appendChild(div_card);
        
        div_card.addEventListener("click", () => openModal(item));
    });
    
    main.appendChild(gridWrapper);
}
    // ====================== RECOMMENDATIONS SYSTEM ======================
    async function getRecommendations(item) {
        try {
            const recRes = await fetch(`${BASE_URL}/${currentType}/${item.id}/recommendations?api_key=${API_KEY}&page=1`);
            const recData = await recRes.json();
            
            if (recData.results && recData.results.length > 0) {
                return recData.results.slice(0, 8);
            }
            
            const genreIds = item.genre_ids ? item.genre_ids.slice(0, 2).join(',') : '';
            if (genreIds) {
                const genreUrl = `${BASE_URL}/discover/${currentType}?api_key=${API_KEY}&with_genres=${genreIds}&sort_by=popularity.desc&page=1`;
                const genreRes = await fetch(genreUrl);
                const genreData = await genreRes.json();
                
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
            scrollbar-width: thin;
            scrollbar-color: #f5c518 transparent;
        `;
        
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
            font-size: 24px;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
        `;
        
        closeBtn.addEventListener('click', () => {
            panel.style.left = '-400px';
            setTimeout(() => panel.remove(), 400);
        });
        
        header.appendChild(title);
        header.appendChild(closeBtn);
        panel.appendChild(header);
        
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
            
            card.addEventListener('click', async () => {
                panel.style.left = '-400px';
                setTimeout(() => panel.remove(), 400);
                const recType = currentType;
                await openModal(rec);
            });
            
            grid.appendChild(card);
        });
        
        panel.appendChild(grid);
        document.body.appendChild(panel);
        
        setTimeout(() => {
            panel.style.left = '20px';
        }, 100);
        
        return panel;
    }
    // ====================== SERIES SELECTION POPUP ======================
    function showSeriesSelectionPopup(tvShow) {
        const existingPopup = document.getElementById('seriesSelectionPopup');
        if (existingPopup) {
            existingPopup.remove();
        }
        
        const popup = document.createElement('div');
        popup.id = 'seriesSelectionPopup';
        popup.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 80%;
            max-width: 600px;
            max-height: 80vh;
            background: linear-gradient(135deg, #000000, #1f1f1f);
            border: 2px solid #f5c518;
            border-radius: 15px;
            padding: 20px;
            z-index: 1001;
            overflow-y: auto;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            scrollbar-width: thin;
            scrollbar-color: #f5c518 transparent;
        `;
        
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
        title.textContent = `Select Season and Episode: ${tvShow.name}`;
        title.style.cssText = `
            color: #f5c518;
            margin: 0;
            font-size: 1.5rem;
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
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        `;
        
        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.background = 'rgba(245, 197, 24, 0.2)';
            closeBtn.style.transform = 'scale(1.1)';
        });
        
        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.background = 'none';
            closeBtn.style.transform = 'scale(1)';
        });
        
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(popup);
        });
        
        header.appendChild(title);
        header.appendChild(closeBtn);
        popup.appendChild(header);
        
        const seasonsContainer = document.createElement('div');
        seasonsContainer.id = 'seasonsContainer';
        
        fetch(`${BASE_URL}/tv/${tvShow.id}?api_key=${API_KEY}&language=en-US`)
            .then(res => res.json())
            .then(data => {
                data.seasons.forEach(season => {
                    const seasonBox = document.createElement('div');
                    seasonBox.className = 'season-box';
                    seasonBox.style.cssText = `
                        margin-bottom: 15px;
                        border: 1px solid rgba(245,197,24,0.3);
                        border-radius: 10px;
                        overflow: hidden;
                    `;
                    
                    const seasonTitle = document.createElement('div');
                    seasonTitle.textContent = `${season.name} (${season.episode_count} episodes)`;
                    seasonTitle.style.cssText = `
                        background: rgba(245,197,24,0.1);
                        color: #f5c518;
                        padding: 10px 15px;
                        cursor: pointer;
                        font-weight: bold;
                    `;
                    
                    const episodesContainer = document.createElement('div');
                    episodesContainer.className = 'episodes-container';
                    episodesContainer.style.display = 'none';
                    episodesContainer.style.cssText = `
                        max-height: 200px;
                        overflow-y: auto;
                        background: rgba(0,0,0,0.2);
                    `;
                    
                    for (let ep = 1; ep <= season.episode_count; ep++) {
                        const epBtn = document.createElement('button');
                        epBtn.className = 'episode-btn';
                        epBtn.textContent = `Episode ${ep}`;
                        epBtn.style.cssText = `
                            display: block;
                            width: 100%;
                            padding: 8px 15px;
                            background: transparent;
                            color: #fff;
                            border: none;
                            text-align: left;
                            cursor: pointer;
                            transition: background 0.3s;
                        `;
                        
                        epBtn.addEventListener('click', () => {
                            document.body.removeChild(popup);
                            
                            const episodeTitle = document.getElementById("episodeTitle");
                            if (episodeTitle) {
                                episodeTitle.textContent = `${tvShow.name} Season ${season.season_number} Episode ${ep}`;
                            }
                            
                            const downloadOptions = document.getElementById("downloadOptions");
                            downloadOptions.style.display = "block";
                            
                            const episodeItem = {
                                title: tvShow.name,
                                name: tvShow.name,
                                first_air_date: tvShow.first_air_date,
                                season_number: season.season_number,
                                episode_number: ep
                            };
                            
                            setupEpisodeDownloadButtons(tvShow, season.season_number, ep);
                            checkAndUpdateAvailability(episodeItem);
                        });
                        
                        episodesContainer.appendChild(epBtn);
                    }
                    
                    seasonTitle.addEventListener('click', () => {
                        episodesContainer.style.display = episodesContainer.style.display === 'none' ? 'block' : 'none';
                    });
                    
                    seasonBox.appendChild(seasonTitle);
                    seasonBox.appendChild(episodesContainer);
                    seasonsContainer.appendChild(seasonBox);
                });
            })
            .catch(err => {
                console.error(err);
                showToast("Error loading series data", "error");
            });
        
        popup.appendChild(seasonsContainer);
        document.body.appendChild(popup);
    }
    function setupEpisodeDownloadButtons(tvShow, seasonNumber, episodeNumber) {
        document.querySelectorAll(".source-btn").forEach(btn => {
            const site = btn.getAttribute("data-site");
            btn.onclick = () => {
                let query = "";
                let searchUrl = "";
                switch(site) {
                    case "waploaded":
                        query = encodeURIComponent(`${tvShow.name} Season ${seasonNumber} Episode ${episodeNumber}`);
                        searchUrl = `https://www.waploaded.com/search?q=${query}`;
                        break;
                    case "nkiri":
                        query = encodeURIComponent(`${tvShow.name} Season ${seasonNumber} Episode ${episodeNumber}`);
                        searchUrl = `https://nkiri.com/?s=${query}`;
                        break;
                    case "stagatv":
                        query = encodeURIComponent(`${tvShow.name} Season ${seasonNumber} Episode ${episodeNumber}`);
                        searchUrl = `https://www.stagatv.com/?s=${query}`;
                        break;
                    case "netnaija":
                        query = encodeURIComponent(`${tvShow.name} Season ${seasonNumber} Episode ${episodeNumber}`);
                        searchUrl = `https://www.thenetnaija.net/search?t=${query}`;
                        break;
                    case "fzmovies":
                        query = encodeURIComponent(`${tvShow.name} Season ${seasonNumber}`);
                        searchUrl = `https://fzmovie.co.za/search.php?searchname=${query}`;
                        break;
                    case "o2tvseries":
                        query = encodeURIComponent(`${tvShow.name} Season ${seasonNumber}`);
                        searchUrl = `https://o2tvseries.com/search?q=${query}`;
                        break;
                    case "toxicwap":
                        query = encodeURIComponent(`${tvShow.name} Season ${seasonNumber} Episode ${episodeNumber}`);
                        searchUrl = `https://newtoxic.com/search.php?search=${query}`;
                        break;
                    case "9jarocks":
                        query = encodeURIComponent(`${tvShow.name} Season ${seasonNumber} Episode ${episodeNumber}`);
                        searchUrl = `https://9jarocks.net/search?q=${query}`;
                        break;
                    case "netflix":
                        query = encodeURIComponent(`${tvShow.name}`);
                        searchUrl = `https://www.netflix.com/search?q=${query}`;
                        break;
                    case "yts":
                        query = encodeURIComponent(`${tvShow.name} Season ${seasonNumber}`);
                        searchUrl = `https://yts.mx/browse-movies/${query}`;
                        break;
                    case "eztv":
                        query = encodeURIComponent(`${tvShow.name} Season ${seasonNumber}`);
                        searchUrl = `https://eztv.re/search/${query}`;
                        break;
                    case "piratebay":
                        query = encodeURIComponent(`${tvShow.name} Season ${seasonNumber}`);
                        searchUrl = `https://thepiratebay.org/search.php?q=${query}`;
                        break;
                    case "limetorrents":
                        query = encodeURIComponent(`${tvShow.name} Season ${seasonNumber}`);
                        searchUrl = `https://www.limetorrents.lol/search/all/${query}/`;
                        break;
                }
                if (searchUrl) {
                    window.open(searchUrl, "_blank");
                    showToast(`Opening ${site.charAt(0).toUpperCase() + site.slice(1)}...`, "info");
                }
            };
        });
    }
    // ====================== ENHANCED AVAILABILITY CHECKER ======================
    async function fetchWithProxies(url, options = {}) {
        let lastError;
        
        for (const proxy of CORS_PROXIES) {
            try {
                const proxyUrl = proxy + encodeURIComponent(url);
                const response = await fetch(proxyUrl, options);
                
                if (response.ok) {
                    return response;
                }
            } catch (error) {
                lastError = error;
                console.warn(`Proxy ${proxy} failed:`, error);
            }
        }
        
        throw lastError || new Error('All proxies failed');
    }
    async function trySearchQuery(config, searchQuery, siteName, itemType) {
        console.log(`Checking ${siteName} for: "${searchQuery}" (Type: ${itemType})`);
        const searchUrl = config.searchUrl(searchQuery);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), config.timeout || 15000);
        
        let html = '';
        try {
            const response = await fetchWithProxies(searchUrl, {
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
            return false;
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
                        const requiredMatches = Math.max(1, Math.ceil(queryWords.length * 0.2));
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
    async function checkSiteAvailability(siteName, query, year = '', itemType = 'movie') {
        const config = SITE_CONFIGS[siteName];
        if (!config) return false;
        
        try {
            // For movies, try with and without year
            if (itemType === 'movie') {
                // First try without year
                let hasMatch = await trySearchQuery(config, query, siteName, itemType);
                
                // If not found and year is available, try with year
                if (!hasMatch && year) {
                    hasMatch = await trySearchQuery(config, `${query} ${year}`, siteName, itemType);
                }
                
                return hasMatch;
            }
            
            // For series, just search for the series name
            return await trySearchQuery(config, query, siteName, itemType);
            
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log(`${siteName}: Request timed out`);
            } else {
                console.log(`${siteName}: Error - ${error.message}`);
            }
            return false;
        }
    }
    async function checkAllSitesAvailability(item) {
        const title = currentType === "movie" ? item.title : item.name;
        const year = item.release_date ? new Date(item.release_date).getFullYear() : 
                     item.first_air_date ? new Date(item.first_air_date).getFullYear() : '';
        
        console.log(`🔍 Checking availability for: "${title}" (${year}) - Type: ${currentType}`);
        const siteNames = Object.keys(SITE_CONFIGS);
        const availabilityPromises = siteNames.map(async (siteName) => {
            const isAvailable = await checkSiteAvailability(siteName, title, year, currentType);
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
    // ====================== AVAILABILITY POPUP ======================
    function showAvailabilityPopup(loading = true, availableSites = [], totalSites = 0, itemTitle = '') {
        // Remove existing popup if any
        const existingPopup = document.getElementById('availabilityPopup');
        if (existingPopup) {
            existingPopup.remove();
        }
        
        // Create popup container
        const popup = document.createElement('div');
        popup.id = 'availabilityPopup';
        popup.className = 'availability-popup';
        popup.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 80%;
            max-width: 500px;
            background: linear-gradient(135deg, #000000, #1f1f1f);
            border: 2px solid #f5c518;
            border-radius: 15px;
            padding: 25px;
            z-index: 1002;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            text-align: center;
            color: #fff;
            animation: fadeIn 0.3s ease;
        `;
        
        // Add animation keyframes if not already added
        if (!document.getElementById('fadeInKeyframes')) {
            const style = document.createElement('style');
            style.id = 'fadeInKeyframes';
            style.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
                    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                }
            `;
            document.head.appendChild(style);
        }
        
        if (loading) {
            // Create loading content
            const spinner = document.createElement('div');
            spinner.className = 'popup-spinner';
            spinner.style.cssText = `
                width: 50px;
                height: 50px;
                border: 5px solid rgba(245, 197, 24, 0.3);
                border-radius: 50%;
                border-top-color: #f5c518;
                margin: 0 auto 20px;
                animation: spin 1s linear infinite;
            `;
            
            const message = document.createElement('p');
            message.textContent = 'Searching for movie availability...';
            message.style.cssText = `
                font-size: 1.2rem;
                margin: 0 0 20px 0;
            `;
            
            // Add X exit button at top right
            const exitBtn = document.createElement('button');
            exitBtn.innerHTML = '×';
            exitBtn.style.cssText = `
                position: absolute;
                top: 15px;
                right: 15px;
                background: none;
                border: none;
                color: #f5c518;
                font-size: 1.8rem;
                cursor: pointer;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.3s ease;
            `;
            
            exitBtn.addEventListener('mouseenter', () => {
                exitBtn.style.background = 'rgba(245, 197, 24, 0.2)';
            });
            
            exitBtn.addEventListener('mouseleave', () => {
                exitBtn.style.background = 'none';
            });
            
            exitBtn.addEventListener('click', () => {
                popup.remove();
            });
            
            // Add spin animation if not already added
            if (!document.getElementById('spinnerKeyframes')) {
                const style = document.createElement('style');
                style.id = 'spinnerKeyframes';
                style.textContent = `
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `;
                document.head.appendChild(style);
            }
            
            popup.appendChild(spinner);
            popup.appendChild(message);
            popup.appendChild(exitBtn);
        } else {
            // Create results content
            const icon = document.createElement('div');
            icon.className = 'popup-icon';
            icon.style.cssText = `
                font-size: 3rem;
                margin-bottom: 15px;
            `;
            
            if (availableSites.length > 0) {
                icon.innerHTML = '<i class="fas fa-check-circle" style="color: #4CAF50;"></i>';
            } else {
                icon.innerHTML = '<i class="fas fa-times-circle" style="color: #f44336;"></i>';
            }
            
            const title = document.createElement('h3');
            title.textContent = 'Availability Check Complete';
            title.style.cssText = `
                color: #f5c518;
                margin: 0 0 15px 0;
                font-size: 1.5rem;
            `;
            
            const message = document.createElement('p');
            if (availableSites.length > 0) {
                message.textContent = `"${itemTitle}" is available on ${availableSites.length} out of ${totalSites} sites.`;
            } else {
                message.textContent = `"${itemTitle}" was not found on any of the ${totalSites} sites.`;
            }
            message.style.cssText = `
                font-size: 1.1rem;
                margin: 0 0 20px 0;
                line-height: 1.4;
            `;
            
            // Create sites list
            const sitesList = document.createElement('div');
            sitesList.className = 'sites-list';
            sitesList.style.cssText = `
                text-align: left;
                margin: 0 0 20px 0;
                max-height: 150px;
                overflow-y: auto;
            `;
            
            if (availableSites.length > 0) {
                const listTitle = document.createElement('p');
                listTitle.textContent = 'Available on:';
                listTitle.style.cssText = `
                    font-weight: bold;
                    margin: 0 0 10px 0;
                    color: #f5c518;
                `;
                sitesList.appendChild(listTitle);
                
                const list = document.createElement('ul');
                list.style.cssText = `
                    margin: 0;
                    padding-left: 20px;
                `;
                
                availableSites.forEach(site => {
                    const listItem = document.createElement('li');
                    listItem.textContent = site.charAt(0).toUpperCase() + site.slice(1);
                    listItem.style.cssText = `
                        margin-bottom: 5px;
                    `;
                    list.appendChild(listItem);
                });
                
                sitesList.appendChild(list);
            }
            
            // Create buttons container
            const buttonsContainer = document.createElement('div');
            buttonsContainer.style.cssText = `
                display: flex;
                justify-content: center;
                gap: 10px;
                margin-top: 10px;
            `;
            
            // Create close button
            const closeBtn = document.createElement('button');
            closeBtn.textContent = 'Close';
            closeBtn.style.cssText = `
                background: linear-gradient(45deg, #f5c518, #e6b800);
                color: #000;
                border: none;
                border-radius: 8px;
                padding: 10px 25px;
                font-size: 1rem;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
            `;
            
            closeBtn.addEventListener('mouseenter', () => {
                closeBtn.style.transform = 'scale(1.05)';
                closeBtn.style.boxShadow = '0 5px 15px rgba(245, 197, 24, 0.4)';
            });
            
            closeBtn.addEventListener('mouseleave', () => {
                closeBtn.style.transform = 'scale(1)';
                closeBtn.style.boxShadow = 'none';
            });
            
            closeBtn.addEventListener('click', () => {
                popup.remove();
            });
            
            buttonsContainer.appendChild(closeBtn);
            
            // Add refresh button if no sites found
            if (availableSites.length === 0) {
                const refreshBtn = document.createElement('button');
                refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> <span class="btn-text">Refresh</span>';
                refreshBtn.style.cssText = `
                    position: absolute;
                    top: 15px;
                    left: 15px;
                    background: linear-gradient(45deg, #f5c518, #e6b800);
                    color: #000;
                    border: none;
                    border-radius: 8px;
                    padding: 10px 15px;
                    font-size: 1rem;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    overflow: hidden;
                    width: 45px;
                `;
                
                refreshBtn.addEventListener('mouseenter', () => {
                    refreshBtn.style.width = '120px';
                    refreshBtn.querySelector('.btn-text').style.opacity = '1';
                    refreshBtn.querySelector('.btn-text').style.transform = 'translateX(0)';
                });
                
                refreshBtn.addEventListener('mouseleave', () => {
                    refreshBtn.style.width = '45px';
                    refreshBtn.querySelector('.btn-text').style.opacity = '0';
                    refreshBtn.querySelector('.btn-text').style.transform = 'translateX(10px)';
                });
                
                // Style the text inside the button
                const btnText = refreshBtn.querySelector('.btn-text');
                btnText.style.cssText = `
                    margin-left: 8px;
                    opacity: 0;
                    transform: translateX(10px);
                    transition: all 0.3s ease;
                    white-space: nowrap;
                `;
                
                refreshBtn.addEventListener('click', () => {
                    popup.remove();
                    // Trigger a new availability check
                    const currentItem = {
                        title: modalTitle.textContent,
                        release_date: modal.dataset.movieId ? new Date().getFullYear() : null,
                        first_air_date: modal.dataset.movieId ? null : new Date().getFullYear(),
                        id: modal.dataset.movieId
                    };
                    checkAndUpdateAvailability(currentItem);
                });
                
                buttonsContainer.appendChild(refreshBtn);
            }
            
            // Add X exit button at top right
            const exitBtn = document.createElement('button');
            exitBtn.innerHTML = '×';
            exitBtn.style.cssText = `
                position: absolute;
                top: 15px;
                right: 15px;
                background: none;
                border: none;
                color: #f5c518;
                font-size: 1.8rem;
                cursor: pointer;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.3s ease;
            `;
            
            exitBtn.addEventListener('mouseenter', () => {
                exitBtn.style.background = 'rgba(245, 197, 24, 0.2)';
            });
            
            exitBtn.addEventListener('mouseleave', () => {
                exitBtn.style.background = 'none';
            });
            
            exitBtn.addEventListener('click', () => {
                popup.remove();
            });
            
            popup.appendChild(icon);
            popup.appendChild(title);
            popup.appendChild(message);
            popup.appendChild(sitesList);
            popup.appendChild(buttonsContainer);
            popup.appendChild(exitBtn);
        }
        
        document.body.appendChild(popup);
        
        // Auto-close after 10 seconds for results popup
        if (!loading) {
            setTimeout(() => {
                if (popup.parentNode) {
                    popup.style.animation = 'fadeOut 0.3s ease';
                    setTimeout(() => {
                        if (popup.parentNode) {
                            popup.remove();
                        }
                    }, 300);
                }
            }, 10000);
            
            // Add fadeOut animation if not already added
            if (!document.getElementById('fadeOutKeyframes')) {
                const style = document.createElement('style');
                style.id = 'fadeOutKeyframes';
                style.textContent = `
                    @keyframes fadeOut {
                        from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                        to { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
                    }
                `;
                document.head.appendChild(style);
            }
        }
        
        return popup;
    }
    function showAvailabilityLoading() {
        const sourceButtons = document.querySelectorAll(".source-btn");
        
        sourceButtons.forEach(button => {
            // Reset button state
            const existingIndicators = button.querySelectorAll('.loading-indicator, .available-indicator, .unavailable-indicator');
            existingIndicators.forEach(indicator => indicator.remove());
            
            button.style.opacity = '0.6';
            button.disabled = true;
            
            // Replace arrow with loading circle
            const buttonContent = button.innerHTML;
            if (buttonContent.includes('→')) {
                button.innerHTML = buttonContent.replace('→', '<span class="loading-indicator">🔄</span>');
            } else if (!buttonContent.includes('loading-indicator')) {
                const indicator = document.createElement('span');
                indicator.className = 'loading-indicator';
                indicator.innerHTML = ' 🔄';
                indicator.style.cssText = `
                    animation: spin 1s linear infinite;
                    display: inline-block;
                `;
                button.appendChild(indicator);
            }
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
    function hideAvailabilityLoading() {
        const loadingIndicators = document.querySelectorAll('.loading-indicator');
        loadingIndicators.forEach(indicator => indicator.remove());
    }
    function updateDownloadButtons(availability) {
        const downloadOptions = document.getElementById("downloadOptions");
        const sourceButtons = downloadOptions.querySelectorAll(".source-btn");
        
        // Convert NodeList to Array for easier manipulation
        const buttonsArray = Array.from(sourceButtons);
        
        // Separate buttons into available and unavailable
        const availableButtons = [];
        const unavailableButtons = [];
        
        buttonsArray.forEach(button => {
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
                
                unavailableButtons.push(button);
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
                        case "toxicwap": searchUrl = `https://newtoxic.com/search.php?search=${query}`; break;
                        case "9jarocks": searchUrl = `https://9jarocks.net/search?q=${query}`; break;
                        case "netflix": searchUrl = `https://www.netflix.com/search?q=${query}`; break;
                        case "yts": searchUrl = `https://yts.mx/browse-movies/${query}`; break;
                        case "eztv": searchUrl = `https://eztv.re/search/${query}`; break;
                        case "piratebay": searchUrl = `https://thepiratebay.org/search.php?q=${query}`; break;
                        case "limetorrents": searchUrl = `https://www.limetorrents.lol/search/all/${query}/`; break;
                    }
                    if (searchUrl) {
                        window.open(searchUrl, "_blank");
                        showToast(`Opening ${site.charAt(0).toUpperCase() + site.slice(1)}...`, "info");
                    }
                };
                
                availableButtons.push(button);
            }
        });
        
        // Remove all source buttons from the container
        sourceButtons.forEach(button => button.remove());
        
        // Add available buttons first
        availableButtons.forEach(button => {
            downloadOptions.appendChild(button);
        });
        
        // Add unavailable buttons after available ones
        unavailableButtons.forEach(button => {
            downloadOptions.appendChild(button);
        });
        
        // Add the episode title and back button if they exist
        const episodeTitle = document.getElementById("episodeTitle");
        if (episodeTitle) {
            downloadOptions.insertBefore(episodeTitle, downloadOptions.firstChild);
        }
        
        const backBtn = document.getElementById("backToEpisodes");
        if (backBtn) {
            downloadOptions.insertBefore(backBtn, downloadOptions.firstChild);
        }
    }
    async function checkAndUpdateAvailability(item) {
        // Show loading popup
        showAvailabilityPopup(true);
        
        try {
            const availability = await checkAllSitesAvailability(item);
            
            // Hide loading indicators
            hideAvailabilityLoading();
            
            // Update download buttons
            updateDownloadButtons(availability);
            
            const availableCount = Object.values(availability).filter(Boolean).length;
            const totalSites = Object.keys(availability).length;
            
            // Show results popup
            const availableSites = Object.keys(availability).filter(site => availability[site]);
            const itemTitle = currentType === "movie" ? item.title : item.name;
            showAvailabilityPopup(false, availableSites, totalSites, itemTitle);
            
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
            
            // Show error popup
            showAvailabilityPopup(false, [], Object.keys(SITE_CONFIGS).length, item.title || item.name);
        }
    }
    // ====================== FIXED MODAL FUNCTION ======================
    async function openModal(item) {
        modal.style.display = "flex";
        modal.dataset.movieId = item.id;
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
                : (details.episode_run_time && details.episode_run_time.length > 0 ? formatRuntime(details.episode_run_time[0]) : 'N/A');
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
            
            // Fixed trailer button - Works for both movies AND series
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
                        
                        // Create a unique ID for this player
                        const playerId = `trailer-player-${Date.now()}`;
                        
                        // Create a div for the player
                        trailerEmbed.innerHTML = `<div id="${playerId}" style="width: 100%; height: 100%;"></div>`;
                        
                        // Create the player
                        player = new YT.Player(playerId, {
                            videoId: trailer.key,
                            playerVars: {
                                'autoplay': 1,
                                'controls': 1,
                                'rel': 0,
                                'modestbranding': 1,
                                'showinfo': 0
                            },
                            events: {
                                'onReady': function(event) {
                                    console.log("Trailer player is ready");
                                }
                            }
                        });
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
            // Hide the regular download options initially
            downloadPanel.style.display = "none";
            
            // Create or update the "Select Episode" button
            let selectEpisodeBtn = document.getElementById("selectEpisodeBtn");
            if (!selectEpisodeBtn) {
                selectEpisodeBtn = document.createElement('button');
                selectEpisodeBtn.id = "selectEpisodeBtn";
                selectEpisodeBtn.innerHTML = '<i class="fas fa-list-ol"></i> Select Episode';
                selectEpisodeBtn.className = 'select-episode-btn';
                selectEpisodeBtn.style.cssText = `
                    background: linear-gradient(45deg, #4CAF50, #45a049);
                    color: #fff;
                    border: none;
                    border-radius: 5px;
                    padding: 10px 15px;
                    cursor: pointer;
                    font-weight: bold;
                    margin: 5px;
                    transition: all 0.3s ease;
                `;
                
                // Insert after the recommendations button or in a suitable place
                if (recButton && recButton.nextSibling) {
                    recButton.parentNode.insertBefore(selectEpisodeBtn, recButton.nextSibling);
                } else {
                    // Fallback: append to modal actions
                    const modalActions = document.querySelector('.modal-actions');
                    if (modalActions) {
                        modalActions.appendChild(selectEpisodeBtn);
                    }
                }
            }
            
            // Set up the button click event
            selectEpisodeBtn.onclick = () => {
                showSeriesSelectionPopup(item);
            };
            
            // Show the button
            selectEpisodeBtn.style.display = 'inline-block';
        } else {
            // Hide the select episode button if it exists
            const selectEpisodeBtn = document.getElementById("selectEpisodeBtn");
            if (selectEpisodeBtn) {
                selectEpisodeBtn.style.display = 'none';
            }
            
            // For movies, show download options directly
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
                        case "toxicwap": searchUrl = `https://newtoxic.com/search.php?search=${query}`; break;
                        case "9jarocks": searchUrl = `https://9jarocks.net/search?q=${query}`; break;
                        case "netflix": searchUrl = `https://www.netflix.com/search?q=${query}`; break;
                        case "yts": searchUrl = `https://yts.mx/browse-movies/${query}`; break;
                        case "eztv": searchUrl = `https://eztv.re/search/${query}`; break;
                        case "piratebay": searchUrl = `https://thepiratebay.org/search.php?q=${query}`; break;
                        case "limetorrents": searchUrl = `https://www.limetorrents.lol/search/all/${query}/`; break;
                    }
                    if (searchUrl) {
                        window.open(searchUrl, "_blank");
                        showToast(`Opening ${site.charAt(0).toUpperCase() + site.slice(1)}...`, "info");
                    }
                };
            });
            
            // Check movie availability after setting up buttons
            await checkAndUpdateAvailability(item);
        }
        
        updateFavoriteButton(item);
    }
    // ====================== RENDER PAGINATION ======================
    function renderPagination(total) {
    const paginationContainer = document.getElementById("pagination");
    if (!paginationContainer) return;
    
    paginationContainer.innerHTML = "";
    const prev = document.createElement("button");
    prev.textContent = "Prev";
    prev.disabled = currentPage === 1;
    prev.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            if (isCountryMode) {
                // We're in country mode, refetch country data
                fetchMoviesByCountry(currentCountryCode, currentCountryName);
            } else {
                returnItems(currentAPIUrl, currentPage);
            }
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
            if (isCountryMode) {
                // We're in country mode, refetch country data
                fetchMoviesByCountry(currentCountryCode, currentCountryName);
            } else {
                returnItems(currentAPIUrl, currentPage);
            }
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
            if (isCountryMode) {
                // We're in country mode, refetch country data
                fetchMoviesByCountry(currentCountryCode, currentCountryName);
            } else {
                returnItems(currentAPIUrl, currentPage);
            }
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
        
        // Ensure currentType is properly set
        if (currentType === "news") {
            // If on news tab, default to movie search
            currentType = "movie";
            currentAPIUrl = MOVIES_API;
        }
        
        if (currentType === "movie") {
            currentAPIUrl = SEARCH_MOVIE + encodeURIComponent(searchItem);
        } else {
            currentAPIUrl = SEARCH_SERIES + encodeURIComponent(searchItem);
        }
        
        console.log("Searching for:", searchItem, "Type:", currentType);
        console.log("API URL:", currentAPIUrl);
        
        currentPage = 1;
        
        // Show appropriate section
        section.style.display = "flex";
        pagination.style.display = "flex";
        trailerSlider.style.display = "flex";
        favoritesContainer.style.display = "none";
        newsContainer.style.display = "none";
        landingPageContainer.style.display = "none";
        
        returnItems(currentAPIUrl, currentPage);
        search.value = "";
    });
    // ====================== TRAILER SLIDER ======================
    let trailers = [];
    let currentIndex = 0;
    const trailerFrameWidth = "97.5vw";
    const trailerFrameHeight = "80vh";
    let trailerInterval = null;
    async function returnTrailers() {
        // Clear any existing interval
        if (trailerInterval) {
            clearInterval(trailerInterval);
            trailerInterval = null;
        }
        
        // Clear any existing players
        trailerPlayers = [];
        
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
        
        // Clear any existing players
        trailerPlayers = [];
        
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
            
            // Create a unique ID for this player
            const playerId = `trailer-player-${Date.now()}`;
            
            // Create a div for the player
            const playerDiv = document.createElement("div");
            playerDiv.id = playerId;
            playerDiv.style.width = trailerFrameWidth;
            playerDiv.style.height = trailerFrameHeight;
            playerDiv.style.margin = "0 auto"; // Center the trailer
            trailerContainer.appendChild(playerDiv);
            
            // Create the player
            const player = new YT.Player(playerId, {
                videoId: trailers[index],
                playerVars: {
                    'autoplay': 1,
                    'controls': 0,
                    'rel': 0,
                    'modestbranding': 1,
                    'showinfo': 0
                },
                events: {
                    'onStateChange': function(event) {
                        if (event.data == YT.PlayerState.ENDED) {
                            // When the video ends, play the next trailer
                            currentIndex = (currentIndex + 1) % trailers.length;
                            playTrailer(currentIndex);
                        }
                    }
                }
            });
            
            // Store the player reference
            trailerPlayers.push(player);
        }
        
        playTrailer(currentIndex);
        
        // Prev/Next buttons
        document.getElementById("prevBtn").onclick = () => {
            currentIndex = (currentIndex - 1 + trailers.length) % trailers.length;
            playTrailer(currentIndex);
        };
        
        document.getElementById("nextBtn").onclick = () => {
            currentIndex = (currentIndex + 1) % trailers.length;
            playTrailer(currentIndex);
        };
    }
    function playTrailer(index) {
        // Clear the container
        trailerContainer.innerHTML = "";
        
        // Create a unique ID for this player
        const playerId = `trailer-player-${Date.now()}`;
        
        // Create a div for the player
        const playerDiv = document.createElement("div");
        playerDiv.id = playerId;
        playerDiv.style.width = trailerFrameWidth;
        playerDiv.style.height = trailerFrameHeight;
        playerDiv.style.margin = "0 auto"; // Center the trailer
        trailerContainer.appendChild(playerDiv);
        
        // Create the player
        const player = new YT.Player(playerId, {
            videoId: trailers[index],
            playerVars: {
                'autoplay': 1,
                'controls': 0,
                'rel': 0,
                'modestbranding': 1,
                'showinfo': 0
            },
            events: {
                'onStateChange': function(event) {
                    if (event.data == YT.PlayerState.ENDED) {
                        // When the video ends, play the next trailer
                        currentIndex = (currentIndex + 1) % trailers.length;
                        playTrailer(currentIndex);
                    }
                }
            }
        });
        
        // Store the player reference
        trailerPlayers.push(player);
    }
    prevBtn.addEventListener("click", () => {
        if (trailers.length > 0) {
            currentIndex = (currentIndex - 1 + trailers.length) % trailers.length;
            playTrailer(currentIndex);
        }
    });
    nextBtn.addEventListener("click", () => {
        if (trailers.length > 0) {
            currentIndex = (currentIndex + 1) % trailers.length;
            playTrailer(currentIndex);
        }
    });
    // Load the YouTube IFrame API
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);
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
    
    // Check if the item is already in the favorites
    const movieIndex = movieFavorites.findIndex(f => f.title === title);
    const seriesIndex = seriesFavorites.findIndex(f => f.title === title);
    
    if (currentType === "movie" && movieIndex > -1) {
        // Remove from movie favorites
        movieFavorites.splice(movieIndex, 1);
        localStorage.setItem("movieFavorites", JSON.stringify(movieFavorites));
        addFavoriteBtn.innerHTML = '<i class="fas fa-heart"></i> Add Favorite';
        addFavoriteBtn.classList.remove("favorited");
        showToast(`${title} was removed from favorites`, "info");
    } else if (currentType === "tv" && seriesIndex > -1) {
        // Remove from series favorites
        seriesFavorites.splice(seriesIndex, 1);
        localStorage.setItem("seriesFavorites", JSON.stringify(seriesFavorites));
        addFavoriteBtn.innerHTML = '<i class="fas fa-heart"></i> Add Favorite';
        addFavoriteBtn.classList.remove("favorited");
        showToast(`${title} was removed from favorites`, "info");
    } else {
        // Add to favorites
        if (currentType === "movie") {
            movieFavorites.push({ title, poster, type: currentType });
            localStorage.setItem("movieFavorites", JSON.stringify(movieFavorites));
        } else {
            seriesFavorites.push({ title, poster, type: currentType });
            localStorage.setItem("seriesFavorites", JSON.stringify(seriesFavorites));
        }
        addFavoriteBtn.innerHTML = '<i class="fas fa-heart"></i> Favorite';
        addFavoriteBtn.classList.add("favorited");
        showToast(`${title} added to favorites`, "success");
    }
    
    renderFavorites();
});
    // ====================== ENHANCED FAVORITES WITH RECOMMENDATIONS ======================
async function renderFavorites() {
    favoritesContainer.style.paddingTop = "2rem";
    favoritesContainer.style.display = "flex";
    favoritesContainer.style.flexDirection = "column";
    favoritesContainer.innerHTML = "";
    
    // Combine and deduplicate favorites
     // Combine and deduplicate favorites
    const allFavorites = [...movieFavorites, ...seriesFavorites];
    const uniqueFavorites = Array.from(
        new Map(allFavorites.map(item => [item.title, item])).values()
    );
    
    if (uniqueFavorites.length > 0) {
        // Add recommendation section only once and place it above favorites
        let recommendationsAdded = false;
        if (!recommendationsAdded) {
            await addFavoritesRecommendations(uniqueFavorites);
            recommendationsAdded = true;
        }
        
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
            // Create custom confirmation popup
            const confirmPopup = document.createElement('div');
            confirmPopup.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 90%;
                max-width: 400px;
                background: linear-gradient(135deg, #000000, #1f1f1f);
                border: 2px solid #f5c518;
                border-radius: 15px;
                padding: 25px;
                z-index: 1002;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                text-align: center;
                color: #fff;
            `;
            
            confirmPopup.innerHTML = `
                <h3 style="color: #f5c518; margin-top: 0; margin-bottom: 1rem;">Confirm Clear All</h3>
                <p style="margin-bottom: 2rem;">Are you sure you want to clear all favorites? This action cannot be undone.</p>
                <div style="display: flex; justify-content: center; gap: 1rem;">
                    <button id="confirmClearBtn" style="background: linear-gradient(45deg, #ff4444, #cc0000); color: white; border: none; border-radius: 8px; padding: 10px 20px; font-weight: bold; cursor: pointer;">Clear All</button>
                    <button id="cancelClearBtn" style="background: linear-gradient(45deg, #f5c518, #e6b800); color: #000; border: none; border-radius: 8px; padding: 10px 20px; font-weight: bold; cursor: pointer;">Cancel</button>
                </div>
            `;
            
            document.body.appendChild(confirmPopup);
            
            document.getElementById('confirmClearBtn').addEventListener('click', () => {
                movieFavorites = [];
                seriesFavorites = [];
                localStorage.setItem("movieFavorites", JSON.stringify(movieFavorites));
                localStorage.setItem("seriesFavorites", JSON.stringify(seriesFavorites));
                renderFavorites();
                confirmPopup.remove();
            });
            
            document.getElementById('cancelClearBtn').addEventListener('click', () => {
                confirmPopup.remove();
            });
        });
        
        headerDiv.appendChild(favTitle);
        headerDiv.appendChild(clearBtn);
        favoritesContainer.appendChild(headerDiv);
        
        // Now use uniqueFavorites for rendering
        uniqueFavorites.forEach((fav, index) => {
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
    
    if (uniqueFavorites.length === 0) {
        favoritesContainer.innerHTML = `
            <div style="text-align: center; margin-top: 10rem;">
                <h1 style="color:#f5c518; font-size:4rem; margin-bottom: 1rem;">No Favorites Yet 😿</h1>
                <p style="color:#fff; font-size:1.2rem;">Start adding movies and series to your favorites!</p>
            </div>
        `;
        return;
    }
}
    // ====================== FAVORITES RECOMMENDATIONS ======================
async function addFavoritesRecommendations(favorites) {
    console.log('addFavoritesRecommendations called with:', favorites);
    if (favorites.length === 0) return;

    // Deduplicate favorites
    const uniqueFavorites = Array.from(
        new Map(favorites.map(item => [item.title, item])).values()
    );

    // Check for existing recommendation section
    let recSection = favoritesContainer.querySelector('.recommendation-section');
    if (recSection) {
        recSection.innerHTML = ''; // Clear existing recommendations
    } else {
        recSection = document.createElement("div");
        recSection.className = 'recommendation-section';
        recSection.style.cssText = `
            width: 90%;
            margin: 2rem 0;
            padding: 2rem;
            background: linear-gradient(135deg, rgba(245,197,24,0.1), rgba(245,197,24,0.05));
            border-radius: 20px;
            border: 2px solid rgba(245,197,24,0.3);
        `;
        favoritesContainer.appendChild(recSection);
    }

    const recTitle = document.createElement("h3");
    recTitle.innerHTML = '<i class="fas fa-film"></i> Recommended For You';
    recTitle.style.cssText = `
        color: #f5c518;
        font-size: 2rem;
        margin-bottom: 1.5rem;
        text-align: center;
    `;
    
    recSection.appendChild(recTitle);

    try {
        const favoriteGenres = new Set();
        const favoriteKeywords = new Set();

        for (let fav of uniqueFavorites.slice(0, 3)) {
            try {
                const searchAPI = fav.type === "movie" ? SEARCH_MOVIE : SEARCH_SERIES;
                const searchRes = await fetch(searchAPI + encodeURIComponent(fav.title));
                const searchData = await searchRes.json();

                if (searchData.results && searchData.results[0]) {
                    const item = searchData.results[0];
                    if (item.genre_ids) {
                        item.genre_ids.forEach(genreId => favoriteGenres.add(genreId));
                    }

                    const movieClass = MOVIE_CLASSES.find(mc =>
                        fav.title.toLowerCase().includes(mc.id) ||
                        mc.keywords.some(kw => fav.title.toLowerCase().includes(kw))
                    );

                    if (movieClass) {
                        movieClass.keywords.forEach(kw => favoriteKeywords.add(kw));
                    }
                }
            } catch (e) {
                console.log('Error getting details for:', fav.title);
            }
        }

        let recommendations = [];

        if (favoriteGenres.size > 0) {
            const genreArray = Array.from(favoriteGenres).slice(0, 3);
            const genreIds = genreArray.join(',');

            try {
                const recURL = `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreIds}&sort_by=popularity.desc&page=1`;
                const recRes = await fetch(recURL);
                const recData = await recRes.json();

                if (recData.results && recData.results.length > 0) {
                    recommendations = recData.results.slice(0, 6);
                }
            } catch (error) {
                console.error('Error fetching genre recommendations:', error);
            }
        }

        if (recommendations.length < 3 && favoriteKeywords.size > 0) {
            const keywordArray = Array.from(favoriteKeywords).slice(0, 2);

            for (const keyword of keywordArray) {
                if (recommendations.length >= 6) break;

                try {
                    const searchURL = `${SEARCH_MOVIE}${encodeURIComponent(keyword)}`;
                    const searchRes = await fetch(searchURL);
                    const searchData = await searchRes.json();

                    if (searchData.results && searchData.results.length > 0) {
                        const newRecs = searchData.results
                            .filter(item => !recommendations.some(r => r.id === item.id))
                            .slice(0, 6 - recommendations.length);

                        recommendations = [...recommendations, ...newRecs];
                    }
                } catch (error) {
                    console.error('Error fetching keyword recommendations:', error);
                }
            }
        }

        if (recommendations.length < 3) {
            try {
                const popularURL = `${BASE_URL}/movie/popular?api_key=${API_KEY}&page=1`;
                const popularRes = await fetch(popularURL);
                const popularData = await popularRes.json();

                if (popularData.results && popularData.results.length > 0) {
                    const newRecs = popularData.results
                        .filter(item => !recommendations.some(r => r.id === item.id))
                        .slice(0, 6 - recommendations.length);

                    recommendations = [...recommendations, ...newRecs];
                }
            } catch (error) {
                console.error('Error fetching popular movies:', error);
            }
        }

        // Deduplicate recommendations
        recommendations = Array.from(
            new Map(recommendations.map(item => [item.id, item])).values()
        ).slice(0, 6);

        if (recommendations.length > 0) {
            const recGrid = document.createElement('div');
            recGrid.style.cssText = `
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 2rem;
                margin-top: 1.5rem;
            `;

            recommendations.forEach(rec => {
                const recCard = document.createElement('div');
                recCard.style.cssText = `
                    background: rgba(255,255,255,0.05);
                    border-radius: 10px;
                    padding: 1.5rem;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.4s ease;
                    border: 2px solid transparent;
                `;

                recCard.addEventListener('mouseenter', () => {
                    recCard.style.transform = 'translateY(-10px) scale(1.02)';
                    recCard.style.borderColor = '#f5c518';
                    recCard.style.background = 'rgba(245,197,24,0.1)';
                    recCard.style.boxShadow = '0 15px 30px rgba(245,197,24,0.3)';
                });

                recCard.addEventListener('mouseleave', () => {
                    recCard.style.transform = 'translateY(0) scale(1)';
                    recCard.style.borderColor = 'transparent';
                    recCard.style.background = 'rgba(255,255,255,0.05)';
                    recCard.style.boxShadow = 'none';
                });

                const recImg = document.createElement('img');
                recImg.src = rec.poster_path ? IMG_PATH + rec.poster_path : "https://via.placeholder.com/200x300?text=No+Image";
                recImg.style.cssText = `
                    width: 100%;
                    height: 250px;
                    object-fit: cover;
                    border-radius: 8px;
                    margin-bottom: 1rem;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                `;

                const recTitleEl = document.createElement('h4');
                recTitleEl.textContent = rec.title || rec.name;
                recTitleEl.style.cssText = `
                    color: #fff;
                    margin: 0.5rem 0;
                    font-size: 1.1rem;
                    font-weight: bold;
                `;

                const recRating = document.createElement('p');
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
                    currentType = "movie";
                    await openModal(rec);
                });

                recGrid.appendChild(recCard);
            });

            recSection.appendChild(recGrid);
        } else {
            const noRecs = document.createElement('p');
            noRecs.textContent = "No recommendations available at this time.";
            noRecs.style.cssText = `
                color: #ccc;
                text-align: center;
                margin-top: 1rem;
            `;
            recSection.appendChild(noRecs);
        }
    } catch (error) {
        console.error('Error fetching recommendations:', error);

        const errorMsg = document.createElement('p');
        errorMsg.textContent = "Unable to load recommendations. Please try again later.";
        errorMsg.style.cssText = `
            color: #ff6b6b;
            text-align: center;
            margin-top: 1rem;
        `;
        recSection.appendChild(errorMsg);
    }
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
    
    // Home tab functionality
    homeTab.addEventListener("click", (e) => {
        e.preventDefault();
        
        // Close genre popup if open
        const genrePopup = document.getElementById('genreSelectionPopup');
        if (genrePopup) {
            genrePopup.remove();
        }
        
        // STOP ALL TRAILERS WHEN SWITCHING TO HOME
        stopAllTrailers();
        
        showLandingPage();
        removeActive();
        homeTab.classList.add("active");
        localStorage.setItem("activeTab", "home");
    });
    
    moviesTab.addEventListener("click", (e) => {
        e.preventDefault();
        
        // Close genre popup if open
        const genrePopup = document.getElementById('genreSelectionPopup');
        if (genrePopup) {
            genrePopup.remove();
        }
        
        currentType = "movie";
        currentAPIUrl = MOVIES_API;
        currentPage = 1;
        returnItems(currentAPIUrl, currentPage);
        section.style.display = "flex";
        pagination.style.display = "flex";
        trailerSlider.style.display = "flex";
        favoritesContainer.style.display = "none";
        newsContainer.style.display = "none";
        landingPageContainer.style.display = "none";
        removeActive();
        moviesTab.classList.add("active");
        localStorage.setItem("currentType", currentType);
        localStorage.setItem("currentPage", currentPage);
        localStorage.setItem("activeTab", "movies");
        returnTrailers();
    });
    
    seriesTab.addEventListener("click", (e) => {
        e.preventDefault();
        
        // Close genre popup if open
        const genrePopup = document.getElementById('genreSelectionPopup');
        if (genrePopup) {
            genrePopup.remove();
        }
        
        currentType = "tv";
        currentAPIUrl = SERIES_API;
        currentPage = 1;
        returnItems(currentAPIUrl, currentPage);
        section.style.display = "flex";
        pagination.style.display = "flex";
        trailerSlider.style.display = "block";
        favoritesContainer.style.display = "none";
        newsContainer.style.display = "none";
        landingPageContainer.style.display = "none";
        removeActive();
        seriesTab.classList.add("active");
        localStorage.setItem("currentType", currentType);
        localStorage.setItem("currentPage", currentPage);
        localStorage.setItem("activeTab", "series");
        returnSeriesTrailers();
    });
    
    favoritesTab.addEventListener("click", (e) => {
        e.preventDefault();
        
        // Close genre popup if open
        const genrePopup = document.getElementById('genreSelectionPopup');
        if (genrePopup) {
            genrePopup.remove();
        }
        
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
        newsContainer.style.display = "none";
        landingPageContainer.style.display = "none";
        removeActive();
        favoritesTab.classList.add("active");
        localStorage.setItem("activeTab", "favorites");
        renderFavorites();
    });

    async function showFavoritesPage() {
    // Hide all other sections
    section.style.display = "none";
    pagination.style.display = "none";
    trailerSlider.style.display = "none";
    newsContainer.style.display = "none";
    landingPageContainer.style.display = "none";
    countriesContainer.style.display = "none";
    
    // Show favorites page
    const favoritesPage = document.getElementById("favoritesPage");
    const favoritesGrid = document.getElementById("favoritesGrid");
    
    if (favoritesPage) {
        favoritesPage.style.display = "block";
    }
    
    if (favoritesGrid) {
        favoritesGrid.innerHTML = "";
        
        // Combine and deduplicate favorites
        const allFavorites = [...movieFavorites, ...seriesFavorites];
        const uniqueFavorites = Array.from(
            new Map(allFavorites.map(item => [item.title, item])).values()
        );
        
        if (uniqueFavorites.length > 0) {
            uniqueFavorites.forEach((fav, index) => {
                const card = document.createElement("div");
                card.className = "favorite-card";
                
                const image = document.createElement("img");
                image.src = fav.poster;
                image.alt = fav.title;
                
                const info = document.createElement("div");
                info.className = "favorite-info";
                
                const title = document.createElement("h3");
                title.textContent = fav.title;
                
                const type = document.createElement("p");
                type.textContent = fav.type === 'movie' ? '🎬 Movie' : '📺 Series';
                
                const actions = document.createElement("div");
                actions.className = "favorite-actions";
                
                const infoBtn = document.createElement("button");
                infoBtn.className = "info-btn";
                infoBtn.innerHTML = '<i class="fas fa-info-circle"></i>';
                infoBtn.title = 'View Details';
                
                const deleteBtn = document.createElement("button");
                deleteBtn.className = "delete-btn";
                deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
                deleteBtn.title = 'Remove from Favorites';
                
                // Event listeners
                card.addEventListener("click", () => openModalWithFavorite(fav));
                infoBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    openModalWithFavorite(fav);
                });
                deleteBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    removeFromFavorites(fav.title, fav.type);
                });
                
                // Build the card
                info.appendChild(title);
                info.appendChild(type);
                actions.appendChild(infoBtn);
                actions.appendChild(deleteBtn);
                card.appendChild(image);
                card.appendChild(info);
                card.appendChild(actions);
                
                favoritesGrid.appendChild(card);
            });
        } else {
            favoritesGrid.innerHTML = `
                <div class="no-favorites">
                    <h3>No Favorites Yet</h3>
                    <p>Start adding movies and series to your favorites!</p>
                </div>
            `;
        }
    }
}

function removeFromFavorites(title, type) {
    if (type === "movie") {
        movieFavorites = movieFavorites.filter(f => f.title !== title);
        localStorage.setItem("movieFavorites", JSON.stringify(movieFavorites));
    } else {
        seriesFavorites = seriesFavorites.filter(f => f.title !== title);
        localStorage.setItem("seriesFavorites", JSON.stringify(seriesFavorites));
    }
    showFavoritesPage(); // Refresh the favorites page
    showToast(`${title} removed from favorites`, "info");
}

function clearAllFavorites() {
    if (confirm("Are you sure you want to clear all favorites?")) {
        movieFavorites = [];
        seriesFavorites = [];
        localStorage.setItem("movieFavorites", JSON.stringify(movieFavorites));
        localStorage.setItem("seriesFavorites", JSON.stringify(seriesFavorites));
        showFavoritesPage(); // Refresh the favorites page
        showToast("All favorites cleared", "success");
    }
}
    
    // Genre tab functionality
    genresTab.addEventListener("click", (e) => {
        e.preventDefault();
        
        // STOP ALL TRAILERS WHEN SWITCHING TO GENRES
        stopAllTrailers();
        
        section.style.display = "flex";
        pagination.style.display = "none";
        trailerSlider.style.display = "none";
        favoritesContainer.style.display = "none";
        newsContainer.style.display = "none";
        landingPageContainer.style.display = "none";
        removeActive();
        genresTab.classList.add("active");
        localStorage.setItem("activeTab", "genres");
        
        // Show genre selection as part of the page
        showGenreSelection();
    });
    
    // Function to show genre selection as part of the page
function showGenreSelection() {
    // Reset country mode when entering genre selection
    isCountryMode = false;
    
    // Rest of the function remains the same
    main.innerHTML = '';
    
    // Create genre selection header
    const headerDiv = document.createElement('div');
    headerDiv.style.cssText = `
        text-align: center;
        margin-bottom: 3rem;
        padding: 2rem;
        background: linear-gradient(135deg, rgba(245,197,24,0.1), rgba(245,197,24,0.05));
        border-radius: 20px;
        border: 2px solid rgba(245,197,24,0.3);
    `;
    
    headerDiv.innerHTML = `
        <h1 style="color: #f5c518; font-size: 3rem; margin: 0 0 1rem 0;">Browse by Category</h1>
        <p style="color: #fff; font-size: 1.2rem; margin: 0;">Select a genre or movie class to explore</p>
    `;
    
    main.appendChild(headerDiv);
    
    // Create category tabs
    const categoryTabs = document.createElement('div');
    categoryTabs.style.cssText = `
        display: flex;
        justify-content: center;
        margin-bottom: 3rem;
        border-bottom: 1px solid rgba(245,197,24,0.3);
    `;
    
    const genresTab = document.createElement('button');
    genresTab.textContent = 'Genres';
    genresTab.className = 'category-tab active';
    genresTab.style.cssText = `
        background: linear-gradient(45deg, #f5c518, #e6b800);
        color: #000;
        border: none;
        border-radius: 8px 8px 0 0;
        padding: 10px 20px;
        font-size: 1rem;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
    `;
    
    const classesTab = document.createElement('button');
    classesTab.textContent = 'Movie Classes (Countries)';
    classesTab.className = 'category-tab';
    classesTab.style.cssText = `
        background: transparent;
        color: #f5c518;
        border: none;
        border-radius: 8px 8px 0 0;
        padding: 10px 20px;
        font-size: 1rem;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
    `;
    
    categoryTabs.appendChild(genresTab);
    categoryTabs.appendChild(classesTab);
    main.appendChild(categoryTabs);
    
    // Create media type selector
    const mediaTypeSelector = document.createElement('div');
    mediaTypeSelector.style.cssText = `
        display: flex;
        justify-content: center;
        margin-bottom: 3rem;
        gap: 15px;
    `;
    
    const movieTypeBtn = document.createElement('button');
    movieTypeBtn.textContent = 'Movies';
    movieTypeBtn.className = 'media-type-btn active';
    movieTypeBtn.style.cssText = `
        background: linear-gradient(45deg, #f5c518, #e6b800);
        color: #000;
        border: none;
        border-radius: 8px;
        padding: 10px 25px;
        font-size: 1rem;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
    `;
    
    const seriesTypeBtn = document.createElement('button');
    seriesTypeBtn.textContent = 'Series';
    seriesTypeBtn.className = 'media-type-btn';
    seriesTypeBtn.style.cssText = `
        background: transparent;
        color: #f5c518;
        border: 2px solid #f5c518;
        border-radius: 8px;
        padding: 10px 25px;
        font-size: 1rem;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
    `;
    
    mediaTypeSelector.appendChild(movieTypeBtn);
    mediaTypeSelector.appendChild(seriesTypeBtn);
    main.appendChild(mediaTypeSelector);
    
    // Create content container
    const contentContainer = document.createElement('div');
    contentContainer.id = 'categoryContent';
    
    // Initially show genres
    let currentCategory = 'genres';
    
    // Function to render genres
    function renderGenres(type) {
        contentContainer.innerHTML = '';
        
        const genresGrid = document.createElement('div');
        genresGrid.className = 'genres-grid';
        genresGrid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 15px;
        `;
        
        const genres = GENRES[type];
        genres.forEach(genre => {
            const genreCard = document.createElement('div');
            genreCard.className = 'genre-card';
            genreCard.dataset.genreId = genre.id;
            genreCard.dataset.genreName = genre.name;
            genreCard.dataset.mediaType = type;
            genreCard.style.cssText = `
                background: rgba(255,255,255,0.05);
                border: 1px solid rgba(245,197,24,0.3);
                border-radius: 10px;
                padding: 15px;
                text-align: center;
                cursor: pointer;
                transition: all 0.3s ease;
            `;
            
            const genreIcon = document.createElement('div');
            genreIcon.style.cssText = `
                font-size: 2rem;
                margin-bottom: 10px;
                color: #f5c518;
            `;
            
            // Set icon based on genre
            switch(genre.id) {
                case 28: // Action
                case 10759: // Action & Adventure
                    genreIcon.innerHTML = '<i class="fas fa-fist-raised"></i>';
                    break;
                case 12: // Adventure
                    genreIcon.innerHTML = '<i class="fas fa-compass"></i>';
                    break;
                case 16: // Animation
                    genreIcon.innerHTML = '<i class="fas fa-film"></i>';
                    break;
                case 35: // Comedy
                    genreIcon.innerHTML = '<i class="fas fa-laugh"></i>';
                    break;
                case 80: // Crime
                    genreIcon.innerHTML = '<i class="fas fa-user-secret"></i>';
                    break;
                case 99: // Documentary
                    genreIcon.innerHTML = '<i class="fas fa-video"></i>';
                    break;
                case 18: // Drama
                    genreIcon.innerHTML = '<i class="fas fa-theater-masks"></i>';
                    break;
                case 10751: // Family
                    genreIcon.innerHTML = '<i class="fas fa-users"></i>';
                    break;
                case 14: // Fantasy
                    genreIcon.innerHTML = '<i class="fas fa-dragon"></i>';
                    break;
                case 36: // History
                    genreIcon.innerHTML = '<i class="fas fa-landmark"></i>';
                    break;
                case 27: // Horror
                    genreIcon.innerHTML = '<i class="fas fa-ghost"></i>';
                    break;
                case 10402: // Music
                    genreIcon.innerHTML = '<i class="fas fa-music"></i>';
                    break;
                case 9648: // Mystery
                    genreIcon.innerHTML = '<i class="fas fa-search"></i>';
                    break;
                case 10749: // Romance
                    genreIcon.innerHTML = '<i class="fas fa-heart"></i>';
                    break;
                case 878: // Science Fiction
                case 10765: // Sci-Fi & Fantasy
                    genreIcon.innerHTML = '<i class="fas fa-rocket"></i>';
                    break;
                case 53: // Thriller
                    genreIcon.innerHTML = '<i class="fas fa-bolt"></i>';
                    break;
                case 10752: // War
                case 10768: // War & Politics
                    genreIcon.innerHTML = '<i class="fas fa-shield-alt"></i>';
                    break;
                case 37: // Western
                    genreIcon.innerHTML = '<i class="fas fa-hat-cowboy"></i>';
                    break;
                case 10762: // Kids
                    genreIcon.innerHTML = '<i class="fas fa-child"></i>';
                    break;
                case 10763: // News
                    genreIcon.innerHTML = '<i class="fas fa-newspaper"></i>';
                    break;
                case 10764: // Reality
                    genreIcon.innerHTML = '<i class="fas fa-tv"></i>';
                    break;
                case 10766: // Soap
                    genreIcon.innerHTML = '<i class="fas fa-comment-alt"></i>';
                    break;
                case 10767: // Talk
                    genreIcon.innerHTML = '<i class="fas fa-microphone"></i>';
                    break;
                default:
                    genreIcon.innerHTML = '<i class="fas fa-film"></i>';
            }
            
            const genreName = document.createElement("h3");
            genreName.textContent = genre.name;
            genreName.style.cssText = `
                color: #fff;
                margin: 0;
                font-size: 1.1rem;
                font-weight: bold;
            `;
            
            genreCard.appendChild(genreIcon);
            genreCard.appendChild(genreName);
            
            // Add hover effect
            genreCard.addEventListener('mouseenter', () => {
                genreCard.style.transform = 'translateY(-5px)';
                genreCard.style.background = 'rgba(245,197,24,0.1)';
                genreCard.style.borderColor = '#f5c518';
                genreCard.style.boxShadow = '0 5px 15px rgba(245,197,24,0.2)';
            });
            
            genreCard.addEventListener('mouseleave', () => {
                genreCard.style.transform = 'translateY(0)';
                genreCard.style.background = 'rgba(255,255,255,0.05)';
                genreCard.style.borderColor = 'rgba(245,197,24,0.3)';
                genreCard.style.boxShadow = 'none';
            });
            
            // Add click event
            genreCard.addEventListener('click', () => {
                // Set current type and fetch content
                currentType = type;
                const genreId = genreCard.dataset.genreId;
                const genreName = genreCard.dataset.genreName;
                
                // Create API URL with genre filter
                currentAPIUrl = `${BASE_URL}/discover/${type}?api_key=${API_KEY}&with_genres=${genreId}&sort_by=popularity.desc`;
                
                // Show content section
                section.style.display = "flex";
                pagination.style.display = "flex";
                trailerSlider.style.display = "flex";
                favoritesContainer.style.display = "none";
                newsContainer.style.display = "none";
                landingPageContainer.style.display = "none";
                
                // Set active tab
                removeActive();
                if (type === "movie") {
                    moviesTab.classList.add("active");
                } else {
                    seriesTab.classList.add("active");
                }
                
                // Reset pagination and fetch content
                currentPage = 1;
                returnItems(currentAPIUrl, currentPage);
                
                // Show toast notification
                showToast(`Showing ${type === "movie" ? "movies" : "series"} in ${genreName}`, "success");
            });
            
            genresGrid.appendChild(genreCard);
        });
        
        contentContainer.appendChild(genresGrid);
    }
    
    // Function to render movie classes (countries)
    function renderMovieClasses() {
    const contentContainer = document.querySelector('#categoryContent');
    if (!contentContainer) return;
    
    contentContainer.innerHTML = '';
    
    const classesGrid = document.createElement('div');
    classesGrid.className = 'classes-grid';
    classesGrid.style.cssText = `
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 20px;
    `;
    
    MOVIE_CLASSES.forEach(movieClass => {
        const classCard = document.createElement('div');
        classCard.className = 'movie-class-card';
        classCard.dataset.classId = movieClass.id;
        
        // Create flag container
        const flagContainer = document.createElement('div');
        flagContainer.className = 'flag-container';
        
        // Create flag image
        const flagImage = document.createElement('img');
        flagImage.className = 'flag-image';
        flagImage.src = movieClass.flagUrl;
        flagImage.alt = `${movieClass.name} flag`;
        
        // Fallback to emoji if image fails to load
        flagImage.onerror = function() {
            flagContainer.innerHTML = movieClass.icon;
            flagContainer.style.fontSize = '3rem';
            flagContainer.style.display = 'flex';
            flagContainer.style.alignItems = 'center';
            flagContainer.style.justifyContent = 'center';
        };
        
        flagContainer.appendChild(flagImage);
        
        // Create country name
        const countryName = document.createElement('h3');
        countryName.className = 'country-name';
        countryName.textContent = movieClass.name;
        
        // Create country description
        const countryDesc = document.createElement('p');
        countryDesc.className = 'country-description';
        countryDesc.textContent = movieClass.description;
        
        // Create country code badge (this will be the element to replace)
        const countryCode = document.createElement('div');
        countryCode.className = 'country-code';
        countryCode.textContent = movieClass.countryCode;
        
        // Add elements to card
        classCard.appendChild(flagContainer);
        classCard.appendChild(countryName);
        classCard.appendChild(countryDesc);
        classCard.appendChild(countryCode); // This is the second acronym to be replaced
        
        // Add hover effect
        classCard.addEventListener('mouseenter', () => {
            classCard.style.transform = 'translateY(-8px)';
            classCard.style.background = 'linear-gradient(135deg, rgba(245,197,24,0.15), rgba(245,197,24,0.05))';
            classCard.style.borderColor = '#f5c518';
            classCard.style.boxShadow = '0 10px 25px rgba(245,197,24,0.3)';
        });
        
        classCard.addEventListener('mouseleave', () => {
            classCard.style.transform = 'translateY(0)';
            classCard.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))';
            classCard.style.borderColor = 'rgba(245,197,24,0.3)';
            classCard.style.boxShadow = 'none';
        });
        
        // Add click event
        classCard.addEventListener('click', () => {
            // Set current type based on media type selector
            currentType = currentMediaType;
            
            // Set country mode and store country information
            isCountryMode = true;
            currentCountryCode = movieClass.countryCode;
            currentCountryName = movieClass.name;
            
            // Reset page number when selecting a new country
            currentPage = 1;
            
            // Fetch content by country
            fetchMoviesByCountry(movieClass.countryCode, movieClass.name);
        });
        
        classesGrid.appendChild(classCard);
        
        // Replace the country code with flag image after a short delay
        setTimeout(() => {
            replaceCountryCodeWithFlag(classCard, movieClass);
        }, 100);
    });
    
    contentContainer.appendChild(classesGrid);
}

// Function to replace country code with flag image
function replaceCountryCodeWithFlag(classCard, movieClass) {
    const countryCodeElement = classCard.querySelector('.country-code');
    if (countryCodeElement) {
        // Create a new flag container to replace the country code
        const newFlagContainer = document.createElement('div');
        newFlagContainer.className = 'flag-container';
        newFlagContainer.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            width: 40px;
            height: 30px;
            border-radius: 4px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            background: rgba(0,0,0,0.1);
            z-index: 2;
        `;
        
        const flagImage = document.createElement('img');
        flagImage.className = 'flag-image';
        flagImage.src = movieClass.flagUrl;
        flagImage.alt = `${movieClass.name} flag`;
        flagImage.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: cover;
        `;
        
        // Fallback to emoji if image fails to load
        flagImage.onerror = function() {
            newFlagContainer.innerHTML = movieClass.icon;
            newFlagContainer.style.fontSize = '1.2rem';
            newFlagContainer.style.display = 'flex';
            newFlagContainer.style.alignItems = 'center';
            newFlagContainer.style.justifyContent = 'center';
        };
        
        newFlagContainer.appendChild(flagImage);
        
        // Replace the country code element with the new flag container
        countryCodeElement.parentNode.replaceChild(newFlagContainer, countryCodeElement);
    }
}
    
    // Initially render genres
    renderGenres(currentMediaType);
    
    // Add category tab switching
    genresTab.addEventListener('click', () => {
        currentCategory = 'genres';
        genresTab.className = 'category-tab active';
        genresTab.style.cssText = `
            background: linear-gradient(45deg, #f5c518, #e6b800);
            color: #000;
            border: none;
            border-radius: 8px 8px 0 0;
            padding: 10px 20px;
            font-size: 1rem;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
        `;
        
        classesTab.className = 'category-tab';
        classesTab.style.cssText = `
            background: transparent;
            color: #f5c518;
            border: none;
            border-radius: 8px 8px 0 0;
            padding: 10px 20px;
            font-size: 1rem;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
        `;
        
        renderGenres(currentMediaType);
    });
    
    classesTab.addEventListener('click', () => {
        currentCategory = 'classes';
        classesTab.className = 'category-tab active';
        classesTab.style.cssText = `
            background: linear-gradient(45deg, #f5c518, #e6b800);
            color: #000;
            border: none;
            border-radius: 8px 8px 0 0;
            padding: 10px 20px;
            font-size: 1rem;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
        `;
        
        genresTab.className = 'category-tab';
        genresTab.style.cssText = `
            background: transparent;
            color: #f5c518;
            border: none;
            border-radius: 8px 8px 0 0;
            padding: 10px 20px;
            font-size: 1rem;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
        `;
        
        renderMovieClasses();
    });
    
    // Add media type switch functionality
    movieTypeBtn.addEventListener('click', () => {
        currentMediaType = 'movie';
        movieTypeBtn.className = 'media-type-btn active';
        movieTypeBtn.style.cssText = `
            background: linear-gradient(45deg, #f5c518, #e6b800);
            color: #000;
            border: none;
            border-radius: 8px;
            padding: 10px 25px;
            font-size: 1rem;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
        `;
        
        seriesTypeBtn.className = 'media-type-btn';
        seriesTypeBtn.style.cssText = `
            background: transparent;
            color: #f5c518;
            border: 2px solid #f5c518;
            border-radius: 8px;
            padding: 10px 25px;
            font-size: 1rem;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
        `;
        
        if (currentCategory === 'genres') {
            renderGenres('movie');
        } else {
            renderMovieClasses();
        }
    });
    
    seriesTypeBtn.addEventListener('click', () => {
        currentMediaType = 'tv';
        seriesTypeBtn.className = 'media-type-btn active';
        seriesTypeBtn.style.cssText = `
            background: linear-gradient(45deg, #f5c518, #e6b800);
            color: #000;
            border: none;
            border-radius: 8px;
            padding: 10px 25px;
            font-size: 1rem;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
        `;
        
        movieTypeBtn.className = 'media-type-btn';
        movieTypeBtn.style.cssText = `
            background: transparent;
            color: #f5c518;
            border: 2px solid #f5c518;
            border-radius: 8px;
            padding: 10px 25px;
            font-size: 1rem;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
        `;
        
        if (currentCategory === 'genres') {
            renderGenres('tv');
        } else {
            renderMovieClasses();
        }
    });
    
    main.appendChild(contentContainer);
}

// Function to fetch movies by country
async function fetchMoviesByCountry(countryCode, countryName) {
    // Set the current type based on media type selection
    currentType = currentMediaType;
    
    // Show loading message
    main.innerHTML = '<div class="loading">🔄 Loading ' + (currentMediaType === 'movie' ? 'movies' : 'TV shows') + ' from ' + countryName + '...</div>';
    
    try {
        // Construct API URL based on current media type and include the current page
        let url;
        if (currentMediaType === 'movie') {
            url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_origin_country=${countryCode}&sort_by=popularity.desc&page=${currentPage}`;
        } else {
            url = `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_origin_country=${countryCode}&sort_by=popularity.desc&page=${currentPage}`;
        }
        
        // Fetch data from API
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        
        // Display content using the appropriate function based on media type
        if (currentMediaType === 'movie') {
            displayMoviesInGenreView(data.results, countryName);
        } else {
            displaySeriesInGenreView(data.results, countryName);
        }
        
        // Show pagination
        renderPagination(data.total_pages);
        
        // Set current API URL and page for pagination
        currentAPIUrl = url;
        
    } catch (error) {
        console.error('Error fetching content:', error);
        main.innerHTML = `
            <div class="error">
                <h3>⚠️ Error Loading Content</h3>
                <p>We couldn't load ${currentMediaType === 'movie' ? 'movies' : 'TV shows'} from ${countryName}. Please try again later.</p>
                <p><small>Error: ${error.message}</small></p>
            </div>
        `;
    }
}

function displaySeriesInGenreView(items, countryName) {
    // Clear the main content area but keep the header
    const header = main.querySelector('.genre-selection-header');
    main.innerHTML = '';
    
    // Add the header back if it exists
    if (header) {
        main.appendChild(header);
    }
    
    // Create a new header for the country series
    const countryHeader = document.createElement('div');
    countryHeader.className = 'country-series-header';
    countryHeader.style.cssText = `
        text-align: center;
        margin-bottom: 2rem;
        padding: 1rem;
        background: linear-gradient(135deg, rgba(245,197,24,0.1), rgba(245,197,24,0.05));
        border-radius: 15px;
        border: 2px solid rgba(245,197,24,0.3);
    `;
    
    countryHeader.innerHTML = `
        <h2 style="color: #f5c518; font-size: 2rem; margin: 0 0 0.5rem 0;">Popular TV Shows from ${countryName}</h2>
        <p style="color: #fff; font-size: 1.1rem; margin: 0;">Click on a series to view details</p>
    `;
    
    main.appendChild(countryHeader);
    
    // Create a grid container for the series
    const seriesGrid = document.createElement('div');
    seriesGrid.className = 'series-grid';
    seriesGrid.style.cssText = `
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 20px;
        padding: 0 1rem;
    `;
    
    // Add series cards to the grid
    items.forEach(item => {
        const seriesCard = document.createElement('div');
        seriesCard.className = 'series-card';
        seriesCard.style.cssText = `
            background: rgba(255,255,255,0.05);
            border-radius: 10px;
            overflow: hidden;
            transition: all 0.3s ease;
            cursor: pointer;
            border: 1px solid rgba(245,197,24,0.2);
        `;
        
        const image = document.createElement('img');
        image.className = 'series-poster';
        image.src = item.poster_path ? IMG_PATH + item.poster_path : "https://via.placeholder.com/300x450?text=No+Image";
        image.style.cssText = `
            width: 100%;
            height: 300px;
            object-fit: cover;
            transition: transform 0.3s ease;
        `;
        
        const title = document.createElement('h3');
        title.textContent = item.name;
        title.style.cssText = `
            color: #fff;
            padding: 0.8rem;
            margin: 0;
            font-size: 1rem;
            text-align: center;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        `;
        
        const rating = document.createElement('div');
        rating.textContent = `⭐ ${item.vote_average ? item.vote_average.toFixed(1) : 'N/A'}`;
        rating.style.cssText = `
            color: #f5c518;
            text-align: center;
            padding: 0 0.8rem 0.8rem;
            font-size: 0.9rem;
        `;
        
        seriesCard.appendChild(image);
        seriesCard.appendChild(title);
        seriesCard.appendChild(rating);
        
        // Add hover effect
        seriesCard.addEventListener('mouseenter', () => {
            seriesCard.style.transform = 'translateY(-5px)';
            seriesCard.style.boxShadow = '0 10px 20px rgba(0,0,0,0.3)';
            seriesCard.style.borderColor = '#f5c518';
            image.style.transform = 'scale(1.05)';
        });
        
        seriesCard.addEventListener('mouseleave', () => {
            seriesCard.style.transform = 'translateY(0)';
            seriesCard.style.boxShadow = 'none';
            seriesCard.style.borderColor = 'rgba(245,197,24,0.2)';
            image.style.transform = 'scale(1)';
        });
        
        // Add click event to open modal
        seriesCard.addEventListener("click", () => {
            currentType = "tv";
            openModal(item);
        });
        
        seriesGrid.appendChild(seriesCard);
    });
    
    main.appendChild(seriesGrid);
    
    // Add pagination container
    const paginationContainer = document.createElement('div');
    paginationContainer.id = 'pagination';
    paginationContainer.style.cssText = `
        display: flex;
        justify-content: center;
        align-items: center;
        margin-top: 2rem;
        gap: 0.5rem;
    `;
    main.appendChild(paginationContainer);
    
    // Set the main section to use grid display
    main.style.display = 'grid';
}

// Add this new function to display movies properly in the genre view
function displayMoviesInGenreView(items, countryName) {
    // Clear the main content area but keep the header
    const header = main.querySelector('.genre-selection-header');
    main.innerHTML = '';
    
    // Add the header back if it exists
    if (header) {
        main.appendChild(header);
    }
    
    // Create a new header for the country movies
    const countryHeader = document.createElement('div');
    countryHeader.className = 'country-movies-header';
    countryHeader.style.cssText = `
        text-align: center;
        margin-bottom: 2rem;
        padding: 1rem;
        background: linear-gradient(135deg, rgba(245,197,24,0.1), rgba(245,197,24,0.05));
        border-radius: 15px;
        border: 2px solid rgba(245,197,24,0.3);
    `;
    
    countryHeader.innerHTML = `
        <h2 style="color: #f5c518; font-size: 2rem; margin: 0 0 0.5rem 0;">Popular Movies from ${countryName}</h2>
        <p style="color: #fff; font-size: 1.1rem; margin: 0;">Click on a movie to view details</p>
    `;
    
    main.appendChild(countryHeader);
    
    // Create a grid container for the movies
    const moviesGrid = document.createElement('div');
    moviesGrid.className = 'movies-grid';
    moviesGrid.style.cssText = `
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 20px;
        padding: 0 1rem;
    `;
    
    // Add movie cards to the grid
    items.forEach(item => {
        const movieCard = document.createElement('div');
        movieCard.className = 'movie-card';
        movieCard.style.cssText = `
            background: rgba(255,255,255,0.05);
            border-radius: 10px;
            overflow: hidden;
            transition: all 0.3s ease;
            cursor: pointer;
            border: 1px solid rgba(245,197,24,0.2);
        `;
        
        const image = document.createElement('img');
        image.className = 'movie-poster';
        image.src = item.poster_path ? IMG_PATH + item.poster_path : "https://via.placeholder.com/300x450?text=No+Image";
        image.style.cssText = `
            width: 100%;
            height: 300px;
            object-fit: cover;
            transition: transform 0.3s ease;
        `;
        
        const title = document.createElement('h3');
        title.textContent = item.title;
        title.style.cssText = `
            color: #fff;
            padding: 0.8rem;
            margin: 0;
            font-size: 1rem;
            text-align: center;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        `;
        
        const rating = document.createElement('div');
        rating.textContent = `⭐ ${item.vote_average ? item.vote_average.toFixed(1) : 'N/A'}`;
        rating.style.cssText = `
            color: #f5c518;
            text-align: center;
            padding: 0 0.8rem 0.8rem;
            font-size: 0.9rem;
        `;
        
        movieCard.appendChild(image);
        movieCard.appendChild(title);
        movieCard.appendChild(rating);
        
        // Add hover effect
        movieCard.addEventListener('mouseenter', () => {
            movieCard.style.transform = 'translateY(-5px)';
            movieCard.style.boxShadow = '0 10px 20px rgba(0,0,0,0.3)';
            movieCard.style.borderColor = '#f5c518';
            image.style.transform = 'scale(1.05)';
        });
        
        movieCard.addEventListener('mouseleave', () => {
            movieCard.style.transform = 'translateY(0)';
            movieCard.style.boxShadow = 'none';
            movieCard.style.borderColor = 'rgba(245,197,24,0.2)';
            image.style.transform = 'scale(1)';
        });
        
        // Add click event to open modal
        movieCard.addEventListener("click", () => {
            currentType = "movie";
            openModal(item);
        });
        
        moviesGrid.appendChild(movieCard);
    });
    
    main.appendChild(moviesGrid);
    
    // Add pagination container 
    const paginationContainer = document.createElement('div');
    paginationContainer.id = 'pagination';
    paginationContainer.style.cssText = `
        display: flex;
        justify-content: center;
        align-items: center;
        margin-top: 2rem;
        gap: 0.5rem;
    `;
    main.appendChild(paginationContainer);
    
    // Set the main section to use grid display
    main.style.display = 'grid';
}

    // News tab functionality
    newsTab.addEventListener("click", async (e) => {
        e.preventDefault();
        
        // Close genre popup if open
        const genrePopup = document.getElementById('genreSelectionPopup');
        if (genrePopup) {
            genrePopup.remove();
        }
        
        // STOP ALL TRAILERS WHEN SWITCHING TO NEWS
        stopAllTrailers();
        
        section.style.display = "none";
        pagination.style.display = "none";
        trailerSlider.style.display = "none";
        favoritesContainer.style.display = "none";
        newsContainer.style.display = "flex";
        newsContainer.style.flexDirection = "column";
        removeActive();
        newsTab.classList.add("active");
        localStorage.setItem("activeTab", "news");
        
        // Fetch and display news
        const newsData = await fetchMovieNews();
        renderNewsPage(newsData);
        
        // Start auto-refresh
        startNewsAutoRefresh();
    });
    // ====================== REVIEWS ======================
    submitReviewBtn.addEventListener("click", () => {
        const reviewText = reviewInput.value.trim();
        console.log("Review text:", reviewText);
        if (!reviewText || reviewText.length === 0) {
            console.log("Review is empty");
            showToast("Failed ❌ - Empty Review", "error");
            return;
        }
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
    suggestionsContainer.style.position = "fixed";
    suggestionsContainer.style.backgroundColor = "#1f1f1f";
    suggestionsContainer.style.color = "#fff";
    suggestionsContainer.style.zIndex = "999999"; // Very high z-index
    suggestionsContainer.style.border = "1px solid #f5c518";
    suggestionsContainer.style.display = "none";
    suggestionsContainer.style.borderRadius = "5px";
    suggestionsContainer.style.boxShadow = "0 4px 8px rgba(0,0,0,0.5)";
    document.body.appendChild(suggestionsContainer);
    // Function to update suggestions position
    function updateSuggestionsPosition() {
        const searchRect = search.getBoundingClientRect();
        suggestionsContainer.style.top = (searchRect.bottom + window.scrollY) + "px";
        suggestionsContainer.style.left = (searchRect.left + window.scrollX) + "px";
        suggestionsContainer.style.width = searchRect.width + "px";
    }
    // Initialize position
    updateSuggestionsPosition();
    // Update position on window resize
    window.addEventListener("resize", updateSuggestionsPosition);
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
                    div.style.padding = "8px 12px";
                    div.style.cursor = "pointer";
                    div.style.borderBottom = "1px solid rgba(245, 197, 24, 0.2)";
                    
                    div.addEventListener("click", () => {
                        search.value = currentType === "movie" ? item.title : item.name;
                        suggestionsContainer.style.display = "none";
                        
                        currentAPIUrl = searchAPI + encodeURIComponent(search.value);
                        currentPage = 1;
                        returnItems(currentAPIUrl, currentPage);
                        search.value = "";
                    });
                    
                    div.addEventListener("mouseover", () => {
                        div.style.backgroundColor = "#f5c518";
                        div.style.color = "#000";
                    });
                    
                    div.addEventListener("mouseout", () => {
                        div.style.backgroundColor = "transparent";
                        div.style.color = "#fff";
                    });
                    
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
    // ====================== REFRESH BUTTON ======================
    function addRefreshButton() {
        // Check if refresh button already exists
        if (document.getElementById('refreshButton')) {
            return;
        }
        
        const refreshButton = document.createElement('button');
        refreshButton.id = 'refreshButton';
        refreshButton.innerHTML = '<i class="fas fa-sync-alt"></i>';
        refreshButton.title = 'Refresh Availability';
        refreshButton.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: linear-gradient(45deg, #f5c518, #e6b800);
            color: #000;
            border: none;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            cursor: pointer;
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        `;
        
        refreshButton.addEventListener('mouseenter', () => {
            refreshButton.style.transform = 'scale(1.1)';
            refreshButton.style.boxShadow = '0 6px 12px rgba(245, 197, 24, 0.4)';
        });
        
        refreshButton.addEventListener('mouseleave', () => {
            refreshButton.style.transform = 'scale(1)';
            refreshButton.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
        });
        
        refreshButton.addEventListener('click', () => {
            // Only show popup if modal is open
            if (modal.style.display === 'flex') {
                const movieId = modal.dataset.movieId;
                if (movieId) {
                    const currentItem = {
                        title: modalTitle.textContent,
                        release_date: currentType === "movie" ? new Date().getFullYear() : null,
                        first_air_date: currentType === "tv" ? new Date().getFullYear() : null,
                        id: movieId
                    };
                    checkAndUpdateAvailability(currentItem);
                }
            } else {
                showToast("Select a movie or series to refresh availability", "info");
            }
            
            // Rotate the icon
            const icon = refreshButton.querySelector('i');
            icon.style.animation = 'spin 1s linear infinite';
            
            // Stop rotation after 1 second
            setTimeout(() => {
                icon.style.animation = '';
            }, 1000);
        });
        
        document.body.appendChild(refreshButton);
    }
    // ====================== NEWS AUTO-REFRESH ======================
    let newsRefreshInterval;
    function startNewsAutoRefresh() {
        // Clear any existing interval
        if (newsRefreshInterval) {
            clearInterval(newsRefreshInterval);
        }
        
        // Set up new interval (refresh every 5 minutes)
        newsRefreshInterval = setInterval(async () => {
            if (newsContainer.style.display === 'flex') {
                const newsData = await fetchMovieNews();
                renderNewsPage(newsData);
                showToast("News updated", "success");
            }
        }, 300000); // 5 minutes
    }
    // Stop auto-refresh when leaving news tab
    [moviesTab, seriesTab, favoritesTab, genresTab, homeTab].forEach(tab => {
        tab.addEventListener("click", () => {
            if (newsRefreshInterval) {
                clearInterval(newsRefreshInterval);
            }
        });
    });
    // ====================== FOOTER ======================
    function addFooter() {
        // Check if footer already exists
        if (document.getElementById('mainFooter')) {
            return;
        }
        
        const footer = document.createElement('footer');
        footer.id = 'mainFooter';
        footer.style.cssText = `
            background: linear-gradient(135deg, #0a0a0a, #1a1a1a);
            color: #fff;
            padding: 3rem 0 1rem;
            margin-top: 4rem;
            border-top: 1px solid rgba(245, 197, 24, 0.3);
        `;
        
        const footerContainer = document.createElement('div');
        footerContainer.style.cssText = `
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
        `;
        
        const footerContent = document.createElement('div');
        footerContent.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
            margin-bottom: 2rem;
        `;
        
        // About section
        const aboutSection = document.createElement('div');
        aboutSection.innerHTML = `
            <h3 style="color: #f5c518; margin-bottom: 1rem; font-size: 1.3rem;">About Cineverse</h3>
            <p style="line-height: 1.6; color: #ccc;">
                Ever wondering where to download a movie or tv show, well look no more, Cineverse got you, with a vast library of content and sites at your fingertips.
            </p>
        `;
        
        // Quick Links section
        const quickLinksSection = document.createElement('div');
        quickLinksSection.innerHTML = `
            <h3 style="color: #f5c518; margin-bottom: 1rem; font-size: 1.3rem;">Quick Links</h3>
            <ul style="list-style: none; padding: 0; margin: 0;">
                <li style="margin-bottom: 0.5rem;"><a href="#" style="color: #ccc; text-decoration: none; transition: color 0.3s;">Home</a></li>
                <li style="margin-bottom: 0.5rem;"><a href="#" style="color: #ccc; text-decoration: none; transition: color 0.3s;">Movies</a></li>
                <li style="margin-bottom: 0.5rem;"><a href="#" style="color: #ccc; text-decoration: none; transition: color 0.3s;">TV Shows</a></li>
                <li style="margin-bottom: 0.5rem;"><a href="#" style="color: #ccc; text-decoration: none; transition: color 0.3s;">News</a></li>
                <li style="margin-bottom: 0.5rem;"><a href="#" style="color: #ccc; text-decoration: none; transition: color 0.3s;">Favorites</a></li>
            </ul>
        `;
        
        // Categories section
        const categoriesSection = document.createElement('div');
        categoriesSection.innerHTML = `
            <h3 style="color: #f5c518; margin-bottom: 1rem; font-size: 1.3rem;">Categories</h3>
            <ul style="list-style: none; padding: 0; margin: 0;">
                <li style="margin-bottom: 0.5rem;"><a href="#" style="color: #ccc; text-decoration: none; transition: color 0.3s;">Action</a></li>
                <li style="margin-bottom: 0.5rem;"><a href="#" style="color: #ccc; text-decoration: none; transition: color 0.3s;">Comedy</a></li>
                <li style="margin-bottom: 0.5rem;"><a href="#" style="color: #ccc; text-decoration: none; transition: color 0.3s;">Drama</a></li>
                <li style="margin-bottom: 0.5rem;"><a href="#" style="color: #ccc; text-decoration: none; transition: color 0.3s;">Horror</a></li>
                <li style="margin-bottom: 0.5rem;"><a href="#" style="color: #ccc; text-decoration: none; transition: color 0.3s;">Sci-Fi</a></li>
            </ul>
        `;
        
        // Contact section
        const contactSection = document.createElement('div');
        contactSection.innerHTML = `
            <h3 style="color: #f5c518; margin-bottom: 1rem; font-size: 1.3rem;">Contact Us</h3>
            <p style="line-height: 1.6; color: #ccc; margin-bottom: 1rem;">
                Have questions or feedback? We'd love to hear from you!
            </p>
            <div style="display: flex; gap: 1rem;">
                <a href="#" style="color: #f5c518; font-size: 1.2rem; transition: transform 0.3s;"><i class="fab fa-facebook"></i></a>
                <a href="#" style="color: #f5c518; font-size: 1.2rem; transition: transform 0.3s;"><i class="fab fa-twitter"></i></a>
                <a href="#" style="color: #f5c518; font-size: 1.2rem; transition: transform 0.3s;"><i class="fab fa-instagram"></i></a>
                <a href="#" style="color: #f5c518; font-size: 1.2rem; transition: transform 0.3s;"><i class="fab fa-youtube"></i></a>
            </div>
        `;
        
        footerContent.appendChild(aboutSection);
        footerContent.appendChild(quickLinksSection);
        footerContent.appendChild(categoriesSection);
        footerContent.appendChild(contactSection);
        
        // Copyright section
        const copyrightSection = document.createElement('div');
        copyrightSection.style.cssText = `
            text-align: center;
            padding-top: 2rem;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            color: #999;
            font-size: 0.9rem;
        `;
        copyrightSection.innerHTML = `
            <p>&copy; ${new Date().getFullYear()} Cineverse. All rights reserved.</p>
            <p style="margin-top: 0.5rem;">Designed with <span style="color: #f44336;">❤️</span> by Cineverse Team</p>
        `;
        
        footerContainer.appendChild(footerContent);
        footerContainer.appendChild(copyrightSection);
        footer.appendChild(footerContainer);
        
        // Add hover effects for links
        const links = footer.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('mouseenter', () => {
                link.style.color = '#f5c518';
                if (link.querySelector('i')) {
                    link.style.transform = 'scale(1.2)';
                }
            });
            
            link.addEventListener('mouseleave', () => {
                link.style.color = '#ccc';
                if (link.querySelector('i')) {
                    link.style.transform = 'scale(1)';
                }
            });
        });
        
        document.body.appendChild(footer);
    }
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
    // ====================== COUNTRY EXPLORER FUNCTIONS ======================

// Function to initialize the country explorer
function initializeCountryExplorer() {
    // Set the container structure
    countriesContainer.innerHTML = `
        <div class="container">
            <div class="sidebar">
                <h2>🌍 Countries</h2>
                <ul class="country-list">
                    <li class="country-item" data-country="US">
                        <span class="country-flag">🇺🇸</span>
                        <span class="country-name">United States</span>
                    </li>
                    <li class="country-item" data-country="IN">
                        <span class="country-flag">🇮🇳</span>
                        <span class="country-name">India</span>
                    </li>
                    <li class="country-item" data-country="NG">
                        <span class="country-flag">🇳🇬</span>
                        <span class="country-name">Nigeria</span>
                    </li>
                    <li class="country-item" data-country="KR">
                        <span class="country-flag">🇰🇷</span>
                        <span class="country-name">South Korea</span>
                    </li>
                    <li class="country-item" data-country="JP">
                        <span class="country-flag">🇯🇵</span>
                        <span class="country-name">Japan</span>
                    </li>
                    <li class="country-item" data-country="GB">
                        <span class="country-flag">🇬🇧</span>
                        <span class="country-name">United Kingdom</span>
                    </li>
                    <li class="country-item" data-country="FR">
                        <span class="country-flag">🇫🇷</span>
                        <span class="country-name">France</span>
                    </li>
                    <li class="country-item" data-country="CN">
                        <span class="country-flag">🇨🇳</span>
                        <span class="country-name">China</span>
                    </li>
                    <li class="country-item" data-country="PK">
                        <span class="country-flag">🇵🇰</span>
                        <span class="country-name">Pakistan</span>
                    </li>
                    <li class="country-item" data-country="GH">
                        <span class="country-flag">🇬🇭</span>
                        <span class="country-name">Ghana</span>
                    </li>
                    <li class="country-item" data-country="PH">
                        <span class="country-flag">🇵🇭</span>
                        <span class="country-name">Philippines</span>
                    </li>
                    <li class="country-item" data-country="ZA">
                        <span class="country-flag">🇿🇦</span>
                        <span class="country-name">South Africa</span>
                    </li>
                    <li class="country-item" data-country="KE">
                        <span class="country-flag">🇰🇪</span>
                        <span class="country-name">Kenya</span>
                    </li>
                    <li class="country-item" data-country="CA">
                        <span class="country-flag">🇨🇦</span>
                        <span class="country-name">Canada</span>
                    </li>
                    <li class="country-item" data-country="AU">
                        <span class="country-flag">🇦🇺</span>
                        <span class="country-name">Australia</span>
                    </li>
                    <li class="country-item" data-country="MX">
                        <span class="country-flag">🇲🇽</span>
                        <span class="country-name">Mexico</span>
                    </li>
                    <li class="country-item" data-country="BR">
                        <span class="country-flag">🇧🇷</span>
                        <span class="country-name">Brazil</span>
                    </li>
                    <li class="country-item" data-country="RU">
                        <span class="country-flag">🇷🇺</span>
                        <span class="country-name">Russia</span>
                    </li>
                    <li class="country-item" data-country="IT">
                        <span class="country-flag">🇮🇹</span>
                        <span class="country-name">Italy</span>
                    </li>
                    <li class="country-item" data-country="ES">
                        <span class="country-flag">🇪🇸</span>
                        <span class="country-name">Spain</span>
                    </li>
                    <li class="country-item" data-country="EG">
                        <span class="country-flag">🇪🇬</span>
                        <span class="country-name">Egypt</span>
                    </li>
                    <li class="country-item" data-country="TH">
                        <span class="country-flag">🇹🇭</span>
                        <span class="country-name">Thailand</span>
                    </li>
                    <li class="country-item" data-country="TR">
                        <span class="country-flag">🇹🇷</span>
                        <span class="country-name">Turkey</span>
                    </li>
                    <li class="country-item" data-country="DE">
                        <span class="country-flag">🇩🇪</span>
                        <span class="country-name">Germany</span>
                    </li>
                </ul>
            </div>
            
            <div class="content">
                <div class="content-header">
                    <h1 id="country-title">Select a Country</h1>
                    <p id="country-description">Choose a country to explore its popular movies</p>
                </div>
                <div id="movies-container" class="movies-container">
                    <div class="loading">🎬 Select a country to view movies</div>
                </div>
            </div>
        </div>
    `;
    
    // Add event listeners to country items
    const countryItems = countriesContainer.querySelectorAll(".country-item");
    const moviesContainer = countriesContainer.querySelector("#movies-container");
    const countryTitle = countriesContainer.querySelector("#country-title");
    const countryDescription = countriesContainer.querySelector("#country-description");
    
    countryItems.forEach(item => {
        item.addEventListener("click", function() {
            // Remove selected class from all items
            countryItems.forEach(i => i.classList.remove("selected-country"));
            
            // Add selected class to clicked item
            this.classList.add("selected-country");
            
            // Get country code and name
            const countryCode = this.getAttribute("data-country");
            const countryName = this.querySelector(".country-name").textContent;
            
            // Update header
            countryTitle.textContent = `Popular Movies from ${countryName}`;
            countryDescription.textContent = `Discover trending films from ${countryName}'s cinema`;
            
            // Fetch movies for selected country
            fetchMoviesByCountry(countryCode, countryName, moviesContainer);
        });
    });
}

// Function to fetch movies by country
async function fetchMoviesByCountryForExplorer(countryCode, countryName, moviesContainer) {
    // Show loading message
    moviesContainer.innerHTML = '<div class="loading">🔄 Loading movies from ' + countryName + '...</div>';
    
    try {
        // Construct API URL for discovering movies by country
        const url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_origin_country=${countryCode}&sort_by=popularity.desc&page=1`;
        
        // Fetch data from API
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        
        // Display movies
        displayMovies(data.results, countryName, moviesContainer);
        
    } catch (error) {
        console.error('Error fetching movies:', error);
        moviesContainer.innerHTML = `
            <div class="error">
                <h3>⚠️ Error Loading Movies</h3>
                <p>We couldn't load movies from ${countryName}. Please try again later.</p>
                <p><small>Error: ${error.message}</small></p>
            </div>
        `;
    }
}

fetchMoviesByCountryForExplorer(countryCode, countryName, moviesContainer);

// Function to display movies
function displayMovies(movies, countryName, moviesContainer) {
    // Clear previous movies
    moviesContainer.innerHTML = '';
    
    if (movies.length === 0) {
        moviesContainer.innerHTML = `
            <div class="error">
                <h3>🎭 No Movies Found</h3>
                <p>We couldn't find any popular movies from ${countryName} at the moment.</p>
            </div>
        `;
        return;
    }
    
    // Create movie cards
    movies.forEach(movie => {
        const movieCard = document.createElement("div");
        movieCard.className = "movie-card";
        
        // Get poster path or use placeholder
        const posterPath = movie.poster_path 
            ? `${IMG_PATH + movie.poster_path}` 
            : `https://picsum.photos/seed/${movie.id}/300/450.jpg`;
        
        // Get release year
        const releaseYear = movie.release_date 
            ? new Date(movie.release_date).getFullYear() 
            : 'Unknown';
        
        // Set movie card HTML
        movieCard.innerHTML = `
            <img src="${posterPath}" 
                 alt="${movie.title}" 
                 class="movie-poster"
                 onerror="this.src='https://picsum.photos/seed/${movie.id}/300/450.jpg'">
            <div class="movie-info">
                <div class="movie-title">${movie.title}</div>
                <div class="movie-year">${releaseYear}</div>
                <div class="movie-rating">
                    ⭐ ${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
                </div>
            </div>
        `;
        
        // Add to container
        moviesContainer.appendChild(movieCard);
    });
}