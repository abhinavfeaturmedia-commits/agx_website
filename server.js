// ============================================================================
// AGX Node.js Production Server (Express + MySQL)
// Hostinger Deployment Ready for agxperience.com
// ============================================================================
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import dotenv from 'dotenv';
import db, { checkDbConnection, query, execute, getDbStatus } from './server/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Security & CORS Configuration
const allowedOrigins = [
  'https://agxperience.com',
  'https://www.agxperience.com',
  'https://agxperience.netlify.app',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server, mobile or curl (no origin) or allowed origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}));

// HTTP Security Headers (Defense in Depth)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Request logging in development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// ----------------------------------------------------------------------------
// Cryptographic JWT & Password Verification Helpers
// ----------------------------------------------------------------------------
const JWT_SECRET = process.env.JWT_SECRET || 'agx_super_secure_jwt_random_key_replace_this_with_random_string';

function base64UrlEncode(str) {
  return Buffer.from(str).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function base64UrlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return Buffer.from(str, 'base64').toString('utf8');
}

function signJwt(payload, expiresInSeconds = 7 * 24 * 3600) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const fullPayload = { ...payload, exp, iat: Math.floor(Date.now() / 1000) };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

function verifyJwt(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [encodedHeader, encodedPayload, signature] = parts;

  const expectedSig = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  try {
    const bufA = Buffer.from(signature);
    const bufB = Buffer.from(expectedSig);
    if (bufA.length !== bufB.length || !crypto.timingSafeEqual(bufA, bufB)) {
      return null;
    }
    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch (_) {
    return null;
  }
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `pbkdf2:100000:${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  if (!storedHash || !password) return false;
  if (storedHash.startsWith('pbkdf2:')) {
    const parts = storedHash.split(':');
    if (parts.length === 4) {
      const iterations = parseInt(parts[1], 10);
      const salt = parts[2];
      const originalHash = parts[3];
      const checkHash = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512').toString('hex');
      const bufA = Buffer.from(originalHash);
      const bufB = Buffer.from(checkHash);
      return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
    }
  }
  // Safe comparison if legacy plaintext comparison during migration
  const bufA = Buffer.from(password);
  const bufB = Buffer.from(storedHash);
  if (bufA.length === bufB.length) {
    return crypto.timingSafeEqual(bufA, bufB);
  }
  return false;
}

// ----------------------------------------------------------------------------
// Authentication Middleware for Protected Staff & CRM Endpoints
// ----------------------------------------------------------------------------
const authenticateStaff = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Staff authentication required' });
  }

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  const user = verifyJwt(token);
  if (!user) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Invalid or expired staff session' });
  }

  req.user = user;
  next();
};

// ----------------------------------------------------------------------------
// Health & Diagnostic Endpoints
// ----------------------------------------------------------------------------
app.get('/api/health', async (req, res) => {
  const dbHealth = await checkDbConnection();
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'production',
    database: dbHealth,
    memoryUsage: process.memoryUsage()
  });
});

app.get('/api/db-status', authenticateStaff, (req, res) => {
  res.json(getDbStatus());
});

// ----------------------------------------------------------------------------
// Authentication API Endpoints
// ----------------------------------------------------------------------------
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required' });
  }

  try {
    const trimmedEmail = email.trim().toLowerCase();
    const rows = await query('SELECT * FROM profiles WHERE LOWER(email) = ? AND deleted_at IS NULL LIMIT 1', [trimmedEmail]);
    if (!rows || rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const user = rows[0];
    if (user.is_active === 0 || user.is_active === false) {
      return res.status(403).json({ success: false, error: 'Account is deactivated. Contact Super Admin.' });
    }

    if (user.password_hash) {
      const isValid = verifyPassword(password, user.password_hash);
      if (!isValid) {
        return res.status(401).json({ success: false, error: 'Invalid email or password' });
      }
    } else {
      // First-time setup for seeded user: automatically upgrade to PBKDF2 hash
      const newHash = hashPassword(password);
      await execute('UPDATE profiles SET password_hash = ? WHERE id = ?', [newHash, user.id]);
    }

    const permissions = typeof user.permissions === 'string' ? JSON.parse(user.permissions) : (user.permissions || {});
    const token = signJwt({ id: user.id, email: user.email, role: user.role });

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        avatarUrl: user.avatar_url,
        department: user.department,
        permissions
      },
      token
    });
  } catch (err) {
    console.error('[Auth Error]', err.message);
    res.status(500).json({ success: false, error: 'Authentication service error' });
  }
});

// ----------------------------------------------------------------------------
// Generic Helper for CRM Table CRUD
// ----------------------------------------------------------------------------
// Enforce staff authentication on all CRM endpoints
app.use('/api/crm', authenticateStaff);

const registerCrudRoutes = (moduleName, tableName, idPrefix = '') => {
  // GET all records (excluding soft-deleted)
  app.get(`/api/crm/${moduleName}`, async (req, res) => {
    try {
      const rows = await query(`SELECT * FROM \`${tableName}\` WHERE deleted_at IS NULL ORDER BY created_at DESC`);
      // Parse JSON fields safely if any exist
      const parsed = rows.map(r => {
        const item = { ...r };
        for (const [key, val] of Object.entries(item)) {
          if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
            try { item[key] = JSON.parse(val); } catch (_) {}
          }
        }
        return item;
      });
      res.json({ success: true, count: parsed.length, data: parsed });
    } catch (err) {
      console.warn(`[CRM ${moduleName} GET] Warning:`, err.message);
      // Fallback empty array so frontend UI remains functional
      res.json({ success: true, count: 0, data: [], notice: 'Database not initialized or query deferred' });
    }
  });

  // POST create record
  app.post(`/api/crm/${moduleName}`, async (req, res) => {
    try {
      const data = { ...req.body };
      if (!data.id) {
        data.id = crypto.randomUUID ? crypto.randomUUID() : (idPrefix + crypto.randomBytes(12).toString('hex'));
      }

      // Sanitize columns: strictly allow letters, digits, and underscores
      const sanitizedData = {};
      for (const [key, val] of Object.entries(data)) {
        if (/^[a-zA-Z0-9_]+$/.test(key)) {
          if (typeof val === 'object' && val !== null) {
            sanitizedData[key] = JSON.stringify(val);
          } else {
            sanitizedData[key] = val;
          }
        }
      }

      const keys = Object.keys(sanitizedData).map(k => `\`${k}\``).join(', ');
      const placeholders = Object.keys(sanitizedData).map(() => '?').join(', ');
      const values = Object.values(sanitizedData);

      await execute(`INSERT INTO \`${tableName}\` (${keys}) VALUES (${placeholders})`, values);
      res.status(201).json({ success: true, id: data.id, data: req.body });
    } catch (err) {
      console.error(`[CRM ${moduleName} POST] Error:`, err.message);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // PUT update record
  app.put(`/api/crm/${moduleName}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const data = { ...req.body };
      delete data.id;

      // Sanitize columns: strictly allow letters, digits, and underscores
      const sanitizedData = {};
      for (const [key, val] of Object.entries(data)) {
        if (/^[a-zA-Z0-9_]+$/.test(key)) {
          if (typeof val === 'object' && val !== null) {
            sanitizedData[key] = JSON.stringify(val);
          } else {
            sanitizedData[key] = val;
          }
        }
      }

      const assignments = Object.keys(sanitizedData).map(k => `\`${k}\` = ?`).join(', ');
      const values = [...Object.values(sanitizedData), id];

      await execute(`UPDATE \`${tableName}\` SET ${assignments} WHERE id = ?`, values);
      res.json({ success: true, id, data: req.body });
    } catch (err) {
      console.error(`[CRM ${moduleName} PUT] Error:`, err.message);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // DELETE soft-delete record
  app.delete(`/api/crm/${moduleName}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      await execute(`UPDATE \`${tableName}\` SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?`, [id]);
      res.json({ success: true, id, message: 'Record soft-deleted' });
    } catch (err) {
      console.error(`[CRM ${moduleName} DELETE] Error:`, err.message);
      res.status(500).json({ success: false, error: err.message });
    }
  });
};

