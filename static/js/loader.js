/**
 * Loader for initial page load
 */
document.addEventListener('DOMContentLoaded', () => {
  // Create loading overlay
  const loadingOverlay = document.createElement('div');
  loadingOverlay.id = 'loadingOverlay';
  loadingOverlay.innerHTML = `
    <div class="loader"></div>
    <p>Loading Movies...</p>
  `;
  document.body.appendChild(loadingOverlay);

  // Style (inline for isolation)
  loadingOverlay.style.position = 'fixed';
  loadingOverlay.style.top = '0';
  loadingOverlay.style.left = '0';
  loadingOverlay.style.width = '100%';
  loadingOverlay.style.height = '100vh';
  loadingOverlay.style.background = '#1f1f1f';
  loadingOverlay.style.display = 'flex';
  loadingOverlay.style.flexDirection = 'column';
  loadingOverlay.style.justifyContent = 'center';
  loadingOverlay.style.alignItems = 'center';
  loadingOverlay.style.zIndex = '9999';
  loadingOverlay.style.color = '#f5c518';

  // Center loader explicitly
  const loader = loadingOverlay.querySelector('.loader');
  loader.style.margin = '0 auto';

  // Style for the text
  const text = loadingOverlay.querySelector('p');
  text.style.marginTop = '10px';
  text.style.fontSize = '1.2rem';

  // Hide all sections except landing page
  const sections = ['section', 'favoritesContainer', 'countriesContainer'];
  sections.forEach(id => {
    const element = document.getElementById(id);
    if (element) element.style.display = 'none';
  });

  // Spinner style
  const style = document.createElement('style');
  style.innerHTML = `
    .loader {
      border: 8px solid #2c2c2c;
      border-top: 8px solid #f5c518;
      border-radius: 50%;
      width: 60px;
      height: 60px;
      animation: spin 1s linear infinite;
      position: relative;
      margin: 0 auto;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);

  // Simulate load delay (replace with actual async waits if needed)
  setTimeout(() => {
    // Force landing page: Movies tab
    currentType = "movie";
    currentAPIUrl = MOVIES_API;
    currentPage = 1;
    returnItems(currentAPIUrl, currentPage);
    removeActive();
    moviesTab.classList.add("active");

    // Show movies section, hide others
    document.getElementById('section').style.display = 'block';
    document.getElementById('favoritesContainer').style.display = 'none';
    document.getElementById('countriesContainer').style.display = 'none';

    // Hide loader
    loadingOverlay.style.display = 'none';
  }, 2000);
});

// Handle reload scrambling
window.addEventListener('beforeunload', () => {
  const sections = ['section', 'favoritesContainer', 'countriesContainer'];
  sections.forEach(id => {
    const element = document.getElementById(id);
    if (element) element.style.display = 'none';
  });
});

/**
 * Loader functions for showing/hiding availability loading
 */
function showAvailabilityLoading() {
    const loadingElement = document.getElementById("mobileAvailabilityLoading");
    if (loadingElement) {
        loadingElement.style.display = "block";
        loadingElement.style.top = "50%";
        loadingElement.style.left = "50%";
        loadingElement.style.transform = "translate(-50%, -50%)";
        loadingElement.style.bottom = "auto";
        loadingElement.style.right = "auto";
    }
}

function hideAvailabilityLoading() {
    const loadingElement = document.getElementById("mobileAvailabilityLoading");
    if (loadingElement) {
        loadingElement.style.display = "none";
    }
}