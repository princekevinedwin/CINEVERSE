// ====================== API CONFIGS ======================
const API_KEY = "3c1a2f72d6fdb0c8cdf454c4996353af";
const BASE_URL = "https://api.themoviedb.org/3";
const APILINK = `${BASE_URL}/discover/movie?sort_by=popularity.desc&api_key=${API_KEY}`;
const IMG_PATH = "https://image.tmdb.org/t/p/w1280";
const SEARCHAPI = `${BASE_URL}/search/movie?&api_key=${API_KEY}&query=`;

// ====================== DOM ELEMENTS ======================
const main = document.getElementById("section");
const form = document.getElementById("form");
const search = document.getElementById("query");
const trailerContainer = document.querySelector(".slider-container");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const paginationContainer = document.getElementById("pagination");

// ====================== PAGINATION ======================
let currentPage = 1;
let totalPages = 20; // limit to 20 for UI
let currentAPIUrl = APILINK;

// ====================== FETCH MOVIES ======================
async function returnMovies(url, page = 1) {
    const res = await fetch(`${url}&page=${page}`);
    const data = await res.json();

    renderMovies(data.results);
    renderPagination(data.total_pages);
}

// ====================== RENDER MOVIES ======================
function renderMovies(movies) {
    main.innerHTML = "";

    movies.forEach(movie => {
        const div_card = document.createElement("div");
        div_card.className = "card";

        const div_column = document.createElement("div");
        div_column.className = "column";

        const image = document.createElement("img");
        image.className = "thumbnail";
        image.src = movie.poster_path ? IMG_PATH + movie.poster_path : "https://via.placeholder.com/300x450?text=No+Image";

        const title = document.createElement("h3");
        title.textContent = movie.title;

        const center = document.createElement("center");
        center.appendChild(image);

        div_card.appendChild(center);
        div_card.appendChild(title);
        div_column.appendChild(div_card);
        div_card.addEventListener("click", () => openModal(movie));
        main.appendChild(div_column);
    });
}

// ====================== RENDER PAGINATION ======================
function renderPagination(total) {
    paginationContainer.innerHTML = "";

    // Prev button
    const prev = document.createElement("button");
    prev.textContent = "Prev";
    prev.disabled = currentPage === 1;
    prev.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            returnMovies(currentAPIUrl, currentPage);
        }
    });
    paginationContainer.appendChild(prev);

    // Numbered buttons (limit to 20 pages max for UI)
    let maxPages = Math.min(total, 20);
    for (let i = 1; i <= maxPages; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        btn.className = "page-number";
        if (i === currentPage) btn.classList.add("active");

        btn.addEventListener("click", () => {
            currentPage = i;
            returnMovies(currentAPIUrl, currentPage);
        });

        paginationContainer.appendChild(btn);
    }

    // Next button
    const next = document.createElement("button");
    next.textContent = "Next";
    next.disabled = currentPage === total || currentPage === 20;
    next.addEventListener("click", () => {
        if (currentPage < total && currentPage < 20) {
            currentPage++;
            returnMovies(currentAPIUrl, currentPage);
        }
    });
    paginationContainer.appendChild(next);
}

// ====================== SEARCH ======================
form.addEventListener("submit", (e) => {
    e.preventDefault();
    const searchItem = search.value;
    if (searchItem) {
        currentAPIUrl = SEARCHAPI + searchItem;
        currentPage = 1;
        returnMovies(currentAPIUrl, currentPage);
        search.value = "";
    }
});

// ====================== TRAILER SLIDER ======================
let trailers = [];
let currentIndex = 0;
const trailerFrameWidth = "90vw";
const trailerFrameHeight = "80vh";

async function returnTrailers() {
    const res = await fetch(APILINK);
    const data = await res.json();

    trailers = [];
    trailerContainer.innerHTML = "";

    for (let i = 0; i < 5; i++) {
        const movie = data.results[i];
        const videosRes = await fetch(`${BASE_URL}/movie/${movie.id}/videos?api_key=${API_KEY}`);
        const videosData = await videosRes.json();
        const trailer = videosData.results.find(v => v.type === "Trailer" && v.site === "YouTube");
        if (trailer) trailers.push(trailer.key);
    }

    if (trailers.length > 0) playTrailer(currentIndex);
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

    iframe.onload = () => {
        if (typeof YT !== "undefined" && YT.Player) {
            const player = new YT.Player(iframe, {
                events: {
                    "onStateChange": (event) => {
                        if (event.data === YT.PlayerState.ENDED) {
                            currentIndex = (currentIndex + 1) % trailers.length;
                            playTrailer(currentIndex);
                        }
                    }
                }
            });
        }
    };
}

