// ====================== API CONFIGS ====================== 
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
const genresTab = document.getElementById("genresTab");
const newsTab = document.querySelector('a[href="#"]:last-child');
// Series Download Container
const seriesDownloadContainer = document.getElementById("seriesDownloadContainer");
const seasonsList = document.getElementById("seasonsList");
const downloadAllBtn = document.getElementById("downloadAllBtn");
// News container
const newsContainer = document.createElement("div");
newsContainer.id = "newsContainer";
newsContainer.className = "news-container";
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
// ====================== NEWS AND UPDATES ======================
async function fetchMovieNews() {
    try {
        // Use the provided APItube API
        const response = await fetch(`${NEWS_API_URL}?api_key=${NEWS_API_KEY}&category=entertainment&limit=10`);
        const data = await response.json();
        
        // Also fetch upcoming movies from TMDb
        const upcomingResponse = await fetch(`${BASE_URL}/movie/upcoming?api_key=${API_KEY}&language=en-US&page=1`);
        const upcomingData = await upcomingResponse.json();
        
        // Fetch popular people from TMDb
        const peopleResponse = await fetch(`${BASE_URL}/person/popular?api_key=${API_KEY}&language=en-US&page=1`);
        const peopleData = await peopleResponse.json();
        
        // Fetch additional actor details
        const enhancedPeople = await Promise.all(peopleData.results.slice(0, 5).map(async person => {
            try {
                const detailsResponse = await fetch(`${BASE_URL}/person/${person.id}?api_key=${API_KEY}&language=en-US`);
                const details = await detailsResponse.json();
                
                // Get movie credits for the actor
                const creditsResponse = await fetch(`${BASE_URL}/person/${person.id}/movie_credits?api_key=${API_KEY}&language=en-US`);
                const credits = await creditsResponse.json();
                
                return {
                    ...person,
                    biography: details.biography || 'No biography available',
                    birthday: details.birthday || 'Unknown',
                    place_of_birth: details.place_of_birth || 'Unknown',
                    known_for_movies: credits.cast.slice(0, 3)
                };
            } catch (error) {
                console.error(`Error fetching details for ${person.name}:`, error);
                return person;
            }
        }));
        
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
        
        return {
            news: data.data || [],
            upcomingMovies: enhancedMovies,
            popularPeople: enhancedPeople
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
    
    const header = document.createElement('div');
    header.className = 'news-header';
    header.innerHTML = `
        <h1>Movie News & Updates</h1>
        <p>Stay updated with the latest in the world of cinema</p>
    `;
    newsContainer.appendChild(header);
    
    const categories = document.createElement('div');
    categories.className = 'news-categories';
    categories.innerHTML = `
        <div class="news-category active" data-category="all">All News</div>
        <div class="news-category" data-category="movies">Movies</div>
        <div class="news-category" data-category="actors">Actors</div>
        <div class="news-category" data-category="upcoming">Upcoming</div>
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
                <img src="${featuredNews.image_url || 'https://via.placeholder.com/800x400?text=Movie+News'}" alt="${featuredNews.title}">
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
    
    data.news.forEach(article => {
        const newsCard = document.createElement('div');
        newsCard.className = 'news-card';
        newsCard.innerHTML = `
            <div class="news-card-image">
                <img src="${article.image_url || 'https://via.placeholder.com/400x200?text=Movie+News'}" alt="${article.title}">
                <div class="news-card-category">News</div>
            </div>
            <div class="news-card-content">
                <h3 class="news-card-title">${article.title}</h3>
                <p class="news-card-excerpt">${article.description ? article.description.substring(0, 120) + '...' : 'No description available'}</p>
                <div class="news-card-meta">
                    <div class="news-card-date">
                        <i class="far fa-calendar"></i>
                        ${new Date(article.published_at).toLocaleDateString()}
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
    
    // Enhanced upcoming movies section
    data.upcomingMovies.forEach(movie => {
        const newsCard = document.createElement('div');
        newsCard.className = 'news-card upcoming-movie-card';
        
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
                <img src="${movie.poster_path ? IMG_PATH + movie.poster_path : 'https://via.placeholder.com/400x200?text=Movie+Poster'}" alt="${movie.title}">
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
    
    // Enhanced actors section
    data.popularPeople.forEach(person => {
        const newsCard = document.createElement('div');
        newsCard.className = 'news-card actor-card';
        
        // Format birthday
        const birthdayStr = person.birthday && person.birthday !== 'Unknown' 
            ? new Date(person.birthday).toLocaleDateString() 
            : 'Unknown';
        
        // Format known for movies
        const knownForStr = person.known_for_movies && person.known_for_movies.length > 0
            ? person.known_for_movies.map(m => m.title || m.name).join(', ')
            : 'Unknown';
        
        newsCard.innerHTML = `
            <div class="news-card-image">
                <img src="${person.profile_path ? IMG_PATH + person.profile_path : 'https://via.placeholder.com/400x200?text=Actor+Photo'}" alt="${person.name}">
                <div class="news-card-category">Actor</div>
            </div>
            <div class="news-card-content">
                <h3 class="news-card-title">${person.name}</h3>
                <p class="news-card-excerpt"><strong>Known for:</strong> ${person.known_for_department || 'Acting'}</p>
                <div class="actor-details">
                    <div class="actor-detail"><i class="far fa-calendar"></i> Born: ${birthdayStr}</div>
                    <div class="actor-detail"><i class="fas fa-map-marker-alt"></i> ${person.place_of_birth || 'Unknown'}</div>
                    <div class="actor-detail"><i class="fas fa-fire"></i> Popularity: ${Math.round(person.popularity)}</div>
                </div>
                <div class="actor-bio">${person.biography ? person.biography.substring(0, 150) + '...' : 'No biography available'}</div>
                <div class="actor-known-for"><strong>Known for:</strong> ${knownForStr}</div>
            </div>
        `;
        
        newsCard.addEventListener('click', () => {
            // In a real app, this would open an actor detail modal
            showToast(`Actor details for ${person.name}`, 'info');
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
                    const cardCategory = card.querySelector('.news-card-category').textContent.toLowerCase();
                    if (cardCategory === category.toLowerCase()) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                }
            });
        });
    });
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
                    <img src="${trailer.thumbnail || 'https://via.placeholder.com/400x225?text=Trailer'}" alt="${trailer.title}">
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
            renderItems(data.results);
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
        
        div_card.addEventListener("click", () => openModal(item));
    });
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
    removeActive();
    favoritesTab.classList.add("active");
    localStorage.setItem("activeTab", "favorites");
    renderFavorites();
});
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
    removeActive();
    genresTab.classList.add("active");
    localStorage.setItem("activeTab", "genres");
    
    // Show genre selection popup
    showGenreSelectionPopup();
});
// Function to create and show genre selection popup
function showGenreSelectionPopup() {
    // Remove existing popup if any
    const existingPopup = document.getElementById('genreSelectionPopup');
    if (existingPopup) {
        existingPopup.remove();
    }
    
    // Create popup container
    const popup = document.createElement('div');
    popup.id = 'genreSelectionPopup';
    popup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 90%;
        max-width: 800px;
        max-height: 80vh;
        background: linear-gradient(135deg, #000000, #1f1f1f);
        border: 2px solid #f5c518;
        border-radius: 15px;
        padding: 25px;
        z-index: 1001;
        overflow-y: auto;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        scrollbar-width: thin;
        scrollbar-color: #f5c518 transparent;
    `;
    
    // Add scrollbar styling
    const style = document.createElement('style');
    style.textContent = `
        #genreSelectionPopup::-webkit-scrollbar {
            width: 7px;
        }
        
        #genreSelectionPopup::-webkit-scrollbar-track {
            background: transparent;
            border-radius: 10px;
        }
        
        #genreSelectionPopup::-webkit-scrollbar-thumb {
            background: #f5c518;
            border-radius: 10px;
            border: none;
        }
        
        #genreSelectionPopup::-webkit-scrollbar-thumb:hover {
            background: #e6b814;
        }
    `;
    document.head.appendChild(style);
    
    // Create header
    const header = document.createElement('div');
    header.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        border-bottom: 2px solid #f5c518;
        padding-bottom: 15px;
    `;
    
    const title = document.createElement('h2');
    title.textContent = 'Select a Genre';
    title.style.cssText = `
        color: #f5c518;
        margin: 0;
        font-size: 2rem;
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
        // Show genre selection message when popup is closed
        showGenreSelectionMessage();
    });
    
    header.appendChild(title);
    header.appendChild(closeBtn);
    popup.appendChild(header);
    
    // Create media type selector
    const mediaTypeSelector = document.createElement('div');
    mediaTypeSelector.style.cssText = `
        display: flex;
        justify-content: center;
        margin-bottom: 25px;
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
    popup.appendChild(mediaTypeSelector);
    
    // Create genres grid
    const genresGrid = document.createElement('div');
    genresGrid.className = 'genres-grid';
    genresGrid.style.cssText = `
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 15px;
    `;
    
    // Function to render genres
    function renderGenres(type) {
        genresGrid.innerHTML = '';
        
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
            
            const genreName = document.createElement('h3');
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
                document.body.removeChild(popup);
                
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
    }
    
    // Initially render movie genres
    renderGenres('movie');
    
    // Add media type switch functionality
    movieTypeBtn.addEventListener('click', () => {
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
        
        renderGenres('movie');
    });
    
    seriesTypeBtn.addEventListener('click', () => {
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
        
        renderGenres('tv');
    });
    
    popup.appendChild(genresGrid);
    document.body.appendChild(popup);
}

