#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

import { searchLeads, createLead, updateLead, logLeadActivity } from './tools/leads.js';
import { searchClients, createClient, updateClient } from './tools/clients.js';
import { listProjects, createProject, updateProject } from './tools/projects.js';
import { getTasks, createTask, updateTask } from './tools/tasks.js';
import { getFinancialSummary, listInvoices, recordPayment } from './tools/finance.js';
import { getUpcomingEvents, scheduleEvent } from './tools/calendar.js';

// Define AGX CRM MCP Server
const server = new Server(
  {
    name: 'agx-crm-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register Tool Definitions
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      // 1. Leads
      {
        name: 'search_leads',
        description: 'Search and filter sales leads in AGX CRM by name, company, email, phone, or status.',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search term across name, company, email, or phone' },
            status: {
              type: 'string',
              enum: ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL SENT', 'NEGOTIATION', 'WON', 'LOST'],
              description: 'Filter by pipeline stage',
            },
            priority: { type: 'string', enum: ['Low', 'Medium', 'High', 'Urgent'] },
            assigned_to: { type: 'string', description: 'Filter by assigned sales executive' },
            limit: { type: 'number', description: 'Max results to return (default 20)' },
          },
        },
      },
      {
        name: 'create_lead',
        description: 'Create a new prospect/lead in AGX CRM with contact details and deal value.',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Contact person full name' },
            company: { type: 'string', description: 'Company or business name' },
            phone: { type: 'string', description: 'Phone or mobile number' },
            email: { type: 'string', description: 'Email address' },
            whatsapp: { type: 'string', description: 'WhatsApp number if different' },
            location: { type: 'string', description: 'City, state, or country' },
            interested_service: {
              type: 'string',
              description: 'Service interest (e.g. AI Automation, Custom AI Agent, Web App)',
            },
            estimated_deal_value: { type: 'number', description: 'Estimated commercial value in local currency (INR/USD)' },
            priority: { type: 'string', enum: ['Low', 'Medium', 'High', 'Urgent'] },
            source: { type: 'string', description: 'Lead source (e.g. Website, Referral, Cold Outreach, LinkedIn)' },
            assigned_to: { type: 'string', description: 'Sales rep assigned' },
            next_follow_up: { type: 'string', description: 'ISO date or timestamp for next follow-up call' },
            notes: { type: 'string', description: 'Initial qualification notes or conversation summary' },
          },
          required: ['name'],
        },
      },
      {
        name: 'update_lead',
        description: 'Update lead status (move deal across pipeline), deal value, priority, or next follow-up.',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Lead UUID (optional if name provided)' },
            name: { type: 'string', description: 'Lead contact or company name to search' },
            status: {
              type: 'string',
              enum: ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL SENT', 'NEGOTIATION', 'WON', 'LOST'],
            },
            estimated_deal_value: { type: 'number' },
            priority: { type: 'string', enum: ['Low', 'Medium', 'High', 'Urgent'] },
            next_follow_up: { type: 'string', description: 'ISO date for next scheduled follow-up' },
            notes: { type: 'string', description: 'Update notes' },
            assigned_to: { type: 'string' },
          },
        },
      },
      {
        name: 'log_lead_activity',
        description: 'Log a call, WhatsApp chat note, meeting summary, or email for a lead.',
        inputSchema: {
          type: 'object',
          properties: {
            lead_id: { type: 'string', description: 'Lead UUID (optional if lead_name provided)' },
            lead_name: { type: 'string', description: 'Name of the lead' },
            user_name: { type: 'string', description: 'Name of person logging the activity' },
            activity_type: {
              type: 'string',
              enum: ['Call', 'WhatsApp', 'Email', 'Meeting', 'Note'],
            },
            notes: { type: 'string', description: 'Summary of the discussion, outcome, or agreement' },
            set_next_follow_up: { type: 'string', description: 'Optional next follow-up date/time' },
          },
          required: ['activity_type', 'notes'],
        },
      },

      // 2. Clients
      {
        name: 'search_clients',
        description: 'Search active or past clients in AGX CRM by name, company, or email.',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Company name, contact name, or email' },
            status: { type: 'string', enum: ['Active', 'Inactive', 'On Hold'] },
            limit: { type: 'number' },
          },
        },
      },
      {
        name: 'create_client',
        description: 'Create an active client or convert an existing won lead into a client profile.',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Primary contact person' },
            company: { type: 'string', description: 'Company or business name' },
            email: { type: 'string' },
            phone: { type: 'string' },
            website: { type: 'string' },
            industry: { type: 'string' },
            lead_id: { type: 'string', description: 'Optional lead ID if converting from a lead' },
            total_value: { type: 'number', description: 'Total agreed contract or project value' },
            notes: { type: 'string' },
          },
          required: ['name', 'company'],
        },
      },
      {
        name: 'update_client',
        description: 'Update client profile details, status, or notes.',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Client UUID' },
            company: { type: 'string', description: 'Company name to match if ID not known' },
            name: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            status: { type: 'string', enum: ['Active', 'Inactive', 'On Hold'] },
            notes: { type: 'string' },
          },
        },
      },

      // 3. Projects
      {
        name: 'list_projects',
        description: 'List client projects, filter by status (PLANNING, IN PROGRESS, COMPLETED) or manager.',
        inputSchema: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['NOT STARTED', 'PLANNING', 'IN PROGRESS', 'TESTING', 'CLIENT REVIEW', 'REVISION', 'COMPLETED', 'MAINTENANCE'],
            },
            client_name: { type: 'string', description: 'Filter by client company name' },
            project_manager: { type: 'string', description: 'Filter by assigned PM' },
            limit: { type: 'number' },
          },
        },
      },
      {
        name: 'create_project',
        description: 'Initialize a new client project with budget, timeline, and scope.',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Project name' },
            client_name: { type: 'string', description: 'Client company name' },
            client_id: { type: 'string' },
            service_type: { type: 'string', description: 'e.g. Custom AI Agent, Workflow Automation' },
            project_manager: { type: 'string' },
            start_date: { type: 'string', description: 'YYYY-MM-DD' },
            due_date: { type: 'string', description: 'YYYY-MM-DD' },
            project_value: { type: 'number', description: 'Agreed project price' },
            priority: { type: 'string', enum: ['Low', 'Medium', 'High', 'Urgent'] },
            description: { type: 'string' },
          },
          required: ['name', 'client_name'],
        },
      },
      {
        name: 'update_project',
        description: 'Update project progress percentage (0-100), status, or due date.',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            status: {
              type: 'string',
              enum: ['NOT STARTED', 'PLANNING', 'IN PROGRESS', 'TESTING', 'CLIENT REVIEW', 'REVISION', 'COMPLETED', 'MAINTENANCE'],
            },
            progress: { type: 'number', description: 'Percentage completed (0-100)' },
            received_amount: { type: 'number' },
            due_date: { type: 'string' },
            description: { type: 'string' },
          },
        },
      },

      // 4. Tasks
      {
        name: 'get_tasks',
        description: 'Get tasks across projects. Filter by status (TO DO, IN PROGRESS, COMPLETED), priority, or assignee.',
        inputSchema: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['TO DO', 'IN PROGRESS', 'IN REVIEW', 'COMPLETED', 'BLOCKED'] },
            priority: { type: 'string', enum: ['Low', 'Medium', 'High', 'Urgent'] },
            assigned_to: { type: 'string' },
            due_today: { type: 'boolean', description: 'Only show tasks due today' },
            limit: { type: 'number' },
          },
        },
      },
      {
        name: 'create_task',
        description: 'Create a new task linked to a project, client, or lead.',
        inputSchema: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'Task title' },
            description: { type: 'string' },
            assigned_to: { type: 'string' },
            priority: { type: 'string', enum: ['Low', 'Medium', 'High', 'Urgent'] },
            due_date: { type: 'string', description: 'YYYY-MM-DD' },
            project_name: { type: 'string' },
            client_name: { type: 'string' },
          },
          required: ['title'],
        },
      },
      {
        name: 'update_task',
        description: 'Mark a task completed or update its progress/assignee.',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string', description: 'Task title to match if ID not known' },
            status: { type: 'string', enum: ['TO DO', 'IN PROGRESS', 'IN REVIEW', 'COMPLETED', 'BLOCKED'] },
            assigned_to: { type: 'string' },
            due_date: { type: 'string' },
            actual_hours: { type: 'number' },
          },
        },
      },

      // 5. Finance
      {
        name: 'get_financial_summary',
        description: 'Get comprehensive business financial health: total invoiced, collected, outstanding balances, and active pipeline value.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'list_invoices',
        description: 'List and filter invoices by status (Draft, Sent, Paid, Partially Paid, Overdue).',
        inputSchema: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['Draft', 'Sent', 'Paid', 'Partially Paid', 'Overdue'] },
            client_name: { type: 'string' },
            limit: { type: 'number' },
          },
        },
      },
      {
        name: 'record_payment',
        description: 'Record a payment received for an invoice and update client outstanding balances.',
        inputSchema: {
          type: 'object',
          properties: {
            invoice_number: { type: 'string', description: 'e.g. INV-2026-001' },
            invoice_id: { type: 'string' },
            amount: { type: 'number', description: 'Amount received' },
            payment_method: { type: 'string', enum: ['Bank Transfer', 'UPI', 'Stripe', 'PayPal', 'Wire'] },
            transaction_id: { type: 'string' },
            notes: { type: 'string' },
          },
          required: ['amount'],
        },
      },

      // 6. Calendar
      {
        name: 'get_upcoming_events',
        description: 'Get upcoming meetings, client follow-ups, and calendar deadlines.',
        inputSchema: {
          type: 'object',
          properties: {
            days_ahead: { type: 'number', description: 'Lookahead in days (default 7)' },
            event_type: { type: 'string', enum: ['Meeting', 'Client Follow-up', 'Project Deadline', 'Task Due', 'Payment Reminder'] },
            limit: { type: 'number' },
          },
        },
      },
      {
        name: 'schedule_event',
        description: 'Schedule a meeting or calendar event.',
        inputSchema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            event_type: { type: 'string', enum: ['Meeting', 'Client Follow-up', 'Project Deadline', 'Task Due'] },
            start_time: { type: 'string', description: 'ISO 8601 start time (e.g. 2026-09-25T14:30:00Z)' },
            end_time: { type: 'string', description: 'ISO 8601 end time' },
            meeting_url: { type: 'string', description: 'Google Meet, Zoom, or Teams link' },
            description: { type: 'string' },
            assigned_to: { type: 'string' },
            client_name: { type: 'string' },
          },
          required: ['title', 'start_time'],
        },
      },
    ],
  };
});