// ====================== TRAILER BUTTONS ======================
prevBtn.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + trailers.length) % trailers.length;
    playTrailer(currentIndex);
});

nextBtn.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % trailers.length;
    playTrailer(currentIndex);
});

// ====================== YOUTUBE API ======================
const tag = document.createElement("script");
tag.src = "https://www.youtube.com/iframe_api";
document.body.appendChild(tag);

// ====================== INITIALIZE ======================
returnMovies(APILINK, currentPage);
returnTrailers();

const OMDB_API_KEY = "eeff6d21";
const OMDB_API_URL = "https://www.omdbapi.com/";
const closeBtn = document.querySelector(".modal .close");

document.querySelectorAll(".card").forEach(card => {
  card.addEventListener("click", async () => {
    const imgSrc = card.querySelector("img").src;
    const title = card.querySelector("h3").innerText;

    // Fill basic info
    modalImage.src = imgSrc;
    modalTitle.innerText = title;
    modalRating.innerText = "Loading...";

    // Fetch IMDb rating from OMDb API
    try {
      const res = await fetch(`${OMDB_API_URL}?t=${encodeURIComponent(title)}&apikey=${OMDB_API_KEY}`);
      const data = await res.json();

      if (data && data.imdbRating && data.imdbRating !== "N/A") {
        modalRating.innerText = data.imdbRating;
      } else {
        modalRating.innerText = "N/A";
      }
    } catch (err) {
      console.error("Error fetching IMDb rating:", err);
      modalRating.innerText = "N/A";
    }

    modal.style.display = "flex";
  });
});

// Close modal
closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});

// Reviews
const reviewInput = document.getElementById("reviewText");
const submitReview = document.getElementById("submitReview");
const reviewList = document.getElementById("reviewList");

submitReview.addEventListener("click", () => {
  if (reviewInput.value.trim() !== "") {
    const p = document.createElement("p");
    p.textContent = reviewInput.value;
    reviewList.appendChild(p);
    reviewInput.value = "";
  }
});


// ---------------- Modal Setup ----------------
const modal = document.getElementById("movieModal");
const modalImage = document.getElementById("modalImage");
const modalTitle = document.getElementById("modalTitle");
const modalRating = document.getElementById("modalRating");
const closeModal = document.getElementById("closeModal");

// Open modal when a movie card is clicked
function openModal(movie) {
    modal.style.display = "flex"; // always flex for centering
    modalImage.src = IMG_PATH + movie.poster_path;
    modalTitle.textContent = movie.title;
    modalRating.textContent = movie.vote_average 
        ? movie.vote_average.toFixed(1) 
        : "N/A";
}

// Close modal when clicking X
closeModal.addEventListener("click", () => {
    modal.style.display = "none";
});

// Close modal when clicking outside content
window.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
    }
});

// ---------------- Attach to Movie Cards ----------------
function createMovieCard(movie) {
    const card = document.createElement("div");
    card.classList.add("movie-card");

    card.innerHTML = `
        <img src="${IMG_PATH + movie.poster_path}" alt="${movie.title}">
        <h3>${movie.title}</h3>
    `;

    // ✅ When card is clicked → open modal with that movie
    card.addEventListener("click", () => openModal(movie));

    return card;
}

// Handle Submit Review
document.getElementById("submitReview").addEventListener("click", function () {
  const reviewText = document.getElementById("reviewText").value.trim();

  if (reviewText) {
    // Create new review element
    const reviewItem = document.createElement("p");
    reviewItem.textContent = reviewText;

    // Append to SLIDE-IN popup reviews list (not inside modal)
    document.getElementById("allReviewsList").appendChild(reviewItem);

    // Clear textarea
    document.getElementById("reviewText").value = "";

    // ✅ Small success indicator (toast style)
    const toast = document.createElement("div");
    toast.className = "toast success";
    toast.textContent = "Review Submitted ✅";
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 2000);
  } else {
    const toast = document.createElement("div");
    toast.className = "toast error";
    toast.textContent = "Failed ❌ - Empty Review";
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 2000);
  }
});

// Open reviews popup
document.getElementById("openReviews").addEventListener("click", () => {
  document.getElementById("reviewsPopup").classList.add("show");
});

// Back button closes reviews popup
document.querySelector(".back-to-movie").addEventListener("click", () => {
  document.getElementById("reviewsPopup").classList.remove("show");
});
