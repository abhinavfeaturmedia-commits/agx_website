// TypeScript definitions for AGX CRM & Business Operating System

export type UserRole = 
  | 'Super Admin' 
  | 'Admin' 
  | 'Sales Manager' 
  | 'Sales Executive' 
  | 'Project Manager' 
  | 'Developer' 
  | 'Accountant'
  | 'Partnership';

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
  },
  'Partnership': {
    dashboard: true,
    leads: true,
    clients: true,
    projects: true,
    tasks: true,
    issues: true,
    finance: true,
    partners: false,
    documents: true,
    vault: true,
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
  createdById?: string;
  createdByName?: string;
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

export type QuotationItem = InvoiceItem;

export type QuotationStatus = 'Draft' | 'Sent' | 'Accepted' | 'Declined' | 'Expired' | 'Converted';

export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP';

export interface Quotation {
  id: string;
  quotationNumber: string;
  currency?: Currency;
  leadId?: string;
  leadName?: string;
  clientId?: string;
  clientName: string;
  recipientName?: string;
  companyName?: string;
  company?: string;
  serviceTitle?: string;
  title?: string;
  targetType?: 'lead' | 'client' | 'Lead' | 'Client' | string;
  projectId?: string;
  projectName?: string;
  issueDate: string;
  validUntil: string;
  items: QuotationItem[];
  subtotal: number;
  discountAmount?: number;
  isGst?: boolean;
  gstType?: GstType;
  taxRate?: number;
  tax: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  total: number;
  status: QuotationStatus;
  convertedInvoiceId?: string;
  convertedAt?: string;
  clientGstin?: string;
  clientEmail?: string;
  clientAddress?: string;
  contactPerson?: string;
  hsnSacCode?: string;
  notes?: string;
  termsConditions?: string;
  createdAt: string;
  updatedAt?: string;
}

export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid' | 'Partially Paid' | 'Overdue';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  currency?: Currency;
  clientId: string;
  clientName: string;
  recipientName?: string;
  contactPerson?: string;
  clientEmail?: string;
  clientAddress?: string;
  projectId?: string;
  projectName?: string;
  quotationId?: string;
  quotationNumber?: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  discountAmount?: number;
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
  termsConditions?: string;
  createdAt: string;
}

export type PaymentStatus = 'Pending' | 'Partially Paid' | 'Paid' | 'Overdue' | 'Refunded';

