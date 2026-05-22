import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLeadById, updateLead, sendEmail } from '../services/api';
import NoteForm from '../components/NoteForm';
import toast from 'react-hot-toast';
import { getStatusClass, getScoreClass, scoreLabelEmoji, capitalize, formatDate, timeAgo, checkOverdue } from '../utils/helpers';

const activityIcon = { created:'●', status_updated:'↻', note_added:'✎', email_sent:'✉', follow_up_set:'◷' };

// ─── Email Modal ──────────────────────────────────────────────────────────────
const EmailModal = ({ lead, onClose }) => {
  const [form, setForm]     = useState({ subject:`Following up — ${lead.name}`, message:`Hi ${lead.name},\n\nI wanted to follow up on your interest.\n\nBest regards` });
  const [loading, setLoading] = useState(false);
  const handleSend = async () => {
    if (!form.subject || !form.message) { toast.error('Fill all fields'); return; }
    setLoading(true);
    try { await sendEmail(lead._id, form); toast.success('Email sent'); onClose(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to send'); }
    finally { setLoading(false); }
  };
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          Send Email — {lead.name}
          <button onClick={onClose} style={{ background:'none', border:'none', color:'#fff', cursor:'pointer', fontSize:'16px' }}>✕</button>
        </div>
        <div className="modal-body">
          <div style={{ marginBottom:'12px' }}>
            <label className="form-label">To</label>
            <input className="form-control" value={lead.email} disabled style={{ background:'#f5f5f5' }} />
          </div>
          <div style={{ marginBottom:'12px' }}>
            <label className="form-label">Subject</label>
            <input className="form-control" value={form.subject} onChange={e => setForm(p => ({...p, subject: e.target.value}))} />
          </div>
          <div>
            <label className="form-label">Message</label>
            <textarea className="form-control" rows={6} value={form.message}
              onChange={e => setForm(p => ({...p, message: e.target.value}))} style={{ resize:'vertical' }} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSend} disabled={loading}>
            {loading ? 'Sending...' : '✉ Send Email'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const LeadDetails = () => {
  const { id }                    = useParams();
  const navigate                  = useNavigate();
  const [lead, setLead]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [editing, setEditing]     = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [editForm, setEditForm]   = useState({});
  const [saving, setSaving]       = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getLeadById(id);
        setLead(data);
        setEditForm({ name:data.name, email:data.email, phone:data.phone||'', company:data.company||'',
          source:data.source, status:data.status, followUpDate: data.followUpDate ? data.followUpDate.split('T')[0] : '' });
      } catch { toast.error('Lead not found'); navigate('/leads'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [id, navigate]);

  const handleSave = async () => {
    setSaving(true);
    try { const { data } = await updateLead(id, editForm); setLead(data); setEditing(false); toast.success('Saved'); }
    catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setSaving(false); }
  };

  const handleStatusChange = async (s) => {
    try { const { data } = await updateLead(id, { status: s }); setLead(data); toast.success(`Status → ${s}`); }
    catch { toast.error('Update failed'); }
  };

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'300px', flexDirection:'column', gap:'12px' }}>
      <div style={{ width:'28px', height:'28px', border:'3px solid #1F3A5F', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
  if (!lead) return null;

  const overdue = checkOverdue(lead.followUpDate);

  return (
    <div>
      {/* Breadcrumb + actions */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'13px', color:'#888' }}>
          <button onClick={() => navigate('/leads')} style={{ background:'none', border:'none', cursor:'pointer', color:'#4B8BBE', fontWeight:'600' }}>
            ← Leads
          </button>
          <span>/</span>
          <span style={{ color:'#1F3A5F', fontWeight:'600' }}>{lead.name}</span>
        </div>
        <div style={{ display:'flex', gap:'8px' }}>
          <button className="btn btn-outline btn-sm" onClick={() => setShowEmail(true)}>✉ Send Email</button>
          {editing ? (
            <>
              <button className="btn btn-outline btn-sm" onClick={() => setEditing(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : '✓ Save Changes'}
              </button>
            </>
          ) : (
            <button className="btn btn-accent btn-sm" onClick={() => setEditing(true)}>✎ Edit Lead</button>
          )}
        </div>
      </div>

      {/* Overdue alert */}
      {overdue && (
        <div className="alert alert-danger" style={{ marginBottom:'16px' }}>
          ⚠ Follow-up overdue since {formatDate(lead.followUpDate)} — take action immediately.
        </div>
      )}
      {lead.needsFollowUp && !overdue && (
        <div className="alert alert-warning" style={{ marginBottom:'16px' }}>
          💡 This lead has not been contacted in 3+ days. Consider following up.
        </div>
      )}

      {/* Main grid */}
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:'16px' }}>

        {/* Left column */}
        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>

          {/* Lead info panel */}
          <div className="panel">
            <div className="panel-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span>Lead Information</span>
              <div style={{ display:'flex', gap:'6px' }}>
                <span className={`status-badge ${getStatusClass(lead.status)}`}>{capitalize(lead.status)}</span>
                <span className={`status-badge ${getScoreClass(lead.scoreLabel)}`}>
                  {scoreLabelEmoji[lead.scoreLabel]} {lead.scoreLabel} ({lead.score})
                </span>
              </div>
            </div>
            <div className="panel-body">
              {editing ? (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                  {[
                    { label:'Name',    key:'name',    type:'text'  },
                    { label:'Email',   key:'email',   type:'email' },
                    { label:'Phone',   key:'phone',   type:'text'  },
                    { label:'Company', key:'company', type:'text'  },
                  ].map(({ label, key, type }) => (
                    <div key={key}>
                      <label className="form-label">{label}</label>
                      <input type={type} className="form-control" value={editForm[key]}
                        onChange={e => setEditForm(p => ({...p, [key]: e.target.value}))} />
                    </div>
                  ))}
                  <div>
                    <label className="form-label">Source</label>
                    <select className="form-control" value={editForm.source} onChange={e => setEditForm(p => ({...p, source: e.target.value}))}>
                      {['website','referral','ads','social_media','cold_call','other'].map(s => (
                        <option key={s} value={s}>{capitalize(s)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Follow-up Date</label>
                    <input type="date" className="form-control" value={editForm.followUpDate}
                      onChange={e => setEditForm(p => ({...p, followUpDate: e.target.value}))} />
                  </div>
                </div>
              ) : (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                  {[
                    { label:'Full Name',    value: lead.name },
                    { label:'Email',        value: lead.email },
                    { label:'Phone',        value: lead.phone || '—' },
                    { label:'Company',      value: lead.company || '—' },
                    { label:'Source',       value: capitalize(lead.source) },
                    { label:'Created',      value: formatDate(lead.createdAt) },
                    { label:'Follow-up',    value: lead.followUpDate ? formatDate(lead.followUpDate) : '—' },
                    { label:'Last Updated', value: formatDate(lead.updatedAt) },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <div style={{ fontSize:'11px', color:'#888', textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:'2px' }}>{label}</div>
                      <div style={{ fontSize:'13px', fontWeight:'600', color:'#1F3A5F' }}>{value}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Status update */}
          <div className="panel">
            <div className="panel-header">Update Status</div>
            <div className="panel-body" style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
              {['new','contacted','converted','lost'].map(s => (
                <button key={s}
                  className={`btn btn-sm ${lead.status === s ? 'btn-primary' : 'btn-outline'}`}
                  style={lead.status === s ? { borderLeft:'3px solid #E67E22' } : {}}
                  onClick={() => handleStatusChange(s)}>
                  {capitalize(s)}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="panel">
            <div className="panel-header">Notes & Follow-ups ({lead.notes.length})</div>
            <div className="panel-body">
              <NoteForm leadId={id} notes={lead.notes} onNoteAdded={updated => setLead(updated)} />
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>

          {/* Score panel */}
          <div className="panel">
            <div className="panel-header">Lead Score</div>
            <div className="panel-body" style={{ textAlign:'center' }}>
              <div style={{ fontSize:'48px', fontWeight:'700', color: lead.score >= 51 ? '#E74C3C' : lead.score >= 21 ? '#F39C12' : '#4B8BBE', lineHeight:'1' }}>
                {lead.score}
              </div>
              <div style={{ fontSize:'12px', color:'#888', marginBottom:'10px' }}>out of 100</div>
              <div style={{ height:'8px', background:'#eee', marginBottom:'10px' }}>
                <div style={{ height:'8px', width:`${lead.score}%`, background: lead.score >= 51 ? '#E74C3C' : lead.score >= 21 ? '#F39C12' : '#4B8BBE' }} />
              </div>
              <span className={`status-badge ${getScoreClass(lead.scoreLabel)}`} style={{ fontSize:'13px', padding:'4px 12px' }}>
                {scoreLabelEmoji[lead.scoreLabel]} {lead.scoreLabel} Lead
              </span>
              {/* Score breakdown */}
              <div style={{ marginTop:'14px', textAlign:'left', borderTop:'1px solid #eee', paddingTop:'10px' }}>
                <div style={{ fontSize:'11px', color:'#888', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'6px' }}>Score Breakdown</div>
                {[
                  { label: 'Status',    hint: lead.status === 'new' ? '+5' : lead.status === 'contacted' ? '+15' : lead.status === 'converted' ? '+45' : '+0' },
                  { label: 'Source',    hint: { referral:'+10', website:'+5', ads:'+3', social_media:'+2', cold_call:'+1', other:'+1' }[lead.source] || '+0' },
                  { label: 'Follow-up', hint: lead.followUpDate ? '+10' : '+0' },
                  { label: 'Notes',     hint: `+${Math.min(lead.notes.length * 10, 30)}` },
                ].map(({ label, hint }) => (
                  <div key={label} style={{ display:'flex', justifyContent:'space-between', fontSize:'12px', padding:'3px 0', borderBottom:'1px solid #f5f5f5' }}>
                    <span style={{ color:'#555' }}>{label}</span>
                    <span style={{ fontWeight:'700', color: hint.startsWith('+') ? '#27AE60' : '#E74C3C' }}>{hint}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Activity timeline */}
          <div className="panel" style={{ flex:1 }}>
            <div className="panel-header">Activity Timeline ({lead.activities.length})</div>
            <div className="panel-body" style={{ padding:'8px 14px' }}>
              {lead.activities.length === 0 && (
                <div style={{ textAlign:'center', color:'#aaa', fontSize:'12px', padding:'16px 0' }}>No activity</div>
              )}
              {[...lead.activities].reverse().map((act, i) => (
                <div key={i} className="timeline-item">
                  <div className="timeline-dot" style={{ background: act.type === 'status_updated' ? '#E67E22' : act.type === 'email_sent' ? '#27AE60' : '#4B8BBE' }} />
                  <div>
                    <div className="timeline-text">
                      <span style={{ marginRight:'4px' }}>{activityIcon[act.type] || '●'}</span>
                      {act.description}
                    </div>
                    <div className="timeline-meta">{act.performedBy} · {timeAgo(act.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showEmail && <EmailModal lead={lead} onClose={() => setShowEmail(false)} />}
    </div>
  );
};

export default LeadDetails;
