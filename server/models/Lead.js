const mongoose = require('mongoose');

// ─── Note Sub-Schema ──────────────────────────────────────────────────────────
const noteSchema = new mongoose.Schema({
  text:      { type: String, required: true },
  addedBy:   { type: String, default: 'Admin' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: null },   // set when note is edited
  isEdited:  { type: Boolean, default: false },
});

// ─── Activity Timeline Sub-Schema ─────────────────────────────────────────────
const activitySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['created', 'status_updated', 'note_added', 'email_sent', 'follow_up_set'],
    required: true,
  },
  description: { type: String, required: true },
  performedBy: { type: String, default: 'Admin' },
  createdAt: { type: Date, default: Date.now },
});

// ─── Lead Schema ──────────────────────────────────────────────────────────────
const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Lead name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    company: {
      type: String,
      trim: true,
      default: '',
    },
    source: {
      type: String,
      enum: ['website', 'referral', 'ads', 'social_media', 'cold_call', 'other'],
      default: 'website',
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'converted', 'lost'],
      default: 'new',
    },
    // AI Lead Scoring: computed field (0–100)
    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    // "Hot" | "Warm" | "Cold"
    scoreLabel: {
      type: String,
      enum: ['Hot', 'Warm', 'Cold'],
      default: 'Cold',
    },
    // Follow-up scheduling
    followUpDate: {
      type: Date,
      default: null,
    },
    // Notes history
    notes: [noteSchema],
    // Activity timeline
    activities: [activitySchema],
    // Assigned sales user
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // Soft delete flag
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// ─── Lead Scoring Logic (per spec) ───────────────────────────────────────────
// Rules:
//   New lead          → +5
//   Contacted         → +10 (cumulative with new)
//   Converted         → +30 (cumulative)
//   Follow-up added   → +10
//   Each note added   → +10 (capped at +30)
//   No activity 5+d   → -5
//   Source bonus      → referral +10, website +5, ads +3
//   Labels: 0–20 Cold, 21–50 Warm, 51+ Hot
leadSchema.methods.calculateScore = function () {
  let score = 0;

  // Status scoring (cumulative steps)
  if (this.status === 'new')       score += 5;
  if (this.status === 'contacted') score += 15;  // 5 new + 10 contacted
  if (this.status === 'converted') score += 45;  // 5+10+30
  if (this.status === 'lost')      score += 0;

  // Source bonus
  const sourceBonus = { referral: 10, website: 5, ads: 3, social_media: 2, cold_call: 1, other: 1 };
  score += sourceBonus[this.source] || 0;

  // Follow-up scheduled → +10
  if (this.followUpDate) score += 10;

  // Notes engagement: +10 per note, capped at +30
  score += Math.min(this.notes.length * 10, 30);

  // No activity for 5+ days → -5
  const lastActivity = this.activities.length > 0
    ? new Date(this.activities[this.activities.length - 1].createdAt)
    : new Date(this.createdAt);
  const daysSinceActivity = (Date.now() - lastActivity) / (1000 * 60 * 60 * 24);
  if (daysSinceActivity >= 5) score -= 5;

  // Clamp 0–100
  score = Math.max(0, Math.min(score, 100));

  // Labels: 0–20 Cold, 21–50 Warm, 51+ Hot
  if (score >= 51)      this.scoreLabel = 'Hot';
  else if (score >= 21) this.scoreLabel = 'Warm';
  else                  this.scoreLabel = 'Cold';

  this.score = score;
  return score;
};

// Auto-calculate score before saving
leadSchema.pre('save', function (next) {
  this.calculateScore();
  next();
});

// Index for search performance
leadSchema.index({ name: 'text', email: 'text', company: 'text' });
leadSchema.index({ status: 1, source: 1, createdAt: -1 });

module.exports = mongoose.model('Lead', leadSchema);
