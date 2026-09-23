import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { searchLeads, createLead, updateLead, logLeadActivity } from './tools/leads.js';
import { searchClients, createClient, updateClient } from './tools/clients.js';
import { listProjects, createProject, updateProject } from './tools/projects.js';
import { getTasks, createTask, updateTask } from './tools/tasks.js';
import { getFinancialSummary, listInvoices, recordPayment } from './tools/finance.js';
import { getUpcomingEvents, scheduleEvent } from './tools/calendar.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const port = process.env.PORT || 3001;
const authToken = process.env.API_AUTH_TOKEN || 'agx_secret_token_12345';

app.use(cors());
app.use(express.json());

// Simple Auth Middleware
function authMiddleware(req: Request, res: Response, next: Function) {
  // Allow health and OpenAPI spec without auth
  if (req.path === '/health' || req.path === '/openapi.json') {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, error: 'Authorization header missing' });
  }

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (token !== authToken) {
    return res.status(403).json({ success: false, error: 'Invalid authentication token' });
  }

  next();
}

app.use(authMiddleware);

// Healthcheck
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'AGX CRM MCP / HTTP Bridge', timestamp: new Date().toISOString() });
});

// Serve OpenAPI Specification
app.get('/openapi.json', (_req: Request, res: Response) => {
  res.sendFile(path.resolve(__dirname, '../openapi.json'));
});

// Dynamic Tool Dispatcher
async function dispatchTool(name: string, args: any) {
  switch (name) {
    case 'search_leads':
      return searchLeads(args);
    case 'create_lead':
      return createLead(args);
    case 'update_lead':
      return updateLead(args);
    case 'log_lead_activity':
      return logLeadActivity(args);

    case 'search_clients':
      return searchClients(args);
    case 'create_client':
      return createClient(args);
    case 'update_client':
      return updateClient(args);

    case 'list_projects':
      return listProjects(args);
    case 'create_project':
      return createProject(args);
    case 'update_project':
      return updateProject(args);

    case 'get_tasks':
      return getTasks(args);
    case 'create_task':
      return createTask(args);
    case 'update_task':
      return updateTask(args);

    case 'get_financial_summary':
      return getFinancialSummary();
    case 'list_invoices':
      return listInvoices(args);
    case 'record_payment':
      return recordPayment(args);

    case 'get_upcoming_events':
      return getUpcomingEvents(args);
    case 'schedule_event':
      return scheduleEvent(args);

    default:
      throw new Error(`Tool "${name}" not recognized`);
  }
}

// POST endpoint for executing any tool directly (used by ChatGPT Actions & webhooks)
app.post('/api/tools/:toolName', async (req: Request, res: Response) => {
  const toolName = String(req.params.toolName);
  try {
    const result = await dispatchTool(toolName, req.body || {});
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ success: false, error: err?.message || String(err) });
  }
});

// JSON-RPC style MCP HTTP endpoint
app.post('/mcp', async (req: Request, res: Response) => {
  const { method, params, id } = req.body;

  try {
    if (method === 'tools/call') {
      const { name, arguments: args } = params;
      const result = await dispatchTool(name, args || {});
      return res.json({
        jsonrpc: '2.0',
        id,
        result: {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
          isError: !result.success,
        },
      });
    }

    res.status(400).json({ jsonrpc: '2.0', id, error: { code: -32601, message: 'Method not supported' } });
  } catch (err: any) {
    res.status(500).json({ jsonrpc: '2.0', id, error: { code: -32000, message: err?.message } });
  }
});

app.listen(port, () => {
  console.log(`[AGX CRM HTTP Server] Running at http://localhost:${port}`);
  console.log(`[AGX CRM HTTP Server] OpenAPI spec at http://localhost:${port}/openapi.json`);
});
