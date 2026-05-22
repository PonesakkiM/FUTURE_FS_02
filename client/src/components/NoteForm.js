import React, { useState } from 'react';
import { addNote, editNote, deleteNote } from '../services/api';
import { formatDate, timeAgo } from '../utils/helpers';
import toast from 'react-hot-toast';

// ─── Single Note Row (with edit/delete) ──────────────────────────────────────
const NoteRow = ({ note, leadId, onUpdated, index }) => {
  const [editing, setEditing]   = useState(false);
  const [editText, setEditText] = useState(note.text);
  const [saving, setSaving]     = useState(false);

  const handleSave = async () => {
    if (!editText.trim()) return;
    setSaving(true);
    try {
      const { data } = await editNote(leadId, note._id, { text: editText.trim() });
      onUpdated(data);
      setEditing(false);
      toast.success('Note updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this note?')) return;
    try {
      const { data } = await deleteNote(leadId, note._id);
      onUpdated(data);
      toast.success('Note deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const rowBg = index % 2 === 0 ? '#fff' : '#F9FAFB';

  return (
    <div style={{ padding: '10px 0', borderBottom: '1px solid #eee', background: rowBg }}>
      {editing ? (
        <div>
          <textarea
            value={editText}
            onChange={e => setEditText(e.target.value)}
            rows={2}
            className="form-control"
            style={{ resize: 'vertical', marginBottom: '6px' }}
          />
          <div style={{ display: 'flex', gap: '6px' }}>
            <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : '✓ Save'}
            </button>
            <button className="btn btn-outline btn-sm" onClick={() => { setEditing(false); setEditText(note.text); }}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ fontSize: '13px', color: '#2C3E50', lineHeight: '1.5', marginBottom: '4px' }}>
            {note.text}
            {note.isEdited && (
              <span style={{ fontSize: '10px', color: '#aaa', marginLeft: '6px', fontStyle: 'italic' }}>(edited)</span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '11px', color: '#aaa' }}>
              <strong style={{ color: '#555' }}>{note.addedBy}</strong>
              {' · '}
              <span title={formatDate(note.createdAt)}>{timeAgo(note.createdAt)}</span>
              {note.isEdited && note.updatedAt && (
                <span style={{ marginLeft: '6px' }}>· edited {timeAgo(note.updatedAt)}</span>
              )}
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setEditing(true)}
                style={{ fontSize: '11px', padding: '2px 8px' }}
              >
                ✎ Edit
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={handleDelete}
                style={{ fontSize: '11px', padding: '2px 8px' }}
              >
                ✕ Del
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Note Form + List ─────────────────────────────────────────────────────────
const NoteForm = ({ leadId, notes = [], onNoteAdded }) => {
  const [text, setText]       = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    try {
      const { data } = await addNote(leadId, { text: text.trim() });
      onNoteAdded(data);
      setText('');
      toast.success('Note added');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add note');
    } finally { setLoading(false); }
  };

  // Sort notes oldest → newest (chronological order)
  const sortedNotes = [...notes].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  return (
    <div>
      {/* Add note form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', marginBottom: '12px' }}>
        <div style={{ flex: 1 }}>
          <label className="form-label">Add Note</label>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Type a note or follow-up comment..."
            rows={2}
            className="form-control"
            style={{ resize: 'vertical' }}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="btn btn-accent"
          style={{ alignSelf: 'flex-end', whiteSpace: 'nowrap' }}
        >
          {loading ? 'Saving...' : '+ Add Note'}
        </button>
      </form>

      {/* Notes list — chronological */}
      {sortedNotes.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#aaa', fontSize: '12px', padding: '16px 0', borderTop: '1px solid #eee' }}>
          No notes yet. Add the first note above.
        </div>
      ) : (
        <div style={{ borderTop: '1px solid #eee' }}>
          <div style={{ fontSize: '11px', color: '#888', padding: '6px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {sortedNotes.length} note{sortedNotes.length !== 1 ? 's' : ''} — oldest first
          </div>
          {sortedNotes.map((note, i) => (
            <NoteRow
              key={note._id || i}
              note={note}
              leadId={leadId}
              onUpdated={onNoteAdded}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default NoteForm;
