import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Check for the authentication token in local storage
  const token = localStorage.getItem('fs_token');

  if (!token) {
    // If no token is found, redirect the user to the login page
    return <Navigate to="/login" replace />;
  }

  // If a token is found, render the page the user was trying to access
  return children;
};

export default ProtectedRoute;