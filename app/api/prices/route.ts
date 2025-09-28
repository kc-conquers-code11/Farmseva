import { NextRequest } from 'next/server';

// Prices API Stub
// Provider: Other (replace with real provider later)
// Wire your API key via process.env.OTHER_PRICES_API_KEY
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const animal = (searchParams.get('animal') || 'pig').toLowerCase() as 'pig' | 'poultry';
  const state = searchParams.get('state') || 'All India';

  // Example: const apiKey = process.env.OTHER_PRICES_API_KEY;
  // Call your price provider with apiKey, animal, state. Map to chart-friendly output.

  const months = ['Jan','Feb','Mar','Apr','May','Jun'];
  const base = animal === 'pig' ? 160 : 115; // ₹/kg
  const trend = months.map((m, i) => ({ month: m, price: base + i * (animal === 'pig' ? 3 : 2) }));

  const distribution = [
    { name: 'Pig', value: 56 },
    { name: 'Poultry', value: 44 }
  ];

  return new Response(
    JSON.stringify({ provider: 'other', animal, state, trend, unit: '₹/kg', distribution }),
    { status: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } }
  );
}
