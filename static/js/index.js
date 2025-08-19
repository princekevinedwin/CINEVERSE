// ====================== API CONFIGS ====================== 
const API_KEY = "3c1a2f72d6fdb0c8cdf454c4996353af";
const BASE_URL = "https://api.themoviedb.org/3";
const MOVIES_API = `${BASE_URL}/discover/movie?sort_by=popularity.desc&api_key=${API_KEY}`;
const SERIES_API = `${BASE_URL}/discover/tv?sort_by=popularity.desc&api_key=${API_KEY}`;
const IMG_PATH = "https://image.tmdb.org/t/p/w1280";
const SEARCH_MOVIE = `${BASE_URL}/search/movie?&api_key=${API_KEY}&query=`;
const SEARCH_SERIES = `${BASE_URL}/search/tv?&api_key=${API_KEY}&query=`;

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

// Series Download Container
const seriesDownloadContainer = document.getElementById("seriesDownloadContainer");
const seasonsList = document.getElementById("seasonsList");
const downloadAllBtn = document.getElementById("downloadAllBtn");

// ====================== PAGINATION ======================
let currentPage = 1;
let totalPages = 20;
let currentType = "movie"; // "movie" or "tv"
let currentAPIUrl = MOVIES_API;

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

async function openModal(item) {
    modal.style.display = "flex";
     modal.dataset.movieId = item.id; // store ID
    trailerEmbed.style.display = "none";
    modalImage.style.display = "block";

    modalImage.src = item.poster_path ? IMG_PATH + item.poster_path : "https://via.placeholder.com/300x450?text=No+Image";
    modalTitle.textContent = currentType === "movie" ? item.title : item.name;
    modalRating.textContent = item.vote_average ? item.vote_average.toFixed(1) : "N/A";
    movieSizeSpan.textContent = "Size: 1.2GB";

    const currentMovieTitle = currentType === "movie" ? item.title : item.name;

    // Download panel elements
    const downloadPanel = document.getElementById("downloadOptions");
    const episodeTitle = document.getElementById("episodeTitle");

    if (currentType === "tv") {
        await showSeriesDownloads(item);
    } else {
        seriesDownloadContainer.style.display = "none";
        downloadPanel.style.display = "block";
        episodeTitle.textContent = currentMovieTitle;

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
                    case "fzmovies": searchUrl = `https://fzmovies.net/search.php?searchname=${query}`; break;
                    case "o2tvseries": searchUrl = `https://o2tvseries.com/search?q=${query}`; break;
                }
                if (searchUrl) window.open(searchUrl, "_blank");
            };
        });
    }

    // Fetch details for modal
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

        // Trailer button inside modal
        document.getElementById("watchTrailer").onclick = async () => {
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
        };
    } catch (err) {
        console.error(err);
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

// ====================== TAB SWITCH ======================
moviesTab.addEventListener("click", (e) => {
    e.preventDefault();
    currentType = "movie";
    currentAPIUrl = MOVIES_API;
    currentPage = 1;
    returnItems(currentAPIUrl, currentPage);
});

seriesTab.addEventListener("click", (e) => {
    e.preventDefault();
    currentType = "tv";
    currentAPIUrl = SERIES_API;
    currentPage = 1;
    returnItems(currentAPIUrl, currentPage);
});

// ====================== TRAILER SLIDER ======================
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

    const items = data.results.slice(0, 5); // Top 5 trending

    for (let item of items) {
        const videosRes = await fetch(`${BASE_URL}/${currentType}/${item.id}/videos?api_key=${API_KEY}`);
        const videosData = await videosRes.json();
        const trailer = videosData.results.find(v => v.type === "Trailer" && v.site === "YouTube");
        if (trailer) trailers.push(trailer.key);
    }

    if (trailers.length > 0) playTrailer(currentIndex);
}

