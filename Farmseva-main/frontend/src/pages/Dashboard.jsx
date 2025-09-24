import React from 'react';
const user = JSON.parse(localStorage.getItem('fs_user') || 'null');
export default function Dashboard(){
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl">Welcome, {user?.name || 'Farmer'}</h2>
        <div>
          <a className="btn mr-2" href="/marketplace">Marketplace</a>
          <a className="btn mr-2" href="/advisory">Advisory</a>
          <a className="btn mr-2" href="/weather">Weather</a>
          <a className="btn" href="/schemes">Schemes</a>
        </div>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg mb-2">Quick Actions</h3>
        <p>Use Marketplace to list produce. Use Advisory to get instant crop tips. Weather shows live data (or fallback).</p>
      </div>
    </div>
  )
}
