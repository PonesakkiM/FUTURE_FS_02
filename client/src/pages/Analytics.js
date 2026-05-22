import React, { useEffect, useState } from 'react';
import { getAnalytics } from '../services/api';
import toast from 'react-hot-toast';
import { capitalize } from '../utils/helpers';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Filler,
} from 'chart.js';
import { Pie, Line, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Filler);

const COLORS = ['#1F3A5F','#4B8BBE','#E67E22','#27AE60','#E74C3C','#F39C12'];

const Analytics = () => {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalytics()
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'300px', flexDirection:'column', gap:'12px' }}>
      <div style={{ width:'28px', height:'28px', border:'3px solid #1F3A5F', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
  if (!data) return null;

  const pieSource = {
    labels: data.sourceCounts.map(s => capitalize(s._id)),
    datasets: [{ data: data.sourceCounts.map(s => s.count), backgroundColor: COLORS, borderWidth: 2, borderColor: '#fff' }],
  };

  const lineData = {
    labels: data.leadsOverTime.map(d => d._id),
    datasets: [{
      label: 'New Leads',
      data: data.leadsOverTime.map(d => d.count),
      borderColor: '#1F3A5F', backgroundColor: 'rgba(31,58,95,0.08)',
      fill: true, tension: 0.3, pointBackgroundColor: '#1F3A5F', pointRadius: 4,
    }],
  };

  const barStatus = {
    labels: data.statusCounts.map(s => capitalize(s._id)),
    datasets: [{
      label: 'Leads',
      data: data.statusCounts.map(s => s.count),
      backgroundColor: ['#4B8BBE','#F39C12','#27AE60','#E74C3C'],
      borderRadius: 0,
    }],
  };

  const chartOpts = (title) => ({
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, title: { display: !!title, text: title, font: { size: 12 } } },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: '#eee' } }, x: { grid: { display: false } } },
  });

  const pieOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'right', labels: { padding: 12, font: { size: 11 } } } },
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom:'16px' }}>
        <h1>Analytics</h1>
        <div style={{ fontSize:'12px', color:'#888', marginTop:'2px' }}>Performance overview and lead insights</div>
      </div>

      {/* KPI row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))', gap:'1px', background:'#D0D7DE', border:'1px solid #D0D7DE', marginBottom:'20px' }}>
        {[
          { label:'Total Leads',      value: data.total,           accent:'#1F3A5F' },
          { label:'New',              value: data.newLeads,        accent:'#4B8BBE' },
          { label:'Contacted',        value: data.contacted,       accent:'#F39C12' },
          { label:'Converted',        value: data.converted,       accent:'#27AE60' },
          { label:'Lost',             value: data.lost,            accent:'#E74C3C' },
          { label:'Conversion Rate',  value: `${data.conversionRate}%`, accent:'#27AE60' },
          { label:'Overdue',          value: data.overdueFollowUps, accent:'#E74C3C' },
        ].map(({ label, value, accent }) => (
          <div key={label} className="info-box" style={{ borderTop:`3px solid ${accent}` }}>
            <div className="info-box-value" style={{ color: accent, fontSize:'24px' }}>{value}</div>
            <div className="info-box-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'16px' }}>
        <div className="panel">
          <div className="panel-header">Leads by Source</div>
          <div className="panel-body" style={{ height:'240px' }}>
            {data.sourceCounts.length > 0
              ? <Pie data={pieSource} options={pieOpts} />
              : <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:'#ccc' }}>No data</div>
            }
          </div>
        </div>
        <div className="panel">
          <div className="panel-header">Leads by Status</div>
          <div className="panel-body" style={{ height:'240px' }}>
            {data.statusCounts.length > 0
              ? <Bar data={barStatus} options={chartOpts()} />
              : <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:'#ccc' }}>No data</div>
            }
          </div>
        </div>
      </div>

      {/* Line chart */}
      <div className="panel" style={{ marginBottom:'16px' }}>
        <div className="panel-header">Leads Over Time — Last 30 Days</div>
        <div className="panel-body" style={{ height:'220px' }}>
          {data.leadsOverTime.length > 0
            ? <Line data={lineData} options={{ ...chartOpts(), plugins: { legend: { display: false } } }} />
            : <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:'#ccc' }}>No data for last 30 days</div>
          }
        </div>
      </div>

      {/* Score distribution + overdue alert */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
        <div className="panel">
          <div className="panel-header">AI Lead Score Distribution</div>
          <div className="panel-body">
            {[
              { key:'Hot',  color:'#E74C3C', emoji:'🔥', range:'51–100' },
              { key:'Warm', color:'#F39C12', emoji:'☀️', range:'21–50'  },
              { key:'Cold', color:'#4B8BBE', emoji:'❄️', range:'0–20'   },
            ].map(({ key, color, emoji, range }) => {
              const item  = data.scoreDistribution.find(s => s._id === key);
              const count = item?.count || 0;
              const pct   = data.total > 0 ? Math.round((count / data.total) * 100) : 0;
              return (
                <div key={key} style={{ marginBottom:'14px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'13px', marginBottom:'4px' }}>
                    <span style={{ fontWeight:'600' }}>{emoji} {key} Leads <span style={{ color:'#aaa', fontSize:'11px', fontWeight:'400' }}>({range})</span></span>
                    <span style={{ color, fontWeight:'700' }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ height:'8px', background:'#eee' }}>
                    <div style={{ height:'8px', width:`${pct}%`, background: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
          {data.overdueFollowUps > 0 && (
            <div className="alert alert-danger">
              <div style={{ fontWeight:'700', marginBottom:'4px' }}>⚠ {data.overdueFollowUps} Overdue Follow-up{data.overdueFollowUps > 1 ? 's' : ''}</div>
              <div style={{ fontSize:'12px' }}>These leads have passed their follow-up date and need immediate attention.</div>
            </div>
          )}
          <div className="panel" style={{ flex:1 }}>
            <div className="panel-header">Pipeline Summary</div>
            <div className="panel-body">
              <table style={{ width:'100%', fontSize:'13px', borderCollapse:'collapse' }}>
                <tbody>
                  {[
                    { label:'Total Leads',     value: data.total,           color:'#1F3A5F' },
                    { label:'In Pipeline',     value: data.contacted,       color:'#F39C12' },
                    { label:'Converted',       value: data.converted,       color:'#27AE60' },
                    { label:'Lost',            value: data.lost,            color:'#E74C3C' },
                    { label:'Conversion Rate', value: `${data.conversionRate}%`, color:'#27AE60' },
                  ].map(({ label, value, color }) => (
                    <tr key={label} style={{ borderBottom:'1px solid #eee' }}>
                      <td style={{ padding:'7px 0', color:'#555' }}>{label}</td>
                      <td style={{ padding:'7px 0', fontWeight:'700', color, textAlign:'right' }}>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
