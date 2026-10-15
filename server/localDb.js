// ============================================================================
// AGX Resilient Local Persistent Storage Engine (Layer 1)
// Automatically persists CRM tables to disk when MySQL is offline or deferred
// Zero data loss on page refresh, server restarts, or offline development
// ============================================================================
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'local_crm_db.json');

const INITIAL_SEED_DATA = {
  profiles: [
    {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'admin@agxperience.com',
      full_name: 'Abhinav (Founder & Super Admin)',
      role: 'Super Admin',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      department: 'Leadership',
      is_active: 1,
      permissions: {
        dashboard: true, leads: true, clients: true, projects: true,
        tasks: true, issues: true, finance: true, partners: true,
        documents: true, vault: true, calendar: true, analytics: true,
        audit: true, settings: true
      },
      created_at: '2026-08-01 00:00:00'
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      email: 'taylor@agxperience.com',
      full_name: 'Taylor Vance',
      role: 'Sales Manager',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      department: 'Sales & Growth',
      is_active: 1,
      permissions: {
        dashboard: true, leads: true, clients: true, projects: false,
        tasks: true, issues: true, finance: false, partners: true,
        documents: true, vault: false, calendar: true, analytics: true,
        audit: false, settings: false
      },
      created_at: '2026-08-01 00:00:00'
    }
  ],
  leads: [
    {
      id: '10000000-0000-0000-0000-000000000001',
      name: 'Sarah Jenkins',
      company: 'Apex Logistics Inc.',
      phone: '+1 (555) 382-9012',
      email: 'sjenkins@apexlogistics.io',
      whatsapp: '+15553829012',
      location: 'Chicago, USA',
      interested_service: 'AI Customer Support & Dispatch Automation',
      estimated_deal_value: 125000,
      probability: 80,
      source: 'Website',
      assigned_to: 'Taylor Vance',
      priority: 'High',
      status: 'NEGOTIATION',
      notes: 'Needs webhook integration with TMS and WhatsApp alert triggers for fleet drivers.',
      created_at: '2026-08-01 00:00:00',
      updated_at: '2026-08-01 00:00:00'
    },
    {
      id: '10000000-0000-0000-0000-000000000002',
      name: 'Marcus Sterling',
      company: 'Vanguard FinTech Group',
      phone: '+44 20 7946 0912',
      email: 'm.sterling@vanguardft.co.uk',
      whatsapp: '+442079460912',
      location: 'London, UK',
      interested_service: 'Automated Loan Underwriting Agent',
      estimated_deal_value: 240000,
      probability: 60,
      source: 'LinkedIn',
      assigned_to: 'Taylor Vance',
      priority: 'Urgent',
      status: 'PROPOSAL SENT',
      notes: 'Sent enterprise SLA draft and security architecture diagram.',
      created_at: '2026-08-01 00:00:00',
      updated_at: '2026-08-01 00:00:00'
    }
  ],
  clients: [
    {
      id: '20000000-0000-0000-0000-000000000001',
      name: 'Karan Mehta',
      company: 'Shrawello Systems',
      phone: '+91 98450 12345',
      email: 'karan@shrawello.com',
      website: 'https://shrawello.com',
      address: 'Bengaluru, Karnataka, India',
      industry: 'Enterprise E-Commerce',
      gst_tax_id: '29ABCDE1234F1Z5',
      account_manager: 'Abhinav',
      total_value: 250000,
      total_paid: 150000,
      outstanding_amount: 100000,
      source: 'Direct Referral',
      notes: 'Long-term enterprise partner for AI automated search and voice agents.',
      status: 'Active',
      created_at: '2026-08-01 00:00:00',
      updated_at: '2026-08-01 00:00:00'
    }
  ],
  projects: [
    {
      id: '30000000-0000-0000-0000-000000000001',
      name: 'AI Voice Agent & Support Pipeline',
      client_id: '20000000-0000-0000-0000-000000000001',
      client_name: 'Shrawello Systems',
      service_type: 'Custom AI Agent',
      project_manager: 'Michael Andrew',
      assigned_team: ['Natalia Varnan', 'Abhinav'],
      start_date: '2026-08-01',
      due_date: '2026-09-15',
      project_value: 250000,
      received_amount: 150000,
      pending_amount: 100000,
      status: 'IN PROGRESS',
      priority: 'High',
      progress: 65,
      description: 'Deploying ultra-low latency voicebot using LiveKit WebRTC and ElevenLabs with LangChain tool calling.',
      portal_token: 'prj_sec_shrawello_8f9a2b',
      portal_enabled: 1,
      created_at: '2026-08-01 00:00:00',
      updated_at: '2026-08-01 00:00:00'
    }
  ],
  tasks: [],
  invoices: [],
  quotations: [],
  payments: [],
  expenses: [],
  agreements: [],
  documents: [],
  credentials_vault: [],
  partners: [
    {
      id: 'part-00000000-0000-0000-0000-000000000001',
      name: 'Abhinav',
      email: 'abhinav@agxperience.com',
      company: 'AGXperience Partners',
      phone: '+91 98765 43210',
      referral_code: 'AGX-ABHI-2124',
      commission_rate: 0.10,
      status: 'Active',
      payout_method: 'UPI',
      payout_details: {
        upiId: 'abhinav@okhdfcbank',
        notifyOnWhatsApp: true,
        autoPayoutThreshold: 1000
      },
      total_earnings: 0,
      paid_earnings: 0,
      pending_earnings: 0,
      created_at: '2026-08-01 00:00:00',
      updated_at: '2026-08-01 00:00:00'
    }
  ],
  partner_referrals: [],
  partner_payouts: [],
  project_issues: [],
  calendar_events: [],
  notifications: [],
  audit_logs: [],
  project_milestones: [],
  lead_activities: []
};

