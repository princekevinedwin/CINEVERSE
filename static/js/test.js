// ====================== API CONFIGS ======================
const API_KEY = "3c1a2f72d6fdb0c8cdf454c4996353af";
const BASE_URL = "https://api.themoviedb.org/3";
const MOVIES_API = `${BASE_URL}/discover/movie?sort_by=popularity.desc&api_key=${API_KEY}`;
const SERIES_API = `${BASE_URL}/discover/tv?sort_by=popularity.desc&api_key=${API_KEY}`;
const IMG_PATH = "https://image.tmdb.org/t/p/w1280";
const SEARCH_MOVIE = `${BASE_URL}/search/movie?&api_key=${API_KEY}&query=`;
const SEARCH_SERIES = `${BASE_URL}/search/tv?&api_key=${API_KEY}&query=`;

// ====================== SITE CONFIGS ======================
const SITE_CONFIGS = {
    waploaded: {
        searchUrl: (query) => `https://www.waploaded.com/search?q=${encodeURIComponent(query)}`,
        corsProxy: 'https://api.allorigins.win/raw?url=',
        availabilityIndicators: ['.post-title', '.entry-title', '.movie-item'],
        timeout: 8000
    },
    nkiri: {
        searchUrl: (query) => `https://nkiri.com/?s=${encodeURIComponent(query)}`,
        corsProxy: 'https://api.allorigins.win/raw?url=',
        availabilityIndicators: ['.post-title', '.entry-title', 'h2 a'],
        timeout: 8000
    },
    stagatv: {
        searchUrl: (query) => `https://www.stagatv.com/?s=${encodeURIComponent(query)}`,
        corsProxy: 'https://api.allorigins.win/raw?url=',
        availabilityIndicators: ['.post-title', '.entry-title', '.movie-title'],
        timeout: 8000
    },
    netnaija: {
        searchUrl: (query) => `https://www.thenetnaija.net/search?t=${encodeURIComponent(query)}`,
        corsProxy: 'https://api.allorigins.win/raw?url=',
        availabilityIndicators: ['.post-title', '.entry-title', '.movie-link'],
        timeout: 8000
    },
    fzmovies: {
        searchUrl: (query) => `https://fzmovies.net/search.php?searchname=${encodeURIComponent(query)}`,
        corsProxy: 'https://api.allorigins.win/raw?url=',
        availabilityIndicators: ['.mainbox', '.movie-title', 'td a'],
        timeout: 8000
    },
    o2tvseries: {
        searchUrl: (query) => `https://o2tvseries.com/search?q=${encodeURIComponent(query)}`,
        corsProxy: 'https://api.allorigins.win/raw?url=',
        availabilityIndicators: ['.post-title', '.entry-title', '.series-title'],
        timeout: 8000
    }
};

// Current state variables
let currentPage = 1;
let totalPages = 20;
let currentType = "movie"; // or "tv"
let currentAPIUrl = MOVIES_API;


const main = document.getElementById("section");
const paginationContainer = document.getElementById("pagination");
const trailerContainer = document.querySelector(".slider-container");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
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
const form = document.getElementById("form");
const search = document.getElementById("query");
const moviesTab = document.getElementById("moviesTab");
const seriesTab = document.getElementById("seriesTab");
const favoritesTab = document.getElementById("favoritesTab");
const favoritesContainer = document.getElementById("favoritesContainer");
const seriesDownloadContainer = document.getElementById("seriesDownloadContainer");
const seasonsList = document.getElementById("seasonsList");
const downloadAllBtn = document.getElementById("downloadAllBtn");

