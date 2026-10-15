// 100% Native MySQL & Node.js Express Data Service Layer for AGX CRM & Business Operating System
import { apiClient } from './apiClient';
import {
  Lead, LeadStatus, LeadActivity, LeadActivityType, Client, Project, ProjectMilestone, ProjectStatus,
  Task, TaskStatus, Invoice, InvoiceItem, Payment, Expense, Agreement, DocumentItem,
  CredentialVaultItem, CalendarEvent, NotificationItem, AuditLog, Priority,
  UserProfile, UserRole, ExpenseCategory, AgreementStatus, InvoiceStatus,
  ProjectIssue, IssueStatus, IssueType, IssuePriority,
  Partner, PartnerReferral, PartnerPayout,
  Quotation, QuotationItem, QuotationStatus
} from '../types/crm';

// --- Database Row Types ---
export interface DbLeadActivity {
  id: string;
  lead_id: string;
  user_name: string;
  activity_type: string;
  notes: string | null;
  created_at: string;
}

export interface DbLead {
  id: string;
  name: string;
  company: string | null;
  phone: string | null;
  email: string | null;
  whatsapp: string | null;
  location: string | null;
  interested_service: string;
  estimated_deal_value: number;
  probability: number;
  source: string | null;
  assigned_to: string | null;
  priority: string;
  status: string;
  next_follow_up: string | null;
  last_contacted: string | null;
  notes: string | null;
  loss_reason?: string | null;
  partner_id?: string | null;
  partner_name?: string | null;
  partner_code?: string | null;
  converted_client_id?: string | null;
  converted_project_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbClient {
  id: string;
  name: string;
  company: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  industry: string | null;
  gst_tax_id: string | null;
  account_manager: string | null;
  partner_id?: string | null;
  partner_name?: string | null;
  partner_code?: string | null;
  total_value: number;
  total_paid: number;
  outstanding_amount: number;
  source: string | null;
  notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface DbProject {
  id: string;
  name: string;
  client_id: string | null;
  client_name: string | null;
  service_type: string;
  project_manager: string | null;
  assigned_team: string[] | null;
  start_date: string | null;
  due_date: string | null;
  delivery_date: string | null;
  project_value: number;
  received_amount: number;
  pending_amount: number;
  status: string;
  priority: string;
  progress: number;
  description: string | null;
  portal_token?: string | null;
  portal_enabled?: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface DbIssue {
  id: string;
  project_id: string;
  project_name: string | null;
  client_id: string | null;
  client_name: string | null;
  ticket_number: string;
  title: string;
  description: string;
  issue_type: string;
  priority: string;
  status: string;
  reporter_name: string;
  reporter_email: string;
  reporter_phone: string | null;
  attachments: string[] | null;
  admin_notes: string | null;
  resolution_notes: string | null;
  assigned_to: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbMilestone {
  id: string;
  project_id: string | null;
  title: string;
  due_date: string | null;
  status: string;
  progress: number;
  amount: number;
  invoice_id?: string | null;
  is_invoiced?: boolean | null;
  created_at: string;
}

export interface DbTask {
  id: string;
  title: string;
  description: string | null;
  client_id: string | null;
  project_id: string | null;
  lead_id: string | null;
  assigned_to: string | null;
  priority: string;
  status: string;
  start_date: string | null;
  due_date: string | null;
  estimated_hours: number;
  actual_hours: number;
  created_at: string;
  updated_at: string;
}

export interface DbQuotation {
  id: string;
  quotation_number: string;
  lead_id: string | null;
  lead_name: string | null;
  client_id: string | null;
  client_name: string;
  project_id: string | null;
  project_name: string | null;
  issue_date: string;
  valid_until: string;
  items: any;
  subtotal: number;
  discount_amount?: number | null;
  is_gst?: boolean | null;
  gst_type?: string | null;
  tax_rate?: number | null;
  tax: number;
  cgst?: number | null;
  sgst?: number | null;
  igst?: number | null;
  total: number;
  status: string;
  converted_invoice_id?: string | null;
  converted_at?: string | null;
  client_gstin?: string | null;
  hsn_sac_code?: string | null;
  notes: string | null;
  terms_conditions?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbInvoice {
  id: string;
  invoice_number: string;
  client_id: string | null;
  client_name: string;
  project_id: string | null;
  quotation_id?: string | null;
  quotation_number?: string | null;
  issue_date: string;
  due_date: string;
  items: any;
  subtotal: number;
  discount_amount?: number | null;
  tax: number;
  total: number;
  paid_amount: number;
  status: string;
  notes: string | null;
  terms_conditions?: string | null;
  is_gst?: boolean | null;
  gst_type?: string | null;
  tax_rate?: number | null;
  cgst?: number | null;
  sgst?: number | null;
  igst?: number | null;
  client_gstin?: string | null;
  hsn_sac_code?: string | null;
  created_at: string;
}

export interface DbPayment {
  id: string;
  invoice_id: string | null;
  client_id: string | null;
  project_id: string | null;
  amount: number;
  payment_date: string;
  payment_method: string | null;
  transaction_id: string | null;
  status: string;
  notes: string | null;
  created_at: string;
}

export interface DbExpense {
  id: string;
  category: string;
  amount: number;
  expense_date: string;
  vendor: string | null;
  description: string;
  payment_method: string | null;
  client_id: string | null;
  project_id: string | null;
  approved_by: string | null;
  status: string;
  created_at: string;
}

export interface DbAgreement {
  id: string;
  name: string;
  agreement_type: string;
  client_id: string | null;
  project_id: string | null;
  lead_id: string | null;
  start_date: string | null;
  expiry_date: string | null;
  commercial_value: number;
  status: string;
  signed_date: string | null;
  file_url: string | null;
  created_at: string;
}

export interface DbDocument {
  id: string;
  title: string;
  doc_type: string;
  client_id: string | null;
  project_id: string | null;
  lead_id: string | null;
  file_url: string;
  file_size: string | null;
  uploaded_by: string | null;
  created_at: string;
}

export interface DbCredential {
  id: string;
  platform_name: string;
  service_url: string | null;
  username: string | null;
  password_encrypted: string | null;
  api_key_encrypted: string | null;
  client_id: string | null;
  project_id: string | null;
  notes: string | null;
  access_roles: string[] | null;
  environment?: string | null;
  status?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbCalendarEvent {
  id: string;
  title: string;
  event_type: string;
  start_time: string;
  end_time: string | null;
  location: string | null;
  participants: string[] | null;
  related_client_id: string | null;
  related_project_id: string | null;
  related_lead_id: string | null;
  related_lead_name?: string | null;
  notes: string | null;
  created_at: string;
}

export interface DbNotification {
  id: string;
  user_id: string | null;
  title: string;
  message: string;
  notification_type: string | null;
  is_read: boolean;
  link: string | null;
  created_at: string;
}

export interface DbProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  avatar_url: string | null;
  phone: string | null;
  department: string | null;
  password_hash: string | null;
  is_active: boolean | null;
  permissions: any;
  created_at: string;
  updated_at: string;
}

export interface DbAuditLog {
  id: string;
  user_name: string;
  user_role: string;
  action_type: string;
  entity_type: string;
  entity_id: string | null;
  description: string;
  before_state: any;
  after_state: any;
  created_at: string;
}

export interface DbPartner {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  referral_code: string;
  commission_rate: number;
  status: string;
  payout_method: string;
  payout_details: any;
  total_earnings: number;
  paid_earnings: number;
  pending_earnings: number;
  notes: string | null;
  last_login_at?: string | null;
  terms_accepted?: number | boolean | null;
  terms_accepted_at?: string | null;
  terms_version?: string | null;
  is_custom_rate?: number | boolean | null;
  custom_commission_rate?: number | null;
  custom_rate_reason?: string | null;
  custom_rate_set_at?: string | null;
  custom_rate_set_by?: string | null;
  password_hash?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbPartnerReferral {
  id: string;
  partner_id: string;
  lead_id: string | null;
  client_id: string | null;
  project_id: string | null;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  company: string | null;
  project_type: string;
  deal_value: number;
  total_paid: number;
  pending_payment: number;
  deal_status: string;
  payment_status: string;
  commission_rate: number;
  commission_earned: number;
  commission_paid: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbPartnerPayout {
  id: string;
  partner_id: string;
  amount: number;
  payout_date: string;
  payment_method: string;
  transaction_ref: string | null;
  status: string;
  notes: string | null;
  created_at: string;
}

// Helper to sanitize date-only strings coming back with midnight UTC timestamps from Postgres
function sanitizeDateString(val?: string | null): string | undefined {
  if (!val) return undefined;
  if (val.includes('T00:00:00')) {
    return val.split('T')[0];
  }
  return val;
}

// --- Transformers: DB <-> Frontend ---
export function mapLeadActivityFromDb(row: DbLeadActivity): LeadActivity {
  return {
    id: row.id,
    leadId: row.lead_id,
    userName: row.user_name,
    activityType: row.activity_type as LeadActivityType,
    notes: row.notes || '',
    createdAt: row.created_at
  };
}

export function mapLeadFromDb(row: DbLead, activities: LeadActivity[] = []): Lead {
  return {
    id: row.id,
    name: row.name,
    company: row.company || '',
    phone: row.phone || '',
    email: row.email || '',
    whatsapp: row.whatsapp || undefined,
    location: row.location || undefined,
    interestedService: row.interested_service,
    estimatedDealValue: Number(row.estimated_deal_value) || 0,
    probability: Number(row.probability) || 50,
    source: row.source || 'Website',
    assignedTo: row.assigned_to || '',
    priority: (row.priority as Priority) || 'Medium',
    status: (row.status as LeadStatus) || 'NEW',
    nextFollowUp: sanitizeDateString(row.next_follow_up),
    lastContacted: sanitizeDateString(row.last_contacted),
    notes: row.notes || undefined,
    lossReason: row.loss_reason || undefined,
    partnerId: (row as any).partner_id || undefined,
    partnerName: (row as any).partner_name || undefined,
    partnerCode: (row as any).partner_code || undefined,
    convertedClientId: row.converted_client_id || undefined,
    convertedProjectId: row.converted_project_id || undefined,
    activities: activities.filter(a => a.leadId === row.id),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function mapClientFromDb(row: DbClient): Client {
  return {
    id: row.id,
    name: row.name,
    company: row.company,
    phone: row.phone || '',
    email: row.email || '',
    website: row.website || undefined,
    address: row.address || undefined,
    industry: row.industry || undefined,
    gstTaxId: row.gst_tax_id || undefined,
    accountManager: row.account_manager || '',
    partnerId: (row as any).partner_id || undefined,
    partnerName: (row as any).partner_name || undefined,
    partnerCode: (row as any).partner_code || undefined,
    createdById: (row as any).created_by_id || undefined,
    createdByName: (row as any).created_by_name || undefined,
    totalValue: Number(row.total_value) || 0,
    totalPaid: Number(row.total_paid) || 0,
    outstandingAmount: Number(row.outstanding_amount) || 0,
    source: row.source || 'Inbound',
    notes: row.notes || undefined,
    status: (row.status as any) || 'Active',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function mapProjectFromDb(row: DbProject, milestones: ProjectMilestone[] = []): Project {
  return {
    id: row.id,
    name: row.name,
    clientId: row.client_id || '',
    clientName: row.client_name || '',
    serviceType: row.service_type,
    projectManager: row.project_manager || '',
    assignedTeam: row.assigned_team || [],
    startDate: sanitizeDateString(row.start_date) || '',
    dueDate: sanitizeDateString(row.due_date) || '',
    deliveryDate: sanitizeDateString(row.delivery_date),
    projectValue: Number(row.project_value) || 0,
    receivedAmount: Number(row.received_amount) || 0,
    pendingAmount: Number(row.pending_amount) || 0,
    status: (row.status as ProjectStatus) || 'PLANNING',
    priority: (row.priority as Priority) || 'Medium',
    progress: Number(row.progress) || 0,
    description: row.description || undefined,
    milestones: milestones.filter(m => m.projectId === row.id),
    portalToken: row.portal_token || undefined,
    portalEnabled: row.portal_enabled !== false,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function mapIssueFromDb(row: DbIssue): ProjectIssue {
  return {
    id: row.id,
    projectId: row.project_id,
    projectName: row.project_name || '',
    clientId: row.client_id || '',
    clientName: row.client_name || '',
    ticketNumber: row.ticket_number || 'ISSUE-001',
    title: row.title,
    description: row.description || '',
    issueType: (row.issue_type as IssueType) || 'Bug',
    priority: (row.priority as IssuePriority) || 'Medium',
    status: (row.status as IssueStatus) || 'REPORTED',
    reporterName: row.reporter_name || '',
    reporterEmail: row.reporter_email || '',
    reporterPhone: row.reporter_phone || undefined,
    attachments: row.attachments || [],
    adminNotes: row.admin_notes || undefined,
    resolutionNotes: row.resolution_notes || undefined,
    assignedTo: row.assigned_to || undefined,
    resolvedAt: row.resolved_at || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function mapMilestoneFromDb(row: DbMilestone): ProjectMilestone {
  return {
    id: row.id,
    projectId: row.project_id || '',
    title: row.title,
    dueDate: sanitizeDateString(row.due_date) || '',
    status: (row.status as any) || 'Pending',
    progress: Number(row.progress) || 0,
    amount: Number(row.amount) || 0,
    invoiceId: row.invoice_id || undefined,
    isBilled: Boolean(row.is_invoiced || row.invoice_id)
  };
}

export function mapTaskFromDb(row: DbTask, clients: Client[] = [], projects: Project[] = [], leads: Lead[] = []): Task {
  const client = clients.find(c => c.id === row.client_id);
  const project = projects.find(p => p.id === row.project_id);
  const lead = leads.find(l => l.id === row.lead_id);
  return {
    id: row.id,
    title: row.title,
    description: row.description || undefined,
    clientId: row.client_id || undefined,
    clientName: client?.company || undefined,
    projectId: row.project_id || undefined,
    projectName: project?.name || undefined,
    leadId: row.lead_id || undefined,
    leadName: lead ? (lead.company || lead.name) : undefined,
    assignedTo: row.assigned_to || '',
    priority: (row.priority as Priority) || 'Medium',
    status: (row.status as TaskStatus) || 'TO DO',
    startDate: sanitizeDateString(row.start_date),
    dueDate: sanitizeDateString(row.due_date) || '',
    estimatedHours: Number(row.estimated_hours) || 0,
    actualHours: Number(row.actual_hours) || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function mapQuotationFromDb(row: DbQuotation, leads: Lead[] = [], clients: Client[] = [], projects: Project[] = []): Quotation {
  const lead = leads.find(l => l.id === row.lead_id);
  const client = clients.find(c => c.id === row.client_id);
  const project = projects.find(p => p.id === row.project_id);
  let parsedItems: QuotationItem[] = [];
  if (Array.isArray(row.items)) {
    parsedItems = row.items;
  } else if (typeof row.items === 'string') {
    try { parsedItems = JSON.parse(row.items); } catch (e) { parsedItems = []; }
  }
  const isGst = row.is_gst !== false;
  return {
    id: row.id,
    quotationNumber: row.quotation_number,
    leadId: row.lead_id || undefined,
    leadName: row.lead_name || (lead ? (lead.company || lead.name) : undefined),
    clientId: row.client_id || undefined,
    clientName: row.client_name || (client ? client.company : 'Prospective Client'),
    projectId: row.project_id || undefined,
    projectName: project?.name || undefined,
    issueDate: sanitizeDateString(row.issue_date) || '',
    validUntil: sanitizeDateString(row.valid_until) || '',
    items: parsedItems,
    subtotal: Number(row.subtotal) || 0,
    discountAmount: Number(row.discount_amount) || 0,
    isGst,
    gstType: (row.gst_type as any) || (isGst ? 'IGST' : undefined),
    taxRate: row.tax_rate !== null && row.tax_rate !== undefined ? Number(row.tax_rate) : (isGst ? 18 : 0),
    tax: Number(row.tax) || 0,
    cgst: Number(row.cgst) || 0,
    sgst: Number(row.sgst) || 0,
    igst: Number(row.igst) || 0,
    total: Number(row.total) || 0,
    status: (row.status as QuotationStatus) || 'Draft',
    convertedInvoiceId: row.converted_invoice_id || undefined,
    convertedAt: row.converted_at || undefined,
    clientGstin: row.client_gstin || undefined,
    hsnSacCode: row.hsn_sac_code || (isGst ? '998313' : undefined),
    notes: row.notes || undefined,
    termsConditions: row.terms_conditions || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function mapInvoiceFromDb(row: DbInvoice, projects: Project[] = []): Invoice {
  const project = projects.find(p => p.id === row.project_id);
  let parsedItems: InvoiceItem[] = [];
  if (Array.isArray(row.items)) {
    parsedItems = row.items;
  } else if (typeof row.items === 'string') {
    try { parsedItems = JSON.parse(row.items); } catch (e) { parsedItems = []; }
  }
  const isGst = row.is_gst !== false;
  return {
    id: row.id,
    invoiceNumber: row.invoice_number,
    clientId: row.client_id || '',
    clientName: row.client_name,
    projectId: row.project_id || undefined,
    projectName: project?.name || undefined,
    quotationId: row.quotation_id || undefined,
    quotationNumber: row.quotation_number || undefined,
    issueDate: sanitizeDateString(row.issue_date) || '',
    dueDate: sanitizeDateString(row.due_date) || '',
    items: parsedItems,
    subtotal: Number(row.subtotal) || 0,
    discountAmount: Number(row.discount_amount) || 0,
    isGst,
    gstType: (row.gst_type as any) || (isGst ? 'IGST' : undefined),
    taxRate: row.tax_rate !== null && row.tax_rate !== undefined ? Number(row.tax_rate) : (isGst ? 18 : 0),
    tax: Number(row.tax) || 0,
    cgst: Number(row.cgst) || 0,
    sgst: Number(row.sgst) || 0,
    igst: Number(row.igst) || 0,
    clientGstin: row.client_gstin || undefined,
    hsnSacCode: row.hsn_sac_code || (isGst ? '998313' : undefined),
    total: Number(row.total) || 0,
    paidAmount: Number(row.paid_amount) || 0,
    status: (row.status as InvoiceStatus) || 'Draft',
    notes: row.notes || undefined,
    termsConditions: row.terms_conditions || undefined,
    createdAt: row.created_at
  };
}

export function mapPaymentFromDb(row: DbPayment, clients: Client[] = [], projects: Project[] = [], invoices: Invoice[] = []): Payment {
  const client = clients.find(c => c.id === row.client_id);
  const project = projects.find(p => p.id === row.project_id);
  const invoice = invoices.find(i => i.id === row.invoice_id);
  return {
    id: row.id,
    invoiceId: row.invoice_id || undefined,
    invoiceNumber: invoice?.invoiceNumber || undefined,
    clientId: row.client_id || '',
    clientName: client?.company || 'Client',
    projectId: row.project_id || undefined,
    projectName: project?.name || undefined,
    amount: Number(row.amount) || 0,
    paymentDate: sanitizeDateString(row.payment_date) || '',
    paymentMethod: row.payment_method || 'Bank Transfer',
    transactionId: row.transaction_id || undefined,
    status: (row.status as any) || 'Paid',
    notes: row.notes || undefined,
    createdAt: row.created_at
  };
}

export function mapExpenseFromDb(row: DbExpense, clients: Client[] = [], projects: Project[] = []): Expense {
  const client = clients.find(c => c.id === row.client_id);
  const project = projects.find(p => p.id === row.project_id);
  return {
    id: row.id,
    category: (row.category as ExpenseCategory) || 'Other',
    amount: Number(row.amount) || 0,
    expenseDate: sanitizeDateString(row.expense_date) || '',
    vendor: row.vendor || '',
    description: row.description,
    paymentMethod: row.payment_method || undefined,
    clientId: row.client_id || undefined,
    clientName: client?.company || undefined,
    projectId: row.project_id || undefined,
    projectName: project?.name || undefined,
    approvedBy: row.approved_by || undefined,
    status: (row.status as any) || 'Approved',
    createdAt: row.created_at
  };
}

export function mapAgreementFromDb(row: DbAgreement, clients: Client[] = [], projects: Project[] = [], leads: Lead[] = []): Agreement {
  const client = clients.find(c => c.id === row.client_id);
  const project = projects.find(p => p.id === row.project_id);
  const lead = leads.find(l => l.id === row.lead_id);
  return {
    id: row.id,
    name: row.name,
    agreementType: row.agreement_type as any,
    clientId: row.client_id || undefined,
    clientName: client?.company || (lead ? (lead.company || lead.name) : 'Client'),
    projectId: row.project_id || undefined,
    projectName: project?.name || undefined,
    leadId: row.lead_id || undefined,
    leadName: lead ? (lead.company || lead.name) : undefined,
    startDate: sanitizeDateString(row.start_date) || '',
    expiryDate: sanitizeDateString(row.expiry_date) || '',
    commercialValue: Number(row.commercial_value) || 0,
    status: (row.status as AgreementStatus) || 'Draft',
    signedDate: sanitizeDateString(row.signed_date),
    fileUrl: row.file_url || undefined,
    createdAt: row.created_at
  };
}

export function mapDocumentFromDb(row: DbDocument, clients: Client[] = [], projects: Project[] = [], leads: Lead[] = []): DocumentItem {
  const client = clients.find(c => c.id === row.client_id);
  const project = projects.find(p => p.id === row.project_id);
  const lead = leads.find(l => l.id === row.lead_id);
  return {
    id: row.id,
    title: row.title,
    docType: (row.doc_type as any) || 'Other',
    clientId: row.client_id || undefined,
    clientName: client?.company || (lead ? (lead.company || lead.name) : undefined),
    projectId: row.project_id || undefined,
    projectName: project?.name || undefined,
    leadId: row.lead_id || undefined,
    leadName: lead ? (lead.company || lead.name) : undefined,
    fileUrl: row.file_url,
    fileSize: row.file_size || '1.0 MB',
    uploadedBy: row.uploaded_by || 'Admin',
    createdAt: row.created_at
  };
}

export function mapCredentialFromDb(row: DbCredential, clients: Client[] = [], projects: Project[] = []): CredentialVaultItem {
  const client = clients.find(c => c.id === row.client_id);
  const project = projects.find(p => p.id === row.project_id);
  let pwd = row.password_encrypted || '';
  if (pwd === '●●●●●●●●●●' || pwd === '●●●●●●●●') {
    pwd = '';
  }
  return {
    id: row.id,
    platformName: row.platform_name,
    serviceUrl: row.service_url || undefined,
    username: row.username || '',
    passwordEncrypted: pwd,
    apiKeyEncrypted: row.api_key_encrypted || undefined,
    clientId: row.client_id || undefined,
    clientName: client?.company || undefined,
    projectId: row.project_id || undefined,
    projectName: project?.name || undefined,
    notes: row.notes || undefined,
    accessRoles: (row.access_roles as UserRole[]) || ['Super Admin', 'Admin'],
    environment: (row.environment as any) || 'Production',
    status: (row.status as any) || 'Active',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function mapCalendarEventFromDb(row: DbCalendarEvent, leads: Lead[] = []): CalendarEvent {
  const lead = leads.find(l => l.id === row.related_lead_id);
  return {
    id: row.id,
    title: row.title,
    eventType: row.event_type as any,
    startTime: row.start_time,
    endTime: row.end_time || undefined,
    location: row.location || undefined,
    participants: row.participants || [],
    relatedClientId: row.related_client_id || undefined,
    relatedProjectId: row.related_project_id || undefined,
    relatedLeadId: row.related_lead_id || undefined,
    relatedLeadName: row.related_lead_name || (lead ? (lead.company || lead.name) : undefined),
    notes: row.notes || undefined,
    createdAt: row.created_at
  };
}

export function mapNotificationFromDb(row: DbNotification): NotificationItem {
  return {
    id: row.id,
    userId: row.user_id || undefined,
    title: row.title,
    message: row.message,
    type: (row.notification_type as any) || 'info',
    isRead: row.is_read ?? false,
    link: row.link || undefined,
    createdAt: row.created_at
  };
}

export function mapProfileFromDb(row: any): UserProfile {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    role: (row.role as UserRole) || 'Developer',
    department: row.department || undefined,
    avatarUrl: row.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(row.full_name || 'user')}`,
    phone: row.phone || undefined,
    passwordHash: row.password_hash || undefined,
    isActive: row.is_active !== false,
    permissions: row.permissions || {},
    lastActiveAt: row.updated_at || row.created_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function mapAuditLogFromDb(row: DbAuditLog): AuditLog {
  return {
    id: row.id,
    userName: row.user_name,
    userRole: row.user_role as UserRole,
    actionType: row.action_type as any,
    entityType: row.entity_type as any,
    entityId: row.entity_id || undefined,
    description: row.description,
    beforeState: row.before_state,
    afterState: row.after_state,
    createdAt: row.created_at,
  };
}

export function mapPartnerFromDb(row: DbPartner): Partner {
  return {
    id: row.id,
    userId: row.user_id || undefined,
    name: row.name,
    email: row.email,
    company: row.company || undefined,
    phone: row.phone || undefined,
    referralCode: row.referral_code,
    commissionRate: Number(row.commission_rate) || 0.10,
    status: (row.status as any) || 'Active',
    payoutMethod: (row.payout_method as any) || 'UPI',
    payoutDetails: row.payout_details || {},
    totalEarnings: Number(row.total_earnings) || 0,
    paidEarnings: Number(row.paid_earnings) || 0,
    pendingEarnings: Number(row.pending_earnings) || 0,
    notes: row.notes || undefined,
    lastLoginAt: row.last_login_at || row.updated_at || row.created_at,
    termsAccepted: Boolean(row.terms_accepted || (row.payout_details as any)?.termsAccepted),
    termsAcceptedAt: row.terms_accepted_at || (row.payout_details as any)?.termsAcceptedAt || undefined,
    termsVersion: row.terms_version || (row.payout_details as any)?.termsVersion || undefined,
    isCustomRate: Boolean(row.is_custom_rate || (row.payout_details as any)?.isCustomRate),
    customCommissionRate: row.custom_commission_rate !== null && row.custom_commission_rate !== undefined 
      ? Number(row.custom_commission_rate) 
      : ((row.payout_details as any)?.customCommissionRate ? Number((row.payout_details as any)?.customCommissionRate) : undefined),
    customRateReason: row.custom_rate_reason || (row.payout_details as any)?.customRateReason || undefined,
    customRateSetAt: row.custom_rate_set_at || (row.payout_details as any)?.customRateSetAt || undefined,
    customRateSetBy: row.custom_rate_set_by || (row.payout_details as any)?.customRateSetBy || undefined,
    hasPassword: Boolean(row.password_hash || (row.payout_details as any)?.passwordHash),
    passwordHash: row.password_hash || (row.payout_details as any)?.passwordHash || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function mapPartnerReferralFromDb(row: DbPartnerReferral, partners: Partner[] = []): PartnerReferral {
  const partner = partners.find(p => p.id === row.partner_id);
  return {
    id: row.id,
    partnerId: row.partner_id,
    partnerName: partner?.name,
    leadId: row.lead_id || undefined,
    clientId: row.client_id || undefined,
    projectId: row.project_id || undefined,
    clientName: row.client_name,
    clientEmail: row.client_email || undefined,
    clientPhone: row.client_phone || undefined,
    company: row.company || undefined,
    projectType: row.project_type || 'AI Automation',
    dealValue: Number(row.deal_value) || 0,
    totalPaid: Number(row.total_paid) || 0,
    pendingPayment: Number(row.pending_payment) || 0,
    dealStatus: (row.deal_status as any) || 'NEW',
    paymentStatus: (row.payment_status as any) || 'Pending',
    commissionRate: Number(row.commission_rate) || 0.10,
    commissionEarned: Number(row.commission_earned) || 0,
    commissionPaid: Number(row.commission_paid) || 0,
    notes: row.notes || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function mapPartnerPayoutFromDb(row: DbPartnerPayout, partners: Partner[] = []): PartnerPayout {
  const partner = partners.find(p => p.id === row.partner_id);
  return {
    id: row.id,
    partnerId: row.partner_id,
    partnerName: partner?.name,
    amount: Number(row.amount) || 0,
    payoutDate: sanitizeDateString(row.payout_date) || '',
    paymentMethod: row.payment_method || 'UPI',
    transactionRef: row.transaction_ref || undefined,
    status: (row.status as any) || 'Completed',
    notes: row.notes || undefined,
    createdAt: row.created_at
  };
}

// --- Data Fetching & Sync Services ---

export const crmService = {
  // Connection Health
  async checkConnection(): Promise<{ ok: boolean; message?: string }> {
    try {
      const health = await apiClient.checkHealth();
      if (health.online) {
        return { ok: true, message: `Node.js + MySQL (${(health as any).database?.database || 'connected'})` };
      }
      return { ok: false, message: health.error || 'Server offline' };
    } catch (e: any) {
      return { ok: false, message: e?.message || 'Connection failed' };
    }
  },

  // Storage Attachment Uploader (Native Node.js uploads)
  async uploadAttachment(bucket: 'crm-documents' | 'crm-agreements' | 'crm-invoices' | 'crm-attachments', file: File, customPath?: string): Promise<{ publicUrl: string | null; error: Error | null }> {
    return await apiClient.upload(bucket, file, customPath);
  },

  // Full Initial Fetch (From MySQL via Express /api/crm/all)
  async fetchAllData() {
    const apiRes = await apiClient.get<any>('/crm/all');
    if (!apiRes || !apiRes.success || !apiRes.data) {
      throw new Error(apiRes?.error || 'Failed to fetch data from MySQL backend');
    }
    const d = apiRes.data;
    const leadActivities = (d.leadActivities || []).map(mapLeadActivityFromDb);
    const milestones = (d.milestones || []).map(mapMilestoneFromDb);
    const clients = (d.clients || []).filter((r: any) => !r.deleted_at).map(mapClientFromDb);
    const projects = (d.projects || []).filter((r: any) => !r.deleted_at).map((p: any) => mapProjectFromDb(p, milestones));
    const invoices = (d.invoices || []).filter((r: any) => !r.deleted_at).map((i: any) => mapInvoiceFromDb(i, projects));
    const leads = (d.leads || []).filter((r: any) => !r.deleted_at).map((l: any) => mapLeadFromDb(l, leadActivities));
    const tasks = (d.tasks || []).filter((r: any) => !r.deleted_at).map((t: any) => mapTaskFromDb(t, clients, projects, leads));
    const payments = (d.payments || []).filter((r: any) => !r.deleted_at).map((p: any) => mapPaymentFromDb(p, clients, projects, invoices));
    const expenses = (d.expenses || []).filter((r: any) => !r.deleted_at).map((e: any) => mapExpenseFromDb(e, clients, projects));
    const agreements = (d.agreements || []).filter((r: any) => !r.deleted_at).map((a: any) => mapAgreementFromDb(a, clients, projects, leads));
    const documents = (d.documents || []).filter((r: any) => !r.deleted_at).map((doc: any) => mapDocumentFromDb(doc, clients, projects, leads));
    const credentials = (d.credentials || []).filter((r: any) => !r.deleted_at).map((c: any) => mapCredentialFromDb(c, clients, projects));
    const events = (d.events || []).filter((r: any) => !r.deleted_at).map((e: any) => mapCalendarEventFromDb(e, leads));
    const notifications = (d.notifications || []).map(mapNotificationFromDb);
    const auditLogs = (d.auditLogs || []).map(mapAuditLogFromDb);
    const partners = (d.partners || []).filter((r: any) => !r.deleted_at).map(mapPartnerFromDb);
    const partnerReferrals = (d.partnerReferrals || []).filter((r: any) => !r.deleted_at).map((r: any) => mapPartnerReferralFromDb(r, partners));
    const partnerPayouts = (d.partnerPayouts || []).filter((r: any) => !r.deleted_at).map((p: any) => mapPartnerPayoutFromDb(p, partners));
    const quotations = (d.quotations || []).filter((r: any) => !r.deleted_at).map((q: any) => mapQuotationFromDb(q, leads, clients, projects));
    const issues = (d.issues || []).filter((r: any) => !r.deleted_at).map(mapIssueFromDb);

    return {
      mysqlConnected: Boolean(apiRes.mysqlConnected),
      profiles: (d.profiles || []).map(mapProfileFromDb),
      leads,
      leadActivities,
      clients,
      projects,
      tasks,
      invoices,
      quotations,
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
      partnerPayouts
    };
  },

  // Soft Delete helper
  async softDelete(tableName: string, id: string): Promise<void> {
    const res = await apiClient.delete(`/crm/${tableName}/${id}`);
    if (!res.success) {
      console.warn(`Soft delete warning on ${tableName}:`, res.error);
    }
  },

  // Restore soft-deleted record
  async restore(tableName: string, id: string): Promise<void> {
    const res = await apiClient.post(`/crm/${tableName}/restore/${id}`, {});
    if (!res.success) {
      console.warn(`Restore warning on ${tableName}:`, res.error);
    }
  },

  // Atomic Number Sequence Generators
  async generateNextInvoiceNumber(): Promise<string> {
    try {
      const res = await apiClient.get<any>('/crm/next-number/invoice');
      if (res?.success && res.data?.number) return res.data.number;
    } catch (_) {}
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `INV-${year}-${rand}`;
  },

  async generateNextQuotationNumber(): Promise<string> {
    try {
      const res = await apiClient.get<any>('/crm/next-number/quotation');
      if (res?.success && res.data?.number) return res.data.number;
    } catch (_) {}
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `QT-${year}-${rand}`;
  },

  // --- Leads CRUD ---
  async createLead(lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<Lead> {
    const insertPayload: any = {
      name: lead.name,
      company: lead.company || null,
      phone: lead.phone || null,
      email: lead.email || null,
      whatsapp: lead.whatsapp || null,
      location: lead.location || null,
      interested_service: lead.interestedService,
      estimated_deal_value: lead.estimatedDealValue,
      probability: lead.probability,
      source: lead.source,
      assigned_to: lead.assignedTo,
      priority: lead.priority,
      status: lead.status,
      next_follow_up: lead.nextFollowUp || null,
      notes: lead.notes || null,
      partner_id: lead.partnerId || null,
      partner_name: lead.partnerName || null,
      partner_code: lead.partnerCode || null,
      loss_reason: lead.lossReason || null,
      converted_client_id: lead.convertedClientId || null,
      converted_project_id: lead.convertedProjectId || null
    };
    if (lead.id) insertPayload.id = lead.id;
    const res = await apiClient.post<any>('/crm/leads', insertPayload);
    if (!res.success) throw new Error(res.error || 'Failed to create lead in MySQL');
    return mapLeadFromDb(res.data || { ...insertPayload, id: res.id, created_at: new Date().toISOString() });
  },

  async updateLead(id: string, updates: Partial<Lead>): Promise<void> {
    const payload: any = { updated_at: new Date().toISOString() };
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.company !== undefined) payload.company = updates.company;
    if (updates.phone !== undefined) payload.phone = updates.phone;
    if (updates.email !== undefined) payload.email = updates.email;
    if (updates.whatsapp !== undefined) payload.whatsapp = updates.whatsapp;
    if (updates.location !== undefined) payload.location = updates.location;
    if (updates.interestedService !== undefined) payload.interested_service = updates.interestedService;
    if (updates.estimatedDealValue !== undefined) payload.estimated_deal_value = updates.estimatedDealValue;
    if (updates.probability !== undefined) payload.probability = updates.probability;
    if (updates.source !== undefined) payload.source = updates.source;
    if (updates.assignedTo !== undefined) payload.assigned_to = updates.assignedTo;
    if (updates.priority !== undefined) payload.priority = updates.priority;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.nextFollowUp !== undefined) payload.next_follow_up = updates.nextFollowUp;
    if (updates.notes !== undefined) payload.notes = updates.notes;
    if (updates.lossReason !== undefined) payload.loss_reason = updates.lossReason;
    if (updates.partnerId !== undefined) payload.partner_id = updates.partnerId || null;
    if (updates.partnerName !== undefined) payload.partner_name = updates.partnerName || null;
    if (updates.partnerCode !== undefined) payload.partner_code = updates.partnerCode || null;
    if (updates.convertedClientId !== undefined) payload.converted_client_id = updates.convertedClientId;
    if (updates.convertedProjectId !== undefined) payload.converted_project_id = updates.convertedProjectId;

    const res = await apiClient.put(`/crm/leads/${id}`, payload);
    if (!res.success) throw new Error(res.error || 'Failed to update lead');
  },

  async updateLeadStatus(id: string, status: LeadStatus, lossReason?: string): Promise<void> {
    const payload: any = { status, updated_at: new Date().toISOString() };
    if (lossReason !== undefined) payload.loss_reason = lossReason;
    const res = await apiClient.put(`/crm/leads/${id}`, payload);
    if (!res.success) throw new Error(res.error || 'Failed to update lead status');
  },

  async deleteLead(id: string): Promise<void> {
    await this.softDelete('leads', id);
  },

  async fetchLeadActivities(leadId: string): Promise<LeadActivity[]> {
    const res = await apiClient.get<any>('/crm/lead-activities');
    const items = (res.data || []).filter((r: any) => r.lead_id === leadId);
    return items.map(mapLeadActivityFromDb);
  },

  async createLeadActivity(activity: { leadId: string; userName: string; activityType: LeadActivityType; notes: string }): Promise<LeadActivity> {
    const payload = {
      lead_id: activity.leadId,
      user_name: activity.userName,
      activity_type: activity.activityType,
      notes: activity.notes
    };
    const res = await apiClient.post<any>('/crm/lead-activities', payload);
    if (!res.success) throw new Error(res.error || 'Failed to create lead activity');
    return mapLeadActivityFromDb(res.data || { ...payload, id: res.id, created_at: new Date().toISOString() });
  },

  // --- Clients CRUD ---
  async createClient(client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<Client> {
    const insertPayload: any = {
      name: client.name,
      company: client.company,
      phone: client.phone || null,
      email: client.email || null,
      website: client.website || null,
      address: client.address || null,
      industry: client.industry || null,
      gst_tax_id: client.gstTaxId || null,
      account_manager: client.accountManager || null,
      partner_id: client.partnerId || null,
      partner_name: client.partnerName || null,
      partner_code: client.partnerCode || null,
      created_by_id: (client as any).createdById || null,
      created_by_name: (client as any).createdByName || null,
      total_value: client.totalValue,
      total_paid: client.totalPaid,
      outstanding_amount: client.outstandingAmount,
      source: client.source,
      notes: client.notes || null,
      status: client.status
    };
    if (client.id) insertPayload.id = client.id;
    const res = await apiClient.post<any>('/crm/clients', insertPayload);
    if (!res.success) throw new Error(res.error || 'Failed to create client');
    return mapClientFromDb(res.data || { ...insertPayload, id: res.id, created_at: new Date().toISOString() });
  },

  async updateClient(id: string, updates: Partial<Client>): Promise<void> {
    const payload: any = { updated_at: new Date().toISOString() };
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.company !== undefined) payload.company = updates.company;
    if (updates.phone !== undefined) payload.phone = updates.phone;
    if (updates.email !== undefined) payload.email = updates.email;
    if (updates.website !== undefined) payload.website = updates.website;
    if (updates.address !== undefined) payload.address = updates.address;
    if (updates.industry !== undefined) payload.industry = updates.industry;
    if (updates.gstTaxId !== undefined) payload.gst_tax_id = updates.gstTaxId;
    if (updates.accountManager !== undefined) payload.account_manager = updates.accountManager;
    if (updates.partnerId !== undefined) payload.partner_id = updates.partnerId || null;
    if (updates.partnerName !== undefined) payload.partner_name = updates.partnerName || null;
    if (updates.partnerCode !== undefined) payload.partner_code = updates.partnerCode || null;
    if ((updates as any).createdById !== undefined) payload.created_by_id = (updates as any).createdById;
    if ((updates as any).createdByName !== undefined) payload.created_by_name = (updates as any).createdByName;
    if (updates.totalValue !== undefined) payload.total_value = updates.totalValue;
    if (updates.totalPaid !== undefined) payload.total_paid = updates.totalPaid;
    if (updates.outstandingAmount !== undefined) payload.outstanding_amount = updates.outstandingAmount;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.notes !== undefined) payload.notes = updates.notes;

    const res = await apiClient.put(`/crm/clients/${id}`, payload);
    if (!res.success) throw new Error(res.error || 'Failed to update client');
  },

  async deleteClient(id: string): Promise<void> {
    await this.softDelete('clients', id);
  },

  // --- Projects & Milestones CRUD ---
  async createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const payload = {
      name: project.name,
      client_id: project.clientId || null,
      client_name: project.clientName || null,
      service_type: project.serviceType,
      project_manager: project.projectManager || null,
      assigned_team: project.assignedTeam || [],
      start_date: project.startDate || null,
      due_date: project.dueDate || null,
      project_value: project.projectValue,
      received_amount: project.receivedAmount,
      pending_amount: project.pendingAmount,
      status: project.status,
      priority: project.priority,
      progress: project.progress,
      description: project.description || null
    };
    const res = await apiClient.post<any>('/crm/projects', payload);
    if (!res.success) throw new Error(res.error || 'Failed to create project');
    return mapProjectFromDb(res.data || { ...payload, id: res.id, created_at: new Date().toISOString() }, []);
  },

  async updateProject(id: string, updates: Partial<Project>): Promise<void> {
    const payload: any = { updated_at: new Date().toISOString() };
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.clientId !== undefined) payload.client_id = updates.clientId;
    if (updates.clientName !== undefined) payload.client_name = updates.clientName;
    if (updates.serviceType !== undefined) payload.service_type = updates.serviceType;
    if (updates.projectManager !== undefined) payload.project_manager = updates.projectManager;
    if (updates.assignedTeam !== undefined) payload.assigned_team = updates.assignedTeam;
    if (updates.startDate !== undefined) payload.start_date = updates.startDate;
    if (updates.dueDate !== undefined) payload.due_date = updates.dueDate;
    if (updates.projectValue !== undefined) payload.project_value = updates.projectValue;
    if (updates.receivedAmount !== undefined) payload.received_amount = updates.receivedAmount;
    if (updates.pendingAmount !== undefined) payload.pending_amount = updates.pendingAmount;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.priority !== undefined) payload.priority = updates.priority;
    if (updates.progress !== undefined) payload.progress = updates.progress;
    if (updates.description !== undefined) payload.description = updates.description;

    const res = await apiClient.put(`/crm/projects/${id}`, payload);
    if (!res.success) throw new Error(res.error || 'Failed to update project');
  },

  async updateProjectStatus(id: string, status: ProjectStatus, progress?: number): Promise<void> {
    const payload: any = { status, updated_at: new Date().toISOString() };
    if (progress !== undefined) payload.progress = progress;
    const res = await apiClient.put(`/crm/projects/${id}`, payload);
    if (!res.success) throw new Error(res.error || 'Failed to update project status');
  },

  async deleteProject(id: string): Promise<void> {
    await this.softDelete('projects', id);
  },

  async createMilestone(milestone: Omit<ProjectMilestone, 'id'>): Promise<ProjectMilestone> {
    const payload = {
      project_id: milestone.projectId,
      title: milestone.title,
      due_date: milestone.dueDate || null,
      status: milestone.status,
      progress: milestone.progress,
      amount: milestone.amount,
      invoice_id: milestone.invoiceId || null,
      is_invoiced: milestone.isBilled || false
    };
    const res = await apiClient.post<any>('/crm/project_milestones', payload);
    if (!res.success) throw new Error(res.error || 'Failed to create milestone');
    return mapMilestoneFromDb(res.data || { ...payload, id: res.id, created_at: new Date().toISOString() });
  },

  async createMilestonesBatch(milestones: Omit<ProjectMilestone, 'id'>[]): Promise<ProjectMilestone[]> {
    if (!milestones.length) return [];
    const rows = milestones.map((m, idx) => ({
      id: (m as any).id || `ms_${Date.now()}_${idx}`,
      project_id: m.projectId,
      title: m.title,
      due_date: m.dueDate || null,
      status: m.status,
      progress: m.progress,
      amount: m.amount,
      invoice_id: m.invoiceId || null,
      is_invoiced: m.isBilled || false
    }));
    const res = await apiClient.post<any>('/crm/milestones/batch', { milestones: rows });
    if (!res.success) throw new Error(res.error || 'Failed to batch create milestones');
    return rows.map(r => mapMilestoneFromDb({ ...r, created_at: new Date().toISOString() }));
  },

  async updateMilestone(id: string, updates: Partial<ProjectMilestone>): Promise<void> {
    const payload: any = {};
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.dueDate !== undefined) payload.due_date = updates.dueDate;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.progress !== undefined) payload.progress = updates.progress;
    if (updates.amount !== undefined) payload.amount = updates.amount;
    if (updates.invoiceId !== undefined) payload.invoice_id = updates.invoiceId;
    if (updates.isBilled !== undefined) payload.is_invoiced = updates.isBilled;

    const res = await apiClient.put(`/crm/project_milestones/${id}`, payload);
    if (!res.success) throw new Error(res.error || 'Failed to update milestone');
  },

  async deleteMilestone(id: string): Promise<void> {
    await this.softDelete('project_milestones', id);
  },

  // --- Tasks CRUD ---
  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const payload = {
      title: task.title,
      description: task.description || null,
      client_id: task.clientId || null,
      project_id: task.projectId || null,
      lead_id: task.leadId || null,
      assigned_to: task.assignedTo || null,
      priority: task.priority,
      status: task.status,
      start_date: task.startDate || null,
      due_date: task.dueDate || null,
      estimated_hours: task.estimatedHours,
      actual_hours: task.actualHours
    };
    const res = await apiClient.post<any>('/crm/tasks', payload);
    if (!res.success) throw new Error(res.error || 'Failed to create task');
    return mapTaskFromDb(res.data || { ...payload, id: res.id, created_at: new Date().toISOString() });
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<void> {
    const payload: any = { updated_at: new Date().toISOString() };
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.clientId !== undefined) payload.client_id = updates.clientId;
    if (updates.projectId !== undefined) payload.project_id = updates.projectId;
    if (updates.leadId !== undefined) payload.lead_id = updates.leadId;
    if (updates.assignedTo !== undefined) payload.assigned_to = updates.assignedTo;
    if (updates.priority !== undefined) payload.priority = updates.priority;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.startDate !== undefined) payload.start_date = updates.startDate;
    if (updates.dueDate !== undefined) payload.due_date = updates.dueDate;
    if (updates.estimatedHours !== undefined) payload.estimated_hours = updates.estimatedHours;
    if (updates.actualHours !== undefined) payload.actual_hours = updates.actualHours;

    const res = await apiClient.put(`/crm/tasks/${id}`, payload);
    if (!res.success) throw new Error(res.error || 'Failed to update task');
  },

  async updateTaskStatus(id: string, status: TaskStatus): Promise<void> {
    const res = await apiClient.put(`/crm/tasks/${id}`, { status, updated_at: new Date().toISOString() });
    if (!res.success) throw new Error(res.error || 'Failed to update task status');
  },

  async deleteTask(id: string): Promise<void> {
    await this.softDelete('tasks', id);
  },

  // --- Quotations CRUD ---
  async createQuotation(quotation: Omit<Quotation, 'id' | 'createdAt' | 'updatedAt'>): Promise<Quotation> {
    const isGst = quotation.isGst !== false;
    const payload = {
      quotation_number: quotation.quotationNumber,
      lead_id: quotation.leadId || null,
      lead_name: quotation.leadName || null,
      client_id: quotation.clientId || null,
      client_name: quotation.clientName,
      project_id: quotation.projectId || null,
      project_name: quotation.projectName || null,
      issue_date: quotation.issueDate,
      valid_until: quotation.validUntil,
      items: quotation.items,
      subtotal: quotation.subtotal,
      discount_amount: quotation.discountAmount || 0,
      is_gst: isGst,
      gst_type: isGst ? (quotation.gstType || 'IGST') : null,
      tax_rate: isGst ? (quotation.taxRate ?? 18) : 0,
      tax: quotation.tax,
      cgst: quotation.cgst || 0,
      sgst: quotation.sgst || 0,
      igst: quotation.igst || 0,
      total: quotation.total,
      status: quotation.status,
      converted_invoice_id: quotation.convertedInvoiceId || null,
      converted_at: quotation.convertedAt || null,
      client_gstin: quotation.clientGstin || null,
      hsn_sac_code: quotation.hsnSacCode || (isGst ? '998313' : null),
      notes: quotation.notes || null,
      terms_conditions: quotation.termsConditions || null
    };
    const res = await apiClient.post<any>('/crm/quotations', payload);
    if (!res.success) throw new Error(res.error || 'Failed to create quotation');
    return mapQuotationFromDb(res.data || { ...payload, id: res.id, created_at: new Date().toISOString() });
  },

  async updateQuotation(id: string, updates: Partial<Quotation>): Promise<void> {
    const payload: any = { updated_at: new Date().toISOString() };
    if (updates.quotationNumber !== undefined) payload.quotation_number = updates.quotationNumber;
    if (updates.leadId !== undefined) payload.lead_id = updates.leadId || null;
    if (updates.leadName !== undefined) payload.lead_name = updates.leadName || null;
    if (updates.clientId !== undefined) payload.client_id = updates.clientId || null;
    if (updates.clientName !== undefined) payload.client_name = updates.clientName;
    if (updates.projectId !== undefined) payload.project_id = updates.projectId || null;
    if (updates.projectName !== undefined) payload.project_name = updates.projectName || null;
    if (updates.issueDate !== undefined) payload.issue_date = updates.issueDate;
    if (updates.validUntil !== undefined) payload.valid_until = updates.validUntil;
    if (updates.items !== undefined) payload.items = updates.items;
    if (updates.subtotal !== undefined) payload.subtotal = updates.subtotal;
    if (updates.discountAmount !== undefined) payload.discount_amount = updates.discountAmount;
    if (updates.isGst !== undefined) payload.is_gst = updates.isGst;
    if (updates.gstType !== undefined) payload.gst_type = updates.gstType;
    if (updates.taxRate !== undefined) payload.tax_rate = updates.taxRate;
    if (updates.tax !== undefined) payload.tax = updates.tax;
    if (updates.cgst !== undefined) payload.cgst = updates.cgst;
    if (updates.sgst !== undefined) payload.sgst = updates.sgst;
    if (updates.igst !== undefined) payload.igst = updates.igst;
    if (updates.total !== undefined) payload.total = updates.total;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.convertedInvoiceId !== undefined) payload.converted_invoice_id = updates.convertedInvoiceId || null;
    if (updates.convertedAt !== undefined) payload.converted_at = updates.convertedAt || null;
    if (updates.clientGstin !== undefined) payload.client_gstin = updates.clientGstin || null;
    if (updates.hsnSacCode !== undefined) payload.hsn_sac_code = updates.hsnSacCode || null;
    if (updates.notes !== undefined) payload.notes = updates.notes || null;
    if (updates.termsConditions !== undefined) payload.terms_conditions = updates.termsConditions || null;

    const res = await apiClient.put(`/crm/quotations/${id}`, payload);
    if (!res.success) throw new Error(res.error || 'Failed to update quotation');
  },

  async deleteQuotation(id: string): Promise<void> {
    await this.softDelete('quotations', id);
  },

  // --- Invoices CRUD ---
  async createInvoice(invoice: Omit<Invoice, 'id' | 'createdAt'>): Promise<Invoice> {
    const isGst = invoice.isGst !== false;
    const payload = {
      invoice_number: invoice.invoiceNumber,
      client_id: invoice.clientId || null,
      client_name: invoice.clientName,
      project_id: invoice.projectId || null,
      quotation_id: invoice.quotationId || null,
      quotation_number: invoice.quotationNumber || null,
      issue_date: invoice.issueDate,
      due_date: invoice.dueDate,
      items: invoice.items,
      subtotal: invoice.subtotal,
      discount_amount: invoice.discountAmount || 0,
      is_gst: isGst,
      gst_type: isGst ? (invoice.gstType || 'IGST') : null,
      tax_rate: isGst ? (invoice.taxRate ?? 18) : 0,
      tax: invoice.tax,
      cgst: invoice.cgst || 0,
      sgst: invoice.sgst || 0,
      igst: invoice.igst || 0,
      client_gstin: invoice.clientGstin || null,
      hsn_sac_code: invoice.hsnSacCode || (isGst ? '998313' : null),
      total: invoice.total,
      paid_amount: invoice.paidAmount,
      status: invoice.status,
      notes: invoice.notes || null,
      terms_conditions: invoice.termsConditions || null
    };
    const res = await apiClient.post<any>('/crm/invoices', payload);
    if (!res.success) throw new Error(res.error || 'Failed to create invoice');
    return mapInvoiceFromDb(res.data || { ...payload, id: res.id, created_at: new Date().toISOString() });
  },

  async updateInvoice(id: string, updates: Partial<Invoice>): Promise<void> {
    const payload: any = {};
    if (updates.invoiceNumber !== undefined) payload.invoice_number = updates.invoiceNumber;
    if (updates.clientName !== undefined) payload.client_name = updates.clientName;
    if (updates.clientId !== undefined) payload.client_id = updates.clientId;
    if (updates.projectId !== undefined) payload.project_id = updates.projectId;
    if (updates.quotationId !== undefined) payload.quotation_id = updates.quotationId;
    if (updates.quotationNumber !== undefined) payload.quotation_number = updates.quotationNumber;
    if (updates.issueDate !== undefined) payload.issue_date = updates.issueDate;
    if (updates.dueDate !== undefined) payload.due_date = updates.dueDate;
    if (updates.items !== undefined) payload.items = updates.items;
    if (updates.subtotal !== undefined) payload.subtotal = updates.subtotal;
    if (updates.discountAmount !== undefined) payload.discount_amount = updates.discountAmount;
    if (updates.isGst !== undefined) payload.is_gst = updates.isGst;
    if (updates.gstType !== undefined) payload.gst_type = updates.gstType;
    if (updates.taxRate !== undefined) payload.tax_rate = updates.taxRate;
    if (updates.tax !== undefined) payload.tax = updates.tax;
    if (updates.cgst !== undefined) payload.cgst = updates.cgst;
    if (updates.sgst !== undefined) payload.sgst = updates.sgst;
    if (updates.igst !== undefined) payload.igst = updates.igst;
    if (updates.clientGstin !== undefined) payload.client_gstin = updates.clientGstin;
    if (updates.hsnSacCode !== undefined) payload.hsn_sac_code = updates.hsnSacCode;
    if (updates.total !== undefined) payload.total = updates.total;
    if (updates.paidAmount !== undefined) payload.paid_amount = updates.paidAmount;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.notes !== undefined) payload.notes = updates.notes;
    if (updates.termsConditions !== undefined) payload.terms_conditions = updates.termsConditions;

    const res = await apiClient.put(`/crm/invoices/${id}`, payload);
    if (!res.success) throw new Error(res.error || 'Failed to update invoice');
  },

  async deleteInvoice(id: string): Promise<void> {
    await this.softDelete('invoices', id);
  },

  // --- Payments CRUD ---
  async recordPayment(payment: Omit<Payment, 'id' | 'createdAt'>): Promise<Payment> {
    const payload = {
      invoice_id: payment.invoiceId || null,
      client_id: payment.clientId || null,
      project_id: payment.projectId || null,
      amount: payment.amount,
      payment_date: payment.paymentDate,
      payment_method: payment.paymentMethod,
      transaction_id: payment.transactionId || null,
      status: payment.status,
      notes: payment.notes || null
    };
    const res = await apiClient.post<any>('/crm/payments', payload);
    if (!res.success) throw new Error(res.error || 'Failed to record payment');
    return mapPaymentFromDb(res.data || { ...payload, id: res.id, created_at: new Date().toISOString() });
  },

  async deletePayment(id: string): Promise<void> {
    const res = await apiClient.delete(`/crm/payments/${id}`);
    if (!res.success) throw new Error(res.error || 'Failed to delete payment');
  },

  // --- Expenses CRUD ---
  async createExpense(expense: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense> {
    const payload = {
      category: expense.category,
      amount: expense.amount,
      expense_date: expense.expenseDate,
      vendor: expense.vendor || null,
      description: expense.description,
      payment_method: expense.paymentMethod || null,
      client_id: expense.clientId || null,
      project_id: expense.projectId || null,
      approved_by: expense.approvedBy || null,
      status: expense.status
    };
    const res = await apiClient.post<any>('/crm/expenses', payload);
    if (!res.success) throw new Error(res.error || 'Failed to create expense');
    return mapExpenseFromDb(res.data || { ...payload, id: res.id, created_at: new Date().toISOString() });
  },

  async deleteExpense(id: string): Promise<void> {
    await this.softDelete('expenses', id);
  },

  // --- Agreements CRUD ---
  async createAgreement(agreement: Omit<Agreement, 'id' | 'createdAt'>): Promise<Agreement> {
    const payload = {
      name: agreement.name,
      agreement_type: agreement.agreementType,
      client_id: agreement.clientId || null,
      project_id: agreement.projectId || null,
      lead_id: agreement.leadId || null,
      start_date: agreement.startDate || null,
      expiry_date: agreement.expiryDate || null,
      commercial_value: agreement.commercialValue,
      status: agreement.status,
      signed_date: agreement.signedDate || null,
      file_url: agreement.fileUrl || null
    };
    const res = await apiClient.post<any>('/crm/agreements', payload);
    if (!res.success) throw new Error(res.error || 'Failed to create agreement');
    return mapAgreementFromDb(res.data || { ...payload, id: res.id, created_at: new Date().toISOString() });
  },

  async updateAgreement(id: string, updates: Partial<Agreement>): Promise<void> {
    const payload: any = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.agreementType !== undefined) payload.agreement_type = updates.agreementType;
    if (updates.clientId !== undefined) payload.client_id = updates.clientId;
    if (updates.projectId !== undefined) payload.project_id = updates.projectId;
    if (updates.leadId !== undefined) payload.lead_id = updates.leadId;
    if (updates.commercialValue !== undefined) payload.commercial_value = updates.commercialValue;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.signedDate !== undefined) payload.signed_date = updates.signedDate;
    if (updates.fileUrl !== undefined) payload.file_url = updates.fileUrl;

    const res = await apiClient.put(`/crm/agreements/${id}`, payload);
    if (!res.success) throw new Error(res.error || 'Failed to update agreement');
  },

  async deleteAgreement(id: string): Promise<void> {
    await this.softDelete('agreements', id);
  },

  // --- Documents CRUD ---
  async createDocument(doc: Omit<DocumentItem, 'id' | 'createdAt'>): Promise<DocumentItem> {
    const payload = {
      title: doc.title,
      doc_type: doc.docType,
      client_id: doc.clientId || null,
      project_id: doc.projectId || null,
      lead_id: doc.leadId || null,
      file_url: doc.fileUrl,
      file_size: doc.fileSize,
      uploaded_by: doc.uploadedBy
    };
    const res = await apiClient.post<any>('/crm/documents', payload);
    if (!res.success) throw new Error(res.error || 'Failed to create document');
    return mapDocumentFromDb(res.data || { ...payload, id: res.id, created_at: new Date().toISOString() });
  },

  async deleteDocument(id: string): Promise<void> {
    await this.softDelete('documents', id);
  },

  // --- Credentials Vault CRUD ---
  async createCredential(cred: Omit<CredentialVaultItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<CredentialVaultItem> {
    const payload = {
      platform_name: cred.platformName,
      service_url: cred.serviceUrl || null,
      username: cred.username || null,
      password_encrypted: cred.passwordEncrypted || null,
      api_key_encrypted: cred.apiKeyEncrypted || null,
      client_id: cred.clientId || null,
      project_id: cred.projectId || null,
      notes: cred.notes || null,
      access_roles: cred.accessRoles || ['Super Admin', 'Admin', 'Developer'],
      environment: cred.environment || 'Production',
      status: cred.status || 'Active'
    };
    const res = await apiClient.post<any>('/crm/credentials_vault', payload);
    if (!res.success) throw new Error(res.error || 'Failed to create credential');
    const mapped = mapCredentialFromDb(res.data || { ...payload, id: res.id, created_at: new Date().toISOString() });
    return {
      ...mapped,
      clientName: cred.clientName || mapped.clientName,
      projectName: cred.projectName || mapped.projectName
    };
  },

  async updateCredential(id: string, updates: Partial<CredentialVaultItem>): Promise<void> {
    const payload: any = { updated_at: new Date().toISOString() };
    if (updates.platformName !== undefined) payload.platform_name = updates.platformName;
    if (updates.serviceUrl !== undefined) payload.service_url = updates.serviceUrl || null;
    if (updates.username !== undefined) payload.username = updates.username || null;
    if (updates.passwordEncrypted !== undefined) payload.password_encrypted = updates.passwordEncrypted || null;
    if (updates.apiKeyEncrypted !== undefined) payload.api_key_encrypted = updates.apiKeyEncrypted || null;
    if (updates.clientId !== undefined) payload.client_id = updates.clientId || null;
    if (updates.projectId !== undefined) payload.project_id = updates.projectId || null;
    if (updates.notes !== undefined) payload.notes = updates.notes || null;
    if (updates.accessRoles !== undefined) payload.access_roles = updates.accessRoles;
    if (updates.environment !== undefined) payload.environment = updates.environment;
    if (updates.status !== undefined) payload.status = updates.status;

    const res = await apiClient.put(`/crm/credentials_vault/${id}`, payload);
    if (!res.success) throw new Error(res.error || 'Failed to update credential');
  },

  async deleteCredential(id: string): Promise<void> {
    await this.softDelete('credentials_vault', id);
  },

  // --- Calendar Events CRUD ---
  async createCalendarEvent(event: Omit<CalendarEvent, 'id' | 'createdAt'>): Promise<CalendarEvent> {
    const payload = {
      title: event.title,
      event_type: event.eventType,
      start_time: event.startTime,
      end_time: event.endTime || null,
      location: event.location || null,
      participants: event.participants,
      related_client_id: event.relatedClientId || null,
      related_project_id: event.relatedProjectId || null,
      related_lead_id: event.relatedLeadId || null,
      notes: event.notes || null
    };
    const res = await apiClient.post<any>('/crm/calendar_events', payload);
    if (!res.success) throw new Error(res.error || 'Failed to create calendar event');
    return mapCalendarEventFromDb(res.data || { ...payload, id: res.id, created_at: new Date().toISOString() });
  },

  async deleteCalendarEvent(id: string): Promise<void> {
    await this.softDelete('calendar_events', id);
  },

  // --- Team Profile CRUD ---
  async createProfile(profile: Omit<UserProfile, 'id'>): Promise<UserProfile> {
    const payload = {
      email: profile.email.trim().toLowerCase(),
      full_name: profile.fullName,
      role: profile.role,
      department: profile.department,
      phone: profile.phone || null,
      password_hash: profile.passwordHash || null,
      is_active: profile.isActive !== false,
      permissions: profile.permissions || {},
      avatar_url: profile.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(profile.fullName)}`
    };
    const res = await apiClient.post<any>('/crm/profiles', payload);
    if (!res.success) throw new Error(res.error || 'Failed to create profile');
    return mapProfileFromDb(res.data || { ...payload, id: res.id, created_at: new Date().toISOString() });
  },

  async updateProfile(id: string, updates: Partial<UserProfile>): Promise<void> {
    const payload: any = { updated_at: new Date().toISOString() };
    if (updates.fullName !== undefined) payload.full_name = updates.fullName;
    if (updates.email !== undefined) payload.email = updates.email.trim().toLowerCase();
    if (updates.role !== undefined) payload.role = updates.role;
    if (updates.department !== undefined) payload.department = updates.department;
    if (updates.avatarUrl !== undefined) payload.avatar_url = updates.avatarUrl;
    if (updates.phone !== undefined) payload.phone = updates.phone;
    if (updates.passwordHash !== undefined) payload.password_hash = updates.passwordHash;
    if (updates.isActive !== undefined) payload.is_active = updates.isActive;
    if (updates.permissions !== undefined) payload.permissions = updates.permissions;

    const res = await apiClient.put(`/crm/profiles/${id}`, payload);
    if (!res.success) throw new Error(res.error || 'Failed to update profile');
  },

  async resetStaffPassword(id: string, newPassword: string): Promise<void> {
    const res = await apiClient.put(`/crm/profiles/${id}`, {
      password_hash: newPassword,
      updated_at: new Date().toISOString()
    });
    if (!res.success) throw new Error(res.error || 'Failed to reset staff password');
  },

  async toggleStaffStatus(id: string, isActive: boolean): Promise<void> {
    const res = await apiClient.put(`/crm/profiles/${id}`, {
      is_active: isActive,
      updated_at: new Date().toISOString()
    });
    if (!res.success) throw new Error(res.error || 'Failed to update staff status');
  },

  async updateProfileRole(id: string, role: UserRole): Promise<void> {
    const res = await apiClient.put(`/crm/profiles/${id}`, {
      role,
      updated_at: new Date().toISOString()
    });
    if (!res.success) throw new Error(res.error || 'Failed to update profile role');
  },

  async deleteProfile(id: string): Promise<void> {
    const res = await apiClient.delete(`/crm/profiles/${id}`);
    if (!res.success) throw new Error(res.error || 'Failed to delete profile');
  },

  // --- Notifications ---
  async markNotificationRead(id: string): Promise<void> {
    const res = await apiClient.put(`/crm/notifications/${id}`, { is_read: true });
    if (!res.success) throw new Error(res.error || 'Failed to mark notification read');
  },

  async markAllNotificationsRead(): Promise<void> {
    const res = await apiClient.put('/crm/notifications/all/read', {});
    if (!res.success) {
      console.warn('Mark all notifications error:', res.error);
    }
  },

  async createNotification(notif: { title: string; message: string; type?: string; userId?: string }): Promise<NotificationItem> {
    const payload = {
      title: notif.title,
      message: notif.message,
      notification_type: notif.type || 'info',
      user_id: notif.userId || null,
      is_read: false
    };
    const res = await apiClient.post<any>('/crm/notifications', payload);
    if (!res.success) throw new Error(res.error || 'Failed to create notification');
    return mapNotificationFromDb(res.data || { ...payload, id: res.id, created_at: new Date().toISOString() });
  },

  // --- Audit Logs ---
  async createAuditLog(log: Omit<AuditLog, 'id' | 'createdAt'>): Promise<AuditLog> {
    const payload = {
      user_name: log.userName,
      user_role: log.userRole,
      action_type: log.actionType,
      entity_type: log.entityType,
      entity_id: log.entityId || null,
      description: log.description,
      before_state: log.beforeState || null,
      after_state: log.afterState || null
    };
    const res = await apiClient.post<any>('/crm/audit_logs', payload);
    if (!res.success) throw new Error(res.error || 'Failed to create audit log');
    return mapAuditLogFromDb(res.data || { ...payload, id: res.id, created_at: new Date().toISOString() });
  },

  // --- Project Issues / Client Tickets ---
  async fetchAllIssues(): Promise<ProjectIssue[]> {
    try {
      const res = await apiClient.get<any>('/crm/project_issues');
      if (res && res.success && Array.isArray(res.data)) {
        return res.data.map(mapIssueFromDb);
      }
    } catch (_) {}
    return [];
  },

  async createIssue(issue: Omit<ProjectIssue, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProjectIssue> {
    const payload = {
      project_id: issue.projectId,
      project_name: issue.projectName || null,
      client_id: issue.clientId || null,
      client_name: issue.clientName || null,
      ticket_number: issue.ticketNumber,
      title: issue.title,
      description: issue.description,
      issue_type: issue.issueType,
      priority: issue.priority,
      status: issue.status,
      reporter_name: issue.reporterName,
      reporter_email: issue.reporterEmail,
      reporter_phone: issue.reporterPhone || null,
      attachments: issue.attachments || [],
      admin_notes: issue.adminNotes || null,
      resolution_notes: issue.resolutionNotes || null,
      assigned_to: issue.assignedTo || null,
      resolved_at: issue.resolvedAt || null
    };
    const res = await apiClient.post<any>('/crm/project_issues', payload);
    if (!res.success) throw new Error(res.error || 'Failed to create issue');
    return mapIssueFromDb(res.data || { ...payload, id: res.id, created_at: new Date().toISOString() });
  },

  async updateIssue(id: string, updates: Partial<ProjectIssue>): Promise<void> {
    const payload: any = { updated_at: new Date().toISOString() };
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.issueType !== undefined) payload.issue_type = updates.issueType;
    if (updates.priority !== undefined) payload.priority = updates.priority;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.adminNotes !== undefined) payload.admin_notes = updates.adminNotes;
    if (updates.resolutionNotes !== undefined) payload.resolution_notes = updates.resolutionNotes;
    if (updates.assignedTo !== undefined) payload.assigned_to = updates.assignedTo;
    if (updates.resolvedAt !== undefined) payload.resolved_at = updates.resolvedAt;
    if (updates.attachments !== undefined) payload.attachments = updates.attachments;

    const res = await apiClient.put(`/crm/project_issues/${id}`, payload);
    if (!res.success) throw new Error(res.error || 'Failed to update issue');
  },

  async deleteIssue(id: string): Promise<void> {
    await this.softDelete('project_issues', id);
  },

  // --- Partners CRUD ---
  async fetchPartners(): Promise<Partner[]> {
    try {
      const res = await apiClient.get<any>('/crm/partners');
      if (res && res.success && Array.isArray(res.data)) {
        return res.data.map(mapPartnerFromDb);
      }
    } catch (err) {
      console.warn('fetchPartners error:', err);
    }
    return [];
  },

  async createPartner(partner: Omit<Partner, 'id' | 'createdAt' | 'updatedAt'>): Promise<Partner> {
    const payload = {
      user_id: partner.userId || null,
      name: partner.name,
      email: partner.email,
      company: partner.company || null,
      phone: partner.phone || null,
      referral_code: partner.referralCode,
      commission_rate: partner.commissionRate || 0.10,
      status: partner.status || 'Active',
      payout_method: partner.payoutMethod || 'UPI',
      payout_details: partner.payoutDetails || {},
      total_earnings: partner.totalEarnings || 0,
      paid_earnings: partner.paidEarnings || 0,
      pending_earnings: partner.pendingEarnings || 0,
      notes: partner.notes || null,
      last_login_at: partner.lastLoginAt || new Date().toISOString(),
      terms_accepted: partner.termsAccepted ? 1 : 0,
      terms_accepted_at: partner.termsAcceptedAt || null,
      terms_version: partner.termsVersion || '1.0',
      is_custom_rate: partner.isCustomRate ? 1 : 0,
      custom_commission_rate: partner.customCommissionRate || null,
      custom_rate_reason: partner.customRateReason || null,
      custom_rate_set_at: partner.customRateSetAt || null,
      custom_rate_set_by: partner.customRateSetBy || null
    };
    const res = await apiClient.post<any>('/crm/partners', payload);
    if (!res.success) throw new Error(res.error || 'Failed to create partner');
    return mapPartnerFromDb(res.data || { ...payload, id: res.id, created_at: new Date().toISOString() });
  },

  async updatePartner(id: string, updates: Partial<Partner>): Promise<void> {
    const payload: any = { updated_at: new Date().toISOString() };
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.email !== undefined) payload.email = updates.email;
    if (updates.company !== undefined) payload.company = updates.company;
    if (updates.phone !== undefined) payload.phone = updates.phone;
    if (updates.commissionRate !== undefined) payload.commission_rate = updates.commissionRate;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.payoutMethod !== undefined) payload.payout_method = updates.payoutMethod;
    if (updates.payoutDetails !== undefined) payload.payout_details = updates.payoutDetails;
    if (updates.totalEarnings !== undefined) payload.total_earnings = updates.totalEarnings;
    if (updates.paidEarnings !== undefined) payload.paid_earnings = updates.paidEarnings;
    if (updates.pendingEarnings !== undefined) payload.pending_earnings = updates.pendingEarnings;
    if (updates.notes !== undefined) payload.notes = updates.notes;
    if (updates.lastLoginAt !== undefined) payload.last_login_at = updates.lastLoginAt;
    if (updates.termsAccepted !== undefined) payload.terms_accepted = updates.termsAccepted ? 1 : 0;
    if (updates.termsAcceptedAt !== undefined) payload.terms_accepted_at = updates.termsAcceptedAt;
    if (updates.termsVersion !== undefined) payload.terms_version = updates.termsVersion;
    if (updates.isCustomRate !== undefined) payload.is_custom_rate = updates.isCustomRate ? 1 : 0;
    if (updates.customCommissionRate !== undefined) payload.custom_commission_rate = updates.customCommissionRate;
    if (updates.customRateReason !== undefined) payload.custom_rate_reason = updates.customRateReason;
    if (updates.customRateSetAt !== undefined) payload.custom_rate_set_at = updates.customRateSetAt;
    if (updates.customRateSetBy !== undefined) payload.custom_rate_set_by = updates.customRateSetBy;
    if ((updates as any).passwordHash !== undefined) payload.password_hash = (updates as any).passwordHash;

    const res = await apiClient.put(`/crm/partners/${id}`, payload);
    if (!res.success) throw new Error(res.error || 'Failed to update partner');
  },

  async deletePartner(id: string): Promise<void> {
    await this.softDelete('partners', id);
  },

  // --- Partner Referrals CRUD ---
  async fetchPartnerReferrals(partnerId?: string): Promise<PartnerReferral[]> {
    try {
      const res = await apiClient.get<any>('/crm/partner_referrals');
      if (res && res.success && Array.isArray(res.data)) {
        const filtered = partnerId ? res.data.filter((r: any) => r.partner_id === partnerId) : res.data;
        return filtered.map((r: any) => mapPartnerReferralFromDb(r));
      }
    } catch (err) {
      console.warn('fetchPartnerReferrals error:', err);
    }
    return [];
  },

  async createPartnerReferral(referral: Omit<PartnerReferral, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<PartnerReferral> {
    const insertPayload: any = {
      partner_id: referral.partnerId,
      lead_id: referral.leadId || null,
      client_id: referral.clientId || null,
      project_id: referral.projectId || null,
      client_name: referral.clientName,
      client_email: referral.clientEmail || null,
      client_phone: referral.clientPhone || null,
      company: referral.company || null,
      project_type: referral.projectType || 'AI Automation',
      deal_value: referral.dealValue || 0,
      total_paid: referral.totalPaid || 0,
      pending_payment: referral.pendingPayment || 0,
      deal_status: referral.dealStatus || 'NEW',
      payment_status: referral.paymentStatus || 'Pending',
      commission_rate: referral.commissionRate || 0.10,
      commission_earned: referral.commissionEarned || 0,
      commission_paid: referral.commissionPaid || 0,
      notes: referral.notes || null
    };
    if (referral.id) insertPayload.id = referral.id;
    const res = await apiClient.post<any>('/crm/partner_referrals', insertPayload);
    if (!res.success) throw new Error(res.error || 'Failed to create partner referral');
    return mapPartnerReferralFromDb(res.data || { ...insertPayload, id: res.id, created_at: new Date().toISOString() });
  },

  async updatePartnerReferral(id: string, updates: Partial<PartnerReferral>): Promise<void> {
    const payload: any = { updated_at: new Date().toISOString() };
    if (updates.leadId !== undefined) payload.lead_id = updates.leadId;
    if (updates.clientId !== undefined) payload.client_id = updates.clientId;
    if (updates.projectId !== undefined) payload.project_id = updates.projectId;
    if (updates.clientName !== undefined) payload.client_name = updates.clientName;
    if (updates.clientEmail !== undefined) payload.client_email = updates.clientEmail;
    if (updates.clientPhone !== undefined) payload.client_phone = updates.clientPhone;
    if (updates.company !== undefined) payload.company = updates.company;
    if (updates.dealValue !== undefined) payload.deal_value = updates.dealValue;
    if (updates.totalPaid !== undefined) payload.total_paid = updates.totalPaid;
    if (updates.pendingPayment !== undefined) payload.pending_payment = updates.pendingPayment;
    if (updates.dealStatus !== undefined) payload.deal_status = updates.dealStatus;
    if (updates.paymentStatus !== undefined) payload.payment_status = updates.paymentStatus;
    if (updates.commissionRate !== undefined) payload.commission_rate = updates.commissionRate;
    if (updates.commissionEarned !== undefined) payload.commission_earned = updates.commissionEarned;
    if (updates.commissionPaid !== undefined) payload.commission_paid = updates.commissionPaid;
    if (updates.notes !== undefined) payload.notes = updates.notes;

    const res = await apiClient.put(`/crm/partner_referrals/${id}`, payload);
    if (!res.success) throw new Error(res.error || 'Failed to update partner referral');
  },

  async deletePartnerReferral(id: string): Promise<void> {
    await this.softDelete('partner_referrals', id);
  },

  // --- Partner Payouts CRUD ---
  async fetchPartnerPayouts(partnerId?: string): Promise<PartnerPayout[]> {
    try {
      const res = await apiClient.get<any>('/crm/partner_payouts');
      if (res && res.success && Array.isArray(res.data)) {
        const filtered = partnerId ? res.data.filter((r: any) => r.partner_id === partnerId) : res.data;
        return filtered.map((p: any) => mapPartnerPayoutFromDb(p));
      }
    } catch (err) {
      console.warn('fetchPartnerPayouts error:', err);
    }
    return [];
  },

  async createPartnerPayout(payout: Omit<PartnerPayout, 'id' | 'createdAt'>): Promise<PartnerPayout> {
    const payload = {
      partner_id: payout.partnerId,
      amount: payout.amount,
      payout_date: payout.payoutDate,
      payment_method: payout.paymentMethod || 'UPI',
      transaction_ref: payout.transactionRef || null,
      status: payout.status || 'Completed',
      notes: payout.notes || null
    };
    const res = await apiClient.post<any>('/crm/partner_payouts', payload);
    if (!res.success) throw new Error(res.error || 'Failed to create partner payout');
    return mapPartnerPayoutFromDb(res.data || { ...payload, id: res.id, created_at: new Date().toISOString() });
  },

  async updatePartnerPayout(id: string, updates: Partial<PartnerPayout>): Promise<void> {
    const payload: Record<string, any> = {};
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.amount !== undefined) payload.amount = updates.amount;
    if (updates.paymentMethod !== undefined) payload.payment_method = updates.paymentMethod;
    if (updates.transactionRef !== undefined) payload.transaction_ref = updates.transactionRef;
    if (updates.notes !== undefined) payload.notes = updates.notes;
    if (updates.payoutDate !== undefined) payload.payout_date = updates.payoutDate;

    const res = await apiClient.put(`/crm/partner_payouts/${id}`, payload);
    if (!res.success) throw new Error(res.error || 'Failed to update partner payout');
  },

  async findPartnerByCode(code: string): Promise<Partner | null> {
    try {
      if (!code || !code.trim()) return null;
      const cleanCode = code.trim().toUpperCase();
      const res = await apiClient.get<any>('/crm/partners');
      if (res && res.success && Array.isArray(res.data)) {
        const row = res.data.find((p: any) => (p.referral_code || '').toUpperCase() === cleanCode);
        if (row) return mapPartnerFromDb(row);
      }
      return null;
    } catch (err) {
      console.warn('findPartnerByCode error:', err);
      return null;
    }
  },

  // --- Client Portal Data & Interactivity ---
  async fetchClientPortalData(token: string): Promise<{
    project: Project;
    client: Client;
    milestones: ProjectMilestone[];
    invoices: Invoice[];
    issues: ProjectIssue[];
    documents: DocumentItem[];
  } | null> {
    try {
      if (!token || !token.trim()) return null;
      const res = await apiClient.get<any>(`/portal/${encodeURIComponent(token.trim())}`);
      if (!res || !res.success || !res.data) return null;
      const d = res.data;
      const mappedClient = mapClientFromDb(d.client);
      const mappedProject = mapProjectFromDb(d.project);
      return {
        project: mappedProject,
        client: mappedClient,
        milestones: (d.milestones || []).map((m: any) => mapMilestoneFromDb(m)),
        invoices: (d.invoices || []).map((i: any) => mapInvoiceFromDb(i)),
        issues: (d.issues || []).map((iss: any) => mapIssueFromDb(iss)),
        documents: (d.documents || []).map((doc: any) => mapDocumentFromDb(doc, [mappedClient], [mappedProject], []))
      };
    } catch (err) {
      console.error('fetchClientPortalData error:', err);
      return null;
    }
  },

  async updateMilestoneInvoiced(id: string, isInvoiced: boolean, invoiceId?: string): Promise<void> {
    try {
      await apiClient.put(`/crm/project_milestones/${id}`, {
        is_invoiced: isInvoiced,
        invoice_id: invoiceId || null
      });
    } catch (err) {
      console.warn('updateMilestoneInvoiced error:', err);
    }
  },

  async revertPaymentBalances(payment: Payment): Promise<void> {
    try {
      // Revert invoice
      if (payment.invoiceId) {
        const invRes = await apiClient.get<any>('/crm/invoices');
        const inv = (invRes?.data || []).find((i: any) => i.id === payment.invoiceId);
        if (inv) {
          const currentPaid = Number(inv.paid_amount || 0);
          const newPaid = Math.max(0, currentPaid - Number(payment.amount));
          const total = Number(inv.total || 0);
          let newStatus = 'SENT';
          if (newPaid >= total && total > 0) newStatus = 'PAID';
          else if (newPaid > 0) newStatus = 'PARTIALLY_PAID';
          await apiClient.put(`/crm/invoices/${payment.invoiceId}`, { paid_amount: newPaid, status: newStatus });
        }
      }

      // Revert client
      if (payment.clientId) {
        const clRes = await apiClient.get<any>('/crm/clients');
        const cl = (clRes?.data || []).find((c: any) => c.id === payment.clientId);
        if (cl) {
          const currentPaid = Number(cl.total_paid || 0);
          const currentVal = Number(cl.total_value || 0);
          const newPaid = Math.max(0, currentPaid - Number(payment.amount));
          const newOutstanding = Math.max(0, currentVal - newPaid);
          await apiClient.put(`/crm/clients/${payment.clientId}`, { total_paid: newPaid, outstanding_amount: newOutstanding });
        }
      }

      // Revert project
      if (payment.projectId) {
        const prjRes = await apiClient.get<any>('/crm/projects');
        const prj = (prjRes?.data || []).find((p: any) => p.id === payment.projectId);
        if (prj) {
          const currentPaid = Number(prj.received_amount || prj.paid_amount || 0);
          const newPaid = Math.max(0, currentPaid - Number(payment.amount));
          await apiClient.put(`/crm/projects/${payment.projectId}`, { received_amount: newPaid, paid_amount: newPaid });
        }
      }
    } catch (err) {
      console.warn('revertPaymentBalances error:', err);
    }
  },

  subscribeToChanges(onUpdate: (table: string, payload: any) => void) {
    // MySQL REST connection uses optimistic updates & manual/polling refresh
    return () => {};
  }
};