async function returnSeriesTrailers() {
    const res = await fetch(SERIES_API); // fetch trending series
    const data = await res.json();

    const trailerContainer = document.querySelector(".slider-container");
    trailerContainer.innerHTML = ""; // clear previous trailers

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

seriesTab.addEventListener("click", (e) => {
    e.preventDefault();
    currentType = "tv";
    currentAPIUrl = SERIES_API;
    currentPage = 1;
    returnItems(currentAPIUrl, currentPage);

    removeActive();
    seriesTab.classList.add("active");

    // Show trailer slider and load series trailers
    document.getElementById("trailer-slider").style.display = "block";
    returnSeriesTrailers();
});




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

// ====================== INITIALIZE ======================
returnItems(MOVIES_API, currentPage);
returnTrailers();

// ====================== SERIES DOWNLOAD ======================
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

        // Original top-right position
        seriesDownloadContainer.style.position = "fixed";
        seriesDownloadContainer.style.top = "100px";
        seriesDownloadContainer.style.right = "20px";
        seriesDownloadContainer.style.width = "320px";
        seriesDownloadContainer.style.maxHeight = "20rem"; // max height
        seriesDownloadContainer.style.overflowY = "auto"; // scroll if too tall
        seriesDownloadContainer.style.zIndex = "999";
        seriesDownloadContainer.style.transition = "transform 0.3s ease";
        seriesDownloadContainer.style.transform = "translateY(0)";

        // Movie source panel
        downloadOptions.style.display = "none";
        downloadOptions.style.position = "fixed";
        downloadOptions.style.bottom = "20px";
        downloadOptions.style.right = "20px";
        downloadOptions.style.width = "350px";
        downloadOptions.style.zIndex = "998";

        // Back button
        if (!document.getElementById("backToEpisodes")) {
            const backBtn = document.createElement("button");
            backBtn.id = "backToEpisodes";
            backBtn.innerHTML = "←";
            backBtn.style.color = "#f5c518";
            backBtn.style.background = "none";
            backBtn.style.border = "none";
            backBtn.style.fontSize = "1.5rem";
            backBtn.style.cursor = "pointer";
            backBtn.style.marginBottom = "10px";
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
            episodesContainer.style.maxHeight = "25vh"; // max height
            episodesContainer.style.overflowY = "auto"; // scroll if too many episodes

            for (let ep = 1; ep <= season.episode_count; ep++) {
                const epBtn = document.createElement("button");
                epBtn.className = "episode-btn";
                epBtn.textContent = `Episode ${ep}`;
                epBtn.dataset.title = `${season.name} Episode ${ep}`;
                epBtn.style.transition = "background 0.3s";
                episodesContainer.appendChild(epBtn);

                epBtn.addEventListener("click", () => {
                    // Highlight selected episode with theme background
                    document.querySelectorAll(".episode-btn").forEach(btn => {
                        btn.classList.remove("active-episode");
                        btn.style.background = "";
                        btn.style.color = "";
                    });
                    epBtn.classList.add("active-episode");
                    epBtn.style.backgroundColor = "#f5c518";
                    epBtn.style.color = "#000";

                    // Show movie source panel
                    downloadOptions.style.display = "block";

                    // Move series panel down smoothly
                    seriesDownloadContainer.style.transform = "translateY(20rem)";

                    // Update episode title at top of movie source panel
                    const episodeTitle = document.getElementById("episodeTitle");
                    if (episodeTitle) episodeTitle.textContent = epBtn.dataset.title;

                    // Attach source buttons search
                    document.querySelectorAll(".source-btn").forEach(btn => {
                        btn.onclick = () => {
                            const site = btn.getAttribute("data-site");
                            let query = "";
                            let searchUrl = "";

                            switch(site) {
                                case "waploaded":
                                    query = encodeURIComponent(`${tvShow.name} ${season.name}`);
                                    searchUrl = `https://waploaded.co/search/${query}/page/1?type=`;
                                    break;
                                case "nkiri":
                                    query = encodeURIComponent(`${tvShow.name} ${season.name} Episode ${ep}`);
                                    searchUrl = `https://nkiri.com/?s=${query}`;
                                    break;
                                case "stagatv":
                                    query = encodeURIComponent(`${tvShow.name} ${season.name} Episode ${ep}`);
                                    searchUrl = `https://www.stagatv.com/search?q=${query}`;
                                    break;
                                case "netnaija":
                                    query = encodeURIComponent(`${tvShow.name} ${season.name} Episode ${ep}`);
                                    searchUrl = `https://www.thenetnaija.net/search?t=${query}`;
                                    break;
                                case "fzmovies":
                                    query = encodeURIComponent(`${tvShow.name} ${season.name} Episode ${ep}`);
                                    searchUrl = `https://fzmovie.co.za/?s=${query}&post_type=post`;
                                    break;
                                case "o2tvseries":
                                    query = encodeURIComponent(`${tvShow.name} ${season.name} Episode ${ep}`);
                                    searchUrl = `https://o2tvseries.com/search?q=${query}`;
                                    break;
                            }

                            if (searchUrl) window.open(searchUrl, "_blank");
                        };
                    });
                });
            }

            // Accordion behavior: open this season, close others
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
    }
}


