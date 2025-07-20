import os
from flask import Flask, request, jsonify, send_from_directory
from dotenv import load_dotenv
import google.generativeai as genai
from PIL import Image
import io
from flask_cors import CORS
from geopy.geocoders import Nominatim
from geopy.distance import geodesic
import math
import requests


# Load environment variables from .env file
load_dotenv()

app = Flask(__name__, static_folder='../frontend/build', static_url_path='/')
CORS(app) # Enable CORS for all routes

# --- API Key Configuration ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in environment variables. Please set it in your .env file.")

# Configure the Gemini API with the loaded key
genai.configure(api_key=GEMINI_API_KEY)

# Initialize Nominatim geolocator for finding places
# Provide a unique user_agent for Nominatim requests to avoid being blocked
geolocator = Nominatim(user_agent="medilens-app-v1") # Changed user_agent for uniqueness

# Define different Gemini models
gemini_text_model = genai.GenerativeModel('gemini-1.5-flash')
gemini_vision_model = genai.GenerativeModel('gemini-1.5-flash')

# --- Routes ---

# Serve React App (index.html will be served from frontend/build)
@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

# Serve other static assets from the frontend/build directory
@app.route('/<path:path>')
def serve_static_assets(path):
    # This route handles requests for static files like JS, CSS, images from the React build
    # It also serves index.html for any other paths, enabling client-side routing
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')


# --- Chat with Gemini (Text-only) ---
@app.route('/api/chat-with-gemini', methods=['POST'])
def chat_with_gemini():
    data = request.get_json()
    user_prompt = data.get('prompt')

    if not user_prompt:
        return jsonify({"error": "No prompt provided"}), 400

    try:
        response = gemini_text_model.generate_content(user_prompt)
        gemini_reply = response.text
        return jsonify({"gemini_reply": gemini_reply})

    except Exception as e:
        print(f"Error during Gemini text chat: {e}")
        return jsonify({"error": f"Failed to get Gemini reply: {str(e)}"}), 500

# --- Multimodal Image Analysis for Diagnosis & First Aid ---
@app.route('/api/analyze-image', methods=['POST'])
def analyze_image():
    user_text_prompt = request.form.get('text_prompt', '')
    
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    image_file = request.files['image']
    if not image_file.filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp')):
        return jsonify({"error": "Invalid image format. Please upload PNG, JPG, JPEG, GIF, or WEBP."}), 400

    try:
        img_bytes = image_file.read()
        img = Image.open(io.BytesIO(img_bytes)).convert('RGB')

        prompt_parts = [
            f"Analyze the condition shown in this image. {user_text_prompt}\n\n"
            "Based on the image and any provided text, describe the likely condition in simple terms. "
            "Then, provide general, non-medical first aid steps or immediate actions someone could take. "
            "IMPORTANT: State clearly that this is for informational purposes only and NOT a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional.",
            img
        ]

        response = gemini_vision_model.generate_content(prompt_parts)
        gemini_text = response.text

        return jsonify({"gemini_response": gemini_text})

    except Exception as e:
        print(f"Error during image analysis: {e}")
        return jsonify({"error": f"Failed to analyze image: {str(e)}"}), 500

# --- New Endpoint: Find Nearby Hospitals using Nominatim for Leaflet ---

@app.route('/api/leaflet-hospitals', methods=['POST'])
def find_leaflet_hospitals():
    data = request.get_json()
    lat = data.get('latitude')
    lon = data.get('longitude')
    radius_km = data.get('radius_km', 5)

    if lat is None or lon is None:
        return jsonify({"error": "Latitude and longitude are required."}), 400

    try:
        radius_m = radius_km * 1000
        overpass_url = "http://overpass-api.de/api/interpreter"
        query = f"""
        [out:json];
        (
          node["amenity"~"hospital|clinic|doctors"](around:{radius_m},{lat},{lon});
          way["amenity"~"hospital|clinic|doctors"](around:{radius_m},{lat},{lon});
          relation["amenity"~"hospital|clinic|doctors"](around:{radius_m},{lat},{lon});
        );
        out center;
        """

        response = requests.get(overpass_url, params={'data': query})
        data = response.json()

        user_location = (lat, lon)
        hospitals = []

        for element in data['elements']:
            if 'tags' in element:
                tags = element['tags']
                name = tags.get('name', 'Unnamed Facility')
                hosp_lat = element.get('lat') or element.get('center', {}).get('lat')
                hosp_lon = element.get('lon') or element.get('center', {}).get('lon')

                if hosp_lat is not None and hosp_lon is not None:
                    distance_km = geodesic(user_location, (hosp_lat, hosp_lon)).km
                    hospitals.append({
                        'name': name,
                        'latitude': hosp_lat,
                        'longitude': hosp_lon,
                        'address': tags.get('addr:full', 'N/A'),
                        'type': tags.get('amenity', 'hospital'),
                        'distance_km': round(distance_km, 2)
                    })

        # Sort by distance
        hospitals.sort(key=lambda x: x['distance_km'])

        # Limit to 3 closest
        return jsonify({"hospitals": hospitals})

    except Exception as e:
        print(f"Overpass error: {e}")
        return jsonify({"error": f"Failed to find hospitals: {str(e)}"}), 500
    
# --- Main execution block ---
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, host='0.0.0.0', port=port)