// ====================== AVAILABILITY CHECKER ======================
async function checkSiteAvailability(siteName, query, year = '', itemType = 'movie') {
    const config = SITE_CONFIGS[siteName];
    if (!config) return false;

    try {
        let searchQuery;
        if (itemType === 'tv' || itemType === 'series') {
            searchQuery = year ? `${query} ${year} series` : `${query} series`;
        } else {
            searchQuery = year ? `${query} ${year}` : query;
        }

        const searchUrl = config.searchUrl(searchQuery);
        const proxyUrl = config.corsProxy + encodeURIComponent(searchUrl);
        const controller = new AbortController();

        const timeoutId = setTimeout(() => controller.abort(), config.timeout);

        const response = await fetch(proxyUrl, {
            method: 'GET',
            signal: controller.signal,
            headers: {
                'Accept': 'text/html,application/xhtml+xml',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        clearTimeout(timeoutId);

        if (!response.ok) return false;

        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        let hasContent = false;
        for (const selector of config.availabilityIndicators) {
            const elements = doc.querySelectorAll(selector);
            for (const element of elements) {
                const text = element.textContent.toLowerCase();
                const queryWords = query.toLowerCase().split(' ').filter(w => w.length > 2);

                let matchCount = queryWords.reduce((count, w) => text.includes(w) ? count + 1 : count, 0);

                if (itemType === 'tv' || itemType === 'series') {
                    const seriesIndicators = ['season', 'episode', 'series', 'tv show', 'episodes'];
                    if (seriesIndicators.some(ind => text.includes(ind))) matchCount++;
                }

                const minMatches = Math.max(1, Math.ceil(queryWords.length * 0.6));
                if (matchCount >= minMatches) {
                    hasContent = true;
                    break;
                }
            }
            if (hasContent) break;
        }

        const noResultsIndicators = [
            'no results found', 'nothing found', 'no posts found',
            'no movies found', 'no series found', 'search returned no results', 'sorry, no posts matched'
        ];
        const bodyText = doc.body?.textContent?.toLowerCase() || '';
        const noResults = noResultsIndicators.some(phrase => bodyText.includes(phrase));

        return hasContent && !noResults;

    } catch (error) {
        return false;
    }
}

async function checkAllSitesAvailability(item) {
    const title = currentType === "movie" ? item.title : item.name;
    const year = item.release_date ? new Date(item.release_date).getFullYear() : 
                 item.first_air_date ? new Date(item.first_air_date).getFullYear() : '';

    const siteNames = Object.keys(SITE_CONFIGS);
    const availabilityPromises = siteNames.map(siteName => checkSiteAvailability(siteName, title, year, currentType));

    try {
        const results = await Promise.allSettled(availabilityPromises);
        const availability = {};

        results.forEach((result, i) => {
            const site = siteNames[i];
            availability[site] = (result.status === 'fulfilled') ? result.value : false;
        });

        return availability;
    } catch {
        const availability = {};
        Object.keys(SITE_CONFIGS).forEach(site => availability[site] = false);
        return availability;
    }
}

function updateDownloadButtons(availability) {
    const sourceButtons = document.querySelectorAll(".source-btn");

    sourceButtons.forEach(button => {
        const site = button.getAttribute("data-site");
        const isAvailable = availability[site];

        // Remove any existing indicators
        [...button.querySelectorAll('.loading-indicator, .available-indicator, .unavailable-indicator')].forEach(el => el.remove());

        if (!isAvailable) {
            button.style.opacity = '0.5';
            button.style.cursor = 'not-allowed';
            button.style.filter = 'grayscale(80%)';
            button.disabled = true;

            const indicator = document.createElement('span');
            indicator.className = 'unavailable-indicator';
            indicator.innerHTML = ' ❌';
            indicator.style.color = '#ff4444';
            indicator.style.fontSize = '0.8em';
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
            indicator.style.color = '#4CAF50';
            indicator.style.fontSize = '0.8em';
            button.appendChild(indicator);

            button.onclick = () => {
                const query = encodeURIComponent(modalTitle.textContent);
                let searchUrl = "";
                switch (site) {
                    case "waploaded": searchUrl = `https://www.waploaded.com/search?q=${query}`; break;
                    case "nkiri": searchUrl = `https://nkiri.com/?s=${query}`; break;
                    case "stagatv": searchUrl = `https://www.stagatv.com/?s=${query}`; break;
                    case "netnaija": searchUrl = `https://www.thenetnaija.net/search?t=${query}`; break;
                    case "fzmovies": searchUrl = `https://fzmovies.net/search.php?searchname=${query}`; break;
                    case "o2tvseries": searchUrl = `https://o2tvseries.com/search?q=${query}`; break;
                }
                if (searchUrl) {
                    window.open(searchUrl, "_blank");
                    showToast(`Opening ${site.charAt(0).toUpperCase() + site.slice(1)}...`, "info");
                }
            };
        }
    });
}

function showAvailabilityLoading() {
    const sourceButtons = document.querySelectorAll(".source-btn");
    sourceButtons.forEach(button => {
        [...button.querySelectorAll('.loading-indicator, .available-indicator, .unavailable-indicator')].forEach(el => el.remove());

        button.style.opacity = '0.6';
        button.disabled = true;

        const indicator = document.createElement('span');
        indicator.className = 'loading-indicator';
        indicator.textContent = ' 🔄';
        indicator.style.animation = 'spin 1s linear infinite';
        button.appendChild(indicator);
    });

    if (!document.getElementById('availability-loader-css')) {
        const style = document.createElement('style');
        style.id = 'availability-loader-css';
        style.textContent = `
            @keyframes spin {
                from {transform: rotate(0deg);}
                to {transform: rotate(360deg);}
            }
        `;
        document.head.appendChild(style);
    }
}

function hideAvailabilityLoading() {
    [...document.querySelectorAll('.loading-indicator')].forEach(el => el.remove());
}

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
            showToast(`Available on ${availableCount}/${totalSites} sites`, "success");
        }
    } catch {
        hideAvailabilityLoading();
        showToast("Error checking availability", "error");
    }
}

