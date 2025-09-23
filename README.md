# FARM-SEVA Prototype 

This is a minimal, fully local prototype of FARM-SEVA:
- Frontend: React + Vite + Tailwind
- Backend: Node.js + Express + lowdb (file-based JSON DB)
- No external DB required. Optional OpenWeatherMap API (set OPENWEATHER_API_KEY in backend/.env)

## Quick start (Linux / mac / WSL / Windows PowerShell)

### Backend
cd backend
# install
npm install
# seed demo data
node -e "require('./utils/seed')().then(()=>console.log('seeded')).catch(console.error)"
# run
npm start
# server runs on http://localhost:4000

### Frontend
cd frontend
npm install
npm run dev
# app runs on http://localhost:5173

## Demo accounts
- farmer1@demo.com / password
- buyer1@demo.com / password

## Notes
- This prototype uses simple JWT auth and a JSON file (db.json). Suitable for hackathon demo.
- To enable real weather, set OPENWEATHER_API_KEY in backend/.env and restart backend.
