const Lead = require('../models/Lead');
const nodemailer = require('nodemailer');
const { Parser } = require('json2csv');
const { needsFollowUp, isOverdue } = require('../utils/helpers');

// ─── @desc    Create a new lead
// ─── @route   POST /api/leads
// ─── @access  Private
const createLead = async (req, res) => {
  try {
    const { name, email, phone, company, source, status, followUpDate } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    const lead = new Lead({
      name,
      email,
      phone,
      company,
      source,
      status,
      followUpDate,
      activities: [
        {
          type: 'created',
          description: `Lead "${name}" was created`,
          performedBy: req.user.name,
        },
      ],
    });

    // Score is auto-calculated via pre-save hook
    await lead.save();
    res.status(201).json(lead);
  } catch (error) {
    console.error('Create lead error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ─── @desc    Get all leads with search, filter, pagination
// ─── @route   GET /api/leads
// ─── @access  Private
const getLeads = async (req, res) => {
  try {
    const {
      search,
      status,
      source,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    // Build filter object
    const filter = { isDeleted: false };

    if (status) filter.status = status;
    if (source) filter.source = source;

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Text search on name, email, company
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortObj = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [leads, total] = await Promise.all([
      Lead.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('assignedTo', 'name email'),
      Lead.countDocuments(filter),
    ]);

    // Attach follow-up recommendation flag
    const leadsWithFlags = leads.map((lead) => {
      const obj = lead.toObject();
      obj.needsFollowUp = needsFollowUp(lead);
      obj.isOverdue = isOverdue(lead.followUpDate);
      return obj;
    });

    res.json({
      leads: leadsWithFlags,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ─── @desc    Get single lead by ID
// ─── @route   GET /api/leads/:id
// ─── @access  Private
const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findOne({ _id: req.params.id, isDeleted: false })
      .populate('assignedTo', 'name email');

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    const obj = lead.toObject();
    obj.needsFollowUp = needsFollowUp(lead);
    obj.isOverdue = isOverdue(lead.followUpDate);

    res.json(obj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── @desc    Update lead (status, info, follow-up date)
// ─── @route   PUT /api/leads/:id
// ─── @access  Private
const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findOne({ _id: req.params.id, isDeleted: false });
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    const { name, email, phone, company, source, status, followUpDate, assignedTo } = req.body;

    // Track status change in activity timeline
    if (status && status !== lead.status) {
      lead.activities.push({
        type: 'status_updated',
        description: `Status changed from "${lead.status}" to "${status}"`,
        performedBy: req.user.name,
      });
    }

    // Track follow-up date change
    if (followUpDate && followUpDate !== lead.followUpDate?.toISOString()) {
      lead.activities.push({
        type: 'follow_up_set',
        description: `Follow-up scheduled for ${new Date(followUpDate).toDateString()}`,
        performedBy: req.user.name,
      });
    }

    // Apply updates
    if (name)        lead.name = name;
    if (email)       lead.email = email;
    if (phone !== undefined) lead.phone = phone;
    if (company !== undefined) lead.company = company;
    if (source)      lead.source = source;
    if (status)      lead.status = status;
    if (followUpDate !== undefined) lead.followUpDate = followUpDate || null;
    if (assignedTo !== undefined)   lead.assignedTo = assignedTo || null;

    await lead.save(); // triggers score recalculation
    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── @desc    Delete lead (soft delete) — Admin only
// ─── @route   DELETE /api/leads/:id
// ─── @access  Private/Admin
const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findOne({ _id: req.params.id, isDeleted: false });
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    lead.isDeleted = true;
    await lead.save();

    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── @desc    Add a note to a lead
// ─── @route   POST /api/leads/:id/notes
// ─── @access  Private
const addNote = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Note text is required' });

    const lead = await Lead.findOne({ _id: req.params.id, isDeleted: false });
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    lead.notes.push({ text, addedBy: req.user.name });
    lead.activities.push({
      type: 'note_added',
      description: `Note added: "${text.substring(0, 60)}${text.length > 60 ? '...' : ''}"`,
      performedBy: req.user.name,
    });

    await lead.save();
    res.status(201).json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── @desc    Get analytics data
// ─── @route   GET /api/leads/analytics
// ─── @access  Private
const getAnalytics = async (req, res) => {
  try {
    const baseFilter = { isDeleted: false };

    // Aggregate counts by status
    const statusCounts = await Lead.aggregate([
      { $match: baseFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Aggregate counts by source
    const sourceCounts = await Lead.aggregate([
      { $match: baseFilter },
      { $group: { _id: '$source', count: { $sum: 1 } } },
    ]);

    // Leads created per day (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const leadsOverTime = await Lead.aggregate([
      { $match: { ...baseFilter, createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Score distribution
    const scoreDistribution = await Lead.aggregate([
      { $match: baseFilter },
      { $group: { _id: '$scoreLabel', count: { $sum: 1 } } },
    ]);

    const total = await Lead.countDocuments(baseFilter);
    const converted = statusCounts.find((s) => s._id === 'converted')?.count || 0;
    const contacted = statusCounts.find((s) => s._id === 'contacted')?.count || 0;
    const newLeads  = statusCounts.find((s) => s._id === 'new')?.count || 0;
    const lost      = statusCounts.find((s) => s._id === 'lost')?.count || 0;

    // Overdue follow-ups
    const overdueCount = await Lead.countDocuments({
      ...baseFilter,
      followUpDate: { $lt: new Date() },
      status: { $nin: ['converted', 'lost'] },
    });

    res.json({
      total,
      converted,
      contacted,
      newLeads,
      lost,
      conversionRate: total > 0 ? ((converted / total) * 100).toFixed(1) : 0,
      overdueFollowUps: overdueCount,
      statusCounts,
      sourceCounts,
      leadsOverTime,
      scoreDistribution,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── @desc    Send email to a lead
// ─── @route   POST /api/leads/:id/email
// ─── @access  Private
const sendEmail = async (req, res) => {
  try {
    const lead = await Lead.findOne({ _id: req.params.id, isDeleted: false });
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    const { subject, message } = req.body;
    if (!subject || !message) {
      return res.status(400).json({ message: 'Subject and message are required' });
    }

    // Configure transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // HTML email template
    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #4F46E5; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="color: white; margin: 0;">CRM Message</h2>
        </div>
        <div style="padding: 30px; background: #f9fafb; border: 1px solid #e5e7eb;">
          <p>Dear <strong>${lead.name}</strong>,</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            ${message.replace(/\n/g, '<br/>')}
          </div>
          <p style="color: #6b7280; font-size: 12px;">
            This email was sent via CRM system.
          </p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"CRM System" <${process.env.EMAIL_USER}>`,
      to: lead.email,
      subject,
      html: htmlTemplate,
    });

    // Log activity
    lead.activities.push({
      type: 'email_sent',
      description: `Email sent: "${subject}"`,
      performedBy: req.user.name,
    });
    await lead.save();

    res.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ message: 'Failed to send email: ' + error.message });
  }
};

// ─── @desc    Export leads as CSV
// ─── @route   GET /api/leads/export
// ─── @access  Private/Admin
const exportLeads = async (req, res) => {
  try {
    const leads = await Lead.find({ isDeleted: false }).lean();

    const fields = [
      { label: 'Name',        value: 'name' },
      { label: 'Email',       value: 'email' },
      { label: 'Phone',       value: 'phone' },
      { label: 'Company',     value: 'company' },
      { label: 'Source',      value: 'source' },
      { label: 'Status',      value: 'status' },
      { label: 'Score',       value: 'score' },
      { label: 'Score Label', value: 'scoreLabel' },
      { label: 'Follow Up',   value: 'followUpDate' },
      { label: 'Created At',  value: 'createdAt' },
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(leads);

    res.header('Content-Type', 'text/csv');
    res.attachment('leads_export.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── @desc    Edit a note on a lead
// ─── @route   PUT /api/leads/:id/notes/:noteId
// ─── @access  Private
const editNote = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Note text is required' });

    const lead = await Lead.findOne({ _id: req.params.id, isDeleted: false });
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    const note = lead.notes.id(req.params.noteId);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    note.text      = text.trim();
    note.isEdited  = true;
    note.updatedAt = new Date();

    lead.activities.push({
      type: 'note_added',
      description: `Note edited: "${text.substring(0, 60)}${text.length > 60 ? '...' : ''}"`,
      performedBy: req.user.name,
    });

    await lead.save();
    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── @desc    Delete a note from a lead
// ─── @route   DELETE /api/leads/:id/notes/:noteId
// ─── @access  Private
const deleteNote = async (req, res) => {
  try {
    const lead = await Lead.findOne({ _id: req.params.id, isDeleted: false });
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    const note = lead.notes.id(req.params.noteId);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    note.deleteOne();

    lead.activities.push({
      type: 'note_added',
      description: 'A note was deleted',
      performedBy: req.user.name,
    });

    await lead.save();
    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── @desc    Manually recalculate and update score for a lead
// ─── @route   PUT /api/leads/:id/score
// ─── @access  Private
const updateScore = async (req, res) => {
  try {
    const lead = await Lead.findOne({ _id: req.params.id, isDeleted: false });
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    lead.calculateScore();
    await lead.save();
    res.json({ score: lead.score, scoreLabel: lead.scoreLabel });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── @desc    Get overdue leads (follow-up date passed, not converted/lost)
// ─── @route   GET /api/leads/overdue
// ─── @access  Private
const getOverdueLeads = async (req, res) => {
  try {
    const leads = await Lead.find({
      isDeleted: false,
      followUpDate: { $lt: new Date() },
      status: { $nin: ['converted', 'lost'] },
    })
      .sort({ followUpDate: 1 })
      .select('name email company status score scoreLabel followUpDate createdAt');

    res.json({ leads, total: leads.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── @desc    Get today's follow-ups
// ─── @route   GET /api/leads/today
// ─── @access  Private
const getTodayFollowUps = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const leads = await Lead.find({
      isDeleted: false,
      followUpDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $nin: ['converted', 'lost'] },
    })
      .sort({ followUpDate: 1 })
      .select('name email company status score scoreLabel followUpDate');

    res.json({ leads, total: leads.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── @desc    Get activity history for a lead
// ─── @route   GET /api/leads/:id/activity
// ─── @access  Private
const getActivityHistory = async (req, res) => {
  try {
    const lead = await Lead.findOne({ _id: req.params.id, isDeleted: false })
      .select('activities name');
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    // Return newest first
    const activities = [...lead.activities].reverse();
    res.json({ activities, total: activities.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  addNote,
  editNote,
  deleteNote,
  updateScore,
  getOverdueLeads,
  getTodayFollowUps,
  getActivityHistory,
  getAnalytics,
  sendEmail,
  exportLeads,
};