// AGX Automated Invoice Dunning & Payment Follow-up Scheduler Service
// Categorizes unpaid receivables and generates ready-to-dispatch WhatsApp & Email reminders.
import { Invoice } from '../types/crm';
import { AGX_BRAND } from './pdfTemplates';

export type DunningStage = 
  | 'UPCOMING_3_DAYS' 
  | 'DUE_TODAY' 
  | 'OVERDUE_3_DAYS' 
  | 'CRITICAL_OVERDUE_7_DAYS' 
  | 'HEALTHY';

export interface DunningItem {
  invoice: Invoice;
  stage: DunningStage;
  daysDiff: number; // positive = days until due, negative = days overdue, 0 = due today
  stageLabel: string;
  badgeColor: string;
  recommendedAction: string;
  whatsappMessage: string;
  whatsappUrl?: string;
  emailSubject: string;
  emailBody: string;
  mailtoUrl?: string;
}

/**
 * Calculates days between today and invoice due date
 * Positive value = due in X days
 * Negative value = overdue by X days
 * 0 = due today
 */
export function getInvoiceDaysDiff(dueDateStr: string): number {
  if (!dueDateStr) return 0;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDateStr);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
}

/**
 * Categorizes an invoice into its appropriate dunning timeline stage
 */
export function getDunningStage(invoice: Invoice): DunningStage {
  if (invoice.status === 'Paid') return 'HEALTHY';
  const daysDiff = getInvoiceDaysDiff(invoice.dueDate);

  if (daysDiff < -7) return 'CRITICAL_OVERDUE_7_DAYS';
  if (daysDiff < 0) return 'OVERDUE_3_DAYS';
  if (daysDiff === 0) return 'DUE_TODAY';
  if (daysDiff <= 3) return 'UPCOMING_3_DAYS';
  return 'HEALTHY';
}

/**
 * Generates tailored communication templates and links for an unpaid invoice
 */
