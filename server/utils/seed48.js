require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Lead = require('../models/Lead');

// Helper: random date within last N days
const daysAgo  = (n) => new Date(Date.now() - n * 86400000);
const daysAhead = (n) => new Date(Date.now() + n * 86400000);

const leads = [
  // ── Converted (10) ──────────────────────────────────────────────────────────
  {
    name: 'Alice Morgan', email: 'alice.morgan@nexustech.com', phone: '+1 (312) 555-0101',
    company: 'Nexus Technologies', source: 'referral', status: 'converted',
    followUpDate: null, createdAt: daysAgo(45),
    notes: [
      { text: 'Signed 2-year enterprise contract. 120 seats.', addedBy: 'Admin', createdAt: daysAgo(30) },
      { text: 'Onboarding completed successfully.', addedBy: 'Admin', createdAt: daysAgo(20) },
    ],
    activities: [
      { type: 'created',        description: 'Lead "Alice Morgan" was created',              performedBy: 'Admin', createdAt: daysAgo(45) },
      { type: 'status_updated', description: 'Status changed from "new" to "contacted"',     performedBy: 'Admin', createdAt: daysAgo(40) },
      { type: 'note_added',     description: 'Note added: "Signed 2-year enterprise..."',    performedBy: 'Admin', createdAt: daysAgo(30) },
      { type: 'status_updated', description: 'Status changed from "contacted" to "converted"', performedBy: 'Admin', createdAt: daysAgo(28) },
    ],
  },
  {
    name: 'Brian Okafor', email: 'b.okafor@finbridge.io', phone: '+1 (415) 555-0202',
    company: 'FinBridge Capital', source: 'website', status: 'converted',
    followUpDate: null, createdAt: daysAgo(38),
    notes: [{ text: 'Closed Q1 deal. Annual subscription.', addedBy: 'Sales User', createdAt: daysAgo(25) }],
    activities: [
      { type: 'created',        description: 'Lead "Brian Okafor" was created',              performedBy: 'Sales User', createdAt: daysAgo(38) },
      { type: 'status_updated', description: 'Status changed from "contacted" to "converted"', performedBy: 'Sales User', createdAt: daysAgo(22) },
    ],
  },
  {
    name: 'Carmen Diaz', email: 'carmen.d@healthvault.org', phone: '+1 (213) 555-0303',
    company: 'HealthVault Systems', source: 'referral', status: 'converted',
    followUpDate: null, createdAt: daysAgo(52),
    notes: [{ text: 'HIPAA-compliant setup done. 80 users.', addedBy: 'Admin', createdAt: daysAgo(35) }],
    activities: [
      { type: 'created',        description: 'Lead "Carmen Diaz" was created',               performedBy: 'Admin', createdAt: daysAgo(52) },
      { type: 'status_updated', description: 'Status changed from "contacted" to "converted"', performedBy: 'Admin', createdAt: daysAgo(33) },
    ],
  },
  {
    name: 'Derek Huang', email: 'd.huang@cloudpeak.dev', phone: '+1 (650) 555-0404',
    company: 'CloudPeak Dev', source: 'ads', status: 'converted',
    followUpDate: null, createdAt: daysAgo(29),
    notes: [{ text: 'Developer team of 30. API integration complete.', addedBy: 'Admin', createdAt: daysAgo(18) }],
    activities: [
      { type: 'created',        description: 'Lead "Derek Huang" was created',               performedBy: 'Admin', createdAt: daysAgo(29) },
      { type: 'status_updated', description: 'Status changed from "contacted" to "converted"', performedBy: 'Admin', createdAt: daysAgo(15) },
    ],
  },
  {
    name: 'Elena Vasquez', email: 'e.vasquez@retailmax.com', phone: '+1 (305) 555-0505',
    company: 'RetailMax Corp', source: 'referral', status: 'converted',
    followUpDate: null, createdAt: daysAgo(60),
    notes: [{ text: 'Retail chain, 200 stores. Bulk license deal.', addedBy: 'Admin', createdAt: daysAgo(45) }],
    activities: [
      { type: 'created',        description: 'Lead "Elena Vasquez" was created',             performedBy: 'Admin', createdAt: daysAgo(60) },
      { type: 'status_updated', description: 'Status changed from "contacted" to "converted"', performedBy: 'Admin', createdAt: daysAgo(42) },
    ],
  },
  {
    name: 'Frank Nguyen', email: 'frank.n@logixpro.com', phone: '+1 (469) 555-0606',
    company: 'LogixPro Logistics', source: 'cold_call', status: 'converted',
    followUpDate: null, createdAt: daysAgo(33),
    notes: [{ text: 'Fleet tracking integration. 3-year deal.', addedBy: 'Sales User', createdAt: daysAgo(20) }],
    activities: [
      { type: 'created',        description: 'Lead "Frank Nguyen" was created',              performedBy: 'Sales User', createdAt: daysAgo(33) },
      { type: 'status_updated', description: 'Status changed from "contacted" to "converted"', performedBy: 'Sales User', createdAt: daysAgo(18) },
    ],
  },
  {
    name: 'Grace Kim', email: 'grace.k@eduspark.edu', phone: '+1 (617) 555-0707',
    company: 'EduSpark Learning', source: 'social_media', status: 'converted',
    followUpDate: null, createdAt: daysAgo(41),
    notes: [{ text: 'University platform. 5000 student licenses.', addedBy: 'Admin', createdAt: daysAgo(28) }],
    activities: [
      { type: 'created',        description: 'Lead "Grace Kim" was created',                 performedBy: 'Admin', createdAt: daysAgo(41) },
      { type: 'status_updated', description: 'Status changed from "contacted" to "converted"', performedBy: 'Admin', createdAt: daysAgo(25) },
    ],
  },
  {
    name: 'Henry Walsh', email: 'h.walsh@propmanage.com', phone: '+1 (702) 555-0808',
    company: 'PropManage RE', source: 'website', status: 'converted',
    followUpDate: null, createdAt: daysAgo(22),
    notes: [{ text: 'Real estate CRM migration. 15 agents.', addedBy: 'Admin', createdAt: daysAgo(12) }],
    activities: [
      { type: 'created',        description: 'Lead "Henry Walsh" was created',               performedBy: 'Admin', createdAt: daysAgo(22) },
      { type: 'status_updated', description: 'Status changed from "contacted" to "converted"', performedBy: 'Admin', createdAt: daysAgo(10) },
    ],
  },
  {
    name: 'Irene Patel', email: 'irene.p@mediasync.tv', phone: '+1 (323) 555-0909',
    company: 'MediaSync TV', source: 'ads', status: 'converted',
    followUpDate: null, createdAt: daysAgo(55),
    notes: [{ text: 'Broadcast media company. Content team of 40.', addedBy: 'Sales User', createdAt: daysAgo(40) }],
    activities: [
      { type: 'created',        description: 'Lead "Irene Patel" was created',               performedBy: 'Sales User', createdAt: daysAgo(55) },
      { type: 'status_updated', description: 'Status changed from "contacted" to "converted"', performedBy: 'Sales User', createdAt: daysAgo(38) },
    ],
  },
  {
    name: 'Jason Torres', email: 'j.torres@secureops.net', phone: '+1 (512) 555-1010',
    company: 'SecureOps Inc', source: 'referral', status: 'converted',
    followUpDate: null, createdAt: daysAgo(48),
    notes: [
      { text: 'Cybersecurity firm. SOC2 compliance verified.', addedBy: 'Admin', createdAt: daysAgo(35) },
      { text: 'Signed 50-seat deal with priority support.', addedBy: 'Admin', createdAt: daysAgo(30) },
    ],
    activities: [
      { type: 'created',        description: 'Lead "Jason Torres" was created',              performedBy: 'Admin', createdAt: daysAgo(48) },
      { type: 'status_updated', description: 'Status changed from "contacted" to "converted"', performedBy: 'Admin', createdAt: daysAgo(28) },
    ],
  },

  // ── Contacted (16) ──────────────────────────────────────────────────────────
  {
    name: 'Karen Bell', email: 'karen.b@autofleet.com', phone: '+1 (248) 555-1101',
    company: 'AutoFleet Solutions', source: 'cold_call', status: 'contacted',
    followUpDate: daysAhead(2), createdAt: daysAgo(14),
    notes: [{ text: 'Fleet of 300 vehicles. Needs GPS integration demo.', addedBy: 'Admin', createdAt: daysAgo(10) }],
    activities: [
      { type: 'created',        description: 'Lead "Karen Bell" was created',                performedBy: 'Admin', createdAt: daysAgo(14) },
      { type: 'status_updated', description: 'Status changed from "new" to "contacted"',     performedBy: 'Admin', createdAt: daysAgo(10) },
      { type: 'follow_up_set',  description: 'Follow-up scheduled',                          performedBy: 'Admin', createdAt: daysAgo(10) },
    ],
  },
  {
    name: 'Liam Foster', email: 'liam.f@greenarch.co', phone: '+1 (503) 555-1202',
    company: 'GreenArch Design', source: 'website', status: 'contacted',
    followUpDate: daysAgo(1), createdAt: daysAgo(18),  // overdue
    notes: [{ text: 'Architecture firm. Project management use case.', addedBy: 'Admin', createdAt: daysAgo(12) }],
    activities: [
      { type: 'created',        description: 'Lead "Liam Foster" was created',               performedBy: 'Admin', createdAt: daysAgo(18) },
      { type: 'status_updated', description: 'Status changed from "new" to "contacted"',     performedBy: 'Admin', createdAt: daysAgo(12) },
    ],
  },
  {
    name: 'Maya Sharma', email: 'm.sharma@pharmalink.com', phone: '+1 (732) 555-1303',
    company: 'PharmaLink Corp', source: 'referral', status: 'contacted',
    followUpDate: daysAhead(5), createdAt: daysAgo(9),
    notes: [{ text: 'Pharmaceutical sales team. 60 reps nationwide.', addedBy: 'Sales User', createdAt: daysAgo(6) }],
    activities: [
      { type: 'created',        description: 'Lead "Maya Sharma" was created',               performedBy: 'Sales User', createdAt: daysAgo(9) },
      { type: 'status_updated', description: 'Status changed from "new" to "contacted"',     performedBy: 'Sales User', createdAt: daysAgo(6) },
    ],
  },
  {
    name: 'Nathan Cole', email: 'n.cole@insurepro.com', phone: '+1 (614) 555-1404',
    company: 'InsurePro Agency', source: 'ads', status: 'contacted',
    followUpDate: daysAgo(3), createdAt: daysAgo(20),  // overdue
    notes: [{ text: 'Insurance brokerage. Needs client portal feature.', addedBy: 'Admin', createdAt: daysAgo(15) }],
    activities: [
      { type: 'created',        description: 'Lead "Nathan Cole" was created',               performedBy: 'Admin', createdAt: daysAgo(20) },
      { type: 'status_updated', description: 'Status changed from "new" to "contacted"',     performedBy: 'Admin', createdAt: daysAgo(15) },
    ],
  },
  {
    name: 'Olivia Grant', email: 'o.grant@sportshub.com', phone: '+1 (404) 555-1505',
    company: 'SportsHub Media', source: 'social_media', status: 'contacted',
    followUpDate: daysAhead(3), createdAt: daysAgo(7),
    notes: [{ text: 'Sports media company. Athlete management CRM.', addedBy: 'Admin', createdAt: daysAgo(4) }],
    activities: [
      { type: 'created',        description: 'Lead "Olivia Grant" was created',              performedBy: 'Admin', createdAt: daysAgo(7) },
      { type: 'status_updated', description: 'Status changed from "new" to "contacted"',     performedBy: 'Admin', createdAt: daysAgo(4) },
    ],
  },
  {
    name: 'Patrick Russo', email: 'p.russo@lawfirm360.com', phone: '+1 (212) 555-1606',
    company: 'LawFirm 360', source: 'referral', status: 'contacted',
    followUpDate: daysAhead(1), createdAt: daysAgo(11),
    notes: [
      { text: 'Legal firm. Case management + client tracking.', addedBy: 'Admin', createdAt: daysAgo(8) },
      { text: 'Sent product demo recording.', addedBy: 'Admin', createdAt: daysAgo(5) },
    ],
    activities: [
      { type: 'created',        description: 'Lead "Patrick Russo" was created',             performedBy: 'Admin', createdAt: daysAgo(11) },
      { type: 'status_updated', description: 'Status changed from "new" to "contacted"',     performedBy: 'Admin', createdAt: daysAgo(8) },
      { type: 'email_sent',     description: 'Email sent: "Product Demo Recording"',         performedBy: 'Admin', createdAt: daysAgo(5) },
    ],
  },
  {
    name: 'Quinn Adams', email: 'q.adams@buildright.com', phone: '+1 (602) 555-1707',
    company: 'BuildRight Construction', source: 'cold_call', status: 'contacted',
    followUpDate: daysAgo(2), createdAt: daysAgo(16),  // overdue
    notes: [{ text: 'Construction PM software. 25 project managers.', addedBy: 'Sales User', createdAt: daysAgo(11) }],
    activities: [
      { type: 'created',        description: 'Lead "Quinn Adams" was created',               performedBy: 'Sales User', createdAt: daysAgo(16) },
      { type: 'status_updated', description: 'Status changed from "new" to "contacted"',     performedBy: 'Sales User', createdAt: daysAgo(11) },
    ],
  },
  {
    name: 'Rachel Stone', email: 'r.stone@eventpro.events', phone: '+1 (702) 555-1808',
    company: 'EventPro Agency', source: 'website', status: 'contacted',
    followUpDate: daysAhead(7), createdAt: daysAgo(5),
    notes: [{ text: 'Event management company. 10 coordinators.', addedBy: 'Admin', createdAt: daysAgo(3) }],
    activities: [
      { type: 'created',        description: 'Lead "Rachel Stone" was created',              performedBy: 'Admin', createdAt: daysAgo(5) },
      { type: 'status_updated', description: 'Status changed from "new" to "contacted"',     performedBy: 'Admin', createdAt: daysAgo(3) },
    ],
  },
  {
    name: 'Samuel Wright', email: 's.wright@agritech.farm', phone: '+1 (559) 555-1909',
    company: 'AgriTech Farms', source: 'ads', status: 'contacted',
    followUpDate: daysAhead(4), createdAt: daysAgo(8),
    notes: [{ text: 'Agricultural tech startup. IoT + CRM integration.', addedBy: 'Admin', createdAt: daysAgo(5) }],
    activities: [
      { type: 'created',        description: 'Lead "Samuel Wright" was created',             performedBy: 'Admin', createdAt: daysAgo(8) },
      { type: 'status_updated', description: 'Status changed from "new" to "contacted"',     performedBy: 'Admin', createdAt: daysAgo(5) },
    ],
  },
  {
    name: 'Tina Brooks', email: 't.brooks@fashionco.com', phone: '+1 (310) 555-2001',
    company: 'FashionCo Retail', source: 'social_media', status: 'contacted',
    followUpDate: daysAgo(4), createdAt: daysAgo(22),  // overdue
    notes: [{ text: 'E-commerce + in-store CRM. 8 locations.', addedBy: 'Sales User', createdAt: daysAgo(16) }],
    activities: [
      { type: 'created',        description: 'Lead "Tina Brooks" was created',               performedBy: 'Sales User', createdAt: daysAgo(22) },
      { type: 'status_updated', description: 'Status changed from "new" to "contacted"',     performedBy: 'Sales User', createdAt: daysAgo(16) },
    ],
  },
  {
    name: 'Umar Hassan', email: 'u.hassan@techbridge.pk', phone: '+92 300 555-2102',
    company: 'TechBridge Pakistan', source: 'referral', status: 'contacted',
    followUpDate: daysAhead(6), createdAt: daysAgo(6),
    notes: [{ text: 'Software house. 40 developers. Needs project CRM.', addedBy: 'Admin', createdAt: daysAgo(3) }],
    activities: [
      { type: 'created',        description: 'Lead "Umar Hassan" was created',               performedBy: 'Admin', createdAt: daysAgo(6) },
      { type: 'status_updated', description: 'Status changed from "new" to "contacted"',     performedBy: 'Admin', createdAt: daysAgo(3) },
    ],
  },
  {
    name: 'Vera Novak', email: 'v.novak@clinicplus.eu', phone: '+420 555-2203',
    company: 'ClinicPlus EU', source: 'website', status: 'contacted',
    followUpDate: daysAhead(10), createdAt: daysAgo(4),
    notes: [{ text: 'Medical clinic chain. Patient CRM + scheduling.', addedBy: 'Admin', createdAt: daysAgo(2) }],
    activities: [
      { type: 'created',        description: 'Lead "Vera Novak" was created',                performedBy: 'Admin', createdAt: daysAgo(4) },
      { type: 'status_updated', description: 'Status changed from "new" to "contacted"',     performedBy: 'Admin', createdAt: daysAgo(2) },
    ],
  },
  {
    name: 'Walter Cruz', email: 'w.cruz@supplychain.mx', phone: '+52 55 555-2304',
    company: 'SupplyChain MX', source: 'cold_call', status: 'contacted',
    followUpDate: daysAhead(3), createdAt: daysAgo(10),
    notes: [{ text: 'Supply chain management. 100+ vendors.', addedBy: 'Sales User', createdAt: daysAgo(7) }],
    activities: [
      { type: 'created',        description: 'Lead "Walter Cruz" was created',               performedBy: 'Sales User', createdAt: daysAgo(10) },
      { type: 'status_updated', description: 'Status changed from "new" to "contacted"',     performedBy: 'Sales User', createdAt: daysAgo(7) },
    ],
  },
  {
    name: 'Xena Larson', email: 'x.larson@ngohelp.org', phone: '+1 (206) 555-2405',
    company: 'NGO Help Foundation', source: 'referral', status: 'contacted',
    followUpDate: daysAhead(8), createdAt: daysAgo(12),
    notes: [{ text: 'Non-profit. Donor management + volunteer tracking.', addedBy: 'Admin', createdAt: daysAgo(8) }],
    activities: [
      { type: 'created',        description: 'Lead "Xena Larson" was created',               performedBy: 'Admin', createdAt: daysAgo(12) },
      { type: 'status_updated', description: 'Status changed from "new" to "contacted"',     performedBy: 'Admin', createdAt: daysAgo(8) },
    ],
  },
  {
    name: 'Yusuf Osei', email: 'y.osei@fintech.gh', phone: '+233 20 555-2506',
    company: 'FinTech Ghana', source: 'ads', status: 'contacted',
    followUpDate: daysAgo(5), createdAt: daysAgo(25),  // overdue
    notes: [{ text: 'Mobile banking startup. 200k users. API integration.', addedBy: 'Admin', createdAt: daysAgo(18) }],
    activities: [
      { type: 'created',        description: 'Lead "Yusuf Osei" was created',                performedBy: 'Admin', createdAt: daysAgo(25) },
      { type: 'status_updated', description: 'Status changed from "new" to "contacted"',     performedBy: 'Admin', createdAt: daysAgo(18) },
    ],
  },
  {
    name: 'Zara Ahmed', email: 'z.ahmed@luxuryhotels.ae', phone: '+971 50 555-2607',
    company: 'Luxury Hotels UAE', source: 'referral', status: 'contacted',
    followUpDate: daysAhead(2), createdAt: daysAgo(7),
    notes: [{ text: 'Hotel chain. Guest CRM + loyalty program.', addedBy: 'Sales User', createdAt: daysAgo(4) }],
    activities: [
      { type: 'created',        description: 'Lead "Zara Ahmed" was created',                performedBy: 'Sales User', createdAt: daysAgo(7) },
      { type: 'status_updated', description: 'Status changed from "new" to "contacted"',     performedBy: 'Sales User', createdAt: daysAgo(4) },
    ],
  },

  // ── New (14) ─────────────────────────────────────────────────────────────────
  {
    name: 'Aaron Mitchell', email: 'a.mitchell@dronetech.io', phone: '+1 (720) 555-2701',
    company: 'DroneTech Solutions', source: 'website', status: 'new',
    followUpDate: daysAhead(3), createdAt: daysAgo(2),
    notes: [], activities: [{ type: 'created', description: 'Lead "Aaron Mitchell" was created', performedBy: 'Admin', createdAt: daysAgo(2) }],
  },
  {
    name: 'Bella Santos', email: 'b.santos@beautybox.com', phone: '+1 (786) 555-2802',
    company: 'BeautyBox Retail', source: 'social_media', status: 'new',
    followUpDate: daysAhead(5), createdAt: daysAgo(1),
    notes: [], activities: [{ type: 'created', description: 'Lead "Bella Santos" was created', performedBy: 'Admin', createdAt: daysAgo(1) }],
  },
  {
    name: 'Carlos Reyes', email: 'c.reyes@foodchain.mx', phone: '+52 55 555-2903',
    company: 'FoodChain Mexico', source: 'ads', status: 'new',
    followUpDate: null, createdAt: daysAgo(3),
    notes: [], activities: [{ type: 'created', description: 'Lead "Carlos Reyes" was created', performedBy: 'Admin', createdAt: daysAgo(3) }],
  },
  {
    name: 'Diana Frost', email: 'd.frost@cleanenergy.uk', phone: '+44 20 555-3004',
    company: 'CleanEnergy UK', source: 'referral', status: 'new',
    followUpDate: daysAhead(7), createdAt: daysAgo(1),
    notes: [], activities: [{ type: 'created', description: 'Lead "Diana Frost" was created', performedBy: 'Admin', createdAt: daysAgo(1) }],
  },
  {
    name: 'Ethan Blackwood', email: 'e.blackwood@gamestudio.gg', phone: '+1 (425) 555-3105',
    company: 'BlackWood Game Studio', source: 'website', status: 'new',
    followUpDate: daysAhead(4), createdAt: daysAgo(2),
    notes: [], activities: [{ type: 'created', description: 'Lead "Ethan Blackwood" was created', performedBy: 'Admin', createdAt: daysAgo(2) }],
  },
  {
    name: 'Fatima Al-Rashid', email: 'f.alrashid@arabicmedia.sa', phone: '+966 50 555-3206',
    company: 'Arabic Media Group', source: 'cold_call', status: 'new',
    followUpDate: null, createdAt: daysAgo(4),
    notes: [], activities: [{ type: 'created', description: 'Lead "Fatima Al-Rashid" was created', performedBy: 'Admin', createdAt: daysAgo(4) }],
  },
  {
    name: 'George Papadopoulos', email: 'g.papa@shippingco.gr', phone: '+30 21 555-3307',
    company: 'Aegean Shipping Co', source: 'referral', status: 'new',
    followUpDate: daysAhead(6), createdAt: daysAgo(1),
    notes: [], activities: [{ type: 'created', description: 'Lead "George Papadopoulos" was created', performedBy: 'Admin', createdAt: daysAgo(1) }],
  },
  {
    name: 'Hannah Lee', email: 'h.lee@kpopagency.kr', phone: '+82 10 555-3408',
    company: 'KPop Talent Agency', source: 'social_media', status: 'new',
    followUpDate: daysAhead(2), createdAt: daysAgo(0),
    notes: [], activities: [{ type: 'created', description: 'Lead "Hannah Lee" was created', performedBy: 'Admin', createdAt: new Date() }],
  },
  {
    name: 'Ivan Petrov', email: 'i.petrov@softwarelab.ru', phone: '+7 495 555-3509',
    company: 'SoftwareLab Russia', source: 'website', status: 'new',
    followUpDate: null, createdAt: daysAgo(5),
    notes: [], activities: [{ type: 'created', description: 'Lead "Ivan Petrov" was created', performedBy: 'Admin', createdAt: daysAgo(5) }],
  },
  {
    name: 'Julia Mendez', email: 'j.mendez@tourismco.es', phone: '+34 91 555-3610',
    company: 'TourismCo Spain', source: 'ads', status: 'new',
    followUpDate: daysAhead(9), createdAt: daysAgo(2),
    notes: [], activities: [{ type: 'created', description: 'Lead "Julia Mendez" was created', performedBy: 'Admin', createdAt: daysAgo(2) }],
  },
  {
    name: 'Kevin Oduya', email: 'k.oduya@nairobi.tech', phone: '+254 70 555-3711',
    company: 'Nairobi Tech Hub', source: 'referral', status: 'new',
    followUpDate: daysAhead(4), createdAt: daysAgo(3),
    notes: [], activities: [{ type: 'created', description: 'Lead "Kevin Oduya" was created', performedBy: 'Admin', createdAt: daysAgo(3) }],
  },
  {
    name: 'Laura Bianchi', email: 'l.bianchi@luxuryfood.it', phone: '+39 02 555-3812',
    company: 'Luxury Food Italia', source: 'cold_call', status: 'new',
    followUpDate: null, createdAt: daysAgo(6),
    notes: [], activities: [{ type: 'created', description: 'Lead "Laura Bianchi" was created', performedBy: 'Admin', createdAt: daysAgo(6) }],
  },
  {
    name: 'Marco Ferreira', email: 'm.ferreira@startupbr.com', phone: '+55 11 555-3913',
    company: 'StartupBR Ventures', source: 'website', status: 'new',
    followUpDate: daysAhead(5), createdAt: daysAgo(1),
    notes: [], activities: [{ type: 'created', description: 'Lead "Marco Ferreira" was created', performedBy: 'Admin', createdAt: daysAgo(1) }],
  },
  {
    name: 'Nina Johansson', email: 'n.johansson@nordicsoft.se', phone: '+46 70 555-4014',
    company: 'Nordic Software AB', source: 'social_media', status: 'new',
    followUpDate: daysAhead(3), createdAt: daysAgo(2),
    notes: [], activities: [{ type: 'created', description: 'Lead "Nina Johansson" was created', performedBy: 'Admin', createdAt: daysAgo(2) }],
  },

  // ── Lost (8) ─────────────────────────────────────────────────────────────────
  {
    name: 'Oscar Fleming', email: 'o.fleming@oldmedia.com', phone: '+1 (312) 555-4101',
    company: 'OldMedia Publishing', source: 'cold_call', status: 'lost',
    followUpDate: null, createdAt: daysAgo(50),
    notes: [{ text: 'Went with competitor. Budget cut.', addedBy: 'Admin', createdAt: daysAgo(40) }],
    activities: [
      { type: 'created',        description: 'Lead "Oscar Fleming" was created',             performedBy: 'Admin', createdAt: daysAgo(50) },
      { type: 'status_updated', description: 'Status changed from "contacted" to "lost"',    performedBy: 'Admin', createdAt: daysAgo(38) },
    ],
  },
  {
    name: 'Paula Simmons', email: 'p.simmons@retailold.com', phone: '+1 (415) 555-4202',
    company: 'RetailOld Inc', source: 'ads', status: 'lost',
    followUpDate: null, createdAt: daysAgo(42),
    notes: [{ text: 'No budget approval from board.', addedBy: 'Sales User', createdAt: daysAgo(35) }],
    activities: [
      { type: 'created',        description: 'Lead "Paula Simmons" was created',             performedBy: 'Sales User', createdAt: daysAgo(42) },
      { type: 'status_updated', description: 'Status changed from "contacted" to "lost"',    performedBy: 'Sales User', createdAt: daysAgo(33) },
    ],
  },
  {
    name: 'Robert Dunn', email: 'r.dunn@smallbiz.com', phone: '+1 (614) 555-4303',
    company: 'SmallBiz Co', source: 'website', status: 'lost',
    followUpDate: null, createdAt: daysAgo(35),
    notes: [{ text: 'Too small for our pricing tier.', addedBy: 'Admin', createdAt: daysAgo(28) }],
    activities: [
      { type: 'created',        description: 'Lead "Robert Dunn" was created',               performedBy: 'Admin', createdAt: daysAgo(35) },
      { type: 'status_updated', description: 'Status changed from "new" to "lost"',          performedBy: 'Admin', createdAt: daysAgo(26) },
    ],
  },
  {
    name: 'Sandra Yip', email: 's.yip@legacysys.com', phone: '+1 (213) 555-4404',
    company: 'Legacy Systems Ltd', source: 'referral', status: 'lost',
    followUpDate: null, createdAt: daysAgo(60),
    notes: [{ text: 'Locked into 5-year contract with competitor.', addedBy: 'Admin', createdAt: daysAgo(50) }],
    activities: [
      { type: 'created',        description: 'Lead "Sandra Yip" was created',                performedBy: 'Admin', createdAt: daysAgo(60) },
      { type: 'status_updated', description: 'Status changed from "contacted" to "lost"',    performedBy: 'Admin', createdAt: daysAgo(48) },
    ],
  },
  {
    name: 'Thomas Holt', email: 't.holt@nonprofit2.org', phone: '+1 (617) 555-4505',
    company: 'Community Nonprofit', source: 'website', status: 'lost',
    followUpDate: null, createdAt: daysAgo(30),
    notes: [{ text: 'Grant funding fell through. Cannot proceed.', addedBy: 'Admin', createdAt: daysAgo(22) }],
    activities: [
      { type: 'created',        description: 'Lead "Thomas Holt" was created',               performedBy: 'Admin', createdAt: daysAgo(30) },
      { type: 'status_updated', description: 'Status changed from "contacted" to "lost"',    performedBy: 'Admin', createdAt: daysAgo(20) },
    ],
  },
  {
    name: 'Uma Krishnan', email: 'u.krishnan@outsource.in', phone: '+91 98 555-4606',
    company: 'Outsource India', source: 'cold_call', status: 'lost',
    followUpDate: null, createdAt: daysAgo(44),
    notes: [{ text: 'Chose a local vendor for cost reasons.', addedBy: 'Sales User', createdAt: daysAgo(36) }],
    activities: [
      { type: 'created',        description: 'Lead "Uma Krishnan" was created',              performedBy: 'Sales User', createdAt: daysAgo(44) },
      { type: 'status_updated', description: 'Status changed from "contacted" to "lost"',    performedBy: 'Sales User', createdAt: daysAgo(34) },
    ],
  },
  {
    name: 'Victor Okonkwo', email: 'v.okonkwo@tradeco.ng', phone: '+234 80 555-4707',
    company: 'TradeCo Nigeria', source: 'ads', status: 'lost',
    followUpDate: null, createdAt: daysAgo(38),
    notes: [{ text: 'Internet connectivity issues. Not viable.', addedBy: 'Admin', createdAt: daysAgo(30) }],
    activities: [
      { type: 'created',        description: 'Lead "Victor Okonkwo" was created',            performedBy: 'Admin', createdAt: daysAgo(38) },
      { type: 'status_updated', description: 'Status changed from "new" to "lost"',          performedBy: 'Admin', createdAt: daysAgo(28) },
    ],
  },
  {
    name: 'Wendy Park', email: 'w.park@startupfail.io', phone: '+1 (415) 555-4808',
    company: 'StartupFail Inc', source: 'social_media', status: 'lost',
    followUpDate: null, createdAt: daysAgo(55),
    notes: [{ text: 'Company shut down. No longer in business.', addedBy: 'Admin', createdAt: daysAgo(45) }],
    activities: [
      { type: 'created',        description: 'Lead "Wendy Park" was created',                performedBy: 'Admin', createdAt: daysAgo(55) },
      { type: 'status_updated', description: 'Status changed from "contacted" to "lost"',    performedBy: 'Admin', createdAt: daysAgo(43) },
    ],
  },
];