const downloadBtn = document.getElementById("downloadMovie");
const downloadPanel = document.getElementById("downloadOptions");

downloadBtn.addEventListener("click", () => {
  downloadPanel.classList.toggle("active");
});


// ====================== CLOSE MODAL ======================
closeModal.addEventListener("click", () => {
    modal.style.display = "none";
    modalImage.style.display = "block";
    trailerEmbed.style.display = "none";
    trailerEmbed.innerHTML = "";
});
window.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
        modalImage.style.display = "block";
        trailerEmbed.style.display = "none";
        trailerEmbed.innerHTML = "";
    }
});

// ====================== FAVORITES ======================
let movieFavorites = JSON.parse(localStorage.getItem("movieFavorites")) || [];
let seriesFavorites = JSON.parse(localStorage.getItem("seriesFavorites")) || [];

const favoritesTab = document.getElementById("favoritesTab");
const section = document.getElementById("section");
const pagination = document.getElementById("pagination");
const trailerSlider = document.getElementById("trailer-slider");
const favoritesContainer = document.getElementById("favoritesContainer");

// Track current type
let currentTypes = "movie"; // or "series" dynamically when modal opens

// ---------- ADD / REMOVE FAVORITE ----------
addFavoriteBtn.addEventListener("click", () => {
    const title = document.getElementById("modalTitle").textContent;
    const poster = document.getElementById("modalImage").src;

    let favorites = currentTypes === "movie" ? movieFavorites : seriesFavorites;

    const index = favorites.findIndex(f => f.title === title);

    if (index > -1) {
        favorites.splice(index, 1);
        addFavoriteBtn.innerHTML = '<i class="fas fa-heart"></i> Add Favorite';
        addFavoriteBtn.classList.remove("favorited");
    } else {
        favorites.push({ title, poster, type: currentTypes });
        addFavoriteBtn.innerHTML = '<i class="fas fa-heart"></i> Favorite';
        addFavoriteBtn.classList.add("favorited");
    }

    // Save to localStorage
    if (currentTypes === "movie") localStorage.setItem("movieFavorites", JSON.stringify(favorites));
    else localStorage.setItem("seriesFavorites", JSON.stringify(favorites));

    renderFavorites();
});

