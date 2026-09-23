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

const expectedToken = process.env.API_AUTH_TOKEN || 'agx_secret_token_12345';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

export const handler = async (event: any) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders,
      body: ''
    };
  }

  // Health check endpoint
  if (event.path.endsWith('/health')) {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        status: 'ok',
        service: 'AGX CRM Netlify Serverless MCP Hub',
        timestamp: new Date().toISOString()
      })
    };
  }

  // Verify Bearer Token for tool executions
  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (!authHeader) {
    return {
      statusCode: 401,
      headers: corsHeaders,
      body: JSON.stringify({ success: false, error: 'Authorization header required' })
    };
  }

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (token !== expectedToken) {
    return {
      statusCode: 403,
      headers: corsHeaders,
      body: JSON.stringify({ success: false, error: 'Invalid Bearer token' })
    };
  }

  // Extract tool name from path (e.g. /api/tools/create_lead or /.netlify/functions/mcp/tools/create_lead)
  const pathParts = event.path.split('/').filter(Boolean);
  const toolName = pathParts[pathParts.length - 1];

  let body: any = {};
  try {
    if (event.body) {
      body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    }
  } catch (e) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ success: false, error: 'Invalid JSON body' })
    };
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
        const { data, error } = await supabase
          .from('leads')
          .insert([
            {
              name: body.name,
              company: body.company || null,
              phone: body.phone || null,
              email: body.email || null,
              interested_service: body.interested_service || 'AI Automation',
              estimated_deal_value: body.estimated_deal_value || 0,
              priority: body.priority || 'Medium',
              source: body.source || 'Cloud AI Assistant',
              status: 'NEW',
              next_follow_up: body.next_follow_up || null,
              notes: body.notes || null
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
        result = { success: true, message: `Lead "${body.name}" created`, data };
        break;
      }

      case 'update_lead': {
        let leadId = body.id;
        if (!leadId && body.name) {
          const { data: found } = await supabase.from('leads').select('id').ilike('name', `%${body.name}%`).limit(1).single();
          if (found) leadId = found.id;
        }
        if (!leadId) throw new Error('Lead not found. Please provide lead id or name.');

        const updates: any = { updated_at: new Date().toISOString() };
        if (body.status) updates.status = body.status;
        if (body.estimated_deal_value !== undefined) updates.estimated_deal_value = body.estimated_deal_value;
        if (body.priority) updates.priority = body.priority;
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
        const { data, error } = await supabase
          .from('clients')
          .insert([
            {
              name: body.name,
              company: body.company,
              email: body.email || null,
              phone: body.phone || null,
              total_value: body.total_value || 0,
              notes: body.notes || null,
              status: 'Active'
            }
          ])
          .select()
          .single();
        if (error) throw error;
        result = { success: true, message: `Client "${body.company}" created`, data };
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
        const { data, error } = await supabase
          .from('projects')
          .insert([
            {
              name: body.name,
              client_name: body.client_name,
              service_type: body.service_type || 'Workflow Automation',
              project_value: body.project_value || 0,
              pending_amount: body.project_value || 0,
              status: 'PLANNING',
              due_date: body.due_date || null
            }
          ])
          .select()
          .single();
        if (error) throw error;
        result = { success: true, message: `Project "${body.name}" created`, data };
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

        const newPaid = (Number(currentInv.paid_amount) || 0) + Number(body.amount);
        const newStatus = newPaid >= Number(currentInv.total) ? 'Paid' : 'Partially Paid';

        await supabase.from('invoices').update({ paid_amount: newPaid, status: newStatus }).eq('id', invId);

        result = {
          success: true,
          message: `Payment of ₹${body.amount} recorded. Invoice is now ${newStatus}.`
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

      default:
        return {
          statusCode: 404,
          headers: corsHeaders,
          body: JSON.stringify({ success: false, error: `Tool "${toolName}" not found` })
        };
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(result)
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ success: false, error: err?.message || String(err) })
    };
  }
};
