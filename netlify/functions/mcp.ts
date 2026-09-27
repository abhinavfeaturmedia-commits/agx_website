// Polyfill WebSocket for Node serverless runtimes (< Node 22) where @supabase/realtime-js expects a WebSocket constructor
if (typeof (globalThis as any).WebSocket === 'undefined') {
  (globalThis as any).WebSocket = class DummyWebSocket {
    static readonly CONNECTING = 0;
    static readonly OPEN = 1;
    static readonly CLOSING = 2;
    static readonly CLOSED = 3;
    readonly CONNECTING = 0;
    readonly OPEN = 1;
    readonly CLOSING = 2;
    readonly CLOSED = 3;
    readyState = 3;
    constructor() {}
    close() {}
    send() {}
    addEventListener() {}
    removeEventListener() {}
    dispatchEvent() { return false; }
  };
}

import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  'https://lgvqkumqjmeyycqvgycv.supabase.co';

const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxndnFrdW1xam1leXljcXZneWN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyMjcyMDgsImV4cCI6MjEwMjgwMzIwOH0.-_fV2jVv-mKm4z4BTVCWhT35ixYo0yOrUlhrOdngtlU';

// Accept configured API token or fallback to setup guide tokens
const validTokens = new Set([
  process.env.API_AUTH_TOKEN,
  'agx_secret_token_12345',
  'agx_dev_token'
].filter(Boolean));

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key, X-API-KEY, api-key',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

/**
 * Safely parse numbers from currency strings like "₹2,00,000", "$50,000", "200k", "1.5L", "2,00,000"
 */
function parseNumeric(val: any, defaultVal = 0): number {
  if (typeof val === 'number') return isNaN(val) ? defaultVal : val;
  if (!val) return defaultVal;
  if (typeof val === 'string') {
    const raw = val.trim();
    let cleaned = raw.replace(/[^0-9.-]/g, '');
    let num = parseFloat(cleaned);
    if (isNaN(num)) return defaultVal;

    if (/\b(k|thousand)\b/i.test(raw) || /^\d+(\.\d+)?k$/i.test(raw)) {
      num *= 1000;
    } else if (/\b(l|lac|lakh|lakhs)\b/i.test(raw) || /^\d+(\.\d+)?l$/i.test(raw)) {
      num *= 100000;
    } else if (/\b(m|million|cr|crore)\b/i.test(raw) || /^\d+(\.\d+)?m$/i.test(raw)) {
      num *= 1000000;
    }
    return num;
  }
  return defaultVal;
}

function normalizePriority(val: any): 'Low' | 'Medium' | 'High' | 'Urgent' {
  if (!val) return 'Medium';
  const str = String(val).toLowerCase();
  if (str.includes('urg')) return 'Urgent';
  if (str.includes('hi')) return 'High';
  if (str.includes('low')) return 'Low';
  return 'Medium';
}

function normalizeLeadStatus(val: any): string {
  if (!val) return 'NEW';
  const s = String(val).toUpperCase().trim();
  const map: Record<string, string> = {
    'NEW': 'NEW',
    'CONTACTED': 'CONTACTED',
    'QUALIFIED': 'QUALIFIED',
    'PROPOSAL': 'PROPOSAL SENT',
    'PROPOSAL SENT': 'PROPOSAL SENT',
    'PROPOSAL_SENT': 'PROPOSAL SENT',
    'NEGOTIATION': 'NEGOTIATION',
    'WON': 'WON',
    'CLOSED WON': 'WON',
    'CLOSED_WON': 'WON',
    'LOST': 'LOST',
    'CLOSED LOST': 'LOST',
    'CLOSED_LOST': 'LOST'
  };
  return map[s] || s;
}

/**
 * Normalizes tool names from various sources:
 * - CamelCase operationId (e.g. "createLead" -> "create_lead")
 * - Case-insensitive strings (e.g. "CREATELEAD" -> "create_lead")
 * - URL paths (e.g. "/api/tools/create_lead" -> "create_lead")
 * - Friendly aliases (e.g. "leads" -> "search_leads", "lead" -> "create_lead")
 */
function normalizeToolName(raw: string): string {
  if (!raw) return '';
  let str = raw.trim();

  // Strip leading slashes and router prefixes
  str = str.replace(/^\/?(api\/|tools\/|\.netlify\/functions\/mcp\/)+/i, '');
  const parts = str.split('/').filter(Boolean);
  if (parts.length > 0) {
    str = parts[parts.length - 1];
  }

  // Convert camelCase to snake_case: e.g. "createLead" -> "create_lead"
  let snake = str.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
  snake = snake.replace(/[-\s]+/g, '_');

  const aliases: Record<string, string> = {
    'createlead': 'create_lead',
    'searchleads': 'search_leads',
    'updatelead': 'update_lead',
    'logleadactivity': 'log_lead_activity',
    'convertleadtoclient': 'convert_lead_to_client',
    'searchclients': 'search_clients',
    'createclient': 'create_client',
    'updateclient': 'update_client',
    'listprojects': 'list_projects',
    'createproject': 'create_project',
    'updateproject': 'update_project',
    'managemilestones': 'manage_milestones',
    'gettasks': 'get_tasks',
    'createtask': 'create_task',
    'updatetask': 'update_task',
    'manageinvoices': 'manage_invoices',
    'managequotations': 'manage_quotations',
    'recordpayment': 'record_payment',
    'manageissues': 'manage_issues',
    'manageexpenses': 'manage_expenses',
    'managevault': 'manage_vault',
    'manageagreements': 'manage_agreements',
    'managepartners': 'manage_partners',
    'managecalendar': 'manage_calendar',
    'manageteam': 'manage_team',
    'getdailybriefing': 'get_daily_briefing',
    'getfinancialsummary': 'get_financial_summary',
    'getupcomingevents': 'get_upcoming_events',
    'scheduleevent': 'schedule_event',
    'leads': 'search_leads',
    'lead': 'create_lead',
    'new_lead': 'create_lead',
    'add_lead': 'create_lead',
    'clients': 'search_clients',
    'client': 'create_client',
    'new_client': 'create_client',
    'projects': 'list_projects',
    'project': 'create_project',
    'new_project': 'create_project',
    'tasks': 'get_tasks',
    'task': 'create_task',
    'new_task': 'create_task',
    'briefing': 'get_daily_briefing',
    'daily_briefing': 'get_daily_briefing',
    'finance': 'get_financial_summary',
    'financial_summary': 'get_financial_summary',
    'payment': 'record_payment'
  };

  return aliases[snake] || aliases[snake.replace(/_/g, '')] || snake;
}

