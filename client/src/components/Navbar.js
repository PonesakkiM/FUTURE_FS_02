import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="topbar">
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={onMenuToggle}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '4px 6px', display: 'flex', flexDirection: 'column', gap: '4px',
          }}
          className="lg:hidden"
        >
          <span style={{ display: 'block', width: '18px', height: '2px', background: '#1F3A5F' }} />
          <span style={{ display: 'block', width: '18px', height: '2px', background: '#1F3A5F' }} />
          <span style={{ display: 'block', width: '18px', height: '2px', background: '#1F3A5F' }} />
        </button>
        <span className="topbar-brand">■ MINI CRM</span>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#1F3A5F' }}>{user?.name}</div>
          <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {user?.role}
          </div>
        </div>
        <div style={{ width: '1px', height: '28px', background: '#ddd' }} />
        <button className="btn btn-outline btn-sm" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;
