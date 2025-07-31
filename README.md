
# 🧠 MediLens – AI-Powered First-Aid and Medical Triage App

MediLens is a medical AI web application that allows users to upload injury/medical condition experiencing images or type symptoms. It uses Gemini API for intelligent condition detection, displays first aid steps, and shows nearby hospitals on an interactive Leaflet map, including distance and address information as well as a Google map link.

-----------------------------------------------------------------

## 🏗️ Tech Stack

| Layer      | Tech                                 |
|------------|--------------------------------------|
| Frontend   | React, CSS, Leaflet.js, Geopy        |
| Backend    | Flask, Gemini API                    |
| Map API    | OpenStreetMap + Leaflet.js           |

-----------------------------------------------------------------

## 📁 Prerequisites 

Note : This works for mac have not tried for windows
Be sure to set up the .env file in the backend and also in frontend if not provided already. 

Frontend (.env) : 
    
    REACT_APP_API_BASE_URL=http://127.0.0.1:5000

Backend (.env) :
   
    GEMINI_API_KEY="YOUR_API_KEY_HERE"
-----------------------------------------------------------------

For Frontend :

Navigate to frontend :

cd frontend

npm install 

Final Step (for starting the frontend of the website): 
    npm start



-----------------------------------------------------------------

For Backend :

Navigate to backend : 

    cd backend

    cd venv

Install dependencies (might not work for windows, you can try to install the requirements.txt) :

    pip install flask (if not already)
    pip install python-dotenv
    pip install geopy

if the above doesn't work

    pip install -r requirements.txt (installs flask, python-dotenv, pillow)

Exit backend :
    
    cd .. 

Start virtual Environment :

    source venv/bin/activate


    if not create venv (virtual environment) :
            python3 -m venv venv

Navigate to venv folder :
    
    cd venv

final step (for starting the server):

    python3 server.py


-----------------------------------------------------------------

Enjoy!
If you enjoyed exploring the code or want to contribute, feel free to star ⭐ the repo, open issues, or send pull requests. Your support means a lot! Any feedback is greatly appreciated.

Stay healthy, stay curious, and keep building amazing things! 💡✨

🚀 Developed from idea to demo at Hack the 6ix 2025, innovation under pressure, real-world impact, and seamless AI integration.

[![View on Devpost](https://img.shields.io/badge/View%20on-Devpost-blue.svg)](https://devpost.com/software/medilens-navigator)


Happy Hacking! 👩‍💻👨‍💻
