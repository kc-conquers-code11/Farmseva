import React, {useEffect, useState} from 'react';
import api from '../services/api';

export default function Marketplace(){
  const [listings, setListings] = useState([]);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState(100);

  useEffect(()=>{ fetchList(); }, []);

  const fetchList = async ()=> {
    const r = await api.get('/marketplace');
    setListings(r.data);
  };

  const create = async ()=> {
    await api.post('/marketplace', { title, price });
    setTitle(''); setPrice(100);
    fetchList();
  };

  const remove = async (id)=> {
    await api.delete('/marketplace/'+id);
    fetchList();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-xl mb-4">Marketplace</h2>
      <div className="mb-4 bg-white p-4 rounded shadow">
        <input className="border p-2 mr-2" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
        <input className="border p-2 mr-2 w-32" placeholder="Price" value={price} onChange={e=>setPrice(Number(e.target.value))} />
        <button className="btn" onClick={create}>Create Listing</button>
      </div>

      <div className="grid gap-3">
        {listings.map(l => (
          <div key={l.id} className="bg-white p-4 rounded shadow flex justify-between">
            <div>
              <div className="font-semibold">{l.title}</div>
              <div>₹{l.price} • {l.qty || 1} • {l.location || '—'}</div>
              <div className="text-sm text-gray-600">{l.details}</div>
            </div>
            <div>
              <button className="btn" onClick={()=>remove(l.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
