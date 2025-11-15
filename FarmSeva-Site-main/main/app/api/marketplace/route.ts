import { NextRequest } from 'next/server';

// Marketplace API Stub
// Provider: Other (replace with real provider later)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = (searchParams.get('category') || 'all').toLowerCase() as 'pig' | 'poultry' | 'all';
  const q = (searchParams.get('q') || '').toLowerCase();

  const items = [
    { id: 'p1', name: 'Healthy Piglets', category: 'pig', price: 4200, unit: 'per piglet', location: 'Punjab', image: 'https://images.unsplash.com/photo-1545605281-3e3bbd6e0144' },
    { id: 'p2', name: 'Broiler Chickens', category: 'poultry', price: 120, unit: 'per kg', location: 'Gujarat', image: 'https://images.unsplash.com/photo-1518366636391-7e1f15e6b778' },
    { id: 'p3', name: 'Free-range Eggs', category: 'poultry', price: 6, unit: 'per egg', location: 'Himachal Pradesh', image: 'https://images.unsplash.com/photo-1552871632-09bf5311186d' },
    { id: 'p4', name: 'Breeding Boar', category: 'pig', price: 21000, unit: 'per boar', location: 'Haryana', image: 'https://images.unsplash.com/photo-1541689221361-ad95003448dc' },
  ];

  const filtered = items.filter((it) => {
    const matchCat = category === 'all' || it.category === category;
    const matchQ = !q || it.name.toLowerCase().includes(q) || it.location.toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  return new Response(
    JSON.stringify({ provider: 'other', count: filtered.length, items: filtered }),
    { status: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } }
  );
}
