import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getStatusClass, getScoreClass, scoreLabelEmoji, capitalize, formatDate, checkOverdue } from '../utils/helpers';

const LeadTable = ({ leads, onDelete, isAdmin }) => {
  const navigate = useNavigate();

  if (!leads.length) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#888', borderTop: '1px solid #D0D7DE' }}>
        <div style={{ fontSize: '32px', marginBottom: '8px' }}>◈</div>
        <div style={{ fontWeight: '600', color: '#555' }}>No leads found</div>
        <div style={{ fontSize: '12px', marginTop: '4px' }}>Adjust your filters or add a new lead</div>
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="crm-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Name / Company</th>
            <th>Email</th>
            <th>Source</th>
            <th>Status</th>
            <th>Score</th>
            <th>Follow-up</th>
            <th>Created</th>
            <th style={{ textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead, idx) => {
            const overdue = checkOverdue(lead.followUpDate);
            return (
              <tr
                key={lead._id}
                onClick={() => navigate(`/leads/${lead._id}`)}
                style={overdue ? { background: '#FFF5F5' } : {}}
              >
                <td style={{ color: '#aaa', fontSize: '12px', width: '36px' }}>{idx + 1}</td>

                {/* Name */}
                <td>
                  <div style={{ fontWeight: '600', color: '#1F3A5F' }}>{lead.name}</div>
                  {lead.company && (
                    <div style={{ fontSize: '11px', color: '#888' }}>{lead.company}</div>
                  )}
                </td>

                {/* Email */}
                <td style={{ fontSize: '12px', color: '#555' }}>{lead.email}</td>

                {/* Source */}
                <td>
                  <span className="source-badge">{capitalize(lead.source)}</span>
                </td>

                {/* Status */}
                <td>
                  <span className={`status-badge ${getStatusClass(lead.status)}`}>
                    {capitalize(lead.status)}
                  </span>
                </td>

                {/* Score */}
                <td>
                  <span className={`status-badge ${getScoreClass(lead.scoreLabel)}`}>
                    {scoreLabelEmoji[lead.scoreLabel]} {lead.scoreLabel} ({lead.score})
                  </span>
                </td>

                {/* Follow-up */}
                <td style={{ fontSize: '12px' }}>
                  {lead.followUpDate ? (
                    <span style={{ color: overdue ? '#E74C3C' : '#555', fontWeight: overdue ? '700' : '400' }}>
                      {overdue ? '⚠ ' : ''}{formatDate(lead.followUpDate)}
                    </span>
                  ) : (
                    <span style={{ color: '#ccc' }}>—</span>
                  )}
                </td>

                {/* Created */}
                <td style={{ fontSize: '12px', color: '#888' }}>{formatDate(lead.createdAt)}</td>

                {/* Actions */}
                <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}
                  onClick={e => e.stopPropagation()}>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => navigate(`/leads/${lead._id}`)}
                    style={{ marginRight: '4px' }}
                  >
                    View
                  </button>
                  {isAdmin && (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => onDelete(lead._id)}
                    >
                      Del
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default LeadTable;
