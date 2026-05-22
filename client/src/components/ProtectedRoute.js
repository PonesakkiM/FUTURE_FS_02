import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: '#F4F6F8', flexDirection: 'column', gap: '12px',
      }}>
        <div style={{
          width: '32px', height: '32px',
          border: '3px solid #1F3A5F', borderTopColor: 'transparent',
          borderRadius: '50%', animation: 'spin 0.8s linear infinite',
        }} />
        <p style={{ color: '#888', fontSize: '13px' }}>Loading...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return user ? children : <Navigate to="/" replace />;
};

export default ProtectedRoute;
