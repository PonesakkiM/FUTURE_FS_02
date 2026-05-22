/**
 * Seed Script — creates 25 realistic sample leads
 * Run: node utils/seedLeads.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Lead = require('../models/Lead');

const leads = [
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@techcorp.com',
    phone: '+1 (555) 234-5678',
    company: 'TechCorp Inc.',
    source: 'referral',
    status: 'converted',
    followUpDate: null,
    notes: [
      { text: 'Very interested in the enterprise plan. Signed contract.', addedBy: 'Admin' },
      { text: 'Onboarding scheduled for next Monday.', addedBy: 'Admin' },
    ],
    activities: [
      { type: 'created', description: 'Lead "Sarah Johnson" was created', performedBy: 'Admin' },
      { type: 'status_updated', description: 'Status changed from "new" to "contacted"', performedBy: 'Admin' },
      { type: 'note_added', description: 'Note added: "Very interested in the enterprise plan..."', performedBy: 'Admin' },
      { type: 'status_updated', description: 'Status changed from "contacted" to "converted"', performedBy: 'Admin' },
    ],
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
  },
  {
    name: 'Michael Chen',
    email: 'm.chen@startupxyz.io',
    phone: '+1 (555) 345-6789',
    company: 'StartupXYZ',
    source: 'website',
    status: 'contacted',
    followUpDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // overdue
    notes: [
      { text: 'Had a 30-min demo call. Needs approval from CTO.', addedBy: 'Admin' },
    ],
    activities: [
      { type: 'created', description: 'Lead "Michael Chen" was created', performedBy: 'Admin' },
      { type: 'status_updated', description: 'Status changed from "new" to "contacted"', performedBy: 'Admin' },
      { type: 'follow_up_set', description: 'Follow-up scheduled', performedBy: 'Admin' },
    ],
    createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
  },
  {
    name: 'Emily Rodriguez',
    email: 'emily.r@designstudio.co',
    phone: '+1 (555) 456-7890',
    company: 'Design Studio Co.',
    source: 'ads',
    status: 'new',
    followUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    notes: [],
    activities: [
      { type: 'created', description: 'Lead "Emily Rodriguez" was created', performedBy: 'Admin' },
    ],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    name: 'David Park',
    email: 'david.park@globalfinance.com',
    phone: '+1 (555) 567-8901',
    company: 'Global Finance Ltd.',
    source: 'referral',
    status: 'converted',
    followUpDate: null,
    notes: [
      { text: 'Closed deal for 50 seats. Annual contract.', addedBy: 'Admin' },
    ],
    activities: [
      { type: 'created', description: 'Lead "David Park" was created', performedBy: 'Admin' },
      { type: 'status_updated', description: 'Status changed from "new" to "converted"', performedBy: 'Admin' },
    ],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  },
  {
    name: 'Jessica Williams',
    email: 'jwilliams@healthplus.org',
    phone: '+1 (555) 678-9012',
    company: 'HealthPlus',
    source: 'social_media',
    status: 'contacted',
    followUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    notes: [
      { text: 'Reached out via LinkedIn. Interested in the starter plan.', addedBy: 'Sales User' },
    ],
    activities: [
      { type: 'created', description: 'Lead "Jessica Williams" was created', performedBy: 'Sales User' },
      { type: 'status_updated', description: 'Status changed from "new" to "contacted"', performedBy: 'Sales User' },
    ],
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
  },
  {
    name: 'Robert Martinez',
    email: 'r.martinez@retailchain.com',
    phone: '+1 (555) 789-0123',
    company: 'RetailChain Corp',
    source: 'cold_call',
    status: 'lost',
    followUpDate: null,
    notes: [
      { text: 'Went with a competitor. Budget constraints.', addedBy: 'Admin' },
    ],
    activities: [
      { type: 'created', description: 'Lead "Robert Martinez" was created', performedBy: 'Admin' },
      { type: 'status_updated', description: 'Status changed from "contacted" to "lost"', performedBy: 'Admin' },
    ],
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
  },
  {
    name: 'Amanda Foster',
    email: 'amanda@cloudnine.tech',
    phone: '+1 (555) 890-1234',
    company: 'CloudNine Tech',
    source: 'website',
    status: 'new',
    followUpDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    notes: [],
    activities: [
      { type: 'created', description: 'Lead "Amanda Foster" was created', performedBy: 'Admin' },
    ],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    name: 'James Thompson',
    email: 'j.thompson@logisticspro.com',
    phone: '+1 (555) 901-2345',
    company: 'LogisticsPro',
    source: 'referral',
    status: 'contacted',
    followUpDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // overdue
    notes: [
      { text: 'Needs integration with their existing ERP system.', addedBy: 'Admin' },
      { text: 'Sent technical documentation.', addedBy: 'Admin' },
    ],
    activities: [
      { type: 'created', description: 'Lead "James Thompson" was created', performedBy: 'Admin' },
      { type: 'status_updated', description: 'Status changed from "new" to "contacted"', performedBy: 'Admin' },
      { type: 'email_sent', description: 'Email sent: "Technical Documentation"', performedBy: 'Admin' },
    ],
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
  },
  {
    name: 'Lisa Anderson',
    email: 'lisa.a@mediahub.com',
    phone: '+1 (555) 012-3456',
    company: 'MediaHub',
    source: 'ads',
    status: 'converted',
    followUpDate: null,
    notes: [
      { text: 'Upgraded to Pro plan after trial.', addedBy: 'Sales User' },
    ],
    activities: [
      { type: 'created', description: 'Lead "Lisa Anderson" was created', performedBy: 'Sales User' },
      { type: 'status_updated', description: 'Status changed from "new" to "converted"', performedBy: 'Sales User' },
    ],
    createdAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000),
  },
  {
    name: 'Kevin Brown',
    email: 'kevin.b@edulearn.edu',
    phone: '+1 (555) 123-4567',
    company: 'EduLearn Platform',
    source: 'social_media',
    status: 'new',
    followUpDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    notes: [],
    activities: [
      { type: 'created', description: 'Lead "Kevin Brown" was created', performedBy: 'Admin' },
    ],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    name: 'Priya Patel',
    email: 'priya.patel@innovateai.com',
    phone: '+1 (555) 234-5670',
    company: 'InnovateAI',
    source: 'referral',
    status: 'contacted',
    followUpDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    notes: [
      { text: 'AI startup, very excited about automation features.', addedBy: 'Admin' },
    ],
    activities: [
      { type: 'created', description: 'Lead "Priya Patel" was created', performedBy: 'Admin' },
      { type: 'status_updated', description: 'Status changed from "new" to "contacted"', performedBy: 'Admin' },
    ],
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
  },
  {
    name: 'Tom Wilson',
    email: 'tom.w@constructbig.com',
    phone: '+1 (555) 345-6780',
    company: 'ConstructBig LLC',
    source: 'cold_call',
    status: 'new',
    followUpDate: null,
    notes: [],
    activities: [
      { type: 'created', description: 'Lead "Tom Wilson" was created', performedBy: 'Admin' },
    ],
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  },
  {
    name: 'Natalie Kim',
    email: 'n.kim@fashionforward.com',
    phone: '+1 (555) 456-7891',
    company: 'FashionForward',
    source: 'ads',
    status: 'converted',
    followUpDate: null,
    notes: [
      { text: 'E-commerce integration was the key selling point.', addedBy: 'Sales User' },
    ],
    activities: [
      { type: 'created', description: 'Lead "Natalie Kim" was created', performedBy: 'Sales User' },
      { type: 'status_updated', description: 'Status changed from "contacted" to "converted"', performedBy: 'Sales User' },
    ],
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
  },
  {
    name: 'Carlos Mendez',
    email: 'c.mendez@realestatepro.com',
    phone: '+1 (555) 567-8902',
    company: 'RealEstate Pro',
    source: 'website',
    status: 'contacted',
    followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    notes: [
      { text: 'Wants CRM for managing property leads.', addedBy: 'Admin' },
    ],
    activities: [
      { type: 'created', description: 'Lead "Carlos Mendez" was created', performedBy: 'Admin' },
      { type: 'status_updated', description: 'Status changed from "new" to "contacted"', performedBy: 'Admin' },
    ],
    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
  },
  {
    name: 'Rachel Green',
    email: 'rachel.g@fooddelivery.app',
    phone: '+1 (555) 678-9013',
    company: 'FoodDelivery App',
    source: 'social_media',
    status: 'new',
    followUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    notes: [],
    activities: [
      { type: 'created', description: 'Lead "Rachel Green" was created', performedBy: 'Admin' },
    ],
    createdAt: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000),
  },
  {
    name: 'Daniel Scott',
    email: 'd.scott@cybersecure.net',
    phone: '+1 (555) 789-0124',
    company: 'CyberSecure Inc.',
    source: 'referral',
    status: 'contacted',
    followUpDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // overdue
    notes: [
      { text: 'Security compliance is their top priority.', addedBy: 'Admin' },
      { text: 'Sent SOC2 compliance documentation.', addedBy: 'Admin' },
    ],
    activities: [
      { type: 'created', description: 'Lead "Daniel Scott" was created', performedBy: 'Admin' },
      { type: 'status_updated', description: 'Status changed from "new" to "contacted"', performedBy: 'Admin' },
      { type: 'email_sent', description: 'Email sent: "SOC2 Compliance Docs"', performedBy: 'Admin' },
    ],
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
  },
  {
    name: 'Olivia Turner',
    email: 'o.turner@nonprofit.org',
    phone: '+1 (555) 890-1235',
    company: 'GreenEarth Nonprofit',
    source: 'website',
    status: 'lost',
    followUpDate: null,
    notes: [
      { text: 'Non-profit budget too limited for our pricing.', addedBy: 'Admin' },
    ],
    activities: [
      { type: 'created', description: 'Lead "Olivia Turner" was created', performedBy: 'Admin' },
      { type: 'status_updated', description: 'Status changed from "contacted" to "lost"', performedBy: 'Admin' },
    ],
    createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
  },
  {
    name: 'Ethan Harris',
    email: 'ethan.h@saasplatform.io',
    phone: '+1 (555) 901-2346',
    company: 'SaaS Platform IO',
    source: 'ads',
    status: 'converted',
    followUpDate: null,
    notes: [
      { text: 'Migrating from competitor. 200 seat deal.', addedBy: 'Admin' },
    ],
    activities: [
      { type: 'created', description: 'Lead "Ethan Harris" was created', performedBy: 'Admin' },
      { type: 'status_updated', description: 'Status changed from "contacted" to "converted"', performedBy: 'Admin' },
    ],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
  {
    name: 'Sophia Lee',
    email: 's.lee@beautybrands.com',
    phone: '+1 (555) 012-3457',
    company: 'Beauty Brands Co.',
    source: 'social_media',
    status: 'new',
    followUpDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    notes: [],
    activities: [
      { type: 'created', description: 'Lead "Sophia Lee" was created', performedBy: 'Admin' },
    ],
    createdAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000),
  },
  {
    name: 'Marcus Johnson',
    email: 'm.johnson@autoparts.com',
    phone: '+1 (555) 123-4568',
    company: 'AutoParts Direct',
    source: 'cold_call',
    status: 'contacted',
    followUpDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    notes: [
      { text: 'Fleet management use case. 500+ vehicles.', addedBy: 'Sales User' },
    ],
    activities: [
      { type: 'created', description: 'Lead "Marcus Johnson" was created', performedBy: 'Sales User' },
      { type: 'status_updated', description: 'Status changed from "new" to "contacted"', performedBy: 'Sales User' },
    ],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    name: 'Isabella White',
    email: 'i.white@travelagency.com',
    phone: '+1 (555) 234-5671',
    company: 'TravelAgency Plus',
    source: 'referral',
    status: 'converted',
    followUpDate: null,
    notes: [
      { text: 'Booking management integration. Closed Q4.', addedBy: 'Admin' },
    ],
    activities: [
      { type: 'created', description: 'Lead "Isabella White" was created', performedBy: 'Admin' },
      { type: 'status_updated', description: 'Status changed from "contacted" to "converted"', performedBy: 'Admin' },
    ],
    createdAt: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000),
  },
  {
    name: 'Noah Davis',
    email: 'noah.d@fintech.startup',
    phone: '+1 (555) 345-6781',
    company: 'FinTech Startup',
    source: 'website',
    status: 'new',
    followUpDate: null,
    notes: [],
    activities: [
      { type: 'created', description: 'Lead "Noah Davis" was created', performedBy: 'Admin' },
    ],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    name: 'Ava Martinez',
    email: 'ava.m@hospitalgroup.com',
    phone: '+1 (555) 456-7892',
    company: 'Hospital Group',
    source: 'referral',
    status: 'contacted',
    followUpDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    notes: [
      { text: 'HIPAA compliance required. Sent compliance docs.', addedBy: 'Admin' },
    ],
    activities: [
      { type: 'created', description: 'Lead "Ava Martinez" was created', performedBy: 'Admin' },
      { type: 'status_updated', description: 'Status changed from "new" to "contacted"', performedBy: 'Admin' },
    ],
    createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
  },
  {
    name: 'Liam Robinson',
    email: 'liam.r@gamingstudio.com',
    phone: '+1 (555) 567-8903',
    company: 'Gaming Studio X',
    source: 'ads',
    status: 'new',
    followUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    notes: [],
    activities: [
      { type: 'created', description: 'Lead "Liam Robinson" was created', performedBy: 'Admin' },
    ],
    createdAt: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000),
  },
  {
    name: 'Zoe Clark',
    email: 'zoe.c@legalfirm.law',
    phone: '+1 (555) 678-9014',
    company: 'Clark Legal Firm',
    source: 'cold_call',
    status: 'contacted',
    followUpDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // overdue
    notes: [
      { text: 'Document management and client tracking use case.', addedBy: 'Admin' },
    ],
    activities: [
      { type: 'created', description: 'Lead "Zoe Clark" was created', performedBy: 'Admin' },
      { type: 'status_updated', description: 'Status changed from "new" to "contacted"', performedBy: 'Admin' },
    ],
    createdAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000),
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing leads
    await Lead.deleteMany({});
    console.log('🗑️  Cleared existing leads');

    // Insert all leads (score auto-calculated via pre-save hook)
    let inserted = 0;
    for (const leadData of leads) {
      const lead = new Lead(leadData);
      lead.calculateScore();
      await lead.save();
      inserted++;
      process.stdout.write(`\r📦 Inserting leads... ${inserted}/${leads.length}`);
    }

    console.log(`\n✅ Successfully seeded ${inserted} leads!`);

    // Summary
    const total     = await Lead.countDocuments();
    const converted = await Lead.countDocuments({ status: 'converted' });
    const contacted = await Lead.countDocuments({ status: 'contacted' });
    const newLeads  = await Lead.countDocuments({ status: 'new' });
    const lost      = await Lead.countDocuments({ status: 'lost' });
    console.log(`\n📊 Summary:`);
    console.log(`   Total: ${total} | New: ${newLeads} | Contacted: ${contacted} | Converted: ${converted} | Lost: ${lost}`);

    process.exit(0);
  } catch (err) {
    console.error('\n❌ Seed error:', err.message);
    process.exit(1);
  }
};

seed();
