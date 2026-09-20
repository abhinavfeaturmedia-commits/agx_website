// AGX CRM & Business Operating System Store & Data Provider
// Enterprise Supabase Integration with Optimistic UI, Full CRUD, Realtime Sync, and Toast Alerts
import { useState, useEffect, useCallback } from 'react';
import { crmService } from './crmService';
import { authService } from './authService';
import { toast } from './toastStore';
import {
  UserProfile, UserRole, Lead, LeadStatus, LeadActivity, LeadActivityType, Client, Project, ProjectMilestone,
  ProjectStatus, Task, TaskStatus, Invoice, Payment, Expense, Agreement, DocumentItem,
  CredentialVaultItem, CalendarEvent, NotificationItem, AuditLog, Priority,
  InvoiceStatus, ExpenseCategory, AgreementStatus, CrmModuleKey, ModulePermissions, ROLE_DEFAULT_PERMISSIONS,
  ProjectIssue, IssueStatus, IssueType, IssuePriority
} from '../types/crm';

export const INITIAL_USERS: UserProfile[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'abhinav@agxperience.com',
    fullName: 'Abhinav (Founder & Super Admin)',
    role: 'Super Admin',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    department: 'Leadership'
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'taylor@agxperience.com',
    fullName: 'Taylor Vance',
    role: 'Sales Manager',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    department: 'Sales & Growth'
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    email: 'michael@agxperience.com',
    fullName: 'Michael Andrew',
    role: 'Project Manager',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    department: 'Engineering'
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    email: 'natalia@agxperience.com',
    fullName: 'Natalia Varnan',
    role: 'Developer',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    department: 'AI Architecture'
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    email: 'robert@agxperience.com',
    fullName: 'Robert Sterling',
    role: 'Accountant',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    department: 'Finance'
  }
];

export const INITIAL_LEADS: Lead[] = [
  {
    id: '10000000-0000-0000-0000-000000000001',
    name: 'Sarah Jenkins',
    company: 'Apex Logistics Inc.',
    phone: '+1 (555) 382-9012',
    email: 'sjenkins@apexlogistics.io',
    whatsapp: '+15553829012',
    location: 'Chicago, USA',
    interestedService: 'AI Customer Support & Dispatch Automation',
    estimatedDealValue: 12500,
    probability: 80,
    source: 'Website',
    assignedTo: 'Taylor Vance',
    priority: 'High',
    status: 'NEGOTIATION',
    nextFollowUp: '2026-08-22T15:00:00Z',
    lastContacted: '2026-08-19T11:30:00Z',
    notes: 'Needs webhook integration with TMS and WhatsApp alert triggers for fleet drivers.',
    createdAt: '2026-08-10T09:00:00Z',
    updatedAt: '2026-08-19T11:30:00Z'
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    name: 'Marcus Sterling',
    company: 'Vanguard FinTech Group',
    phone: '+44 20 7946 0912',
    email: 'm.sterling@vanguardft.co.uk',
    whatsapp: '+442079460912',
    location: 'London, UK',
    interestedService: 'Automated Loan Underwriting Agent',
    estimatedDealValue: 24000,
    probability: 60,
    source: 'LinkedIn',
    assignedTo: 'Taylor Vance',
    priority: 'Urgent',
    status: 'PROPOSAL SENT',
    nextFollowUp: '2026-08-21T14:00:00Z',
    lastContacted: '2026-08-18T16:00:00Z',
    notes: 'Sent enterprise SLA draft and security architecture diagram.',
    createdAt: '2026-08-12T10:15:00Z',
    updatedAt: '2026-08-18T16:00:00Z'
  },
  {
    id: '10000000-0000-0000-0000-000000000003',
    name: 'Elena Rostova',
    company: 'Solaria BioMed',
    phone: '+49 89 2018 391',
    email: 'elena.rostova@solariabiomed.de',
    whatsapp: '+49892018391',
    location: 'Munich, Germany',
    interestedService: 'Clinical Research Data Extraction Engine',
    estimatedDealValue: 18500,
    probability: 40,
    source: 'Referral',
    assignedTo: 'Michael Andrew',
    priority: 'Medium',
    status: 'QUALIFIED',
    nextFollowUp: '2026-08-23T10:00:00Z',
    lastContacted: '2026-08-17T09:00:00Z',
    notes: 'Evaluating GDPR compliance and localized LLM deployment requirements.',
    createdAt: '2026-08-14T14:20:00Z',
    updatedAt: '2026-08-17T09:00:00Z'
  },
  {
    id: '10000000-0000-0000-0000-000000000004',
    name: 'Devon Miller',
    company: 'CloudScale SaaS',
    phone: '+1 (415) 890-2341',
    email: 'dmiller@cloudscale.net',
    whatsapp: '+14158902341',
    location: 'San Francisco, USA',
    interestedService: 'n8n & Supabase Billing Orchestration',
    estimatedDealValue: 8000,
    probability: 95,
    source: 'Website',
    assignedTo: 'Taylor Vance',
    priority: 'High',
    status: 'WON',
    lastContacted: '2026-08-20T10:00:00Z',
    notes: 'Agreement executed. Project kickoff scheduled.',
    createdAt: '2026-08-01T11:00:00Z',
    updatedAt: '2026-08-20T10:00:00Z'
  },
  {
    id: '10000000-0000-0000-0000-000000000005',
    name: 'Vikram Patel',
    company: 'Zenith Retail Chains',
    phone: '+91 98201 44521',
    email: 'vpatel@zenithretail.in',
    whatsapp: '+919820144521',
    location: 'Mumbai, India',
    interestedService: 'Multi-Store Inventory AI Copilot',
    estimatedDealValue: 15000,
    probability: 20,
    source: 'Direct Outreach',
    assignedTo: 'Taylor Vance',
    priority: 'Medium',
    status: 'NEW',
    nextFollowUp: '2026-08-21T11:00:00Z',
    notes: 'Initial discovery call requested via Calendly.',
    createdAt: '2026-08-20T08:00:00Z',
    updatedAt: '2026-08-20T08:00:00Z'
  }
];

