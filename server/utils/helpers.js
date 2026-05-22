const jwt = require('jsonwebtoken');

// ─── Generate JWT Token ───────────────────────────────────────────────────────
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// ─── Check if Follow-up is Overdue ───────────────────────────────────────────
const isOverdue = (followUpDate) => {
  if (!followUpDate) return false;
  return new Date(followUpDate) < new Date();
};

// ─── Check if Lead Needs Follow-up (not contacted in 3 days) ─────────────────
const needsFollowUp = (lead) => {
  if (lead.status === 'converted' || lead.status === 'lost') return false;
  const daysSinceCreation = (Date.now() - new Date(lead.createdAt)) / (1000 * 60 * 60 * 24);
  return lead.status === 'new' && daysSinceCreation >= 3;
};

// ─── Format Date for Display ──────────────────────────────────────────────────
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

module.exports = { generateToken, isOverdue, needsFollowUp, formatDate };
