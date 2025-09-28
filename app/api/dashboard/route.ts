// Dashboard Aggregation API Stub
// Provider: Other (replace with real providers later)
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const state = searchParams.get('state') || 'All India';

  const risk = {
    climate: 0.58,
    pest: 0.33,
    price: 0.52
  };

  const diseases = [
    { name: 'African Swine Fever (Pig)', risk: 'medium' },
    { name: 'Avian Influenza (Poultry)', risk: 'low' },
    { name: 'Coccidiosis (Poultry)', risk: 'high' }
  ];

  const alerts = [
    { type: 'warning', title: 'Heat Stress Risk (Poultry)' },
    { type: 'info', title: 'Heavy Rainfall Expected (Pig Housing)' }
  ];

  const analytics = {
    priceTrend: [
      { month: 'Jan', pig: 165, poultry: 120 },
      { month: 'Feb', pig: 170, poultry: 118 },
      { month: 'Mar', pig: 162, poultry: 125 },
      { month: 'Apr', pig: 175, poultry: 130 },
      { month: 'May', pig: 180, poultry: 135 },
      { month: 'Jun', pig: 178, poultry: 132 },
    ],
    rainfall: [
      { month: 'Jan', mm: 12 },
      { month: 'Feb', mm: 8 },
      { month: 'Mar', mm: 5 },
      { month: 'Apr', mm: 22 },
      { month: 'May', mm: 48 },
      { month: 'Jun', mm: 95 },
    ],
    productivity: [
      { animal: 'Pig', current: 82, target: 100 },
      { animal: 'Poultry', current: 90, target: 100 }
    ]
  };

  return new Response(
    JSON.stringify({ provider: 'other', state, risk, diseases, alerts, analytics }),
    { status: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } }
  );
}