export const INITIAL_CLIENTS: Client[] = [
  {
    id: '20000000-0000-0000-0000-000000000001',
    name: 'Karan Mehta',
    company: 'Shrawello Systems',
    phone: '+91 98450 12345',
    email: 'karan@shrawello.com',
    website: 'https://shrawello.com',
    address: 'Bengaluru, Karnataka, India',
    industry: 'Enterprise E-Commerce',
    gstTaxId: '29ABCDE1234F1Z5',
    accountManager: 'Abhinav',
    totalValue: 25000,
    totalPaid: 15000,
    outstandingAmount: 10000,
    source: 'Direct Referral',
    notes: 'Long-term enterprise partner for AI automated search and voice agents.',
    status: 'Active',
    createdAt: '2026-06-15T09:00:00Z',
    updatedAt: '2026-08-15T14:30:00Z'
  },
  {
    id: '20000000-0000-0000-0000-000000000002',
    name: 'Liam O\'Connor',
    company: 'Aether Capital',
    phone: '+1 (212) 555-0199',
    email: 'liam@aethercap.com',
    website: 'https://aethercap.com',
    address: 'New York, NY, USA',
    industry: 'Venture Capital & Private Equity',
    gstTaxId: 'US-EIN-9923841',
    accountManager: 'Taylor Vance',
    totalValue: 18000,
    totalPaid: 11000,
    outstandingAmount: 7000,
    source: 'LinkedIn Inbound',
    notes: 'Monthly retainer for automated deal screening AI pipeline.',
    status: 'Active',
    createdAt: '2026-07-01T10:00:00Z',
    updatedAt: '2026-08-10T16:00:00Z'
  },
  {
    id: '20000000-0000-0000-0000-000000000003',
    name: 'Chloe Dubois',
    company: 'Nexis Health Solutions',
    phone: '+33 1 42 68 55 00',
    email: 'c.dubois@nexishealth.fr',
    website: 'https://nexishealth.fr',
    address: 'Paris, France',
    industry: 'Digital Health',
    gstTaxId: 'FR8839201923',
    accountManager: 'Michael Andrew',
    totalValue: 32000,
    totalPaid: 20000,
    outstandingAmount: 12000,
    source: 'Website Form',
    notes: 'Building AI patient onboarding & FHIR compliance pipeline.',
    status: 'Active',
    createdAt: '2026-05-20T11:00:00Z',
    updatedAt: '2026-08-18T12:00:00Z'
  },
  {
    id: '20000000-0000-0000-0000-000000000004',
    name: 'Rohan Deshmukh',
    company: 'Zomira Retail Hub',
    phone: '+91 98201 44882',
    email: 'rohan@zomiraretail.com',
    website: 'https://zomiraretail.com',
    address: 'Mumbai, Maharashtra, India',
    industry: 'Omnichannel Retail & E-Commerce',
    gstTaxId: '27AABCZ1234F1Z8',
    accountManager: 'Michael Andrew',
    totalValue: 75000,
    totalPaid: 35000,
    outstandingAmount: 40000,
    source: 'Referral',
    notes: 'Retail brand scaling automated WhatsApp support & multi-lingual product advisory voice agent.',
    status: 'Active',
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-08-20T11:00:00Z'
  },
  {
    id: '20000000-0000-0000-0000-000000000005',
    name: 'Pooja Singhania',
    company: 'NeoFin Wealth Partners',
    phone: '+91 97110 55991',
    email: 'pooja.s@neofinwealth.in',
    website: 'https://neofinwealth.in',
    address: 'Bandra Kurla Complex, Mumbai, India',
    industry: 'Fintech & WealthTech',
    gstTaxId: '27AABCN8823K1ZT',
    accountManager: 'Abhinav',
    totalValue: 120000,
    totalPaid: 50000,
    outstandingAmount: 70000,
    source: 'Direct Inbound',
    notes: 'Next-gen wealth advisory dashboard with real-time portfolio analytics and compliance reporting.',
    status: 'Active',
    createdAt: '2026-07-15T09:30:00Z',
    updatedAt: '2026-08-22T15:00:00Z'
  },
  {
    id: '20000000-0000-0000-0000-000000000006',
    name: 'Vikram Malhotra',
    company: 'Apex Logistics Global',
    phone: '+91 99880 33221',
    email: 'v.malhotra@apexlogistics.in',
    website: 'https://apexlogistics.in',
    address: 'Gurugram, Haryana, India',
    industry: 'Logistics & Supply Chain',
    gstTaxId: '06AABCA4321P1Z3',
    accountManager: 'Taylor Vance',
    totalValue: 90000,
    totalPaid: 0,
    outstandingAmount: 90000,
    source: 'Conference Lead',
    notes: 'Fleet IoT automation and dispatch dispatch tracking agent. Awaiting agreement signing and deposit.',
    status: 'On Hold',
    createdAt: '2026-08-15T14:00:00Z',
    updatedAt: '2026-08-24T16:00:00Z'
  },
  {
    id: '20000000-0000-0000-0000-000000000007',
    name: 'Marcus Chen',
    company: 'Omnilog Freight Systems',
    phone: '+1 (312) 880-9214',
    email: 'marcus.chen@omnilog.io',
    website: 'https://omnilog.io',
    address: 'Chicago, IL, USA',
    industry: 'Freight & Supply Chain Logistics',
    gstTaxId: 'US-EIN-8819241',
    accountManager: 'Michael Andrew',
    totalValue: 65000,
    totalPaid: 45000,
    outstandingAmount: 20000,
    source: 'Enterprise Inbound',
    notes: 'Autonomous carrier dispatch and fleet telematics AI orchestration.',
    status: 'Active',
    createdAt: '2026-07-01T09:00:00Z',
    updatedAt: '2026-08-20T10:00:00Z'
  }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'omnilog-demo',
    name: 'Autonomous Freight Dispatch & Fleet Telemetry AI',
    clientId: '20000000-0000-0000-0000-000000000007',
    clientName: 'Omnilog Freight Systems',
    serviceType: 'Workflow Automation',
    projectManager: 'Michael Andrew',
    assignedTeam: ['Natalia Varnan', 'Abhinav'],
    startDate: '2026-08-01',
    dueDate: '2026-09-15',
    deliveryDate: '2026-09-15',
    projectValue: 65000,
    receivedAmount: 45000,
    pendingAmount: 20000,
    status: 'IN PROGRESS',
    priority: 'High',
    progress: 78,
    description: 'Real-time GPS fleet telemetry ingestion with autonomous carrier dispatch agent and automated driver SMS/WhatsApp alerts.',
    portalToken: 'omnilog-demo',
    portalEnabled: true,
    milestones: [
      { id: 'm-omni-1', projectId: 'omnilog-demo', title: 'Phase 1: Telematics Webhook & Kafka Pipeline', dueDate: '2026-08-10', status: 'Completed', progress: 100, amount: 20000 },
      { id: 'm-omni-2', projectId: 'omnilog-demo', title: 'Phase 2: Autonomous Rate Negotiation Voice Agent', dueDate: '2026-08-28', status: 'In Progress', progress: 85, amount: 25000 },
      { id: 'm-omni-3', projectId: 'omnilog-demo', title: 'Phase 3: TMS Bidirectional Sync & Fleet Load Testing', dueDate: '2026-09-15', status: 'Pending', progress: 30, amount: 20000 }
    ],
    createdAt: '2026-07-28T10:00:00Z',
    updatedAt: '2026-08-20T14:00:00Z'
  },
  {
    id: '30000000-0000-0000-0000-000000000001',
    name: 'AI Voice Agent & Support Pipeline',
    clientId: '20000000-0000-0000-0000-000000000001',
    clientName: 'Shrawello Systems',
    serviceType: 'Custom AI Agent',
    projectManager: 'Michael Andrew',
    assignedTeam: ['Natalia Varnan', 'Abhinav'],
    startDate: '2026-08-01',
    dueDate: '2026-09-15',
    projectValue: 25000,
    receivedAmount: 15000,
    pendingAmount: 10000,
    status: 'IN PROGRESS',
    priority: 'High',
    progress: 65,
    description: 'Deploying ultra-low latency voicebot using LiveKit WebRTC and ElevenLabs with LangChain tool calling.',
    portalToken: 'prj_sec_shrawello_8f9a2b',
    portalEnabled: true,
    milestones: [
      { id: '40000000-0000-0000-0000-000000000001', projectId: '30000000-0000-0000-0000-000000000001', title: 'Phase 1: Architecture & Latency Benchmark', dueDate: '2026-08-10', status: 'Completed', progress: 100, amount: 5000 },
      { id: '40000000-0000-0000-0000-000000000002', projectId: '30000000-0000-0000-0000-000000000001', title: 'Phase 2: CRM Tool Handlers & Voice Integration', dueDate: '2026-08-28', status: 'In Progress', progress: 70, amount: 10000 },
      { id: '40000000-0000-0000-0000-000000000003', projectId: '30000000-0000-0000-0000-000000000001', title: 'Phase 3: Production Deployment & QA', dueDate: '2026-09-15', status: 'Pending', progress: 0, amount: 10000 }
    ],
    createdAt: '2026-07-28T10:00:00Z',
    updatedAt: '2026-08-18T14:00:00Z'
  },
  {
    id: '30000000-0000-0000-0000-000000000002',
    name: 'Development Basics & Workflow Hub',
    clientId: '20000000-0000-0000-0000-000000000002',
    clientName: 'Aether Capital',
    serviceType: 'Workflow Automation',
    projectManager: 'Michael Andrew',
    assignedTeam: ['Natalia Varnan'],
    startDate: '2026-07-15',
    dueDate: '2026-08-30',
    projectValue: 18000,
    receivedAmount: 11000,
    pendingAmount: 7000,
    status: 'TESTING',
    priority: 'Urgent',
    progress: 85,
    description: 'Connecting SEC Edgar filing webhooks to PostgreSQL vector embeddings and summarizer agents.',
    portalToken: 'prj_sec_aether_3d7c1e',
    portalEnabled: true,
    milestones: [
      { id: '40000000-0000-0000-0000-000000000004', projectId: '30000000-0000-0000-0000-000000000002', title: 'Phase 1: Ingestion Pipelines & n8n Scenarios', dueDate: '2026-07-30', status: 'Completed', progress: 100, amount: 6000 },
      { id: '40000000-0000-0000-0000-000000000005', projectId: '30000000-0000-0000-0000-000000000002', title: 'Phase 2: Automated Analysis Engine', dueDate: '2026-08-15', status: 'Completed', progress: 100, amount: 5000 },
      { id: '40000000-0000-0000-0000-000000000006', projectId: '30000000-0000-0000-0000-000000000002', title: 'Phase 3: Final Acceptance Testing', dueDate: '2026-08-30', status: 'In Progress', progress: 60, amount: 7000 }
    ],
    createdAt: '2026-07-10T11:00:00Z',
    updatedAt: '2026-08-19T09:00:00Z'
  },
  {
    id: '30000000-0000-0000-0000-000000000003',
    name: 'Enterprise RAG Architecture',
    clientId: '20000000-0000-0000-0000-000000000003',
    clientName: 'Nexis Health Solutions',
    serviceType: 'Full-stack Platform',
    projectManager: 'Abhinav',
    assignedTeam: ['Natalia Varnan', 'Michael Andrew'],
    startDate: '2026-08-10',
    dueDate: '2026-10-30',
    projectValue: 32000,
    receivedAmount: 20000,
    pendingAmount: 12000,
    status: 'IN PROGRESS',
    priority: 'High',
    progress: 40,
    description: 'HIPAA compliant private cloud LLM with hybrid dense/sparse vector retrieval over medical documentation.',
    portalToken: 'prj_sec_nexis_9b4e72',
    portalEnabled: true,
    milestones: [],
    createdAt: '2026-08-05T12:00:00Z',
    updatedAt: '2026-08-18T10:00:00Z'
  },
  {
    id: '30000000-0000-0000-0000-000000000004',
    name: 'OmniChannel WhatsApp & Voice AI Bot',
    clientId: '20000000-0000-0000-0000-000000000004',
    clientName: 'Zomira Retail Hub',
    serviceType: 'Custom AI Agent',
    projectManager: 'Michael Andrew',
    assignedTeam: ['Natalia Varnan', 'Abhinav'],
    startDate: '2026-08-01',
    dueDate: '2026-10-15',
    projectValue: 75000,
    receivedAmount: 35000,
    pendingAmount: 40000,
    status: 'IN PROGRESS',
    priority: 'Urgent',
    progress: 55,
    description: 'High-concurrency WhatsApp bot with automated catalog lookup, order tracking, and voice note transcription.',
    portalToken: 'prj_sec_zomira_9a4f1c',
    portalEnabled: true,
    milestones: [
      { id: '40000000-0000-0000-0000-000000000007', projectId: '30000000-0000-0000-0000-000000000004', title: 'Phase 1: WhatsApp Cloud API & Webhook Infrastructure', dueDate: '2026-08-15', status: 'Completed', progress: 100, amount: 20000 },
      { id: '40000000-0000-0000-0000-000000000008', projectId: '30000000-0000-0000-0000-000000000004', title: 'Phase 2: Product Recommendation & Voice Notes AI', dueDate: '2026-09-10', status: 'In Progress', progress: 50, amount: 25000 },
      { id: '40000000-0000-0000-0000-000000000009', projectId: '30000000-0000-0000-0000-000000000004', title: 'Phase 3: Production Load Test & ERP Sync', dueDate: '2026-10-15', status: 'Pending', progress: 0, amount: 30000 }
    ],
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-08-20T12:00:00Z'
  },
  {
    id: '30000000-0000-0000-0000-000000000005',
    name: 'Fintech Wealth Management Dashboard',
    clientId: '20000000-0000-0000-0000-000000000005',
    clientName: 'NeoFin Wealth Partners',
    serviceType: 'Full-stack Platform',
    projectManager: 'Abhinav',
    assignedTeam: ['Natalia Varnan', 'Taylor Vance'],
    startDate: '2026-07-20',
    dueDate: '2026-09-30',
    projectValue: 120000,
    receivedAmount: 50000,
    pendingAmount: 70000,
    status: 'TESTING',
    priority: 'High',
    progress: 80,
    description: 'High-frequency portfolio calculation engine, live mutual fund NAV sync, and custom risk-profiling reports.',
    portalToken: 'prj_sec_neofin_7b2e88',
    portalEnabled: true,
    milestones: [
      { id: '40000000-0000-0000-0000-000000000010', projectId: '30000000-0000-0000-0000-000000000005', title: 'Phase 1: Core Dashboard & Asset Class Breakdown', dueDate: '2026-08-05', status: 'Completed', progress: 100, amount: 30000 },
      { id: '40000000-0000-0000-0000-000000000011', projectId: '30000000-0000-0000-0000-000000000005', title: 'Phase 2: Risk Analytics & PDF Statement Engine', dueDate: '2026-08-25', status: 'Completed', progress: 100, amount: 40000 },
      { id: '40000000-0000-0000-0000-000000000012', projectId: '30000000-0000-0000-0000-000000000005', title: 'Phase 3: User Acceptance Testing & Security Audit', dueDate: '2026-09-30', status: 'In Progress', progress: 60, amount: 50000 }
    ],
    createdAt: '2026-07-18T11:00:00Z',
    updatedAt: '2026-08-22T17:00:00Z'
  },
  {
    id: '30000000-0000-0000-0000-000000000006',
    name: 'Cloud Supply Chain Automation & Fleet IoT',
    clientId: '20000000-0000-0000-0000-000000000006',
    clientName: 'Apex Logistics Global',
    serviceType: 'Workflow Automation',
    projectManager: 'Taylor Vance',
    assignedTeam: ['Abhinav'],
    startDate: '2026-09-01',
    dueDate: '2026-11-30',
    projectValue: 90000,
    receivedAmount: 0,
    pendingAmount: 90000,
    status: 'PLANNING',
    priority: 'Medium',
    progress: 10,
    description: 'Fleet sensor streaming into automated dispatch alerting system. SOW sent; awaiting signature and advance deposit.',
    portalToken: 'prj_sec_apex_3c8d4a',
    portalEnabled: true,
    milestones: [],
    createdAt: '2026-08-20T14:00:00Z',
    updatedAt: '2026-08-25T09:00:00Z'
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: '50000000-0000-0000-0000-000000000001',
    title: 'Token Architecture & Design Tokens Sync',
    description: 'Standardize CSS design tokens and theme palettes across CRM & main app.',
    clientId: '20000000-0000-0000-0000-000000000001',
    clientName: 'Shrawello Systems',
    projectId: '30000000-0000-0000-0000-000000000001',
    projectName: 'AI Voice Agent & Support Pipeline',
    assignedTo: 'Abhinav',
    priority: 'High',
    status: 'IN PROGRESS',
    startDate: '2026-08-18',
    dueDate: '2026-08-22',
    estimatedHours: 12,
    actualHours: 8,
    createdAt: '2026-08-18T09:00:00Z',
    updatedAt: '2026-08-20T10:00:00Z'
  },
  {
    id: '50000000-0000-0000-0000-000000000002',
    title: 'Implement PostgreSQL RLS & Realtime Channels',
    description: 'Configure PostgreSQL policies for role-based data security in Supabase.',
    clientId: '20000000-0000-0000-0000-000000000002',
    clientName: 'Aether Capital',
    projectId: '30000000-0000-0000-0000-000000000002',
    projectName: 'Development Basics & Workflow Hub',
    assignedTo: 'Natalia Varnan',
    priority: 'Urgent',
    status: 'COMPLETED',
    startDate: '2026-08-15',
    dueDate: '2026-08-19',
    estimatedHours: 16,
    actualHours: 14,
    createdAt: '2026-08-15T09:00:00Z',
    updatedAt: '2026-08-19T17:00:00Z'
  },
  {
    id: '50000000-0000-0000-0000-000000000003',
    title: 'Zod API Schema & Webhook Validation',
    description: 'Validate incoming telemetry webhooks from Voice Agent API server.',
    clientId: '20000000-0000-0000-0000-000000000001',
    clientName: 'Shrawello Systems',
    projectId: '30000000-0000-0000-0000-000000000001',
    projectName: 'AI Voice Agent & Support Pipeline',
    assignedTo: 'Natalia Varnan',
    priority: 'Medium',
    status: 'TO DO',
    startDate: '2026-08-22',
    dueDate: '2026-08-26',
    estimatedHours: 8,
    actualHours: 0,
    createdAt: '2026-08-19T14:00:00Z',
    updatedAt: '2026-08-19T14:00:00Z'
  },
  {
    id: '50000000-0000-0000-0000-000000000004',
    title: 'FHIR API Connector & Medical EHR Integration',
    description: 'Complete testing suite for HL7/FHIR health data transformation pipeline.',
    clientId: '20000000-0000-0000-0000-000000000003',
    clientName: 'Nexis Health Solutions',
    projectId: '30000000-0000-0000-0000-000000000003',
    projectName: 'Enterprise RAG Architecture',
    assignedTo: 'Michael Andrew',
    priority: 'High',
    status: 'IN REVIEW',
    startDate: '2026-08-10',
    dueDate: '2026-08-24',
    estimatedHours: 24,
    actualHours: 22,
    createdAt: '2026-08-10T10:00:00Z',
    updatedAt: '2026-08-19T11:00:00Z'
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: '60000000-0000-0000-0000-000000000001',
    invoiceNumber: 'INV-2026-001',
    clientId: '20000000-0000-0000-0000-000000000001',
    clientName: 'Shrawello Systems',
    projectId: '30000000-0000-0000-0000-000000000001',
    projectName: 'AI Voice Agent & Support Pipeline',
    issueDate: '2026-08-01',
    dueDate: '2026-08-15',
    items: [
      { description: 'Phase 1 Voice Agent Architecture & Setup', quantity: 1, unitPrice: 15000, total: 15000 }
    ],
    subtotal: 15000,
    tax: 0,
    total: 15000,
    paidAmount: 15000,
    status: 'Paid',
    notes: 'Paid via Stripe Wire.',
    createdAt: '2026-08-01T09:00:00Z'
  },
  {
    id: '60000000-0000-0000-0000-000000000002',
    invoiceNumber: 'INV-2026-002',
    clientId: '20000000-0000-0000-0000-000000000001',
    clientName: 'Shrawello Systems',
    projectId: '30000000-0000-0000-0000-000000000001',
    projectName: 'AI Voice Agent & Support Pipeline',
    issueDate: '2026-08-15',
    dueDate: '2026-08-30',
    items: [
      { description: 'Phase 2 Voice Integration & Handover', quantity: 1, unitPrice: 10000, total: 10000 }
    ],
    subtotal: 10000,
    tax: 0,
    total: 10000,
    paidAmount: 0,
    status: 'Sent',
    notes: 'Awaiting client approval.',
    createdAt: '2026-08-15T09:00:00Z'
  },
  {
    id: '60000000-0000-0000-0000-000000000003',
    invoiceNumber: 'INV-2026-003',
    clientId: '20000000-0000-0000-0000-000000000002',
    clientName: 'Aether Capital',
    projectId: '30000000-0000-0000-0000-000000000002',
    projectName: 'Development Basics & Workflow Hub',
    issueDate: '2026-07-15',
    dueDate: '2026-07-30',
    items: [
      { description: 'Financial Data Scraping & Pipeline Setup', quantity: 1, unitPrice: 11000, total: 11000 }
    ],
    subtotal: 11000,
    tax: 0,
    total: 11000,
    paidAmount: 11000,
    status: 'Paid',
    notes: 'Settled via Bank Wire.',
    createdAt: '2026-07-15T10:00:00Z'
  },
  {
    id: '60000000-0000-0000-0000-000000000004',
    invoiceNumber: 'INV-2026-004',
    clientId: '20000000-0000-0000-0000-000000000003',
    clientName: 'Nexis Health Solutions',
    projectId: '30000000-0000-0000-0000-000000000003',
    projectName: 'Enterprise RAG Architecture',
    issueDate: '2026-08-10',
    dueDate: '2026-08-25',
    items: [
      { description: 'Medical RAG Initial Retainer', quantity: 1, unitPrice: 20000, total: 20000 }
    ],
    subtotal: 20000,
    tax: 0,
    total: 20000,
    paidAmount: 20000,
    status: 'Paid',
    notes: 'Paid via International SWIFT.',
    createdAt: '2026-08-10T12:00:00Z'
  }
];

