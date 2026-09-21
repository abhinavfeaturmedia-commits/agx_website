import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  IndianRupee, TrendingUp, TrendingDown, Plus, Search, FileText,
  CreditCard, CheckCircle2, ArrowUpRight, ArrowDownRight, X,
  PieChart, Shield, Calculator, Download, Edit3, Trash2, Printer,
  Receipt, Building, Briefcase, Filter, Layers, DollarSign,
  AlertCircle, CheckCircle, Clock, Percent, ArrowRight
} from 'lucide-react';
import { Invoice, Payment, Expense, InvoiceStatus, PaymentStatus, ExpenseCategory, GstType } from '../../types/crm';
import { useCrmStore } from '../../lib/crmStore';
import { exportService } from '../../lib/exportService';
import { toast } from '../../lib/toastStore';
import { InvoicePreviewModal } from './InvoicePreviewModal';

interface FinanceViewProps {
  store: ReturnType<typeof useCrmStore>;
  onNavigate: (route: string, entityId?: string) => void;
  initialSelectedId?: string;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Developer Cost',
  'SaaS Tools',
  'Infrastructure/Cloud',
  'Marketing/Ads',
  'Office'
];

export const FinanceView: React.FC<FinanceViewProps> = ({ store, onNavigate, initialSelectedId }) => {
  const {
    invoices, addInvoice, updateInvoice, deleteInvoice,
    payments, recordPayment, deletePayment,
    expenses, addExpense, deleteExpense,
    clients, projects, totalRevenue, directExpensesTotal, partnerPayoutsTotal, totalExpenses, netProfit, profitMargin,
    outstandingInvoicesTotal, currentUser, canAccessFinance
  } = store;

  const [activeTab, setActiveTab] = useState<'Overview' | 'Invoices' | 'Payments' | 'Expenses' | 'Profit & Loss'>('Overview');

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClientFilter, setSelectedClientFilter] = useState<string>('All');
  const [selectedInvoiceStatus, setSelectedInvoiceStatus] = useState<string>('All');
  const [selectedInvoiceTypeFilter, setSelectedInvoiceTypeFilter] = useState<'All' | 'GST' | 'Non-GST'>('All');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('All');
  const [selectedExpenseCategory, setSelectedExpenseCategory] = useState<string>('All');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>('All');

  // Modals
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  // Edit & Delete states
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  // Auto-open invoice if navigated with ID or quick create
  useEffect(() => {
    if (initialSelectedId === 'new') {
      setActiveTab('Invoices');
      setIsInvoiceModalOpen(true);
      onNavigate('finance', undefined);
    } else if (initialSelectedId) {
      const invMatch = invoices.find(i => i.id === initialSelectedId);
      if (invMatch) {
        setActiveTab('Invoices');
        setEditingInvoice(invMatch);
      }
      onNavigate('finance', undefined);
    }
  }, [initialSelectedId]);

  // New Invoice Form State
  const [newInvoice, setNewInvoice] = useState({
    invoiceNumber: `INV-${new Date().getFullYear()}-00${invoices.length + 1}`,
    clientId: clients[0]?.id || '',
    clientName: clients[0]?.company || '',
    projectId: projects[0]?.id || '',
    projectName: projects[0]?.name || '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    itemDesc: 'AI Automation & Core Integration Sprint',
    itemQty: 1,
    itemPrice: 15000,
    isGst: true,
    gstType: 'IGST' as GstType,
    taxRate: 18,
    clientGstin: clients[0]?.gstTaxId || '',
    hsnSacCode: '998313',
    status: 'Sent' as InvoiceStatus,
    notes: 'Payment due within 15 days of invoice date.'
  });

  // New Payment Form State
  const [newPayment, setNewPayment] = useState({
    invoiceId: invoices[0]?.id || '',
    clientId: clients[0]?.id || '',
    clientName: clients[0]?.company || '',
    projectId: projects[0]?.id || '',
    projectName: projects[0]?.name || '',
    amount: 15000,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Bank Wire',
    transactionId: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
    status: 'Paid' as PaymentStatus,
    notes: 'Received in full.'
  });

  // New Expense Form State
  const [newExpense, setNewExpense] = useState({
    category: 'Developer Cost' as ExpenseCategory,
    amount: 5000,
    expenseDate: new Date().toISOString().split('T')[0],
    vendor: 'Engineering Contractor',
    description: 'Specialized LLM Finetuning & Vector Sync Sprint',
    paymentMethod: 'Bank Transfer',
    projectId: projects[0]?.id || '',
    projectName: projects[0]?.name || '',
    approvedBy: currentUser?.fullName || 'Abhinav',
    status: 'Approved' as const
  });

  // Computed Financial Metrics
  const grossInvoiced = useMemo(() => {
    return invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
  }, [invoices]);

  const pendingReceivables = useMemo(() => {
    return Math.max(0, grossInvoiced - totalRevenue);
  }, [grossInvoiced, totalRevenue]);

  // Category-wise Expense Breakdown
  const expenseCategoryTotals = useMemo(() => {
    const map: Record<string, number> = {
      'Developer Cost': 0,
      'SaaS Tools': 0,
      'Infrastructure/Cloud': 0,
      'Marketing/Ads': 0,
      'Office': 0
    };
    expenses.forEach(e => {
      const cat = e.category || 'Office';
      map[cat] = (map[cat] || 0) + (e.amount || 0);
    });
    return map;
  }, [expenses]);

  // Project-wise Profitability Breakdown
  const projectProfitability = useMemo(() => {
    return projects.map(p => {
      const projInvoices = invoices.filter(i => i.projectId === p.id || i.projectName === p.name);
      const projPayments = payments.filter(pay => pay.projectId === p.id || pay.projectName === p.name);
      const projExpenses = expenses.filter(e => e.projectId === p.id || e.projectName === p.name);

      const billed = projInvoices.reduce((s, i) => s + (i.total || 0), 0) || p.projectValue || 0;
      const revenue = projPayments.reduce((s, pay) => s + (pay.amount || 0), 0) || p.receivedAmount || 0;
      const directExpense = projExpenses.reduce((s, e) => s + (e.amount || 0), 0);
      const net = revenue - directExpense;
      const margin = revenue > 0 ? Math.round((net / revenue) * 100) : (billed > 0 ? Math.round(((billed - directExpense) / billed) * 100) : 0);

      return {
        id: p.id,
        name: p.name,
        clientName: p.clientName,
        serviceType: p.serviceType,
        billed,
        revenue,
        directExpense,
        net,
        margin
      };
    });
  }, [projects, invoices, payments, expenses]);

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.clientName.toLowerCase().includes(q) ||
        (inv.projectName && inv.projectName.toLowerCase().includes(q));

      const matchesStatus = selectedInvoiceStatus === 'All' || inv.status === selectedInvoiceStatus;
      const matchesClient = selectedClientFilter === 'All' || inv.clientName === selectedClientFilter || inv.clientId === selectedClientFilter;
      const matchesType = selectedInvoiceTypeFilter === 'All' ||
        (selectedInvoiceTypeFilter === 'GST' && inv.isGst !== false) ||
        (selectedInvoiceTypeFilter === 'Non-GST' && inv.isGst === false);

      return matchesSearch && matchesStatus && matchesClient && matchesType;
    });
  }, [invoices, searchQuery, selectedInvoiceStatus, selectedClientFilter, selectedInvoiceTypeFilter]);

  // Filtered Payments
  const filteredPayments = useMemo(() => {
    return payments.filter(pay => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        (pay.transactionId && pay.transactionId.toLowerCase().includes(q)) ||
        pay.clientName.toLowerCase().includes(q) ||
        (pay.projectName && pay.projectName.toLowerCase().includes(q)) ||
        pay.paymentMethod.toLowerCase().includes(q);

      const matchesMethod = selectedPaymentMethod === 'All' || pay.paymentMethod === selectedPaymentMethod;
      const matchesClient = selectedClientFilter === 'All' || pay.clientName === selectedClientFilter || pay.clientId === selectedClientFilter;

      return matchesSearch && matchesMethod && matchesClient;
    });
  }, [payments, searchQuery, selectedPaymentMethod, selectedClientFilter]);

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        exp.description.toLowerCase().includes(q) ||
        (exp.vendor && exp.vendor.toLowerCase().includes(q)) ||
        (exp.projectName && exp.projectName.toLowerCase().includes(q));

      const matchesCategory = selectedExpenseCategory === 'All' || exp.category === selectedExpenseCategory;
      const matchesProject = selectedProjectFilter === 'All' || exp.projectId === selectedProjectFilter;

      return matchesSearch && matchesCategory && matchesProject;
    });
  }, [expenses, searchQuery, selectedExpenseCategory, selectedProjectFilter]);

  if (!canAccessFinance) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
        <Shield size={48} className="text-amber-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900">Restricted Access (RBAC)</h3>
        <p className="text-xs text-gray-500 mt-2">
          Your current role (<strong>{currentUser?.role}</strong>) does not have financial visibility permissions. Switch to Super Admin, Admin, or Accountant to view.
        </p>
      </div>
    );
  }

  // Invoice Handlers
  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const cl = clients.find(c => c.id === newInvoice.clientId);
    const pr = projects.find(p => p.id === newInvoice.projectId);
    const subtotal = newInvoice.itemQty * newInvoice.itemPrice;
    const isGst = newInvoice.isGst;
    const taxRate = isGst ? (newInvoice.taxRate ?? 18) : 0;
    const tax = isGst ? Math.round(subtotal * (taxRate / 100)) : 0;
    const total = subtotal + tax;
    const gstType = newInvoice.gstType || 'IGST';
    const cgst = isGst && gstType === 'CGST_SGST' ? Math.round(tax / 2) : 0;
    const sgst = isGst && gstType === 'CGST_SGST' ? Math.round(tax / 2) : 0;
    const igst = isGst && gstType === 'IGST' ? tax : 0;

    addInvoice({
      invoiceNumber: newInvoice.invoiceNumber,
      clientId: newInvoice.clientId,
      clientName: cl ? cl.company : newInvoice.clientName,
      projectId: newInvoice.projectId,
      projectName: pr ? pr.name : newInvoice.projectName,
      issueDate: newInvoice.issueDate,
      dueDate: newInvoice.dueDate,
      items: [{
        description: newInvoice.itemDesc,
        quantity: newInvoice.itemQty,
        unitPrice: newInvoice.itemPrice,
        total: subtotal,
        hsnSac: isGst ? (newInvoice.hsnSacCode || '998313') : undefined
      }],
      subtotal,
      isGst,
      gstType: isGst ? gstType : undefined,
      taxRate,
      tax,
      cgst,
      sgst,
      igst,
      clientGstin: newInvoice.clientGstin || cl?.gstTaxId || undefined,
      hsnSacCode: isGst ? (newInvoice.hsnSacCode || '998313') : undefined,
      total,
      paidAmount: 0,
      status: newInvoice.status,
      notes: newInvoice.notes
    });
    setIsInvoiceModalOpen(false);
    toast.success('Invoice Created', `${newInvoice.invoiceNumber} issued as ${isGst ? 'GST Tax Invoice' : 'Non-GST Commercial Invoice'}`);
  };

  const handleSaveEditInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInvoice) return;
    const subtotal = editingInvoice.items?.reduce((s, it) => s + (it.total || it.quantity * it.unitPrice), 0) || editingInvoice.subtotal;
    const isGst = editingInvoice.isGst !== false;
    const taxRate = isGst ? (editingInvoice.taxRate ?? 18) : 0;
    const tax = isGst ? Math.round(subtotal * (taxRate / 100)) : 0;
    const total = subtotal + tax;
    const gstType = editingInvoice.gstType || 'IGST';
    const cgst = isGst && gstType === 'CGST_SGST' ? Math.round(tax / 2) : 0;
    const sgst = isGst && gstType === 'CGST_SGST' ? Math.round(tax / 2) : 0;
    const igst = isGst && gstType === 'IGST' ? tax : 0;

    const updated: Invoice = {
      ...editingInvoice,
      subtotal,
      isGst,
      gstType: isGst ? gstType : undefined,
      taxRate,
      tax,
      cgst,
      sgst,
      igst,
      total
    };

    updateInvoice(editingInvoice.id, updated);
    setEditingInvoice(null);
    toast.success('Invoice Updated', `${editingInvoice.invoiceNumber} saved successfully`);
  };

  const handleDownloadInvoicePdf = (inv: Invoice) => {
    setPreviewInvoice(inv);
  };

  const handleOpenRecordPaymentForInvoice = (inv: Invoice) => {
    setNewPayment({
      invoiceId: inv.id,
      clientId: inv.clientId,
      clientName: inv.clientName,
      projectId: inv.projectId || '',
      projectName: inv.projectName || '',
      amount: inv.total,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'Bank Wire',
      transactionId: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'Paid',
      notes: `Settlement for invoice ${inv.invoiceNumber}`
    });
    setIsPaymentModalOpen(true);
  };

  // Payment Handlers
  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const cl = clients.find(c => c.id === newPayment.clientId);
    const pr = projects.find(p => p.id === newPayment.projectId);

    recordPayment({
      invoiceId: newPayment.invoiceId,
      clientId: newPayment.clientId,
      clientName: cl ? cl.company : newPayment.clientName,
      projectId: newPayment.projectId,
      projectName: pr ? pr.name : newPayment.projectName,
      amount: newPayment.amount,
      paymentDate: newPayment.paymentDate,
      paymentMethod: newPayment.paymentMethod,
      transactionId: newPayment.transactionId,
      status: newPayment.status,
      notes: newPayment.notes
    });
    setIsPaymentModalOpen(false);
    toast.success('Payment Logged', `₹${newPayment.amount.toLocaleString('en-IN')} received from ${cl ? cl.company : newPayment.clientName}`);
  };

  // Expense Handlers
  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const pr = projects.find(p => p.id === newExpense.projectId);

    addExpense({
      ...newExpense,
      projectName: pr ? pr.name : newExpense.projectName
    });
    setIsExpenseModalOpen(false);
    toast.success('Expense Recorded', `₹${newExpense.amount.toLocaleString('en-IN')} added under ${newExpense.category}`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            Finance, Ledger & Commercials
          </h2>
          <p className="text-xs text-gray-500">
            Real-time revenue attribution, GST compliance, invoice generation, expense tracking, and P&L.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus size={14} /> Record Expense
          </button>
          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Plus size={14} /> Record Payment
          </button>
          <button
            onClick={() => setIsInvoiceModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-bold text-xs flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
          >
            <Plus size={15} /> Create Invoice
          </button>
        </div>
      </div>

      {/* Row 1: KPI Metrics with Double-Bezel Architecture */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="double-bezel-outer card-tactile">
          <div className="double-bezel-inner p-5 flex items-start justify-between">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Invoiced (Gross)</span>
              <span className="text-2xl font-black text-gray-900 mt-1 block tabular-nums">
                ₹{grossInvoiced.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-indigo-600 font-bold flex items-center gap-1 mt-1 tabular-nums">
                <FileText size={13} /> {invoices.length} Invoices Generated
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shadow-xs">
              <FileText size={18} />
            </div>
          </div>
        </div>

        <div className="double-bezel-outer card-tactile">
          <div className="double-bezel-inner p-5 flex items-start justify-between">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Collected Revenue (Inflow)</span>
              <span className="text-2xl font-black text-emerald-600 mt-1 block tabular-nums">
                ₹{totalRevenue.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-emerald-700 font-bold flex items-center gap-1 mt-1 tabular-nums">
                <TrendingUp size={13} /> {payments.length} Transactions Settled
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-xs">
              <CreditCard size={18} />
            </div>
          </div>
        </div>

        <div className="double-bezel-outer card-tactile">
          <div className="double-bezel-inner p-5 flex items-start justify-between">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Direct Expenses (Outflow)</span>
              <span className="text-2xl font-black text-rose-600 mt-1 block tabular-nums">
                ₹{totalExpenses.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-rose-700 font-bold flex items-center gap-1 mt-1 tabular-nums">
                <TrendingDown size={13} /> {expenses.length} Expense Logs
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold shadow-xs">
              <TrendingDown size={18} />
            </div>
          </div>
        </div>

        <div className="double-bezel-outer card-tactile">
          <div className="double-bezel-inner bg-gradient-to-br from-[#0E131F] to-[#080B12] text-white p-5 flex items-start justify-between relative overflow-hidden">
            <div className="relative z-10">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Net Operating Profit</span>
              <span className="text-2xl font-black text-[#CCFF00] mt-1 block tabular-nums">
                ₹{netProfit.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 mt-1 tabular-nums">
                <Percent size={13} /> {profitMargin}% Profit Margin
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/10 text-[#CCFF00] flex items-center justify-center relative z-10 font-bold shadow-xs">
              <Calculator size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Tabs Navigation */}
      <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-gray-100 w-fit text-xs">
        {(['Overview', 'Invoices', 'Payments', 'Expenses', 'Profit & Loss'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === tab ? 'bg-black text-white shadow-xs' : 'text-gray-500 hover:text-black'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Row 3: Tab Contents */}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'Overview' && (
        <div className="space-y-6">
          {/* Dual-Stream Cash Flow Bar */}
          <div className="double-bezel-outer card-tactile">
            <div className="double-bezel-inner p-6 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
                    Operating Cash Flow Ratio
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Live Attribution
                    </span>
                  </h3>
                  <p className="text-xs text-gray-400">Attributed capital inflow vs operational expense allocation</p>
                </div>
                <div className="flex items-center gap-4 text-xs tabular-nums flex-wrap">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    Inflow: ₹{totalRevenue.toLocaleString('en-IN')} ({totalRevenue + totalExpenses > 0 ? Math.round((totalRevenue / (totalRevenue + totalExpenses)) * 100) : 100}%)
                  </div>
                  <div className="flex items-center gap-1.5 font-bold text-rose-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    Outflow: ₹{totalExpenses.toLocaleString('en-IN')} ({totalRevenue + totalExpenses > 0 ? Math.round((totalExpenses / (totalRevenue + totalExpenses)) * 100) : 0}%)
                  </div>
                </div>
              </div>

              {/* Progress split track */}
              <div className="relative h-4 rounded-full bg-gray-100 overflow-hidden flex shadow-inner">
                <div
                  style={{ width: `${totalRevenue + totalExpenses > 0 ? (totalRevenue / (totalRevenue + totalExpenses)) * 100 : 100}%` }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                />
                <div
                  style={{ width: `${totalRevenue + totalExpenses > 0 ? (totalExpenses / (totalRevenue + totalExpenses)) * 100 : 0}%` }}
                  className="h-full bg-gradient-to-r from-rose-400 to-rose-600 transition-all duration-500"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                <span>Total Capital Volume: <strong className="text-gray-900 tabular-nums">₹{(totalRevenue + totalExpenses).toLocaleString('en-IN')}</strong></span>
                <span className="font-bold text-gray-900">Net Retained Margin: <span className="text-emerald-600 tabular-nums">₹{netProfit.toLocaleString('en-IN')} ({profitMargin}%)</span></span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Invoices */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-gray-900">Recent Invoices</h3>
                <button onClick={() => setActiveTab('Invoices')} className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer">
                  View All ({invoices.length})
                </button>
              </div>
              <div className="space-y-3 text-xs">
                {invoices.slice(0, 4).map((inv) => (
                  <div key={inv.id} className="p-3.5 rounded-2xl bg-gray-50 flex items-center justify-between hover:bg-gray-100/80 transition-colors">
                    <div>
                      <div className="font-bold text-gray-900 flex items-center gap-1.5">
                        <span>{inv.invoiceNumber} • {inv.clientName}</span>
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                          inv.isGst !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'
                        }`}>
                          {inv.isGst !== false ? `GST ${inv.taxRate || 18}%` : 'Non-GST'}
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-400">Due {inv.dueDate} • Total: ₹{inv.total.toLocaleString('en-IN')}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                        inv.status === 'Overdue' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {inv.status}
                      </span>
                      {inv.status !== 'Paid' && (
                        <button
                          onClick={() => handleOpenRecordPaymentForInvoice(inv)}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg cursor-pointer"
                          title="Record Payment"
                        >
                          Collect
                        </button>
                      )}
                      <button
                        onClick={() => handleDownloadInvoicePdf(inv)}
                        className="p-1.5 bg-white hover:bg-gray-100 text-gray-700 rounded-lg border border-gray-200 cursor-pointer"
                        title="Download PDF"
                      >
                        <Printer size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Payments Inflow */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-gray-900">Recent Payment Inflows</h3>
                <button onClick={() => setActiveTab('Payments')} className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer">
                  View All ({payments.length})
                </button>
              </div>
              <div className="space-y-3 text-xs">
                {payments.slice(0, 4).map((pay) => (
                  <div key={pay.id} className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100/50 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-emerald-950">₹{pay.amount.toLocaleString('en-IN')} from {pay.clientName}</div>
                      <div className="text-[10px] text-emerald-700">{pay.paymentMethod} • Ref: {pay.transactionId || 'N/A'}</div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      {pay.paymentDate}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Expense Category Breakdown Cards */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-gray-900">Expense Allocation by Category</h3>
              <span className="text-xs font-bold text-rose-600">Total Outflow: ₹{totalExpenses.toLocaleString('en-IN')}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {EXPENSE_CATEGORIES.map(cat => {
                const catTotal = expenseCategoryTotals[cat] || 0;
                const catPct = totalExpenses > 0 ? Math.round((catTotal / totalExpenses) * 100) : 0;

                return (
                  <div key={cat} className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">{cat}</span>
                    <strong className="text-base font-extrabold text-gray-900 block mt-1">₹{catTotal.toLocaleString('en-IN')}</strong>
                    <span className="text-[10px] text-gray-500 font-semibold block mt-1">{catPct}% of total expenses</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INVOICES */}
      {activeTab === 'Invoices' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden space-y-3 p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div className="relative w-full sm:w-80">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search invoice number, client..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:border-black"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
              <select
                value={selectedInvoiceTypeFilter}
                onChange={(e) => setSelectedInvoiceTypeFilter(e.target.value as any)}
                className="bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 rounded-xl px-3 py-2 outline-none cursor-pointer"
              >
                <option value="All">All Types (GST & Non-GST)</option>
                <option value="GST">GST Tax Invoices Only</option>
                <option value="Non-GST">Non-GST Invoices Only</option>
              </select>

              <select
                value={selectedInvoiceStatus}
                onChange={(e) => setSelectedInvoiceStatus(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 rounded-xl px-3 py-2 outline-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Sent">Sent</option>
                <option value="Paid">Paid</option>
                <option value="Draft">Draft</option>
                <option value="Overdue">Overdue</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              <button
                onClick={() => exportService.exportToCsv('agx_invoices', filteredInvoices.map(i => ({
                  InvoiceNo: i.invoiceNumber,
                  Type: i.isGst !== false ? `GST (${i.gstType || 'IGST'})` : 'Non-GST',
                  Client: i.clientName,
                  Project: i.projectName || 'Internal',
                  IssueDate: i.issueDate,
                  DueDate: i.dueDate,
                  SubtotalINR: i.subtotal,
                  TaxINR: i.tax,
                  TotalINR: i.total,
                  Status: i.status
                })))}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <Download size={13} /> Export CSV
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Invoice #</th>
                  <th className="py-3.5 px-3">Client & Project</th>
                  <th className="py-3.5 px-3">Invoice Type</th>
                  <th className="py-3.5 px-3">Due Date</th>
                  <th className="py-3.5 px-3">Subtotal</th>
                  <th className="py-3.5 px-3">Tax / GST</th>
                  <th className="py-3.5 px-3">Grand Total</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-gray-400 text-xs">
                      No invoices found matching the search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-extrabold text-gray-900">{inv.invoiceNumber}</td>
                      <td className="py-3.5 px-3">
                        <div
                          onClick={() => inv.clientId && onNavigate('clients', inv.clientId)}
                          className="font-bold text-gray-900 hover:text-indigo-600 cursor-pointer"
                        >
                          {inv.clientName}
                        </div>
                        <div className="text-[10px] text-gray-400">{inv.projectName || 'Service Engagement'}</div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold inline-flex items-center gap-1 ${
                          inv.isGst !== false
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}>
                          {inv.isGst !== false ? `GST ${inv.taxRate || 18}% (${inv.gstType || 'IGST'})` : 'Non-GST'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-gray-600 font-medium">{inv.dueDate}</td>
                      <td className="py-3.5 px-3 text-gray-600">₹{inv.subtotal?.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-3 font-semibold text-gray-700">
                        {inv.isGst !== false ? `₹${(inv.tax || 0).toLocaleString('en-IN')}` : '₹0 (Exempt)'}
                      </td>
                      <td className="py-3.5 px-3 font-extrabold text-gray-900">₹{inv.total.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                          inv.status === 'Overdue' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {inv.status !== 'Paid' && (
                            <button
                              onClick={() => handleOpenRecordPaymentForInvoice(inv)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] cursor-pointer"
                            >
                              Collect
                            </button>
                          )}
                          <button
                            onClick={() => handleDownloadInvoicePdf(inv)}
                            className="px-2.5 py-1 rounded-lg bg-black hover:bg-gray-800 text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                          >
                            <Printer size={11} /> PDF
                          </button>
                          <button
                            onClick={() => setEditingInvoice(inv)}
                            className="p-1 text-gray-400 hover:text-black rounded cursor-pointer"
                            title="Edit Invoice"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={() => setInvoiceToDelete(inv)}
                            className="p-1 text-gray-400 hover:text-rose-600 rounded cursor-pointer"
                            title="Delete Invoice"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PAYMENTS */}
      {activeTab === 'Payments' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden space-y-3 p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div className="relative w-full sm:w-80">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search transaction ref, client..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:border-black"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
              <select
                value={selectedPaymentMethod}
                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 rounded-xl px-3 py-2 outline-none cursor-pointer"
              >
                <option value="All">All Methods</option>
                <option value="Bank Wire">Bank Wire</option>
                <option value="Stripe">Stripe</option>
                <option value="UPI">UPI</option>
                <option value="PayPal">PayPal</option>
              </select>

              <button
                onClick={() => exportService.exportToCsv('agx_payments', filteredPayments.map(p => ({
                  TxnID: p.transactionId,
                  Client: p.clientName,
                  Date: p.paymentDate,
                  Method: p.paymentMethod,
                  AmountINR: p.amount,
                  Status: p.status
                })))}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <Download size={13} /> Export CSV
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Transaction Ref</th>
                  <th className="py-3.5 px-3">Client Account</th>
                  <th className="py-3.5 px-3">Payment Date</th>
                  <th className="py-3.5 px-3">Method</th>
                  <th className="py-3.5 px-3">Settled Amount</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400 text-xs">
                      No payment transactions found.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-gray-900">{p.transactionId || 'N/A'}</td>
                      <td className="py-3.5 px-3 font-semibold text-gray-900">{p.clientName}</td>
                      <td className="py-3.5 px-3 text-gray-500">{p.paymentDate}</td>
                      <td className="py-3.5 px-3">{p.paymentMethod}</td>
                      <td className="py-3.5 px-3 font-black text-emerald-600">₹{p.amount.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-3">
                        <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800">
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setPaymentToDelete(p)}
                          className="p-1 text-gray-400 hover:text-rose-600 rounded cursor-pointer"
                          title="Delete Payment"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: EXPENSES */}
      {activeTab === 'Expenses' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden space-y-3 p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div className="relative w-full sm:w-80">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search description, vendor..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:border-black"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
              <select
                value={selectedExpenseCategory}
                onChange={(e) => setSelectedExpenseCategory(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 rounded-xl px-3 py-2 outline-none cursor-pointer"
              >
                <option value="All">All Categories</option>
                {EXPENSE_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <button
                onClick={() => exportService.exportToCsv('agx_expenses', filteredExpenses.map(e => ({
                  Description: e.description,
                  Category: e.category,
                  Vendor: e.vendor || 'N/A',
                  Project: e.projectName || 'Internal',
                  Date: e.expenseDate,
                  AmountINR: e.amount
                })))}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <Download size={13} /> Export CSV
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Expense Description</th>
                  <th className="py-3.5 px-3">Category</th>
                  <th className="py-3.5 px-3">Vendor</th>
                  <th className="py-3.5 px-3">Project Allocation</th>
                  <th className="py-3.5 px-3">Date</th>
                  <th className="py-3.5 px-3">Amount</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400 text-xs">
                      No expenses logged matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((e) => (
                    <tr key={e.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-gray-900">{e.description}</td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-gray-100 text-gray-800">
                          {e.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-gray-600">{e.vendor || 'Direct'}</td>
                      <td className="py-3.5 px-3 text-indigo-600 font-semibold">{e.projectName || 'Agency Overhead'}</td>
                      <td className="py-3.5 px-3 text-gray-500">{e.expenseDate}</td>
                      <td className="py-3.5 px-3 font-black text-rose-600">-₹{e.amount.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setExpenseToDelete(e)}
                          className="p-1 text-gray-400 hover:text-rose-600 rounded cursor-pointer"
                          title="Delete Expense"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: PROFIT & LOSS (P&L) */}
      {activeTab === 'Profit & Loss' && (
        <div className="space-y-6">
          {/* Income Statement */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="font-extrabold text-lg text-gray-900">Project & Agency Profitability Statement</h3>
                <p className="text-xs text-gray-400">P&L Formula: Net Operating Profit = Gross Inflow (₹) − Total Direct Outflow (₹)</p>
              </div>
              <button
                onClick={() => exportService.exportToCsv('agx_pnl_statement', [
                  { Metric: 'Gross Invoiced Revenue', AmountINR: grossInvoiced },
                  { Metric: 'Collected Revenue Inflow', AmountINR: totalRevenue },
                  { Metric: 'Direct Operating Expenses', AmountINR: directExpensesTotal || 0 },
                  { Metric: 'Partner Referral Commissions', AmountINR: partnerPayoutsTotal || 0 },
                  { Metric: 'Total Consolidated Expenses', AmountINR: totalExpenses },
                  { Metric: 'Net Operating Profit', AmountINR: netProfit },
                  { Metric: 'Profit Margin', AmountINR: `${profitMargin}%` }
                ])}
                className="px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer"
              >
                <Download size={14} /> Export P&L CSV
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-gray-100 font-semibold text-gray-700">
                <span>Gross Invoiced Value</span>
                <span className="font-bold text-gray-900">₹{grossInvoiced.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100 font-semibold text-gray-700">
                <span>Collected Inflow Revenue (Cash Received)</span>
                <span className="font-black text-emerald-600">+₹{totalRevenue.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100 font-semibold text-gray-700">
                <span>Direct Operating Expenditures (Vendor & Tools)</span>
                <span className="font-black text-rose-600">-₹{(directExpensesTotal || 0).toLocaleString('en-IN')}</span>
              </div>
              {(partnerPayoutsTotal || 0) > 0 && (
                <div className="flex items-center justify-between py-2 border-b border-gray-100 font-semibold text-gray-700">
                  <span className="flex items-center gap-1.5 text-amber-700">
                    <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
                    Partner Referral Commissions Paid Out
                  </span>
                  <span className="font-black text-amber-600">-₹{(partnerPayoutsTotal || 0).toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex items-center justify-between py-2 border-b border-gray-100 font-semibold text-gray-700 bg-gray-50 px-2 rounded-lg">
                <span className="font-bold text-gray-900">Total Consolidated Outflows</span>
                <span className="font-black text-rose-600">-₹{totalExpenses.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-950 text-white rounded-2xl font-bold mt-4">
                <div>
                  <span className="text-sm block">Net Operational Profit</span>
                  <span className="text-[11px] text-gray-400 font-normal">Aggregated across all production client pipelines</span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-[#CCFF00] block">₹{netProfit.toLocaleString('en-IN')}</span>
                  <span className="text-xs text-emerald-400 font-medium">{profitMargin}% Net Margin</span>
                </div>
              </div>
            </div>
          </div>

          {/* Project-by-Project Profitability Breakdown */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-extrabold text-base text-gray-900">Project-by-Project Profitability Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Project Name</th>
                    <th className="py-3 px-3">Client</th>
                    <th className="py-3 px-3">Contract / Billed</th>
                    <th className="py-3 px-3">Realized Revenue</th>
                    <th className="py-3 px-3">Direct Expenses</th>
                    <th className="py-3 px-3">Net Profit</th>
                    <th className="py-3 px-4 text-right">Margin %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {projectProfitability.map((proj) => (
                    <tr key={proj.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-gray-900">{proj.name}</td>
                      <td className="py-3 px-3 text-gray-600">{proj.clientName}</td>
                      <td className="py-3 px-3 font-semibold">₹{proj.billed.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3 font-bold text-emerald-600">₹{proj.revenue.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3 font-bold text-rose-600">₹{proj.directExpense.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3 font-extrabold text-gray-900">₹{proj.net.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          proj.margin >= 50 ? 'bg-emerald-100 text-emerald-800' :
                          proj.margin >= 20 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {proj.margin}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Create Invoice Modal */}
      {isInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <div>
                <h3 className="font-extrabold text-lg text-gray-900">Generate Client Invoice</h3>
                <span className="text-xs text-gray-400">Issue GST Tax Invoice or Non-GST Commercial Invoice</span>
              </div>
              <button onClick={() => setIsInvoiceModalOpen(false)} className="p-1 text-gray-400 hover:text-black cursor-pointer"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
              {/* GST vs Non-GST Selector */}
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-2">
                <label className="block font-bold text-gray-800 text-xs">Invoice Billing Format *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewInvoice({ ...newInvoice, isGst: true, taxRate: 18, gstType: 'IGST' })}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      newInvoice.isGst
                        ? 'bg-black text-white shadow-md'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <Building size={14} className={newInvoice.isGst ? 'text-[#CCFF00]' : 'text-gray-400'} />
                    <span>GST Tax Invoice</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewInvoice({ ...newInvoice, isGst: false, taxRate: 0 })}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      !newInvoice.isGst
                        ? 'bg-black text-white shadow-md'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <FileText size={14} className={!newInvoice.isGst ? 'text-[#CCFF00]' : 'text-gray-400'} />
                    <span>Non-GST Invoice</span>
                  </button>
                </div>

                {newInvoice.isGst ? (
                  <div className="pt-2 border-t border-gray-200/60 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div>
                      <label className="block font-bold text-gray-600 mb-1 text-[11px]">GST Supply Type</label>
                      <select
                        value={newInvoice.gstType}
                        onChange={(e) => setNewInvoice({ ...newInvoice, gstType: e.target.value as GstType })}
                        className="w-full bg-white border border-gray-200 rounded-xl p-2 text-xs outline-none cursor-pointer"
                      >
                        <option value="IGST">Inter-State (IGST)</option>
                        <option value="CGST_SGST">Intra-State (CGST+SGST)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-gray-600 mb-1 text-[11px]">Tax Rate</label>
                      <select
                        value={newInvoice.taxRate}
                        onChange={(e) => setNewInvoice({ ...newInvoice, taxRate: Number(e.target.value) })}
                        className="w-full bg-white border border-gray-200 rounded-xl p-2 text-xs outline-none cursor-pointer font-bold"
                      >
                        <option value={18}>18% GST (Standard)</option>
                        <option value={12}>12% GST</option>
                        <option value={5}>5% GST</option>
                        <option value={28}>28% GST</option>
                        <option value={0}>0% (Exempt)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-gray-600 mb-1 text-[11px]">Client GSTIN</label>
                      <input
                        type="text"
                        value={newInvoice.clientGstin}
                        onChange={(e) => setNewInvoice({ ...newInvoice, clientGstin: e.target.value })}
                        placeholder="e.g. 29ABCDE1234F1Z5"
                        className="w-full bg-white border border-gray-200 rounded-xl p-2 text-xs outline-none font-mono uppercase"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-gray-200/60">
                    <span className="text-[11px] text-gray-500 block">
                      ✨ <strong>Non-GST Commercial Invoice:</strong> 0% tax applied. Suitable for international export of services under LUT, unregistered entities, or non-taxable supply.
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Invoice Number *</label>
                  <input type="text" required value={newInvoice.invoiceNumber} onChange={(e) => setNewInvoice({ ...newInvoice, invoiceNumber: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black font-mono" />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Client Account *</label>
                  <select
                    value={newInvoice.clientId}
                    onChange={(e) => {
                      const c = clients.find(cl => cl.id === e.target.value);
                      const clientProjects = projects.filter(p => p.clientId === e.target.value);
                      setNewInvoice({
                        ...newInvoice,
                        clientId: e.target.value,
                        clientName: c ? c.company : '',
                        clientGstin: c?.gstTaxId || '',
                        isGst: c?.gstTaxId ? true : newInvoice.isGst,
                        projectId: clientProjects[0]?.id || '',
                        projectName: clientProjects[0]?.name || ''
                      });
                    }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none cursor-pointer"
                  >
                    {clients.map(c => (<option key={c.id} value={c.id}>{c.company}</option>))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Project Allocation</label>
                  <select
                    value={newInvoice.projectId}
                    onChange={(e) => {
                      const p = projects.find(pr => pr.id === e.target.value);
                      setNewInvoice({ ...newInvoice, projectId: e.target.value, projectName: p ? p.name : '' });
                    }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none cursor-pointer"
                  >
                    <option value="">General Retainer / No Project</option>
                    {projects.filter(p => !newInvoice.clientId || p.clientId === newInvoice.clientId).map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Due Date</label>
                  <input type="date" value={newInvoice.dueDate} onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black" />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Line Item Description *</label>
                <input type="text" required value={newInvoice.itemDesc} onChange={(e) => setNewInvoice({ ...newInvoice, itemDesc: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Subtotal Amount (₹) *</label>
                  <input type="number" required value={newInvoice.itemPrice} onChange={(e) => setNewInvoice({ ...newInvoice, itemPrice: Number(e.target.value) })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black" />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Grand Total (₹)</label>
                  <div className="w-full bg-gray-100 border border-gray-200 rounded-xl p-2.5 font-black text-gray-900 flex justify-between items-center">
                    <span>₹{Math.round(newInvoice.itemPrice * (1 + (newInvoice.isGst ? (newInvoice.taxRate || 0) : 0) / 100)).toLocaleString('en-IN')}</span>
                    <span className="text-[10px] text-gray-500 font-normal">
                      {newInvoice.isGst ? `incl. ₹${Math.round(newInvoice.itemPrice * (newInvoice.taxRate || 0) / 100).toLocaleString('en-IN')} GST` : '0% Tax'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button type="button" onClick={() => setIsInvoiceModalOpen(false)} className="px-4 py-2.5 rounded-xl border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-bold shadow-md cursor-pointer">Generate & Send Invoice</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Invoice Modal */}
      {editingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <div>
                <h3 className="font-extrabold text-lg text-gray-900">Edit Invoice</h3>
                <span className="text-xs text-gray-400">{editingInvoice.invoiceNumber}</span>
              </div>
              <button onClick={() => setEditingInvoice(null)} className="p-1 text-gray-400 hover:text-black cursor-pointer"><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveEditInvoice} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Invoice Number</label>
                  <input type="text" value={editingInvoice.invoiceNumber} onChange={(e) => setEditingInvoice({ ...editingInvoice, invoiceNumber: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black" />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Status</label>
                  <select value={editingInvoice.status} onChange={(e) => setEditingInvoice({ ...editingInvoice, status: e.target.value as InvoiceStatus })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none cursor-pointer">
                    <option value="Draft">Draft</option>
                    <option value="Sent">Sent</option>
                    <option value="Paid">Paid</option>
                    <option value="Overdue">Overdue</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* GST vs Non-GST Switcher in Edit */}
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-800">Invoice Classification</span>
                  <button
                    type="button"
                    onClick={() => setEditingInvoice({ ...editingInvoice, isGst: !editingInvoice.isGst })}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      editingInvoice.isGst !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    {editingInvoice.isGst !== false ? '🏢 GST Tax Invoice' : '📄 Non-GST Invoice'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Subtotal (₹)</label>
                  <input type="number" value={editingInvoice.subtotal} onChange={(e) => setEditingInvoice({ ...editingInvoice, subtotal: Number(e.target.value) })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black" />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Due Date</label>
                  <input type="date" value={editingInvoice.dueDate} onChange={(e) => setEditingInvoice({ ...editingInvoice, dueDate: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black" />
                </div>
              </div>
              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button type="button" onClick={() => setEditingInvoice(null)} className="px-4 py-2.5 rounded-xl border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-black text-white font-bold shadow-md cursor-pointer">Save Changes</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Record Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <h3 className="font-extrabold text-lg text-gray-900">Record Incoming Payment</h3>
              <button onClick={() => setIsPaymentModalOpen(false)} className="p-1 text-gray-400 hover:text-black cursor-pointer"><X size={18} /></button>
            </div>
            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Client Account *</label>
                  <select
                    value={newPayment.clientId}
                    onChange={(e) => {
                      const c = clients.find(cl => cl.id === e.target.value);
                      const clientInvoices = invoices.filter(i => i.clientId === e.target.value && i.status !== 'Paid');
                      setNewPayment({
                        ...newPayment,
                        clientId: e.target.value,
                        clientName: c ? c.company : '',
                        invoiceId: clientInvoices[0]?.id || '',
                        amount: clientInvoices[0]?.total || 15000
                      });
                    }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none cursor-pointer"
                  >
                    {clients.map(c => (<option key={c.id} value={c.id}>{c.company}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Amount (₹) *</label>
                  <input type="number" required value={newPayment.amount} onChange={(e) => setNewPayment({ ...newPayment, amount: Number(e.target.value) })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black" />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Linked Invoice</label>
                <select
                  value={newPayment.invoiceId}
                  onChange={(e) => {
                    const inv = invoices.find(i => i.id === e.target.value);
                    setNewPayment({
                      ...newPayment,
                      invoiceId: e.target.value,
                      amount: inv ? inv.total : newPayment.amount
                    });
                  }}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none cursor-pointer"
                >
                  <option value="">Direct Client Payment / No Invoice</option>
                  {invoices.filter(i => !newPayment.clientId || i.clientId === newPayment.clientId).map(i => (
                    <option key={i.id} value={i.id}>{i.invoiceNumber} - ₹{i.total.toLocaleString('en-IN')} ({i.status})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Payment Method</label>
                  <select value={newPayment.paymentMethod} onChange={(e) => setNewPayment({ ...newPayment, paymentMethod: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none cursor-pointer">
                    <option value="Bank Wire">Bank Wire</option>
                    <option value="Stripe">Stripe</option>
                    <option value="UPI">UPI</option>
                    <option value="PayPal">PayPal</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Transaction Ref ID</label>
                  <input type="text" value={newPayment.transactionId} onChange={(e) => setNewPayment({ ...newPayment, transactionId: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black" />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="px-4 py-2.5 rounded-xl border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md cursor-pointer">Confirm Payment</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Add Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <h3 className="font-extrabold text-lg text-gray-900">Record Operational Expense</h3>
              <button onClick={() => setIsExpenseModalOpen(false)} className="p-1 text-gray-400 hover:text-black cursor-pointer"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateExpense} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Category</label>
                  <select value={newExpense.category} onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value as ExpenseCategory })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none cursor-pointer">
                    <option value="Developer Cost">Developer Cost</option>
                    <option value="SaaS Tools">SaaS Tools / APIs</option>
                    <option value="Infrastructure/Cloud">Cloud & Database</option>
                    <option value="Marketing/Ads">Marketing / Ads</option>
                    <option value="Office">Office / Misc</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Amount (₹) *</label>
                  <input type="number" required value={newExpense.amount} onChange={(e) => setNewExpense({ ...newExpense, amount: Number(e.target.value) })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black" />
                </div>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Expense Description *</label>
                <input type="text" required value={newExpense.description} onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })} placeholder="e.g. OpenAI GPT-4o API Batch Ingest" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Vendor Name</label>
                  <input type="text" value={newExpense.vendor} onChange={(e) => setNewExpense({ ...newExpense, vendor: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black" />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Project Allocation</label>
                  <select value={newExpense.projectId} onChange={(e) => setNewExpense({ ...newExpense, projectId: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none cursor-pointer">
                    <option value="">Agency Overhead</option>
                    {projects.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
                  </select>
                </div>
              </div>
              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button type="button" onClick={() => setIsExpenseModalOpen(false)} className="px-4 py-2.5 rounded-xl border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-gray-900 text-white font-bold shadow-md cursor-pointer">Save Expense</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Invoice Confirmation */}
      {invoiceToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 size={24} />
            </div>
            <h3 className="font-extrabold text-base text-gray-900 mb-1">Delete Invoice?</h3>
            <p className="text-xs text-gray-500 mb-5">
              Are you sure you want to permanently delete <strong>{invoiceToDelete.invoiceNumber}</strong>?
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setInvoiceToDelete(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 font-bold text-xs text-gray-600 hover:bg-gray-50 cursor-pointer">Cancel</button>
              <button onClick={() => { deleteInvoice(invoiceToDelete.id); setInvoiceToDelete(null); }} className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md cursor-pointer">Delete</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Payment Confirmation */}
      {paymentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 size={24} />
            </div>
            <h3 className="font-extrabold text-base text-gray-900 mb-1">Delete Payment?</h3>
            <p className="text-xs text-gray-500 mb-5">
              Are you sure you want to delete payment of <strong>₹{paymentToDelete.amount.toLocaleString('en-IN')}</strong>?
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPaymentToDelete(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 font-bold text-xs text-gray-600 hover:bg-gray-50 cursor-pointer">Cancel</button>
              <button onClick={() => { deletePayment(paymentToDelete.id); setPaymentToDelete(null); }} className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md cursor-pointer">Delete</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Expense Confirmation */}
      {expenseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 size={24} />
            </div>
            <h3 className="font-extrabold text-base text-gray-900 mb-1">Delete Expense?</h3>
            <p className="text-xs text-gray-500 mb-5">
              Are you sure you want to delete expense <strong>{expenseToDelete.description}</strong>?
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setExpenseToDelete(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 font-bold text-xs text-gray-600 hover:bg-gray-50 cursor-pointer">Cancel</button>
              <button onClick={() => { deleteExpense(expenseToDelete.id); setExpenseToDelete(null); }} className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md cursor-pointer">Delete</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* In-App Printable Invoice Preview Modal */}
      <InvoicePreviewModal
        invoice={previewInvoice}
        onClose={() => setPreviewInvoice(null)}
      />
    </div>
  );
};