// ── Seed runner ───────────────────────────────────────────────────────────────
const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Keep existing 25 leads, just add 48 new ones
    const existing = await Lead.countDocuments({ isDeleted: false });
    console.log(`📊 Existing leads: ${existing}`);

    let inserted = 0;
    for (const d of leads) {
      const lead = new Lead(d);
      lead.calculateScore();
      await lead.save();
      inserted++;
      process.stdout.write(`\r📦 Inserting... ${inserted}/${leads.length}`);
    }

    const total     = await Lead.countDocuments({ isDeleted: false });
    const converted = await Lead.countDocuments({ isDeleted: false, status: 'converted' });
    const contacted = await Lead.countDocuments({ isDeleted: false, status: 'contacted' });
    const newL      = await Lead.countDocuments({ isDeleted: false, status: 'new' });
    const lost      = await Lead.countDocuments({ isDeleted: false, status: 'lost' });
    const overdue   = await Lead.countDocuments({ isDeleted: false, followUpDate: { $lt: new Date() }, status: { $nin: ['converted','lost'] } });

    console.log(`\n\n✅ Inserted ${inserted} new leads`);
    console.log(`📊 Total: ${total} | New: ${newL} | Contacted: ${contacted} | Converted: ${converted} | Lost: ${lost}`);
    console.log(`⚠  Overdue follow-ups: ${overdue}`);
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Error:', err.message);
    process.exit(1);
  }
};

seed();