// ---------- RENDER FAVORITES ----------
function renderFavorites() {
    
    favoritesContainer.style.paddingTop = "2rem";
    favoritesContainer.style.display = "flex";
    favoritesContainer.style.flexDirection = "column";

    favoritesContainer.innerHTML = "";

    const allFavorites = [...movieFavorites, ...seriesFavorites];
    if (allFavorites.length > 0) {
    const clearBtn = document.createElement("button");
    clearBtn.textContent = "Clear All";
    clearBtn.style.backgroundColor = "#f5c518"; // theme color
    clearBtn.style.color = "#111";
    clearBtn.style.border = "none";
    clearBtn.style.borderRadius = "6px";
    clearBtn.style.padding = "0.5rem 1rem";
    clearBtn.style.marginBottom = "1rem";
    clearBtn.style.cursor = "pointer";
    clearBtn.addEventListener("click", () => {
        movieFavorites = [];
        seriesFavorites = [];
        localStorage.setItem("movieFavorites", JSON.stringify(movieFavorites));
        localStorage.setItem("seriesFavorites", JSON.stringify(seriesFavorites));
        renderFavorites();
    });
    favoritesContainer.appendChild(clearBtn);
}

    if (allFavorites.length === 0) {
        favoritesContainer.innerHTML = `<h1 style="color:#f5c518; font-size:4rem; text-align:center; margin-top:5rem;">No Favorites Yet 😿</h1>`;
        return;
    }

    allFavorites.forEach((fav, index) => {
        const card = document.createElement("div");
        card.className = "favorite-card";
        card.style.display = "flex";
        card.style.alignItems = "center";
        card.style.justifyContent = "space-between";
        card.style.padding = "0.5rem 1rem";
        card.style.width = "90%";
        card.style.marginBottom = "1rem";
        card.style.backgroundColor = index % 2 === 0 ? "#111" : "#222"; // alternate row color
        card.style.borderRadius = "6px";

        // Left: Poster + Title
        const leftDiv = document.createElement("div");
        leftDiv.style.display = "flex";
        leftDiv.style.alignItems = "center";
        leftDiv.style.gap = "1rem";

        const img = document.createElement("img");
        img.src = fav.poster;
        img.style.width = "80px";
        img.style.borderRadius = "6px";

        const title = document.createElement("div");
        title.textContent = fav.title;
        title.style.color = "#f5c518";
        title.style.fontWeight = "bold";

        leftDiv.appendChild(img);
        leftDiv.appendChild(title);

        // Right: Buttons (Info + Delete)
        const rightDiv = document.createElement("div");
        rightDiv.style.display = "flex";
        rightDiv.style.gap = "0.5rem";
        rightDiv.style.display = "flex";
        rightDiv.style.alignItems = "center"; // vertically center buttons
        rightDiv.style.gap = "0.5rem";


        // Info Button
        const infoBtn = document.createElement("button");
        infoBtn.innerHTML = '<i class="fas fa-info-circle"></i>';
        infoBtn.style.background = "transparent";
        infoBtn.style.border = "none";
        infoBtn.style.color = "#f5c518";
        infoBtn.style.cursor = "pointer";
        infoBtn.style.fontSize = "1.2rem";
        infoBtn.addEventListener("click", () => {
            openModalWithFavorite(fav);
        });

        // Delete Button
        const delBtn = document.createElement("button");
        delBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
        delBtn.style.background = "transparent";
        delBtn.style.border = "none";
        delBtn.style.color = "#f5c518";
        delBtn.style.cursor = "pointer";
        delBtn.style.fontSize = "1.2rem";
        delBtn.addEventListener("click", () => {
            if (fav.type === "movie") movieFavorites = movieFavorites.filter(f => f.title !== fav.title);
            else seriesFavorites = seriesFavorites.filter(f => f.title !== fav.title);

            localStorage.setItem("movieFavorites", JSON.stringify(movieFavorites));
            localStorage.setItem("seriesFavorites", JSON.stringify(seriesFavorites));
            renderFavorites();
        });

        rightDiv.appendChild(infoBtn);
        rightDiv.appendChild(delBtn);

        card.appendChild(leftDiv);
        card.appendChild(rightDiv);

        favoritesContainer.appendChild(card);
    });
}

// ---------- OPEN MODAL WITH FAVORITE INFO ----------
function openModalWithFavorite(fav) {
    modal.style.display = "block";
    document.getElementById("modalTitle").textContent = fav.title;
    document.getElementById("modalImage").src = fav.poster;

    // Set currentType for adding/removing favorite
    currentTypes = fav.type;

    // Update Add Favorite button state
    const favorites = currentTypes === "movie" ? movieFavorites : seriesFavorites;
    const isFav = favorites.some(f => f.title === fav.title);
    addFavoriteBtn.innerHTML = isFav ? '<i class="fas fa-heart"></i> Favorite' : '<i class="fas fa-heart"></i> Add Favorite';
    if (isFav) addFavoriteBtn.classList.add("favorited");
    else addFavoriteBtn.classList.remove("favorited");

    // TODO: Load genre-similar items in bottom popup
    showSimilarPopup(fav);
}

