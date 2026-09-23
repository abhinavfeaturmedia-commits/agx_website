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
  ProjectIssue, IssueStatus, IssueType, IssuePriority,
  Partner, PartnerReferral, PartnerPayout,
  Quotation, QuotationItem, QuotationStatus
} from '../types/crm';

export const DEFAULT_ADMIN_USER: UserProfile = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'admin@agxperience.com',
  fullName: 'Abhinav (Super Admin)',
  role: 'Super Admin',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  department: 'Leadership',
  isActive: true,
  permissions: ROLE_DEFAULT_PERMISSIONS['Super Admin']
};

export const INITIAL_USERS: UserProfile[] = [DEFAULT_ADMIN_USER];
export const INITIAL_LEADS: Lead[] = [];
export const INITIAL_CLIENTS: Client[] = [];
export const INITIAL_PROJECTS: Project[] = [];
export const INITIAL_TASKS: Task[] = [];
export const INITIAL_INVOICES: Invoice[] = [];
export const INITIAL_QUOTATIONS: Quotation[] = [];
export const INITIAL_PAYMENTS: Payment[] = [];
export const INITIAL_EXPENSES: Expense[] = [];
export const INITIAL_AGREEMENTS: Agreement[] = [];
export const INITIAL_DOCUMENTS: DocumentItem[] = [];
export const INITIAL_CREDENTIALS: CredentialVaultItem[] = [];
export const INITIAL_EVENTS: CalendarEvent[] = [];
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];
export const INITIAL_AUDIT_LOGS: AuditLog[] = [];
export const INITIAL_ISSUES: ProjectIssue[] = [];
export const INITIAL_PARTNERS: Partner[] = [];
export const INITIAL_PARTNER_REFERRALS: PartnerReferral[] = [];
export const INITIAL_PARTNER_PAYOUTS: PartnerPayout[] = [];

const STORAGE_PREFIX = 'agx_crm_';

