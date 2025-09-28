    # SevaAlert - Next.js conversion

This project is a converted Next.js version of the original Vite React app.

## Features
- Single Next.js server serving frontend and API route for OpenWeather.
- `GET /api/weather?city=...` proxies requests to OpenWeather using server-side API key.

## Setup
1. Copy `.env.example` to `.env.local` and add your OpenWeather API key:

```
OPENWEATHER_API_KEY=your_api_key_here
```

2. Install dependencies:

```
npm install
```

3. Run dev server:

```
npm run dev
```

The app will be at http://localhost:3000

## Notes
- The original app logic for pig/poultry guidance has been preserved and now runs on the client using data from the API route.
- Keep your API key secret — do not commit `.env.local`.