// ---------- SIMILAR POPUP ----------
function showSimilarPopup(fav) {
    // Here you can fetch or filter movies/series of same genre
    // For simplicity, showing a dummy bottom popup
    let popup = document.getElementById("similarPopup");
    if (!popup) {
        popup = document.createElement("div");
        popup.id = "similarPopup";
        popup.style.position = "fixed";
        popup.style.bottom = "0";
        popup.style.left = "0";
        popup.style.width = "100%";
        popup.style.height = "200px";
        popup.style.background = "#111";
        popup.style.color = "#f5c518";
        popup.style.overflowX = "auto";
        popup.style.display = "flex";
        popup.style.gap = "1rem";
        popup.style.alignItems = "center";
        popup.style.padding = "1rem";
        popup.style.zIndex = "999";
        document.body.appendChild(popup);
    }

    popup.innerHTML = `<strong>Similar ${fav.type === 'movie' ? 'Movies' : 'Series'}: </strong>`;
    // Dummy example: replicate the favorite itself
    const item = document.createElement("div");
    item.textContent = fav.title;
    popup.appendChild(item);
}

// ---------- FAVORITES TAB CLICK ----------
favoritesTab.addEventListener("click", (e) => {
    e.preventDefault();
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

    renderFavorites();
});

// ---------- MOVIES / SERIES TAB ----------
moviesTab.addEventListener("click", (e) => {
    e.preventDefault();
    section.style.display = "flex";
    pagination.style.display = "flex";
    trailerSlider.style.display = "flex";
    favoritesContainer.style.display = "none";

    removeActive();
    moviesTab.classList.add("active");
});

seriesTab.addEventListener("click", (e) => {
    e.preventDefault();
    section.style.display = "flex";
    pagination.style.display = "flex";
    trailerSlider.style.display = "flex";
    favoritesContainer.style.display = "none";

    removeActive();
    seriesTab.classList.add("active");
});

// ---------- INITIALIZE ----------
document.addEventListener("DOMContentLoaded", () => {
    renderFavorites();

    // Persist favorites tab if it was active
    if (localStorage.getItem("lastTab") === "favorites") {
        favoritesTab.click();
    }
});



// ====================== REVIEWS ======================
submitReviewBtn.addEventListener("click", () => {
    const reviewText = reviewInput.value.trim();
    if (!reviewText) return showToast("Failed ❌ - Empty Review", "error");

    const currentMovieTitle = modalTitle.textContent;

    const reviewItem = document.createElement("div");
    reviewItem.className = "review-bubble";

    // Show movie title + review text
    reviewItem.innerHTML = `<strong>${currentMovieTitle}</strong>${reviewText}`;

    allReviewsList.appendChild(reviewItem);

    // Scroll to bottom smoothly
    allReviewsList.scrollTo({
        top: allReviewsList.scrollHeight,
        behavior: "smooth"
    });

    reviewInput.value = "";
    reviewsPopup.classList.add("show");

    showToast("Review Submitted ✅", "success");
});

openReviewsBtn.addEventListener("click", () => reviewsPopup.classList.add("show"));

// Close Reviews Popup
backToMovieBtn.addEventListener("click", () => reviewsPopup.classList.remove("show"));



// ====================== DOWNLOADWELLA FUNCTION ======================
function openDownload(url) {
    const newTab = window.open(url, "_blank");
    if (!newTab) {
        showToast("❌ File not found or popup blocked!", "error");
        return;
    }
    showToast("Attempting download...", "success");
}

// ====================== TOAST ======================
function showToast(message, type) {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `<b>${message}</b>`; // Bold message
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}

