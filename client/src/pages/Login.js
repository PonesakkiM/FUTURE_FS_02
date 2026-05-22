import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login }             = useAuth();
  const navigate              = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Fill in all fields'); return; }
    setLoading(true);
    try {
      const { data } = await loginUser(form);
      login({ _id: data._id, name: data.name, email: data.email, role: data.role }, data.token);
      toast.success(`Welcome, ${data.name}`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#F4F6F8',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '0 16px' }}>

        {/* Header bar */}
        <div style={{
          background: '#1F3A5F', color: '#fff',
          padding: '16px 24px', borderBottom: '3px solid #E67E22',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '1px' }}>■ MINI CRM</div>
          <div style={{ fontSize: '12px', color: '#7fa8cc', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Client Lead Management System
          </div>
        </div>

        {/* Form box */}
        <div style={{ background: '#fff', border: '1px solid #D0D7DE', borderTop: 'none', padding: '28px 24px' }}>
          <h2 style={{ marginBottom: '20px', fontSize: '15px', color: '#1F3A5F', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Administrator Login
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '14px' }}>
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-control"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder=""
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder=""
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '11px', color: '#aaa' }}>
          Mini CRM v2.0 — Client Lead Management
        </div>
      </div>
    </div>
  );
};

export default Login;
