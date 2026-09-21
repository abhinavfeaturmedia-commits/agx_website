// TypeScript definitions for AGX CRM & Business Operating System

export type UserRole = 
  | 'Super Admin' 
  | 'Admin' 
  | 'Sales Manager' 
  | 'Sales Executive' 
  | 'Project Manager' 
  | 'Developer' 
  | 'Accountant';

export type CrmModuleKey = 
  | 'dashboard'
  | 'leads'
  | 'clients'
  | 'projects'
  | 'tasks'
  | 'issues'
  | 'finance'
  | 'partners'
  | 'documents'
  | 'vault'
  | 'calendar'
  | 'analytics'
  | 'audit'
  | 'settings';

export interface ModulePermissions {
  dashboard?: boolean;
  leads?: boolean;
  clients?: boolean;
  projects?: boolean;
  tasks?: boolean;
  issues?: boolean;
  finance?: boolean;
  partners?: boolean;
  documents?: boolean;
  vault?: boolean;
  calendar?: boolean;
  analytics?: boolean;
  audit?: boolean;
  settings?: boolean;
}

export const ROLE_DEFAULT_PERMISSIONS: Record<UserRole, Record<CrmModuleKey, boolean>> = {
  'Super Admin': {
    dashboard: true,
    leads: true,
    clients: true,
    projects: true,
    tasks: true,
    issues: true,
    finance: true,
    partners: true,
    documents: true,
    vault: true,
    calendar: true,
    analytics: true,
    audit: true,
    settings: true
  },
  'Admin': {
    dashboard: true,
    leads: true,
    clients: true,
    projects: true,
    tasks: true,
    issues: true,
    finance: true,
    partners: true,
    documents: true,
    vault: true,
    calendar: true,
    analytics: true,
    audit: true,
    settings: true
  },
  'Sales Manager': {
    dashboard: true,
    leads: true,
    clients: true,
    projects: false,
    tasks: true,
    issues: true,
    finance: false,
    partners: true,
    documents: true,
    vault: false,
    calendar: true,
    analytics: true,
    audit: false,
    settings: false
  },
  'Sales Executive': {
    dashboard: true,
    leads: true,
    clients: true,
    projects: false,
    tasks: true,
    issues: false,
    finance: false,
    partners: false,
    documents: true,
    vault: false,
    calendar: true,
    analytics: false,
    audit: false,
    settings: false
  },
  'Project Manager': {
    dashboard: true,
    leads: false,
    clients: true,
    projects: true,
    tasks: true,
    issues: true,
    finance: false,
    partners: false,
    documents: true,
    vault: true,
    calendar: true,
    analytics: true,
    audit: false,
    settings: false
  },
  'Developer': {
    dashboard: true,
    leads: false,
    clients: false,
    projects: true,
    tasks: true,
    issues: true,
    finance: false,
    partners: false,
    documents: false,
    vault: false,
    calendar: true,
    analytics: false,
    audit: false,
    settings: false
  },
  'Accountant': {
    dashboard: true,
    leads: false,
    clients: true,
    projects: false,
    tasks: false,
    issues: false,
    finance: true,
    partners: true,
    documents: true,
    vault: false,
    calendar: true,
    analytics: true,
    audit: false,
    settings: false
  }
};

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  department?: string;
  passwordHash?: string;
  isActive?: boolean;
  permissions?: ModulePermissions;
  lastActiveAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type LeadStatus = 
  | 'NEW' 
  | 'CONTACTED' 
  | 'QUALIFIED' 
  | 'PROPOSAL SENT' 
  | 'NEGOTIATION' 
  | 'WON' 
  | 'LOST';

export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type LeadActivityType = 'Call' | 'WhatsApp' | 'Email' | 'Meeting' | 'Note' | 'Status Change';