// Get all menu links in the navbar
const navLinks = document.querySelectorAll(".topnav .menu a");

// Function to remove "active" class from all links
function removeActive() {
  navLinks.forEach(link => link.classList.remove("active"));
}

document.addEventListener("DOMContentLoaded", () => {
    const activeTab = localStorage.getItem("activeTab") || "movies";
    if (activeTab === "favorites") {
        favoritesTab.click();
    } else if (activeTab === "series") {
        seriesTab.click();
    } else {
        moviesTab.click();
    }
});

// Update activeTab whenever a tab is clicked
favoritesTab.addEventListener("click", () => localStorage.setItem("activeTab", "favorites"));
moviesTab.addEventListener("click", () => localStorage.setItem("activeTab", "movies"));
seriesTab.addEventListener("click", () => localStorage.setItem("activeTab", "series"));


// Movies tab click
moviesTab.addEventListener("click", (e) => {
  e.preventDefault();
  currentType = "movie";
  currentAPIUrl = MOVIES_API;
  currentPage = 1;
  returnItems(currentAPIUrl, currentPage);

  removeActive();
  moviesTab.classList.add("active");
});

// Series tab click
seriesTab.addEventListener("click", (e) => {
  e.preventDefault();
  currentType = "tv";
  currentAPIUrl = SERIES_API;
  currentPage = 1;
  returnItems(currentAPIUrl, currentPage);

  removeActive();
  seriesTab.classList.add("active");
});

// Load from localStorage if exists
const savedType = localStorage.getItem("currentType") || "movie";
const savedPage = parseInt(localStorage.getItem("currentPage")) || 1;

currentType = savedType;
currentPage = savedPage;
currentAPIUrl = currentType === "movie" ? MOVIES_API : SERIES_API;

// Highlight the correct tab
removeActive();
if (currentType === "movie") moviesTab.classList.add("active");
else seriesTab.classList.add("active");

// Render items on saved page
returnItems(currentAPIUrl, currentPage);

// Movies tab click
moviesTab.addEventListener("click", (e) => {
    e.preventDefault();
    currentType = "movie";
    currentAPIUrl = MOVIES_API;
    currentPage = 1;
    returnItems(currentAPIUrl, currentPage);

    removeActive();
    moviesTab.classList.add("active");

    // Save to localStorage
    localStorage.setItem("currentType", currentType);
    localStorage.setItem("currentPage", currentPage);
});

// Series tab click
seriesTab.addEventListener("click", (e) => {
    e.preventDefault();
    currentType = "tv";
    currentAPIUrl = SERIES_API;
    currentPage = 1;
    returnItems(currentAPIUrl, currentPage);

    removeActive();
    seriesTab.classList.add("active");

    // Save to localStorage
    localStorage.setItem("currentType", currentType);
    localStorage.setItem("currentPage", currentPage);
});

// Pagination buttons (inside renderPagination)
prev.addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        returnItems(currentAPIUrl, currentPage);

        // Save page
        localStorage.setItem("currentPage", currentPage);
    }
});

// Same for next button and page number buttons
btn.addEventListener("click", () => {
    currentPage = i;
    returnItems(currentAPIUrl, currentPage);

    // Save page
    localStorage.setItem("currentPage", currentPage);
});