// ====================== TOASTS ======================
function showToast(message, type) {
    const existingToasts = document.querySelectorAll('.compact-toast');
    existingToasts.forEach(toast => toast.remove());

    const toast = document.createElement("div");
    toast.className = `compact-toast ${type}`;
    toast.innerHTML = `<span>${message}</span>`;

    // Append and animate
    document.body.appendChild(toast);
    requestAnimationFrame(() => {
        toast.style.opacity = "1";
        toast.style.transform = "translateX(0)";
    });

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(100%)";
        setTimeout(() => {
            if (toast.parentNode) toast.remove();
        }, 300);
    }, 2500);
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

// ====================== PAGINATION ======================
function renderPagination(total) {
    paginationContainer.innerHTML = "";
    const prev = document.createElement("button");
    prev.textContent = "Prev";
    prev.disabled = currentPage === 1;
    prev.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            returnItems(currentAPIUrl, currentPage);
        }
    });
    paginationContainer.appendChild(prev);

    const maxPages = Math.min(total, 20);
    for (let i = 1; i <= maxPages; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        btn.className = "page-number";
        if (i === currentPage) btn.classList.add("active");
        btn.addEventListener("click", () => {
            currentPage = i;
            returnItems(currentAPIUrl, currentPage);
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
        }
    });
    paginationContainer.appendChild(next);
}

// ====================== FETCH AND RENDER ======================
async function returnItems(url, page = 1) {
    const res = await fetch(`${url}&page=${page}`);
    const data = await res.json();
    renderItems(data.results);
    renderPagination(data.total_pages);
}

// ====================== RECOMMENDATIONS ======================
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
    } catch {
        return [];
    }
}

