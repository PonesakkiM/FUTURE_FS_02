import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/dashboard', label: 'Dashboard',  icon: '▣' },
  { to: '/leads',     label: 'Leads',      icon: '◈' },
  { to: '/analytics', label: 'Analytics',  icon: '◉' },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 40, display: 'block',
          }}
          className="lg:hidden"
        />
      )}

      <aside
        className="sidebar"
        style={{
          position: 'fixed', top: 0, left: 0, height: '100vh',
          zIndex: 50, display: 'flex', flexDirection: 'column',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s ease',
        }}
      >
        {/* Brand */}
        <div className="sidebar-brand" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>■ MINI CRM</span>
          <button onClick={onClose} className="lg:hidden"
            style={{ background: 'none', border: 'none', color: '#7fa8cc', cursor: 'pointer', fontSize: '16px' }}>
            ✕
          </button>
        </div>

        {/* User info */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #2d4f7c' }}>
          <div style={{ fontSize: '12px', color: '#7fa8cc', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Logged in as
          </div>
          <div style={{ fontSize: '13px', color: '#fff', fontWeight: '600', marginTop: '2px' }}>{user?.name}</div>
          <div style={{ fontSize: '11px', color: '#7fa8cc', textTransform: 'uppercase', marginTop: '1px' }}>
            {user?.role}
          </div>
        </div>

        {/* Navigation */}
        <div className="sidebar-section">
          <div className="sidebar-label">Navigation</div>
          {NAV.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
            >
              <span style={{ fontSize: '14px', width: '18px', textAlign: 'center' }}>{icon}</span>
              {label}
            </NavLink>
          ))}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 'auto', padding: '12px 16px', borderTop: '1px solid #2d4f7c' }}>
          <div style={{ fontSize: '11px', color: '#4a6f8a' }}>Mini CRM v2.0</div>
          <div style={{ fontSize: '11px', color: '#4a6f8a' }}>Client Lead Management</div>
        </div>
      </aside>

      {/* Desktop static sidebar spacer */}
      <aside
        className="sidebar hidden lg:flex"
        style={{ flexDirection: 'column', position: 'relative', transform: 'none', zIndex: 'auto' }}
      >
        <div className="sidebar-brand">■ MINI CRM</div>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #2d4f7c' }}>
          <div style={{ fontSize: '12px', color: '#7fa8cc', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Logged in as</div>
          <div style={{ fontSize: '13px', color: '#fff', fontWeight: '600', marginTop: '2px' }}>{user?.name}</div>
          <div style={{ fontSize: '11px', color: '#7fa8cc', textTransform: 'uppercase', marginTop: '1px' }}>{user?.role}</div>
        </div>
        <div className="sidebar-section">
          <div className="sidebar-label">Navigation</div>
          {NAV.map(({ to, label, icon }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}>
              <span style={{ fontSize: '14px', width: '18px', textAlign: 'center' }}>{icon}</span>
              {label}
            </NavLink>
          ))}
        </div>
        <div style={{ marginTop: 'auto', padding: '12px 16px', borderTop: '1px solid #2d4f7c' }}>
          <div style={{ fontSize: '11px', color: '#4a6f8a' }}>Mini CRM v2.0</div>
          <div style={{ fontSize: '11px', color: '#4a6f8a' }}>Client Lead Management</div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