export const INITIAL_PAYMENTS: Payment[] = [
  {
    id: '70000000-0000-0000-0000-000000000001',
    invoiceId: '60000000-0000-0000-0000-000000000001',
    invoiceNumber: 'INV-2026-001',
    clientId: '20000000-0000-0000-0000-000000000001',
    clientName: 'Shrawello Systems',
    projectId: '30000000-0000-0000-0000-000000000001',
    projectName: 'AI Voice Agent & Support Pipeline',
    amount: 15000,
    paymentDate: '2026-08-05',
    paymentMethod: 'Bank Wire',
    transactionId: 'TXN-9021-SHRAW',
    status: 'Paid',
    notes: 'Full settlement for invoice INV-2026-001',
    createdAt: '2026-08-05T14:30:00Z'
  },
  {
    id: '70000000-0000-0000-0000-000000000002',
    invoiceId: '60000000-0000-0000-0000-000000000003',
    invoiceNumber: 'INV-2026-003',
    clientId: '20000000-0000-0000-0000-000000000002',
    clientName: 'Aether Capital',
    projectId: '30000000-0000-0000-0000-000000000002',
    projectName: 'Development Basics & Workflow Hub',
    amount: 11000,
    paymentDate: '2026-07-24',
    paymentMethod: 'Stripe',
    transactionId: 'ch_3N928F201KL',
    status: 'Paid',
    notes: 'Automated credit card processing',
    createdAt: '2026-07-24T11:20:00Z'
  },
  {
    id: '70000000-0000-0000-0000-000000000003',
    invoiceId: '60000000-0000-0000-0000-000000000004',
    invoiceNumber: 'INV-2026-004',
    clientId: '20000000-0000-0000-0000-000000000003',
    clientName: 'Nexis Health Solutions',
    projectId: '30000000-0000-0000-0000-000000000003',
    projectName: 'Enterprise RAG Architecture',
    amount: 20000,
    paymentDate: '2026-08-12',
    paymentMethod: 'Bank Wire',
    transactionId: 'SWIFT-PARIS-2026',
    status: 'Paid',
    notes: 'Advance retainer for project launch',
    createdAt: '2026-08-12T16:45:00Z'
  },
  {
    id: '70000000-0000-0000-0000-000000000004',
    invoiceId: '60000000-0000-0000-0000-000000000005',
    invoiceNumber: 'INV-2026-005',
    clientId: '20000000-0000-0000-0000-000000000004',
    clientName: 'Zomira Retail Hub',
    projectId: '30000000-0000-0000-0000-000000000004',
    projectName: 'OmniChannel WhatsApp & Voice AI Bot',
    amount: 35000,
    paymentDate: '2026-08-02',
    paymentMethod: 'Bank Transfer (NEFT)',
    transactionId: 'NEFT-HDFC-98213',
    status: 'Paid',
    notes: 'Kickoff advance 50% initial payment',
    createdAt: '2026-08-02T12:00:00Z'
  },
  {
    id: '70000000-0000-0000-0000-000000000005',
    invoiceId: '60000000-0000-0000-0000-000000000006',
    invoiceNumber: 'INV-2026-006',
    clientId: '20000000-0000-0000-0000-000000000005',
    clientName: 'NeoFin Wealth Partners',
    projectId: '30000000-0000-0000-0000-000000000005',
    projectName: 'Fintech Wealth Management Dashboard',
    amount: 50000,
    paymentDate: '2026-07-22',
    paymentMethod: 'Corporate Wire',
    transactionId: 'WIRE-ICICI-88124',
    status: 'Paid',
    notes: 'Phase 1 & initial onboarding payment',
    createdAt: '2026-07-22T14:30:00Z'
  }
];

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: '80000000-0000-0000-0000-000000000001',
    category: 'Developer Cost',
    amount: 4500,
    expenseDate: '2026-08-05',
    vendor: 'Contractor Pool',
    description: 'Senior AI Engineer sprint compensation',
    paymentMethod: 'Bank Transfer',
    projectId: '30000000-0000-0000-0000-000000000001',
    projectName: 'AI Voice Agent & Support Pipeline',
    approvedBy: 'Abhinav',
    status: 'Approved',
    createdAt: '2026-08-05T09:00:00Z'
  },
  {
    id: '80000000-0000-0000-0000-000000000002',
    category: 'SaaS Tools',
    amount: 850,
    expenseDate: '2026-08-01',
    vendor: 'OpenAI & Anthropic',
    description: 'LLM API Tokens for development & prompt testing',
    paymentMethod: 'Corporate Card',
    approvedBy: 'Abhinav',
    status: 'Approved',
    createdAt: '2026-08-01T10:00:00Z'
  },
  {
    id: '80000000-0000-0000-0000-000000000003',
    category: 'Infrastructure/Cloud',
    amount: 620,
    expenseDate: '2026-08-02',
    vendor: 'Supabase & AWS',
    description: 'PostgreSQL database hosting & GPU compute',
    paymentMethod: 'Corporate Card',
    approvedBy: 'Abhinav',
    status: 'Approved',
    createdAt: '2026-08-02T11:00:00Z'
  }
];

export const INITIAL_AGREEMENTS: Agreement[] = [
  {
    id: '90000000-0000-0000-0000-000000000001',
    name: 'Master Services Agreement (MSA)',
    agreementType: 'Master Service Agreement',
    clientId: '20000000-0000-0000-0000-000000000001',
    clientName: 'Shrawello Systems',
    projectId: '30000000-0000-0000-0000-000000000001',
    projectName: 'AI Voice Agent & Support Pipeline',
    startDate: '2026-08-01',
    expiryDate: '2027-08-01',
    commercialValue: 25000,
    status: 'Signed',
    signedDate: '2026-07-28',
    fileUrl: 'https://agxperience.com/docs/msa-shrawello.pdf',
    createdAt: '2026-07-28T09:00:00Z'
  },
  {
    id: '90000000-0000-0000-0000-000000000002',
    name: 'Mutual Non-Disclosure Agreement',
    agreementType: 'NDA',
    clientId: '20000000-0000-0000-0000-000000000002',
    clientName: 'Aether Capital',
    projectId: '30000000-0000-0000-0000-000000000002',
    projectName: 'Development Basics & Workflow Hub',
    startDate: '2026-07-10',
    expiryDate: '2029-07-10',
    commercialValue: 18000,
    status: 'Signed',
    signedDate: '2026-07-10',
    fileUrl: 'https://agxperience.com/docs/nda-aether.pdf',
    createdAt: '2026-07-10T08:00:00Z'
  },
  {
    id: '90000000-0000-0000-0000-000000000003',
    name: 'Healthcare Data Processing Agreement',
    agreementType: 'Statement of Work',
    clientId: '20000000-0000-0000-0000-000000000003',
    clientName: 'Nexis Health Solutions',
    projectId: '30000000-0000-0000-0000-000000000003',
    projectName: 'Enterprise RAG Architecture',
    startDate: '2026-08-05',
    expiryDate: '2027-02-05',
    commercialValue: 32000,
    status: 'Sent',
    fileUrl: 'https://agxperience.com/docs/sow-nexis.pdf',
    createdAt: '2026-08-05T14:00:00Z'
  },
  {
    id: '90000000-0000-0000-0000-000000000004',
    name: 'Master Service Agreement & SLA',
    agreementType: 'Master Service Agreement',
    clientId: '20000000-0000-0000-0000-000000000004',
    clientName: 'Zomira Retail Hub',
    projectId: '30000000-0000-0000-0000-000000000004',
    projectName: 'OmniChannel WhatsApp & Voice AI Bot',
    startDate: '2026-08-01',
    expiryDate: '2027-08-01',
    commercialValue: 75000,
    status: 'Signed',
    signedDate: '2026-08-01',
    fileUrl: 'https://agxperience.com/docs/msa-zomira.pdf',
    createdAt: '2026-07-30T10:00:00Z'
  },
  {
    id: '90000000-0000-0000-0000-000000000005',
    name: 'Enterprise Software Development Agreement',
    agreementType: 'Statement of Work',
    clientId: '20000000-0000-0000-0000-000000000005',
    clientName: 'NeoFin Wealth Partners',
    projectId: '30000000-0000-0000-0000-000000000005',
    projectName: 'Fintech Wealth Management Dashboard',
    startDate: '2026-07-20',
    expiryDate: '2027-01-20',
    commercialValue: 120000,
    status: 'Signed',
    signedDate: '2026-07-20',
    fileUrl: 'https://agxperience.com/docs/sow-neofin.pdf',
    createdAt: '2026-07-18T14:00:00Z'
  },
  {
    id: '90000000-0000-0000-0000-000000000006',
    name: 'Supply Chain Automation SOW',
    agreementType: 'Statement of Work',
    clientId: '20000000-0000-0000-0000-000000000006',
    clientName: 'Apex Logistics Global',
    projectId: '30000000-0000-0000-0000-000000000006',
    projectName: 'Cloud Supply Chain Automation & Fleet IoT',
    startDate: '2026-09-01',
    expiryDate: '2027-03-01',
    commercialValue: 90000,
    status: 'Sent',
    fileUrl: 'https://agxperience.com/docs/sow-apex.pdf',
    createdAt: '2026-08-20T11:00:00Z'
  }
];

export const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    title: 'AGX-Shrawello-Technical-Architecture.pdf',
    docType: 'Specification',
    clientId: '20000000-0000-0000-0000-000000000001',
    clientName: 'Shrawello Systems',
    projectId: '30000000-0000-0000-0000-000000000001',
    projectName: 'AI Voice Agent & Support Pipeline',
    fileUrl: 'https://agxperience.com/docs/arch.pdf',
    fileSize: '3.4 MB',
    uploadedBy: 'Natalia Varnan',
    createdAt: '2026-08-02T10:00:00Z'
  },
  {
    id: 'a0000000-0000-0000-0000-000000000002',
    title: 'Aether-SEC-Ingestion-Flowchart.png',
    docType: 'Design',
    clientId: '20000000-0000-0000-0000-000000000002',
    clientName: 'Aether Capital',
    projectId: '30000000-0000-0000-0000-000000000002',
    projectName: 'Development Basics & Workflow Hub',
    fileUrl: 'https://agxperience.com/docs/flow.png',
    fileSize: '1.2 MB',
    uploadedBy: 'Michael Andrew',
    createdAt: '2026-08-16T15:30:00Z'
  }
];

export const INITIAL_CREDENTIALS: CredentialVaultItem[] = [
  {
    id: 'b0000000-0000-0000-0000-000000000001',
    platformName: 'LiveKit WebRTC Cloud Gateway',
    serviceUrl: 'https://cloud.livekit.io',
    username: 'ops@agxperience.com',
    passwordEncrypted: 'LiveKit_SecPass_9921#',
    apiKeyEncrypted: 'API_KEY_LIVEKIT_PROD_998127',
    clientId: '20000000-0000-0000-0000-000000000001',
    clientName: 'Shrawello Systems',
    projectId: '30000000-0000-0000-0000-000000000001',
    projectName: 'AI Voice Agent & Support Pipeline',
    notes: 'Voice agent stream connector',
    accessRoles: ['Super Admin', 'Admin', 'Project Manager'],
    createdAt: '2026-08-01T09:00:00Z',
    updatedAt: '2026-08-01T09:00:00Z'
  },
  {
    id: 'b0000000-0000-0000-0000-000000000002',
    platformName: 'SEC EDGAR Ingestion Pipeline Webhook',
    serviceUrl: 'https://api.sec.gov/edgar',
    username: 'data-sync@aethercap.com',
    passwordEncrypted: 'Aether_SecPass_8192$',
    apiKeyEncrypted: 'SEC_AUTH_TOKEN_99812',
    clientId: '20000000-0000-0000-0000-000000000002',
    clientName: 'Aether Capital',
    projectId: '30000000-0000-0000-0000-000000000002',
    projectName: 'Development Basics & Workflow Hub',
    notes: 'Webhook authorization token',
    accessRoles: ['Super Admin', 'Admin', 'Developer'],
    createdAt: '2026-07-16T11:00:00Z',
    updatedAt: '2026-07-16T11:00:00Z'
  },
  {
    id: 'b0000000-0000-0000-0000-000000000003',
    platformName: 'Nexis HIPAA Private Vault Endpoint',
    serviceUrl: 'https://vault.nexishealth.fr',
    username: 'agx_service_acc',
    passwordEncrypted: 'Nexis_VaultKey_7719@',
    apiKeyEncrypted: 'NEXIS_BEARER_TOKEN_PROD_1',
    clientId: '20000000-0000-0000-0000-000000000003',
    clientName: 'Nexis Health Solutions',
    projectId: '30000000-0000-0000-0000-000000000003',
    projectName: 'Enterprise RAG Architecture',
    notes: 'Encrypted TLS key for FHIR database sync',
    accessRoles: ['Super Admin'],
    createdAt: '2026-08-11T14:00:00Z',
    updatedAt: '2026-08-11T14:00:00Z'
  }
];