// ====================== MODAL OPEN ======================
async function openModal(item) {
    modal.style.display = "flex";
    modal.dataset.movieId = item.id;
    trailerEmbed.style.display = "none";
    trailerEmbed.innerHTML = "";
    modalImage.style.display = "block";

    modalImage.src = item.poster_path ? IMG_PATH + item.poster_path : "https://via.placeholder.com/300x450?text=No+Image";
    modalTitle.textContent = currentType === "movie" ? item.title : item.name;
    modalRating.textContent = item.vote_average ? item.vote_average.toFixed(1) : "N/A";
    movieSizeSpan.textContent = "Size: N/A";

    const currentMovieTitle = currentType === "movie" ? item.title : item.name;

    // Handle recommended button placement
    const recommendations = await getRecommendations(item);
    let recButton = document.getElementById('showRecommendations');
    const modalActions = document.querySelector('.modal-actions');

    if (recommendations.length > 0) {
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
                margin: 0 10px;
                transition: all 0.3s ease;
            `;
            // Insert after the reviews button
            const reviewsBtn = document.getElementById("openReviews");
            if (reviewsBtn && modalActions) {
                reviewsBtn.insertAdjacentElement('afterend', recButton);
            } else if (modalActions) {
                modalActions.appendChild(recButton);
            }
        }
        recButton.onclick = () => createRecommendationsPanel(recommendations, item);
        recButton.style.display = 'inline-block';

        // Re-append movieSizeSpan to maintain order
        if (modalActions && movieSizeSpan) {
            modalActions.appendChild(movieSizeSpan);
        }
    } else if (recButton) {
        recButton.style.display = 'none';
    }

    // Download panel toggling
    const downloadPanel = document.getElementById("downloadOptions");

    if (currentType === "tv") {
        seriesDownloadContainer.style.display = "none";
        downloadPanel.style.display = "none";
        await showSeriesDownloads(item);
    } else {
        seriesDownloadContainer.style.display = "none";
        downloadPanel.style.display = "block";

        document.querySelectorAll(".source-btn").forEach(btn => {
            btn.onclick = () => {
                const site = btn.getAttribute("data-site");
                const query = encodeURIComponent(currentMovieTitle);
                let searchUrl = "";
                switch (site) {
                    case "waploaded": searchUrl = `https://www.waploaded.com/search?q=${query}`; break;
                    case "nkiri": searchUrl = `https://nkiri.com/?s=${query}`; break;
                    case "stagatv": searchUrl = `https://www.stagatv.com/?s=${query}`; break;
                    case "netnaija": searchUrl = `https://www.thenetnaija.net/search?t=${query}`; break;
                    case "fzmovies": searchUrl = `https://fzmovies.net/search.php?searchname=${query}`; break;
                    case "o2tvseries": searchUrl = `https://o2tvseries.com/search?q=${query}`; break;
                }
                if (searchUrl) window.open(searchUrl, "_blank");
            };
        });
        await checkAndUpdateAvailability(item);
    }

    try {
        const url = currentType === "movie"
            ? `${BASE_URL}/movie/${item.id}?api_key=${API_KEY}&language=en-US`
            : `${BASE_URL}/tv/${item.id}?api_key=${API_KEY}&language=en-US`;

        const res = await fetch(url);
        const details = await res.json();
        modalGenres.textContent = `Genres: ${details.genres.map(g => g.name).join(", ")}`;
        modalRuntime.textContent = currentType === "movie"
            ? (details.runtime || "N/A")
            : (details.episode_run_time && details.episode_run_time.length > 0 ? details.episode_run_time[0] : "N/A");
        modalOverview.textContent = details.overview || "Overview: N/A";

        const trailerBtn = document.getElementById("watchTrailer");
        const newTrailerBtn = trailerBtn.cloneNode(true);
        trailerBtn.parentNode.replaceChild(newTrailerBtn, trailerBtn);

        newTrailerBtn.onclick = async () => {
            try {
                const videosRes = await fetch(`${BASE_URL}/${currentType}/${item.id}/videos?api_key=${API_KEY}`);
                const videosData = await videosRes.json();

                const trailer = videosData.results.find(v => v.type === "Trailer" && v.site === "YouTube");
                if (trailer) {
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
                    showToast("No trailer available ❌", "error");
                }
            } catch {
                showToast("Error loading trailer ❌", "error");
            }
        };
    } catch (err) {
        // Error fetching details
    }
    updateFavoriteButton(item);
}

