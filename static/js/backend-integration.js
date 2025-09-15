// Backend Integration for Cineverse
// This file integrates the Python Flask backend for improved site availability checking

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Override the availability checking functions after a short delay
    // to ensure the original functions are loaded first
    setTimeout(integrateBackend, 1000);
});

function integrateBackend() {
    console.log("Integrating Python backend for availability checking...");
    
    // Determine the backend URL
    const getBackendUrl = () => {
        // If we're on localhost, use port 5000
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'http://localhost:5000';
        }
        // For production, use the same host but port 5000
        return `${window.location.protocol}//${window.location.hostname}:5000`;
    };
    
    const backendUrl = getBackendUrl();
    console.log("Using backend URL:", backendUrl);
    
    // Test if the backend is available
    fetch(`${backendUrl}/search?q=test`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Backend not available');
            }
            console.log("Backend is available, proceeding with integration");
            proceedWithIntegration(backendUrl);
        })
        .catch(error => {
            console.warn("Backend not available, using fallback method:", error);
            // Use the original method if backend is not available
            useFallbackMethod();
        });
}

function proceedWithIntegration(backendUrl) {
    // Override the checkAndUpdateAvailability function
    if (typeof window.checkAndUpdateAvailability === 'function') {
        window.checkAndUpdateAvailability = async function(item) {
            showAvailabilityPopup(true); // Show loading popup

            let availability;
            try {
                if (currentType === "movie") {
                    const year = item.release_date ? new Date(item.release_date).getFullYear() : null;
                    availability = await fetchMovieAvailability(backendUrl, item.title || item.name, year);
                } else {
                    // For series, we might have season and episode in the item
                    const season = item.season_number;
                    const episode = item.episode_number;
                    availability = await fetchSeriesAvailability(backendUrl, item.name || item.title, season, episode);
                }

                // Hide loading indicators
                hideAvailabilityLoading();

                // Update download buttons
                updateDownloadButtons(availability);

                // Show the sliding download options panel
                const downloadPanel = document.getElementById("downloadOptions");
                if (downloadPanel) {
                    downloadPanel.classList.add('active');
                }

                const availableCount = Object.values(availability).filter(url => url !== "Not Found").length;
                const totalSites = Object.keys(availability).length;

                // Show results popup
                const availableSites = Object.keys(availability).filter(site => availability[site] !== "Not Found");
                const itemTitle = currentType === "movie" ? (item.title || item.name) : (item.name || item.title);
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
        };
        
        console.log("Successfully overrode checkAndUpdateAvailability function");
    } else {
        console.error("checkAndUpdateAvailability function not found");
        useFallbackMethod();
    }
    
    // Override the updateDownloadButtons function
    if (typeof window.updateDownloadButtons === 'function') {
        window.updateDownloadButtons = function(availability) {
            const downloadOptions = document.getElementById("downloadOptions");
            if (!downloadOptions) return;
            
            const sourceButtons = downloadOptions.querySelectorAll(".source-btn");

            // Convert NodeList to Array for easier manipulation
            const buttonsArray = Array.from(sourceButtons);

            // Separate buttons into available and unavailable
            const availableButtons = [];
            const unavailableButtons = [];

            buttonsArray.forEach(button => {
                const site = button.getAttribute("data-site");
                const url = availability[site]; // This will be either a URL string or "Not Found"

                // Remove all existing indicators
                const existingIndicators = button.querySelectorAll('.loading-indicator, .available-indicator, .unavailable-indicator');
                existingIndicators.forEach(indicator => indicator.remove());

                if (url === "Not Found") {
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

                    // Set up the click event to open the URL
                    button.onclick = () => {
                        window.open(url, "_blank");
                        showToast(`Opening ${site.charAt(0).toUpperCase() + site.slice(1)}...`, "info");
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
        };
        
        console.log("Successfully overrode updateDownloadButtons function");
    } else {
        console.error("updateDownloadButtons function not found");
        useFallbackMethod();
    }
    
    // Add our new functions to the window object
    window.fetchMovieAvailability = async function(backendUrl, movieTitle, year) {
        const query = year ? `${movieTitle} ${year}` : movieTitle;
        try {
            const response = await fetch(`${backendUrl}/search?q=${encodeURIComponent(query)}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching movie availability:', error);
            // Return fallback data in case of error
            const sites = ["waploaded", "nkiri", "stagatv", "netnaija", "fzmovies", "o2tvseries", "toxicwap", "9jarocks", "netflix", "yts", "eztv", "piratebay", "limetorrents"];
            const result = {};
            sites.forEach(site => result[site] = "Not Found");
            return result;
        }
    };
    
    window.fetchSeriesAvailability = async function(backendUrl, seriesName, season, episode) {
        const params = new URLSearchParams();
        params.append('q', seriesName);
        if (season) params.append('season', season);
        if (episode) params.append('episode', episode);
        
        try {
            const response = await fetch(`${backendUrl}/series?${params.toString()}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching series availability:', error);
            // Return fallback data in case of error
            const sites = ["waploaded", "nkiri", "stagatv", "netnaija", "fzmovies", "o2tvseries", "toxicwap", "9jarocks", "netflix", "yts", "eztv", "piratebay", "limetorrents"];
            const result = {};
            sites.forEach(site => result[site] = "Not Found");
            return result;
        }
    };
    
    console.log("Backend integration complete!");
}

function useFallbackMethod() {
    console.log("Using fallback method for availability checking");
    // Here you could implement a fallback to the original method
    // For now, we'll just show a message
    if (typeof window.showToast === 'function') {
        showToast("Backend not available, using original method", "info");
    }
}

// Add helper functions if they don't exist
if (typeof window.showAvailabilityPopup !== 'function') {
    window.showAvailabilityPopup = function(loading = true, availableSites = [], totalSites = 0, itemTitle = '') {
        // Implementation would go here
        console.log("showAvailabilityPopup called with:", {loading, availableSites, totalSites, itemTitle});
    };
}

if (typeof window.hideAvailabilityLoading !== 'function') {
    window.hideAvailabilityLoading = function() {
        const loadingIndicators = document.querySelectorAll('.loading-indicator');
        loadingIndicators.forEach(indicator => indicator.remove());
    };
}

if (typeof window.showToast !== 'function') {
    window.showToast = function(message, type) {
        console.log(`Toast (${type}): ${message}`);
    };
}