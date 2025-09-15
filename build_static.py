import os
import shutil
from flask import Flask
from app import app  # Import your Flask app instance from app.py

def generate_static_files():
    # Create build directory
    build_dir = 'build'
    if os.path.exists(build_dir):
        shutil.rmtree(build_dir)
    os.makedirs(build_dir)

    # Use test client to render pages
    with app.test_client() as client:
        # Iterate over all routes and render them to static HTML
        for rule in app.url_map.iter_rules():
            if rule.endpoint != 'static':  # Skip static routes
                url = rule.rule
                # Simulate a GET request to the route
                response = client.get(url)
                # Ensure output_path is a valid file path
                if url == '/':  # Handle root route
                    output_path = os.path.join(build_dir, 'index.html')
                else:
                    output_path = os.path.join(build_dir, url.lstrip('/') + '.html')
                # Ensure the directory exists
                os.makedirs(os.path.dirname(output_path), exist_ok=True)
                # Save the rendered HTML
                with open(output_path, 'w', encoding='utf-8') as f:
                    f.write(response.get_data(as_text=True))

    # Copy static assets (adjust paths based on your app's static_folder)
    static_src = app.static_folder or 'static'  # Default to 'static' if not set in app.py
    if os.path.exists(static_src):
        shutil.copytree(static_src, os.path.join(build_dir, 'static'), dirs_exist_ok=True)
    
    # Manually copy your custom static folders (styles, images, videos, backend JS)
    for folder in ['styles', 'images', 'videos', 'backend']:
        if os.path.exists(folder):
            shutil.copytree(folder, os.path.join(build_dir, folder), dirs_exist_ok=True)
    
    print(f"Static files generated in '{build_dir}' folder.")

if __name__ == '__main__':
    generate_static_files()