export const handler = async (event: any) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders,
      body: ''
    };
  }

  // Health check endpoint & root discovery
  if (
    event.path.endsWith('/health') || 
    (event.httpMethod === 'GET' && (event.path.endsWith('/api') || event.path.endsWith('/mcp') || event.path.endsWith('/tools')))
  ) {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        status: 'ok',
        service: 'AGX CRM Netlify Serverless MCP Hub',
        total_tools: 48,
        timestamp: new Date().toISOString()
      })
    };
  }

  // Resilient Token Verification:
  // Supports Bearer token, x-api-key, or query param.
  // Permits seamless access from ChatGPT Custom Actions (Auth: None) when API_AUTH_TOKEN is not strictly enforced.
  const rawAuth =
    event.headers?.authorization ||
    event.headers?.Authorization ||
    event.headers?.['x-api-key'] ||
    event.headers?.['X-API-KEY'] ||
    event.headers?.['api-key'] ||
    event.queryStringParameters?.token ||
    event.queryStringParameters?.apiKey;

  if (rawAuth) {
    const token = rawAuth.replace(/^Bearer\s+/i, '').trim();
    if (token && validTokens.size > 0 && !validTokens.has(token)) {
      if (process.env.API_AUTH_TOKEN && token !== process.env.API_AUTH_TOKEN) {
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({ success: false, error: 'Invalid authentication token' })
        };
      }
    }
  } else if (process.env.API_AUTH_TOKEN) {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ success: false, error: 'Authorization header required' })
    };
  }

  let body: any = {};
  try {
    if (event.body) {
      body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    }
  } catch (e) {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ success: false, error: 'Invalid JSON body' })
    };
  }

  // Seamlessly unwrap nested arguments from ChatGPT Actions or MCP JSON-RPC
  if (body && typeof body === 'object') {
    if (body.arguments && typeof body.arguments === 'object') {
      body = { ...body, ...body.arguments };
    }
    if (body.input && typeof body.input === 'object') {
      body = { ...body, ...body.input };
    }
    if (body.parameters && typeof body.parameters === 'object') {
      body = { ...body, ...body.parameters };
    }
    if (body.params && typeof body.params === 'object') {
      if (body.params.arguments && typeof body.params.arguments === 'object') {
        body = { ...body, ...body.params.arguments };
      }
      body = { ...body, ...body.params };
    }
    if (body.data && typeof body.data === 'object') {
      body = { ...body, ...body.data };
    }
    if (body.lead && typeof body.lead === 'object') {
      body = { ...body, ...body.lead };
    }
    if (body.client && typeof body.client === 'object') {
      body = { ...body, ...body.client };
    }
    if (body.project && typeof body.project === 'object') {
      body = { ...body, ...body.project };
    }
    if (body.task && typeof body.task === 'object') {
      body = { ...body, ...body.task };
    }
  }

  // Extract raw candidate tool name from URL path, body, or query
  const pathParts = (event.path || '').split('/').filter(Boolean);
  const lastPart = pathParts.length > 0 ? pathParts[pathParts.length - 1] : '';

  let rawCandidate = '';
  if (lastPart && lastPart !== 'mcp' && lastPart !== 'api' && lastPart !== 'tools') {
    rawCandidate = lastPart;
  } else if (body.tool) {
    rawCandidate = body.tool;
  } else if (body.tool_name) {
    rawCandidate = body.tool_name;
  } else if (body.name && (body.arguments || body.input || body.parameters || body.params)) {
    rawCandidate = body.name;
  } else if (event.queryStringParameters?.tool) {
    rawCandidate = event.queryStringParameters.tool;
  }

  let toolName = normalizeToolName(rawCandidate);

  // Smart Multiplexing Normalizer (Guarantees 100% feature coverage under OpenAI 30-operation limit)
  if (toolName === 'manage_milestones') {
    toolName = (body.action === 'update' || (body.id && !body.amount)) ? 'update_milestone' : 'create_milestone';
  } else if (toolName === 'manage_invoices') {
    if (body.action === 'get_overdue' || body.action === 'overdue') toolName = 'get_overdue_invoices';
    else if (body.action === 'list') toolName = 'list_invoices';
    else toolName = 'create_invoice';
  } else if (toolName === 'manage_quotations') {
    toolName = body.action === 'list' ? 'list_quotations' : 'create_quotation';
  } else if (toolName === 'manage_issues') {
    if (body.action === 'resolve' || body.resolution_notes) toolName = 'resolve_issue';
    else if (body.action === 'list') toolName = 'list_issues';
    else toolName = 'create_issue';
  } else if (toolName === 'manage_expenses') {
    toolName = body.action === 'list' ? 'list_expenses' : 'record_expense';
  } else if (toolName === 'manage_vault') {
    toolName = (body.action === 'store' || body.password || body.api_key) ? 'store_vault_credential' : 'query_vault_credentials';
  } else if (toolName === 'manage_agreements') {
    toolName = body.action === 'list' ? 'list_agreements' : 'generate_legal_contract';
  } else if (toolName === 'manage_partners') {
    if (body.action === 'referral') toolName = 'create_partner_referral';
    else if (body.action === 'payout') toolName = 'record_partner_payout';
    else if (body.action === 'commissions') toolName = 'calculate_partner_commissions';
    else toolName = 'register_partner';
  } else if (toolName === 'manage_calendar') {
    if (body.action === 'transcript' || body.transcript_or_notes) toolName = 'process_meeting_transcript';
    else if (body.action === 'schedule' || body.start_time) toolName = 'schedule_event';
    else toolName = 'get_upcoming_events';
  } else if (toolName === 'manage_team') {
    if (body.action === 'workload') toolName = 'get_team_workload';
    else if (body.action === 'audit' || body.action === 'audit_logs') toolName = 'get_audit_logs';
    else toolName = 'send_notification';
  }

  try {
    let result: any;

    switch (toolName) {
      // 1. Leads
      case 'search_leads': {
        let q = supabase.from('leads').select('*').order('created_at', { ascending: false });
        if (body.query) {
          const s = body.query.trim();
          q = q.or(`name.ilike.%${s}%,company.ilike.%${s}%,phone.ilike.%${s}%,email.ilike.%${s}%`);
        }
        if (body.status) q = q.eq('status', body.status.toUpperCase());
        if (body.priority) q = q.eq('priority', body.priority);
        q = q.limit(body.limit || 20);
        const { data, error } = await q;
        if (error) throw error;
        result = { success: true, message: `Found ${data?.length || 0} leads`, data };
        break;
      }

      case 'create_lead': {
        const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

        const leadName =
          body.name?.trim() ||
          body.lead_name?.trim() ||
          body.contact_name?.trim() ||
          body.client_name?.trim() ||
          body.prospect?.trim() ||
          `Test Lead - ${dateStr} (${timeStr})`;

        const dealVal = parseNumeric(
          body.estimated_deal_value ?? body.deal_value ?? body.estimated_value ?? body.value ?? body.budget,
          body.name ? 0 : 150000
        );

        const companyName =
          body.company ||
          body.company_name ||
          body.organization ||
          (body.name ? null : 'Demo Innovations Corp');

        const { data, error } = await supabase
          .from('leads')
          .insert([
            {
              name: leadName,
              company: companyName,
              phone: body.phone || body.mobile || body.contact_number || (body.name ? null : '+91 98765 43210'),
              email: body.email || body.email_address || (body.name ? null : 'test.lead@agxperience.com'),
              interested_service: body.interested_service || body.service_interested || body.service || body.requirement || 'AI Automation',
              estimated_deal_value: dealVal,
              priority: normalizePriority(body.priority || 'High'),
              source: body.source || 'ChatGPT Assistant',
              status: normalizeLeadStatus(body.status || 'NEW'),
              next_follow_up: body.next_follow_up || null,
              notes: body.notes || body.description || 'Lead captured via Cloud AI Assistant'
            }
          ])
          .select()
          .single();
        if (error) throw error;

        if (body.notes || body.next_follow_up) {
          await supabase.from('lead_activities').insert([
            {
              lead_id: data.id,
              user_name: 'Cloud AI Assistant',
              activity_type: 'Note',
              notes: `Lead captured via Cloud AI. Notes: ${body.notes || 'None'}`
            }
          ]);
        }
        result = { success: true, message: `Lead "${leadName}" created successfully with deal value ₹${dealVal.toLocaleString('en-IN')}`, data };
        break;
      }

      case 'update_lead': {
        let leadId = body.id || body.lead_id;
        if (!leadId && (body.name || body.lead_name || body.company)) {
          const searchVal = body.name || body.lead_name || body.company;
          const { data: found } = await supabase
            .from('leads')
            .select('id')
            .or(`name.ilike.%${searchVal}%,company.ilike.%${searchVal}%`)
            .limit(1)
            .single();
          if (found) leadId = found.id;
        }
        if (!leadId) throw new Error('Lead not found. Please provide lead id, name, or company.');

        const updates: any = { updated_at: new Date().toISOString() };
        if (body.status) updates.status = normalizeLeadStatus(body.status);
        if (body.estimated_deal_value !== undefined || body.deal_value !== undefined || body.estimated_value !== undefined || body.value !== undefined) {
          updates.estimated_deal_value = parseNumeric(body.estimated_deal_value ?? body.deal_value ?? body.estimated_value ?? body.value);
        }
        if (body.priority) updates.priority = normalizePriority(body.priority);
        if (body.next_follow_up) updates.next_follow_up = body.next_follow_up;
        if (body.notes) updates.notes = body.notes;

        const { data, error } = await supabase.from('leads').update(updates).eq('id', leadId).select().single();
        if (error) throw error;

        if (body.status) {
          await supabase.from('lead_activities').insert([
            {
              lead_id: leadId,
              user_name: 'Cloud AI Assistant',
              activity_type: 'Status Change',
              notes: `Stage changed to ${body.status}`
            }
          ]);
        }
        result = { success: true, message: `Lead "${data.name}" updated`, data };
        break;
      }

      case 'log_lead_activity': {
        let leadId = body.lead_id;
        if (!leadId && body.lead_name) {
          const { data: found } = await supabase.from('leads').select('id').ilike('name', `%${body.lead_name}%`).limit(1).single();
          if (found) leadId = found.id;
        }
        if (!leadId) throw new Error('Lead not found. Please provide lead_id or lead_name.');

        const { data, error } = await supabase
          .from('lead_activities')
          .insert([
            {
              lead_id: leadId,
              user_name: body.user_name || 'Cloud AI Assistant',
              activity_type: body.activity_type || 'Note',
              notes: body.notes
            }
          ])
          .select()
          .single();
        if (error) throw error;

        const leadUpdates: any = { last_contacted: new Date().toISOString() };
        if (body.set_next_follow_up) leadUpdates.next_follow_up = body.set_next_follow_up;
        await supabase.from('leads').update(leadUpdates).eq('id', leadId);

        result = { success: true, message: `Activity logged: [${body.activity_type}] ${body.notes}`, data };
        break;
      }

      // 2. Clients
      case 'search_clients': {
        let q = supabase.from('clients').select('*').order('created_at', { ascending: false });
        if (body.query) {
          const s = body.query.trim();
          q = q.or(`name.ilike.%${s}%,company.ilike.%${s}%,email.ilike.%${s}%`);
        }
        if (body.status) q = q.eq('status', body.status);
        q = q.limit(body.limit || 20);
        const { data, error } = await q;
        if (error) throw error;
        result = { success: true, message: `Found ${data?.length || 0} clients`, data };
        break;
      }

      case 'create_client': {
        const totalVal = parseNumeric(body.total_value ?? body.value ?? body.deal_value, 0);
        const clientName = body.name || body.client_name || body.contact_name;
        const companyName = body.company || body.company_name || clientName || 'Client';
        const { data, error } = await supabase
          .from('clients')
          .insert([
            {
              name: clientName || companyName,
              company: companyName,
              email: body.email || null,
              phone: body.phone || null,
              total_value: totalVal,
              notes: body.notes || null,
              status: 'Active'
            }
          ])
          .select()
          .single();
        if (error) throw error;
        result = { success: true, message: `Client "${companyName}" created`, data };
        break;
      }

      // 3. Projects
      case 'list_projects': {
        let q = supabase.from('projects').select('*').order('created_at', { ascending: false });
        if (body.status) q = q.eq('status', body.status.toUpperCase());
        if (body.client_name) q = q.ilike('client_name', `%${body.client_name}%`);
        q = q.limit(body.limit || 20);
        const { data, error } = await q;
        if (error) throw error;
        result = { success: true, message: `Found ${data?.length || 0} projects`, data };
        break;
      }

      case 'create_project': {
        const pVal = parseNumeric(body.project_value ?? body.value ?? body.amount ?? body.deal_value, 0);
        const { data, error } = await supabase
          .from('projects')
          .insert([
            {
              name: body.name || body.project_name || 'New Project',
              client_name: body.client_name || body.client || 'Client',
              service_type: body.service_type || body.service || 'Workflow Automation',
              project_value: pVal,
              pending_amount: pVal,
              status: 'PLANNING',
              due_date: body.due_date || null
            }
          ])
          .select()
          .single();
        if (error) throw error;
        result = { success: true, message: `Project "${data.name}" created`, data };
        break;
      }

      // 4. Tasks
      case 'get_tasks': {
        let q = supabase.from('tasks').select('*').order('due_date', { ascending: true, nullsFirst: false });
        if (body.status) q = q.eq('status', body.status.toUpperCase());
        if (body.priority) q = q.eq('priority', body.priority);
        if (body.due_today) {
          const today = new Date().toISOString().split('T')[0];
          q = q.eq('due_date', today);
        }
        q = q.limit(body.limit || 25);
        const { data, error } = await q;
        if (error) throw error;
        result = { success: true, message: `Found ${data?.length || 0} tasks`, data };
        break;
      }

      case 'create_task': {
        const { data, error } = await supabase
          .from('tasks')
          .insert([
            {
              title: body.title,
              description: body.description || null,
              assigned_to: body.assigned_to || null,
              priority: body.priority || 'Medium',
              status: 'TO DO',
              due_date: body.due_date || null
            }
          ])
          .select()
          .single();
        if (error) throw error;
        result = { success: true, message: `Task "${body.title}" created`, data };
        break;
      }

      case 'update_task': {
        let taskId = body.id;
        if (!taskId && body.title) {
          const { data: found } = await supabase.from('tasks').select('id').ilike('title', `%${body.title}%`).limit(1).single();
          if (found) taskId = found.id;
        }
        if (!taskId) throw new Error('Task not found.');

        const updates: any = { updated_at: new Date().toISOString() };
        if (body.status) updates.status = body.status;
        if (body.assigned_to) updates.assigned_to = body.assigned_to;

        const { data, error } = await supabase.from('tasks').update(updates).eq('id', taskId).select().single();
        if (error) throw error;
        result = { success: true, message: `Task updated to ${data.status}`, data };
        break;
      }

      // 5. Finance
      case 'get_financial_summary': {
        const [invRes, clientRes, expRes, leadRes] = await Promise.all([
          supabase.from('invoices').select('total, paid_amount, status'),
          supabase.from('clients').select('id'),
          supabase.from('expenses').select('amount, status'),
          supabase.from('leads').select('estimated_deal_value, status')
        ]);

        const invoices = invRes.data || [];
        const expenses = expRes.data || [];
        const leads = leadRes.data || [];

        const totalInvoiced = invoices.reduce((acc, i) => acc + (Number(i.total) || 0), 0);
        const totalCollected = invoices.reduce((acc, i) => acc + (Number(i.paid_amount) || 0), 0);
        const overdueCount = invoices.filter(i => i.status === 'Overdue').length;
        const totalExpenses = expenses.filter(e => e.status === 'Approved').reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
        const pipelineValue = leads
          .filter(l => ['QUALIFIED', 'PROPOSAL SENT', 'NEGOTIATION'].includes(l.status))
          .reduce((acc, l) => acc + (Number(l.estimated_deal_value) || 0), 0);

        result = {
          success: true,
          message: 'Financial summary calculated',
          data: {
            total_invoiced: totalInvoiced,
            total_collected: totalCollected,
            total_outstanding: Math.max(0, totalInvoiced - totalCollected),
            overdue_invoices_count: overdueCount,
            total_expenses: totalExpenses,
            net_margin: totalCollected - totalExpenses,
            active_pipeline_value: pipelineValue,
            active_clients_count: (clientRes.data || []).length
          }
        };
        break;
      }

      case 'record_payment': {
        let invId = body.invoice_id;
        if (!invId && body.invoice_number) {
          const { data: inv } = await supabase.from('invoices').select('*').eq('invoice_number', body.invoice_number).limit(1).single();
          if (inv) invId = inv.id;
        }
        if (!invId) throw new Error('Invoice not found.');

        const { data: currentInv } = await supabase.from('invoices').select('*').eq('id', invId).single();
        if (!currentInv) throw new Error('Invoice not found.');

        const payAmount = parseNumeric(body.amount ?? body.payment_amount ?? body.paid_amount, 0);
        const newPaid = (Number(currentInv.paid_amount) || 0) + payAmount;
        const newStatus = newPaid >= Number(currentInv.total) ? 'Paid' : 'Partially Paid';

        await supabase.from('invoices').update({ paid_amount: newPaid, status: newStatus }).eq('id', invId);

        result = {
          success: true,
          message: `Payment of ₹${payAmount.toLocaleString('en-IN')} recorded. Invoice is now ${newStatus}.`
        };
        break;
      }

      // 6. Calendar
      case 'get_upcoming_events': {
        const days = body.days_ahead || 7;
        const now = new Date();
        const future = new Date();
        future.setDate(now.getDate() + days);

        const { data, error } = await supabase
          .from('calendar_events')
          .select('*')
          .gte('start_time', now.toISOString())
          .lte('start_time', future.toISOString())
          .order('start_time', { ascending: true });
        if (error) throw error;
        result = { success: true, message: `Found ${data?.length || 0} events in next ${days} days`, data };
        break;
      }

      case 'schedule_event': {
        const { data, error } = await supabase
          .from('calendar_events')
          .insert([
            {
              title: body.title,
              start_time: body.start_time,
              meeting_url: body.meeting_url || null,
              event_type: 'Meeting',
              status: 'Scheduled'
            }
          ])
          .select()
          .single();
        if (error) throw error;
        result = { success: true, message: `Event "${body.title}" scheduled for ${body.start_time}`, data };
        break;
      }

      // 7. Executive & Sales Acceleration Super-Tools
      case 'get_daily_briefing': {
        const today = new Date().toISOString().split('T')[0];
        const next48Hours = new Date(Date.now() + 48 * 3600 * 1000).toISOString();

        const [tasksRes, leadsRes, eventsRes, invoicesRes, pipelineRes] = await Promise.all([
          supabase.from('tasks').select('*').or(`due_date.lte.${today}`).neq('status', 'COMPLETED').order('due_date', { ascending: true }).limit(10),
          supabase.from('leads').select('*').lte('next_follow_up', next48Hours).not('status', 'in', '("WON","LOST")').order('next_follow_up', { ascending: true }).limit(10),
          supabase.from('calendar_events').select('*').gte('start_time', new Date().toISOString()).lte('start_time', next48Hours).order('start_time', { ascending: true }),
          supabase.from('invoices').select('invoice_number, client_name, total, paid_amount, due_date, status').or(`status.eq.Overdue,and(due_date.lt.${today},status.neq.Paid)`),
          supabase.from('leads').select('estimated_deal_value, status').not('status', 'in', '("LOST")')
        ]);

        const tasksDue = tasksRes.data || [];
        const followUpsDue = leadsRes.data || [];
        const events = eventsRes.data || [];
        const overdueInvoices = invoicesRes.data || [];
        const pipeline = pipelineRes.data || [];

        const activePipelineValue = pipeline
          .filter((l: any) => ['QUALIFIED', 'PROPOSAL SENT', 'NEGOTIATION'].includes(l.status))
          .reduce((sum: number, l: any) => sum + (Number(l.estimated_deal_value) || 0), 0);

        result = {
          success: true,
          message: `Daily executive briefing generated for ${today}`,
          data: {
            date: today,
            summary_headline: `${followUpsDue.length} follow-ups scheduled, ${tasksDue.length} priority tasks pending, ${overdueInvoices.length} overdue bills`,
            urgent_follow_ups: followUpsDue.map((l: any) => ({
              id: l.id,
              name: l.name,
              company: l.company,
              status: l.status,
              deal_value: l.estimated_deal_value,
              next_follow_up: l.next_follow_up
            })),
            priority_tasks: tasksDue.map((t: any) => ({
              id: t.id,
              title: t.title,
              assigned_to: t.assigned_to,
              priority: t.priority,
              due_date: t.due_date
            })),
            upcoming_events_48h: events.map((e: any) => ({
              title: e.title,
              start_time: e.start_time,
              meeting_url: e.meeting_url
            })),
            overdue_receivables: overdueInvoices.map((i: any) => ({
              invoice_number: i.invoice_number,
              client_name: i.client_name,
              amount_due: Math.max(0, (Number(i.total) || 0) - (Number(i.paid_amount) || 0)),
              due_date: i.due_date
            })),
            active_pipeline_value: activePipelineValue
          }
        };
        break;
      }

      case 'convert_lead_to_client': {
        let leadId = body.lead_id;
        if (!leadId && body.lead_name) {
          const { data: found } = await supabase.from('leads').select('*').ilike('name', `%${body.lead_name}%`).limit(1).single();
          if (found) leadId = found.id;
        }
        if (!leadId) throw new Error('Lead not found. Please provide lead_id or lead_name.');

        const { data: lead } = await supabase.from('leads').select('*').eq('id', leadId).single();
        if (!lead) throw new Error('Lead record not found in database.');

        const companyName = body.company || lead.company || lead.name;
        const dealVal = Number(body.project_value || lead.estimated_deal_value || 0);

        let clientId = lead.converted_client_id;
        let clientData: any;

        if (!clientId) {
          const { data: newClient, error: clientErr } = await supabase
            .from('clients')
            .insert([
              {
                name: lead.name,
                company: companyName,
                email: lead.email || null,
                phone: lead.phone || null,
                total_value: dealVal,
                notes: `Converted from Lead "${lead.name}" via Cloud AI Assistant. Notes: ${lead.notes || 'None'}`,
                status: 'Active',
                partner_id: lead.partner_id || null,
                partner_name: lead.partner_name || null,
                partner_code: lead.partner_code || null
              }
            ])
            .select()
            .single();
          if (clientErr) throw clientErr;
          clientData = newClient;
          clientId = newClient.id;
        }

        const projectName = body.project_name || `${companyName} - ${lead.interested_service || 'AI Automation'}`;
        const serviceType = body.service_type || lead.interested_service || 'Workflow Automation';
        const projectManager = body.project_manager || lead.assigned_to || 'Abhinav Gaikwad';

        const { data: newProj, error: projErr } = await supabase
          .from('projects')
          .insert([
            {
              name: projectName,
              client_id: clientId,
              client_name: companyName,
              service_type: serviceType,
              project_manager: projectManager,
              project_value: dealVal,
              pending_amount: dealVal,
              status: 'PLANNING',
              priority: 'High',
              progress: 0,
              description: `Automated onboarding for ${companyName}. Initial scope: ${serviceType}`
            }
          ])
          .select()
          .single();
        if (projErr) throw projErr;

        const dueDateWeek = new Date(Date.now() + 7 * 86400 * 1000).toISOString().split('T')[0];
        const dueDate3Days = new Date(Date.now() + 3 * 86400 * 1000).toISOString().split('T')[0];

        const initialTasks = [
          {
            title: `Schedule Kickoff Call with ${lead.name}`,
            description: `Discuss project architecture, milestones, and confirm stakeholders for ${projectName}.`,
            client_id: clientId,
            project_id: newProj.id,
            assigned_to: projectManager,
            priority: 'High',
            status: 'TO DO',
            due_date: dueDate3Days
          },
          {
            title: `Collect Technical Credentials & Assets (${companyName})`,
            description: 'Request required API keys, staging URLs, and brand assets for Credentials Vault.',
            client_id: clientId,
            project_id: newProj.id,
            assigned_to: projectManager,
            priority: 'Medium',
            status: 'TO DO',
            due_date: dueDateWeek
          },
          {
            title: `Draft & Issue Milestone 1 Advance Invoice (50%)`,
            description: `Issue 50% advance invoice (₹${(dealVal * 0.5).toLocaleString('en-IN')}) for ${projectName}.`,
            client_id: clientId,
            project_id: newProj.id,
            assigned_to: 'Accountant',
            priority: 'High',
            status: 'TO DO',
            due_date: dueDate3Days
          }
        ];
        await supabase.from('tasks').insert(initialTasks);

        await supabase
          .from('leads')
          .update({
            status: 'WON',
            converted_client_id: clientId,
            converted_project_id: newProj.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', leadId);

        await supabase.from('lead_activities').insert([
          {
            lead_id: leadId,
            user_name: 'Cloud AI Assistant',
            activity_type: 'Status Change',
            notes: `🎉 Deal Won! Converted to Client "${companyName}" and Project "${projectName}" with initial onboarding tasks created.`
          }
        ]);

        await supabase.from('audit_logs').insert([
          {
            user_name: 'Cloud AI Assistant',
            user_role: 'Super Admin',
            action_type: 'CONVERT_LEAD',
            entity_type: 'Lead',
            entity_id: leadId,
            description: `Lead "${lead.name}" converted to Client "${companyName}" (₹${dealVal.toLocaleString('en-IN')}) and Project "${projectName}"`
          }
        ]);

        result = {
          success: true,
          message: `🎉 Deal Won! Successfully onboarded "${companyName}". Client, Project, and 3 kickoff tasks created.`,
          data: {
            lead_status: 'WON',
            client: clientData || { id: clientId, company: companyName },
            project: newProj,
            onboarding_tasks_created: initialTasks.map(t => t.title)
          }
        };
        break;
      }

      case 'create_quotation': {
        const clientName = body.client_name || body.lead_name || 'Prospective Client';
        const rawItems = Array.isArray(body.items) && body.items.length > 0 ? body.items : [
          {
            description: body.service_description || 'AI Automation & System Architecture',
            quantity: 1,
            unit_price: parseNumeric(body.amount, 100000)
          }
        ];

        const items = rawItems.map((item: any) => {
          const qty = parseNumeric(item.quantity, 1);
          const price = parseNumeric(item.unit_price ?? item.price ?? item.amount, 0);
          return {
            description: item.description || 'Automation Service',
            quantity: qty,
            unit_price: price,
            total: qty * price
          };
        });

        const subtotal = items.reduce((sum: number, it: any) => sum + it.total, 0);
        const isGst = body.is_gst !== false;
        const taxRate = isGst ? 18 : 0;
        const tax = isGst ? Math.round(subtotal * 0.18) : 0;
        const total = subtotal + tax;

        const dateStr = new Date().toISOString().split('T')[0];
        const validUntil = new Date(Date.now() + (parseNumeric(body.valid_days, 15)) * 86400 * 1000).toISOString().split('T')[0];
        const randomCode = Math.floor(1000 + Math.random() * 9000);
        const quoteNumber = `QUO-${new Date().getFullYear()}-${randomCode}`;

        const quotePayload: any = {
          quotation_number: quoteNumber,
          client_name: clientName,
          lead_name: body.lead_name || null,
          issue_date: dateStr,
          valid_until: validUntil,
          items: items,
          subtotal: subtotal,
          is_gst: isGst,
          tax_rate: taxRate,
          tax: tax,
          igst: tax,
          total: total,
          status: 'Draft',
          notes: body.notes || 'Payment terms: 50% advance upon project initiation, 50% upon final sign-off and deployment.'
        };

        if (body.lead_id) quotePayload.lead_id = body.lead_id;
        if (body.client_id) quotePayload.client_id = body.client_id;
        if (body.project_name) quotePayload.project_name = body.project_name;

        const { data: newQuote, error: qErr } = await supabase
          .from('quotations')
          .insert([quotePayload])
          .select()
          .single();
        if (qErr) throw qErr;

        result = {
          success: true,
          message: `Official quotation ${quoteNumber} created for "${clientName}" for ₹${total.toLocaleString('en-IN')}`,
          data: newQuote
        };
        break;
      }

      case 'create_invoice': {
        const clientName = body.client_name || 'Client';
        const rawItems = Array.isArray(body.items) && body.items.length > 0 ? body.items : [
          {
            description: body.service_description || 'AI Automation Deliverable',
            quantity: 1,
            unit_price: parseNumeric(body.amount, 50000)
          }
        ];

        const items = rawItems.map((item: any) => {
          const qty = parseNumeric(item.quantity, 1);
          const price = parseNumeric(item.unit_price ?? item.price ?? item.amount, 0);
          return {
            description: item.description || 'Milestone Delivery',
            quantity: qty,
            unit_price: price,
            total: qty * price
          };
        });

        const subtotal = items.reduce((sum: number, it: any) => sum + it.total, 0);
        const isGst = body.is_gst !== false;
        const taxRate = isGst ? 18 : 0;
        const tax = isGst ? Math.round(subtotal * 0.18) : 0;
        const total = subtotal + tax;

        const dateStr = new Date().toISOString().split('T')[0];
        const dueDate = new Date(Date.now() + (body.due_days || 7) * 86400 * 1000).toISOString().split('T')[0];
        const randomCode = Math.floor(1000 + Math.random() * 9000);
        const invoiceNumber = `INV-${new Date().getFullYear()}-${randomCode}`;

        const invoicePayload: any = {
          invoice_number: invoiceNumber,
          client_name: clientName,
          issue_date: dateStr,
          due_date: dueDate,
          items: items,
          subtotal: subtotal,
          is_gst: isGst,
          tax_rate: taxRate,
          tax: tax,
          igst: tax,
          total: total,
          paid_amount: 0,
          status: body.status || 'Sent',
          notes: body.notes || 'Please transfer payment to AGX account via Bank Wire or UPI.'
        };

        if (body.client_id) invoicePayload.client_id = body.client_id;
        if (body.project_id) invoicePayload.project_id = body.project_id;

        const { data: newInv, error: invErr } = await supabase
          .from('invoices')
          .insert([invoicePayload])
          .select()
          .single();
        if (invErr) throw invErr;

        result = {
          success: true,
          message: `Invoice ${invoiceNumber} created for "${clientName}" for ₹${total.toLocaleString('en-IN')}`,
          data: newInv
        };
        break;
      }

      case 'get_stalled_leads_warning': {
        const days = Number(body.days_inactive || 5);
        const cutoffDate = new Date(Date.now() - days * 86400 * 1000).toISOString();

        const { data: leads, error } = await supabase
          .from('leads')
          .select('*')
          .in('status', ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL SENT', 'NEGOTIATION'])
          .lte('updated_at', cutoffDate)
          .order('estimated_deal_value', { ascending: false });
        if (error) throw error;

        const stalledLeads = (leads || []).map((l: any) => {
          const daysStalled = Math.round((Date.now() - new Date(l.updated_at).getTime()) / (86400 * 1000));
          return {
            id: l.id,
            name: l.name,
            company: l.company || 'Not Specified',
            status: l.status,
            estimated_deal_value: l.estimated_deal_value || 0,
            days_inactive: daysStalled,
            priority: l.priority,
            recommended_action: daysStalled > 14
              ? 'High Risk: Send re-engagement case study or executive check-in'
              : 'Send quick WhatsApp check-in to confirm review timeline'
          };
        });

        const totalAtRisk = stalledLeads.reduce((acc: number, l: any) => acc + (Number(l.estimated_deal_value) || 0), 0);

        result = {
          success: true,
          message: `Found ${stalledLeads.length} leads stalled for > ${days} days (₹${totalAtRisk.toLocaleString('en-IN')} total at risk)`,
          data: {
            stalled_count: stalledLeads.length,
            total_value_at_risk: totalAtRisk,
            leads: stalledLeads
          }
        };
        break;
      }

      case 'qualify_lead': {
        const budget = parseNumeric(body.budget, 0);
        const urgency = body.urgency || 'Normal';
        const hasClearNeed = Boolean(body.requirement_summary && body.requirement_summary.length > 20);

        let score = 30;
        if (budget >= 300000) score += 40;
        else if (budget >= 150000) score += 30;
        else if (budget >= 75000) score += 20;
        else score += 10;

        if (urgency === 'Immediate') score += 20;
        else if (urgency === 'Within 1 month') score += 10;

        if (hasClearNeed) score += 10;
        score = Math.min(100, score);

        let tier = 'Tier B (Standard)';
        let priority = 'Medium';
        let recommendation = 'Standard discovery call & custom proposal';

        if (score >= 80) {
          tier = 'Tier A (High Value / VIP)';
          priority = 'Urgent';
          recommendation = 'Direct founder/senior partner consultation within 24 hours. High probability of close.';
        } else if (score < 50) {
          tier = 'Tier C (Nurture / Self-Serve)';
          priority = 'Low';
          recommendation = 'Share standardized pre-packaged templates or portfolio deck before booking live hours.';
        }

        if (body.lead_id) {
          await supabase.from('leads').update({
            priority: priority,
            estimated_deal_value: budget > 0 ? budget : undefined,
            notes: `AI Qualified: ${tier} (Score: ${score}/100). Rec: ${recommendation}`
          }).eq('id', body.lead_id);
        }

        result = {
          success: true,
          message: `Lead scored ${score}/100: Assigned to ${tier}`,
          data: {
            qualification_score: score,
            tier: tier,
            recommended_priority: priority,
            recommendation: recommendation,
            estimated_budget: budget
          }
        };
        break;
      }

      case 'process_meeting_transcript': {
        const clientOrLeadName = body.client_name || body.lead_name;
        if (!clientOrLeadName) throw new Error('Please specify client_name or lead_name.');

        const { data: lead } = await supabase.from('leads').select('id, name').ilike('name', `%${clientOrLeadName}%`).limit(1).single();

        const notes = body.transcript_or_notes;
        if (!notes) throw new Error('transcript_or_notes is required.');

        const leadId = lead ? lead.id : body.lead_id;

        if (leadId) {
          await supabase.from('lead_activities').insert([
            {
              lead_id: leadId,
              user_name: 'Cloud AI Assistant',
              activity_type: body.meeting_type || 'Meeting',
              notes: `Meeting Summary: ${notes}`
            }
          ]);

          if (body.next_follow_up) {
            await supabase.from('leads').update({
              next_follow_up: body.next_follow_up,
              last_contacted: new Date().toISOString()
            }).eq('id', leadId);
          }
        }

        const createdTasks = [];
        if (Array.isArray(body.action_items) && body.action_items.length > 0) {
          for (const item of body.action_items) {
            const title = typeof item === 'string' ? item : item.title;
            const dueDate = typeof item === 'object' && item.due_date ? item.due_date : null;
            const { data: t } = await supabase.from('tasks').insert([
              {
                title: title,
                description: `Created from meeting with ${clientOrLeadName}.`,
                lead_id: leadId || null,
                priority: 'Medium',
                status: 'TO DO',
                due_date: dueDate
              }
            ]).select().single();
            if (t) createdTasks.push(t.title);
          }
        }

        result = {
          success: true,
          message: `Meeting notes logged for "${clientOrLeadName}" with ${createdTasks.length} action items created`,
          data: {
            lead_linked: !!leadId,
            action_items_created: createdTasks,
            next_follow_up: body.next_follow_up || 'Not specified'
          }
        };
        break;
      }

      case 'get_overdue_invoices': {
        const today = new Date().toISOString().split('T')[0];
        const { data: invoices, error } = await supabase
          .from('invoices')
          .select('*')
          .or(`status.eq.Overdue,and(due_date.lt.${today},status.neq.Paid)`)
          .order('due_date', { ascending: true });
        if (error) throw error;

        const overdueList = (invoices || []).map((inv: any) => {
          const balance = Math.max(0, (Number(inv.total) || 0) - (Number(inv.paid_amount) || 0));
          const daysOverdue = Math.max(0, Math.round((Date.now() - new Date(inv.due_date).getTime()) / (86400 * 1000)));

          return {
            invoice_number: inv.invoice_number,
            client_name: inv.client_name,
            total: inv.total,
            balance_due: balance,
            due_date: inv.due_date,
            days_overdue: daysOverdue,
            suggested_whatsapp_reminder: `Hi ${inv.client_name}, this is a gentle reminder regarding invoice *${inv.invoice_number}* for *₹${balance.toLocaleString('en-IN')}* which was due on ${inv.due_date}. Please let us know if you need any assistance with payment processing. Thank you!`
          };
        });

        const totalOverdueAmount = overdueList.reduce((acc: number, i: any) => acc + i.balance_due, 0);

        result = {
          success: true,
          message: `Found ${overdueList.length} overdue invoices totaling ₹${totalOverdueAmount.toLocaleString('en-IN')}`,
          data: {
            overdue_count: overdueList.length,
            total_overdue_amount: totalOverdueAmount,
            invoices: overdueList
          }
        };
        break;
      }

      case 'query_vault_credentials': {
        const search = (body.platform_or_client || '').trim();
        if (!search) throw new Error('platform_or_client is required to search vault.');

        const { data: items, error } = await supabase
          .from('credentials_vault')
          .select('id, platform_name, service_url, username, environment, status, notes, access_roles, created_at')
          .or(`platform_name.ilike.%${search}%,service_url.ilike.%${search}%,notes.ilike.%${search}%`)
          .limit(5);
        if (error) throw error;

        await supabase.from('audit_logs').insert([
          {
            user_name: body.requester_name || 'Cloud AI Assistant',
            user_role: 'Super Admin',
            action_type: 'REVEAL_SECRET',
            entity_type: 'Credential',
            description: `Vault search query executed for "${search}". ${items?.length || 0} matches found.`
          }
        ]);

        result = {
          success: true,
          message: `Found ${items?.length || 0} matching credential vault entries (Audit log generated)`,
          data: items || []
        };
        break;
      }

      case 'calculate_partner_commissions': {
        const partnerRef = (body.partner_code || body.partner_name || '').trim();
        if (!partnerRef) throw new Error('partner_code or partner_name is required.');

        const { data: partner } = await supabase
          .from('partners')
          .select('*')
          .or(`referral_code.ilike.%${partnerRef}%,name.ilike.%${partnerRef}%`)
          .limit(1)
          .single();

        let leadQuery = supabase.from('leads').select('*').eq('status', 'WON');
        if (partner?.id) {
          leadQuery = leadQuery.or(`partner_id.eq.${partner.id},partner_code.ilike.%${partner.referral_code}%`);
        } else {
          leadQuery = leadQuery.or(`partner_code.ilike.%${partnerRef}%,partner_name.ilike.%${partnerRef}%`);
        }

        const { data: wonLeads } = await leadQuery;
        const leads = wonLeads || [];

        const totalRevenue = leads.reduce((sum: number, l: any) => sum + (Number(l.estimated_deal_value) || 0), 0);
        const commissionRate = partner?.commission_rate || 0.10;
        const totalCommissionEarned = Math.round(totalRevenue * commissionRate);
        const paidCommission = Number(partner?.paid_earnings || 0);
        const pendingPayout = Math.max(0, totalCommissionEarned - paidCommission);

        result = {
          success: true,
          message: `Commission breakdown calculated for Partner "${partner?.name || partnerRef}"`,
          data: {
            partner_name: partner?.name || partnerRef,
            referral_code: partner?.referral_code || partnerRef,
            commission_rate_percentage: `${Math.round(commissionRate * 100)}%`,
            total_won_deals_count: leads.length,
            total_revenue_generated: totalRevenue,
            total_commission_earned: totalCommissionEarned,
            commission_already_paid: paidCommission,
            pending_payout_balance: pendingPayout,
            attributed_deals: leads.map((l: any) => ({
              client_name: l.name,
              company: l.company,
              deal_value: l.estimated_deal_value,
              commission_for_deal: Math.round((Number(l.estimated_deal_value) || 0) * commissionRate)
            }))
          }
        };
        break;
      }

      case 'draft_communication': {
        const channel = body.channel || 'WhatsApp';
        const recipient = body.recipient_name || 'Client';
        const purpose = body.purpose || 'Follow-up';
        const phone = (body.phone || '').replace(/[^0-9]/g, '');

        let messageBody = '';
        if (purpose.toLowerCase().includes('proposal') || purpose.toLowerCase().includes('quote')) {
          messageBody = `Hi ${recipient}, hope you're having a productive week! Just checking in to see if you had a chance to review the AI automation proposal we sent over. Happy to jump on a quick 10-minute call to answer any questions. Best, Abhinav from AGX.`;
        } else if (purpose.toLowerCase().includes('payment')) {
          messageBody = `Hi ${recipient}, gentle note regarding the pending invoice for our recent milestone. Please let us know once the transfer is processed so we can activate the next phase. Best regards, AGX Finance.`;
        } else {
          messageBody = `Hi ${recipient}, following up on our recent discussion regarding your AI workflow optimization with AGX. Would love to know your thoughts on our suggested approach. Let me know when you're free to chat!`;
        }

        if (body.custom_notes) {
          messageBody += `\n\nNote: ${body.custom_notes}`;
        }

        const directWhatsAppUrl = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(messageBody)}` : null;

        result = {
          success: true,
          message: `Ready-to-dispatch ${channel} drafted for "${recipient}"`,
          data: {
            channel: channel,
            recipient: recipient,
            phone: phone || 'Not provided',
            message: messageBody,
            direct_send_whatsapp_url: directWhatsAppUrl
          }
        };
        break;
      }

      case 'generate_legal_contract': {
        const contractType = body.contract_type || 'Mutual NDA';
        const partyName = body.party_name || 'Client / Partner';
        const effectiveDate = body.effective_date || new Date().toISOString().split('T')[0];

        let contractText = '';
        if (contractType.includes('NDA')) {
          contractText = `# MUTUAL NON-DISCLOSURE AGREEMENT (NDA)\n\n**Effective Date:** ${effectiveDate}\n**Between:** AGXperience ("AGX") and **${partyName}** ("Counterparty").\n\n### 1. Purpose\nThe parties wish to explore a potential business relationship concerning AI automation systems, software architectures, and proprietary operations (the "Purpose").\n\n### 2. Confidential Information\n"Confidential Information" includes all proprietary code, workflows, trade secrets, financial terms, credentials, and client data disclosed by either party.\n\n### 3. Obligations of Receiving Party\nThe Receiving Party shall protect Confidential Information with at least reasonable care and shall not disclose it to third parties without prior written consent.\n\n### 4. Governing Law & Jurisdiction\nThis Agreement shall be governed by the laws of India, with exclusive jurisdiction in Pune/Mumbai, Maharashtra.\n\n---\n**Agreed & Accepted:**\n\nFor AGXperience: _____________________\nFor ${partyName}: _____________________`;
        } else {
          contractText = `# MASTER SERVICE AGREEMENT & STATEMENT OF WORK\n\n**Client:** ${partyName}\n**Service Provider:** AGXperience\n**Date:** ${effectiveDate}\n\n### 1. Scope of Services\nAGXperience shall deliver custom AI Automation Workflows, Integration Architecture, and Maintenance as detailed in the agreed Project Specifications.\n\n### 2. Fees & Commercial Terms\n- Standard payment milestones: 50% advance upon contract signing, 50% upon deployment.\n- Invoices payable within 7 business days.\n\n### 3. Intellectual Property\nUpon complete payment of all project fees, all bespoke workflows, scripts, and software deliverables shall belong exclusively to the Client.\n\n---\n**Signatures:**\nAGXperience: _____________________  |  ${partyName}: _____________________`;
        }

        const { data: agr } = await supabase.from('agreements').insert([
          {
            name: `${contractType} - ${partyName}`,
            agreement_type: contractType.includes('NDA') ? 'NDA' : 'Master Service Agreement',
            lead_name: partyName,
            start_date: effectiveDate,
            status: 'Draft'
          }
        ]).select().single();

        result = {
          success: true,
          message: `${contractType} generated for "${partyName}"`,
          data: {
            agreement_id: agr?.id,
            contract_type: contractType,
            party_name: partyName,
            markdown_content: contractText
          }
        };
        break;
      }

      // 8. Client Issues & QA Tickets
      case 'create_issue': {
        const title = body.title;
        if (!title) throw new Error('title is required.');
        const dateYear = new Date().getFullYear();
        const rand = Math.floor(1000 + Math.random() * 9000);
        const ticketNumber = `ISS-${dateYear}-${rand}`;

        let projId = body.project_id;
        let projName = body.project_name;
        if (!projId && projName) {
          const { data: proj } = await supabase.from('projects').select('id, name, client_name, client_id').ilike('name', `%${projName}%`).limit(1).single();
          if (proj) {
            projId = proj.id;
            projName = proj.name;
            if (!body.client_name) body.client_name = proj.client_name;
            if (!body.client_id) body.client_id = proj.client_id;
          }
        }

        const { data: issue, error: issErr } = await supabase.from('project_issues').insert([
          {
            ticket_number: ticketNumber,
            title: title,
            description: body.description || title,
            issue_type: body.issue_type || 'Bug',
            priority: body.priority || 'Medium',
            status: 'REPORTED',
            project_id: projId || null,
            project_name: projName || null,
            client_id: body.client_id || null,
            client_name: body.client_name || null,
            reporter_name: body.reporter_name || 'Cloud AI Assistant',
            reporter_email: body.reporter_email || null,
            assigned_to: body.assigned_to || 'Developer'
          }
        ]).select().single();
        if (issErr) throw issErr;

        result = {
          success: true,
          message: `Issue ticket ${ticketNumber} created: "${title}"`,
          data: issue
        };
        break;
      }

      case 'list_issues': {
        let q = supabase.from('project_issues').select('*').order('created_at', { ascending: false });
        if (body.status) q = q.eq('status', body.status.toUpperCase());
        if (body.priority) q = q.eq('priority', body.priority);
        if (body.project_name) q = q.ilike('project_name', `%${body.project_name}%`);
        q = q.limit(body.limit || 20);

        const { data: issues, error } = await q;
        if (error) throw error;
        result = { success: true, message: `Found ${issues?.length || 0} issues`, data: issues };
        break;
      }

      case 'resolve_issue': {
        let ticketNum = body.ticket_number;
        let issueId = body.issue_id;

        let q = supabase.from('project_issues').select('*');
        if (ticketNum) q = q.eq('ticket_number', ticketNum);
        else if (issueId) q = q.eq('id', issueId);
        else throw new Error('Please provide ticket_number or issue_id.');

        const { data: currentIssue } = await q.limit(1).single();
        if (!currentIssue) throw new Error('Issue ticket not found.');

        const updates: any = {
          status: body.status || 'RESOLVED',
          resolution_notes: body.resolution_notes || 'Resolved via Cloud AI Assistant',
          resolved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data: updated, error: updErr } = await supabase
          .from('project_issues')
          .update(updates)
          .eq('id', currentIssue.id)
          .select()
          .single();
        if (updErr) throw updErr;

        result = {
          success: true,
          message: `Ticket ${currentIssue.ticket_number} marked ${updates.status}`,
          data: updated
        };
        break;
      }

      // 9. Expenses & Cost Tracking
      case 'record_expense': {
        const amount = parseNumeric(body.amount, 0);
        if (!amount) throw new Error('Valid expense amount is required.');
        const category = body.category || 'Infrastructure/Cloud';
        const description = body.description || 'Business Expense';
        const dateStr = body.expense_date || new Date().toISOString().split('T')[0];

        const { data: expense, error: expErr } = await supabase.from('expenses').insert([
          {
            category: category,
            amount: amount,
            expense_date: dateStr,
            vendor: body.vendor || 'Vendor',
            description: description,
            payment_method: body.payment_method || 'Bank Transfer',
            approved_by: body.approved_by || 'Leadership',
            status: 'Approved'
          }
        ]).select().single();
        if (expErr) throw expErr;

        result = {
          success: true,
          message: `Expense of ₹${amount.toLocaleString('en-IN')} recorded under "${category}"`,
          data: expense
        };
        break;
      }

      case 'list_expenses': {
        let q = supabase.from('expenses').select('*').order('expense_date', { ascending: false });
        if (body.category) q = q.eq('category', body.category);
        q = q.limit(body.limit || 20);

        const { data: items, error } = await q;
        if (error) throw error;
        const total = (items || []).reduce((acc: number, e: any) => acc + (Number(e.amount) || 0), 0);
        result = {
          success: true,
          message: `Found ${items?.length || 0} expenses totaling ₹${total.toLocaleString('en-IN')}`,
          data: { total_expenses: total, expenses: items }
        };
        break;
      }

      // 10. Documents & Asset Links
      case 'add_document_link': {
        const title = body.title;
        const fileUrl = body.file_url;
        if (!title || !fileUrl) throw new Error('title and file_url are required.');

        const { data: doc, error: docErr } = await supabase.from('documents').insert([
          {
            title: title,
            doc_type: body.doc_type || 'Proposal',
            file_url: fileUrl,
            client_name: body.client_name || null,
            lead_name: body.lead_name || null,
            uploaded_by: 'Cloud AI Assistant'
          }
        ]).select().single();
        if (docErr) throw docErr;

        result = {
          success: true,
          message: `Document link "${title}" saved to CRM vault`,
          data: doc
        };
        break;
      }

      case 'list_documents': {
        let q = supabase.from('documents').select('*').order('created_at', { ascending: false });
        if (body.doc_type) q = q.eq('doc_type', body.doc_type);
        q = q.limit(body.limit || 20);

        const { data: docs, error } = await q;
        if (error) throw error;
        result = { success: true, message: `Found ${docs?.length || 0} documents`, data: docs };
        break;
      }

      // 11. Partners & Affiliates
      case 'register_partner': {
        const name = body.name;
        const email = body.email;
        if (!name || !email) throw new Error('name and email are required.');

        const cleanCode = (body.referral_code || `AGX-${name.slice(0, 4).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`).trim();
        let commissionRate = parseNumeric(body.commission_rate, 0.10);
        if (commissionRate > 1) commissionRate = commissionRate / 100;

        const { data: partner, error: partErr } = await supabase.from('partners').insert([
          {
            name: name,
            email: email,
            company: body.company || null,
            phone: body.phone || null,
            referral_code: cleanCode,
            commission_rate: commissionRate,
            payout_method: body.payout_method || 'UPI',
            payout_details: body.payout_details || {},
            status: 'Active'
          }
        ]).select().single();
        if (partErr) throw partErr;

        result = {
          success: true,
          message: `Partner "${name}" registered with referral code "${cleanCode}" (${Math.round(commissionRate * 100)}% commission)`,
          data: partner
        };
        break;
      }

      case 'record_partner_payout': {
        const partnerRef = body.partner_code || body.partner_id;
        const amount = parseNumeric(body.amount, 0);
        if (!partnerRef || !amount) throw new Error('partner_code and valid amount are required.');

        const { data: partner } = await supabase
          .from('partners')
          .select('*')
          .or(`referral_code.ilike.%${partnerRef}%,id.eq.${partnerRef}`)
          .limit(1)
          .single();
        if (!partner) throw new Error('Partner not found.');

        const { data: payout, error: payErr } = await supabase.from('partner_payouts').insert([
          {
            partner_id: partner.id,
            amount: amount,
            payout_date: new Date().toISOString().split('T')[0],
            payment_method: body.payment_method || partner.payout_method || 'UPI',
            transaction_ref: body.transaction_ref || `TXN-${Date.now()}`,
            status: 'Completed',
            notes: body.notes || 'Commission Payout via Cloud AI Assistant'
          }
        ]).select().single();
        if (payErr) throw payErr;

        const newPaidEarnings = (Number(partner.paid_earnings) || 0) + amount;
        await supabase.from('partners').update({ paid_earnings: newPaidEarnings }).eq('id', partner.id);

        result = {
          success: true,
          message: `Payout of ₹${amount.toLocaleString('en-IN')} recorded for Partner "${partner.name}". Updated total paid: ₹${newPaidEarnings.toLocaleString('en-IN')}`,
          data: payout
        };
        break;
      }

      // 12. Team Workload & Notifications
      case 'send_notification': {
        const title = body.title;
        const message = body.message;
        if (!title || !message) throw new Error('title and message are required.');

        const { data: notif, error: notifErr } = await supabase.from('notifications').insert([
          {
            title: title,
            message: message,
            notification_type: body.notification_type || 'info',
            link: body.link || null,
            is_read: false
          }
        ]).select().single();
        if (notifErr) throw notifErr;

        result = {
          success: true,
          message: `Team notification "${title}" broadcasted across CRM dashboards`,
          data: notif
        };
        break;
      }

      case 'get_team_workload': {
        const [profilesRes, tasksRes] = await Promise.all([
          supabase.from('profiles').select('id, full_name, email, role, department, is_active'),
          supabase.from('tasks').select('id, title, assigned_to, priority, status, due_date').neq('status', 'COMPLETED')
        ]);

        const team = profilesRes.data || [];
        const activeTasks = tasksRes.data || [];

        const workloadSummary = team.map((member: any) => {
          const assigned = activeTasks.filter((t: any) => t.assigned_to && (t.assigned_to.toLowerCase() === member.full_name.toLowerCase() || member.full_name.toLowerCase().includes(t.assigned_to.toLowerCase())));
          return {
            name: member.full_name,
            role: member.role,
            department: member.department || 'Operations',
            active_tasks_count: assigned.length,
            urgent_tasks_count: assigned.filter((t: any) => ['High', 'Urgent'].includes(t.priority)).length,
            tasks: assigned.map((t: any) => ({ id: t.id, title: t.title, priority: t.priority, due_date: t.due_date }))
          };
        });

        result = {
          success: true,
          message: `Team workload calculated for ${team.length} members (${activeTasks.length} active tasks total)`,
          data: {
            total_active_tasks: activeTasks.length,
            team_workload: workloadSummary
          }
        };
        break;
      }

      // 13. Client Lifecycle & Edits
      case 'update_client': {
        const id = body.id;
        const name = body.name;
        if (!id && !name) throw new Error('Either client id or name is required.');

        let query = supabase.from('clients').select('*');
        if (id) {
          query = query.eq('id', id);
        } else {
          query = query.ilike('name', `%${name}%`);
        }
        const { data: clients, error: findErr } = await query;
        if (findErr) throw findErr;
        if (!clients || clients.length === 0) throw new Error(`Client "${name || id}" not found`);
        const client = clients[0];

        const updates: any = {};
        if (body.company !== undefined) updates.company = body.company;
        if (body.phone !== undefined) updates.phone = body.phone;
        if (body.email !== undefined) updates.email = body.email;
        if (body.address !== undefined) updates.address = body.address;
        if (body.gst_tax_id !== undefined) updates.gst_tax_id = body.gst_tax_id;
        if (body.industry !== undefined) updates.industry = body.industry;
        if (body.website !== undefined) updates.website = body.website;
        if (body.account_manager !== undefined) updates.account_manager = body.account_manager;
        if (body.status !== undefined) updates.status = body.status;
        if (body.notes !== undefined) updates.notes = body.notes;
        updates.updated_at = new Date().toISOString();

        const { data: updated, error: updErr } = await supabase
          .from('clients')
          .update(updates)
          .eq('id', client.id)
          .select()
          .single();
        if (updErr) throw updErr;

        result = {
          success: true,
          message: `Client "${client.name}" successfully updated`,
          data: updated
        };
        break;
      }

      // 14. Projects & Milestones Full Lifecycle
      case 'update_project': {
        const id = body.id;
        const name = body.name;
        if (!id && !name) throw new Error('Either project id or name is required.');

        let query = supabase.from('projects').select('*');
        if (id) {
          query = query.eq('id', id);
        } else {
          query = query.ilike('name', `%${name}%`);
        }
        const { data: projects, error: findErr } = await query;
        if (findErr) throw findErr;
        if (!projects || projects.length === 0) throw new Error(`Project "${name || id}" not found`);
        const project = projects[0];

        const updates: any = {};
        if (body.status !== undefined) updates.status = body.status;
        if (body.progress !== undefined) updates.progress = Number(body.progress);
        if (body.due_date !== undefined) updates.due_date = body.due_date;
        if (body.delivery_date !== undefined) updates.delivery_date = body.delivery_date;
        if (body.project_manager !== undefined) updates.project_manager = body.project_manager;
        if (body.priority !== undefined) updates.priority = body.priority;
        if (body.project_value !== undefined) updates.project_value = Number(body.project_value);
        if (body.description !== undefined) updates.description = body.description;
        updates.updated_at = new Date().toISOString();

        const { data: updated, error: updErr } = await supabase
          .from('projects')
          .update(updates)
          .eq('id', project.id)
          .select()
          .single();
        if (updErr) throw updErr;

        result = {
          success: true,
          message: `Project "${project.name}" updated (Status: ${updated.status}, Progress: ${updated.progress}%)`,
          data: updated
        };
        break;
      }

      case 'create_milestone': {
        const title = body.title;
        if (!title) throw new Error('title is required.');
        let projectId = body.project_id;
        if (!projectId && body.project_name) {
          const { data: p } = await supabase.from('projects').select('id, name').ilike('name', `%${body.project_name}%`).limit(1);
          if (p && p.length > 0) projectId = p[0].id;
        }
        if (!projectId) throw new Error('Valid project_id or project_name is required.');

        const { data: milestone, error: mErr } = await supabase
          .from('project_milestones')
          .insert([
            {
              project_id: projectId,
              title: title,
              due_date: body.due_date || null,
              amount: parseNumeric(body.amount, 0),
              progress: parseNumeric(body.progress, 0),
              status: body.status || 'Pending'
            }
          ])
          .select()
          .single();
        if (mErr) throw mErr;

        result = {
          success: true,
          message: `Milestone "${title}" created for project successfully`,
          data: milestone
        };
        break;
      }

      case 'update_milestone': {
        const id = body.id;
        const title = body.title;
        if (!id && !title) throw new Error('Either milestone id or title is required.');

        let query = supabase.from('project_milestones').select('*');
        if (id) {
          query = query.eq('id', id);
        } else {
          query = query.ilike('title', `%${title}%`);
        }
        const { data: milestones, error: findErr } = await query;
        if (findErr) throw findErr;
        if (!milestones || milestones.length === 0) throw new Error(`Milestone not found`);
        const milestone = milestones[0];

        const updates: any = {};
        if (body.status !== undefined) updates.status = body.status;
        if (body.progress !== undefined) updates.progress = parseNumeric(body.progress, 0);
        if (body.due_date !== undefined) updates.due_date = body.due_date;
        if (body.amount !== undefined) updates.amount = parseNumeric(body.amount, 0);
        if (body.is_invoiced !== undefined) updates.is_invoiced = Boolean(body.is_invoiced);

        const { data: updated, error: updErr } = await supabase
          .from('project_milestones')
          .update(updates)
          .eq('id', milestone.id)
          .select()
          .single();
        if (updErr) throw updErr;

        result = {
          success: true,
          message: `Milestone "${milestone.title}" updated (Status: ${updated.status}, Progress: ${updated.progress}%)`,
          data: updated
        };
        break;
      }

      // 15. Financial Invoices & Quotations Listing
      case 'list_invoices': {
        let q = supabase.from('invoices').select('*').order('created_at', { ascending: false });
        if (body.client_name) {
          q = q.ilike('client_name', `%${body.client_name}%`);
        }
        if (body.status) {
          q = q.eq('status', body.status);
        }
        q = q.limit(body.limit || 20);
        const { data, error } = await q;
        if (error) throw error;
        result = {
          success: true,
          message: `Found ${data?.length || 0} invoices`,
          data
        };
        break;
      }

      case 'list_quotations': {
        let q = supabase.from('quotations').select('*').order('created_at', { ascending: false });
        if (body.client_name) {
          q = q.ilike('client_name', `%${body.client_name}%`);
        }
        if (body.lead_name) {
          q = q.ilike('lead_name', `%${body.lead_name}%`);
        }
        if (body.status) {
          q = q.eq('status', body.status);
        }
        q = q.limit(body.limit || 20);
        const { data, error } = await q;
        if (error) throw error;
        result = {
          success: true,
          message: `Found ${data?.length || 0} quotations`,
          data
        };
        break;
      }

      case 'list_agreements': {
        let q = supabase.from('agreements').select('*').order('created_at', { ascending: false });
        if (body.client_name) {
          q = q.ilike('name', `%${body.client_name}%`);
        }
        if (body.agreement_type) {
          q = q.eq('agreement_type', body.agreement_type);
        }
        if (body.status) {
          q = q.eq('status', body.status);
        }
        q = q.limit(body.limit || 20);
        const { data, error } = await q;
        if (error) throw error;
        result = {
          success: true,
          message: `Found ${data?.length || 0} agreements/contracts`,
          data
        };
        break;
      }

      // 16. Credentials Vault Storage
      case 'store_vault_credential': {
        const platformName = body.platform_name;
        const username = body.username;
        if (!platformName || !username) throw new Error('platform_name and username are required.');

        let clientId = body.client_id;
        if (!clientId && body.client_name) {
          const { data: c } = await supabase.from('clients').select('id').ilike('name', `%${body.client_name}%`).limit(1);
          if (c && c.length > 0) clientId = c[0].id;
        }

        const { data: cred, error: credErr } = await supabase
          .from('credentials_vault')
          .insert([
            {
              platform_name: platformName,
              username: username,
              password_encrypted: body.password || body.password_encrypted || '',
              api_key_encrypted: body.api_key || body.api_key_encrypted || '',
              service_url: body.service_url || null,
              environment: body.environment || 'Production',
              client_id: clientId || null,
              notes: body.notes || 'Stored via AGX AI Assistant'
            }
          ])
          .select()
          .single();
        if (credErr) throw credErr;

        result = {
          success: true,
          message: `Credentials for "${platformName}" (${body.environment || 'Production'}) successfully saved in the secure vault`,
          data: {
            id: cred.id,
            platform_name: cred.platform_name,
            username: cred.username,
            environment: cred.environment,
            created_at: cred.created_at
          }
        };
        break;
      }

      // 17. Partner Referrals
      case 'create_partner_referral': {
        const clientName = body.client_name;
        if (!clientName) throw new Error('client_name is required.');

        let partnerId = body.partner_id;
        let partnerName = body.partner_name;
        let commissionRate = parseNumeric(body.commission_rate, 0.10);
        if (commissionRate > 1) commissionRate = commissionRate / 100;

        if (!partnerId && (partnerName || body.referral_code)) {
          let q = supabase.from('partners').select('*');
          if (body.referral_code) {
            q = q.eq('referral_code', body.referral_code);
          } else {
            q = q.ilike('name', `%${partnerName}%`);
          }
          const { data: p } = await q.limit(1);
          if (p && p.length > 0) {
            partnerId = p[0].id;
            partnerName = p[0].name;
            if (p[0].commission_rate) commissionRate = parseNumeric(p[0].commission_rate, 0.10);
          }
        }
        if (!partnerId) throw new Error('Valid partner_id, partner_name, or referral_code is required.');

        const dealValue = parseNumeric(body.deal_value ?? body.estimated_deal_value ?? body.amount, 0);
        const commissionEarned = dealValue * commissionRate;

        const { data: referral, error: refErr } = await supabase
          .from('partner_referrals')
          .insert([
            {
              partner_id: partnerId,
              client_name: clientName,
              client_email: body.client_email || null,
              client_phone: body.client_phone || null,
              company: body.company || null,
              project_type: body.project_type || 'AI Automation',
              deal_value: dealValue,
              commission_rate: commissionRate,
              commission_earned: commissionEarned,
              deal_status: body.deal_status || 'NEW',
              notes: body.notes || 'Created via AGX Assistant'
            }
          ])
          .select()
          .single();
        if (refErr) throw refErr;

        result = {
          success: true,
          message: `Partner referral for "${clientName}" logged under Partner "${partnerName || partnerId}" (Estimated commission: ₹${commissionEarned.toLocaleString('en-IN')})`,
          data: referral
        };
        break;
      }

      // 18. Audit Logs History
      case 'get_audit_logs': {
        let q = supabase.from('audit_logs').select('*').order('created_at', { ascending: false });
        if (body.user_name) {
          q = q.ilike('user_name', `%${body.user_name}%`);
        }
        if (body.action_type) {
          q = q.eq('action_type', body.action_type);
        }
        if (body.entity_type) {
          q = q.eq('entity_type', body.entity_type);
        }
        q = q.limit(body.limit || 20);
        const { data, error } = await q;
        if (error) throw error;
        result = {
          success: true,
          message: `Retrieved ${data?.length || 0} audit logs`,
          data
        };
        break;
      }

      default:
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({
            success: false,
            error: `Tool "${toolName}" not found`,
            available_tools: [
              'get_daily_briefing', 'get_financial_summary', 'search_leads', 'create_lead',
              'update_lead', 'log_lead_activity', 'convert_lead_to_client', 'search_clients',
              'create_client', 'update_client', 'list_projects', 'create_project', 'update_project',
              'get_tasks', 'create_task', 'update_task', 'record_payment', 'get_upcoming_events',
              'schedule_event', 'manage_milestones', 'manage_invoices', 'manage_quotations',
              'manage_issues', 'manage_expenses', 'manage_vault', 'manage_agreements',
              'manage_partners', 'manage_calendar', 'manage_team'
            ]
          })
        };
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(result)
    };
  } catch (err: any) {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: false,
        error: err?.message || String(err),
        hint: 'Please check required parameters or try again'
      })
    };
  }
};
