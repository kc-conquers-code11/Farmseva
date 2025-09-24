import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import api from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('farmer1@demo.com');
  const [password, setPassword] = useState('password');

  const login = async () => {
    try {
      const r = await api.post('/auth/login', { email, password });
      localStorage.setItem('fs_token', r.data.token);
      localStorage.setItem('fs_user', JSON.stringify(r.data.user));
      window.location.href = '/dashboard'; // Redirect to dashboard on success
    } catch (e) {
      alert(e.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
      <h1 className="text-2xl mb-4 font-bold">Farm-Seva Login</h1>
      <input
        className="border p-2 w-full mb-2"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        type="password"
        className="border p-2 w-full mb-4"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button className="btn w-full" onClick={login}>
        Login
      </button>
      <p className="text-center mt-4">
        Don't have an account?{' '}
        <Link to="/register" className="text-blue-600 hover:underline">
          Register here
        </Link>
      </p>
    </div>
  );
}