const express = require('express');
const router  = express.Router();
const {
  createLead, getLeads, getLeadById, updateLead, deleteLead,
  addNote, editNote, deleteNote,
  updateScore, getOverdueLeads, getTodayFollowUps, getActivityHistory,
  getAnalytics, sendEmail, exportLeads,
} = require('../controllers/leadController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// ── Special named routes BEFORE /:id to avoid param conflicts ────────────────
router.get('/analytics', getAnalytics);          // GET  /api/leads/analytics
router.get('/export',    adminOnly, exportLeads); // GET  /api/leads/export
router.get('/overdue',   getOverdueLeads);        // GET  /api/leads/overdue
router.get('/today',     getTodayFollowUps);      // GET  /api/leads/today

// ── Collection ────────────────────────────────────────────────────────────────
router.get('/',  getLeads);    // GET  /api/leads
router.post('/', createLead);  // POST /api/leads

// ── Single lead ───────────────────────────────────────────────────────────────
router.get('/:id',            getLeadById);
router.put('/:id',            updateLead);
router.delete('/:id',         adminOnly, deleteLead);

// ── Score ─────────────────────────────────────────────────────────────────────
router.put('/:id/score',      updateScore);

// ── Notes ─────────────────────────────────────────────────────────────────────
router.post('/:id/notes',              addNote);
router.put('/:id/notes/:noteId',       editNote);
router.delete('/:id/notes/:noteId',    deleteNote);

// ── Activity ──────────────────────────────────────────────────────────────────
router.get('/:id/activity',   getActivityHistory);

// ── Email ─────────────────────────────────────────────────────────────────────
router.post('/:id/email',     sendEmail);

module.exports = router;