// ====================== SERIES DOWNLOADS ======================
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
        seriesDownloadContainer.style.position = "fixed";
        seriesDownloadContainer.style.top = "100px";
        seriesDownloadContainer.style.right = "20px";
        seriesDownloadContainer.style.width = "320px";
        seriesDownloadContainer.style.maxHeight = "20rem";
        seriesDownloadContainer.style.overflowY = "auto";
        seriesDownloadContainer.style.zIndex = "999";
        seriesDownloadContainer.style.transition = "transform 0.3s ease";
        seriesDownloadContainer.style.transform = "translateY(0)";

        const downloadOptions = document.getElementById("downloadOptions");
        downloadOptions.style.display = "none";
        downloadOptions.style.position = "fixed";
        downloadOptions.style.bottom = "20px";
        downloadOptions.style.right = "20px";
        downloadOptions.style.width = "350px";
        downloadOptions.style.zIndex = "998";

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

        data.seasons.forEach(season => {
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

                    const episodeItem = {
                        title: tvShow.name,
                        name: tvShow.name,
                        first_air_date: tvShow.first_air_date,
                        season_number: season.season_number,
                        episode_number: ep
                    };

                    document.querySelectorAll(".source-btn").forEach(btn => {
                        const site = btn.getAttribute("data-site");
                        btn.onclick = () => {
                            let query = "";
                            let searchUrl = "";
                            switch(site) {
                                case "waploaded":
                                    query = encodeURIComponent(`${tvShow.name} Season ${season.season_number}`);
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
                                    query = encodeURIComponent(`${tvShow.name} Season ${season.season_number} Episode ${ep}`);
                                    searchUrl = `https://fzmovies.net/search.php?searchname=${query}`;
                                    break;
                                case "o2tvseries":
                                    query = encodeURIComponent(`${tvShow.name} Season ${season.season_number} Episode ${ep}`);
                                    searchUrl = `https://o2tvseries.com/search?q=${query}`;
                                    break;
                            }
                            if (searchUrl) {
                                window.open(searchUrl, "_blank");
                                showToast(`Opening ${site.charAt(0).toUpperCase() + site.slice(1)}...`, "info");
                            }
                        };
                    });

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
        seriesDownloadContainer.style.display = "none";
        showToast("Error loading series data", "error");
    }
}

// ====================== MODAL CLOSE ======================
closeModal.addEventListener("click", () => {
    modal.style.display = "none";
    modalImage.style.display = "block";
    trailerEmbed.style.display = "none";
    trailerEmbed.innerHTML = "";
    const recPanel = document.getElementById('recommendationsPanel');
    if(recPanel){
        recPanel.style.left = '-400px';
        setTimeout(() => recPanel.remove(), 400);
    }
});

window.addEventListener("click", e => {
    if(e.target === modal){
        modal.style.display = "none";
        modalImage.style.display = "block";
        trailerEmbed.style.display = "none";
        trailerEmbed.innerHTML = "";
        const recPanel = document.getElementById('recommendationsPanel');
        if(recPanel){
            recPanel.style.left = '-400px';
            setTimeout(() => recPanel.remove(), 400);
        }
    }
});

// ====================== FAVORITES ======================
let movieFavorites = JSON.parse(localStorage.getItem("movieFavorites")) || [];
let seriesFavorites = JSON.parse(localStorage.getItem("seriesFavorites")) || [];

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
        leftDiv.style.cssText = `display: flex; align-items: center; gap: 1.5rem;`;

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
        title.style.cssText = `color: #f5c518; font-weight: bold; font-size: 1.3rem; margin-bottom: 0.5rem;`;

        const typeLabel = document.createElement("div");
        typeLabel.textContent = fav.type === 'movie' ? '🎬 Movie' : '📺 Series';
        typeLabel.style.cssText = `color: #888; font-size: 0.9rem; margin-bottom: 0.5rem;`;

        infoDiv.appendChild(title);
        infoDiv.appendChild(typeLabel);
        leftDiv.appendChild(img);
        leftDiv.appendChild(infoDiv);

        const rightDiv = document.createElement("div");
        rightDiv.style.cssText = `display: flex; align-items: center; gap: 1rem;`;

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

        card.addEventListener("click", () => {
            openModalWithFavorite(fav);
        });

        favoritesContainer.appendChild(card);
    });
}