// Function to show genre selection message when popup is closed
function showGenreSelectionMessage() {
    main.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 50vh; color: #f5c518;">
            <i class="fas fa-film" style="font-size: 4rem; margin-bottom: 1rem;"></i>
            <h2 style="font-size: 2rem; margin: 0; font-weight: bold;">Select Different Genres</h2>
            <p style="margin-top: 1rem; color: #ccc;">Click on the Genres tab again to choose a genre</p>
        </div>
    `;
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
suggestionsContainer.style.position = "absolute";
suggestionsContainer.style.backgroundColor = "#1f1f1f";
suggestionsContainer.style.color = "#fff";
suggestionsContainer.style.width = search.offsetWidth + "px";
suggestionsContainer.style.zIndex = "1000";
suggestionsContainer.style.border = "1px solid #f5c518";
suggestionsContainer.style.display = "none";
suggestionsContainer.style.top = "calc(100% + 2rem)"; // Position 2rem below search bar
search.parentNode.style.position = "relative"; // Set parent to relative for positioning
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
        // Rotate the icon
        const icon = refreshButton.querySelector('i');
        icon.style.animation = 'spin 1s linear infinite';
        
        // If modal is open, refresh availability for the current item
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
            // If no modal is open, just show a message
            showToast("Select a movie or series to refresh availability", "info");
        }
        
        // Stop rotation after 1 second
        setTimeout(() => {
            icon.style.animation = '';
        }, 1000);
    });
    
    document.body.appendChild(refreshButton);
}
// ====================== INITIALIZATION ======================
document.addEventListener("DOMContentLoaded", () => {
    // Add news container to the body
    document.body.appendChild(newsContainer);
    
    // Add refresh button
    addRefreshButton();
    
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
    } else if (activeTab === "news") {
        newsTab.classList.add("active");
        newsTab.click();
    } else if (activeTab === "genres") {
        genresTab.classList.add("active");
        // Show genre selection message instead of empty screen
        showGenreSelectionMessage();
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