// Internal in-memory cache
let dbState = null;

function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadDb() {
  if (dbState) return dbState;
  ensureDataDirectory();

  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      dbState = JSON.parse(raw);
      // Ensure all standard tables exist
      for (const table of Object.keys(INITIAL_SEED_DATA)) {
        if (!Array.isArray(dbState[table])) {
          dbState[table] = [...INITIAL_SEED_DATA[table]];
        }
      }
      return dbState;
    } catch (err) {
      console.warn('[LocalDB] Notice: Reading db file failed, initializing seed:', err.message);
    }
  }

  // Create initial database file
  dbState = JSON.parse(JSON.stringify(INITIAL_SEED_DATA));
  saveDb();
  return dbState;
}

function saveDb() {
  try {
    ensureDataDirectory();
    if (!dbState) return;
    fs.writeFileSync(DB_FILE, JSON.stringify(dbState, null, 2), 'utf8');
  } catch (err) {
    console.error('[LocalDB Error] Failed to write local database file:', err.message);
  }
}

// Canonical table name normalization
function normalizeTable(tableName) {
  const map = {
    'partner-referrals': 'partner_referrals',
    'partner-payouts': 'partner_payouts',
    'audit-logs': 'audit_logs',
    'lead-activities': 'lead_activities',
    'credentials': 'credentials_vault',
    'milestones': 'project_milestones',
    'issues': 'project_issues',
    'events': 'calendar_events'
  };
  return map[tableName] || tableName;
}

export const localDb = {
  get(tableName, filterFn = null) {
    const table = normalizeTable(tableName);
    const data = loadDb();
    const rows = data[table] || [];
    const active = rows.filter(r => !r.deleted_at);
    if (filterFn) return active.filter(filterFn);
    return active;
  },

  getById(tableName, id) {
    const table = normalizeTable(tableName);
    const data = loadDb();
    const rows = data[table] || [];
    return rows.find(r => r.id === id && !r.deleted_at) || null;
  },

  insert(tableName, record) {
    const table = normalizeTable(tableName);
    const data = loadDb();
    if (!Array.isArray(data[table])) data[table] = [];

    const now = new Date().toISOString();
    const row = {
      ...record,
      id: record.id || `loc_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      created_at: record.created_at || now,
      updated_at: record.updated_at || now
    };

    // Remove existing if duplicate id
    data[table] = data[table].filter(r => r.id !== row.id);
    data[table].unshift(row);
    saveDb();
    return row;
  },

  update(tableName, id, updates) {
    const table = normalizeTable(tableName);
    const data = loadDb();
    if (!Array.isArray(data[table])) data[table] = [];

    const idx = data[table].findIndex(r => r.id === id);
    const now = new Date().toISOString();
    if (idx !== -1) {
      data[table][idx] = {
        ...data[table][idx],
        ...updates,
        id,
        updated_at: updates.updated_at || now
      };
      saveDb();
      return data[table][idx];
    } else {
      // Record not found, insert it
      const newRow = {
        ...updates,
        id,
        created_at: now,
        updated_at: now
      };
      data[table].unshift(newRow);
      saveDb();
      return newRow;
    }
  },

  delete(tableName, id) {
    const table = normalizeTable(tableName);
    const data = loadDb();
    if (!Array.isArray(data[table])) return false;

    const row = data[table].find(r => r.id === id);
    if (row) {
      row.deleted_at = new Date().toISOString();
      saveDb();
      return true;
    }
    return false;
  },

  getAllData() {
    const data = loadDb();
    const result = {};
    for (const [key, rows] of Object.entries(data)) {
      result[key] = (rows || []).filter(r => !r.deleted_at);
    }
    return result;
  }
};

export default localDb;
