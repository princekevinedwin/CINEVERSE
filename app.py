from flask import Flask, request, jsonify, render_template
import requests
from bs4 import BeautifulSoup
import time
from flask_cors import CORS  # Add this import

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# 🎬 All supported sites & their search URLs
SITES = {
    "waploaded": "https://www.waploaded.com/search?q={}",
    "nkiri": "https://nkiri.com/?s={}",
    "stagatv": "https://www.stagatv.com/?s={}",
    "fzmovies": "https://fzmovies.net/search.php?searchname={}",
    "o2tvseries": "https://o2tvseries.com/search?q={}",
    "netnaija": "https://www.thenetnaija.net/search?t=video&q={}",
    "toxicwap": "https://toxicwap.com/index.php?search={}",
    "9jarocks": "https://www.9jarocks.net/?s={}",
    "yts": "https://yts.mx/browse-movies/{}/all/all/0/latest",
    "eztv": "https://eztv.re/search/{}",
    "piratebay": "https://thepiratebay.org/search.php?q={}",
    "limetorrents": "https://www.limetorrents.lol/search/all/{}/",
    "netflix": "https://www.netflix.com/search?q={}"
}

# Pretend to be a browser (avoid blocks)
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}

# 🔹 Scrape one site with improved logic
def scrape_site(url, query):
    search_url = url.format(query.replace(" ", "+"))
    try:
        r = requests.get(search_url, headers=HEADERS, timeout=10)
        if r.status_code != 200:
            return "Not Found"
        
        soup = BeautifulSoup(r.text, "html.parser")
        
        # Check for common "no results" indicators
        no_results_texts = [
            "no results found", "nothing found", "no posts matched", 
            "your search did not match", "0 results", "no movies found",
            "no series found", "sorry, no posts", "no content found"
        ]
        
        page_text = soup.get_text().lower()
        for text in no_results_texts:
            if text in page_text:
                return "Not Found"
        
        # Look for links that contain the query terms
        query_terms = query.lower().split()
        for link in soup.find_all("a", href=True):
            link_text = link.get_text().lower()
            link_href = link.get('href', '').lower()
            
            # Check if any query term is in the link text or href
            for term in query_terms:
                if len(term) > 2 and (term in link_text or term in link_href):
                    return search_url
        
        # Additional check for movie/series containers
        movie_containers = soup.find_all(["div", "article"], class_=lambda c: c and any(
            keyword in c.lower() for keyword in ["movie", "film", "series", "episode", "video"]
        ))
        
        for container in movie_containers:
            container_text = container.get_text().lower()
            for term in query_terms:
                if len(term) > 2 and term in container_text:
                    return search_url
        
        return "Not Found"
    except Exception as e:
        print(f"Error scraping {url}: {e}")
        return "Not Found"

# 🔹 Movies (just by name)
def check_sites(query):
    results = {}
    for site, url in SITES.items():
        results[site] = scrape_site(url, query)
    return results

# 🔹 Series (with fallback)
def check_series(name, season=None, episode=None):
    results = {}
    
    # Build query string with season + episode if available
    query = name
    if season and episode:
        query = f"{name} Season {season} Episode {episode}"
    elif season:
        query = f"{name} Season {season}"
    
    for site, url in SITES.items():
        found = scrape_site(url, query)
        
        # Fallbacks if episode/season not found
        if found == "Not Found" and season and episode:
            found = scrape_site(url, f"{name} Season {season}")
        if found == "Not Found":
            found = scrape_site(url, name)
            
        results[site] = found
    
    return results

# 🎬 Movies endpoint
@app.route("/search", methods=["GET"])
def search_movie():
    query = request.args.get("q")
    if not query:
        return jsonify({"error": "Missing query parameter"}), 400
    
    print(f"Searching for movie: {query}")
    results = check_sites(query)
    return jsonify(results)

# 📺 Series endpoint
@app.route("/series", methods=["GET"])
def search_series():
    name = request.args.get("q")
    season = request.args.get("season")
    episode = request.args.get("episode")
    
    if not name:
        return jsonify({"error": "Missing query parameter"}), 400
    
    print(f"Searching for series: {name}, Season: {season}, Episode: {episode}")
    results = check_series(name, season, episode)
    return jsonify(results)

# Add route to serve index.html
@app.route("/")
def serve_index():
    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True, port=5000)