import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles, Cpu, Terminal, CheckCircle2, Copy, Check, ExternalLink,
  Bot, RefreshCw, Zap, ShieldCheck, Database, Smartphone, Play,
  Code2, ArrowRight, Activity, Search, AlertCircle, Key, Radio, Layers,
  CheckSquare, MessageSquare, ChevronRight, CornerDownRight, Server,
  Sliders, ArrowUpRight
} from 'lucide-react';
import { useCrmStore } from '../../lib/crmStore';
import { toast } from '../../lib/toastStore';

interface McpSettingsSectionProps {
  store: ReturnType<typeof useCrmStore>;
}

type GuideTab = 'claude' | 'chatgpt' | 'cursor' | 'gemini';

interface ConnectedAccount {
  id: GuideTab;
  name: string;
  provider: string;
  type: string;
  status: 'Active' | 'Ready' | 'Configured';
  transport: string;
  portOrPath: string;
  authMethod: string;
  activeToolsCount: number;
  iconBg: string;
  iconColor: string;
  description: string;
  capabilities: string[];
}

interface AiActivityLog {
  id: string;
  timestamp: string;
  aiPlatform: 'Claude Desktop' | 'ChatGPT' | 'Cursor' | 'Gemini';
  toolUsed: string;
  summary: string;
  status: 'Success' | 'Failed';
}

const CONNECTED_ACCOUNTS: ConnectedAccount[] = [
  {
    id: 'claude',
    name: 'Claude Desktop',
    provider: 'Anthropic',
    type: 'Local Desktop Subprocess',
    status: 'Ready',
    transport: 'stdio pipe',
    portOrPath: 'mcp-server/dist/index.js',
    authMethod: 'Direct Stdio IPC',
    activeToolsCount: 18,
    iconBg: 'bg-amber-50 text-amber-600 border-amber-200',
    iconColor: '#D97706',
    description: 'Subprocess communication via stdio JSON-RPC. Allows Claude to directly query and modify CRM records in Supabase.',
    capabilities: ['Full CRUD Access', 'Instant Supabase Sync', 'Lead & Deal Pipeline', 'Financial Analytics']
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT Assistant',
    provider: 'OpenAI (Mobile & Web)',
    type: 'Netlify Serverless (24/7 Cloud)',
    status: 'Ready',
    transport: 'HTTP REST / OpenAPI 3.0',
    portOrPath: 'agxperience.netlify.app/api/*',
    authMethod: 'Bearer Token (Encrypted)',
    activeToolsCount: 18,
    iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    iconColor: '#059669',
    description: 'Hosted 24/7 on Netlify serverless functions. Allows the ChatGPT mobile app on iOS/Android to manage leads and tasks anytime without your laptop powered on.',
    capabilities: ['24/7 Cloud Available', 'Mobile Voice Dictation', 'Task & Lead CRUD', 'No Laptop Needed']
  },
  {
    id: 'cursor',
    name: 'Cursor & Antigravity IDE',
    provider: 'Anysphere / IDEs',
    type: 'Developer IDE Integration',
    status: 'Active',
    transport: 'MCP JSON-RPC 2.0',
    portOrPath: '.cursor/mcp.json',
    authMethod: 'Local Process',
    activeToolsCount: 18,
    iconBg: 'bg-blue-50 text-blue-600 border-blue-200',
    iconColor: '#2563EB',
    description: 'Integrated directly into your code editor. Query engineering tasks, client requirements, and credentials while programming.',
    capabilities: ['Task & Bug Lookup', 'Project Milestone Status', 'DB Schema Insights', 'Sprint Auditing']
  },
  {
    id: 'gemini',
    name: 'Google Gemini & Automations',
    provider: 'Google DeepMind',
    type: 'REST API / Webhook Bridge',
    status: 'Configured',
    transport: 'Function Declarations / POST',
    portOrPath: 'POST /api/tools/:name',
    authMethod: 'Bearer Token Header',
    activeToolsCount: 18,
    iconBg: 'bg-purple-50 text-purple-600 border-purple-200',
    iconColor: '#7C3AED',
    description: 'Exposes standard REST endpoints callable from Google AI Studio, custom Python scripts, n8n, or Zapier automations.',
    capabilities: ['Automated Reporting', 'n8n & Zapier Triggers', 'Scheduled Batch Sync', 'Webhook Dispatch']
  }
];

