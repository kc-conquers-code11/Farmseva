import { NextRequest } from 'next/server';

// Weather API Stub
// Provider: Other (replace with real provider later)
// Wire your API key via process.env.OTHER_WEATHER_API_KEY
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get('lat') || '0');
  const lon = parseFloat(searchParams.get('lon') || '0');
  const state = searchParams.get('state') || 'All India';

  // Example: const apiKey = process.env.OTHER_WEATHER_API_KEY;
  // Call your weather provider with apiKey, lat, lon or state and return mapped response.

  const alerts = [
    { type: 'warning', title: 'Heat Stress Risk (Poultry)', description: 'Increase ventilation, provide cool water, and reduce stocking density temporarily', icon: 'mdi:weather-sunny-alert' },
    { type: 'info', title: 'Heavy Rainfall Expected (Pig Housing)', description: 'Improve drainage around pens and secure tarpaulin covers', icon: 'mdi:weather-pouring' }
  ];

  const forecast = [
    { day: 'Mon', rainMM: 12, tempC: 33 },
    { day: 'Tue', rainMM: 0, tempC: 34 },
    { day: 'Wed', rainMM: 5, tempC: 31 },
    { day: 'Thu', rainMM: 22, tempC: 29 },
    { day: 'Fri', rainMM: 8, tempC: 30 }
  ];

  return new Response(
    JSON.stringify({ provider: 'other', location: { lat, lon, state }, alerts, forecast }),
    { status: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } }
  );
}