export const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    title: 'Sprint Review & Demo: Voice Agent',
    eventType: 'Meeting',
    startTime: '2026-08-21T14:00:00Z',
    endTime: '2026-08-21T15:00:00Z',
    location: 'Google Meet',
    participants: ['Abhinav', 'Karan Mehta', 'Michael Andrew'],
    relatedClientId: '20000000-0000-0000-0000-000000000001',
    relatedProjectId: '30000000-0000-0000-0000-000000000001',
    notes: 'Demonstrate real-time voice latency and tool calling flow.',
    createdAt: '2026-08-18T10:00:00Z'
  },
  {
    id: 'c0000000-0000-0000-0000-000000000002',
    title: 'Phase 2 Milestone Due',
    eventType: 'Project Deadline',
    startTime: '2026-08-28T18:00:00Z',
    location: 'Internal',
    participants: ['Michael Andrew', 'Natalia Varnan'],
    relatedClientId: '20000000-0000-0000-0000-000000000001',
    relatedProjectId: '30000000-0000-0000-0000-000000000001',
    notes: 'Deliverables handover.',
    createdAt: '2026-08-15T09:00:00Z'
  },
  {
    id: 'c0000000-0000-0000-0000-000000000003',
    title: 'Invoice Due Reminder (₹10,000)',
    eventType: 'Payment Reminder',
    startTime: '2026-08-30T09:00:00Z',
    participants: ['Robert Sterling'],
    relatedClientId: '20000000-0000-0000-0000-000000000001',
    notes: 'Follow up with Shrawello accounts team.',
    createdAt: '2026-08-15T09:00:00Z'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'd0000000-0000-0000-0000-000000000001',
    title: 'New High-Value Lead',
    message: 'Marcus Sterling from Vanguard FinTech submitted an enterprise request (₹24,000).',
    type: 'urgent',
    isRead: false,
    link: '/admin/leads',
    createdAt: '2026-08-20T08:30:00Z'
  },
  {
    id: 'd0000000-0000-0000-0000-000000000002',
    title: 'Milestone Completed',
    message: 'FHIR API Connector for Nexis Health marked as Completed.',
    type: 'success',
    isRead: false,
    link: '/admin/projects',
    createdAt: '2026-08-19T14:15:00Z'
  },
  {
    id: 'd0000000-0000-0000-0000-000000000003',
    title: 'Invoice Payment Received',
    message: 'Payment of ₹11,000 received from Aether Capital.',
    type: 'success',
    isRead: true,
    link: '/admin/finance',
    createdAt: '2026-07-24T11:20:00Z'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'e0000000-0000-0000-0000-000000000001',
    userName: 'Abhinav',
    userRole: 'Super Admin',
    actionType: 'STATUS_CHANGE',
    entityType: 'Project',
    entityId: '30000000-0000-0000-0000-000000000002',
    description: 'Updated project status for "Development Basics & Workflow Hub" from IN PROGRESS to TESTING.',
    beforeState: { status: 'IN PROGRESS' },
    afterState: { status: 'TESTING' },
    createdAt: '2026-08-20T08:00:00Z'
  },
  {
    id: 'e0000000-0000-0000-0000-000000000002',
    userName: 'Taylor Vance',
    userRole: 'Sales Manager',
    actionType: 'STATUS_CHANGE',
    entityType: 'Lead',
    entityId: '10000000-0000-0000-0000-000000000004',
    description: 'Marked lead Devon Miller (CloudScale SaaS) as WON (₹8,000).',
    beforeState: { status: 'NEGOTIATION' },
    afterState: { status: 'WON' },
    createdAt: '2026-08-20T10:00:00Z'
  },
  {
    id: 'e0000000-0000-0000-0000-000000000003',
    userName: 'Robert Sterling',
    userRole: 'Accountant',
    actionType: 'PAYMENT_RECORDED',
    entityType: 'Payment',
    entityId: '70000000-0000-0000-0000-000000000002',
    description: 'Logged ₹11,000 Stripe payment for invoice INV-2026-003.',
    createdAt: '2026-07-24T11:20:00Z'
  }
];

export const INITIAL_ISSUES: ProjectIssue[] = [
  {
    id: 'f0000000-0000-0000-0000-000000000010',
    projectId: 'omnilog-demo',
    projectName: 'Autonomous Freight Dispatch & Fleet Telemetry AI',
    clientId: '20000000-0000-0000-0000-000000000007',
    clientName: 'Omnilog Freight Systems',
    ticketNumber: 'ISSUE-2026-081',
    title: 'GPS telematics webhook retry on carrier API timeout',
    description: 'When Geotab fleet API undergoes scheduled maintenance, webhook payload drops without retry. Need exponential backoff retry queue.',
    issueType: 'Bug',
    priority: 'High',
    status: 'IN PROGRESS',
    reporterName: 'Marcus Chen',
    reporterEmail: 'marcus.chen@omnilog.io',
    reporterPhone: '+1 (312) 880-9214',
    adminNotes: 'Implementing Redis BullMQ retry queue with 5 attempts.',
    assignedTo: 'Natalia Varnan',
    createdAt: '2026-08-20T10:15:00Z',
    updatedAt: '2026-08-21T14:30:00Z'
  },
  {
    id: 'f0000000-0000-0000-0000-000000000011',
    projectId: 'omnilog-demo',
    projectName: 'Autonomous Freight Dispatch & Fleet Telemetry AI',
    clientId: '20000000-0000-0000-0000-000000000007',
    clientName: 'Omnilog Freight Systems',
    ticketNumber: 'ISSUE-2026-082',
    title: 'Automated Rate Negotiation Voice latency tuned down to 420ms',
    description: 'Outbound rate negotiation voicebot response lag was 1.8s. Tuned VAD (Voice Activity Detection) threshold and streamed chunk generation.',
    issueType: 'Performance',
    priority: 'Critical',
    status: 'RESOLVED',
    reporterName: 'Marcus Chen',
    reporterEmail: 'marcus.chen@omnilog.io',
    reporterPhone: '+1 (312) 880-9214',
    adminNotes: 'Switched to Groq Llama 3 70B inference endpoint with ElevenLabs Turbo v2.5 streaming.',
    resolutionNotes: 'Latency benchmark achieved 418ms roundtrip. Driver field test passed successfully.',
    assignedTo: 'Abhinav',
    resolvedAt: '2026-08-23T16:00:00Z',
    createdAt: '2026-08-21T09:00:00Z',
    updatedAt: '2026-08-23T16:00:00Z'
  },
  {
    id: 'f0000000-0000-0000-0000-000000000001',
    projectId: '30000000-0000-0000-0000-000000000001',
    projectName: 'AI Voice Agent & Support Pipeline',
    clientId: '20000000-0000-0000-0000-000000000001',
    clientName: 'Shrawello Systems',
    ticketNumber: 'ISSUE-2026-001',
    title: 'Voice stream echo during LiveKit WebRTC reconnect',
    description: 'When switching between Wi-Fi and 5G cellular, the agent audio produces a 1.2s delayed duplicate echo. Steps: start call on mobile Safari, toggle Wi-Fi off.',
    issueType: 'Bug',
    priority: 'High',
    status: 'IN PROGRESS',
    reporterName: 'Sarah Jenkins',
    reporterEmail: 'sjenkins@apexlogistics.io',
    reporterPhone: '+1 (555) 382-9012',
    adminNotes: 'Assigned to Natalia to adjust WebRTC echo cancellation constraints.',
    resolutionNotes: 'Implementing buffer flush on iceconnectionstatechange event.',
    assignedTo: 'Natalia Varnan',
    createdAt: '2026-08-18T10:30:00Z',
    updatedAt: '2026-08-19T14:20:00Z'
  },
  {
    id: 'f0000000-0000-0000-0000-000000000002',
    projectId: '30000000-0000-0000-0000-000000000001',
    projectName: 'AI Voice Agent & Support Pipeline',
    clientId: '20000000-0000-0000-0000-000000000001',
    clientName: 'Shrawello Systems',
    ticketNumber: 'ISSUE-2026-002',
    title: 'Custom voice personality tone needs to be more formal',
    description: 'Our executive board requested that the customer support tone avoids casual greetings like "Hey there" and instead uses "Good morning/afternoon, thank you for calling Shrawello".',
    issueType: 'Content Change',
    priority: 'Medium',
    status: 'RESOLVED',
    reporterName: 'Sarah Jenkins',
    reporterEmail: 'sjenkins@apexlogistics.io',
    reporterPhone: '+1 (555) 382-9012',
    adminNotes: 'Prompt modified in ElevenLabs dynamic system instructions.',
    resolutionNotes: 'Updated system prompt and greeting fallback in production agent.',
    assignedTo: 'Abhinav',
    resolvedAt: '2026-08-19T16:00:00Z',
    createdAt: '2026-08-17T11:00:00Z',
    updatedAt: '2026-08-19T16:00:00Z'
  },
  {
    id: 'f0000000-0000-0000-0000-000000000003',
    projectId: '30000000-0000-0000-0000-000000000002',
    projectName: 'Development Basics & Workflow Hub',
    clientId: '20000000-0000-0000-0000-000000000002',
    clientName: 'Aether Capital',
    ticketNumber: 'ISSUE-2026-003',
    title: 'SEC 10-K parsing timeout on reports exceeding 200 pages',
    description: 'When ingesting large annual filings with heavy tables, the background worker times out after 60 seconds.',
    issueType: 'Performance',
    priority: 'Critical',
    status: 'REPORTED',
    reporterName: 'Marcus Sterling',
    reporterEmail: 'm.sterling@vanguardft.co.uk',
    adminNotes: 'Need to chunk PDF tables into Redis background queue.',
    assignedTo: 'Natalia Varnan',
    createdAt: '2026-08-20T09:15:00Z',
    updatedAt: '2026-08-20T09:15:00Z'
  },
  {
    id: 'f0000000-0000-0000-0000-000000000004',
    projectId: '30000000-0000-0000-0000-000000000004',
    projectName: 'OmniChannel WhatsApp & Voice AI Bot',
    clientId: '20000000-0000-0000-0000-000000000004',
    clientName: 'Zomira Retail Hub',
    ticketNumber: 'ISSUE-2026-101',
    title: 'WhatsApp Webhook timeouts during flash sale traffic spikes',
    description: 'During our Saturday 8 PM flash sale, incoming customer inquiries were queued for over 45 seconds before the bot answered. Need to increase concurrency worker threshold.',
    issueType: 'Bug',
    priority: 'High',
    status: 'IN PROGRESS',
    reporterName: 'Rohan Deshmukh',
    reporterEmail: 'rohan@zomiraretail.com',
    reporterPhone: '+91 98201 44882',
    adminNotes: 'Scaling FastAPI webhook workers from 2 to 8 instances on AWS ECS.',
    resolutionNotes: 'Configured Redis queue with horizontal autoscaling for Meta webhook endpoints.',
    assignedTo: 'Natalia Varnan',
    createdAt: '2026-08-21T18:30:00Z',
    updatedAt: '2026-08-22T10:15:00Z'
  },
  {
    id: 'f0000000-0000-0000-0000-000000000005',
    projectId: '30000000-0000-0000-0000-000000000004',
    projectName: 'OmniChannel WhatsApp & Voice AI Bot',
    clientId: '20000000-0000-0000-0000-000000000004',
    clientName: 'Zomira Retail Hub',
    ticketNumber: 'ISSUE-2026-102',
    title: 'Update welcome greeting copy for festive season',
    description: 'Please change the initial greeting message to include our Diwali promotion code "FESTIVE25" and link to the festive catalog.',
    issueType: 'Content Change',
    priority: 'Medium',
    status: 'RESOLVED',
    reporterName: 'Rohan Deshmukh',
    reporterEmail: 'rohan@zomiraretail.com',
    reporterPhone: '+91 98201 44882',
    adminNotes: 'Prompt updated in conversational intent model.',
    resolutionNotes: 'Updated greeting template in Meta Business Manager and synced with agent system prompt.',
    assignedTo: 'Abhinav',
    resolvedAt: '2026-08-23T12:00:00Z',
    createdAt: '2026-08-22T09:00:00Z',
    updatedAt: '2026-08-23T12:00:00Z'
  },
  {
    id: 'f0000000-0000-0000-0000-000000000006',
    projectId: '30000000-0000-0000-0000-000000000005',
    projectName: 'Fintech Wealth Management Dashboard',
    clientId: '20000000-0000-0000-0000-000000000005',
    clientName: 'NeoFin Wealth Partners',
    ticketNumber: 'ISSUE-2026-103',
    title: 'Mutual fund NAV chart tooltip flickers on mobile touch screens',
    description: 'When dragging finger across the 1-year historical return graph on iOS Safari, the value tooltip flickers rapidly and jumps position.',
    issueType: 'UI/UX Polish',
    priority: 'Medium',
    status: 'REPORTED',
    reporterName: 'Pooja Singhania',
    reporterEmail: 'pooja.s@neofinwealth.in',
    reporterPhone: '+91 97110 55991',
    adminNotes: 'Add debounced touch move listener to Recharts responsive container.',
    createdAt: '2026-08-24T11:45:00Z',
    updatedAt: '2026-08-24T11:45:00Z'
  },
  {
    id: 'f0000000-0000-0000-0000-000000000007',
    projectId: '30000000-0000-0000-0000-000000000005',
    projectName: 'Fintech Wealth Management Dashboard',
    clientId: '20000000-0000-0000-0000-000000000005',
    clientName: 'NeoFin Wealth Partners',
    ticketNumber: 'ISSUE-2026-104',
    title: 'Add two-factor SMS OTP retry countdown timer',
    description: 'Clients requesting re-send of 2FA authentication SMS during login should see a 30-second countdown button instead of instant clicks.',
    issueType: 'Feature Revision',
    priority: 'High',
    status: 'IN REVIEW',
    reporterName: 'Aditya Rao',
    reporterEmail: 'aditya.r@neofinwealth.in',
    reporterPhone: '+91 98112 00412',
    adminNotes: 'UX improvement for auth flow to prevent SMS gateway rate limiting.',
    assignedTo: 'Taylor Vance',
    createdAt: '2026-08-23T15:20:00Z',
    updatedAt: '2026-08-24T09:30:00Z'
  }
];

