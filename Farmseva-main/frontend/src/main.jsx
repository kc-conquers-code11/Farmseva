import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login'
import Register from './pages/Register';
import Dashboard from './pages/Dashboard'
import Marketplace from './pages/Marketplace'
import Advisory from './pages/Advisory'
import Weather from './pages/Weather'
import Schemes from './pages/Schemes'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes: Login and Register are accessible to everyone */}
        <Route path='/' element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes: These are now wrapped with ProtectedRoute */}
        <Route path='/dashboard' element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path='/marketplace' element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
        <Route path='/advisory' element={<ProtectedRoute><Advisory /></ProtectedRoute>} />
        <Route path='/weather' element={<ProtectedRoute><Weather /></ProtectedRoute>} />
        <Route path='/schemes' element={<ProtectedRoute><Schemes /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

createRoot(document.getElementById('root')).render(<App />)
