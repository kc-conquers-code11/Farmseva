import { NextRequest } from 'next/server';

// Schemes API Stub
// Provider: Other (replace with real provider later)
// Wire your API key via process.env.OTHER_SCHEMES_API_KEY
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').toLowerCase();
  const state = searchParams.get('state') || 'all';
  const species = (searchParams.get('animal') || 'all').toLowerCase() as 'pig' | 'poultry' | 'all';

  // Example: const apiKey = process.env.OTHER_SCHEMES_API_KEY;
  // Use apiKey with your chosen provider here.

  const all = [
    {
      id: 'ps-1',
      name: 'Pig Development Programme',
      description: 'Support for piggery units, including housing and breed improvement.',
      species: 'pig',
      state: 'All India',
      amount: 'Up to ₹50,000'
    },
    {
      id: 'ps-2',
      name: 'Poultry Venture Capital Fund',
      description: 'Financial assistance for broiler/layer units with modern biosecurity.',
      species: 'poultry',
      state: 'All India',
      amount: 'Up to ₹25 lakh'
    },
    {
      id: 'ps-3',
      name: 'Biosecurity Infrastructure Support',
      description: 'Subsidy for fencing, footbaths, disinfection, and isolation pens.',
      species: 'pig',
      state: 'Punjab',
      amount: 'Variable'
    }
  ];

  const filtered = all.filter((s) => {
    const matchQ = !q || s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q);
    const matchState = state === 'all' || s.state === state || s.state === 'All India';
    const matchSpecies = species === 'all' || (s as { species: string }).species === species;
    return matchQ && matchState && matchSpecies;
  });

  return new Response(
    JSON.stringify({ provider: 'other', count: filtered.length, items: filtered }),
    { status: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } }
  );
}
