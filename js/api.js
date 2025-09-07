const API_KEY = "3c1a2f72d6fdb0c8cdf454c4996353af";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w500";
const OMDB_API_URL = "https://www.omdbapi.com/";
const OMDB_API_KEY = "eeff6d21"; // put your OMDb key here

async function fetchData(endpoint) {
    const res = await fetch(`${BASE_URL}${endpoint}?api_key=${API_KEY}&language=en-US`);
    return res.json();
}

async function searchData(query) {
    const res = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}`);
    return res.json();
}