export interface LeadActivity {
  id: string;
  leadId: string;
  userName: string;
  activityType: LeadActivityType;
  notes: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  whatsapp?: string;
  location?: string;
  interestedService: string;
  estimatedDealValue: number;
  probability: number;
  source: string;
  assignedTo: string;
  priority: Priority;
  status: LeadStatus;
  nextFollowUp?: string;
  lastContacted?: string;
  notes?: string;
  lossReason?: string;
  partnerId?: string;
  partnerName?: string;
  partnerCode?: string;
  convertedClientId?: string;
  convertedProjectId?: string;
  activities?: LeadActivity[];
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  website?: string;
  address?: string;
  industry?: string;
  gstTaxId?: string;
  accountManager: string;
  partnerId?: string;
  partnerName?: string;
  partnerCode?: string;
  totalValue: number;
  totalPaid: number;
  outstandingAmount: number;
  source: string;
  notes?: string;
  status: 'Active' | 'Inactive' | 'On Hold';
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus = 
  | 'NOT STARTED' 
  | 'PLANNING' 
  | 'IN PROGRESS' 
  | 'TESTING' 
  | 'CLIENT REVIEW' 
  | 'REVISION' 
  | 'COMPLETED' 
  | 'MAINTENANCE';

export interface ProjectMilestone {
  id: string;
  projectId: string;
  title: string;
  dueDate: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  progress: number;
  amount: number;
  invoiceId?: string;
  isBilled?: boolean;
}

export interface Project {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  serviceType: string;
  projectManager: string;
  assignedTeam: string[];
  startDate: string;
  dueDate: string;
  deliveryDate?: string;
  projectValue: number;
  receivedAmount: number;
  pendingAmount: number;
  status: ProjectStatus;
  priority: Priority;
  progress: number; // 0 to 100
  description?: string;
  milestones?: ProjectMilestone[];
  portalToken?: string; // unique URL-safe token for client issue upload
  portalEnabled?: boolean; // whether client issue portal is enabled
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = 'TO DO' | 'IN PROGRESS' | 'IN REVIEW' | 'COMPLETED' | 'BLOCKED';

export interface Task {
  id: string;
  title: string;
  description?: string;
  clientId?: string;
  clientName?: string;
  projectId?: string;
  projectName?: string;
  leadId?: string;
  leadName?: string;
  assignedTo: string;
  priority: Priority;
  status: TaskStatus;
  startDate?: string;
  dueDate: string;
  estimatedHours: number;
  actualHours: number;
  originIssueId?: string;
  createdAt: string;
  updatedAt: string;
}

export type GstType = 'IGST' | 'CGST_SGST';

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  hsnSac?: string;
}

export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid' | 'Partially Paid' | 'Overdue';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  projectId?: string;
  projectName?: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  isGst?: boolean;
  gstType?: GstType;
  taxRate?: number;
  tax: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  clientGstin?: string;
  hsnSacCode?: string;
  total: number;
  paidAmount: number;
  status: InvoiceStatus;
  notes?: string;
  createdAt: string;
}

export type PaymentStatus = 'Pending' | 'Partially Paid' | 'Paid' | 'Overdue' | 'Refunded';

export interface Payment {
  id: string;
  invoiceId?: string;
  invoiceNumber?: string;
  clientId: string;
  clientName: string;
  projectId?: string;
  projectName?: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  transactionId?: string;
  status: PaymentStatus;
  notes?: string;
  createdAt: string;
}

export type ExpenseCategory = 
  | 'Developer Cost' 
  | 'SaaS Tools' 
  | 'Infrastructure/Cloud' 
  | 'Marketing/Ads' 
  | 'Office' 
  | 'Other';

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  expenseDate: string;
  vendor: string;
  description: string;
  paymentMethod?: string;
  clientId?: string;
  clientName?: string;
  projectId?: string;
  projectName?: string;
  approvedBy?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
}

export type AgreementType = 'Master Service Agreement' | 'NDA' | 'Statement of Work' | 'Retainer' | 'Proposal';
export type AgreementStatus = 'Draft' | 'Sent' | 'Signed' | 'Expired' | 'Cancelled';

export interface Agreement {
  id: string;
  name: string;
  agreementType: AgreementType;
  clientId?: string;
  clientName: string;
  projectId?: string;
  projectName?: string;
  leadId?: string;
  leadName?: string;
  startDate: string;
  expiryDate: string;
  commercialValue: number;
  status: AgreementStatus;
  signedDate?: string;
  fileUrl?: string;
  createdAt: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  docType: 'Contract' | 'NDA' | 'Proposal' | 'Specification' | 'Invoice' | 'Design' | 'Other';
  clientId?: string;
  clientName?: string;
  projectId?: string;
  projectName?: string;
  leadId?: string;
  leadName?: string;
  fileUrl: string;
  fileSize: string;
  uploadedBy: string;
  createdAt: string;
}