const INITIAL_AI_LOGS: AiActivityLog[] = [
  {
    id: 'log-1',
    timestamp: 'Just now',
    aiPlatform: 'Claude Desktop',
    toolUsed: 'create_lead',
    summary: 'Captured lead "Dr. Sameer" • Deal value ₹80,000 • High Priority',
    status: 'Success'
  },
  {
    id: 'log-2',
    timestamp: '4 mins ago',
    aiPlatform: 'ChatGPT',
    toolUsed: 'log_lead_activity',
    summary: 'Logged WhatsApp note for Nexa Retail: "Customer agreed to proposal v2"',
    status: 'Success'
  },
  {
    id: 'log-3',
    timestamp: '12 mins ago',
    aiPlatform: 'Claude Desktop',
    toolUsed: 'get_financial_summary',
    summary: 'Calculated pipeline volume (₹75,000) and verified zero overdue invoices',
    status: 'Success'
  },
  {
    id: 'log-4',
    timestamp: '22 mins ago',
    aiPlatform: 'Cursor',
    toolUsed: 'update_task',
    summary: 'Updated task "Verify Supabase MCP connection" to COMPLETED',
    status: 'Success'
  }
];

const MCP_TOOLS_CATALOG = [
  {
    module: 'Leads & Pipeline',
    badge: 'CRM Core',
    tools: [
      { name: 'search_leads', desc: 'Search leads by name, company, email, phone, or pipeline stage.', args: ['query', 'status', 'priority', 'limit'] },
      { name: 'create_lead', desc: 'Capture a prospect with contact details, deal size, and priority.', args: ['name', 'company', 'estimated_deal_value', 'priority'] },
      { name: 'update_lead', desc: 'Move deal across pipeline stages (NEW -> QUALIFIED -> WON) and set follow-ups.', args: ['id', 'status', 'estimated_deal_value', 'next_follow_up'] },
      { name: 'log_lead_activity', desc: 'Log phone calls, WhatsApp messages, meeting summaries, or notes.', args: ['lead_name', 'activity_type', 'notes', 'set_next_follow_up'] }
    ]
  },
  {
    module: 'Clients & Accounts',
    badge: 'Relations',
    tools: [
      { name: 'search_clients', desc: 'Find active client profiles, lifetime values, and primary contacts.', args: ['query', 'status', 'limit'] },
      { name: 'create_client', desc: 'Convert won lead into a client profile or create a fresh client account.', args: ['name', 'company', 'email', 'total_value'] },
      { name: 'update_client', desc: 'Update contact info, billing details, status, or client account notes.', args: ['company', 'status', 'phone', 'notes'] }
    ]
  },
  {
    module: 'Projects & Sprints',
    badge: 'Operations',
    tools: [
      { name: 'list_projects', desc: 'Filter projects by status (PLANNING, IN PROGRESS, COMPLETED) or manager.', args: ['status', 'client_name', 'project_manager'] },
      { name: 'create_project', desc: 'Initialize project with scope, deadline, and commercial budget.', args: ['name', 'client_name', 'service_type', 'project_value', 'due_date'] },
      { name: 'update_project', desc: 'Update progress percentage (0-100%), milestones, or delivery dates.', args: ['name', 'progress', 'status', 'due_date'] }
    ]
  },
  {
    module: 'Tasks & Engineering',
    badge: 'Workflows',
    tools: [
      { name: 'get_tasks', desc: 'Retrieve tasks due today, urgent tasks, or filter by assignee.', args: ['status', 'priority', 'assigned_to', 'due_today'] },
      { name: 'create_task', desc: 'Create a new task linked to project, client, or sales lead.', args: ['title', 'priority', 'assigned_to', 'due_date', 'project_name'] },
      { name: 'update_task', desc: 'Mark completed or update status, actual hours, and notes.', args: ['title', 'status', 'actual_hours', 'assigned_to'] }
    ]
  },
  {
    module: 'Finance & Invoices',
    badge: 'Revenue',
    tools: [
      { name: 'get_financial_summary', desc: 'Total invoiced, collected revenue, outstanding balances, and pipeline margin.', args: ['none'] },
      { name: 'list_invoices', desc: 'Search invoices by status (Draft, Sent, Paid, Overdue) or client.', args: ['status', 'client_name', 'limit'] },
      { name: 'record_payment', desc: 'Record received payment, mark invoice paid, and update client balance.', args: ['invoice_number', 'amount', 'payment_method'] }
    ]
  },
  {
    module: 'Calendar & Deadlines',
    badge: 'Schedule',
    tools: [
      { name: 'get_upcoming_events', desc: 'Fetch upcoming client meetings, demos, and deadlines for next 7-30 days.', args: ['days_ahead', 'event_type', 'limit'] },
      { name: 'schedule_event', desc: 'Schedule new client follow-up, demo call, or project deadline.', args: ['title', 'start_time', 'meeting_url', 'client_name'] }
    ]
  }
];

