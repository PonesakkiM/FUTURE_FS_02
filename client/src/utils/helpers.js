import { format, formatDistanceToNow, isPast } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return '—';
  return format(new Date(date), 'MMM dd, yyyy');
};

export const timeAgo = (date) => {
  if (!date) return '';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const checkOverdue = (date) => {
  if (!date) return false;
  return isPast(new Date(date));
};

// Flat CSS class names (no Tailwind pills)
export const getStatusClass = (status) => {
  const map = { new: 'status-new', contacted: 'status-contacted', converted: 'status-converted', lost: 'status-lost' };
  return map[status] || 'status-new';
};

export const getScoreClass = (label) => {
  const map = { Hot: 'score-hot', Warm: 'score-warm', Cold: 'score-cold' };
  return map[label] || 'score-cold';
};

export const scoreLabelEmoji = { Hot: '🔥', Warm: '☀️', Cold: '❄️' };

export const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).replace('_', ' ') : '';

export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href    = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};
