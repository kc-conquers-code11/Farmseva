import axios from 'axios';
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';
const api = axios.create({ baseURL: API_BASE });
// token stored in localStorage as 'fs_token'
api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem('fs_token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});
export default api;
