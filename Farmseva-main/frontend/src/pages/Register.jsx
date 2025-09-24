import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import api from '../services/api';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const register = async () => {
    if (!name || !email || !password) {
      alert('Please fill in all fields.');
      return;
    }
    try {
      const r = await api.post('/auth/register', { name, email, password });
      localStorage.setItem('fs_token', r.data.token);
      localStorage.setItem('fs_user', JSON.stringify(r.data.user));
      window.location.href = '/dashboard'; // Redirect to dashboard on success
    } catch (e) {
      alert(e.response?.data?.error || 'Register failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
      <h1 className="text-2xl mb-4 font-bold">Create an Account</h1>
      <input
        className="border p-2 w-full mb-2"
        placeholder="Full Name"
        value={name}
        onChange={e => setName(e.target.value)}
      />
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
      <button className="btn w-full" onClick={register}>
        Register
      </button>
      <p className="text-center mt-4">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-600 hover:underline">
          Login here
        </Link>
      </p>
    </div>
  );
}