export function analyzeInvoiceDunning(invoice: Invoice, clientPhone?: string, clientEmail?: string): DunningItem {
  const stage = getDunningStage(invoice);
  const daysDiff = getInvoiceDaysDiff(invoice.dueDate);
  const balanceDue = Math.max(0, invoice.total - (invoice.paidAmount || 0));
  const clientName = invoice.recipientName || invoice.contactPerson || invoice.clientName || 'Partner';
  const companyName = invoice.clientName;
  const currencySymbol = invoice.currency === 'USD' ? '$' : '₹';

  let stageLabel = 'Healthy';
  let badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  let recommendedAction = 'No action required';
  let whatsappMessage = '';
  let emailSubject = '';
  let emailBody = '';

  const cleanPhone = (clientPhone || '').replace(/[^0-9]/g, '');
  const cleanEmail = clientEmail || invoice.clientEmail || '';

  if (stage === 'UPCOMING_3_DAYS') {
    stageLabel = `Due in ${daysDiff} Day${daysDiff > 1 ? 's' : ''}`;
    badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    recommendedAction = 'Send Friendly Pre-Due Notice';

    whatsappMessage = `Hi ${clientName}, greetings from ${AGX_BRAND.companyName}!\n\nJust a quick, gentle reminder that Invoice #${invoice.invoiceNumber} for ${companyName} (${currencySymbol}${balanceDue.toLocaleString()}) is scheduled for clearance on ${invoice.dueDate}.\n\nPlease let us know if your accounts team requires any additional verification.\n\nBest regards,\n${AGX_BRAND.enterpriseName}`;

    emailSubject = `Reminder: Invoice #${invoice.invoiceNumber} Due Soon (${currencySymbol}${balanceDue.toLocaleString()}) - ${AGX_BRAND.companyName}`;
    emailBody = `Dear ${clientName},\n\nWe hope you are having a productive week.\n\nThis is a friendly reminder that Invoice #${invoice.invoiceNumber} for ${companyName} is due on ${invoice.dueDate}.\n\nInvoice Summary:\n- Invoice Number: ${invoice.invoiceNumber}\n- Balance Due: ${currencySymbol}${balanceDue.toLocaleString()}\n- Due Date: ${invoice.dueDate}\n\nPlease let us know if you need any assistance or remittance details.\n\nWarm regards,\nFinance & Accounts\n${AGX_BRAND.legalEntity}\n${AGX_BRAND.website}`;
  } else if (stage === 'DUE_TODAY') {
    stageLabel = 'Due Today';
    badgeColor = 'bg-orange-500/10 text-orange-400 border-orange-500/20';
    recommendedAction = 'Send Due Today Payment Notice';

    whatsappMessage = `Hello ${clientName}, hope all is well!\n\nThis is a notification that Invoice #${invoice.invoiceNumber} (${currencySymbol}${balanceDue.toLocaleString()}) for ${companyName} matures today (${invoice.dueDate}).\n\nKindly share the transaction UTR reference once the payment is initiated so we can issue your official receipt.\n\nThank you,\n${AGX_BRAND.companyName}`;

    emailSubject = `Notice: Invoice #${invoice.invoiceNumber} is Due Today (${currencySymbol}${balanceDue.toLocaleString()}) - ${companyName}`;
    emailBody = `Dear ${clientName},\n\nThis is a prompt notice that Invoice #${invoice.invoiceNumber} is due today, ${invoice.dueDate}.\n\nPayment Details:\n- Amount: ${currencySymbol}${balanceDue.toLocaleString()}\n- Bank: ${AGX_BRAND.bank.bankName}\n- Account No: ${AGX_BRAND.bank.accountNumber}\n- IFSC: ${AGX_BRAND.bank.ifsc}\n- UPI ID: ${AGX_BRAND.bank.upiId}\n\nKindly confirm once the wire or UPI transfer has been executed.\n\nSincerely,\nFinance Department\n${AGX_BRAND.companyName}`;
  } else if (stage === 'OVERDUE_3_DAYS') {
    const pastDays = Math.abs(daysDiff);
    stageLabel = `${pastDays} Day${pastDays > 1 ? 's' : ''} Overdue`;
    badgeColor = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    recommendedAction = 'Send Polite Overdue Follow-up';

    whatsappMessage = `Hi ${clientName}, following up on Invoice #${invoice.invoiceNumber} (${currencySymbol}${balanceDue.toLocaleString()}) which was due on ${invoice.dueDate} (${pastDays} days ago).\n\nCould you please check with your finance department regarding the disbursement schedule? Thank you for your continued partnership!\n\n${AGX_BRAND.companyName}`;

    emailSubject = `Follow-up: Overdue Invoice #${invoice.invoiceNumber} - ${companyName}`;
    emailBody = `Dear ${clientName},\n\nWe are writing to follow up on Invoice #${invoice.invoiceNumber} (${currencySymbol}${balanceDue.toLocaleString()}), which had a due date of ${invoice.dueDate}.\n\nAccording to our records, payment has not yet been received. Could you please confirm if payment has been scheduled or let us know if there are any discrepancies we should resolve?\n\nThank you for your prompt attention.\n\nBest regards,\n${AGX_BRAND.signatoryName}\n${AGX_BRAND.enterpriseName}`;
  } else if (stage === 'CRITICAL_OVERDUE_7_DAYS') {
    const pastDays = Math.abs(daysDiff);
    stageLabel = `Escalated: ${pastDays} Days Overdue`;
    badgeColor = 'bg-red-600/20 text-red-400 border-red-500/40 animate-pulse';
    recommendedAction = 'Urgent Account Manager Escalation';

    whatsappMessage = `URGENT: Hi ${clientName}, Invoice #${invoice.invoiceNumber} (${currencySymbol}${balanceDue.toLocaleString()}) is now ${pastDays} days past due date (${invoice.dueDate}).\n\nPlease reach out directly today so we can ensure project sprint deliverables remain uninterrupted.\n\n${AGX_BRAND.signatoryName}\n${AGX_BRAND.companyName}`;

    emailSubject = `URGENT ESCALATION: Pending Payment for Invoice #${invoice.invoiceNumber} (${pastDays} Days Overdue)`;
    emailBody = `Dear ${clientName},\n\nThis is an urgent notice regarding Invoice #${invoice.invoiceNumber} for ${currencySymbol}${balanceDue.toLocaleString()}, which is now ${pastDays} days overdue.\n\nTo avoid any hold on active sprint deliverables or server configurations, please process the outstanding remittance today or contact us immediately.\n\nBank Remittance Details:\n- A/C Name: ${AGX_BRAND.bank.accountHolderName}\n- Bank: ${AGX_BRAND.bank.bankName}\n- A/C No: ${AGX_BRAND.bank.accountNumber}\n- IFSC: ${AGX_BRAND.bank.ifsc}\n- UPI: ${AGX_BRAND.bank.upiId}\n\nSincerely,\n${AGX_BRAND.signatoryName}\n${AGX_BRAND.designation}\n${AGX_BRAND.enterpriseName}`;
  }

  const whatsappUrl = cleanPhone 
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMessage)}`
    : `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;

  const mailtoUrl = cleanEmail
    ? `mailto:${cleanEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`
    : undefined;

  return {
    invoice,
    stage,
    daysDiff,
    stageLabel,
    badgeColor,
    recommendedAction,
    whatsappMessage,
    whatsappUrl,
    emailSubject,
    emailBody,
    mailtoUrl
  };
}

/**
 * Scans all invoices in the store and groups unpaid items by dunning urgency
 */
export function getDunningRadarMetrics(invoices: Invoice[]) {
  const unpaid = invoices.filter(i => i.status !== 'Paid');
  const items = unpaid.map(inv => analyzeInvoiceDunning(inv));

  const upcoming = items.filter(i => i.stage === 'UPCOMING_3_DAYS');
  const dueToday = items.filter(i => i.stage === 'DUE_TODAY');
  const overdue3 = items.filter(i => i.stage === 'OVERDUE_3_DAYS');
  const critical7 = items.filter(i => i.stage === 'CRITICAL_OVERDUE_7_DAYS');

  const totalOutstanding = items.reduce((acc, i) => acc + (i.invoice.total - (i.invoice.paidAmount || 0)), 0);
  const totalOverdueAmount = [...overdue3, ...critical7].reduce(
    (acc, i) => acc + (i.invoice.total - (i.invoice.paidAmount || 0)), 
    0
  );

  return {
    items,
    upcoming,
    dueToday,
    overdue3,
    critical7,
    totalOutstanding,
    totalOverdueAmount,
    hasActionableItems: items.length > 0
  };
}
