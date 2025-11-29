// Forum API Stub
// Provider: Other (replace with real provider later)
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').toLowerCase();
  const category = (searchParams.get('category') || 'all').toLowerCase();

  const posts = [
    { id: '1', title: 'ASF prevention checklist for small pig farms?', category: 'question', tags: ['pig','ASF'], replies: 8 },
    { id: '2', title: 'Broiler heat-stress tips that worked for me', category: 'success', tags: ['poultry','heat-stress'], replies: 23 },
    { id: '3', title: 'Layer feed formulation discussion (18% CP)', category: 'discussion', tags: ['poultry','feed'], replies: 15 },
    { id: '4', title: 'Pig housing drainage layout suggestions', category: 'tip', tags: ['pig','housing'], replies: 9 },
  ];

  const filtered = posts.filter((p) => {
    const matchQ = !q || p.title.toLowerCase().includes(q) || p.tags.some((t) => t.includes(q));
    const matchCat = category === 'all' || p.category === category;
    return matchQ && matchCat;
  });

  return new Response(
    JSON.stringify({ provider: 'other', count: filtered.length, items: filtered }),
    { status: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } }
  );
}
