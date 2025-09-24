import React, {useState} from 'react';
import axios from 'axios';

export default function Weather(){
  const [city, setCity] = useState('Delhi');
  const [data, setData] = useState(null);

  const fetch = async ()=> {
    const r = await axios.get(`${import.meta.env.VITE_API_BASE || 'http://localhost:4000'}/api/weather?q=${city}`);
    setData(r.data);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-xl mb-4">Weather</h2>
      <div className="bg-white p-4 rounded shadow mb-4">
        <input className="border p-2 mr-2" value={city} onChange={e=>setCity(e.target.value)} />
        <button className="btn" onClick={fetch}>Fetch</button>
      </div>
      {data && <div className="bg-white p-4 rounded shadow">{data.name} — {data.main.temp}°C — {data.weather[0].main}</div>}
    </div>
  )
}
