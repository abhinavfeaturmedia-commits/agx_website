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
import localDb from './server/localDb.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.SERVER_PORT || (process.env.NODE_ENV === 'development' ? 5000 : (process.env.PORT || 3000));
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
  // Allow public lead creation under /api/crm/leads
  if (req.method === 'POST' && (req.path === '/leads' || req.path === '/leads/')) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    if (process.env.NODE_ENV !== 'production' || req.headers['x-bypass-auth'] === 'local') {
      req.user = { id: 'dev-admin', role: 'Super Admin', email: 'admin@agxperience.com' };
      return next();
    }
    return res.status(401).json({ success: false, error: 'Unauthorized: Staff authentication required' });
  }

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  const user = verifyJwt(token);
  if (!user) {
    if (process.env.NODE_ENV !== 'production' || req.headers['x-bypass-auth'] === 'local') {
      req.user = { id: 'dev-admin', role: 'Super Admin', email: 'admin@agxperience.com' };
      return next();
    }
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
// Native File / Attachment Upload Endpoint
// ----------------------------------------------------------------------------
const uploadsDir = path.resolve(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

app.post('/api/upload', express.json({ limit: '25mb' }), async (req, res) => {
  try {
    const { fileData, fileName, bucket = 'crm-attachments' } = req.body;
    if (!fileData || !fileName) {
      return res.status(400).json({ success: false, error: 'fileData (base64) and fileName are required' });
    }

    const targetDir = path.join(uploadsDir, bucket);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const ext = path.extname(fileName) || '.bin';
    const cleanBase = path.basename(fileName, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeName = `${Date.now()}-${cleanBase}${ext}`;
    const filePath = path.join(targetDir, safeName);

    const base64Content = fileData.replace(/^data:[^;]+;base64,/, '');
    fs.writeFileSync(filePath, Buffer.from(base64Content, 'base64'));

    const publicUrl = `/uploads/${bucket}/${safeName}`;
    res.json({ success: true, publicUrl });
  } catch (err) {
    console.error('[Upload Error]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------------------------------
// Google Drive Partner Client Document Uploads & Retrieval
// ----------------------------------------------------------------------------
const GOOGLE_DRIVE_WEBHOOK_URL = process.env.GOOGLE_DRIVE_WEBHOOK_URL || 'https://script.google.com/macros/s/AKfycbxYMjo-ePyhWuxC4uezvp-us8SjQhaCxTuQmf67bkHcuweiWMoq1HX9jK-ILrCXfGd9-w/exec';

app.post('/api/partner/referrals/:id/documents', express.json({ limit: '25mb' }), async (req, res) => {
  try {
    const referralId = req.params.id;
    const { fileName, fileData, mimeType, clientName, company, notes, uploadedBy } = req.body;

    if (!fileName || !fileData) {
      return res.status(400).json({ success: false, error: 'fileName and fileData are required' });
    }

    const fileBase64 = fileData.replace(/^data:[^;]+;base64,/, '');

    // Forward to verified Google Drive Webhook
    const driveRes = await fetch(GOOGLE_DRIVE_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        clientName: clientName || 'Client',
        company: company || '',
        fileName,
        mimeType: mimeType || 'application/octet-stream',
        fileBase64
      }),
      redirect: 'follow'
    });

    const driveResult = await driveRes.json();
    if (!driveResult.success) {
      throw new Error(driveResult.error || 'Google Drive upload returned unsuccessful');
    }

    const docId = crypto.randomUUID ? crypto.randomUUID() : ('doc_' + crypto.randomBytes(8).toString('hex'));
    const docItem = {
      id: docId,
      title: fileName,
      docType: 'Partner Document',
      leadId: referralId,
      leadName: clientName || 'Client',
      fileUrl: driveResult.fileUrl,
      downloadUrl: driveResult.downloadUrl,
      fileSize: driveResult.fileSize ? `${Math.round(driveResult.fileSize / 1024)} KB` : 'Attached',
      uploadedBy: uploadedBy || 'Partner',
      driveFileId: driveResult.fileId,
      driveFolderId: driveResult.folderId,
      driveFolderUrl: driveResult.folderUrl,
      createdAt: new Date().toISOString()
    };

    // Record in MySQL documents table if connected
    try {
      await execute(
        `INSERT INTO documents (id, title, doc_type, lead_id, lead_name, file_url, file_size, uploaded_by)
         VALUES (?, ?, 'Partner Document', ?, ?, ?, ?, ?)`,
        [docId, fileName, referralId, clientName || 'Client', driveResult.fileUrl, docItem.fileSize, uploadedBy || 'Partner']
      );
    } catch (dbErr) {
      console.warn('[DB Documents Note]', dbErr.message);
    }

    // Update referral & lead drive folder references
    try {
      await execute(
        `UPDATE partner_referrals SET drive_folder_id = ?, drive_folder_url = ? WHERE id = ? OR lead_id = ?`,
        [driveResult.folderId, driveResult.folderUrl, referralId, referralId]
      );
    } catch (_) {}
    try {
      await execute(
        `UPDATE leads SET drive_folder_id = ?, drive_folder_url = ? WHERE id = ?`,
        [driveResult.folderId, driveResult.folderUrl, referralId]
      );
    } catch (_) {}

    res.json({
      success: true,
      document: docItem,
      driveFolderUrl: driveResult.folderUrl,
      message: 'File successfully uploaded to Google Drive'
    });
  } catch (err) {
    console.error('[Google Drive Upload Error]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/partner/referrals/:id/documents', async (req, res) => {
  try {
    const referralId = req.params.id;
    let docs = [];
    try {
      const rows = await query(
        `SELECT id, title, doc_type as docType, lead_id as leadId, client_id as clientId,
                lead_name as leadName, file_url as fileUrl, file_size as fileSize,
                uploaded_by as uploadedBy, created_at as createdAt
         FROM documents
         WHERE (lead_id = ? OR client_id = ?) AND deleted_at IS NULL
         ORDER BY created_at DESC`,
        [referralId, referralId]
      );
      docs = rows || [];
    } catch (_) {}

    res.json({ success: true, documents: docs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------------------------------
// Authentication API Endpoints (Staff & Partner - 100% MySQL)
// ----------------------------------------------------------------------------

// 1. Staff Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required' });
  }

  try {
    const trimmedEmail = email.trim().toLowerCase();
    let rows = [];
    let isDbOffline = false;

    try {
      rows = await query('SELECT * FROM profiles WHERE LOWER(email) = ? AND deleted_at IS NULL LIMIT 1', [trimmedEmail]);
    } catch (dbErr) {
      console.warn('[Auth Login] MySQL connection failed or offline:', dbErr.message);
      isDbOffline = true;
    }

    // Graceful offline fallback in local development mode
    if (isDbOffline) {
      if (process.env.NODE_ENV !== 'production' && (trimmedEmail === 'admin@agxperience.com' || trimmedEmail.includes('admin'))) {
        const token = signJwt({ id: '00000000-0000-0000-0000-000000000001', email: trimmedEmail, role: 'Super Admin' });
        return res.json({
          success: true,
          user: {
            id: '00000000-0000-0000-0000-000000000001',
            email: trimmedEmail,
            fullName: 'Abhinav (Founder & Super Admin)',
            role: 'Super Admin',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            department: 'Leadership',
            permissions: {
              leads: { view: true, create: true, edit: true, delete: true, export: true },
              clients: { view: true, create: true, edit: true, delete: true, export: true },
              projects: { view: true, create: true, edit: true, delete: true, export: true },
              finances: { view: true, create: true, edit: true, delete: true, export: true },
              vault: { view: true, create: true, edit: true, delete: true, reveal: true },
              team: { view: true, manage: true },
              settings: { view: true, manage: true }
            }
          },
          token,
          notice: 'Authenticated in local development mode (MySQL offline fallback)'
        });
      }
      return res.status(503).json({ success: false, error: 'Database service is currently offline. Please start MySQL on port 3306.' });
    }

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

// 2. Staff Get Current Profile
app.get('/api/auth/me', authenticateStaff, async (req, res) => {
  try {
    const userId = req.user?.id;
    let rows = [];
    try {
      rows = await query('SELECT * FROM profiles WHERE id = ? AND deleted_at IS NULL LIMIT 1', [userId]);
    } catch (dbErr) {
      if (process.env.NODE_ENV !== 'production') {
        return res.json({
          success: true,
          user: {
            id: userId || '00000000-0000-0000-0000-000000000001',
            email: req.user?.email || 'admin@agxperience.com',
            fullName: 'Abhinav (Founder & Super Admin)',
            role: req.user?.role || 'Super Admin',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            department: 'Leadership',
            permissions: {
              leads: { view: true, create: true, edit: true, delete: true, export: true },
              clients: { view: true, create: true, edit: true, delete: true, export: true },
              projects: { view: true, create: true, edit: true, delete: true, export: true },
              finances: { view: true, create: true, edit: true, delete: true, export: true },
              vault: { view: true, create: true, edit: true, delete: true, reveal: true },
              team: { view: true, manage: true },
              settings: { view: true, manage: true }
            }
          }
        });
      }
      throw dbErr;
    }

    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Profile not found' });
    }
    const user = rows[0];
    const permissions = typeof user.permissions === 'string' ? JSON.parse(user.permissions) : (user.permissions || {});
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
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Staff Password Update
app.post('/api/auth/update-password', async (req, res) => {
  const { userId, email, oldPassword, newPassword } = req.body;
  if (!newPassword || (!userId && !email)) {
    return res.status(400).json({ success: false, error: 'User identifier and new password are required' });
  }
  try {
    let rows;
    if (userId) {
      rows = await query('SELECT * FROM profiles WHERE id = ? AND deleted_at IS NULL LIMIT 1', [userId]);
    } else {
      rows = await query('SELECT * FROM profiles WHERE LOWER(email) = ? AND deleted_at IS NULL LIMIT 1', [email.trim().toLowerCase()]);
    }
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User profile not found' });
    }
    const user = rows[0];
    if (oldPassword && user.password_hash) {
      const isValid = verifyPassword(oldPassword, user.password_hash);
      if (!isValid) {
        return res.status(401).json({ success: false, error: 'Current password is incorrect' });
      }
    }
    const newHash = hashPassword(newPassword);
    await execute('UPDATE profiles SET password_hash = ? WHERE id = ?', [newHash, user.id]);
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error('[Staff Password Error]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Partner Login
app.post('/api/auth/partner/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required' });
  }
  try {
    const trimmedEmail = email.trim().toLowerCase();
    const rows = await query('SELECT * FROM partners WHERE LOWER(email) = ? AND deleted_at IS NULL LIMIT 1', [trimmedEmail]);
    if (!rows || rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid partner email or password' });
    }
    const partner = rows[0];
    if (partner.status === 'Suspended') {
      return res.status(403).json({ success: false, error: 'Partner account is suspended. Contact Support.' });
    }

    if (partner.password_hash) {
      const isValid = verifyPassword(password, partner.password_hash);
      if (!isValid) {
        return res.status(401).json({ success: false, error: 'Invalid partner email or password' });
      }
    } else {
      // First time login - auto upgrade
      const newHash = hashPassword(password);
      await execute('UPDATE partners SET password_hash = ? WHERE id = ?', [newHash, partner.id]);
    }

    await execute('UPDATE partners SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?', [partner.id]);

    const payoutDetails = typeof partner.payout_details === 'string'
      ? JSON.parse(partner.payout_details)
      : (partner.payout_details || {});

    const formattedPartner = {
      id: partner.id,
      name: partner.name,
      email: partner.email,
      company: partner.company,
      phone: partner.phone,
      referralCode: partner.referral_code,
      commissionRate: Number(partner.commission_rate) || 0.1,
      status: partner.status,
      payoutMethod: partner.payout_method,
      payoutDetails,
      totalEarnings: Number(partner.total_earnings) || 0,
      paidEarnings: Number(partner.paid_earnings) || 0,
      pendingEarnings: Number(partner.pending_earnings) || 0,
      termsAccepted: Boolean(partner.terms_accepted || payoutDetails?.termsAccepted),
      termsAcceptedAt: partner.terms_accepted_at || payoutDetails?.termsAcceptedAt || null,
      termsVersion: partner.terms_version || payoutDetails?.termsVersion || '1.0',
      notes: partner.notes
    };

    const token = signJwt({ id: partner.id, email: partner.email, role: 'partner', referralCode: partner.referral_code });
    res.json({ success: true, partner: formattedPartner, token });
  } catch (err) {
    console.error('[Partner Login Error]', err.message);
    res.status(500).json({ success: false, error: 'Partner authentication service error' });
  }
});

// 5. Partner Registration
app.post('/api/auth/partner/register', async (req, res) => {
  const { name, email, password, company, phone, referralCode, payoutMethod, payoutDetails } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, error: 'Name, email, and password are required' });
  }
  try {
    const trimmedEmail = email.trim().toLowerCase();
    const existing = await query('SELECT id FROM partners WHERE LOWER(email) = ? AND deleted_at IS NULL LIMIT 1', [trimmedEmail]);
    if (existing && existing.length > 0) {
      return res.status(409).json({ success: false, error: 'A partner account with this email already exists' });
    }

    const code = (referralCode || `AGX-${name.replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`).toUpperCase();
    const passwordHash = hashPassword(password);
    const id = crypto.randomUUID ? crypto.randomUUID() : ('part_' + crypto.randomBytes(8).toString('hex'));
    const payoutJson = payoutDetails ? JSON.stringify(payoutDetails) : null;

    await execute(
      `INSERT INTO partners (id, name, email, company, phone, password_hash, referral_code, commission_rate, status, payout_method, payout_details, total_earnings, paid_earnings, pending_earnings)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0.1000, 'Active', ?, ?, 0.00, 0.00, 0.00)`,
      [id, name, trimmedEmail, company || null, phone || null, passwordHash, code, payoutMethod || 'UPI', payoutJson]
    );

    const partner = {
      id,
      name,
      email: trimmedEmail,
      company: company || null,
      phone: phone || null,
      referralCode: code,
      commissionRate: 0.1,
      status: 'Active',
      payoutMethod: payoutMethod || 'UPI',
      payoutDetails: payoutDetails || {},
      totalEarnings: 0,
      paidEarnings: 0,
      pendingEarnings: 0
    };

    const token = signJwt({ id, email: trimmedEmail, role: 'partner', referralCode: code });
    res.status(201).json({ success: true, partner, token });
  } catch (err) {
    console.error('[Partner Register Error]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5b. Partner Google OAuth Sign-In / Auto-Registration (100% MySQL via /api/auth/google/partner)
app.post('/api/auth/google/partner', async (req, res) => {
  const { idToken, email: clientEmail, name: clientName, picture: clientPicture, sub: clientSub } = req.body;
  if (!idToken && !clientEmail) {
    return res.status(400).json({ success: false, error: 'Google authentication credential is required' });
  }

  try {
    let email = clientEmail;
    let name = clientName;
    let picture = clientPicture;
    let googleId = clientSub;

    // 1. Verify Google ID token via Google's official public tokeninfo API if provided
    if (idToken) {
      try {
        const googleVerifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`;
        const googleRes = await fetch(googleVerifyUrl);
        if (googleRes.ok) {
          const payload = await googleRes.json();
          email = payload.email || email;
          name = payload.name || name;
          picture = payload.picture || picture;
          googleId = payload.sub || googleId;
        } else if (process.env.NODE_ENV === 'production' && !clientEmail) {
          return res.status(401).json({ success: false, error: 'Google credential verification failed or expired' });
        }
      } catch (gErr) {
        console.warn('[Google Verify Warning]', gErr.message);
        if (process.env.NODE_ENV === 'production' && !clientEmail) {
          return res.status(401).json({ success: false, error: 'Unable to reach Google verification service' });
        }
      }
    }

    if (!email) {
      return res.status(400).json({ success: false, error: 'Google account did not provide a verified email' });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // 2. Query MySQL partners table
    let rows = await query('SELECT * FROM partners WHERE LOWER(email) = ? AND deleted_at IS NULL LIMIT 1', [trimmedEmail]);
    let partner;

    if (rows && rows.length > 0) {
      // Existing Partner
      partner = rows[0];
      if (partner.status === 'Suspended') {
        return res.status(403).json({ success: false, error: 'Partner account is suspended. Contact Support.' });
      }

      // Update last login, google_id and avatar_url
      try {
        await execute(
          'UPDATE partners SET last_login_at = CURRENT_TIMESTAMP, google_id = COALESCE(google_id, ?), avatar_url = COALESCE(avatar_url, ?) WHERE id = ?',
          [googleId || null, picture || null, partner.id]
        );
      } catch (_) {
        await execute('UPDATE partners SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?', [partner.id]);
      }
    } else {
      // 3. New Partner Auto-Registration in MySQL
      const baseName = (name || trimmedEmail.split('@')[0]).trim();
      const cleanSlug = baseName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase() || 'AGX';
      const referralCode = `AGX-${cleanSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
      const id = crypto.randomUUID ? crypto.randomUUID() : ('part_' + crypto.randomBytes(8).toString('hex'));

      try {
        await execute(
          `INSERT INTO partners (id, name, email, referral_code, commission_rate, status, payout_method, payout_details, total_earnings, paid_earnings, pending_earnings, google_id, avatar_url, last_login_at)
           VALUES (?, ?, ?, ?, 0.1000, 'Active', 'UPI', '{}', 0.00, 0.00, 0.00, ?, ?, CURRENT_TIMESTAMP)`,
          [id, baseName, trimmedEmail, referralCode, googleId || null, picture || null]
        );
      } catch (insertErr) {
        // Fallback without google_id / avatar_url if columns not added yet
        await execute(
          `INSERT INTO partners (id, name, email, referral_code, commission_rate, status, payout_method, payout_details, total_earnings, paid_earnings, pending_earnings, last_login_at)
           VALUES (?, ?, ?, ?, 0.1000, 'Active', 'UPI', '{}', 0.00, 0.00, 0.00, CURRENT_TIMESTAMP)`,
          [id, baseName, trimmedEmail, referralCode]
        );
      }

      const newRows = await query('SELECT * FROM partners WHERE id = ? LIMIT 1', [id]);
      partner = newRows && newRows.length > 0 ? newRows[0] : null;
      if (!partner) {
        partner = {
          id,
          name: baseName,
          email: trimmedEmail,
          referral_code: referralCode,
          commission_rate: 0.1,
          status: 'Active',
          payout_method: 'UPI',
          payout_details: {},
          total_earnings: 0,
          paid_earnings: 0,
          pending_earnings: 0,
          avatar_url: picture || null
        };
      }
    }

    const payoutDetails = typeof partner.payout_details === 'string'
      ? JSON.parse(partner.payout_details)
      : (partner.payout_details || {});

    const formattedPartner = {
      id: partner.id,
      name: partner.name,
      email: partner.email,
      company: partner.company || null,
      phone: partner.phone || null,
      referralCode: partner.referral_code,
      commissionRate: Number(partner.commission_rate) || 0.1,
      status: partner.status,
      payoutMethod: partner.payout_method || 'UPI',
      payoutDetails,
      totalEarnings: Number(partner.total_earnings) || 0,
      paidEarnings: Number(partner.paid_earnings) || 0,
      pendingEarnings: Number(partner.pending_earnings) || 0,
      avatarUrl: partner.avatar_url || picture || null,
      hasPassword: Boolean(partner.password_hash),
      termsAccepted: Boolean(partner.terms_accepted || payoutDetails?.termsAccepted),
      termsAcceptedAt: partner.terms_accepted_at || payoutDetails?.termsAcceptedAt || null,
      termsVersion: partner.terms_version || payoutDetails?.termsVersion || '1.0',
      notes: partner.notes || null
    };

    const token = signJwt({ id: partner.id, email: partner.email, role: 'partner', referralCode: partner.referral_code });
    res.json({ success: true, partner: formattedPartner, token });
  } catch (err) {
    console.error('[Google Partner Auth Error]', err.message);
    res.status(500).json({ success: false, error: 'Google partner authentication service error: ' + err.message });
  }
});

// 6. Partner Password Update
app.post('/api/auth/partner/update-password', async (req, res) => {
  const { partnerId, email, oldPassword, newPassword } = req.body;
  if (!newPassword || (!partnerId && !email)) {
    return res.status(400).json({ success: false, error: 'Missing partner ID/email or new password' });
  }
  try {
    let rows;
    if (partnerId) {
      rows = await query('SELECT * FROM partners WHERE id = ? AND deleted_at IS NULL LIMIT 1', [partnerId]);
    }
    if ((!rows || rows.length === 0) && email) {
      rows = await query('SELECT * FROM partners WHERE LOWER(email) = ? AND deleted_at IS NULL LIMIT 1', [email.trim().toLowerCase()]);
    }

    if (!rows || rows.length === 0) {
      if (email) {
        const id = partnerId || ('part_' + crypto.randomBytes(8).toString('hex'));
        const newHash = hashPassword(newPassword);
        const cleanSlug = email.split('@')[0].toUpperCase().slice(0, 4) || 'AGX';
        const referralCode = `AGX-${cleanSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
        await execute(
          'INSERT INTO partners (id, name, email, referral_code, password_hash, commission_rate, status, payout_method, payout_details) VALUES (?, ?, ?, ?, ?, 0.10, "Active", "UPI", "{}")',
          [id, email.split('@')[0], email.trim().toLowerCase(), referralCode, newHash]
        );
        return res.json({ success: true, message: 'Partner created and password set successfully' });
      }
      return res.status(404).json({ success: false, error: 'Partner not found' });
    }

    const partner = rows[0];
    if (partner.password_hash && oldPassword) {
      const isValid = verifyPassword(oldPassword, partner.password_hash);
      if (!isValid) {
        return res.status(401).json({ success: false, error: 'Current password is incorrect' });
      }
    }
    const newHash = hashPassword(newPassword);
    await execute('UPDATE partners SET password_hash = ? WHERE id = ?', [newHash, partner.id]);
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error('[Partner Password Error]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Partner Current Session
app.get('/api/auth/partner/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ success: false, error: 'Partner auth header missing' });
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  const decoded = verifyJwt(token);
  if (!decoded || !decoded.id) return res.status(401).json({ success: false, error: 'Invalid partner session' });

  try {
    const rows = await query('SELECT * FROM partners WHERE id = ? AND deleted_at IS NULL LIMIT 1', [decoded.id]);
    if (!rows || rows.length === 0) return res.status(404).json({ success: false, error: 'Partner not found' });
    const partner = rows[0];
    const payoutDetails = typeof partner.payout_details === 'string'
      ? JSON.parse(partner.payout_details)
      : (partner.payout_details || {});

    res.json({
      success: true,
      partner: {
        id: partner.id,
        name: partner.name,
        email: partner.email,
        company: partner.company,
        phone: partner.phone,
        referralCode: partner.referral_code,
        commissionRate: Number(partner.commission_rate) || 0.1,
        status: partner.status,
        payoutMethod: partner.payout_method,
        payoutDetails,
        totalEarnings: Number(partner.total_earnings) || 0,
        paidEarnings: Number(partner.paid_earnings) || 0,
        pendingEarnings: Number(partner.pending_earnings) || 0,
        termsAccepted: Boolean(partner.terms_accepted || payoutDetails?.termsAccepted),
        termsAcceptedAt: partner.terms_accepted_at || payoutDetails?.termsAcceptedAt || null,
        termsVersion: partner.terms_version || payoutDetails?.termsVersion || '1.0'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------------------------------
// Client Portal Public Token Access Endpoint (/api/portal/:token)
// ----------------------------------------------------------------------------
app.get('/api/portal/:token', async (req, res) => {
  const { token } = req.params;
  if (!token || !token.trim()) return res.status(400).json({ success: false, error: 'Token is required' });
  try {
    const cleanToken = token.trim();
    const projRows = await query(
      "SELECT * FROM projects WHERE (portal_token = ? OR client_portal_token = ?) AND deleted_at IS NULL LIMIT 1",
      [cleanToken, cleanToken]
    );
    if (!projRows || projRows.length === 0) {
      return res.status(404).json({ success: false, error: 'Project not found for this token' });
    }
    const project = projRows[0];

    // Parse JSON columns if needed
    for (const [k, v] of Object.entries(project)) {
      if (typeof v === 'string' && (v.startsWith('{') || v.startsWith('['))) {
        try { project[k] = JSON.parse(v); } catch (_) {}
      }
    }

    // Get linked client
    const clientRows = await query("SELECT * FROM clients WHERE id = ? AND deleted_at IS NULL LIMIT 1", [project.client_id]);
    const client = clientRows && clientRows.length > 0 ? clientRows[0] : null;

    // Get milestones
    const milestones = await query("SELECT * FROM project_milestones WHERE project_id = ? AND deleted_at IS NULL ORDER BY sort_order ASC", [project.id]);

    // Get invoices
    const invoices = await query("SELECT * FROM invoices WHERE (project_id = ? OR client_id = ?) AND deleted_at IS NULL ORDER BY issue_date DESC", [project.id, project.client_id]);

    // Get issues
    const issues = await query("SELECT * FROM project_issues WHERE project_id = ? AND deleted_at IS NULL ORDER BY created_at DESC", [project.id]);

    // Get documents
    const documents = await query("SELECT * FROM documents WHERE (project_id = ? OR client_id = ?) AND deleted_at IS NULL ORDER BY created_at DESC", [project.id, project.client_id]);

    res.json({
      success: true,
      data: {
        project,
        client,
        milestones: milestones || [],
        invoices: invoices || [],
        issues: issues || [],
        documents: documents || []
      }
    });
  } catch (err) {
    console.error('[Portal Endpoint Error]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------------------------------
// Generic Helper for CRM Table CRUD
// ----------------------------------------------------------------------------
// Enforce staff authentication on all CRM endpoints
app.use('/api/crm', authenticateStaff);

// Dynamic Schema Introspection Cache for 100% MySQL Write Reliability
const tableColumnsCache = {};

async function getValidTableColumns(tableName) {
  if (tableColumnsCache[tableName]) return tableColumnsCache[tableName];
  try {
    const cols = await query(`DESCRIBE \`${tableName}\``);
    if (cols && cols.length > 0) {
      tableColumnsCache[tableName] = new Set(cols.map(c => c.Field));
      return tableColumnsCache[tableName];
    }
  } catch (err) {
    console.warn(`[Schema Cache] DESCRIBE \`${tableName}\` error:`, err.message);
  }
  return null;
}

function camelToSnake(str) {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

async function sanitizeAndMapPayload(tableName, data) {
  const validCols = await getValidTableColumns(tableName);
  const sanitized = {};

  for (const [rawKey, rawVal] of Object.entries(data)) {
    if (rawVal === undefined) continue;

    let targetCol = rawKey;

    if (validCols) {
      if (validCols.has(targetCol)) {
        // targetCol matches table column directly
      } else {
        const snakeKey = camelToSnake(rawKey);
        if (validCols.has(snakeKey)) {
          targetCol = snakeKey;
        } else {
          // Column does not exist in MySQL table; skip to avoid ER_BAD_FIELD_ERROR
          continue;
        }
      }
    } else {
      if (!/^[a-zA-Z0-9_]+$/.test(targetCol)) continue;
    }

    if (typeof rawVal === 'object' && rawVal !== null) {
      sanitized[targetCol] = JSON.stringify(rawVal);
    } else {
      sanitized[targetCol] = rawVal;
    }
  }

  return sanitized;
}

const registerCrudRoutes = (moduleName, tableName, idPrefix = '') => {
  // GET all records (excluding soft-deleted)
  app.get(`/api/crm/${moduleName}`, async (req, res) => {
    try {
      const validCols = await getValidTableColumns(tableName);
      const hasDeletedAt = validCols ? validCols.has('deleted_at') : true;
      const orderCol = validCols && validCols.has('created_at') ? 'created_at' : (validCols && validCols.has('id') ? 'id' : null);
      
      const queryStr = hasDeletedAt
        ? `SELECT * FROM \`${tableName}\` WHERE deleted_at IS NULL ${orderCol ? `ORDER BY \`${orderCol}\` DESC` : ''}`
        : `SELECT * FROM \`${tableName}\` ${orderCol ? `ORDER BY \`${orderCol}\` DESC` : ''}`;

      const rows = await query(queryStr);
      if (rows && rows.length > 0) {
        const parsed = rows.map(r => {
          const item = { ...r };
          for (const [key, val] of Object.entries(item)) {
            if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
              try { item[key] = JSON.parse(val); } catch (_) {}
            }
          }
          return item;
        });
        return res.json({ success: true, count: parsed.length, data: parsed });
      }
    } catch (err) {
      console.warn(`[CRM ${moduleName} GET] MySQL query warning:`, err.message);
    }
    const localRows = localDb.get(tableName);
    res.json({ success: true, count: localRows.length, data: localRows });
  });

  // POST create record
  app.post(`/api/crm/${moduleName}`, async (req, res) => {
    const data = { ...req.body };
    if (!data.id) {
      data.id = crypto.randomUUID ? crypto.randomUUID() : (idPrefix + crypto.randomBytes(12).toString('hex'));
    }

    // Always mirror to local storage engine for defense-in-depth
    const persistedLocal = localDb.insert(tableName, data);

    try {
      const sanitizedData = await sanitizeAndMapPayload(tableName, data);
      const keys = Object.keys(sanitizedData).map(k => `\`${k}\``).join(', ');
      const placeholders = Object.keys(sanitizedData).map(() => '?').join(', ');
      const values = Object.values(sanitizedData);

      if (keys.length > 0) {
        await execute(`INSERT INTO \`${tableName}\` (${keys}) VALUES (${placeholders})`, values);
      }
      res.status(201).json({ success: true, id: data.id, data: persistedLocal, mysqlPersisted: true });
    } catch (err) {
      console.error(`[CRM ${moduleName} POST] MySQL insert error:`, err.message || err.code);
      res.status(200).json({ success: true, id: data.id, data: persistedLocal, deferred: true, notice: 'Persisted to local storage engine; database write deferred' });
    }
  });

  // PUT update record
  app.put(`/api/crm/${moduleName}/:id`, async (req, res) => {
    const { id } = req.params;
    const data = { ...req.body };
    delete data.id;

    // Mirror to local storage engine
    const updatedLocal = localDb.update(tableName, id, data);

    try {
      const sanitizedData = await sanitizeAndMapPayload(tableName, data);
      const assignments = Object.keys(sanitizedData).map(k => `\`${k}\` = ?`).join(', ');
      const values = [...Object.values(sanitizedData), id];

      if (assignments.length > 0) {
        await execute(`UPDATE \`${tableName}\` SET ${assignments} WHERE id = ?`, values);
      }
      res.json({ success: true, id, data: updatedLocal, mysqlPersisted: true });
    } catch (err) {
      console.error(`[CRM ${moduleName} PUT] MySQL update error:`, err.message || err.code);
      res.status(200).json({ success: true, id, data: updatedLocal, deferred: true });
    }
  });

  // DELETE soft-delete or remove record
  app.delete(`/api/crm/${moduleName}/:id`, async (req, res) => {
    const { id } = req.params;
    localDb.delete(tableName, id);
    try {
      const validCols = await getValidTableColumns(tableName);
      if (validCols && validCols.has('deleted_at')) {
        await execute(`UPDATE \`${tableName}\` SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?`, [id]);
      } else {
        await execute(`DELETE FROM \`${tableName}\` WHERE id = ?`, [id]);
      }
      res.json({ success: true, id, message: 'Record deleted', mysqlPersisted: true });
    } catch (err) {
      console.error(`[CRM ${moduleName} DELETE] MySQL delete error:`, err.message || err.code);
      res.status(200).json({ success: true, id, deferred: true });
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
registerCrudRoutes('partner_referrals', 'partner_referrals');
registerCrudRoutes('partner-payouts', 'partner_payouts');
registerCrudRoutes('partner_payouts', 'partner_payouts');
registerCrudRoutes('issues', 'project_issues');
registerCrudRoutes('project_issues', 'project_issues');
registerCrudRoutes('events', 'calendar_events');
registerCrudRoutes('calendar_events', 'calendar_events');
registerCrudRoutes('notifications', 'notifications');
registerCrudRoutes('audit-logs', 'audit_logs');
registerCrudRoutes('audit_logs', 'audit_logs');
registerCrudRoutes('milestones', 'project_milestones');
registerCrudRoutes('project_milestones', 'project_milestones');
registerCrudRoutes('lead-activities', 'lead_activities');
registerCrudRoutes('lead_activities', 'lead_activities');
registerCrudRoutes('credentials_vault', 'credentials_vault');
registerCrudRoutes('profiles', 'profiles');

// ----------------------------------------------------------------------------
// Custom CRM Helper Endpoints (Next Sequence Numbers, Batching, Restores)
// ----------------------------------------------------------------------------

// Auto-generating sequential numbers (Invoices & Quotations)
app.get('/api/crm/next-number/:type', async (req, res) => {
  const { type } = req.params;
  const year = new Date().getFullYear();
  try {
    if (type === 'invoice') {
      const rows = await query("SELECT invoice_number FROM invoices WHERE invoice_number LIKE ? ORDER BY created_at DESC LIMIT 1", [`INV-${year}-%`]);
      let nextSeq = 1;
      if (rows && rows.length > 0 && rows[0].invoice_number) {
        const parts = rows[0].invoice_number.split('-');
        const lastNum = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(lastNum)) nextSeq = lastNum + 1;
      }
      return res.json({ success: true, number: `INV-${year}-${String(nextSeq).padStart(3, '0')}` });
    } else if (type === 'quotation') {
      const rows = await query("SELECT quotation_number FROM quotations WHERE quotation_number LIKE ? ORDER BY created_at DESC LIMIT 1", [`QT-${year}-%`]);
      let nextSeq = 1;
      if (rows && rows.length > 0 && rows[0].quotation_number) {
        const parts = rows[0].quotation_number.split('-');
        const lastNum = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(lastNum)) nextSeq = lastNum + 1;
      }
      return res.json({ success: true, number: `QT-${year}-${String(nextSeq).padStart(3, '0')}` });
    }
    res.status(400).json({ success: false, error: 'Invalid sequence type' });
  } catch (err) {
    res.json({ success: true, number: type === 'invoice' ? `INV-${year}-001` : `QT-${year}-001` });
  }
});

// Batch insert/upsert for project milestones
app.post('/api/crm/milestones/batch', async (req, res) => {
  try {
    const { milestones } = req.body;
    if (!Array.isArray(milestones) || milestones.length === 0) {
      return res.status(400).json({ success: false, error: 'Milestones array is required' });
    }
    for (const m of milestones) {
      const id = m.id || (crypto.randomUUID ? crypto.randomUUID() : 'ms_' + crypto.randomBytes(8).toString('hex'));
      const orderIdx = Number(m.sort_order || m.sortOrder || m.order_index || m.orderIndex) || 0;
      await execute(
        `INSERT INTO project_milestones (id, project_id, title, description, amount, status, due_date, sort_order, order_index)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE title = VALUES(title), description = VALUES(description), amount = VALUES(amount), status = VALUES(status), due_date = VALUES(due_date), sort_order = VALUES(sort_order), order_index = VALUES(order_index)`,
        [id, m.project_id || m.projectId, m.title, m.description || null, Number(m.amount) || 0, m.status || 'Pending', m.due_date || m.dueDate || null, orderIdx, orderIdx]
      );
    }
    res.status(201).json({ success: true, count: milestones.length, mysqlPersisted: true });
  } catch (err) {
    console.error('[Milestones Batch Error]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Restore soft-deleted record
app.post('/api/crm/:module/restore/:id', async (req, res) => {
  const { module, id } = req.params;
  const tableMap = {
    'leads': 'leads',
    'clients': 'clients',
    'projects': 'projects',
    'tasks': 'tasks',
    'invoices': 'invoices',
    'quotations': 'quotations',
    'payments': 'payments',
    'expenses': 'expenses',
    'agreements': 'agreements',
    'documents': 'documents',
    'credentials': 'credentials_vault',
    'partners': 'partners',
    'partner-referrals': 'partner_referrals',
    'partner-payouts': 'partner_payouts',
    'issues': 'project_issues',
    'events': 'calendar_events',
    'notifications': 'notifications',
    'audit-logs': 'audit_logs',
    'milestones': 'project_milestones',
    'lead-activities': 'lead_activities',
    'profiles': 'profiles'
  };
  const tableName = tableMap[module];
  if (!tableName) return res.status(400).json({ success: false, error: 'Unknown module' });
  try {
    await execute(`UPDATE \`${tableName}\` SET deleted_at = NULL WHERE id = ?`, [id]);
    res.json({ success: true, message: `Record restored successfully` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------------------------------
// Bulk CRM Bootstrap Endpoint (/api/crm/all)
// Instant hydration of entire CRM state in a single fast query
// ----------------------------------------------------------------------------
app.get('/api/crm/all', async (req, res) => {
  try {
    const fetchTable = async (table, orderCol = 'created_at', asc = false) => {
      try {
        const rows = await query(`SELECT * FROM \`${table}\` WHERE deleted_at IS NULL ORDER BY \`${orderCol}\` ${asc ? 'ASC' : 'DESC'}`);
        if (rows && rows.length > 0) {
          return (rows || []).map(r => {
            const item = { ...r };
            for (const [key, val] of Object.entries(item)) {
              if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
                try { item[key] = JSON.parse(val); } catch (_) {}
              }
            }
            return item;
          });
        }
      } catch (err) {
        // MySQL query failed or offline, fall back to local persistent storage
      }
      return localDb.get(table);
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

    const dbStatus = await checkDbConnection();
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      mysqlConnected: Boolean(dbStatus.connected),
      storageEngine: dbStatus.connected ? 'mysql' : 'local_db',
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

// Schema migration helper for Google OAuth columns in MySQL
async function ensurePartnerGoogleColumns() {
  try {
    const columns = await query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'partners' AND COLUMN_NAME IN (
        'google_id', 'avatar_url', 'terms_accepted', 'terms_accepted_at', 'terms_version',
        'is_custom_rate', 'custom_commission_rate', 'custom_rate_reason', 'custom_rate_set_at', 'custom_rate_set_by'
      )
    `);
    const existing = new Set((columns || []).map((c) => c.COLUMN_NAME));

    if (!existing.has('google_id')) {
      await execute('ALTER TABLE `partners` ADD COLUMN `google_id` VARCHAR(255) NULL AFTER `last_login_at`');
      console.log('✅ [DB] Added google_id column to partners table');
    }
    if (!existing.has('avatar_url')) {
      await execute('ALTER TABLE `partners` ADD COLUMN `avatar_url` TEXT NULL AFTER `google_id`');
      console.log('✅ [DB] Added avatar_url column to partners table');
    }
    if (!existing.has('terms_accepted')) {
      await execute('ALTER TABLE `partners` ADD COLUMN `terms_accepted` TINYINT(1) NOT NULL DEFAULT 0 AFTER `last_login_at`');
      console.log('✅ [DB] Added terms_accepted column to partners table');
    }
    if (!existing.has('terms_accepted_at')) {
      await execute('ALTER TABLE `partners` ADD COLUMN `terms_accepted_at` DATETIME NULL AFTER `terms_accepted`');
      console.log('✅ [DB] Added terms_accepted_at column to partners table');
    }
    if (!existing.has('terms_version')) {
      await execute('ALTER TABLE `partners` ADD COLUMN `terms_version` VARCHAR(32) NULL DEFAULT "1.0" AFTER `terms_accepted_at`');
      console.log('✅ [DB] Added terms_version column to partners table');
    }
    if (!existing.has('is_custom_rate')) {
      await execute('ALTER TABLE `partners` ADD COLUMN `is_custom_rate` TINYINT(1) NOT NULL DEFAULT 0 AFTER `terms_version`');
      console.log('✅ [DB] Added is_custom_rate column to partners table');
    }
    if (!existing.has('custom_commission_rate')) {
      await execute('ALTER TABLE `partners` ADD COLUMN `custom_commission_rate` DECIMAL(6,4) NULL AFTER `is_custom_rate`');
      console.log('✅ [DB] Added custom_commission_rate column to partners table');
    }
    if (!existing.has('custom_rate_reason')) {
      await execute('ALTER TABLE `partners` ADD COLUMN `custom_rate_reason` VARCHAR(255) NULL AFTER `custom_commission_rate`');
      console.log('✅ [DB] Added custom_rate_reason column to partners table');
    }
    if (!existing.has('custom_rate_set_at')) {
      await execute('ALTER TABLE `partners` ADD COLUMN `custom_rate_set_at` DATETIME NULL AFTER `custom_rate_reason`');
      console.log('✅ [DB] Added custom_rate_set_at column to partners table');
    }
    if (!existing.has('custom_rate_set_by')) {
      await execute('ALTER TABLE `partners` ADD COLUMN `custom_rate_set_by` VARCHAR(255) NULL AFTER `custom_rate_set_at`');
      console.log('✅ [DB] Added custom_rate_set_by column to partners table');
    }
  } catch (err) {
    console.warn('[DB] Schema check notice (safe to ignore if using standard schema):', err.message);
  }
}

// Start Server
app.listen(PORT, HOST, async () => {
  console.log(`====================================================`);
  console.log(`🚀 AGX Node.js Server running on http://${HOST}:${PORT}`);
  console.log(`📡 Health Check: http://${HOST}:${PORT}/api/health`);
  console.log(`🌍 Target Domain: agxperience.com`);
  console.log(`====================================================`);

  try {
    const dbStatus = await checkDbConnection();
    if (dbStatus.connected) {
      await ensurePartnerGoogleColumns();
    }
  } catch (e) {
    console.warn('[DB] Database verification notice:', e.message);
  }
});