export interface CredentialVaultItem {
  id: string;
  platformName: string;
  serviceUrl?: string;
  username: string;
  passwordEncrypted: string;
  apiKeyEncrypted?: string;
  clientId?: string;
  clientName?: string;
  projectId?: string;
  projectName?: string;
  notes?: string;
  accessRoles: UserRole[];
  environment?: 'Production' | 'Staging' | 'Sandbox';
  status?: 'Active' | 'Pending Sync' | 'Client Uploaded';
  createdAt: string;
  updatedAt: string;
}

export type CalendarEventType = 
  | 'Meeting' 
  | 'Client Follow-up' 
  | 'Project Deadline' 
  | 'Task Due' 
  | 'Payment Reminder' 
  | 'Agreement Expiry';

export interface CalendarEvent {
  id: string;
  title: string;
  eventType: CalendarEventType;
  startTime: string;
  endTime?: string;
  location?: string;
  participants: string[];
  relatedClientId?: string;
  relatedProjectId?: string;
  relatedLeadId?: string;
  relatedLeadName?: string;
  notes?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId?: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'urgent';
  isRead: boolean;
  link?: string;
  timeAgo?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userName: string;
  userRole: UserRole;
  actionType: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE' | 'REVEAL_SECRET' | 'CONVERT_LEAD' | 'PAYMENT_RECORDED';
  entityType: 'User' | 'Lead' | 'Client' | 'Project' | 'Task' | 'Invoice' | 'Payment' | 'Expense' | 'Credential' | 'Agreement' | 'Issue' | 'Partner';
  entityId?: string;
  description: string;
  beforeState?: any;
  afterState?: any;
  createdAt: string;
}

export type IssueStatus = 'REPORTED' | 'IN REVIEW' | 'IN PROGRESS' | 'RESOLVED' | 'CLOSED';
export type IssueType = 'Bug' | 'UI/UX Polish' | 'Content Change' | 'Feature Revision' | 'Performance' | 'Access/Config' | 'Other';
export type IssuePriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface ProjectIssue {
  id: string;
  projectId: string;
  projectName: string;
  clientId: string;
  clientName: string;
  ticketNumber: string; // e.g. ISSUE-2026-001
  title: string;
  description: string;
  issueType: IssueType;
  priority: IssuePriority;
  status: IssueStatus;
  reporterName: string;
  reporterEmail: string;
  reporterPhone?: string;
  attachments?: string[]; // base64 or storage URLs
  adminNotes?: string;
  resolutionNotes?: string;
  assignedTo?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// --- AGX Partner Program Models ---

export interface PartnerPayoutDetails {
  upiId?: string;
  bankName?: string;
  accountNumber?: string;
  ifsc?: string;
  accountName?: string;
  paypalEmail?: string;
  notes?: string;
}

export interface Partner {
  id: string;
  userId?: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  referralCode: string;
  commissionRate: number; // e.g. 0.10 for 10%, 0.15 for 15%
  status: 'Active' | 'Pending' | 'Suspended';
  payoutMethod: 'UPI' | 'Bank Transfer' | 'PayPal' | 'Wire';
  payoutDetails?: PartnerPayoutDetails;
  totalEarnings: number;
  paidEarnings: number;
  pendingEarnings: number;
  notes?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PartnerReferral {
  id: string;
  partnerId: string;
  partnerName?: string;
  leadId?: string;
  clientId?: string;
  projectId?: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  company?: string;
  projectType: string;
  dealValue: number;
  totalPaid: number;
  pendingPayment: number;
  dealStatus: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL SENT' | 'WON' | 'IN PROGRESS' | 'COMPLETED' | 'LOST';
  paymentStatus: 'Pending' | 'Partially Paid' | 'Fully Paid';
  commissionRate: number;
  commissionEarned: number;
  commissionPaid: number;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PartnerPayout {
  id: string;
  partnerId: string;
  partnerName?: string;
  amount: number;
  payoutDate: string;
  paymentMethod: string;
  transactionRef?: string;
  status: 'Pending' | 'Completed' | 'Failed';
  notes?: string;
  createdAt: string;
}

