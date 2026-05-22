// LeadCard is kept for grid view fallback but styled flat
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getStatusClass, getScoreClass, scoreLabelEmoji, capitalize, formatDate, checkOverdue } from '../utils/helpers';

const LeadCard = ({ lead, onDelete, isAdmin }) => {
  const navigate = useNavigate();
  const overdue  = checkOverdue(lead.followUpDate);

  return (
    <div
      onClick={() => navigate(`/leads/${lead._id}`)}
      style={{
        background: '#fff',
        border: `1px solid ${overdue ? '#E74C3C' : '#D0D7DE'}`,
        borderLeft: `4px solid ${overdue ? '#E74C3C' : '#1F3A5F'}`,
        padding: '14px',
        cursor: 'pointer',
        transition: 'background 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = '#EBF3FB'}
      onMouseLeave={e => e.currentTarget.style.background = '#fff'}
    >
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div>
          <div style={{ fontWeight: '700', color: '#1F3A5F', fontSize: '14px' }}>{lead.name}</div>
          {lead.company && <div style={{ fontSize: '11px', color: '#888' }}>{lead.company}</div>}
        </div>
        <span className={`status-badge ${getScoreClass(lead.scoreLabel)}`}>
          {scoreLabelEmoji[lead.scoreLabel]} {lead.scoreLabel}
        </span>
      </div>

      {/* Details */}
      <div style={{ fontSize: '12px', color: '#555', marginBottom: '8px' }}>
        <div>{lead.email}</div>
        {lead.phone && <div style={{ marginTop: '2px' }}>{lead.phone}</div>}
      </div>

      {/* Badges */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
        <span className={`status-badge ${getStatusClass(lead.status)}`}>{capitalize(lead.status)}</span>
        <span className="source-badge">{capitalize(lead.source)}</span>
      </div>

      {/* Score bar */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#888', marginBottom: '3px' }}>
          <span>Score</span><span>{lead.score}/100</span>
        </div>
        <div style={{ height: '4px', background: '#eee' }}>
          <div style={{
            height: '4px',
            width: `${lead.score}%`,
            background: lead.score >= 70 ? '#E74C3C' : lead.score >= 40 ? '#F39C12' : '#4B8BBE',
          }} />
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#aaa', borderTop: '1px solid #eee', paddingTop: '8px' }}>
        <span>{formatDate(lead.createdAt)}</span>
        {overdue && <span style={{ color: '#E74C3C', fontWeight: '700' }}>⚠ OVERDUE</span>}
        {lead.needsFollowUp && !overdue && <span style={{ color: '#F39C12', fontWeight: '600' }}>Follow up</span>}
      </div>

      {/* Delete */}
      {isAdmin && (
        <button
          className="btn btn-danger btn-sm"
          style={{ marginTop: '8px', width: '100%' }}
          onClick={e => { e.stopPropagation(); onDelete(lead._id); }}
        >
          Delete Lead
        </button>
      )}
    </div>
  );
};

export default LeadCard;
