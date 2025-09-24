import React, {useEffect, useState} from 'react';
import axios from 'axios';

export default function Schemes(){
  const [s, setS] = useState([]);
  useEffect(()=>{ axios.get(`${import.meta.env.VITE_API_BASE || 'http://localhost:4000'}/api/schemes`).then(r=>setS(r.data)) },[]);
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-xl mb-4">Government Schemes</h2>
      <div className="bg-white p-4 rounded shadow">
        <ul>{s.map(x=>(<li key={x.id} className="mb-2"><strong>{x.title}</strong> — {x.desc}</li>))}</ul>
      </div>
    </div>
  )
}
