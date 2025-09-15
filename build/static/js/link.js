
    document.getElementById("downloadMovie").addEventListener("click", () => {
  const title = document.getElementById("modalTitle").innerText.trim();
  const searchQuery = encodeURIComponent(title);

  const movieSites = [
    { name: "Waploaded", url: `https://waploaded.com/search?q=${searchQuery}` },
    { name: "Stagatv", url: `https://www.stagatv.com/?s=${searchQuery}` },
    { name: "NetNaija", url: `https://www.thenetnaija.net/search?t=${searchQuery}` },
    { name: "FzMovies", url: `https://fzmovies.net/search.php?searchname=${searchQuery}` },
    { name: "O2TvSeries", url: `https://o2tvseries.com/search/list/${searchQuery}` }
  ];

  let siteList = "Choose a site:\n";
  movieSites.forEach((site, index) => {
    siteList += `${index + 1}. ${site.name}\n`;
  });

  const choice = prompt(siteList, "1");

  if (choice && movieSites[choice - 1]) {
    window.open(movieSites[choice - 1].url, "_blank");
  } else {
    alert("❌ Invalid choice or file not found.");
  }
});

