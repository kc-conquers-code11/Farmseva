import React, {useState} from 'react';
import api from '../services/api';

export default function Advisory(){
  const [crop, setCrop] = useState('Wheat');
  const [ph, setPh] = useState(6.5);
  const [resp, setResp] = useState(null);

  const run = async ()=> {
    const r = await api.post('/advisory', { crop, ph: Number(ph) });
    setResp(r.data);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-xl mb-4">Crop Advisory</h2>
      <div className="bg-white p-4 rounded shadow mb-4">
        <input className="border p-2 mr-2" value={crop} onChange={e=>setCrop(e.target.value)} />
        <input className="border p-2 mr-2 w-28" value={ph} onChange={e=>setPh(e.target.value)} />
        <button className="btn" onClick={run}>Get Advice</button>
      </div>
      {resp && (
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Suggestions for {resp.crop}</h3>
          <ul className="list-disc pl-5 mt-2">
            {resp.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}
          </ul>
        </div>
      )}
    </div>
  )
}