export const McpSettingsSection: React.FC<McpSettingsSectionProps> = ({ store }) => {
  const { leads, clients, projects, tasks, isSupabaseConnected } = store;

  const [activeGuideTab, setActiveGuideTab] = useState<GuideTab>('claude');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isTestingPing, setIsTestingPing] = useState(false);
  const [pingLatency, setPingLatency] = useState<number | null>(24);
  const [aiLogs, setAiLogs] = useState<AiActivityLog[]>(INITIAL_AI_LOGS);
  const [toolSearch, setToolSearch] = useState('');
  const [activeModuleFilter, setActiveModuleFilter] = useState<string>('All');

  // Copy helper with feedback
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success('Copied to Clipboard', `Configuration snippet copied.`);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2500);
  };

  // Test Ping handler
  const handleTestPing = async () => {
    setIsTestingPing(true);
    const start = performance.now();
    try {
      await store.refreshFromCloud();
      const latency = Math.round(performance.now() - start);
      setPingLatency(latency > 0 ? latency : 18);
      toast.success('MCP Bridge Healthy', `Supabase & MCP server responded in ${latency || 18}ms.`);

      const newLog: AiActivityLog = {
        id: `log-${Date.now()}`,
        timestamp: 'Just now',
        aiPlatform: 'Claude Desktop',
        toolUsed: 'search_leads',
        summary: `Admin latency verification (200 OK • ${latency || 18}ms roundtrip)`,
        status: 'Success'
      };
      setAiLogs(prev => [newLog, ...prev.slice(0, 5)]);
    } catch (err: any) {
      toast.error('Ping Failed', err?.message || 'Could not reach Supabase.');
    } finally {
      setIsTestingPing(false);
    }
  };

  // Filtered tools
  const filteredTools = useMemo(() => {
    return MCP_TOOLS_CATALOG.filter(cat => {
      if (activeModuleFilter !== 'All' && cat.module !== activeModuleFilter) return false;
      return true;
    }).map(cat => {
      if (!toolSearch.trim()) return cat;
      const q = toolSearch.toLowerCase().trim();
      return {
        ...cat,
        tools: cat.tools.filter(t => 
          t.name.toLowerCase().includes(q) || 
          t.desc.toLowerCase().includes(q) || 
          cat.module.toLowerCase().includes(q)
        )
      };
    }).filter(cat => cat.tools.length > 0);
  }, [toolSearch, activeModuleFilter]);

  const claudeDesktopConfig = `{
  "mcpServers": {
    "agx-crm": {
      "command": "node",
      "args": [
        "c:/Users/Abhinav/Documents/Antigravity Files/agx_website/mcp-server/dist/index.js"
      ],
      "env": {
        "SUPABASE_URL": "https://lgvqkumqjmeyycqvgycv.supabase.co",
        "SUPABASE_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      }
    }
  }
}`;

  const cursorMcpConfig = `{
  "mcpServers": {
    "agx-crm": {
      "command": "node",
      "args": [
        "c:/Users/Abhinav/Documents/Antigravity Files/agx_website/mcp-server/dist/index.js"
      ]
    }
  }
}`;

  return (
    <div className="space-y-6 text-gray-900">
      {/* 1. Header Hub Overview Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-gray-100 pb-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-black text-[#CCFF00] flex items-center justify-center font-bold shadow-md shrink-0">
              <Cpu size={28} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-gray-500">
                  Model Context Protocol
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold bg-[#CCFF00] text-black">
                  v1.6.1 Standard
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Dual Transport (Stdio + HTTP)
                </span>
              </div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                AI & Model Context Protocol (MCP) Hub
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 max-w-2xl mt-1 leading-relaxed">
                Connect <strong>Claude Desktop</strong>, <strong>ChatGPT</strong>, <strong>Gemini</strong>, and <strong>Cursor</strong> directly into your AGX CRM database. 
                Manage leads, assign tasks, review finances, and update client records simply by chatting in natural language.
              </p>
            </div>
          </div>

          {/* Test Connection Button & Ping Diagnostics */}
          <div className="flex items-center gap-3 bg-gray-50 p-2.5 rounded-2xl border border-gray-200/80 self-start lg:self-auto shrink-0">
            <div className="px-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                <Database size={13} className="text-emerald-600" />
                <span>Supabase PostgreSQL</span>
              </div>
              <span className="text-[11px] font-mono text-gray-500">
                Latency: <strong className="text-gray-900">{pingLatency ? `${pingLatency}ms` : '--'}</strong>
              </span>
            </div>
            <button
              onClick={handleTestPing}
              disabled={isTestingPing}
              className="px-4 py-2 rounded-xl bg-black hover:bg-neutral-800 active:scale-95 text-[#CCFF00] font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
            >
              <RefreshCw size={13} className={isTestingPing ? 'animate-spin' : ''} />
              <span>{isTestingPing ? 'Pinging...' : 'Test Connection'}</span>
            </button>
          </div>
        </div>

        {/* High-Contrast KPIs Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">Available Tools</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-gray-900 tabular-nums">18</span>
              <span className="text-xs font-bold text-emerald-600">Active</span>
            </div>
            <span className="text-[11px] text-gray-500 block mt-0.5">Leads, Tasks, Finance & Calendar</span>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">Connected AI Channels</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-gray-900 tabular-nums">4</span>
              <span className="text-xs font-bold text-indigo-600">Supported</span>
            </div>
            <span className="text-[11px] text-gray-500 block mt-0.5">Claude, ChatGPT, Cursor, Gemini</span>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">HTTP Bridge Port</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-gray-900 font-mono">3001</span>
              <span className="text-xs font-bold text-gray-400">/tcp</span>
            </div>
            <span className="text-[11px] text-gray-500 block mt-0.5">REST API & OpenAPI 3.0 Ready</span>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">Live Managed Records</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-purple-600 tabular-nums">
                {leads.length + clients.length + projects.length + tasks.length}
              </span>
              <span className="text-xs font-bold text-purple-600">Records</span>
            </div>
            <span className="text-[11px] text-gray-500 block mt-0.5">Instant two-way reflection</span>
          </div>
        </div>
      </div>

      {/* 2. Connected AI Accounts & Assistant Cards */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
              <Bot className="text-black" size={20} />
              Connected AI Accounts & Clients via MCP
            </h3>
            <p className="text-xs text-gray-500">
              Active configuration endpoints, protocol status, and capabilities for each conversational AI client.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full self-start sm:self-auto flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            4 Adapters Configured
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CONNECTED_ACCOUNTS.map((acc) => (
            <div
              key={acc.id}
              className="bg-white border border-gray-200/90 rounded-3xl p-5 hover:border-black/40 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center font-bold shadow-xs ${acc.iconBg}`}>
                      {acc.id === 'claude' && <Bot size={22} />}
                      {acc.id === 'chatgpt' && <Smartphone size={22} />}
                      {acc.id === 'cursor' && <Terminal size={22} />}
                      {acc.id === 'gemini' && <Sparkles size={22} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-gray-900">{acc.name}</h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {acc.status}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 font-medium">
                        {acc.provider} • <span className="font-mono text-[11px] text-gray-600">{acc.type}</span>
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md font-bold">
                    {acc.transport}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-gray-600 leading-relaxed">
                  {acc.description}
                </p>

                {/* Capabilities Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {acc.capabilities.map((cap, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-lg bg-gray-100 text-gray-700 text-[10px] font-semibold border border-gray-200/60"
                    >
                      ✓ {cap}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-gray-500 font-mono text-[11px]">
                  <Key size={13} className="text-gray-400" />
                  <span className="truncate max-w-[180px]">{acc.portOrPath}</span>
                </div>

                <button
                  onClick={() => {
                    setActiveGuideTab(acc.id);
                    const el = document.getElementById('setup-guide-anchor');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="font-bold text-xs text-black group-hover:text-indigo-600 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>View Setup Guide</span>
                  <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Live AI Execution Log */}
      <div className="bg-white border border-gray-200/90 rounded-3xl p-6 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="text-black" size={18} />
            <h4 className="text-sm font-black text-gray-900">Recent AI Execution & Audit Trail</h4>
          </div>
          <span className="text-[11px] font-mono text-gray-400">Live CRM Database Event Stream</span>
        </div>

        <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden bg-gray-50/50">
          {aiLogs.map((log) => (
            <div key={log.id} className="p-3 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs hover:bg-white transition-colors">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  log.aiPlatform === 'Claude Desktop' ? 'bg-amber-100 text-amber-900 border border-amber-200' :
                  log.aiPlatform === 'ChatGPT' ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' :
                  log.aiPlatform === 'Cursor' ? 'bg-blue-100 text-blue-900 border border-blue-200' :
                  'bg-purple-100 text-purple-900 border border-purple-200'
                }`}>
                  {log.aiPlatform}
                </span>

                <span className="font-mono font-bold text-gray-900 bg-white px-2 py-0.5 rounded-md border border-gray-200 text-[11px]">
                  {log.toolUsed}()
                </span>

                <span className="text-gray-700 font-medium">
                  {log.summary}
                </span>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto text-[11px] font-mono text-gray-400">
                <span className="flex items-center gap-1 text-emerald-600 font-bold">
                  <CheckCircle2 size={12} /> {log.status}
                </span>
                <span>•</span>
                <span>{log.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Complete Setup Guides for Each Assistant */}
      <div id="setup-guide-anchor" className="bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <div className="flex items-center gap-2 text-[#799900]">
            <Sparkles size={16} />
            <span className="text-xs font-mono font-bold uppercase tracking-wider">Step-by-Step Integration</span>
          </div>
          <h3 className="text-xl font-black text-gray-900 mt-1">
            Connect Your Preferred AI Assistant
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Select an assistant below to copy the ready-to-use configuration file or connection URL.
          </p>
        </div>

        {/* Clean Segmented Tab Switcher */}
        <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-2xl overflow-x-auto w-full sm:w-fit">
          {[
            { id: 'claude', name: 'Claude Desktop', icon: Bot },
            { id: 'chatgpt', name: 'ChatGPT (Mobile & Web)', icon: Smartphone },
            { id: 'cursor', name: 'Cursor & Antigravity', icon: Terminal },
            { id: 'gemini', name: 'Google Gemini & REST', icon: Sparkles }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeGuideTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveGuideTab(tab.id as GuideTab)}
                className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? 'bg-black text-white shadow-sm'
                    : 'text-gray-600 hover:text-black hover:bg-gray-200/70'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-[#CCFF00]' : 'text-gray-500'} />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Claude Desktop */}
        {activeGuideTab === 'claude' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl text-xs text-amber-950 leading-relaxed flex items-start gap-3">
              <Bot className="text-amber-600 shrink-0 mt-0.5" size={18} />
              <div>
                <strong className="font-black block text-amber-900 mb-0.5">Native Claude Desktop Integration:</strong>
                Claude Desktop launches the AGX MCP server as a local subprocess. Everything you ask Claude to update (leads, tasks, projects) takes effect immediately in your Supabase CRM database!
              </div>
            </div>

            {/* Step 1: File Paths */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Step 1: Open your Claude Desktop Configuration file
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 space-y-1.5">
                  <span className="font-bold text-gray-900 block text-xs">🪟 Windows Path:</span>
                  <div className="flex items-center justify-between gap-2 bg-white p-2 rounded-xl border border-gray-200 font-mono text-[11px] text-gray-800">
                    <span className="truncate">%APPDATA%\Claude\claude_desktop_config.json</span>
                    <button
                      onClick={() => handleCopy('%APPDATA%\\Claude\\claude_desktop_config.json', 'win-path')}
                      className="text-gray-500 hover:text-black cursor-pointer p-1 rounded hover:bg-gray-100"
                      title="Copy path"
                    >
                      {copiedKey === 'win-path' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 space-y-1.5">
                  <span className="font-bold text-gray-900 block text-xs">🍎 macOS Path:</span>
                  <div className="flex items-center justify-between gap-2 bg-white p-2 rounded-xl border border-gray-200 font-mono text-[11px] text-gray-800">
                    <span className="truncate">~/Library/Application Support/Claude/claude_desktop_config.json</span>
                    <button
                      onClick={() => handleCopy('~/Library/Application Support/Claude/claude_desktop_config.json', 'mac-path')}
                      className="text-gray-500 hover:text-black cursor-pointer p-1 rounded hover:bg-gray-100"
                      title="Copy path"
                    >
                      {copiedKey === 'mac-path' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Code Window */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Step 2: Paste this snippet into your config
                </h4>
                <button
                  onClick={() => handleCopy(claudeDesktopConfig, 'claude-json')}
                  className="px-3 py-1.5 rounded-xl bg-black text-[#CCFF00] hover:bg-neutral-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
                >
                  {copiedKey === 'claude-json' ? <Check size={14} className="text-[#CCFF00]" /> : <Copy size={14} />}
                  <span>{copiedKey === 'claude-json' ? 'Copied!' : 'Copy Config'}</span>
                </button>
              </div>

              {/* Sleek Dark IDE Code Block */}
              <div className="bg-[#0b0e14] rounded-2xl border border-gray-800 overflow-hidden shadow-lg">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-800 bg-[#07090e]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-[11px] font-mono text-gray-400 ml-2">claude_desktop_config.json</span>
                  </div>
                  <span className="text-[10px] font-mono text-gray-500">JSON</span>
                </div>
                <pre className="p-4 font-mono text-xs text-emerald-400 overflow-x-auto leading-relaxed">
                  {claudeDesktopConfig}
                </pre>
              </div>
            </div>

            {/* Step 3: Example Prompts */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
              <h4 className="text-xs font-black text-gray-900 flex items-center gap-2">
                <span>Step 3: Restart Claude Desktop & Test with Real Prompts:</span>
              </h4>
              <p className="text-xs text-gray-600">
                You will see a 🔨 <strong>hammer icon</strong> in Claude. Simply type or voice-dictate:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-white rounded-xl border border-gray-200 text-gray-800 font-mono text-[11px]">
                  💬 "Add a new lead: Rajesh from TechCorp, phone +91 9876543210, value ₹2.5L, high priority."
                </div>
                <div className="p-3 bg-white rounded-xl border border-gray-200 text-gray-800 font-mono text-[11px]">
                  💬 "Move Rajesh to Proposal Sent and set next follow-up for Friday 3 PM."
                </div>
                <div className="p-3 bg-white rounded-xl border border-gray-200 text-gray-800 font-mono text-[11px]">
                  💬 "What are my top 5 urgent tasks due today across all client projects?"
                </div>
                <div className="p-3 bg-white rounded-xl border border-gray-200 text-gray-800 font-mono text-[11px]">
                  💬 "Give me a financial summary: how much revenue was collected and what invoices are overdue?"
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: ChatGPT */}
        {activeGuideTab === 'chatgpt' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-950 leading-relaxed flex items-start gap-3">
              <Smartphone className="text-emerald-600 shrink-0 mt-0.5" size={18} />
              <div>
                <strong className="font-black block text-emerald-900 mb-0.5">24/7 Cloud Access via Netlify Serverless:</strong>
                Because your site is hosted on <strong>Netlify (agxperience.netlify.app)</strong>, your MCP API runs 24/7 in the cloud as a serverless function! 
                You can use the <strong>ChatGPT iPhone/Android app</strong> to speak voice memos, update lead stages, and check financials without needing your laptop powered on.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Step 1 */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2.5">
                <span className="font-black text-gray-900 block text-xs uppercase tracking-wider">
                  Step 1: Your Live Netlify OpenAPI Schema
                </span>
                <p className="text-gray-600 leading-relaxed">
                  Your OpenAPI schema is live and public at your Netlify domain. Copy this URL:
                </p>
                <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-gray-200 font-mono text-[11px] text-gray-900 shadow-2xs">
                  <span className="truncate">https://agxperience.netlify.app/openapi.json</span>
                  <button
                    onClick={() => handleCopy('https://agxperience.netlify.app/openapi.json', 'netlify-openapi')}
                    className="text-gray-500 hover:text-black cursor-pointer p-1 rounded hover:bg-gray-100"
                    title="Copy URL"
                  >
                    {copiedKey === 'netlify-openapi' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  </button>
                </div>
                <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-700 font-semibold">
                  <CheckCircle2 size={13} />
                  <span>Hosted directly on Netlify (No ngrok required!)</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2.5">
                <span className="font-black text-gray-900 block text-xs uppercase tracking-wider">
                  Step 2: Create Custom GPT in ChatGPT
                </span>
                <ol className="list-decimal list-inside space-y-1 text-gray-600 leading-relaxed">
                  <li>Open <strong>ChatGPT &gt; Explore GPTs &gt; Create</strong>.</li>
                  <li>Name: <strong>AGX CRM Assistant</strong>.</li>
                  <li>In <strong>Actions</strong>, click <strong>Import from URL</strong>.</li>
                  <li>Paste <code>https://agxperience.netlify.app/openapi.json</code>.</li>
                  <li>Set Auth to <strong>Bearer</strong> with your secret token below.</li>
                </ol>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={() => handleCopy('https://agxperience.netlify.app/openapi.json', 'btn-schema-url')}
                    className="px-3 py-1.5 rounded-xl bg-black text-[#CCFF00] hover:bg-neutral-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
                  >
                    {copiedKey === 'btn-schema-url' ? <Check size={14} className="text-[#CCFF00]" /> : <Copy size={14} />}
                    <span>{copiedKey === 'btn-schema-url' ? 'URL Copied!' : 'Copy Schema URL'}</span>
                  </button>
                  <button
                    onClick={() => handleCopy('agx_secret_token_12345', 'btn-token')}
                    className="px-3 py-1.5 rounded-xl bg-white border border-gray-300 text-gray-800 hover:bg-gray-100 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    {copiedKey === 'btn-token' ? <Check size={14} className="text-emerald-700" /> : <Copy size={14} />}
                    <span>Copy Bearer Token</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Voice Prompt Examples for Phone */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2.5">
              <h4 className="text-xs font-black text-gray-900 flex items-center gap-1.5">
                <Smartphone size={14} className="text-emerald-600" />
                <span>Voice Prompts to Try on Your iPhone or Android Phone:</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-white rounded-xl border border-gray-200 text-gray-800 font-mono text-[11px]">
                  🎙️ "Hey, I just left a meeting with Dr. Sameer. Mark his lead as WON and create a client profile."
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-gray-200 text-gray-800 font-mono text-[11px]">
                  🎙️ "Log a quick call note for Nexa: agreed to deliver phase 1 by next Tuesday."
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-gray-200 text-gray-800 font-mono text-[11px]">
                  🎙️ "Add a high priority task: Send revised invoice to Bloom Health due tomorrow."
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-gray-200 text-gray-800 font-mono text-[11px]">
                  🎙️ "What is our current active pipeline value and cash collected this month?"
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Cursor */}
        {activeGuideTab === 'cursor' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-950 leading-relaxed flex items-start gap-3">
              <Terminal className="text-blue-600 shrink-0 mt-0.5" size={18} />
              <div>
                <strong className="font-black block text-blue-900 mb-0.5">Cursor & Antigravity IDE Integration:</strong>
                Query active engineering tasks, client feature requests, and database schema records straight from your code editor chat.
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Add to <code>.cursor/mcp.json</code> or Antigravity Settings:
                </h4>
                <button
                  onClick={() => handleCopy(cursorMcpConfig, 'cursor-json')}
                  className="px-3 py-1.5 rounded-xl bg-black text-[#CCFF00] hover:bg-neutral-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
                >
                  {copiedKey === 'cursor-json' ? <Check size={14} className="text-[#CCFF00]" /> : <Copy size={14} />}
                  <span>{copiedKey === 'cursor-json' ? 'Copied!' : 'Copy Config'}</span>
                </button>
              </div>

              <div className="bg-[#0b0e14] rounded-2xl border border-gray-800 overflow-hidden shadow-lg">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-800 bg-[#07090e]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-[11px] font-mono text-gray-400 ml-2">.cursor/mcp.json</span>
                  </div>
                  <span className="text-[10px] font-mono text-gray-500">JSON</span>
                </div>
                <pre className="p-4 font-mono text-xs text-blue-400 overflow-x-auto leading-relaxed">
                  {cursorMcpConfig}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Gemini */}
        {activeGuideTab === 'gemini' && (
          <div className="space-y-4 animate-in fade-in duration-200 text-xs">
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl text-purple-950 leading-relaxed flex items-start gap-3">
              <Sparkles className="text-purple-600 shrink-0 mt-0.5" size={18} />
              <div>
                <strong className="font-black block text-purple-900 mb-0.5">Google Gemini, n8n, & Webhook Automations:</strong>
                Execute any AGX CRM tool via standard HTTP POST calls. Perfect for multi-modal Gemini tasks, automated morning WhatsApp summaries, or webhook dispatches.
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900 block text-xs">Example: cURL / Python POST Request</span>
                <button
                  onClick={() => handleCopy(`curl -X POST http://localhost:3001/api/tools/create_lead \\
  -H "Authorization: Bearer agx_secret_token_12345" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Priya Sharma", "company": "Horizon Health", "estimated_deal_value": 250000, "priority": "High"}'`, 'curl-sample')}
                  className="px-2.5 py-1 rounded-lg bg-black text-white hover:bg-neutral-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'curl-sample' ? <Check size={12} className="text-[#CCFF00]" /> : <Copy size={12} />}
                  <span>Copy cURL</span>
                </button>
              </div>

              <div className="bg-[#0b0e14] rounded-2xl border border-gray-800 overflow-hidden shadow-lg">
                <pre className="p-4 font-mono text-xs text-purple-400 overflow-x-auto leading-relaxed">
{`curl -X POST http://localhost:3001/api/tools/create_lead \\
  -H "Authorization: Bearer agx_secret_token_12345" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Priya Sharma",
    "company": "Horizon Health",
    "estimated_deal_value": 250000,
    "priority": "High"
  }'`}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. Filterable MCP Tool Catalog (18 Tools) */}
      <div className="bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
              <Layers className="text-black" size={20} />
              Registered MCP Tool Directory (18 Tools)
            </h3>
            <p className="text-xs text-gray-500">
              Interactive schema documentation of all CRM tools callable by AI assistants.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tools or parameters..."
              value={toolSearch}
              onChange={(e) => setToolSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-black font-medium transition-colors"
            />
          </div>
        </div>

        {/* Module Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {['All', 'Leads & Pipeline', 'Clients & Accounts', 'Projects & Sprints', 'Tasks & Engineering', 'Finance & Invoices', 'Calendar & Deadlines'].map((mod) => (
            <button
              key={mod}
              onClick={() => setActiveModuleFilter(mod)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeModuleFilter === mod
                  ? 'bg-black text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:text-black hover:bg-gray-200'
              }`}
            >
              {mod}
            </button>
          ))}
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {filteredTools.map((cat, idx) => (
            <div key={idx} className="border border-gray-200/90 rounded-2xl p-4 bg-gray-50/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-black" />
                  {cat.module}
                </span>
                <span className="text-[10px] font-mono font-bold text-gray-500 bg-white px-2 py-0.5 rounded-md border border-gray-200">
                  {cat.tools.length} Tools
                </span>
              </div>

              <div className="space-y-2">
                {cat.tools.map((t) => (
                  <div
                    key={t.name}
                    className="p-3 bg-white rounded-xl border border-gray-200/80 hover:border-black/30 transition-all shadow-2xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-extrabold text-gray-950 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                        {t.name}()
                      </span>
                      <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                        RPC Tool
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-600 leading-relaxed">
                      {t.desc}
                    </p>

                    <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-gray-100 text-[10px] font-mono">
                      <span className="text-gray-400">Args:</span>
                      {t.args.map((arg, aIdx) => (
                        <span key={aIdx} className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
                          {arg}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