const STORAGE_PREFIX = 'agx_crm_';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    if (item === null || item === undefined) return fallback;
    const parsed = JSON.parse(item);
    if (Array.isArray(fallback)) {
      if (!Array.isArray(parsed)) return fallback;
      if (key === 'projects') {
        return parsed.map((p: any) => ({
          ...p,
          portalToken: p.portalToken || `prj_sec_${(p.name || 'proj').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8)}_${p.id.slice(0, 6)}`,
          portalEnabled: p.portalEnabled !== undefined ? p.portalEnabled : true
        })) as unknown as T;
      }
      return parsed as unknown as T;
    }
    if (fallback && typeof fallback === 'object') {
      return ((parsed && typeof parsed === 'object') ? { ...fallback, ...parsed } : fallback) as T;
    }
    return (parsed ?? fallback) as T;
  } catch (e) {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to storage', e);
  }
}

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch (_) {}
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Global hook & store state
export function useCrmStore() {
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => 
    loadFromStorage('current_user', INITIAL_USERS[0])
  );
  const [teamMembers, setTeamMembers] = useState<UserProfile[]>(() => 
    loadFromStorage('team_members', INITIAL_USERS)
  );
  const [leads, setLeads] = useState<Lead[]>(() => loadFromStorage('leads', INITIAL_LEADS));
  const [clients, setClients] = useState<Client[]>(() => loadFromStorage('clients', INITIAL_CLIENTS));
  const [projects, setProjects] = useState<Project[]>(() => loadFromStorage('projects', INITIAL_PROJECTS));
  const [tasks, setTasks] = useState<Task[]>(() => loadFromStorage('tasks', INITIAL_TASKS));
  const [invoices, setInvoices] = useState<Invoice[]>(() => loadFromStorage('invoices', INITIAL_INVOICES));
  const [payments, setPayments] = useState<Payment[]>(() => loadFromStorage('payments', INITIAL_PAYMENTS));
  const [expenses, setExpenses] = useState<Expense[]>(() => loadFromStorage('expenses', INITIAL_EXPENSES));
  const [agreements, setAgreements] = useState<Agreement[]>(() => loadFromStorage('agreements', INITIAL_AGREEMENTS));
  const [documents, setDocuments] = useState<DocumentItem[]>(() => loadFromStorage('documents', INITIAL_DOCUMENTS));
  const [credentials, setCredentials] = useState<CredentialVaultItem[]>(() => loadFromStorage('credentials', INITIAL_CREDENTIALS));
  const [events, setEvents] = useState<CalendarEvent[]>(() => loadFromStorage('events', INITIAL_EVENTS));
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => loadFromStorage('notifications', INITIAL_NOTIFICATIONS));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => loadFromStorage('audit_logs', INITIAL_AUDIT_LOGS));
  const [issues, setIssues] = useState<ProjectIssue[]>(() => loadFromStorage('issues', INITIAL_ISSUES));

  // Connection & sync state
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Sync to local storage
  useEffect(() => saveToStorage('current_user', currentUser), [currentUser]);
  useEffect(() => saveToStorage('team_members', teamMembers), [teamMembers]);
  useEffect(() => saveToStorage('leads', leads), [leads]);
  useEffect(() => saveToStorage('clients', clients), [clients]);
  useEffect(() => saveToStorage('projects', projects), [projects]);
  useEffect(() => saveToStorage('tasks', tasks), [tasks]);
  useEffect(() => saveToStorage('invoices', invoices), [invoices]);
  useEffect(() => saveToStorage('payments', payments), [payments]);
  useEffect(() => saveToStorage('expenses', expenses), [expenses]);
  useEffect(() => saveToStorage('agreements', agreements), [agreements]);
  useEffect(() => saveToStorage('documents', documents), [documents]);
  useEffect(() => saveToStorage('credentials', credentials), [credentials]);
  useEffect(() => saveToStorage('events', events), [events]);
  useEffect(() => saveToStorage('notifications', notifications), [notifications]);
  useEffect(() => saveToStorage('audit_logs', auditLogs), [auditLogs]);
  useEffect(() => saveToStorage('issues', issues), [issues]);

  // Cloud Data Loader
  const refreshFromCloud = useCallback(async (silent = false) => {
    try {
      if (!silent) setIsSyncing(true);
      const data = await crmService.fetchAllData();

      // Guard: Only replace operational state if cloud actually returned records.
      // If cloud database is empty / unseeded, retain local/mock data to prevent empty screen.
      const hasCloudData = 
        (data.projects?.length || 0) > 0 || 
        (data.leads?.length || 0) > 0 || 
        (data.clients?.length || 0) > 0;

      if (hasCloudData) {
        if (data.profiles !== undefined) setTeamMembers(data.profiles.length > 0 ? data.profiles : INITIAL_USERS);
        if (data.leads !== undefined) setLeads(data.leads);
        if (data.clients !== undefined) setClients(data.clients);
        if (data.projects !== undefined) setProjects(data.projects);
        if (data.tasks !== undefined) setTasks(data.tasks);
        if (data.invoices !== undefined) setInvoices(data.invoices);
        if (data.payments !== undefined) setPayments(data.payments);
        if (data.expenses !== undefined) setExpenses(data.expenses);
        if (data.agreements !== undefined) setAgreements(data.agreements);
        if (data.documents !== undefined) setDocuments(data.documents);
        if (data.credentials !== undefined) setCredentials(data.credentials);
        if (data.events !== undefined) setEvents(data.events);
        if (data.notifications !== undefined) setNotifications(data.notifications);
        if (data.auditLogs !== undefined) setAuditLogs(data.auditLogs);
      } else {
        console.log('[crmStore] Cloud database is unseeded or empty. Retaining current operational dataset.');
      }

      const cloudIssues = await crmService.fetchAllIssues();
      if (cloudIssues && cloudIssues.length > 0) {
        setIssues(cloudIssues);
      }

      setIsSupabaseConnected(true);
      setLastSyncedAt(new Date());
      setSyncError(null);
      if (!silent) toast.success('Synced with Supabase Live', 'All CRM tables are up to date.');
    } catch (err: any) {
      console.warn('Supabase fetch error, maintaining local state:', err);
      setIsSupabaseConnected(false);
      setSyncError(err?.message || 'Failed to sync with Supabase');
      if (!silent) toast.error('Cloud Sync Error', 'Operating in local cache fallback mode.');
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  }, []);

  // Initial mount: load data from Supabase & subscribe to realtime
  useEffect(() => {
    refreshFromCloud(true);

    const unsubscribe = crmService.subscribeToChanges((table, payload) => {
      console.log(`[Realtime Supabase] ${table} change:`, payload.eventType);
      refreshFromCloud(true);
    });

    return () => {
      unsubscribe();
    };
  }, [refreshFromCloud]);

  // Role switch & Auth helper
  const switchRole = (role: UserRole) => {
    const matched = teamMembers.find(u => u.role === role) || {
      id: `role-${role.toLowerCase().replace(/\s+/g, '-')}`,
      email: `${role.toLowerCase().replace(/\s+/g, '.')}@agxperience.com`,
      fullName: `${role} User`,
      role,
      department: 'Operations',
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(role)}`
    };
    setCurrentUser(matched);
    logAudit('STATUS_CHANGE', 'User', matched.id, `Switched session active role to ${role}`);
    toast.info('Role Switched', `Logged in as ${matched.fullName} (${role})`);
  };

  const loginUser = (user: UserProfile) => {
    setCurrentUser(user);
    toast.success('Authentication Successful', `Welcome back, ${user.fullName}`);
  };

  const logoutUser = () => {
    setCurrentUser(INITIAL_USERS[0]);
    toast.info('Signed Out', 'Active session ended.');
  };

  // Audit log creator
  const logAudit = (
    actionType: AuditLog['actionType'],
    entityType: AuditLog['entityType'],
    entityId: string | undefined,
    description: string,
    beforeState?: any,
    afterState?: any
  ) => {
    const newLog: AuditLog = {
      id: generateUUID(),
      userName: currentUser.fullName.split(' ')[0] || 'User',
      userRole: currentUser.role,
      actionType,
      entityType,
      entityId,
      description,
      beforeState,
      afterState,
      createdAt: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);

    crmService.createAuditLog({
      userName: newLog.userName,
      userRole: newLog.userRole,
      actionType: newLog.actionType,
      entityType: newLog.entityType,
      entityId: newLog.entityId,
      description: newLog.description,
      beforeState: newLog.beforeState,
      afterState: newLog.afterState
    }).catch(err => console.warn('Supabase audit log persist failed:', err));
  };

  // --- Lead Actions ---
  const addLead = (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    const tempId = generateUUID();
    const newLead: Lead = {
      ...lead,
      id: tempId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setLeads(prev => [newLead, ...prev]);
    logAudit('CREATE', 'Lead', newLead.id, `Created new lead: ${newLead.name} (${newLead.company})`);
    toast.success('Lead Created', `${newLead.name} added to deal pipeline.`);

    crmService.createLead(lead).then(savedLead => {
      setLeads(prev => prev.map(l => l.id === tempId ? savedLead : l));
    }).catch(err => {
      console.warn('Supabase lead create error:', err);
      toast.error('Sync Warning', 'Failed to save lead in cloud database.');
    });
  };

  const updateLead = (leadId: string, updates: Partial<Lead>) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l));
    logAudit('STATUS_CHANGE', 'Lead', leadId, `Updated details for lead ID ${leadId}`, null, updates);
    toast.success('Lead Updated', 'Changes saved successfully.');

    crmService.updateLead(leadId, updates).catch(err => console.warn('Supabase update lead error:', err));
  };

  const STAGE_DEFAULT_PROBABILITIES: Record<LeadStatus, number> = {
    'NEW': 10,
    'CONTACTED': 25,
    'QUALIFIED': 50,
    'PROPOSAL SENT': 75,
    'NEGOTIATION': 90,
    'WON': 100,
    'LOST': 0
  };

  const updateLeadStatus = (leadId: string, newStatus: LeadStatus, lossReason?: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;
    const oldStatus = lead.status;
    const newProbability = STAGE_DEFAULT_PROBABILITIES[newStatus] ?? lead.probability;
    const effectiveLossReason = newStatus === 'LOST' ? (lossReason || lead.lossReason || 'Closed Lost') : undefined;

    setLeads(prev => prev.map(l => l.id === leadId ? {
      ...l,
      status: newStatus,
      probability: newProbability,
      lossReason: effectiveLossReason,
      updatedAt: new Date().toISOString()
    } : l));

    logAudit(
      'STATUS_CHANGE',
      'Lead',
      leadId,
      `Updated lead status for ${lead.name} from ${oldStatus} to ${newStatus} (${newProbability}% probability)${effectiveLossReason ? ` - Reason: ${effectiveLossReason}` : ''}`,
      { status: oldStatus },
      { status: newStatus, probability: newProbability, lossReason: effectiveLossReason }
    );
    toast.info('Deal Stage Updated', `${lead.name} moved to ${newStatus} (${newProbability}%)${effectiveLossReason ? ` · ${effectiveLossReason}` : ''}`);

    crmService.updateLead(leadId, {
      status: newStatus,
      probability: newProbability,
      lossReason: effectiveLossReason
    }).catch(err => console.warn('Supabase update lead status error:', err));
  };

  const deleteLead = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    setLeads(prev => prev.filter(l => l.id !== leadId));
    logAudit('DELETE', 'Lead', leadId, `Deleted lead: ${lead?.name || leadId}`);
    toast.warning('Lead Removed', `${lead?.name || 'Lead'} has been deleted.`);

    crmService.deleteLead(leadId).catch(err => console.warn('Supabase delete lead error:', err));
  };

  const convertLeadToClient = async (leadId: string, options?: {
    accountManager?: string;
    serviceType?: string;
    projectDueDate?: string;
    milestoneSplit?: '50/50' | '40/30/30' | '30/70' | '100';
  }) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    const tempClientId = generateUUID();
    const tempProjectId = generateUUID();
    const dealVal = lead.estimatedDealValue || 0;
    const dueDate = options?.projectDueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const accountMgr = options?.accountManager || lead.assignedTo || currentUser.fullName;
    const serviceType = options?.serviceType || lead.interestedService || 'Custom AI Agent';
    const split = options?.milestoneSplit || '50/50';

    const newClientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'> = {
      name: lead.name,
      company: lead.company || lead.name,
      phone: lead.phone,
      email: lead.email,
      website: '',
      address: lead.location || '',
      industry: 'AI & Digital Operations',
      accountManager: accountMgr,
      totalValue: dealVal,
      totalPaid: 0,
      outstandingAmount: dealVal,
      source: lead.source,
      notes: `Converted from won lead. Initial deal size: ₹${dealVal.toLocaleString('en-IN')}`,
      status: 'Active'
    };

    const initialClient: Client = {
      ...newClientData,
      id: tempClientId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Calculate dynamic milestone deliverables based on selected split
    let splitConfigs: Array<{ title: string; daysOffset: number; status: 'In Progress' | 'Pending'; progress: number; pct: number }> = [];

    if (split === '40/30/30') {
      splitConfigs = [
        { title: 'Project Architecture & Technical Blueprint', daysOffset: 7, status: 'In Progress', progress: 20, pct: 0.4 },
        { title: 'Core Implementation & Alpha Release', daysOffset: 20, status: 'Pending', progress: 0, pct: 0.3 },
        { title: 'Final Handover, QA Sign-off & Production Go-Live', daysOffset: 30, status: 'Pending', progress: 0, pct: 0.3 }
      ];
    } else if (split === '30/70') {
      splitConfigs = [
        { title: 'Advance Inception & Architecture Setup', daysOffset: 7, status: 'In Progress', progress: 20, pct: 0.3 },
        { title: 'Full Delivery, Client Verification & Handoff', daysOffset: 30, status: 'Pending', progress: 0, pct: 0.7 }
      ];
    } else if (split === '100') {
      splitConfigs = [
        { title: 'Complete Solution Delivery & Production Sign-off', daysOffset: 30, status: 'In Progress', progress: 10, pct: 1.0 }
      ];
    } else {
      // 50/50 Default
      splitConfigs = [
        { title: 'Project Kickoff & Architecture', daysOffset: 7, status: 'In Progress', progress: 20, pct: 0.5 },
        { title: 'Final Handover & Delivery', daysOffset: 30, status: 'Pending', progress: 0, pct: 0.5 }
      ];
    }

    const optimisticMilestones: ProjectMilestone[] = splitConfigs.map(cfg => ({
      id: generateUUID(),
      projectId: tempProjectId,
      title: cfg.title,
      dueDate: new Date(Date.now() + cfg.daysOffset * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: cfg.status,
      progress: cfg.progress,
      amount: Math.round(dealVal * cfg.pct)
    }));

    const initialProject: Project = {
      id: tempProjectId,
      name: `${lead.company || lead.name} - ${serviceType}`,
      clientId: tempClientId,
      clientName: initialClient.company,
      serviceType: serviceType,
      projectManager: accountMgr,
      assignedTeam: [accountMgr],
      startDate: new Date().toISOString().split('T')[0],
      dueDate: dueDate,
      projectValue: dealVal,
      receivedAmount: 0,
      pendingAmount: dealVal,
      status: 'PLANNING',
      priority: lead.priority || 'High',
      progress: 10,
      description: `Implementation for ${lead.company}. Scope: ${serviceType}`,
      milestones: optimisticMilestones,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Optimistic local state update
    setClients(prev => [initialClient, ...prev]);
    setProjects(prev => [initialProject, ...prev]);
    updateLeadStatus(leadId, 'WON');
    logAudit('CONVERT_LEAD', 'Client', initialClient.id, `Converted won lead ${lead.name} into client ${initialClient.company} (${split} split)`);
    toast.success('Lead Converted! 🎉', `${lead.company} is now an active client with ${optimisticMilestones.length} milestones generated.`);

    // Persist to Supabase and sync real database UUIDs
    try {
      const savedClient = await crmService.createClient(newClientData);
      const savedProject = await crmService.createProject({
        name: initialProject.name,
        clientId: savedClient.id,
        clientName: savedClient.company,
        serviceType: initialProject.serviceType,
        projectManager: initialProject.projectManager,
        assignedTeam: initialProject.assignedTeam,
        startDate: initialProject.startDate,
        dueDate: initialProject.dueDate,
        projectValue: initialProject.projectValue,
        receivedAmount: initialProject.receivedAmount,
        pendingAmount: initialProject.pendingAmount,
        status: initialProject.status,
        priority: initialProject.priority,
        progress: initialProject.progress,
        description: initialProject.description,
        milestones: []
      });

      const initialMilestones: Omit<ProjectMilestone, 'id'>[] = splitConfigs.map(cfg => ({
        projectId: savedProject.id,
        title: cfg.title,
        dueDate: new Date(Date.now() + cfg.daysOffset * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: cfg.status,
        progress: cfg.progress,
        amount: Math.round(dealVal * cfg.pct)
      }));

      const savedMilestones = await crmService.createMilestonesBatch(initialMilestones);

      const persistedProject: Project = {
        ...savedProject,
        milestones: savedMilestones
      };

      // Swap temporary IDs with real Supabase objects
      setClients(prev => prev.map(c => c.id === tempClientId ? savedClient : c));
      setProjects(prev => prev.map(p => p.id === tempProjectId ? persistedProject : p));
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, convertedClientId: savedClient.id, convertedProjectId: savedProject.id } : l));
      await crmService.updateLead(leadId, { convertedClientId: savedClient.id, convertedProjectId: savedProject.id });

      return { client: savedClient, project: persistedProject };
    } catch (err) {
      console.warn('Supabase lead conversion sync exception:', err);
      return { client: initialClient, project: initialProject };
    }
  };

  const addLeadActivity = (leadId: string, activityType: LeadActivityType, notes: string) => {
    const tempId = generateUUID();
    const newActivity: LeadActivity = {
      id: tempId,
      leadId,
      userName: currentUser.fullName,
      activityType,
      notes,
      createdAt: new Date().toISOString()
    };

    setLeads(prev => prev.map(l => {
      if (l.id === leadId) {
        return {
          ...l,
          activities: [newActivity, ...(l.activities || [])],
          lastContacted: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
      return l;
    }));

    toast.success('Activity Logged', `${activityType} recorded.`);

    crmService.createLeadActivity({
      leadId,
      userName: currentUser.fullName,
      activityType,
      notes
    }).then(savedAct => {
      setLeads(prev => prev.map(l => {
        if (l.id === leadId) {
          return {
            ...l,
            activities: (l.activities || []).map(a => a.id === tempId ? savedAct : a)
          };
        }
        return l;
      }));
    }).catch(err => console.warn('Supabase lead activity error:', err));
  };

  // --- Client Actions ---
  const addClient = (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    const tempId = generateUUID();
    const newClient: Client = {
      ...client,
      id: tempId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setClients(prev => [newClient, ...prev]);
    logAudit('CREATE', 'Client', newClient.id, `Added client: ${newClient.company}`);
    toast.success('Client Added', `${newClient.company} profile established.`);

    crmService.createClient(client).then(savedClient => {
      setClients(prev => prev.map(c => c.id === tempId ? savedClient : c));
    }).catch(err => console.warn('Supabase add client error:', err));
  };

  const updateClient = (clientId: string, updates: Partial<Client>) => {
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c));
    logAudit('STATUS_CHANGE', 'Client', clientId, `Updated client ID ${clientId}`, null, updates);
    toast.success('Client Updated', 'Client 360° details saved.');

    crmService.updateClient(clientId, updates).catch(err => console.warn('Supabase update client error:', err));
  };

  const deleteClient = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    setClients(prev => prev.filter(c => c.id !== clientId));
    logAudit('DELETE', 'Client', clientId, `Deleted client: ${client?.company || clientId}`);
    toast.warning('Client Removed', `${client?.company || 'Client'} has been deleted.`);

    crmService.deleteClient(clientId).catch(err => console.warn('Supabase delete client error:', err));
  };

  // --- Project Actions ---
  const addProject = (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const tempId = generateUUID();
    const newProject: Project = {
      ...project,
      id: tempId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setProjects(prev => [newProject, ...prev]);
    logAudit('CREATE', 'Project', newProject.id, `Created project: ${newProject.name}`);
    toast.success('Project Created', `${newProject.name} added to active operations.`);

    crmService.createProject(project).then(savedProject => {
      setProjects(prev => prev.map(p => p.id === tempId ? savedProject : p));
    }).catch(err => console.warn('Supabase add project error:', err));
  };

  const updateProject = (projectId: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p));
    logAudit('STATUS_CHANGE', 'Project', projectId, `Updated project ID ${projectId}`, null, updates);
    toast.success('Project Updated', 'Project details saved.');

    crmService.updateProject(projectId, updates).catch(err => console.warn('Supabase update project error:', err));
  };

  const updateProjectStatus = (projectId: string, status: ProjectStatus, progress?: number) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const updated = { ...p, status, progress: progress !== undefined ? progress : p.progress, updatedAt: new Date().toISOString() };
        logAudit('STATUS_CHANGE', 'Project', projectId, `Updated project status for "${p.name}" to ${status}`);
        return updated;
      }
      return p;
    }));
    toast.info('Project Status Changed', `Status updated to ${status}`);

    crmService.updateProjectStatus(projectId, status, progress).catch(err => console.warn('Supabase update project status error:', err));
  };

  const deleteProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    setProjects(prev => prev.filter(p => p.id !== projectId));
    logAudit('DELETE', 'Project', projectId, `Deleted project: ${project?.name || projectId}`);
    toast.warning('Project Removed', `${project?.name || 'Project'} deleted.`);

    crmService.deleteProject(projectId).catch(err => console.warn('Supabase delete project error:', err));
  };

  const calcProjectProgress = (projectId: string, milestonesList: ProjectMilestone[], currentTasks: Task[] = tasks): number => {
    let milestoneProgress = 0;
    if (milestonesList && milestonesList.length > 0) {
      const totalAmount = milestonesList.reduce((sum, m) => sum + (m.amount || 0), 0);
      if (totalAmount > 0) {
        const weighted = milestonesList.reduce((sum, m) => sum + ((m.progress || 0) * (m.amount || 0)), 0);
        milestoneProgress = Math.min(100, Math.max(0, Math.round(weighted / totalAmount)));
      } else {
        const simpleAvg = milestonesList.reduce((sum, m) => sum + (m.progress || 0), 0) / milestonesList.length;
        milestoneProgress = Math.min(100, Math.max(0, Math.round(simpleAvg)));
      }
    }

    const projectTasks = currentTasks.filter(t => t.projectId === projectId);
    if (projectTasks.length > 0) {
      const completedTasks = projectTasks.filter(t => t.status === 'COMPLETED').length;
      const taskProgress = Math.round((completedTasks / projectTasks.length) * 100);
      if (milestonesList && milestonesList.length > 0) {
        return Math.min(100, Math.max(0, Math.round(milestoneProgress * 0.7 + taskProgress * 0.3)));
      }
      return taskProgress;
    }
    return milestoneProgress;
  };

  const addMilestone = (projectId: string, milestone: Omit<ProjectMilestone, 'id'>) => {
    const tempId = generateUUID();
    const newM: ProjectMilestone = { ...milestone, id: tempId };

    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const nextMilestones = [...(p.milestones || []), newM];
        const nextProgress = calcProjectProgress(p.id, nextMilestones);
        return { ...p, milestones: nextMilestones, progress: nextProgress };
      }
      return p;
    }));
    toast.success('Milestone Added', `${milestone.title} scheduled.`);

    crmService.createMilestone(milestone).then(savedM => {
      setProjects(prev => prev.map(p => {
        if (p.id === projectId) {
          const nextMilestones = p.milestones.map(m => m.id === tempId ? savedM : m);
          const nextProgress = calcProjectProgress(p.id, nextMilestones);
          crmService.updateProject(p.id, { progress: nextProgress }).catch(() => {});
          return { ...p, milestones: nextMilestones, progress: nextProgress };
        }
        return p;
      }));
    }).catch(err => console.warn('Supabase add milestone error:', err));
  };

  const updateMilestone = (projectId: string, milestoneId: string, updates: Partial<ProjectMilestone>) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const nextMilestones = p.milestones.map(m => m.id === milestoneId ? { ...m, ...updates } : m);
        const nextProgress = calcProjectProgress(p.id, nextMilestones);
        crmService.updateProject(p.id, { progress: nextProgress }).catch(() => {});
        return { ...p, milestones: nextMilestones, progress: nextProgress };
      }
      return p;
    }));
    toast.success('Milestone Updated', 'Progress saved.');

    crmService.updateMilestone(milestoneId, updates).catch(err => console.warn('Supabase update milestone error:', err));
  };

  const deleteMilestone = (projectId: string, milestoneId: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const nextMilestones = p.milestones.filter(m => m.id !== milestoneId);
        const nextProgress = calcProjectProgress(p.id, nextMilestones);
        crmService.updateProject(p.id, { progress: nextProgress }).catch(() => {});
        return { ...p, milestones: nextMilestones, progress: nextProgress };
      }
      return p;
    }));
    toast.warning('Milestone Deleted', 'Removed from project.');

    crmService.deleteMilestone(milestoneId).catch(err => console.warn('Supabase delete milestone error:', err));
  };

  // --- Task Actions ---
  const addTask = (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const tempId = generateUUID();
    const newTask: Task = {
      ...task,
      id: tempId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setTasks(prev => [newTask, ...prev]);
    logAudit('CREATE', 'Task', newTask.id, `Created task: ${newTask.title}`);
    toast.success('Task Assigned', `${newTask.title} created.`);

    crmService.createTask(task).then(savedTask => {
      setTasks(prev => prev.map(t => t.id === tempId ? savedTask : t));
    }).catch(err => console.warn('Supabase add task error:', err));
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    let targetProjectId: string | undefined;
    setTasks(prev => {
      const nextTasks = prev.map(t => {
        if (t.id === taskId) {
          targetProjectId = updates.projectId || t.projectId || undefined;
          return { ...t, ...updates, updatedAt: new Date().toISOString() };
        }
        return t;
      });

      if (targetProjectId) {
        setProjects(projPrev => projPrev.map(p => {
          if (p.id === targetProjectId) {
            const nextProgress = calcProjectProgress(p.id, p.milestones || [], nextTasks);
            crmService.updateProject(p.id, { progress: nextProgress }).catch(() => {});
            return { ...p, progress: nextProgress };
          }
          return p;
        }));
      }

      return nextTasks;
    });

    toast.success('Task Updated', 'Sprint item updated.');
    crmService.updateTask(taskId, updates).catch(err => console.warn('Supabase update task error:', err));
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    let targetProjectId: string | undefined;
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      targetProjectId = task.projectId || undefined;
      // Auto-resolve linked issue if ticket was completed
      if (status === 'COMPLETED') {
        const match = task.title.match(/\[Ticket #(ISSUE-[^\]]+)\]/);
        if (match && match[1]) {
          const ticketNum = match[1];
          const linkedIssue = issues.find(i => i.ticketNumber === ticketNum);
          if (linkedIssue && linkedIssue.status !== 'RESOLVED' && linkedIssue.status !== 'CLOSED') {
            updateIssue(linkedIssue.id, {
              status: 'RESOLVED',
              resolvedAt: new Date().toISOString(),
              resolutionNotes: `Automatically marked RESOLVED upon completion of sprint task "${task.title}".`
            });
            toast.success('Linked Issue Resolved ✅', `Ticket #${ticketNum} marked Resolved via sprint completion.`);
          }
        }
      }
    }

    setTasks(prev => {
      const nextTasks = prev.map(t => {
        if (t.id === taskId) {
          logAudit('STATUS_CHANGE', 'Task', taskId, `Updated task "${t.title}" status to ${status}`);
          return { ...t, status, updatedAt: new Date().toISOString() };
        }
        return t;
      });

      if (targetProjectId) {
        setProjects(projPrev => projPrev.map(p => {
          if (p.id === targetProjectId) {
            const nextProgress = calcProjectProgress(p.id, p.milestones || [], nextTasks);
            crmService.updateProject(p.id, { progress: nextProgress }).catch(() => {});
            return { ...p, progress: nextProgress };
          }
          return p;
        }));
      }

      return nextTasks;
    });

    toast.info('Task Status', `Moved to ${status}`);
    crmService.updateTaskStatus(taskId, status).catch(err => console.warn('Supabase update task status error:', err));
  };

  const deleteTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    setTasks(prev => prev.filter(t => t.id !== taskId));
    logAudit('DELETE', 'Task', taskId, `Deleted task: ${task?.title || taskId}`);
    toast.warning('Task Removed', `${task?.title || 'Task'} deleted.`);

    crmService.deleteTask(taskId).catch(err => console.warn('Supabase delete task error:', err));
  };

  // --- Finance Actions ---
  const addInvoice = (invoice: Omit<Invoice, 'id' | 'createdAt'>) => {
    const tempId = generateUUID();
    const newInvoice: Invoice = {
      ...invoice,
      id: tempId,
      createdAt: new Date().toISOString()
    };
    setInvoices(prev => [newInvoice, ...prev]);

    // If client exists and invoice is independent (not linked to a project), update client totalValue & outstandingAmount
    if (newInvoice.clientId && !newInvoice.projectId) {
      setClients(prev => prev.map(c => {
        if (c.id === newInvoice.clientId) {
          const newTotal = c.totalValue + newInvoice.total;
          const newOutstanding = c.outstandingAmount + (newInvoice.total - (newInvoice.paidAmount || 0));
          return { ...c, totalValue: newTotal, outstandingAmount: newOutstanding, updatedAt: new Date().toISOString() };
        }
        return c;
      }));
    }

    logAudit('CREATE', 'Invoice', newInvoice.id, `Generated invoice ${newInvoice.invoiceNumber} for ${newInvoice.clientName} (₹${newInvoice.total.toLocaleString('en-IN')})`);
    toast.success('Invoice Generated', `${newInvoice.invoiceNumber} created for ₹${newInvoice.total.toLocaleString('en-IN')}`);

    crmService.createInvoice(invoice).then(savedInvoice => {
      setInvoices(prev => prev.map(i => i.id === tempId ? savedInvoice : i));
    }).catch(err => console.warn('Supabase add invoice error:', err));
  };

  const updateInvoice = (invoiceId: string, updates: Partial<Invoice>) => {
    setInvoices(prev => prev.map(i => i.id === invoiceId ? { ...i, ...updates } : i));
    toast.success('Invoice Updated', 'Invoice changes saved.');

    crmService.updateInvoice(invoiceId, updates).catch(err => console.warn('Supabase update invoice error:', err));
  };

  const deleteInvoice = (invoiceId: string) => {
    const invoice = invoices.find(i => i.id === invoiceId);
    setInvoices(prev => prev.filter(i => i.id !== invoiceId));

    if (invoice?.clientId && !invoice.projectId) {
      setClients(prev => prev.map(c => {
        if (c.id === invoice.clientId) {
          const newTotal = Math.max(0, c.totalValue - invoice.total);
          const newOutstanding = Math.max(0, c.outstandingAmount - (invoice.total - (invoice.paidAmount || 0)));
          return { ...c, totalValue: newTotal, outstandingAmount: newOutstanding, updatedAt: new Date().toISOString() };
        }
        return c;
      }));
    }

    logAudit('DELETE', 'Invoice', invoiceId, `Deleted invoice: ${invoice?.invoiceNumber || invoiceId}`);
    toast.warning('Invoice Deleted', `${invoice?.invoiceNumber || 'Invoice'} removed.`);

    crmService.deleteInvoice(invoiceId).catch(err => console.warn('Supabase delete invoice error:', err));
  };

  const recordPayment = (payment: Omit<Payment, 'id' | 'createdAt'>) => {
    const tempId = generateUUID();
    const newPayment: Payment = {
      ...payment,
      id: tempId,
      createdAt: new Date().toISOString()
    };
    setPayments(prev => [newPayment, ...prev]);
    
    if (payment.invoiceId) {
      setInvoices(prev => prev.map(inv => {
        if (inv.id === payment.invoiceId) {
          const newPaid = (inv.paidAmount || 0) + payment.amount;
          const status: InvoiceStatus = newPaid >= inv.total ? 'Paid' : 'Partially Paid';
          return { ...inv, paidAmount: newPaid, status };
        }
        return inv;
      }));
    }

    if (payment.clientId) {
      setClients(prev => prev.map(c => {
        if (c.id === payment.clientId) {
          const newPaid = c.totalPaid + payment.amount;
          const newOutstanding = Math.max(0, c.totalValue - newPaid);
          return { ...c, totalPaid: newPaid, outstandingAmount: newOutstanding, updatedAt: new Date().toISOString() };
        }
        return c;
      }));
    }

    // Reconcile Project in local state
    const targetProjId = payment.projectId || invoices.find(i => i.id === payment.invoiceId)?.projectId;
    if (targetProjId) {
      setProjects(prev => prev.map(p => {
        if (p.id === targetProjId) {
          const newReceived = (p.receivedAmount || 0) + payment.amount;
          const newPending = Math.max(0, p.projectValue - newReceived);
          return { ...p, receivedAmount: newReceived, pendingAmount: newPending, updatedAt: new Date().toISOString() };
        }
        return p;
      }));
    }

    logAudit('PAYMENT_RECORDED', 'Payment', newPayment.id, `Recorded payment of ₹${newPayment.amount.toLocaleString('en-IN')} from ${newPayment.clientName}`);
    toast.success('Payment Received 💰', `₹${newPayment.amount.toLocaleString('en-IN')} logged via ${newPayment.paymentMethod}`);

    crmService.recordPayment(payment).then(savedPayment => {
      setPayments(prev => prev.map(p => p.id === tempId ? savedPayment : p));
    }).catch(err => console.warn('Supabase record payment error:', err));
  };

  const deletePayment = (paymentId: string) => {
    const payment = payments.find(p => p.id === paymentId);
    if (payment) {
      // 1. Reverse Invoice in local state
      if (payment.invoiceId) {
        setInvoices(prev => prev.map(inv => {
          if (inv.id === payment.invoiceId) {
            const newPaid = Math.max(0, (inv.paidAmount || 0) - payment.amount);
            const status: InvoiceStatus = newPaid <= 0 ? 'Sent' : (newPaid >= inv.total ? 'Paid' : 'Partially Paid');
            return { ...inv, paidAmount: newPaid, status };
          }
          return inv;
        }));
      }

      // 2. Reverse Client in local state
      if (payment.clientId) {
        setClients(prev => prev.map(c => {
          if (c.id === payment.clientId) {
            const newPaid = Math.max(0, c.totalPaid - payment.amount);
            const newOutstanding = Math.max(0, c.totalValue - newPaid);
            return { ...c, totalPaid: newPaid, outstandingAmount: newOutstanding, updatedAt: new Date().toISOString() };
          }
          return c;
        }));
      }

      // 3. Reverse Project in local state
      const targetProjId = payment.projectId || invoices.find(i => i.id === payment.invoiceId)?.projectId;
      if (targetProjId) {
        setProjects(prev => prev.map(p => {
          if (p.id === targetProjId) {
            const newReceived = Math.max(0, (p.receivedAmount || 0) - payment.amount);
            const newPending = Math.max(0, p.projectValue - newReceived);
            return { ...p, receivedAmount: newReceived, pendingAmount: newPending, updatedAt: new Date().toISOString() };
          }
          return p;
        }));
      }

      logAudit('DELETE', 'Payment', paymentId, `Voided payment of ₹${payment.amount.toLocaleString('en-IN')}`);
    }

    setPayments(prev => prev.filter(p => p.id !== paymentId));
    toast.warning('Payment Voided', 'Payment record deleted and balances adjusted.');
    crmService.deletePayment(paymentId).catch(err => console.warn('Supabase delete payment error:', err));
  };

  const createInvoiceFromMilestone = (projectId: string, milestoneId: string, isGst: boolean = true) => {
    const project = projects.find(p => p.id === projectId);
    const client = clients.find(c => c.id === project?.clientId);
    const milestone = project?.milestones?.find(m => m.id === milestoneId);
    if (!project || !milestone) return;

    if (milestone.isBilled) {
      toast.warning('Already Invoiced', 'This milestone has already been billed.');
      return;
    }

    const subtotal = milestone.amount || 5000;
    const taxRate = isGst ? 18 : 0;
    const tax = isGst ? Math.round(subtotal * 0.18) : 0;
    const total = subtotal + tax;
    const igst = isGst ? tax : 0;
    const invTempId = generateUUID();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`;

    const newInvoice: Invoice = {
      id: invTempId,
      invoiceNumber,
      clientId: project.clientId,
      clientName: project.clientName,
      projectId: project.id,
      projectName: project.name,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: milestone.dueDate || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: [{
        description: `${project.name} - ${milestone.title}`,
        quantity: 1,
        unitPrice: subtotal,
        total: subtotal,
        hsnSac: isGst ? '998313' : undefined
      }],
      subtotal,
      isGst,
      gstType: isGst ? 'IGST' : undefined,
      taxRate,
      tax,
      igst,
      cgst: 0,
      sgst: 0,
      clientGstin: client?.gstTaxId || undefined,
      hsnSacCode: isGst ? '998313' : undefined,
      total,
      paidAmount: 0,
      status: 'Sent',
      notes: `Generated from milestone: ${milestone.title}${isGst ? ' (18% GST applied)' : ' (Non-GST)'}`,
      createdAt: new Date().toISOString()
    };

    setInvoices(prev => [newInvoice, ...prev]);

    // Mark milestone as billed in local state and Supabase
    updateMilestone(projectId, milestoneId, { isBilled: true, invoiceId: invTempId });

    logAudit('CREATE', 'Invoice', invTempId, `Generated invoice ${invoiceNumber} for milestone "${milestone.title}" (₹${total.toLocaleString('en-IN')})`);
    toast.success('Invoice Generated', `${invoiceNumber} created for milestone "${milestone.title}"`);

    crmService.createInvoice(newInvoice).then(savedInvoice => {
      setInvoices(prev => prev.map(i => i.id === invTempId ? savedInvoice : i));
      updateMilestone(projectId, milestoneId, { isBilled: true, invoiceId: savedInvoice.id });
    }).catch(err => console.warn('Supabase add invoice error:', err));
  };

  const addExpense = (expense: Omit<Expense, 'id' | 'createdAt'>) => {
    const tempId = generateUUID();
    const newExpense: Expense = {
      ...expense,
      id: tempId,
      createdAt: new Date().toISOString()
    };
    setExpenses(prev => [newExpense, ...prev]);
    logAudit('CREATE', 'Expense', newExpense.id, `Recorded expense: ${newExpense.description} (₹${newExpense.amount.toLocaleString('en-IN')})`);
    toast.success('Expense Logged', `₹${newExpense.amount.toLocaleString('en-IN')} recorded for ${newExpense.category}`);

    crmService.createExpense(expense).then(savedExpense => {
      setExpenses(prev => prev.map(e => e.id === tempId ? savedExpense : e));
    }).catch(err => console.warn('Supabase add expense error:', err));
  };

  const deleteExpense = (expenseId: string) => {
    setExpenses(prev => prev.filter(e => e.id !== expenseId));
    toast.warning('Expense Removed', 'Expense item deleted.');
    crmService.deleteExpense(expenseId).catch(err => console.warn('Supabase delete expense error:', err));
  };

  // --- Agreements & Documents ---
  const addAgreement = (agreement: Omit<Agreement, 'id' | 'createdAt'>) => {
    const tempId = generateUUID();
    const newAgreement: Agreement = {
      ...agreement,
      id: tempId,
      createdAt: new Date().toISOString()
    };
    setAgreements(prev => [newAgreement, ...prev]);
    logAudit('CREATE', 'Agreement', newAgreement.id, `Created agreement: ${newAgreement.name}`);
    toast.success('Agreement Created', `${newAgreement.name} registered.`);

    crmService.createAgreement(agreement).then(savedAgreement => {
      setAgreements(prev => prev.map(a => a.id === tempId ? savedAgreement : a));
    }).catch(err => console.warn('Supabase add agreement error:', err));
  };

  const updateAgreement = (agreementId: string, updates: Partial<Agreement>) => {
    setAgreements(prev => prev.map(a => a.id === agreementId ? { ...a, ...updates } : a));
    toast.success('Agreement Updated', 'Contract status saved.');

    crmService.updateAgreement(agreementId, updates).catch(err => console.warn('Supabase update agreement error:', err));
  };

  const deleteAgreement = (agreementId: string) => {
    setAgreements(prev => prev.filter(a => a.id !== agreementId));
    toast.warning('Agreement Deleted', 'Agreement record removed.');
    crmService.deleteAgreement(agreementId).catch(err => console.warn('Supabase delete agreement error:', err));
  };

  const addDocument = (doc: Omit<DocumentItem, 'id' | 'createdAt'>) => {
    const tempId = generateUUID();
    const newDoc: DocumentItem = {
      ...doc,
      id: tempId,
      createdAt: new Date().toISOString()
    };
    setDocuments(prev => [newDoc, ...prev]);
    logAudit('CREATE', 'Agreement', newDoc.id, `Uploaded document: ${newDoc.title}`);
    toast.success('Document Uploaded', `${newDoc.title} saved to cloud.`);

    crmService.createDocument(doc).then(savedDoc => {
      setDocuments(prev => prev.map(d => d.id === tempId ? savedDoc : d));
    }).catch(err => console.warn('Supabase add document error:', err));
  };

  const deleteDocument = (docId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== docId));
    toast.warning('Document Deleted', 'Document file removed.');
    crmService.deleteDocument(docId).catch(err => console.warn('Supabase delete document error:', err));
  };

  // --- Credentials Vault ---
  const addCredential = (cred: Omit<CredentialVaultItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const tempId = generateUUID();
    const newCred: CredentialVaultItem = {
      ...cred,
      id: tempId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setCredentials(prev => [newCred, ...prev]);
    logAudit('CREATE', 'Credential', newCred.id, `Stored credential for platform: ${newCred.platformName}`);
    toast.success('Secret Encrypted & Stored', `${newCred.platformName} credential secured.`);

    crmService.createCredential(cred).then(savedCred => {
      setCredentials(prev => prev.map(c => c.id === tempId ? savedCred : c));
    }).catch(err => console.warn('Supabase add credential error:', err));
  };

  const updateCredential = (credId: string, updates: Partial<CredentialVaultItem>) => {
    setCredentials(prev => prev.map(c => c.id === credId ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c));
    toast.success('Credential Updated', 'Secrets modified.');

    crmService.updateCredential(credId, updates).catch(err => console.warn('Supabase update credential error:', err));
  };

  const deleteCredential = (credId: string) => {
    setCredentials(prev => prev.filter(c => c.id !== credId));
    logAudit('DELETE', 'Credential', credId, `Deleted vault credential ID ${credId}`);
    toast.warning('Credential Deleted', 'Vault key permanently purged.');

    crmService.deleteCredential(credId).catch(err => console.warn('Supabase delete credential error:', err));
  };

  const revealCredentialSecret = (credId: string) => {
    const cred = credentials.find(c => c.id === credId);
    if (cred) {
      logAudit('REVEAL_SECRET', 'Credential', credId, `Revealed secure password/API key for platform: ${cred.platformName}`);
      toast.info('Security Audit', `Decrypted key accessed for ${cred.platformName}`);
    }
  };

  // --- Project Onboarding & Portal Link Helpers ---
  const isProjectOnboarded = useCallback((projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return { onboarded: false, hasAgreement: false, hasPayment: false, agreementStatus: 'None', paidAmount: 0 };

    const relatedAgreement = agreements.find(a => 
      a.projectId === projectId || (project.clientId && a.clientId === project.clientId)
    );
    const hasAgreement = relatedAgreement?.status === 'Signed';
    const directPayments = payments.filter(p => p.projectId === projectId || (project.clientId && p.clientId === project.clientId));
    const totalPaidSum = directPayments.reduce((s, p) => s + (p.status === 'Paid' ? p.amount : 0), 0);
    const paidAmount = Math.max(project.receivedAmount || 0, totalPaidSum);
    const hasPayment = paidAmount > 0;

    return {
      onboarded: hasAgreement && hasPayment,
      hasAgreement,
      hasPayment,
      agreementStatus: relatedAgreement ? relatedAgreement.status : 'None',
      paidAmount
    };
  }, [projects, agreements, payments]);

  const getProjectPortalUrl = useCallback((project: Project | string) => {
    const proj = typeof project === 'string' ? projects.find(p => p.id === project) : project;
    if (!proj) return '';
    const token = proj.portalToken || `prj_sec_${proj.id.slice(0, 8)}`;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}/portal?token=${token}`;
  }, [projects]);

  const regenerateProjectPortalToken = (projectId: string) => {
    const newToken = `prj_sec_${Math.random().toString(36).substring(2, 8)}_${generateUUID().substring(0, 8)}`;
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, portalToken: newToken, updatedAt: new Date().toISOString() } : p));
    crmService.updateProject(projectId, { portalToken: newToken } as any).catch(() => {});
    logAudit('UPDATE', 'Project', projectId, `Regenerated client issue portal token`);
    toast.success('Portal Link Regenerated 🔗', 'The old link has been replaced with a new secure access link.');
    return newToken;
  };

  const toggleProjectPortal = (projectId: string, enabled: boolean) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, portalEnabled: enabled, updatedAt: new Date().toISOString() } : p));
    crmService.updateProject(projectId, { portalEnabled: enabled } as any).catch(() => {});
    toast.info(enabled ? 'Portal Enabled' : 'Portal Disabled', `Client issue upload portal is now ${enabled ? 'active' : 'suspended'}.`);
  };

  // --- Project Client Issues & QA Tickets Actions ---
  const addIssue = (issueData: Omit<ProjectIssue, 'id' | 'createdAt' | 'updatedAt' | 'ticketNumber'>) => {
    const tempId = generateUUID();
    const nextNum = issues.length + 1;
    const ticketNumber = `ISSUE-${new Date().getFullYear()}-${String(nextNum).padStart(3, '0')}`;

    const newIssue: ProjectIssue = {
      ...issueData,
      id: tempId,
      ticketNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setIssues(prev => [newIssue, ...prev]);

    // Dispatch instant real-time notification to CRM Admin
    const notifId = generateUUID();
    const newNotif: NotificationItem = {
      id: notifId,
      title: `🚨 New Issue: ${issueData.projectName}`,
      message: `Ticket #${ticketNumber} - "${issueData.title}" (${issueData.priority}) submitted by ${issueData.reporterName}`,
      type: (issueData.priority === 'Critical' || issueData.priority === 'High') ? 'urgent' : 'info',
      isRead: false,
      link: `/admin/projects?project=${issueData.projectId}&tab=issues`,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);

    logAudit('CREATE', 'Issue', tempId, `Client submitted issue #${ticketNumber}: "${issueData.title}" for project "${issueData.projectName}"`);
    toast.success('New Issue Logged 🚨', `Ticket #${ticketNumber} received for ${issueData.projectName}`);

    crmService.createIssue(newIssue).then(saved => {
      setIssues(prev => prev.map(i => i.id === tempId ? saved : i));
    }).catch(err => console.warn('Supabase create issue error:', err));

    crmService.createNotification(newNotif).catch(() => {});

    return newIssue;
  };

  const updateIssue = (issueId: string, updates: Partial<ProjectIssue>) => {
    setIssues(prev => prev.map(i => i.id === issueId ? { ...i, ...updates, updatedAt: new Date().toISOString() } : i));
    toast.success('Issue Updated', 'Changes saved.');
    crmService.updateIssue(issueId, updates).catch(err => console.warn('Supabase update issue error:', err));
  };

  const updateIssueStatus = (issueId: string, status: IssueStatus, resolutionNotes?: string) => {
    const issue = issues.find(i => i.id === issueId);
    if (!issue) return;
    const oldStatus = issue.status;
    const updates: Partial<ProjectIssue> = {
      status,
      resolutionNotes: resolutionNotes !== undefined ? resolutionNotes : issue.resolutionNotes,
      resolvedAt: status === 'RESOLVED' || status === 'CLOSED' ? (issue.resolvedAt || new Date().toISOString()) : undefined,
      updatedAt: new Date().toISOString()
    };

    setIssues(prev => prev.map(i => i.id === issueId ? { ...i, ...updates } : i));
    logAudit('STATUS_CHANGE', 'Issue', issueId, `Changed issue #${issue.ticketNumber} status from ${oldStatus} to ${status}`);
    toast.info('Issue Stage Updated', `Ticket #${issue.ticketNumber} moved to ${status}`);

    crmService.updateIssue(issueId, updates).catch(err => console.warn('Supabase update issue status error:', err));
  };

  const deleteIssue = (issueId: string) => {
    const issue = issues.find(i => i.id === issueId);
    setIssues(prev => prev.filter(i => i.id !== issueId));
    logAudit('DELETE', 'Issue', issueId, `Deleted issue ticket: ${issue?.ticketNumber || issueId}`);
    toast.warning('Issue Removed', `Ticket #${issue?.ticketNumber || 'Issue'} deleted.`);
    crmService.deleteIssue(issueId).catch(err => console.warn('Supabase delete issue error:', err));
  };

  const convertIssueToTask = (issueId: string, assignedTo?: string) => {
    const issue = issues.find(i => i.id === issueId);
    if (!issue) return;

    const devAssignee = assignedTo || issue.assignedTo || currentUser.fullName || 'Natalia Varnan';

    addTask({
      title: `[Ticket #${issue.ticketNumber}] ${issue.title}`,
      description: `Origin: Client Portal Ticket #${issue.ticketNumber}\nReporter: ${issue.reporterName} (${issue.reporterEmail})\nIssue Type: ${issue.issueType}\nPriority: ${issue.priority}\n\nClient Notes:\n${issue.description}`,
      projectId: issue.projectId,
      projectName: issue.projectName,
      clientId: issue.clientId,
      clientName: issue.clientName,
      assignedTo: devAssignee,
      priority: issue.priority === 'Critical' ? 'Urgent' : issue.priority,
      status: 'IN PROGRESS',
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      estimatedHours: 4,
      actualHours: 0
    });

    const updatedAdminNotes = `${issue.adminNotes ? issue.adminNotes + '\n' : ''}Converted to Sprint Task by ${currentUser.fullName} on ${new Date().toLocaleDateString()}.`;
    updateIssue(issueId, {
      status: 'IN PROGRESS',
      assignedTo: devAssignee,
      adminNotes: updatedAdminNotes
    });

    logAudit('UPDATE', 'Issue', issueId, `Converted issue #${issue.ticketNumber} to engineering sprint task assigned to ${devAssignee}`);
    toast.success('Converted to Task 🎯', `Issue #${issue.ticketNumber} pushed to Sprints board assigned to ${devAssignee}`);
  };

  // --- Calendar ---
  const addCalendarEvent = (event: Omit<CalendarEvent, 'id' | 'createdAt'>) => {
    const tempId = generateUUID();
    const newEvent: CalendarEvent = {
      ...event,
      id: tempId,
      createdAt: new Date().toISOString()
    };
    setEvents(prev => [newEvent, ...prev]);
    logAudit('CREATE', 'Lead', newEvent.id, `Scheduled calendar event: ${newEvent.title}`);
    toast.success('Event Scheduled', `${newEvent.title} added to calendar.`);

    crmService.createCalendarEvent(event).then(savedEvent => {
      setEvents(prev => prev.map(e => e.id === tempId ? savedEvent : e));
    }).catch(err => console.warn('Supabase add calendar event error:', err));
  };

  const deleteCalendarEvent = (eventId: string) => {
    setEvents(prev => prev.filter(e => e.id !== eventId));
    toast.warning('Event Removed', 'Calendar item removed.');
    crmService.deleteCalendarEvent(eventId).catch(err => console.warn('Supabase delete event error:', err));
  };

  // --- Team Members ---
  const addTeamMember = (profile: Omit<UserProfile, 'id'>) => {
    const tempId = generateUUID();
    const newMember: UserProfile = { ...profile, id: tempId };
    setTeamMembers(prev => [...prev, newMember]);
    toast.success('Team Member Added', `${profile.fullName} added as ${profile.role}`);

    crmService.createProfile(profile).then(saved => {
      setTeamMembers(prev => prev.map(u => u.id === tempId ? saved : u));
    }).catch(err => {
      console.error('Supabase add profile error:', err);
      toast.error('Database Sync Error', err?.message || 'Failed to save staff to database');
    });
  };

  const updateTeamMember = (userId: string, updates: Partial<UserProfile>) => {
    setTeamMembers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
    toast.success('Staff Updated', 'Staff details saved successfully.');
    crmService.updateProfile(userId, updates).catch(err => console.warn('Supabase update profile error:', err));
  };

  const resetStaffPassword = (userId: string, newPassword: string) => {
    setTeamMembers(prev => prev.map(u => u.id === userId ? { ...u, passwordHash: newPassword } : u));
    logAudit('UPDATE', 'User', userId, `Reset password for staff ID ${userId}`);
    toast.success('Password Changed', 'Staff credentials updated in Supabase.');
    crmService.resetStaffPassword(userId, newPassword).catch(err => console.warn('Supabase reset password error:', err));
  };

  const toggleStaffStatus = (userId: string) => {
    const member = teamMembers.find(u => u.id === userId);
    if (!member) return;
    const newStatus = !member.isActive;
    setTeamMembers(prev => prev.map(u => u.id === userId ? { ...u, isActive: newStatus } : u));
    logAudit('UPDATE', 'User', userId, `${newStatus ? 'Activated' : 'Suspended'} staff account ${member.fullName}`);
    toast.info(newStatus ? 'Account Activated' : 'Account Suspended', `${member.fullName} is now ${newStatus ? 'Active' : 'Suspended'}.`);
    crmService.toggleStaffStatus(userId, newStatus).catch(err => console.warn('Supabase toggle staff status error:', err));
  };

  const updateTeamRole = (userId: string, role: UserRole) => {
    setTeamMembers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
    toast.success('Role Updated', `Permissions updated to ${role}`);

    crmService.updateProfileRole(userId, role).catch(err => console.warn('Supabase update profile role error:', err));
  };

  const deleteTeamMember = (userId: string) => {
    setTeamMembers(prev => prev.filter(u => u.id !== userId));
    toast.warning('Staff Removed', 'Staff account removed.');
    crmService.deleteProfile(userId).catch(err => console.warn('Supabase delete profile error:', err));
  };

  // Notifications
  const markNotificationAsRead = (notifId: string) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, isRead: true } : n));
    crmService.markNotificationRead(notifId).catch(err => console.warn('Supabase mark notification error:', err));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    toast.info('Notifications Cleared', 'All notifications marked as read.');
    crmService.markAllNotificationsRead().catch(err => console.warn('Supabase mark all notifications error:', err));
  };

  // Computed Financials
  const totalRevenue = payments.reduce((acc, p) => acc + p.amount, 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0';
  const outstandingInvoicesTotal = invoices
    .filter(i => i.status !== 'Paid')
    .reduce((acc, i) => acc + (i.total - (i.paidAmount || 0)), 0);

  // Computed Sales Funnel
  const wonLeads = leads.filter(l => l.status === 'WON').length;
  const totalLeadsCount = leads.length;
  const conversionRate = totalLeadsCount > 0 ? Math.round((wonLeads / totalLeadsCount) * 100) : 0;
  const pipelineValue = leads
    .filter(l => l.status !== 'LOST' && l.status !== 'WON')
    .reduce((acc, l) => acc + (l.estimatedDealValue || 0), 0);

  // Computed Productivity
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
  const totalTasks = tasks.length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Dynamic Permissions Evaluator
  const hasPermission = useCallback((module: CrmModuleKey): boolean => {
    // 1. Super Admin has unrestricted full system access
    if (currentUser.role === 'Super Admin') return true;

    // 2. Custom override in user profile permissions
    if (currentUser.permissions && typeof (currentUser.permissions as any)[module] === 'boolean') {
      return Boolean((currentUser.permissions as any)[module]);
    }

    // 3. Fallback to standard role defaults
    const roleDefaults = ROLE_DEFAULT_PERMISSIONS[currentUser.role];
    if (roleDefaults && typeof roleDefaults[module] === 'boolean') {
      return roleDefaults[module];
    }

    return false;
  }, [currentUser]);

  // Permissions Check Helpers
  const canAccessFinance = hasPermission('finance');
  const canAccessCredentials = hasPermission('vault');
  const canManageLeads = hasPermission('leads');
  const canManageProjects = hasPermission('projects');
  const canManageUsers = hasPermission('settings') || ['Super Admin', 'Admin'].includes(currentUser.role);

  const resetToSampleData = () => {
    setLeads(INITIAL_LEADS);
    setClients(INITIAL_CLIENTS);
    setProjects(INITIAL_PROJECTS);
    setAgreements(INITIAL_AGREEMENTS);
    setPayments(INITIAL_PAYMENTS);
    setIssues(INITIAL_ISSUES);
    setTasks(INITIAL_TASKS);
    setInvoices(INITIAL_INVOICES);
    setExpenses(INITIAL_EXPENSES);
    setDocuments(INITIAL_DOCUMENTS);
    setCredentials(INITIAL_CREDENTIALS);
    setEvents(INITIAL_EVENTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setTeamMembers(INITIAL_USERS);
    toast.success('Mock Data Restored 🔄', 'Reset all records to fresh sample projects, agreements, and client issues.');
  };

  return {
    currentUser,
    teamMembers,
    resetToSampleData,
    switchRole,
    loginUser,
    logoutUser,
    leads,
    addLead,
    updateLead,
    updateLeadStatus,
    deleteLead,
    addLeadActivity,
    convertLeadToClient,
    clients,
    addClient,
    updateClient,
    deleteClient,
    projects,
    addProject,
    updateProject,
    updateProjectStatus,
    deleteProject,
    addMilestone,
    updateMilestone,
    deleteMilestone,
    tasks,
    addTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    invoices,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    createInvoiceFromMilestone,
    payments,
    recordPayment,
    addPayment: recordPayment,
    deletePayment,
    expenses,
    addExpense,
    deleteExpense,
    agreements,
    addAgreement,
    updateAgreement,
    deleteAgreement,
    documents,
    addDocument,
    deleteDocument,
    credentials,
    addCredential,
    updateCredential,
    deleteCredential,
    revealCredentialSecret,
    events,
    addCalendarEvent,
    deleteCalendarEvent,
    addTeamMember,
    createTeamMember: addTeamMember,
    updateTeamMember,
    resetStaffPassword,
    toggleStaffStatus,
    deleteTeamMember,
    updateTeamRole,
    updateTeamMemberRole: updateTeamRole,
    notifications,
    markNotificationAsRead,
    markAllNotificationsRead,
    auditLogs,
    logAudit,
    issues,
    addIssue,
    updateIssue,
    updateIssueStatus,
    deleteIssue,
    convertIssueToTask,
    isProjectOnboarded,
    getProjectPortalUrl,
    regenerateProjectPortalToken,
    toggleProjectPortal,
    isSupabaseConnected,
    isLoading,
    isSyncing,
    lastSyncedAt,
    syncError,
    refreshFromCloud,
    totalRevenue,
    totalExpenses,
    netProfit,
    profitMargin,
    outstandingInvoicesTotal,
    conversionRate,
    pipelineValue,
    taskCompletionRate,
    hasPermission,
    canAccessFinance,
    canAccessCredentials,
    canManageLeads,
    canManageProjects,
    canManageUsers
  };
}