// ====================== RECOMMENDATIONS PANEL ======================
async function createRecommendationsPanel(recommendations, originalItem) {
    const existingPanel = document.getElementById('recommendationsPanel');
    if (existingPanel) existingPanel.remove();

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

// ====================== MODAL OPEN WITH FAVORITE ======================
function openModalWithFavorite(fav) {
    modal.style.display = "flex";
    modalTitle.textContent = fav.title;
    modalImage.src = fav.poster;
    currentType = fav.type;

    const favorites = currentType === "movie" ? movieFavorites : seriesFavorites;
    const isFav = favorites.some(f => f.title === fav.title);
    addFavoriteBtn.innerHTML = isFav ? '<i class="fas fa-heart"></i> Favorite' : '<i class="fas fa-heart"></i> Add Favorite';
    if (isFav) addFavoriteBtn.classList.add("favorited");
    else addFavoriteBtn.classList.remove("favorited");
}

// ====================== TAB SWITCHING ======================
function removeActive() {
    document.querySelectorAll(".topnav .menu a").forEach(link => link.classList.remove("active"));
}
moviesTab.addEventListener("click", e => {
    e.preventDefault();
    currentType = "movie";
    currentAPIUrl = MOVIES_API;
    currentPage = 1;
    removeActive();
    moviesTab.classList.add("active");
    returnItems(currentAPIUrl, currentPage);
    trailerContainer.style.display = "flex";
    favoritesContainer.style.display = "none";
    returnTrailers();
});
seriesTab.addEventListener("click", e => {
    e.preventDefault();
    currentType = "tv";
    currentAPIUrl = SERIES_API;
    currentPage = 1;
    removeActive();
    seriesTab.classList.add("active");
    returnItems(currentAPIUrl, currentPage);
    trailerContainer.style.display = "block";
    favoritesContainer.style.display = "none";
    returnSeriesTrailers();
});
favoritesTab.addEventListener("click", e => {
    e.preventDefault();
    stopAllTrailers();
    removeActive();
    favoritesTab.classList.add("active");
    document.getElementById("section").style.display = "none";
    paginationContainer.style.display = "none";
    trailerContainer.style.display = "none";
    favoritesContainer.style.display = "flex";
    renderFavorites();
});

// ====================== TRAILERS ======================
let trailers = [];
let currentIndex = 0;
const trailerFrameWidth = "90vw";
const trailerFrameHeight = "80vh";

async function returnTrailers() {
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
    const items = data.results.slice(0, 5);
    for (let item of items) {
        const videosRes = await fetch(`${BASE_URL}/${currentType}/${item.id}/videos?api_key=${API_KEY}`);
        const videosData = await videosRes.json();
        const trailer = videosData.results.find(v => v.type === "Trailer" && v.site === "YouTube");
        if (trailer) trailers.push(trailer.key);
    }
    if (trailers.length > 0) playTrailer(currentIndex);
}

async function returnSeriesTrailers() {
    const res = await fetch(SERIES_API);
    const data = await res.json();
    trailers = [];
    trailerContainer.innerHTML = "";
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
    currentIndex = 0;
    playTrailer(currentIndex);
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
    currentIndex = (currentIndex - 1 + trailers.length) % trailers.length;
    playTrailer(currentIndex);
});
nextBtn.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % trailers.length;
    playTrailer(currentIndex);
});

const tag = document.createElement("script");
tag.src = "https://www.youtube.com/iframe_api";
document.body.appendChild(tag);

// ====================== INIT ======================
document.addEventListener("DOMContentLoaded", () => {
    const savedType = localStorage.getItem("currentType") || "movie";
    const savedPage = parseInt(localStorage.getItem("currentPage")) || 1;
    const activeTab = localStorage.getItem("activeTab") || "movies";

    currentType = savedType;
    currentPage = savedPage;
    currentAPIUrl = currentType === "movie" ? MOVIES_API : SERIES_API;

    if (activeTab === "favorites") favoritesTab.click();
    else if (activeTab === "series") seriesTab.click();
    else moviesTab.click();

    returnItems(currentAPIUrl, currentPage);
    returnTrailers();
    renderFavorites();
});

// ====================== SEARCH ======================
form.addEventListener("submit", e => {
    e.preventDefault();
    const searchItem = search.value.trim();
    if (!searchItem) return;

    currentAPIUrl = (currentType === "movie" ? SEARCH_MOVIE : SEARCH_SERIES) + searchItem;
    currentPage = 1;
    returnItems(currentAPIUrl, currentPage);
    search.value = "";
});

// ====================== FAVORITE BUTTON UPDATER & REVIEW HANDLERS ======================
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

openReviewsBtn.addEventListener("click", () => reviewsPopup.classList.add("show"));
backToMovieBtn.addEventListener("click", () => reviewsPopup.classList.remove("show"));

function displayReview(reviewItem) {
    const reviewDiv = document.createElement("div");
    reviewDiv.className = "review-bubble";
    reviewDiv.innerHTML = `<strong>${reviewItem.title}</strong>: ${reviewItem.text}`;
    allReviewsList.appendChild(reviewDiv);
    allReviewsList.scrollTo({ top: allReviewsList.scrollHeight, behavior: "smooth" });
}