next.addEventListener("click", () => {
    if (currentPage < total && currentPage < 20) {
        currentPage++;
        returnItems(currentAPIUrl, currentPage);

        // Save page
        localStorage.setItem("currentPage", currentPage);
    }
});

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

    const res = await fetch(`${BASE_URL}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
    const data = await res.json();

    if (data.results.length > 0) {
        data.results.slice(0, 5).forEach(item => {
            const div = document.createElement("div");
            div.textContent = item.name;
            div.style.padding = "5px 10px";
            div.style.cursor = "pointer";
            div.addEventListener("click", () => {
                search.value = item.name;
                suggestionsContainer.style.display = "none";
                // Trigger search
                currentType = "tv";
                currentAPIUrl = SEARCH_SERIES + encodeURIComponent(item.name);
                currentPage = 1;
                returnItems(currentAPIUrl, currentPage);
                removeActive();
                seriesTab.classList.add("active");
            });
            div.addEventListener("mouseover", () => div.style.backgroundColor = "#f5c518");
            div.addEventListener("mouseout", () => div.style.backgroundColor = "transparent");
            suggestionsContainer.appendChild(div);
        });
        suggestionsContainer.style.display = "block";
    } else {
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
        `${tvShowName} S${seasonNumber.toString().padStart(2,'0')}E${epNumber}`,    // S01E01
        `${tvShowName} ${seasonNumber}x${epNumber}`,                                 // 1x01
        `${tvShowName} Season ${seasonNumber} Episode ${epNumber}`,                  // Full text
        `${tvShowName} Season ${seasonNumber}`                                       // For Waploaded search that ignores episode
    ];
    return formats;
}

// Example usage when building search URLs (inside your episode click handler)
document.querySelectorAll(".source-btn").forEach(btn => {
    btn.onclick = () => {
        const site = btn.getAttribute("data-site");
        const episodeFormats = getEpisodeSearchFormats(tvShow.name, seasonIndex + 1, ep);
        let searchUrl = "";

        switch(site) {
            case "waploaded":
                searchUrl = `https://waploaded.co/search/${encodeURIComponent(tvShow.name + ' Season ' + (seasonIndex+1))}/page/1?type=`;
                break;
            case "fzmovies":
                searchUrl = `https://fzmovie.co.za/?s=${encodeURIComponent(tvShow.name + ' Season ' + (seasonIndex+1))}&id=7651&post_type=post`;
                break;
            case "nkiri":
                searchUrl = `https://nkiri.com/?s=${encodeURIComponent(tvShow.name + ' Season ' + (seasonIndex+1))}`;
                break;
            case "stagatv":
                searchUrl = `https://www.stagatv.com/?s=${encodeURIComponent(tvShow.name + ' Season ' + (seasonIndex+1))}`;
                break;
            case "netnaija":
                searchUrl = `https://www.thenetnaija.net/search?t=${encodeURIComponent(tvShow.name + ' Season ' + (seasonIndex+1))}`;
                break;
            case "o2tvseries":
                searchUrl = `https://o2tvseries.com/search?q=${encodeURIComponent(tvShow.name + ' Season ' + (seasonIndex+1))}`;
                break;
        }

        if (searchUrl) window.open(searchUrl, "_blank");
    };
});

// ====================== FAVORITES PERSISTENCE ======================
function loadFavorites() {
    const savedFavorites = JSON.parse(localStorage.getItem("favorites")) || [];
    // Optional: highlight favorite cards or populate a favorites panel
    return savedFavorites;
}

addFavoriteBtn.addEventListener("click", () => {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    const title = modalTitle.textContent;
    if (!favorites.includes(title)) favorites.push(title);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    showToast(`${title} added to favorites ❤️`, "success");
});

// ====================== REVIEWS PERSISTENCE ======================
function displayReview(reviewItem) {
    const reviewDiv = document.createElement("div");
    reviewDiv.className = "review-bubble";
    reviewDiv.innerHTML = `<strong>${reviewItem.title}</strong>: ${reviewItem.text}`;
    allReviewsList.appendChild(reviewDiv);
    allReviewsList.scrollTo({ top: allReviewsList.scrollHeight, behavior: "smooth" });
}

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

addFavoriteBtn.addEventListener("click", () => {
  if (addFavoriteBtn.classList.contains("favorited")) {
    // If already favorited, change back
    addFavoriteBtn.innerHTML = '<i class="fas fa-heart"></i> Add Favorite';
    addFavoriteBtn.classList.remove("favorited");
  } else {
    // If not favorited, mark as favorite
    addFavoriteBtn.innerHTML = '<i class="fas fa-heart"></i> Favorite';
    addFavoriteBtn.classList.add("favorited");
  }
});
