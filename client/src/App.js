import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import Login       from './pages/Login';
import Dashboard   from './pages/Dashboard';
import Leads       from './pages/Leads';
import LeadDetails from './pages/LeadDetails';
import Analytics   from './pages/Analytics';

// ─── Authenticated Shell ──────────────────────────────────────────────────────
const AppShell = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#F4F6F8' }}>
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Content area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <Navbar onMenuToggle={() => setSidebarOpen(true)} />
        <main style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

// ─── Routes ───────────────────────────────────────────────────────────────────
const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/dashboard" element={<ProtectedRoute><AppShell><Dashboard /></AppShell></ProtectedRoute>} />
      <Route path="/leads"     element={<ProtectedRoute><AppShell><Leads /></AppShell></ProtectedRoute>} />
      <Route path="/leads/:id" element={<ProtectedRoute><AppShell><LeadDetails /></AppShell></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><AppShell><Analytics /></AppShell></ProtectedRoute>} />
      <Route path="*"          element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// ─── Root ─────────────────────────────────────────────────────────────────────
const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <AppRoutes />
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '0',
            background: '#1F3A5F',
            color: '#fff',
            fontSize: '13px',
            border: '1px solid #2d4f7c',
          },
          success: { iconTheme: { primary: '#27AE60', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#E74C3C', secondary: '#fff' } },
        }}
      />
    </BrowserRouter>
  </AuthProvider>
);

export default App;