export interface Payment {
  id: string;
  invoiceId?: string;
  invoiceNumber?: string;
  currency?: Currency;
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
  actionType: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE' | 'REVEAL_SECRET' | 'CONVERT_LEAD' | 'PAYMENT_RECORDED' | 'CONVERT_TO_INVOICE';
  entityType: 'User' | 'Lead' | 'Client' | 'Project' | 'Task' | 'Invoice' | 'Payment' | 'Expense' | 'Credential' | 'Agreement' | 'Issue' | 'Partner' | 'Quotation';
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
  swiftCode?: string;
  wireDetails?: string;
  panTaxId?: string;
  autoPayoutThreshold?: number;
  notifyOnWhatsApp?: boolean;
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
  hasPassword?: boolean;
  passwordHash?: string;
  code?: string;
  avatarUrl?: string;
  googleId?: string;
  termsAccepted?: boolean;
  termsAcceptedAt?: string;
  termsVersion?: string;
  isCustomRate?: boolean; // When true, this partner has a fixed percentage override set by Super Admin
  customCommissionRate?: number; // e.g. 0.30 for 30%, 0.18 for 18%
  customRateReason?: string; // e.g. "VIP Agency Agreement", "Strategic Enterprise Partner"
  customRateSetAt?: string; // Timestamp when custom rate was configured
  customRateSetBy?: string; // Admin who configured it (e.g. "Abhinav (Super Admin)")
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
  driveFolderId?: string;
  driveFolderUrl?: string;
  documents?: ClientDocument[];
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ClientDocument {
  id: string;
  title: string;
  docType?: string;
  leadId?: string;
  clientId?: string;
  leadName?: string;
  fileUrl: string;
  downloadUrl?: string;
  fileSize?: string;
  uploadedBy?: string;
  driveFileId?: string;
  driveFolderId?: string;
  driveFolderUrl?: string;
  createdAt: string;
}

export type PartnerTierName = 'Starter' | 'Base' | 'Pro' | 'Elite' | 'Bronze' | 'Silver' | 'Gold';

export interface PartnerTierInfo {
  tier: PartnerTierName;
  commissionRate: number; // 0.10 for Starter, 0.15 for Base, 0.20 for Pro, 0.25 for Elite
  billingVolume: number;
  closedDealsCount?: number;
  thresholdMin: number;
  thresholdMax?: number;
  nextTier?: PartnerTierName;
  volumeNeededForNextTier: number;
  dealsNeededForNextTier?: number;
  progressPercent: number; // 0 to 100
  tierColor: string;
  badgeLabel: string;
  ruleDescription: string;
  bonusNote?: string;
}

export const calculatePartnerTier = (
  billingVolumeOrDeals: number,
  optionalClosedDeals?: number
): PartnerTierInfo => {
  let volume = Math.max(0, billingVolumeOrDeals || 0);
  let deals = optionalClosedDeals !== undefined ? optionalClosedDeals : 0;

  // Handle legacy deal-count callers gracefully if number passed is small (e.g. <= 25)
  if (billingVolumeOrDeals > 0 && billingVolumeOrDeals <= 25 && optionalClosedDeals === undefined) {
    deals = billingVolumeOrDeals;
    // Map deal count estimation: 1 deal -> ~₹1.5L, 3 deals -> ~₹3.5L, 5 deals -> ~₹6L, 10 deals -> ~₹13L
    if (deals >= 10) volume = 1250000;
    else if (deals >= 4) volume = 500000;
    else if (deals >= 2) volume = 300000;
    else volume = 150000;
  }

  // Tier 4: Elite Bonus Tier (Exceeds ₹12,00,000) -> 25% Share (+5% Performance Bonus)
  if (volume > 1200000) {
    return {
      tier: 'Elite',
      commissionRate: 0.25,
      billingVolume: volume,
      closedDealsCount: deals,
      thresholdMin: 1200000,
      dealsNeededForNextTier: 0,
      volumeNeededForNextTier: 0,
      progressPercent: 100,
      tierColor: '#CCFF00', // AGX Luminous Lime
      badgeLabel: 'Elite Bonus Tier (25%)',
      ruleDescription: 'Exceeds ₹12,00,000 monthly business generated',
      bonusNote: '(+5% Performance Bonus on total monthly business closed).'
    };
  }

  // Tier 3: Pro Tier (Above ₹4,00,000 to ₹12,00,000) -> 20% Share (Applied to entire month's business)
  if (volume > 400000) {
    const volumeNeeded = 1200000 - volume;
    const progress = Math.min(100, Math.max(5, Math.round(((volume - 400000) / 800000) * 100)));
    return {
      tier: 'Pro',
      commissionRate: 0.20,
      billingVolume: volume,
      closedDealsCount: deals,
      thresholdMin: 400000,
      thresholdMax: 1200000,
      nextTier: 'Elite',
      volumeNeededForNextTier: volumeNeeded,
      dealsNeededForNextTier: Math.max(1, Math.ceil(volumeNeeded / 150000)),
      progressPercent: progress,
      tierColor: '#10B981', // Emerald Green
      badgeLabel: 'Pro Tier (20%)',
      ruleDescription: 'Above ₹4,00,000 monthly business generated',
      bonusNote: "Applied to all business closed in that month, not just the overflow."
    };
  }

  // Tier 2: Base Tier (₹2,50,001 to ₹4,00,000) -> 15% Share
  if (volume > 250000) {
    const volumeNeeded = 400000 - volume;
    const progress = Math.min(100, Math.max(5, Math.round(((volume - 250000) / 150000) * 100)));
    return {
      tier: 'Base',
      commissionRate: 0.15,
      billingVolume: volume,
      closedDealsCount: deals,
      thresholdMin: 250000,
      thresholdMax: 400000,
      nextTier: 'Pro',
      volumeNeededForNextTier: volumeNeeded,
      dealsNeededForNextTier: Math.max(1, Math.ceil(volumeNeeded / 100000)),
      progressPercent: progress,
      tierColor: '#3B82F6', // Tech Blue
      badgeLabel: 'Base Tier (15%)',
      ruleDescription: '₹2,50,001 to ₹4,00,000 monthly business generated',
      bonusNote: 'Standard agency rate. Flexible based on actual business closed.'
    };
  }

  // Tier 1: Starter Tier (Up to ₹2,50,000) -> 10% Share
  const volumeNeeded = 250000 - volume;
  const progress = Math.min(100, Math.round((volume / 250000) * 100));
  return {
    tier: 'Starter',
    commissionRate: 0.10,
    billingVolume: volume,
    closedDealsCount: deals,
    thresholdMin: 0,
    thresholdMax: 250000,
    nextTier: 'Base',
    volumeNeededForNextTier: volumeNeeded,
    dealsNeededForNextTier: Math.max(1, Math.ceil(volumeNeeded / 75000)),
    progressPercent: Math.max(4, progress),
    tierColor: '#94A3B8', // Slate
    badgeLabel: 'Starter Tier (10%)',
    ruleDescription: 'Up to ₹2,50,000 monthly business generated',
    bonusNote: 'Flexible entry tier with zero mandatory quotas or commitments.'
  };
};

export interface EffectivePartnerRateInfo {
  rate: number;
  percentage: number;
  isCustom: boolean;
  tier: PartnerTierName | 'Custom';
  tierColor: string;
  badgeLabel: string;
  ruleDescription: string;
  reason?: string;
  nextTier?: PartnerTierName;
  volumeNeededForNextTier?: number;
  dealsNeededForNextTier?: number;
}

export const getEffectivePartnerRate = (
  partner: Pick<Partner, 'commissionRate' | 'isCustomRate' | 'customCommissionRate' | 'customRateReason'>,
  billingVolume: number = 0
): EffectivePartnerRateInfo => {
  if (partner.isCustomRate && typeof partner.customCommissionRate === 'number' && partner.customCommissionRate > 0) {
    const rate = partner.customCommissionRate;
    const percentage = Math.round(rate * 1000) / 10;
    return {
      rate,
      percentage,
      isCustom: true,
      tier: 'Custom',
      tierColor: '#A855F7', // Royal Purple for VIP Custom Overrides
      badgeLabel: `Fixed ${percentage}% (Custom)`,
      ruleDescription: partner.customRateReason || 'Super Admin assigned custom fixed percentage override',
      reason: partner.customRateReason,
      nextTier: undefined,
      volumeNeededForNextTier: 0,
      dealsNeededForNextTier: 0
    };
  }

  const tierInfo = calculatePartnerTier(billingVolume);
  const rate = partner.commissionRate || tierInfo.commissionRate;
  const percentage = Math.round(rate * 100);
  return {
    rate,
    percentage,
    isCustom: false,
    tier: tierInfo.tier,
    tierColor: tierInfo.tierColor,
    badgeLabel: `${tierInfo.badgeLabel}`,
    ruleDescription: tierInfo.ruleDescription,
    reason: undefined,
    nextTier: tierInfo.nextTier,
    volumeNeededForNextTier: tierInfo.volumeNeededForNextTier,
    dealsNeededForNextTier: tierInfo.dealsNeededForNextTier
  };
};

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
  tdsRate?: number; // e.g. 0.05 for 5% TDS
  tdsAmount?: number;
  netDisbursed?: number;
  voucherNumber?: string;
  utrNumber?: string;
  panTaxId?: string;
  createdAt: string;
}


