import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAnalytics, getLeads, getTodayFollowUps } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatDate, checkOverdue, timeAgo, getStatusClass, getScoreClass, scoreLabelEmoji, capitalize } from '../utils/helpers';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement,
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import toast from 'react-hot-toast';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

// ─── Stat Box ─────────────────────────────────────────────────────────────────
const StatBox = ({ label, value, accent, sub }) => (
  <div className="info-box" style={{ borderTop: `3px solid ${accent}` }}>
    <div className="info-box-value" style={{ color: accent }}>{value}</div>
    <div className="info-box-label">{label}</div>
    {sub && <div style={{ fontSize: '11px', color: '#aaa', marginTop: '4px' }}>{sub}</div>}
  </div>
);

const Dashboard = () => {
  const [analytics, setAnalytics]     = useState(null);
  const [recentLeads, setRecent]       = useState([]);
  const [overdueLeads, setOverdue]     = useState([]);
  const [hotLeads, setHotLeads]        = useState([]);
  const [todayLeads, setTodayLeads]    = useState([]);
  const [loading, setLoading]          = useState(true);
  const [refreshing, setRefreshing]    = useState(false);
  const { user }                    = useAuth();
  const navigate                    = useNavigate();

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const [aRes, lRes, todayRes] = await Promise.all([
        getAnalytics(),
        getLeads({ limit: 50, sortBy: 'createdAt', sortOrder: 'desc' }),
        getTodayFollowUps(),
      ]);
      setAnalytics(aRes.data);
      const leads = lRes.data.leads;
      setRecent(leads.slice(0, 8));
      setOverdue(leads.filter(l => checkOverdue(l.followUpDate) && !['converted','lost'].includes(l.status)));
      setHotLeads(leads.filter(l => l.scoreLabel === 'Hot').slice(0, 5));
      setTodayLeads(todayRes.data.leads || []);
      if (isRefresh) toast.success('Refreshed');
    } catch { toast.error('Failed to load dashboard'); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', flexDirection: 'column', gap: '12px' }}>
      <div style={{ width: '28px', height: '28px', border: '3px solid #1F3A5F', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <span style={{ color: '#888', fontSize: '13px' }}>Loading dashboard...</span>
    </div>
  );

  const a = analytics || {};

  // Chart data
  const pieData = {
    labels: (a.sourceCounts || []).map(s => capitalize(s._id)),
    datasets: [{ data: (a.sourceCounts || []).map(s => s.count), backgroundColor: ['#1F3A5F','#4B8BBE','#E67E22','#27AE60','#E74C3C','#F39C12'], borderWidth: 2, borderColor: '#fff' }],
  };
  const barData = {
    labels: (a.statusCounts || []).map(s => capitalize(s._id)),
    datasets: [{ label: 'Leads', data: (a.statusCounts || []).map(s => s.count), backgroundColor: ['#4B8BBE','#F39C12','#27AE60','#E74C3C'], borderRadius: 0 }],
  };
  const barOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: '#eee' } }, x: { grid: { display: false } } },
  };
  const pieOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { padding: 10, font: { size: 11 } } } } };

  return (
    <div>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h1>Dashboard</h1>
          <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
            Welcome back, {user?.name} — {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-outline btn-sm" onClick={() => fetchData(true)} disabled={refreshing}>
            {refreshing ? 'Refreshing...' : '↻ Refresh'}
          </button>
          <button className="btn btn-accent" onClick={() => navigate('/leads')}>
            + New Lead
          </button>
        </div>
      </div>

      {/* ── KPI Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1px', background: '#D0D7DE', border: '1px solid #D0D7DE', marginBottom: '20px' }}>
        <StatBox label="Total Leads"       value={a.total || 0}           accent="#1F3A5F" sub="All time" />
        <StatBox label="New"               value={a.newLeads || 0}        accent="#4B8BBE" sub="Awaiting contact" />
        <StatBox label="Contacted"         value={a.contacted || 0}       accent="#F39C12" sub={`${a.total ? ((a.contacted/a.total)*100).toFixed(0) : 0}% of total`} />
        <StatBox label="Converted"         value={a.converted || 0}       accent="#27AE60" sub={`${a.conversionRate || 0}% rate`} />
        <StatBox label="Lost"              value={a.lost || 0}            accent="#E74C3C" sub="Closed lost" />
        <StatBox label="Overdue Follow-ups" value={overdueLeads.length}   accent="#E74C3C" sub="Need attention" />
      </div>

      {/* ── Charts Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div className="panel">
          <div className="panel-header">Leads by Source</div>
          <div className="panel-body" style={{ height: '220px' }}>
            {(a.sourceCounts || []).length > 0
              ? <Pie data={pieData} options={pieOptions} />
              : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#ccc' }}>No data</div>
            }
          </div>
        </div>
        <div className="panel">
          <div className="panel-header">Leads by Status</div>
          <div className="panel-body" style={{ height: '220px' }}>
            {(a.statusCounts || []).length > 0
              ? <Bar data={barData} options={barOptions} />
              : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#ccc' }}>No data</div>
            }
          </div>
        </div>
      </div>

      {/* ── Today's Follow-ups ── */}
      {todayLeads.length > 0 && (
        <div className="panel" style={{ marginBottom: '16px' }}>
          <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>📅 Today's Follow-ups</span>
            <span style={{ fontWeight: '400', color: '#E67E22' }}>{todayLeads.length} scheduled today</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Company</th>
                  <th>Status</th>
                  <th>Score</th>
                  <th>Follow-up Time</th>
                </tr>
              </thead>
              <tbody>
                {todayLeads.map((lead, i) => (
                  <tr key={lead._id} onClick={() => navigate(`/leads/${lead._id}`)}
                    style={{ background: i % 2 === 0 ? '#FFFBF5' : '#FFF8EE' }}>
                    <td style={{ fontWeight: '600', color: '#1F3A5F' }}>{lead.name}</td>
                    <td style={{ fontSize: '12px', color: '#888' }}>{lead.company || '—'}</td>
                    <td><span className={`status-badge status-${lead.status}`}>{capitalize(lead.status)}</span></td>
                    <td><span className={`status-badge ${getScoreClass(lead.scoreLabel)}`}>{scoreLabelEmoji[lead.scoreLabel]} {lead.score}</span></td>
                    <td style={{ fontSize: '12px', color: '#E67E22', fontWeight: '600' }}>
                      {lead.followUpDate ? new Date(lead.followUpDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'Today'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Bottom Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>

        {/* Recent Leads */}
        <div className="panel" style={{ gridColumn: 'span 1' }}>          <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Recent Leads</span>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/leads')}>View All →</button>
          </div>
          <div>
            {recentLeads.length === 0 && (
              <div style={{ padding: '24px', textAlign: 'center', color: '#aaa', fontSize: '12px' }}>No leads yet</div>
            )}
            {recentLeads.map((lead, i) => (
              <div key={lead._id}
                onClick={() => navigate(`/leads/${lead._id}`)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 14px', borderBottom: '1px solid #eee', cursor: 'pointer',
                  background: i % 2 === 0 ? '#fff' : '#F9FAFB',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#EBF3FB'}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#F9FAFB'}
              >
                <div>
                  <div style={{ fontWeight: '600', fontSize: '13px', color: '#1F3A5F' }}>{lead.name}</div>
                  <div style={{ fontSize: '11px', color: '#aaa' }}>{timeAgo(lead.createdAt)}</div>
                </div>
                <span className={`status-badge ${getStatusClass(lead.status)}`}>{capitalize(lead.status)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hot Leads */}
        <div className="panel">
          <div className="panel-header">🔥 Hot Leads</div>          <div>
            {hotLeads.length === 0 && (
              <div style={{ padding: '24px', textAlign: 'center', color: '#aaa', fontSize: '12px' }}>No hot leads yet</div>
            )}
            {hotLeads.map((lead, i) => (
              <div key={lead._id}
                onClick={() => navigate(`/leads/${lead._id}`)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 14px', borderBottom: '1px solid #eee', cursor: 'pointer',
                  background: i % 2 === 0 ? '#fff' : '#F9FAFB',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#FFF5F5'}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#F9FAFB'}
              >
                <div>
                  <div style={{ fontWeight: '600', fontSize: '13px', color: '#1F3A5F' }}>{lead.name}</div>
                  <div style={{ fontSize: '11px', color: '#aaa' }}>{lead.company || lead.email}</div>
                </div>
                <span className={`status-badge ${getScoreClass(lead.scoreLabel)}`}>
                  {scoreLabelEmoji[lead.scoreLabel]} {lead.score}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Overdue + Score Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Overdue */}
          <div className="panel" style={{ flex: 1 }}>
            <div className="panel-header" style={{ color: '#E74C3C' }}>⚠ Overdue Follow-ups</div>
            <div>
              {overdueLeads.length === 0 && (
                <div style={{ padding: '16px', textAlign: 'center', color: '#aaa', fontSize: '12px' }}>
                  ✓ All caught up
                </div>
              )}
              {overdueLeads.slice(0, 4).map(lead => (
                <div key={lead._id}
                  onClick={() => navigate(`/leads/${lead._id}`)}
                  style={{ padding: '8px 14px', borderBottom: '1px solid #eee', cursor: 'pointer', background: '#FFF5F5' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#FDEDEC'}
                  onMouseLeave={e => e.currentTarget.style.background = '#FFF5F5'}
                >
                  <div style={{ fontWeight: '600', fontSize: '13px', color: '#C0392B' }}>{lead.name}</div>
                  <div style={{ fontSize: '11px', color: '#E74C3C' }}>Due: {formatDate(lead.followUpDate)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Score distribution */}
          <div className="panel">
            <div className="panel-header">AI Score Summary</div>
            <div className="panel-body">
              {[
                { key: 'Hot',  color: '#E74C3C', emoji: '🔥', range: '51–100' },
                { key: 'Warm', color: '#F39C12', emoji: '☀️', range: '21–50'  },
                { key: 'Cold', color: '#4B8BBE', emoji: '❄️', range: '0–20'   },
              ].map(({ key, color, emoji, range }) => {
                const item  = (a.scoreDistribution || []).find(s => s._id === key);
                const count = item?.count || 0;
                const pct   = a.total > 0 ? Math.round((count / a.total) * 100) : 0;
                return (
                  <div key={key} style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '3px' }}>
                      <span>{emoji} {key} <span style={{ color: '#aaa', fontSize: '10px' }}>({range})</span></span>
                      <span style={{ fontWeight: '700', color }}>{count} ({pct}%)</span>
                    </div>
                    <div style={{ height: '6px', background: '#eee' }}>
                      <div style={{ height: '6px', width: `${pct}%`, background: color, transition: 'width 0.5s' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
