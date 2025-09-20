/**
 * API utility functions for TMDB
 */
const BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = "3c1a2f72d6fdb0c8cdf454c4996353af"; // User's provided TMDB API key

async function getVideos(id, type) {
    try {
        const response = await fetch(`${BASE_URL}/${type}/${id}/videos?api_key=${API_KEY}`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        return data.results || [];
    } catch (err) {
        console.error(`Failed to fetch videos for ${type} ID ${id}:`, err);
        throw err;
    }
}

async function getDetails(id, type) {
    try {
        const response = await fetch(`${BASE_URL}/${type}/${id}?api_key=${API_KEY}`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        return {
            vote_average: data.vote_average || 0,
            runtime: data.runtime || data.episode_run_time?.[0] || 0,
            number_of_seasons: data.number_of_seasons || 0,
            genres: data.genres || []
        };
    } catch (err) {
        console.error(`Failed to fetch details for ${type} ID ${id}:`, err);
        throw err;
    }
}