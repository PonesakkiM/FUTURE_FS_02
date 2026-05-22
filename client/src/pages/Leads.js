import React, { useEffect, useState, useCallback } from 'react';
import { getLeads, createLead, deleteLead, exportLeads } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LeadTable from '../components/LeadTable';
import LeadCard from '../components/LeadCard';
import toast from 'react-hot-toast';
import { downloadFile } from '../utils/helpers';

// ─── Add Lead Modal ───────────────────────────────────────────────────────────
const AddLeadModal = ({ onClose, onCreated }) => {
  const [form, setForm]     = useState({ name:'', email:'', phone:'', company:'', source:'website', status:'new', followUpDate:'' });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) { toast.error('Name and email required'); return; }
    setLoading(true);
    try {
      const { data } = await createLead(form);
      onCreated(data);
      toast.success('Lead created');
      onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          Add New Lead
          <button onClick={onClose} style={{ background:'none', border:'none', color:'#fff', cursor:'pointer', fontSize:'16px' }}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
              {[
                { label:'Full Name *',  key:'name',    type:'text',  placeholder:'John Doe' },
                { label:'Email *',      key:'email',   type:'email', placeholder:'john@example.com' },
                { label:'Phone',        key:'phone',   type:'text',  placeholder:'+1 555 000 0000' },
                { label:'Company',      key:'company', type:'text',  placeholder:'Acme Corp' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="form-label">{label}</label>
                  <input type={type} className="form-control" placeholder={placeholder}
                    value={form[key]} onChange={e => set(key, e.target.value)} />
                </div>
              ))}
              <div>
                <label className="form-label">Source</label>
                <select className="form-control" value={form.source} onChange={e => set('source', e.target.value)}>
                  <option value="website">Website</option>
                  <option value="referral">Referral</option>
                  <option value="ads">Ads</option>
                  <option value="social_media">Social Media</option>
                  <option value="cold_call">Cold Call</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="form-label">Status</label>
                <select className="form-control" value={form.status} onChange={e => set('status', e.target.value)}>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="converted">Converted</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
              <div style={{ gridColumn:'span 2' }}>
                <label className="form-label">Follow-up Date</label>
                <input type="date" className="form-control" value={form.followUpDate} onChange={e => set('followUpDate', e.target.value)} />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Main Leads Page ──────────────────────────────────────────────────────────
const Leads = () => {
  const [leads, setLeads]           = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [viewMode, setViewMode]     = useState('table');
  const [filters, setFilters]       = useState({
    search:'', status:'', source:'', startDate:'', endDate:'',
    page:1, limit:15, sortBy:'createdAt', sortOrder:'desc',
  });
  const { isAdmin } = useAuth();

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([,v]) => v !== ''));
      const { data } = await getLeads(params);
      setLeads(data.leads);
      setPagination(data.pagination);
    } catch { toast.error('Failed to load leads'); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => {
    const t = setTimeout(fetchLeads, 300);
    return () => clearTimeout(t);
  }, [fetchLeads]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this lead?')) return;
    try { await deleteLead(id); setLeads(p => p.filter(l => l._id !== id)); toast.success('Deleted'); }
    catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
  };

  const handleExport = async () => {
    try { const { data } = await exportLeads(); downloadFile(data, 'leads.csv'); toast.success('CSV exported'); }
    catch { toast.error('Export failed'); }
  };

  const set = (k, v) => setFilters(p => ({ ...p, [k]: v, page: 1 }));
  const clearFilters = () => setFilters({ search:'', status:'', source:'', startDate:'', endDate:'', page:1, limit:15, sortBy:'createdAt', sortOrder:'desc' });
  const hasFilters = filters.search || filters.status || filters.source || filters.startDate || filters.endDate;

  return (
    <div>
      {/* Page header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
        <div>
          <h1>Leads</h1>
          <div style={{ fontSize:'12px', color:'#888', marginTop:'2px' }}>
            {pagination.total ?? 0} total leads
          </div>
        </div>
        <div style={{ display:'flex', gap:'8px' }}>
          {isAdmin() && (
            <button className="btn btn-outline btn-sm" onClick={handleExport}>↓ Export CSV</button>
          )}
          <button className="btn btn-accent" onClick={() => setShowModal(true)}>+ Add Lead</button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="panel" style={{ marginBottom:'16px' }}>
        <div className="panel-header">Search & Filter</div>
        <div className="panel-body" style={{ display:'flex', flexWrap:'wrap', gap:'10px', alignItems:'flex-end' }}>
          <div style={{ flex:'1', minWidth:'200px' }}>
            <label className="form-label">Search</label>
            <input className="form-control" placeholder="Name, email, company..."
              value={filters.search} onChange={e => set('search', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Status</label>
            <select className="form-control" value={filters.status} onChange={e => set('status', e.target.value)}>
              <option value="">All Status</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="converted">Converted</option>
              <option value="lost">Lost</option>
            </select>
          </div>
          <div>
            <label className="form-label">Source</label>
            <select className="form-control" value={filters.source} onChange={e => set('source', e.target.value)}>
              <option value="">All Sources</option>
              <option value="website">Website</option>
              <option value="referral">Referral</option>
              <option value="ads">Ads</option>
              <option value="social_media">Social Media</option>
              <option value="cold_call">Cold Call</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="form-label">From</label>
            <input type="date" className="form-control" value={filters.startDate} onChange={e => set('startDate', e.target.value)} />
          </div>
          <div>
            <label className="form-label">To</label>
            <input type="date" className="form-control" value={filters.endDate} onChange={e => set('endDate', e.target.value)} />
          </div>
          <div style={{ display:'flex', gap:'6px' }}>
            {hasFilters && (
              <button className="btn btn-danger btn-sm" onClick={clearFilters}>✕ Clear</button>
            )}
            {/* View toggle */}
            <button
              className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setViewMode('table')} title="Table view">≡</button>
            <button
              className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setViewMode('grid')} title="Grid view">⊞</button>
          </div>
        </div>
      </div>

      {/* Lead list */}
      <div className="panel">
        <div className="panel-header" style={{ display:'flex', justifyContent:'space-between' }}>
          <span>Lead Records</span>
          <span style={{ fontWeight:'400', color:'#888' }}>
            Showing {leads.length} of {pagination.total ?? 0}
          </span>
        </div>
        {loading ? (
          <div style={{ padding:'40px', textAlign:'center' }}>
            <div style={{ width:'24px', height:'24px', border:'3px solid #1F3A5F', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : viewMode === 'table' ? (
          <LeadTable leads={leads} onDelete={handleDelete} isAdmin={isAdmin()} />
        ) : (
          <div style={{ padding:'16px', display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:'12px' }}>
            {leads.length === 0 && (
              <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'40px', color:'#aaa' }}>No leads found</div>
            )}
            {leads.map(lead => (
              <LeadCard key={lead._id} lead={lead} onDelete={handleDelete} isAdmin={isAdmin()} />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'12px' }}>
          <span style={{ fontSize:'12px', color:'#888' }}>
            Page {pagination.page} of {pagination.pages}
          </span>
          <div className="pagination">
            <button className="page-btn" disabled={filters.page <= 1}
              onClick={() => setFilters(p => ({ ...p, page: p.page - 1 }))}>← Prev</button>
            {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => i + 1).map(p => (
              <button key={p} className={`page-btn${filters.page === p ? ' active' : ''}`}
                onClick={() => setFilters(prev => ({ ...prev, page: p }))}>{p}</button>
            ))}
            <button className="page-btn" disabled={filters.page >= pagination.pages}
              onClick={() => setFilters(p => ({ ...p, page: p.page + 1 }))}>Next →</button>
          </div>
        </div>
      )}

      {showModal && <AddLeadModal onClose={() => setShowModal(false)} onCreated={lead => setLeads(p => [lead, ...p])} />}
    </div>
  );
};

export default Leads;