// Purge legacy mock data cache once on initial load
const CLEAN_VERSION_KEY = 'agx_crm_prod_clean_v1';
if (typeof window !== 'undefined' && !localStorage.getItem(CLEAN_VERSION_KEY)) {
  const keysToClean = [
    'leads', 'clients', 'projects', 'tasks', 'invoices', 'payments',
    'expenses', 'agreements', 'documents', 'credentials', 'events',
    'notifications', 'audit_logs', 'issues', 'team_members'
  ];
  keysToClean.forEach(k => localStorage.removeItem(STORAGE_PREFIX + k));
  localStorage.setItem(CLEAN_VERSION_KEY, 'true');
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    if (item === null || item === undefined) return fallback;
    const parsed = JSON.parse(item);
    if (Array.isArray(fallback)) {
      if (!Array.isArray(parsed)) return fallback;
      const cleaned = parsed.filter((entry: any) => {
        if (!entry || typeof entry !== 'object') return false;
        const id = String(entry.id || '');
        if (/^[1-9a-d]0000000-0000-0000-0000-/.test(id)) return false;
        return true;
      });
      if (key === 'projects') {
        return cleaned.map((p: any) => ({
          ...p,
          portalToken: p.portalToken || `prj_sec_${(p.name || 'proj').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8)}_${p.id.slice(0, 6)}`,
          portalEnabled: p.portalEnabled !== undefined ? p.portalEnabled : true
        })) as unknown as T;
      }
      return cleaned as unknown as T;
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
    authService.getStaffSession() || loadFromStorage('current_user', DEFAULT_ADMIN_USER)
  );
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => 
    Boolean(authService.getStaffSession())
  );
  const [teamMembers, setTeamMembers] = useState<UserProfile[]>(() => 
    loadFromStorage('team_members', INITIAL_USERS)
  );
  const [leads, setLeads] = useState<Lead[]>(() => loadFromStorage('leads', INITIAL_LEADS));
  const [clients, setClients] = useState<Client[]>(() => loadFromStorage('clients', INITIAL_CLIENTS));
  const [projects, setProjects] = useState<Project[]>(() => loadFromStorage('projects', INITIAL_PROJECTS));
  const [tasks, setTasks] = useState<Task[]>(() => loadFromStorage('tasks', INITIAL_TASKS));
  const [invoices, setInvoices] = useState<Invoice[]>(() => loadFromStorage('invoices', INITIAL_INVOICES));
  const [quotations, setQuotations] = useState<Quotation[]>(() => loadFromStorage('quotations', INITIAL_QUOTATIONS));
  const [payments, setPayments] = useState<Payment[]>(() => loadFromStorage('payments', INITIAL_PAYMENTS));
  const [expenses, setExpenses] = useState<Expense[]>(() => loadFromStorage('expenses', INITIAL_EXPENSES));
  const [agreements, setAgreements] = useState<Agreement[]>(() => loadFromStorage('agreements', INITIAL_AGREEMENTS));
  const [documents, setDocuments] = useState<DocumentItem[]>(() => loadFromStorage('documents', INITIAL_DOCUMENTS));
  const [credentials, setCredentials] = useState<CredentialVaultItem[]>(() => loadFromStorage('credentials', INITIAL_CREDENTIALS));
  const [events, setEvents] = useState<CalendarEvent[]>(() => loadFromStorage('events', INITIAL_EVENTS));
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => loadFromStorage('notifications', INITIAL_NOTIFICATIONS));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => loadFromStorage('audit_logs', INITIAL_AUDIT_LOGS));
  const [issues, setIssues] = useState<ProjectIssue[]>(() => loadFromStorage('issues', INITIAL_ISSUES));
  const [partners, setPartners] = useState<Partner[]>(() => loadFromStorage('partners', INITIAL_PARTNERS));
  const [partnerReferrals, setPartnerReferrals] = useState<PartnerReferral[]>(() => loadFromStorage('partner_referrals', INITIAL_PARTNER_REFERRALS));
  const [partnerPayouts, setPartnerPayouts] = useState<PartnerPayout[]>(() => loadFromStorage('partner_payouts', INITIAL_PARTNER_PAYOUTS));

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
  useEffect(() => saveToStorage('quotations', quotations), [quotations]);
  useEffect(() => saveToStorage('payments', payments), [payments]);
  useEffect(() => saveToStorage('expenses', expenses), [expenses]);
  useEffect(() => saveToStorage('agreements', agreements), [agreements]);
  useEffect(() => saveToStorage('documents', documents), [documents]);
  useEffect(() => saveToStorage('credentials', credentials), [credentials]);
  useEffect(() => saveToStorage('events', events), [events]);
  useEffect(() => saveToStorage('notifications', notifications), [notifications]);
  useEffect(() => saveToStorage('audit_logs', auditLogs), [auditLogs]);
  useEffect(() => saveToStorage('issues', issues), [issues]);
  useEffect(() => saveToStorage('partners', partners), [partners]);
  useEffect(() => saveToStorage('partner_referrals', partnerReferrals), [partnerReferrals]);
  useEffect(() => saveToStorage('partner_payouts', partnerPayouts), [partnerPayouts]);

  // Cloud Data Loader
  const refreshFromCloud = useCallback(async (silent = false) => {
    try {
      if (!silent) setIsSyncing(true);
      const data = await crmService.fetchAllData();

      if (data.profiles !== undefined) setTeamMembers(data.profiles.length > 0 ? data.profiles : INITIAL_USERS);
      if (data.leads !== undefined) setLeads(data.leads);
      if (data.clients !== undefined) setClients(data.clients);
      if (data.projects !== undefined) setProjects(data.projects);
      if (data.tasks !== undefined) setTasks(data.tasks);

      // Resilient Smart Merge for Invoices: keep pending local items until verified in cloud
      if (data.invoices !== undefined) {
        setInvoices(prevLocal => {
          const cloudIds = new Set(data.invoices!.map(i => i.id));
          const cloudNumbers = new Set(data.invoices!.map(i => i.invoiceNumber));
          const localPending = prevLocal.filter(l => !cloudIds.has(l.id) && !cloudNumbers.has(l.invoiceNumber));
          return [...data.invoices!, ...localPending];
        });
      }

      // Resilient Smart Merge for Quotations: keep pending local items until verified in cloud
      if ((data as any).quotations !== undefined) {
        const cloudQuotes = (data as any).quotations as Quotation[];
        setQuotations(prevLocal => {
          const cloudIds = new Set(cloudQuotes.map(q => q.id));
          const cloudNumbers = new Set(cloudQuotes.map(q => q.quotationNumber));
          const localPending = prevLocal.filter(l => !cloudIds.has(l.id) && !cloudNumbers.has(l.quotationNumber));
          return [...cloudQuotes, ...localPending];
        });
      }

      // Resilient Smart Merge for Payments
      if (data.payments !== undefined) {
        setPayments(prevLocal => {
          const cloudIds = new Set(data.payments!.map(p => p.id));
          const localPending = prevLocal.filter(l => !cloudIds.has(l.id));
          return [...data.payments!, ...localPending];
        });
      }

      if (data.expenses !== undefined) setExpenses(data.expenses);
      if (data.agreements !== undefined) setAgreements(data.agreements);
      if (data.documents !== undefined) setDocuments(data.documents);
      if (data.credentials !== undefined) setCredentials(data.credentials);
      if (data.events !== undefined) setEvents(data.events);
      if (data.notifications !== undefined) setNotifications(data.notifications);
      if (data.auditLogs !== undefined) setAuditLogs(data.auditLogs);
      if ((data as any).partners !== undefined) setPartners((data as any).partners);
      if ((data as any).partnerReferrals !== undefined) setPartnerReferrals((data as any).partnerReferrals);
      if ((data as any).partnerPayouts !== undefined) setPartnerPayouts((data as any).partnerPayouts);

      const cloudIssues = await crmService.fetchAllIssues();
      if (cloudIssues !== undefined) {
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

    const handlePartnerEvent = () => {
      refreshFromCloud(true);
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('agx_crm_partner_updated', handlePartnerEvent);
    }

    const unsubscribe = crmService.subscribeToChanges((table, payload) => {
      console.log(`[Realtime Supabase] ${table} change:`, payload.eventType);
      refreshFromCloud(true);
    });

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('agx_crm_partner_updated', handlePartnerEvent);
      }
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
    authService.setStaffSession(user);
    setCurrentUser(user);
    setIsAuthenticated(true);
    toast.success('Authentication Successful', `Welcome back, ${user.fullName}`);
  };

  const logoutUser = () => {
    authService.clearStaffSession();
    setCurrentUser(DEFAULT_ADMIN_USER);
    setIsAuthenticated(false);
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
  const addLead = (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): string => {
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
      setPartnerReferrals(prev => prev.map(r => r.leadId === tempId ? { ...r, leadId: savedLead.id } : r));
    }).catch(err => {
      console.warn('Supabase lead create error:', err);
      toast.error('Sync Warning', 'Failed to save lead in cloud database.');
    });

    return tempId;
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
      partnerId: lead.partnerId,
      partnerName: lead.partnerName,
      partnerCode: lead.partnerCode,
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

      // Link and reconcile partner referrals if lead originated from a partner
      const matchingRefs = partnerReferrals.filter(r => 
        (r.leadId && r.leadId === leadId) || 
        (lead.email && r.clientEmail && r.clientEmail.toLowerCase() === lead.email.toLowerCase())
      );

      if (matchingRefs.length > 0) {
        for (const ref of matchingRefs) {
          const updates = {
            clientId: savedClient.id,
            projectId: savedProject.id,
            dealStatus: 'WON' as const,
            dealValue: dealVal,
            pendingPayment: dealVal
          };
          setPartnerReferrals(pRefs => pRefs.map(r => r.id === ref.id ? { ...r, ...updates } : r));
          crmService.updatePartnerReferral(ref.id, updates).catch(e => console.warn('Update partner referral on conversion err:', e));
        }
      } else if (lead.partnerId || lead.partnerCode) {
        // Fallback: If lead has partner attribution but no referral row existed
        const partner = partners.find(p => p.id === lead.partnerId || (lead.partnerCode && p.referralCode === lead.partnerCode));
        if (partner) {
          const rawRate = partner.commissionRate || 0.10;
          const commRate = rawRate >= 1 ? rawRate / 100 : rawRate;
          crmService.createPartnerReferral({
            partnerId: partner.id,
            leadId: lead.id,
            clientId: savedClient.id,
            projectId: savedProject.id,
            clientName: savedClient.name,
            clientEmail: savedClient.email || undefined,
            clientPhone: savedClient.phone || undefined,
            company: savedClient.company,
            projectType: savedProject.serviceType,
            dealValue: dealVal,
            totalPaid: 0,
            pendingPayment: dealVal,
            dealStatus: 'WON',
            paymentStatus: 'Pending',
            commissionRate: commRate,
            commissionEarned: 0,
            commissionPaid: 0,
            notes: `Auto-linked during lead-to-client conversion.`
          }).then(newRef => {
            setPartnerReferrals(pRefs => [newRef, ...pRefs]);
          }).catch(e => console.warn('Create partner referral on conversion err:', e));
        }
      }

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
        const ticketMatch = task.title.match(/\[Ticket #(ISSUE-[^\]]+)\]/);
        const ticketNum = ticketMatch ? ticketMatch[1] : undefined;
        const linkedIssue = (task.originIssueId ? issues.find(i => i.id === task.originIssueId) : undefined)
          || (ticketNum ? issues.find(i => i.ticketNumber === ticketNum) : undefined);

        if (linkedIssue && linkedIssue.status !== 'RESOLVED' && linkedIssue.status !== 'CLOSED') {
          updateIssue(linkedIssue.id, {
            status: 'RESOLVED',
            resolvedAt: new Date().toISOString(),
            resolutionNotes: `Automatically marked RESOLVED upon completion of sprint task "${task.title}".`
          });
          toast.success('Linked Issue Resolved ✅', `Ticket #${linkedIssue.ticketNumber} marked Resolved via sprint completion.`);
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

  // --- Quotation Actions ---
  const addQuotation = (quotation: Omit<Quotation, 'id' | 'createdAt' | 'updatedAt'>) => {
    const tempId = generateUUID();
    const newQuote: Quotation = {
      ...quotation,
      id: tempId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setQuotations(prev => [newQuote, ...prev]);
    logAudit('CREATE', 'Quotation', newQuote.id, `Created quotation ${newQuote.quotationNumber} for ${newQuote.clientName} (₹${newQuote.total.toLocaleString('en-IN')})`);
    toast.success('Quotation Created', `${newQuote.quotationNumber} generated for ${newQuote.clientName}`);

    crmService.createQuotation(quotation).then(savedQuote => {
      setQuotations(prev => prev.map(q => (q.id === tempId || q.quotationNumber === savedQuote.quotationNumber) ? savedQuote : q));
    }).catch(err => console.warn('Supabase add quotation error:', err));
  };

  const updateQuotation = (quotationId: string, updates: Partial<Quotation>) => {
    setQuotations(prev => prev.map(q => q.id === quotationId ? { ...q, ...updates, updatedAt: new Date().toISOString() } : q));
    toast.success('Quotation Updated', 'Quotation changes saved.');
    crmService.updateQuotation(quotationId, updates).catch(err => console.warn('Supabase update quotation error:', err));
  };

  const deleteQuotation = (quotationId: string) => {
    const quote = quotations.find(q => q.id === quotationId);
    setQuotations(prev => prev.filter(q => q.id !== quotationId));
    logAudit('DELETE', 'Quotation', quotationId, `Deleted quotation: ${quote?.quotationNumber || quotationId}`);
    toast.warning('Quotation Deleted', `${quote?.quotationNumber || 'Quotation'} removed.`);
    crmService.deleteQuotation(quotationId).catch(err => console.warn('Supabase delete quotation error:', err));
  };

  const convertQuotationToInvoice = (quotationId: string): Invoice | null => {
    const quote = quotations.find(q => q.id === quotationId);
    if (!quote) return null;

    if (quote.status === 'Converted' && quote.convertedInvoiceId) {
      const existing = invoices.find(i => i.id === quote.convertedInvoiceId);
      if (existing) {
        toast.info('Already Converted', `Quotation is already linked to invoice ${existing.invoiceNumber}`);
        return existing;
      }
    }

    const invTempId = generateUUID();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`;

    const newInvoice: Invoice = {
      id: invTempId,
      invoiceNumber,
      clientId: quote.clientId || '',
      clientName: quote.clientName,
      projectId: quote.projectId,
      projectName: quote.projectName,
      quotationId: quote.id,
      quotationNumber: quote.quotationNumber,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: quote.items.map(it => ({ ...it })),
      subtotal: quote.subtotal,
      discountAmount: quote.discountAmount || 0,
      isGst: quote.isGst !== false,
      gstType: quote.gstType || 'IGST',
      taxRate: quote.taxRate ?? 18,
      tax: quote.tax,
      cgst: quote.cgst || 0,
      sgst: quote.sgst || 0,
      igst: quote.igst || 0,
      clientGstin: quote.clientGstin,
      hsnSacCode: quote.hsnSacCode || '998313',
      total: quote.total,
      paidAmount: 0,
      status: 'Sent',
      notes: quote.notes ? `${quote.notes}\n[Converted from Quotation ${quote.quotationNumber}]` : `Converted from Quotation ${quote.quotationNumber}`,
      termsConditions: quote.termsConditions,
      createdAt: new Date().toISOString()
    };

    setInvoices(prev => [newInvoice, ...prev]);

    const nowIso = new Date().toISOString();
    setQuotations(prev => prev.map(q => q.id === quotationId ? {
      ...q,
      status: 'Converted',
      convertedInvoiceId: invTempId,
      convertedAt: nowIso,
      updatedAt: nowIso
    } : q));

    if (newInvoice.clientId && !newInvoice.projectId) {
      setClients(prev => prev.map(c => {
        if (c.id === newInvoice.clientId) {
          const newTotal = c.totalValue + newInvoice.total;
          const newOutstanding = c.outstandingAmount + newInvoice.total;
          return { ...c, totalValue: newTotal, outstandingAmount: newOutstanding, updatedAt: nowIso };
        }
        return c;
      }));
    }

    logAudit('CONVERT_TO_INVOICE', 'Quotation', quotationId, `Converted quote ${quote.quotationNumber} to invoice ${invoiceNumber} (₹${quote.total.toLocaleString('en-IN')})`);
    toast.success('Converted to Invoice! 🚀', `Invoice ${invoiceNumber} generated from Quote ${quote.quotationNumber}`);

    crmService.createInvoice(newInvoice).then(savedInvoice => {
      setInvoices(prev => prev.map(i => (i.id === invTempId || i.invoiceNumber === savedInvoice.invoiceNumber) ? savedInvoice : i));
      crmService.updateQuotation(quotationId, {
        status: 'Converted',
        convertedInvoiceId: savedInvoice.id,
        convertedAt: nowIso
      }).catch(err => console.warn('Supabase quote convert update error:', err));
    }).catch(err => console.warn('Supabase invoice create from quote error:', err));

    return newInvoice;
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

    if (newInvoice.quotationId) {
      const nowIso = new Date().toISOString();
      setQuotations(prev => prev.map(q => q.id === newInvoice.quotationId ? {
        ...q,
        status: 'Converted',
        convertedInvoiceId: tempId,
        convertedAt: nowIso,
        updatedAt: nowIso
      } : q));
      crmService.updateQuotation(newInvoice.quotationId, {
        status: 'Converted',
        convertedInvoiceId: tempId,
        convertedAt: nowIso
      }).catch(err => console.warn('Supabase quote convert link err:', err));
    }

    logAudit('CREATE', 'Invoice', newInvoice.id, `Generated invoice ${newInvoice.invoiceNumber} for ${newInvoice.clientName} (₹${newInvoice.total.toLocaleString('en-IN')})`);
    toast.success('Invoice Generated', `${newInvoice.invoiceNumber} created for ₹${newInvoice.total.toLocaleString('en-IN')}`);

    crmService.createInvoice(invoice).then(savedInvoice => {
      setInvoices(prev => prev.map(i => (i.id === tempId || i.invoiceNumber === savedInvoice.invoiceNumber) ? savedInvoice : i));
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

    // Reconcile Partner Commission & Milestone tracking (track until full payment)
    setPartnerReferrals(prev => prev.map(ref => {
      if (ref.clientId === payment.clientId || (targetProjId && ref.projectId === targetProjId)) {
        const newTotalPaid = ref.totalPaid + payment.amount;
        const newPendingPayment = Math.max(0, ref.dealValue - newTotalPaid);
        const newPaymentStatus = newTotalPaid >= ref.dealValue ? 'Fully Paid' : 'Partially Paid';
        const rawRate = ref.commissionRate || 0.10;
        const commRate = rawRate >= 1 ? rawRate / 100 : rawRate;
        const newCommissionEarned = Math.round(newTotalPaid * commRate);
        const commissionDelta = newCommissionEarned - ref.commissionEarned;

        // Update partner earnings in state
        setPartners(pPrev => pPrev.map(p => {
          if (p.id === ref.partnerId) {
            const updatedTotalEarnings = p.totalEarnings + commissionDelta;
            const updatedPendingEarnings = Math.max(0, updatedTotalEarnings - p.paidEarnings);
            return {
              ...p,
              totalEarnings: updatedTotalEarnings,
              pendingEarnings: updatedPendingEarnings,
              updatedAt: new Date().toISOString()
            };
          }
          return p;
        }));

        crmService.updatePartnerReferral(ref.id, {
          totalPaid: newTotalPaid,
          pendingPayment: newPendingPayment,
          paymentStatus: newPaymentStatus,
          commissionEarned: newCommissionEarned
        }).catch(err => console.warn('Partner referral sync err:', err));

        return {
          ...ref,
          totalPaid: newTotalPaid,
          pendingPayment: newPendingPayment,
          paymentStatus: newPaymentStatus,
          commissionEarned: newCommissionEarned,
          updatedAt: new Date().toISOString()
        };
      }
      return ref;
    }));

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

      // 4. Reverse Partner Referral & Partner Earnings in local state
      setPartnerReferrals(prev => prev.map(ref => {
        if (ref.clientId === payment.clientId || (targetProjId && ref.projectId === targetProjId)) {
          const newTotalPaid = Math.max(0, ref.totalPaid - payment.amount);
          const newPendingPayment = Math.max(0, ref.dealValue - newTotalPaid);
          const rawRate = ref.commissionRate || 0.10;
          const commRate = rawRate >= 1 ? rawRate / 100 : rawRate;
          const newCommissionEarned = Math.round(newTotalPaid * commRate);
          const commissionDelta = ref.commissionEarned - newCommissionEarned;

          setPartners(pPrev => pPrev.map(p => {
            if (p.id === ref.partnerId) {
              const updatedTotalEarnings = Math.max(0, p.totalEarnings - commissionDelta);
              const updatedPendingEarnings = Math.max(0, updatedTotalEarnings - p.paidEarnings);
              return {
                ...p,
                totalEarnings: updatedTotalEarnings,
                pendingEarnings: updatedPendingEarnings,
                updatedAt: new Date().toISOString()
              };
            }
            return p;
          }));

          return {
            ...ref,
            totalPaid: newTotalPaid,
            pendingPayment: newPendingPayment,
            paymentStatus: newTotalPaid <= 0 ? 'Pending' : (newPendingPayment === 0 ? 'Fully Paid' : 'Partially Paid'),
            commissionEarned: newCommissionEarned,
            updatedAt: new Date().toISOString()
          };
        }
        return ref;
      }));

      logAudit('DELETE', 'Payment', paymentId, `Voided payment of ₹${payment.amount.toLocaleString('en-IN')}`);

      // Persist balance reversals to Supabase
      crmService.revertPaymentBalances(payment).catch(err => console.warn('Supabase revert payment balances error:', err));
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
      setInvoices(prev => prev.map(i => (i.id === invTempId || i.invoiceNumber === savedInvoice.invoiceNumber) ? savedInvoice : i));
      updateMilestone(projectId, milestoneId, { isBilled: true, invoiceId: savedInvoice.id });
      crmService.updateMilestoneInvoiced(milestoneId, true, savedInvoice.id);
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
  const addCredential = async (cred: Omit<CredentialVaultItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<CredentialVaultItem> => {
    const tempId = generateUUID();
    const newCred: CredentialVaultItem = {
      ...cred,
      id: tempId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setCredentials(prev => [newCred, ...prev]);
    logAudit('CREATE', 'Credential', newCred.id, `Stored credential for platform: ${newCred.platformName}`);

    try {
      const savedCred = await crmService.createCredential(cred);
      const finalized: CredentialVaultItem = {
        ...savedCred,
        clientName: cred.clientName || savedCred.clientName,
        projectName: cred.projectName || savedCred.projectName
      };
      setCredentials(prev => prev.map(c => c.id === tempId ? finalized : c));
      toast.success('Secret Vaulted', `${newCred.platformName} credential secured & encrypted.`);
      return finalized;
    } catch (err: any) {
      console.error('Supabase add credential error:', err);
      toast.warning('Offline Cache', `${newCred.platformName} saved locally. Cloud sync pending.`);
      return newCred;
    }
  };

  const updateCredential = async (credId: string, updates: Partial<CredentialVaultItem>) => {
    setCredentials(prev => prev.map(c => c.id === credId ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c));
    toast.success('Credential Updated', 'Secrets modified.');

    try {
      await crmService.updateCredential(credId, updates);
    } catch (err) {
      console.warn('Supabase update credential error:', err);
      toast.warning('Offline Cache', 'Updated locally. Cloud sync pending.');
    }
  };

  const deleteCredential = async (credId: string) => {
    setCredentials(prev => prev.filter(c => c.id !== credId));
    logAudit('DELETE', 'Credential', credId, `Deleted vault credential ID ${credId}`);
    toast.warning('Credential Deleted', 'Vault key permanently purged.');

    try {
      await crmService.deleteCredential(credId);
    } catch (err) {
      console.warn('Supabase delete credential error:', err);
    }
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
      originIssueId: issue.id,
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
  const partnerPayoutsTotal = partnerPayouts
    .filter(p => p.status === 'Completed' || (p.status as string) === 'Paid')
    .reduce((acc, p) => acc + (p.amount || 0), 0);
  const directExpensesTotal = expenses.reduce((acc, e) => acc + e.amount, 0);
  const totalExpenses = directExpensesTotal + partnerPayoutsTotal;
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
    refreshFromCloud(false);
  };

  // --- Partner Program Handlers ---
  const createPartner = (partner: Omit<Partner, 'id' | 'createdAt' | 'updatedAt'>) => {
    const tempId = generateUUID();
    const newPartner: Partner = {
      ...partner,
      id: tempId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setPartners(prev => [newPartner, ...prev]);
    logAudit('CREATE', 'Partner', tempId, `Created partner ${newPartner.name} (${newPartner.referralCode})`);
    toast.success('Partner Created', `Partner "${newPartner.name}" onboarded successfully.`);

    crmService.createPartner(partner).then(saved => {
      setPartners(prev => prev.map(p => p.id === tempId ? saved : p));
    }).catch(err => console.warn('Supabase create partner err:', err));
  };

  const updatePartner = (id: string, updates: Partial<Partner>) => {
    setPartners(prev => prev.map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p));
    toast.success('Partner Updated', 'Partner profile and commission settings saved.');
    crmService.updatePartner(id, updates).catch(err => console.warn('Supabase update partner err:', err));
  };

  const deletePartner = (id: string) => {
    const partner = partners.find(p => p.id === id);
    setPartners(prev => prev.filter(p => p.id !== id));
    logAudit('DELETE', 'Partner', id, `Removed partner ${partner?.name || id}`);
    toast.warning('Partner Deleted', 'Partner removed from active roster.');
    crmService.deletePartner(id).catch(err => console.warn('Supabase delete partner err:', err));
  };

  const addPartnerReferral = (referral: Omit<PartnerReferral, 'id' | 'createdAt' | 'updatedAt'>) => {
    const tempId = generateUUID();
    const newReferral: PartnerReferral = {
      ...referral,
      id: tempId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setPartnerReferrals(prev => [newReferral, ...prev]);
    toast.success('Referral Registered', `Referral client "${newReferral.clientName}" registered into pipeline.`);

    crmService.createPartnerReferral(referral).then(saved => {
      setPartnerReferrals(prev => prev.map(r => r.id === tempId ? saved : r));
    }).catch(err => console.warn('Supabase create referral err:', err));
  };

  const updatePartnerReferral = (id: string, updates: Partial<PartnerReferral>) => {
    setPartnerReferrals(prev => prev.map(r => r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r));
    crmService.updatePartnerReferral(id, updates).catch(err => console.warn('Supabase update referral err:', err));
  };

  const deletePartnerReferral = (id: string) => {
    setPartnerReferrals(prev => prev.filter(r => r.id !== id));
    toast.warning('Referral Removed', 'Referral link removed.');
    crmService.deletePartnerReferral(id).catch(err => console.warn('Supabase delete referral err:', err));
  };

  const recordPartnerPayout = (payout: Omit<PartnerPayout, 'id' | 'createdAt'>) => {
    const tempId = generateUUID();
    const newPayout: PartnerPayout = {
      ...payout,
      id: tempId,
      createdAt: new Date().toISOString()
    };
    setPartnerPayouts(prev => [newPayout, ...prev]);

    // Deduct from partner pending earnings and increase paid earnings
    setPartners(prev => prev.map(p => {
      if (p.id === payout.partnerId) {
        const newPaid = p.paidEarnings + payout.amount;
        const newPending = Math.max(0, p.totalEarnings - newPaid);
        return {
          ...p,
          paidEarnings: newPaid,
          pendingEarnings: newPending,
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    }));

    logAudit('CREATE', 'Partner', tempId, `Disbursed partner payout of ₹${payout.amount.toLocaleString('en-IN')} via ${payout.paymentMethod}`);
    toast.success('Commission Paid Out', `₹${payout.amount.toLocaleString('en-IN')} logged as paid to partner.`);

    crmService.createPartnerPayout(payout).then(saved => {
      setPartnerPayouts(prev => prev.map(p => p.id === tempId ? saved : p));
    }).catch(err => console.warn('Supabase record payout err:', err));
  };

  return {
    currentUser,
    isAuthenticated,
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
    // Quotation Store & Handlers
    quotations,
    addQuotation,
    updateQuotation,
    deleteQuotation,
    convertQuotationToInvoice,
    totalQuotedValue: quotations.reduce((sum, q) => sum + (q.total || 0), 0),
    acceptedQuotationsCount: quotations.filter(q => q.status === 'Accepted' || q.status === 'Converted').length,
    pendingQuotationsCount: quotations.filter(q => q.status === 'Draft' || q.status === 'Sent').length,
    quotationConversionRate: quotations.length > 0 ? Math.round((quotations.filter(q => q.status === 'Accepted' || q.status === 'Converted').length / quotations.length) * 100) : 0,
    // Partner Program Store & Handlers
    partners,
    partnerReferrals,
    partnerPayouts,
    createPartner,
    updatePartner,
    deletePartner,
    addPartnerReferral,
    updatePartnerReferral,
    deletePartnerReferral,
    recordPartnerPayout,
    isSupabaseConnected,
    isLoading,
    isSyncing,
    lastSyncedAt,
    syncError,
    refreshFromCloud,
    totalRevenue,
    directExpensesTotal,
    partnerPayoutsTotal,
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