// Register CRM CRUD modules (All 21 MySQL tables)
registerCrudRoutes('leads', 'leads');
registerCrudRoutes('clients', 'clients');
registerCrudRoutes('projects', 'projects');
registerCrudRoutes('tasks', 'tasks');
registerCrudRoutes('invoices', 'invoices');
registerCrudRoutes('quotations', 'quotations');
registerCrudRoutes('payments', 'payments');
registerCrudRoutes('expenses', 'expenses');
registerCrudRoutes('agreements', 'agreements');
registerCrudRoutes('documents', 'documents');
registerCrudRoutes('credentials', 'credentials_vault');
registerCrudRoutes('partners', 'partners');
registerCrudRoutes('partner-referrals', 'partner_referrals');
registerCrudRoutes('partner-payouts', 'partner_payouts');
registerCrudRoutes('issues', 'project_issues');
registerCrudRoutes('events', 'calendar_events');
registerCrudRoutes('notifications', 'notifications');
registerCrudRoutes('audit-logs', 'audit_logs');
registerCrudRoutes('milestones', 'project_milestones');
registerCrudRoutes('lead-activities', 'lead_activities');
registerCrudRoutes('profiles', 'profiles');

// ----------------------------------------------------------------------------
// Bulk CRM Bootstrap Endpoint (/api/crm/all)
// Instant hydration of entire CRM state in a single fast query
// ----------------------------------------------------------------------------
app.get('/api/crm/all', async (req, res) => {
  try {
    const fetchTable = async (table, orderCol = 'created_at', asc = false) => {
      try {
        const rows = await query(`SELECT * FROM \`${table}\` WHERE deleted_at IS NULL ORDER BY \`${orderCol}\` ${asc ? 'ASC' : 'DESC'}`);
        return (rows || []).map(r => {
          const item = { ...r };
          for (const [key, val] of Object.entries(item)) {
            if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
              try { item[key] = JSON.parse(val); } catch (_) {}
            }
          }
          return item;
        });
      } catch (err) {
        return [];
      }
    };

    const [
      profiles, leads, leadActivities, clients, projects, milestones, tasks,
      invoices, payments, expenses, agreements, documents, credentials,
      events, notifications, auditLogs, issues, partners, partnerReferrals,
      partnerPayouts, quotations
    ] = await Promise.all([
      fetchTable('profiles', 'created_at', true),
      fetchTable('leads'),
      fetchTable('lead_activities'),
      fetchTable('clients'),
      fetchTable('projects'),
      fetchTable('project_milestones', 'created_at', true),
      fetchTable('tasks'),
      fetchTable('invoices'),
      fetchTable('payments'),
      fetchTable('expenses'),
      fetchTable('agreements'),
      fetchTable('documents'),
      fetchTable('credentials_vault'),
      fetchTable('calendar_events', 'start_time', true),
      fetchTable('notifications'),
      fetchTable('audit_logs'),
      fetchTable('project_issues'),
      fetchTable('partners'),
      fetchTable('partner_referrals'),
      fetchTable('partner_payouts'),
      fetchTable('quotations')
    ]);

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        profiles,
        leads,
        leadActivities,
        clients,
        projects,
        milestones,
        tasks,
        invoices,
        payments,
        expenses,
        agreements,
        documents,
        credentials,
        events,
        notifications,
        auditLogs,
        issues,
        partners,
        partnerReferrals,
        partnerPayouts,
        quotations
      }
    });
  } catch (err) {
    console.error('[CRM ALL] Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------------------------------
// Inbound Website Lead Submission (/api/leads)
// ----------------------------------------------------------------------------
app.post('/api/leads', async (req, res) => {
  try {
    const data = { ...req.body };
    if (!data.id) {
      data.id = crypto.randomUUID ? crypto.randomUUID() : ('lead_' + crypto.randomBytes(8).toString('hex'));
    }
    if (!data.name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const leadRecord = {
      id: data.id,
      name: data.name,
      company: data.company || null,
      phone: data.phone || null,
      email: data.email || null,
      whatsapp: data.whatsapp || null,
      location: data.location || null,
      interested_service: data.interestedService || data.interested_service || 'AI Automation',
      estimated_deal_value: Number(data.estimatedDealValue || data.estimated_deal_value) || 0,
      probability: Number(data.probability) || 50,
      source: data.source || 'Website',
      assigned_to: data.assignedTo || data.assigned_to || null,
      priority: data.priority || 'Medium',
      status: data.status || 'NEW',
      notes: data.notes || null
    };

    const keys = Object.keys(leadRecord).map(k => `\`${k}\``).join(', ');
    const placeholders = Object.keys(leadRecord).map(() => '?').join(', ');
    const values = Object.values(leadRecord);

    await execute(`INSERT INTO \`leads\` (${keys}) VALUES (${placeholders})`, values);
    res.status(201).json({ success: true, id: data.id, lead: leadRecord });
  } catch (err) {
    console.error('[Inbound Lead POST] Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------------------------------
// CRM Dashboard Analytics Summary Endpoint
// ----------------------------------------------------------------------------
app.get('/api/crm/stats', async (req, res) => {
  try {
    const [leadsCount] = await query('SELECT COUNT(*) as count FROM leads WHERE deleted_at IS NULL');
    const [clientsCount] = await query('SELECT COUNT(*) as count FROM clients WHERE deleted_at IS NULL');
    const [projectsCount] = await query('SELECT COUNT(*) as count FROM projects WHERE deleted_at IS NULL');
    const [invoicesSum] = await query('SELECT COALESCE(SUM(total), 0) as totalRevenue, COALESCE(SUM(paid_amount), 0) as totalCollected FROM invoices WHERE deleted_at IS NULL');

    res.json({
      success: true,
      stats: {
        totalLeads: leadsCount ? leadsCount.count : 0,
        totalClients: clientsCount ? clientsCount.count : 0,
        activeProjects: projectsCount ? projectsCount.count : 0,
        totalRevenue: invoicesSum ? Number(invoicesSum.totalRevenue) : 0,
        totalCollected: invoicesSum ? Number(invoicesSum.totalCollected) : 0
      }
    });
  } catch (err) {
    res.json({
      success: true,
      stats: {
        totalLeads: 0,
        totalClients: 0,
        activeProjects: 0,
        totalRevenue: 0,
        totalCollected: 0
      },
      fallback: true
    });
  }
});

// ----------------------------------------------------------------------------
// Static Assets & Single-Page Application (SPA) Fallback
// ----------------------------------------------------------------------------
const distPath = path.resolve(__dirname, 'dist');
const publicPath = path.resolve(__dirname, 'public');

if (fs.existsSync(distPath)) {
  // Serve production build files
  app.use(express.static(distPath, {
    maxAge: '1d',
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache');
      }
    }
  }));

  // Route all remaining requests to index.html for React Router / SPA navigation
  app.use((req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // Fallback info page if build has not been generated yet
  app.use((req, res) => {
    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>AGX Node.js Server Active</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #07090E; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
          .card { background: #121620; border: 1px solid #1E2536; border-radius: 16px; padding: 40px; max-width: 520px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
          h1 { color: #CCFF00; margin-top: 0; font-size: 26px; }
          p { color: #94A3B8; font-size: 15px; line-height: 1.6; }
          .badge { display: inline-block; background: rgba(204,255,0,0.1); color: #CCFF00; border: 1px solid rgba(204,255,0,0.3); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 16px; }
          code { background: #07090E; padding: 2px 6px; border-radius: 4px; color: #E2E8F0; font-family: monospace; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="badge">HOSTINGER DEPLOYMENT READY</div>
          <h1>AGX Server is Running</h1>
          <p>The Node.js Express server is active on <code>agxperience.com</code>.</p>
          <p>To view the full React frontend, build and deploy the frontend assets by running <code>npm run build</code> or uploading the <code>dist/</code> folder.</p>
          <p><a href="/api/health" style="color: #CCFF00; text-decoration: none; font-weight: 600;">Check API Health & Database Status &rarr;</a></p>
        </div>
      </body>
      </html>
    `);
  });
}

// Start Server
app.listen(PORT, HOST, () => {
  console.log(`====================================================`);
  console.log(`🚀 AGX Node.js Server running on http://${HOST}:${PORT}`);
  console.log(`📡 Health Check: http://${HOST}:${PORT}/api/health`);
  console.log(`🌍 Target Domain: agxperience.com`);
  console.log(`====================================================`);
});