// Handle Tool Execution Requests
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const toolArgs = args || {};

  try {
    let result;

    switch (name) {
      // Leads
      case 'search_leads':
        result = await searchLeads(toolArgs as any);
        break;
      case 'create_lead':
        result = await createLead(toolArgs as any);
        break;
      case 'update_lead':
        result = await updateLead(toolArgs as any);
        break;
      case 'log_lead_activity':
        result = await logLeadActivity(toolArgs as any);
        break;

      // Clients
      case 'search_clients':
        result = await searchClients(toolArgs as any);
        break;
      case 'create_client':
        result = await createClient(toolArgs as any);
        break;
      case 'update_client':
        result = await updateClient(toolArgs as any);
        break;

      // Projects
      case 'list_projects':
        result = await listProjects(toolArgs as any);
        break;
      case 'create_project':
        result = await createProject(toolArgs as any);
        break;
      case 'update_project':
        result = await updateProject(toolArgs as any);
        break;

      // Tasks
      case 'get_tasks':
        result = await getTasks(toolArgs as any);
        break;
      case 'create_task':
        result = await createTask(toolArgs as any);
        break;
      case 'update_task':
        result = await updateTask(toolArgs as any);
        break;

      // Finance
      case 'get_financial_summary':
        result = await getFinancialSummary();
        break;
      case 'list_invoices':
        result = await listInvoices(toolArgs as any);
        break;
      case 'record_payment':
        result = await recordPayment(toolArgs as any);
        break;

      // Calendar
      case 'get_upcoming_events':
        result = await getUpcomingEvents(toolArgs as any);
        break;
      case 'schedule_event':
        result = await scheduleEvent(toolArgs as any);
        break;

      default:
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: false, error: `Unknown tool: ${name}` }, null, 2),
            },
          ],
          isError: true,
        };
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
      isError: !result.success,
    };
  } catch (err: any) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ success: false, error: err?.message || String(err) }, null, 2),
        },
      ],
      isError: true,
    };
  }
});

// Start Server via Stdio
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[AGX CRM MCP Server] Running on stdio transport');
}

main().catch((err) => {
  console.error('[AGX CRM MCP Server] Fatal error:', err);
  process.exit(1);
});
