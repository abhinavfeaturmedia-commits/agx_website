import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, Plus, Search, Building, Phone, Mail, Globe, MapPin, IndianRupee,
  Briefcase, CheckSquare, FileText, Key, Clock, MoreVertical, X,
  Shield, Calendar, ArrowRight, ExternalLink, Edit3, Trash2, Download,
  TrendingUp, Layers, CheckCircle2, AlertCircle, ArrowUpRight, Sparkles,
  MessageSquare, UserCheck, CreditCard, ShieldCheck, Lock
} from 'lucide-react';
import { Client } from '../../types/crm';
import { useCrmStore } from '../../lib/crmStore';
import { exportService } from '../../lib/exportService';
import { toast } from '../../lib/toastStore';

interface ClientsViewProps {
  store: ReturnType<typeof useCrmStore>;
  onNavigate: (route: string, entityId?: string) => void;
  initialSelectedId?: string;
}

const getMonogramGradient = (name: string) => {
  const charCode = (name || 'AG').charCodeAt(0) || 65;
  const gradients = [
    'from-indigo-500 to-purple-600',
    'from-blue-500 to-cyan-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-pink-600',
    'from-purple-500 to-indigo-600'
  ];
  return gradients[charCode % gradients.length];
};

export const ClientsView: React.FC<ClientsViewProps> = ({ store, onNavigate, initialSelectedId }) => {
  const {
    clients, addClient, updateClient, deleteClient, projects, invoices, payments, agreements,
    documents, tasks, credentials, teamMembers, leads, currentUser, events, addCalendarEvent
  } = store;

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedManager, setSelectedManager] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'value' | 'outstanding' | 'recent' | 'company'>('value');

  // Modals & Drawer State
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [active360Tab, setActive360Tab] = useState<
    'Overview & Health' | 'Commercials & Invoices' | 'Operations & Sprints' | 'Documents & Specs' | 'Vault Credentials' | 'Communications & Notes'
  >('Overview & Health');
  const [clientNoteInput, setClientNoteInput] = useState('');
  const [newMeetingTitle, setNewMeetingTitle] = useState('');
  const [newMeetingDate, setNewMeetingDate] = useState('');
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  // Auto-open client 360 drawer if navigated with ID or quick create
  useEffect(() => {
    if (initialSelectedId === 'new') {
      setIsAddClientModalOpen(true);
      onNavigate('clients', undefined);
    } else if (initialSelectedId) {
      const match = clients.find(c => c.id === initialSelectedId);
      if (match) setSelectedClient(match);
      onNavigate('clients', undefined);
    }
  }, [initialSelectedId]);

  // Form State for new client
  const [newClientData, setNewClientData] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    industry: 'Enterprise Technology',
    gstTaxId: '',
    accountManager: currentUser?.fullName || 'Abhinav',
    totalValue: 25000,
    totalPaid: 0,
    outstandingAmount: 25000,
    source: 'Inbound Referral',
    notes: '',
    status: 'Active' as const
  });

  // Dynamic filter options extraction
  const dynamicIndustries = useMemo(() => {
    const set = new Set<string>();
    clients.forEach(c => {
      if (c.industry) set.add(c.industry);
    });
    return Array.from(set);
  }, [clients]);

  const dynamicManagers = useMemo(() => {
    const set = new Set<string>();
    teamMembers.forEach(m => set.add(m.fullName));
    clients.forEach(c => {
      if (c.accountManager) set.add(c.accountManager);
    });
    return Array.from(set);
  }, [teamMembers, clients]);

  // Dynamic Financial Reconciled Helper
  const getClientFinancials = (client: Client) => {
    const linkedProjects = projects.filter(p => p.clientId === client.id || p.clientName === client.company);
    const linkedInvoices = invoices.filter(i => i.clientId === client.id || i.clientName === client.company);
    const linkedPayments = payments.filter(p => p.clientId === client.id || p.clientName === client.company);

    const paidSum = linkedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalPaid = paidSum > 0 ? paidSum : (client.totalPaid || 0);

    const projectSum = linkedProjects.reduce((sum, p) => sum + (p.projectValue || 0), 0);
    // Invoices not linked to any of the client's projects are independent billings (consulting, retainers, ad-hoc)
    const independentInvoicesSum = linkedInvoices
      .filter(i => !i.projectId || !linkedProjects.some(p => p.id === i.projectId))
      .reduce((sum, i) => sum + (i.total || 0), 0);

    const totalValue = (projectSum > 0 || independentInvoicesSum > 0)
      ? (projectSum + independentInvoicesSum)
      : (linkedInvoices.length > 0
          ? linkedInvoices.reduce((sum, i) => sum + (i.total || 0), 0)
          : (client.totalValue || 0));

    const outstandingAmount = Math.max(0, totalValue - totalPaid);

    return { totalValue, totalPaid, outstandingAmount, linkedProjects, linkedInvoices, linkedPayments };
  };

  // Top Portfolio Summary Metrics
  const portfolioMetrics = useMemo(() => {
    let totalPortfolioVal = 0;
    let totalCollectedVal = 0;
    let totalOutstandingVal = 0;

    clients.forEach(c => {
      const { totalValue, totalPaid, outstandingAmount } = getClientFinancials(c);
      totalPortfolioVal += totalValue;
      totalCollectedVal += totalPaid;
      totalOutstandingVal += outstandingAmount;
    });

    const activeAccounts = clients.filter(c => c.status === 'Active').length;
    const activeSprints = projects.filter(p => p.status === 'IN PROGRESS').length;

    return {
      totalPortfolioVal,
      totalCollectedVal,
      totalOutstandingVal,
      activeAccounts,
      activeSprints
    };
  }, [clients, projects, invoices, payments]);

  // Unified Chronological Activity Timeline for Selected Client
  const clientActivityTimeline = useMemo(() => {
    if (!selectedClient) return [];
    const timeline: {
      id: string;
      title: string;
      description: string;
      category: string;
      date: string;
      badge: string;
      iconType: 'lead' | 'agreement' | 'project' | 'invoice' | 'payment';
    }[] = [];

    // 1. Lead Origin
    const origLead = leads.find(l => 
      l.convertedClientId === selectedClient.id || 
      (l.company && l.company.toLowerCase().trim() === selectedClient.company.toLowerCase().trim())
    );
    if (origLead) {
      timeline.push({
        id: `lead-${origLead.id}`,
        title: `Lead Acquired & Won (${origLead.source})`,
        description: `Prospect inquired for ${origLead.interestedService} (Est: ₹${(origLead.estimatedDealValue || 0).toLocaleString('en-IN')}). Converted to client account.`,
        category: 'Sales Inbound',
        date: origLead.createdAt,
        badge: 'bg-blue-100 text-blue-800 border-blue-200',
        iconType: 'lead'
      });
    }

    // 2. Legal Agreements
    const cAgreements = agreements.filter(a => a.clientId === selectedClient.id || a.clientName === selectedClient.company);
    cAgreements.forEach(a => {
      timeline.push({
        id: `agr-${a.id}`,
        title: `${a.name} (${a.agreementType})`,
        description: `Commercial agreement valued at ₹${(a.commercialValue || 0).toLocaleString('en-IN')} signed. Status: ${a.status}.`,
        category: 'Legal & Contract',
        date: a.signedDate || a.startDate || a.createdAt,
        badge: a.status === 'Signed' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-amber-100 text-amber-800 border-amber-200',
        iconType: 'agreement'
      });
    });

    // 3. Projects & Milestones
    const cProjects = projects.filter(p => p.clientId === selectedClient.id || p.clientName === selectedClient.company);
    cProjects.forEach(p => {
      timeline.push({
        id: `proj-${p.id}`,
        title: `Project Initialized: ${p.name}`,
        description: `Service offering: ${p.serviceType}. Target due date: ${p.dueDate || 'Ongoing'}. Status: ${p.status}.`,
        category: 'Engineering Sprint',
        date: p.startDate || p.createdAt,
        badge: 'bg-purple-100 text-purple-800 border-purple-200',
        iconType: 'project'
      });

      (p.milestones || []).forEach(m => {
        if (m.status === 'Completed') {
          timeline.push({
            id: `mile-${m.id}`,
            title: `Milestone Achieved: ${m.title}`,
            description: `Deliverable verified for project ${p.name}. Commercial value ₹${(m.amount || 0).toLocaleString('en-IN')}.`,
            category: 'Delivery Milestone',
            date: m.dueDate || p.updatedAt,
            badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
            iconType: 'project'
          });
        }
      });
    });

    // 4. Invoices
    const cInvoices = invoices.filter(i => i.clientId === selectedClient.id || i.clientName === selectedClient.company);
    cInvoices.forEach(i => {
      timeline.push({
        id: `inv-${i.id}`,
        title: `Invoice Billed: ${i.invoiceNumber}`,
        description: `Tax/Commercial Invoice raised for ₹${(i.total || 0).toLocaleString('en-IN')}. Status: ${i.status}. Due: ${i.dueDate}.`,
        category: 'Accounts Receivable',
        date: i.issueDate || i.createdAt,
        badge: i.status === 'Paid' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-rose-100 text-rose-800 border-rose-200',
        iconType: 'invoice'
      });
    });

    // 5. Payments
    const cPayments = payments.filter(p => p.clientId === selectedClient.id || p.clientName === selectedClient.company);
    cPayments.forEach(p => {
      timeline.push({
        id: `pay-${p.id}`,
        title: `Payment Received: ₹${(p.amount || 0).toLocaleString('en-IN')}`,
        description: `Settled via ${p.paymentMethod || 'Bank Wire'} (Ref: ${p.transactionId || 'Direct'}). Recorded in ledger.`,
        category: 'Treasury & Revenue',
        date: p.paymentDate || p.createdAt,
        badge: 'bg-lime-100 text-lime-800 border-lime-200',
        iconType: 'payment'
      });
    });

    // Chronological sort: newest first
    return timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [selectedClient, leads, agreements, projects, invoices, payments]);

  // Filter and Sort Clients
  const filteredClients = useMemo(() => {
    let result = clients.filter(c => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        c.company.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        (c.industry && c.industry.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.address && c.address.toLowerCase().includes(q));

      const matchesIndustry = selectedIndustry === 'All' || c.industry === selectedIndustry;
      const matchesStatus = selectedStatus === 'All' || c.status === selectedStatus;
      const matchesManager = selectedManager === 'All' || c.accountManager === selectedManager;

      return matchesSearch && matchesIndustry && matchesStatus && matchesManager;
    });

    return result.sort((a, b) => {
      const finA = getClientFinancials(a);
      const finB = getClientFinancials(b);

      if (sortBy === 'value') return finB.totalValue - finA.totalValue;
      if (sortBy === 'outstanding') return finB.outstandingAmount - finA.outstandingAmount;
      if (sortBy === 'company') return a.company.localeCompare(b.company);
      return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
    });
  }, [clients, searchQuery, selectedIndustry, selectedStatus, selectedManager, sortBy, projects, invoices, payments]);

  // Client Action Handlers
  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientData.company.trim() || !newClientData.name.trim()) {
      toast.error('Validation Error', 'Please provide company name and primary contact.');
      return;
    }
    addClient(newClientData);
    setIsAddClientModalOpen(false);
    setNewClientData({
      name: '',
      company: '',
      phone: '',
      email: '',
      website: '',
      address: '',
      industry: 'Enterprise Technology',
      gstTaxId: '',
      accountManager: currentUser?.fullName || 'Abhinav',
      totalValue: 25000,
      totalPaid: 0,
      outstandingAmount: 25000,
      source: 'Inbound Referral',
      notes: '',
      status: 'Active'
    });
  };

  const handleSaveEditClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;
    updateClient(editingClient.id, editingClient);
    if (selectedClient?.id === editingClient.id) {
      setSelectedClient(editingClient);
    }
    setEditingClient(null);
  };

  const handleConfirmDelete = () => {
    if (!clientToDelete) return;
    deleteClient(clientToDelete.id);
    if (selectedClient?.id === clientToDelete.id) {
      setSelectedClient(null);
    }
    setClientToDelete(null);
  };

  const handleExportCsv = () => {
    exportService.exportToCsv('agx_clients_directory', filteredClients.map(c => {
      const fin = getClientFinancials(c);
      return {
        ID: c.id,
        Company: c.company,
        ContactName: c.name,
        Email: c.email,
        Phone: c.phone || '',
        Address: c.address || '',
        GSTIN: c.gstTaxId || 'N/A',
        Industry: c.industry || 'General',
        TotalContractINR: fin.totalValue,
        TotalPaidINR: fin.totalPaid,
        OutstandingINR: fin.outstandingAmount,
        AccountManager: c.accountManager,
        Status: c.status,
        Source: c.source,
        CreatedAt: c.createdAt
      };
    }));
  };

  // Communication Handlers
  const handleOpenWhatsApp = (client: Client) => {
    const rawNumber = client.phone || '';
    const cleanNumber = rawNumber.replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanNumber.length === 10 ? `91${cleanNumber}` : cleanNumber;
    const message = encodeURIComponent(`Hi ${client.name}, this is ${currentUser?.fullName || 'Abhinav'} from AGXperience. Checking in on deliverables and project updates for ${client.company}.`);
    window.open(`https://wa.me/${phoneWithCountry}?text=${message}`, '_blank');
  };

  const handleOpenCall = (client: Client) => {
    if (client.phone) {
      window.location.href = `tel:${client.phone}`;
    }
  };

  const handleOpenEmail = (client: Client) => {
    if (client.email) {
      const subject = encodeURIComponent(`AGXperience Account Executive Update • ${client.company}`);
      window.location.href = `mailto:${client.email}?subject=${subject}`;
    }
  };

  // Current client in 360 drawer with reactive updates
  const currentClient = selectedClient
    ? (clients.find(c => c.id === selectedClient.id) || selectedClient)
    : null;

  // Selected client's linked entities
  const clientProjects = currentClient ? projects.filter(p => p.clientId === currentClient.id || p.clientName === currentClient.company) : [];
  const clientInvoices = currentClient ? invoices.filter(i => i.clientId === currentClient.id || i.clientName === currentClient.company) : [];
  const clientPayments = currentClient ? payments.filter(p => p.clientId === currentClient.id || p.clientName === currentClient.company) : [];
  const clientAgreements = currentClient ? agreements.filter(a => a.clientId === currentClient.id || a.clientName === currentClient.company) : [];
  const clientDocs = currentClient ? documents.filter(d => d.clientId === currentClient.id || d.clientName === currentClient.company) : [];
  const clientTasks = currentClient ? tasks.filter(t => t.clientId === currentClient.id || t.clientName === currentClient.company) : [];
  const clientCreds = currentClient ? credentials.filter(c => c.clientId === currentClient.id || c.clientName === currentClient.company) : [];
  const clientEvents = currentClient ? events.filter(e => e.relatedClientId === currentClient.id) : [];

  useEffect(() => {
    if (currentClient) {
      setClientNoteInput(currentClient.notes || '');
    }
  }, [currentClient?.id]);

  const currentClientFin = currentClient ? getClientFinancials(currentClient) : null;

  // Computed Client Health Score (0 - 100%)
  const clientHealth = useMemo(() => {
    if (!currentClient || !currentClientFin) {
      return {
        score: 100,
        label: 'Optimal',
        statusDesc: 'Account active with healthy indicators',
        strokeColor: '#10B981',
        textColor: 'text-emerald-700',
        bgBadge: 'bg-emerald-50 text-emerald-700 border-emerald-200'
      };
    }
    
    let score = 40; // Baseline score
    
    // Status weight (max 20 pts)
    if (currentClient.status === 'Active') {
      score += 20;
    } else {
      score += 5;
    }

    // Payment collection weight (max 30 pts)
    if (currentClientFin.totalValue > 0) {
      const collectionRatio = currentClientFin.totalPaid / currentClientFin.totalValue;
      score += Math.round(collectionRatio * 20);
      if (currentClientFin.outstandingAmount === 0 && currentClientFin.totalPaid > 0) {
        score += 10;
      } else if (currentClientFin.outstandingAmount > 0 && collectionRatio >= 0.5) {
        score += 5;
      }
    } else {
      // If no billing yet, award standard baseline points
      score += 20;
    }

    // Engagement & Pipeline activity (max 10 pts)
    if (clientProjects.length > 0 || clientAgreements.length > 0) {
      score += 10;
    } else if (clientTasks.length > 0) {
      score += 5;
    }

    const finalScore = Math.min(Math.max(score, 15), 100);

    if (finalScore >= 80) {
      return {
        score: finalScore,
        label: 'Prime Account',
        statusDesc: 'Flawless payment velocity & active enterprise pipeline',
        strokeColor: '#10B981',
        textColor: 'text-emerald-700',
        bgBadge: 'bg-emerald-50 text-emerald-700 border-emerald-200'
      };
    } else if (finalScore >= 55) {
      return {
        score: finalScore,
        label: 'In Good Standing',
        statusDesc: 'Active commercial relationship with standard receivables',
        strokeColor: '#F59E0B',
        textColor: 'text-amber-700',
        bgBadge: 'bg-amber-50 text-amber-700 border-amber-200'
      };
    } else {
      return {
        score: finalScore,
        label: 'Attention Required',
        statusDesc: 'Overdue receivables or inactive contract status',
        strokeColor: '#EF4444',
        textColor: 'text-rose-700',
        bgBadge: 'bg-rose-50 text-rose-700 border-rose-200'
      };
    }
  }, [currentClient, currentClientFin, clientProjects, clientAgreements, clientTasks]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            Client Management & 360° Directory
          </h2>
          <p className="text-xs text-gray-500">
            Single source of truth for accounts, agreements, financials, projects, and secure credentials.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold text-xs shadow-2xs transition-colors cursor-pointer"
          >
            <Download size={14} /> Export CSV
          </button>

          <div className="flex items-center bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-black shadow-xs' : 'text-gray-500 hover:text-black'
              }`}
            >
              Grid Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-black shadow-xs' : 'text-gray-500 hover:text-black'
              }`}
            >
              Directory Table
            </button>
          </div>

          <button
            onClick={() => setIsAddClientModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-bold text-xs shadow-md transition-colors cursor-pointer"
          >
            <Plus size={15} /> Add Client
          </button>
        </div>
      </div>

      {/* Row 1: KPI Metrics with Double-Bezel Architecture */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="double-bezel-outer card-tactile">
          <div className="double-bezel-inner p-5 flex items-start justify-between">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Portfolio Value</span>
              <span className="text-2xl font-black text-gray-900 mt-1 block tabular-nums">
                ₹{portfolioMetrics.totalPortfolioVal.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-indigo-600 font-bold flex items-center gap-1 mt-1 tabular-nums">
                <TrendingUp size={13} /> {clients.length} Total Accounts
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shadow-xs">
              <IndianRupee size={18} />
            </div>
          </div>
        </div>

        <div className="double-bezel-outer card-tactile">
          <div className="double-bezel-inner p-5 flex items-start justify-between">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Revenue Collected</span>
              <span className="text-2xl font-black text-emerald-600 mt-1 block tabular-nums">
                ₹{portfolioMetrics.totalCollectedVal.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-emerald-700 font-bold flex items-center gap-1 mt-1 tabular-nums">
                <CheckCircle2 size={13} /> {(portfolioMetrics.totalPortfolioVal > 0 ? Math.round((portfolioMetrics.totalCollectedVal / portfolioMetrics.totalPortfolioVal) * 100) : 0)}% Realized
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
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Outstanding Receivables</span>
              <span className="text-2xl font-black text-amber-600 mt-1 block tabular-nums">
                ₹{portfolioMetrics.totalOutstandingVal.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-amber-700 font-bold flex items-center gap-1 mt-1 tabular-nums">
                <Clock size={13} /> Pending Collections
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shadow-xs">
              <Layers size={18} />
            </div>
          </div>
        </div>

        <div className="double-bezel-outer card-tactile">
          <div className="double-bezel-inner p-5 flex items-start justify-between">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Active Accounts</span>
              <span className="text-2xl font-black text-purple-600 mt-1 block tabular-nums">
                {portfolioMetrics.activeAccounts} Active
              </span>
              <span className="text-xs text-purple-700 font-bold flex items-center gap-1 mt-1 tabular-nums">
                <Briefcase size={13} /> {portfolioMetrics.activeSprints} Live Sprints
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold shadow-xs">
              <UserCheck size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Search & Dynamic Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clients by company, contact name, industry, email..."
              className="w-full bg-gray-50 hover:bg-gray-100/60 focus:bg-white border border-gray-200 rounded-xl pl-9 pr-8 py-2 text-xs text-gray-800 outline-none focus:border-black transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Dynamic Industry Filter */}
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 rounded-xl px-3 py-2 outline-none cursor-pointer hover:border-gray-300 max-w-[180px] truncate"
            >
              <option value="All">All Industries ({dynamicIndustries.length})</option>
              {dynamicIndustries.map(ind => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 rounded-xl px-3 py-2 outline-none cursor-pointer hover:border-gray-300"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="On Hold">On Hold</option>
            </select>

            {/* Account Manager Filter */}
            <select
              value={selectedManager}
              onChange={(e) => setSelectedManager(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 rounded-xl px-3 py-2 outline-none cursor-pointer hover:border-gray-300"
            >
              <option value="All">All Managers</option>
              {dynamicManagers.map(mgr => (
                <option key={mgr} value={mgr}>{mgr}</option>
              ))}
            </select>

            {/* Sorting */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 rounded-xl px-3 py-2 outline-none cursor-pointer hover:border-gray-300"
            >
              <option value="value">Sort: Contract Value</option>
              <option value="outstanding">Sort: Outstanding</option>
              <option value="recent">Sort: Recently Added</option>
              <option value="company">Sort: Company Name</option>
            </select>
          </div>
        </div>

        {/* Active Filter Badges */}
        {(searchQuery || selectedIndustry !== 'All' || selectedStatus !== 'All' || selectedManager !== 'All') && (
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100 text-xs text-gray-500 flex-wrap">
            <span className="font-semibold">Active Filters ({filteredClients.length} accounts):</span>
            {searchQuery && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded-md font-medium flex items-center gap-1">
                "{searchQuery}" <X size={11} className="cursor-pointer" onClick={() => setSearchQuery('')} />
              </span>
            )}
            {selectedIndustry !== 'All' && (
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md font-medium flex items-center gap-1">
                Industry: {selectedIndustry} <X size={11} className="cursor-pointer" onClick={() => setSelectedIndustry('All')} />
              </span>
            )}
            {selectedStatus !== 'All' && (
              <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md font-medium flex items-center gap-1">
                Status: {selectedStatus} <X size={11} className="cursor-pointer" onClick={() => setSelectedStatus('All')} />
              </span>
            )}
            {selectedManager !== 'All' && (
              <span className="px-2 py-0.5 bg-lime-100 text-lime-800 rounded-md font-medium flex items-center gap-1">
                Manager: {selectedManager} <X size={11} className="cursor-pointer" onClick={() => setSelectedManager('All')} />
              </span>
            )}
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedIndustry('All');
                setSelectedStatus('All');
                setSelectedManager('All');
              }}
              className="text-indigo-600 font-bold hover:underline ml-auto cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Row 3: Grid Cards View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClients.length === 0 ? (
            <div className="col-span-full bg-white rounded-3xl p-12 text-center text-gray-400 border border-dashed border-gray-200">
              <Building size={36} className="mx-auto mb-2 opacity-30" />
              <p className="text-xs">No client accounts match the specified filters.</p>
            </div>
          ) : (
            filteredClients.map((client) => {
              const fin = getClientFinancials(client);
              const activeProjCount = projects.filter(p => (p.clientId === client.id || p.clientName === client.company) && p.status === 'IN PROGRESS').length;

              return (
                <div
                  key={client.id}
                  onClick={() => setSelectedClient(client)}
                  className={`bg-white rounded-3xl p-5 border transition-all cursor-pointer relative group flex flex-col justify-between ${
                    selectedClient?.id === client.id
                      ? 'border-black shadow-lg ring-2 ring-black/5'
                      : 'border-gray-100 hover:border-gray-300 shadow-sm hover:shadow-md'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${getMonogramGradient(client.company)} text-white font-extrabold flex items-center justify-center text-sm shadow-xs shrink-0`}>
                          {client.company.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-extrabold text-sm text-gray-900 group-hover:text-black truncate">
                            {client.company}
                          </h3>
                          <span className="text-xs text-gray-400 font-medium truncate block">{client.industry || 'Technology'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingClient(client); }}
                          className="p-1 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-gray-100 cursor-pointer"
                          title="Edit Client"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setClientToDelete(client); }}
                          className="p-1 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-gray-100 cursor-pointer"
                          title="Delete Client"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5 py-3 border-y border-gray-50 text-xs text-gray-600">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 font-normal">Contact:</span>
                        <span className="font-semibold text-gray-900">{client.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 font-normal">Email:</span>
                        <span className="font-medium text-gray-700 truncate max-w-[170px]">{client.email}</span>
                      </div>
                      {client.gstTaxId && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 font-normal">GSTIN:</span>
                          <span className="font-mono text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-800">{client.gstTaxId}</span>
                        </div>
                      )}
                    </div>

                    {/* Commercials Summary */}
                    <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-gray-50 p-2 rounded-xl">
                        <span className="text-[10px] text-gray-400 block font-normal">Contract</span>
                        <strong className="text-gray-900 text-xs">₹{fin.totalValue.toLocaleString('en-IN')}</strong>
                      </div>
                      <div className="bg-emerald-50/70 p-2 rounded-xl text-emerald-800">
                        <span className="text-[10px] text-emerald-600 block font-normal">Paid</span>
                        <strong className="text-xs">₹{fin.totalPaid.toLocaleString('en-IN')}</strong>
                      </div>
                      <div className="bg-amber-50/70 p-2 rounded-xl text-amber-800">
                        <span className="text-[10px] text-amber-600 block font-normal">Outstanding</span>
                        <strong className="text-xs">₹{fin.outstandingAmount.toLocaleString('en-IN')}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-2.5 flex items-center justify-between text-[11px] text-gray-400 border-t border-gray-50">
                    <span className="font-semibold text-gray-600">{activeProjCount} Active Sprints</span>
                    <span className="font-bold text-gray-900 flex items-center gap-1 group-hover:text-indigo-600 transition-colors">
                      360° Dossier <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Row 4: Directory Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Company & Client</th>
                  <th className="py-3.5 px-3">Industry & GSTIN</th>
                  <th className="py-3.5 px-3">Contract Value</th>
                  <th className="py-3.5 px-3">Paid Revenue</th>
                  <th className="py-3.5 px-3">Outstanding</th>
                  <th className="py-3.5 px-3">Manager & Status</th>
                  <th className="py-3.5 px-3 text-center">Channels</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-400 text-xs">
                      No client accounts found matching the search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredClients.map((client) => {
                    const fin = getClientFinancials(client);

                    return (
                      <tr
                        key={client.id}
                        onClick={() => setSelectedClient(client)}
                        className="hover:bg-gray-50/80 transition-colors cursor-pointer group"
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${getMonogramGradient(client.company)} text-white font-extrabold text-xs flex items-center justify-center shadow-2xs shrink-0`}>
                              {client.company.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-extrabold text-gray-900 text-xs group-hover:text-black">{client.company}</div>
                              <div className="text-[11px] text-gray-400">{client.name} {client.address ? `• ${client.address}` : ''}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-3">
                          <div className="font-semibold text-gray-800">{client.industry || 'General'}</div>
                          <div className="font-mono text-[10px] text-gray-400">{client.gstTaxId || 'No GSTIN'}</div>
                        </td>

                        <td className="py-3.5 px-3 font-extrabold text-gray-900">
                          ₹{fin.totalValue.toLocaleString('en-IN')}
                        </td>

                        <td className="py-3.5 px-3 font-extrabold text-emerald-600">
                          ₹{fin.totalPaid.toLocaleString('en-IN')}
                        </td>

                        <td className="py-3.5 px-3 font-extrabold text-amber-600">
                          ₹{fin.outstandingAmount.toLocaleString('en-IN')}
                        </td>

                        <td className="py-3.5 px-3">
                          <div className="font-semibold text-gray-800">{client.accountManager}</div>
                          <span className={`text-[9px] font-bold px-2 py-0.2 rounded-full inline-block ${
                            client.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {client.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1">
                            {client.phone && (
                              <button
                                onClick={() => handleOpenWhatsApp(client)}
                                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer"
                                title="WhatsApp"
                              >
                                <MessageSquare size={13} />
                              </button>
                            )}
                            {client.phone && (
                              <button
                                onClick={() => handleOpenCall(client)}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                                title="Phone"
                              >
                                <Phone size={13} />
                              </button>
                            )}
                            {client.email && (
                              <button
                                onClick={() => handleOpenEmail(client)}
                                className="p-1 text-purple-600 hover:bg-purple-50 rounded cursor-pointer"
                                title="Email"
                              >
                                <Mail size={13} />
                              </button>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setEditingClient(client)}
                              className="p-1 text-gray-400 hover:text-black rounded cursor-pointer"
                              title="Edit Client"
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              onClick={() => setClientToDelete(client)}
                              className="p-1 text-gray-400 hover:text-rose-600 rounded cursor-pointer"
                              title="Delete Client"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Row 5: 360° Client Dossier Drawer */}
      <AnimatePresence>
        {currentClient && currentClientFin && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, x: 400 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 400 }}
              className="bg-white w-full max-w-3xl h-full shadow-2xl overflow-y-auto flex flex-col p-6 sm:p-8 justify-between"
            >
              <div>
                {/* Drawer Header */}
                <div className="flex items-start justify-between pb-6 border-b border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${getMonogramGradient(currentClient.company)} text-white font-extrabold flex items-center justify-center text-lg shadow-md`}>
                      {currentClient.company.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-extrabold text-gray-900">{currentClient.company}</h2>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          currentClient.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {currentClient.status}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">{currentClient.industry || 'Technology'} • Account Lead: {currentClient.accountManager}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Compact Health Indicator */}
                    <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="relative w-7 h-7 flex items-center justify-center">
                        <svg className="w-7 h-7 -rotate-90" viewBox="0 0 32 32">
                          <circle cx="16" cy="16" r="12" fill="none" stroke="#E5E7EB" strokeWidth="2.5" />
                          <circle
                            cx="16"
                            cy="16"
                            r="12"
                            fill="none"
                            stroke={clientHealth.strokeColor}
                            strokeWidth="2.5"
                            strokeDasharray={2 * Math.PI * 12}
                            strokeDashoffset={2 * Math.PI * 12 * (1 - clientHealth.score / 100)}
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="absolute text-[9px] font-extrabold text-gray-900 tabular-nums">
                          {clientHealth.score}
                        </span>
                      </div>
                      <div className="hidden sm:block text-left pr-1">
                        <span className="text-[9px] text-gray-400 block leading-tight font-medium">Health</span>
                        <span className={`text-[10px] font-bold ${clientHealth.textColor} leading-tight`}>{clientHealth.label}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setEditingClient(currentClient)}
                      className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors btn-press"
                    >
                      <Edit3 size={14} /> Edit
                    </button>
                    <button
                      onClick={() => setSelectedClient(null)}
                      className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-900 cursor-pointer transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                {/* Quick Communication Actions Bar */}
                <div className="grid grid-cols-4 gap-2 my-4">
                  <button
                    onClick={() => handleOpenWhatsApp(currentClient)}
                    className="py-2 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors btn-press"
                  >
                    <MessageSquare size={13} /> WhatsApp
                  </button>
                  <button
                    onClick={() => handleOpenCall(currentClient)}
                    className="py-2 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors btn-press"
                  >
                    <Phone size={13} /> Call
                  </button>
                  <button
                    onClick={() => handleOpenEmail(currentClient)}
                    className="py-2 px-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors btn-press"
                  >
                    <Mail size={13} /> Email
                  </button>
                  <button
                    onClick={() => onNavigate('calendar', 'new')}
                    className="py-2 px-2 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors btn-press"
                  >
                    <Calendar size={13} /> Meet
                  </button>
                </div>

                {/* 360 Super-Tabs Navigation */}
                <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 border-b border-gray-100 my-2 text-xs scrollbar-none">
                  {[
                    { id: 'Overview & Health', label: 'Overview & Health', badge: `${clientHealth.score}%`, badgeColor: clientHealth.bgBadge },
                    { id: 'Commercials & Invoices', label: 'Commercials & Invoices', count: clientInvoices.length + clientPayments.length + clientAgreements.length },
                    { id: 'Operations & Sprints', label: 'Operations & Sprints', count: clientProjects.length + clientTasks.length },
                    { id: 'Documents & Specs', label: 'Documents & Specs', count: clientDocs.length },
                    { id: 'Vault Credentials', label: 'Vault Credentials', count: clientCreds.length },
                    { id: 'Communications & Notes', label: 'Communications & Notes', count: clientEvents.length + (currentClient?.notes ? 1 : 0) }
                  ].map((tab) => {
                    const isActive = active360Tab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActive360Tab(tab.id as any)}
                        className={`py-1.5 px-3 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 btn-press ${
                          isActive
                            ? 'bg-black text-white shadow-xs'
                            : 'text-gray-500 hover:text-black hover:bg-gray-100'
                        }`}
                      >
                        <span>{tab.label}</span>
                        {tab.badge ? (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${isActive ? 'bg-white/20 text-white' : tab.badgeColor}`}>
                            {tab.badge}
                          </span>
                        ) : (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold tabular-nums ${
                            isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {tab.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Tab Contents */}
                <div className="py-4 text-xs">
                  {/* Super-Tab 1: Overview & Health */}
                  {active360Tab === 'Overview & Health' && (
                    <div className="space-y-6">
                      {/* Client Vitality & Risk Matrix Card */}
                      <div className="double-bezel-outer p-1 rounded-2xl">
                        <div className="double-bezel-inner p-4 sm:p-5 rounded-[14px] bg-gradient-to-br from-white to-gray-50/70 border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-5">
                          <div className="flex items-center gap-4 sm:gap-5 w-full sm:w-auto">
                            {/* Radial Gauge */}
                            <div className="relative w-18 h-18 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center">
                              <svg className="w-18 h-18 sm:w-20 sm:h-20 -rotate-90" viewBox="0 0 64 64">
                                <circle cx="32" cy="32" r="26" fill="none" stroke="#F3F4F6" strokeWidth="6" />
                                <circle
                                  cx="32"
                                  cy="32"
                                  r="26"
                                  fill="none"
                                  stroke={clientHealth.strokeColor}
                                  strokeWidth="6"
                                  strokeDasharray={2 * Math.PI * 26}
                                  strokeDashoffset={2 * Math.PI * 26 * (1 - clientHealth.score / 100)}
                                  strokeLinecap="round"
                                  className="transition-all duration-1000 ease-out"
                                />
                              </svg>
                              <div className="absolute flex flex-col items-center justify-center">
                                <span className="text-lg sm:text-xl font-extrabold text-gray-900 tabular-nums tracking-tight">
                                  {clientHealth.score}%
                                </span>
                                <span className="text-[8px] uppercase tracking-wider text-gray-400 font-bold">Health</span>
                              </div>
                            </div>

                            <div>
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h4 className="font-extrabold text-sm text-gray-900">Client Vitality Score</h4>
                                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${clientHealth.bgBadge}`}>
                                  {clientHealth.label}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 leading-relaxed max-w-sm">
                                {clientHealth.statusDesc}
                              </p>
                            </div>
                          </div>

                          {/* Breakdown Factors */}
                          <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-gray-100 pt-3 sm:pt-0 sm:pl-5 text-center">
                            <div className="bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                              <span className="text-[10px] text-gray-400 block font-medium">Payment Rate</span>
                              <span className="text-xs font-extrabold text-gray-900 tabular-nums">
                                {currentClientFin.totalValue > 0 ? `${Math.round((currentClientFin.totalPaid / currentClientFin.totalValue) * 100)}%` : '100%'}
                              </span>
                            </div>
                            <div className="bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                              <span className="text-[10px] text-gray-400 block font-medium">Active Ops</span>
                              <span className="text-xs font-extrabold text-gray-900 tabular-nums">
                                {clientProjects.length + clientTasks.length}
                              </span>
                            </div>
                            <div className="bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                              <span className="text-[10px] text-gray-400 block font-medium">Contracts</span>
                              <span className="text-xs font-extrabold text-gray-900 tabular-nums">
                                {clientAgreements.length}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Double-Bezel Financial KPIs */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="double-bezel-outer p-1 rounded-2xl">
                          <div className="double-bezel-inner p-3.5 rounded-[14px] bg-white border border-gray-100">
                            <span className="text-gray-400 block font-normal mb-1 text-[11px]">Total Contract Value</span>
                            <strong className="text-base font-extrabold text-gray-900 tabular-nums">₹{currentClientFin.totalValue.toLocaleString('en-IN')}</strong>
                          </div>
                        </div>
                        <div className="double-bezel-outer p-1 rounded-2xl">
                          <div className="double-bezel-inner p-3.5 rounded-[14px] bg-emerald-50/50 border border-emerald-100 text-emerald-900">
                            <span className="text-emerald-600 block font-normal mb-1 text-[11px]">Total Paid to Date</span>
                            <strong className="text-base font-extrabold tabular-nums">₹{currentClientFin.totalPaid.toLocaleString('en-IN')}</strong>
                          </div>
                        </div>
                        <div className="double-bezel-outer p-1 rounded-2xl">
                          <div className="double-bezel-inner p-3.5 rounded-[14px] bg-amber-50/50 border border-amber-100 text-amber-900">
                            <span className="text-amber-600 block font-normal mb-1 text-[11px]">Outstanding Receivable</span>
                            <strong className="text-base font-extrabold tabular-nums">₹{currentClientFin.outstandingAmount.toLocaleString('en-IN')}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Contact & Organization Dossier */}
                      <div className="bg-gray-50 p-4 rounded-2xl space-y-3 border border-gray-100">
                        <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                          <Building size={14} className="text-gray-500" /> Contact & Organization Dossier
                        </h4>
                        <div className="grid grid-cols-2 gap-3 text-gray-600">
                          <div><strong className="text-gray-800">Primary Contact:</strong> {currentClient.name}</div>
                          <div><strong className="text-gray-800">Email:</strong> {currentClient.email}</div>
                          <div><strong className="text-gray-800">Phone:</strong> {currentClient.phone || 'N/A'}</div>
                          <div><strong className="text-gray-800">Address:</strong> {currentClient.address || 'Remote'}</div>
                          <div><strong className="text-gray-800">GSTIN / Tax ID:</strong> {currentClient.gstTaxId || 'N/A'}</div>
                          <div><strong className="text-gray-800">Acquisition Source:</strong> {currentClient.source}</div>
                        </div>
                      </div>

                      {/* Account Notes & Context */}
                      <div>
                        <h4 className="font-bold text-gray-900 mb-2 text-sm">Account Notes & Context</h4>
                        <p className="p-4 bg-gray-50 rounded-2xl text-gray-700 leading-relaxed border border-gray-100">
                          {currentClient.notes || 'No custom notes recorded for this enterprise account.'}
                        </p>
                      </div>

                      {/* Client Relationship Lifecycle (Integrated Timeline) */}
                      <div className="space-y-4 pt-2 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                              <Clock size={14} className="text-gray-500" /> Client Relationship Lifecycle
                            </h4>
                            <span className="text-[11px] text-gray-400">Complete chronological audit trail from lead acquisition to project delivery</span>
                          </div>
                          <span className="text-xs font-bold px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full tabular-nums">
                            {clientActivityTimeline.length} Events
                          </span>
                        </div>

                        {clientActivityTimeline.length === 0 ? (
                          <div className="text-center py-10 bg-gray-50 rounded-2xl text-gray-400 border border-dashed border-gray-200">
                            No historical lifecycle events recorded yet for this client.
                          </div>
                        ) : (
                          <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                            {clientActivityTimeline.map((item) => (
                              <div key={item.id} className="relative group">
                                <span className="absolute -left-6 top-1.5 w-4 h-4 rounded-full bg-white border-2 border-indigo-600 shadow-xs group-hover:scale-125 transition-transform" />
                                <div className="bg-gray-50 hover:bg-gray-100/70 p-3.5 rounded-2xl border border-gray-100 transition-colors">
                                  <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                                    <span className="font-bold text-gray-900 text-xs">{item.title}</span>
                                    <div className="flex items-center gap-1.5">
                                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${item.badge}`}>
                                        {item.category}
                                      </span>
                                      <span className="text-[10px] text-gray-400 tabular-nums">
                                        {new Date(item.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                                      </span>
                                    </div>
                                  </div>
                                  <p className="text-xs text-gray-600 leading-relaxed">
                                    {item.description}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Super-Tab 2: Commercials & Invoices */}
                  {active360Tab === 'Commercials & Invoices' && (
                    <div className="space-y-6">
                      {/* Section A: Invoices */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CreditCard size={15} className="text-gray-600" />
                            <span className="font-bold text-gray-900 text-sm">Issued Invoices ({clientInvoices.length})</span>
                          </div>
                          <button
                            onClick={() => { setSelectedClient(null); onNavigate('finance', 'new'); }}
                            className="px-3 py-1.5 bg-black hover:bg-gray-800 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer btn-press"
                          >
                            <Plus size={13} className="text-[#CCFF00]" /> Create Invoice
                          </button>
                        </div>

                        {clientInvoices.length === 0 ? (
                          <div className="text-center py-8 bg-gray-50 rounded-2xl text-gray-400 border border-dashed border-gray-200">
                            No invoices issued for this client yet.
                          </div>
                        ) : (
                          clientInvoices.map(i => (
                            <div
                              key={i.id}
                              onClick={() => { setSelectedClient(null); onNavigate('finance', i.id); }}
                              className="p-4 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-gray-100/80 transition-all cursor-pointer group flex items-center justify-between"
                            >
                              <div>
                                <h4 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{i.invoiceNumber}</h4>
                                <span className="text-gray-400 text-[11px]">Due: {i.dueDate} • Total: <strong className="text-gray-700 font-semibold tabular-nums">₹{i.total.toLocaleString('en-IN')}</strong></span>
                              </div>
                              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${i.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                                  {i.status}
                                </span>
                                <button
                                  onClick={() => exportService.generateInvoicePdf(i, currentClient.gstTaxId)}
                                  className="px-2.5 py-1 rounded-lg bg-black text-white font-bold text-[10px] cursor-pointer btn-press"
                                >
                                  PDF
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Section B: Payment Receipts */}
                      <div className="space-y-3 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <IndianRupee size={15} className="text-emerald-600" />
                            <span className="font-bold text-gray-900 text-sm">Payment Transactions ({clientPayments.length})</span>
                          </div>
                          <button
                            onClick={() => { setSelectedClient(null); onNavigate('finance', 'new'); }}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer btn-press"
                          >
                            <Plus size={13} /> Record Payment
                          </button>
                        </div>

                        {clientPayments.length === 0 ? (
                          <div className="text-center py-8 bg-gray-50 rounded-2xl text-gray-400 border border-dashed border-gray-200">
                            No payment receipts recorded yet.
                          </div>
                        ) : (
                          clientPayments.map(pay => (
                            <div key={pay.id} className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/40 flex items-center justify-between">
                              <div>
                                <h4 className="font-bold text-emerald-950 tabular-nums">₹{pay.amount.toLocaleString('en-IN')} via {pay.paymentMethod}</h4>
                                <span className="text-emerald-700 text-[10px]">Date: {pay.paymentDate} • Txn ID: {pay.transactionId || 'N/A'}</span>
                              </div>
                              <span className="font-bold text-emerald-800 text-[10px] bg-emerald-200/60 px-2.5 py-1 rounded-full">{pay.status}</span>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Section C: Legal Agreements & NDAs */}
                      <div className="space-y-3 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ShieldCheck size={15} className="text-indigo-600" />
                            <span className="font-bold text-gray-900 text-sm">Agreements & Contracts ({clientAgreements.length})</span>
                          </div>
                          <button
                            onClick={() => { setSelectedClient(null); onNavigate('documents', 'new'); }}
                            className="px-3 py-1.5 bg-black hover:bg-gray-800 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer btn-press"
                          >
                            <Plus size={13} className="text-[#CCFF00]" /> New Agreement
                          </button>
                        </div>

                        {clientAgreements.length === 0 ? (
                          <div className="text-center py-8 bg-gray-50 rounded-2xl text-gray-400 border border-dashed border-gray-200">
                            No registered legal contracts or NDAs.
                          </div>
                        ) : (
                          clientAgreements.map(a => (
                            <div
                              key={a.id}
                              onClick={() => { setSelectedClient(null); onNavigate('documents', a.id); }}
                              className="p-4 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-gray-100/80 transition-all cursor-pointer group flex items-center justify-between"
                            >
                              <div>
                                <h4 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{a.name}</h4>
                                <span className="text-gray-400 text-[11px]">{a.agreementType} • Value: <strong className="text-gray-700 font-semibold tabular-nums">₹{a.commercialValue.toLocaleString('en-IN')}</strong></span>
                              </div>
                              <span className="font-bold text-xs bg-white border border-gray-100 px-2.5 py-1 rounded-full">{a.status}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* Super-Tab 3: Operations & Sprints */}
                  {active360Tab === 'Operations & Sprints' && (
                    <div className="space-y-6">
                      {/* Section A: Linked Projects */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Briefcase size={15} className="text-gray-700" />
                            <span className="font-bold text-gray-900 text-sm">Active Projects ({clientProjects.length})</span>
                          </div>
                          <button
                            onClick={() => { setSelectedClient(null); onNavigate('projects', 'new'); }}
                            className="px-3 py-1.5 bg-[#CCFF00] hover:bg-[#b8e600] text-black font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer btn-press"
                          >
                            <Plus size={13} /> New Project
                          </button>
                        </div>

                        {clientProjects.length === 0 ? (
                          <div className="text-center py-8 bg-gray-50 rounded-2xl text-gray-400 border border-dashed border-gray-200">
                            No active projects linked to this client yet.
                          </div>
                        ) : (
                          clientProjects.map(p => (
                            <div
                              key={p.id}
                              onClick={() => { setSelectedClient(null); onNavigate('projects', p.id); }}
                              className="p-4 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-gray-100/80 transition-all cursor-pointer group"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <h4 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{p.name}</h4>
                                  <span className="text-gray-400 text-[11px]">{p.serviceType} • Value: <strong className="text-gray-700 font-semibold tabular-nums">₹{p.projectValue.toLocaleString('en-IN')}</strong></span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-xs px-2.5 py-1 rounded-full bg-white text-gray-800 border border-gray-100">{p.status}</span>
                                  <ArrowUpRight size={15} className="text-gray-400 group-hover:text-gray-900" />
                                </div>
                              </div>
                              {/* Progress bar */}
                              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${p.progress}%` }} />
                              </div>
                              <span className="text-[10px] text-gray-400 mt-1 block text-right font-semibold tabular-nums">{p.progress}% Complete</span>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Section B: Sprint Tasks */}
                      <div className="space-y-3 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckSquare size={15} className="text-gray-700" />
                            <span className="font-bold text-gray-900 text-sm">Sprint Tasks ({clientTasks.length})</span>
                          </div>
                          <button
                            onClick={() => { setSelectedClient(null); onNavigate('tasks', 'new'); }}
                            className="px-3 py-1.5 bg-black hover:bg-gray-800 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer btn-press"
                          >
                            <Plus size={13} className="text-[#CCFF00]" /> New Task
                          </button>
                        </div>

                        {clientTasks.length === 0 ? (
                          <div className="text-center py-8 bg-gray-50 rounded-2xl text-gray-400 border border-dashed border-gray-200">
                            No tasks assigned under this client.
                          </div>
                        ) : (
                          clientTasks.map(t => (
                            <div
                              key={t.id}
                              onClick={() => { setSelectedClient(null); onNavigate('tasks', t.id); }}
                              className="p-4 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-gray-100/80 transition-all cursor-pointer group flex items-center justify-between"
                            >
                              <div>
                                <h4 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{t.title}</h4>
                                <span className="text-gray-400 text-[10px]">
                                  Due: {t.dueDate} • Assignee: {t.assignedTo}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                  t.priority === 'Urgent' ? 'bg-rose-100 text-rose-800' : (t.priority === 'High' ? 'bg-amber-100 text-amber-800' : 'bg-gray-200 text-gray-700')
                                }`}>
                                  {t.priority}
                                </span>
                                <span className="font-bold text-xs bg-white border border-gray-200 px-2.5 py-1 rounded-full text-gray-800">
                                  {t.status}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* Super-Tab 4: Documents & Specs */}
                  {active360Tab === 'Documents & Specs' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText size={15} className="text-gray-700" />
                          <span className="font-bold text-gray-900 text-sm">Uploaded Specs & Docs ({clientDocs.length})</span>
                        </div>
                        <button
                          onClick={() => { setSelectedClient(null); onNavigate('documents', 'new'); }}
                          className="px-3 py-1.5 bg-[#CCFF00] hover:bg-[#b8e600] text-black font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer btn-press"
                        >
                          <Plus size={13} /> Upload Doc
                        </button>
                      </div>

                      {clientDocs.length === 0 ? (
                        <div className="text-center py-10 bg-gray-50 rounded-2xl text-gray-400 border border-dashed border-gray-200">
                          No documents uploaded for this client.
                        </div>
                      ) : (
                        clientDocs.map(d => (
                          <div key={d.id} className="p-4 rounded-2xl border border-gray-100 bg-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 rounded-xl bg-white text-gray-700 shadow-2xs">
                                <FileText size={16} />
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-900">{d.title}</h4>
                                <span className="text-gray-400 text-[10px]">Type: {d.docType} • By: {d.uploadedBy}</span>
                              </div>
                            </div>
                            {d.fileUrl && d.fileUrl !== '#' ? (
                              <a
                                href={d.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 rounded-xl bg-black text-white font-bold text-xs hover:bg-gray-800 flex items-center gap-1 cursor-pointer btn-press"
                              >
                                <Download size={12} /> View
                              </a>
                            ) : (
                              <span className="text-[10px] text-gray-400 bg-gray-200 px-2 py-1 rounded-lg">Attached</span>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Super-Tab 5: Vault Credentials */}
                  {active360Tab === 'Vault Credentials' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Key size={15} className="text-gray-700" />
                          <span className="font-bold text-gray-900 text-sm">Platform Secrets & Keys ({clientCreds.length})</span>
                        </div>
                        <button
                          onClick={() => { setSelectedClient(null); onNavigate('vault', 'new'); }}
                          className="px-3 py-1.5 bg-[#CCFF00] hover:bg-[#b8e600] text-black font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer btn-press"
                        >
                          <Plus size={13} /> Add Key
                        </button>
                      </div>

                      {clientCreds.length === 0 ? (
                        <div className="text-center py-10 bg-gray-50 rounded-2xl text-gray-400 border border-dashed border-gray-200">
                          No encrypted credentials stored for this client.
                        </div>
                      ) : (
                        clientCreds.map(c => (
                          <div
                            key={c.id}
                            onClick={() => { setSelectedClient(null); onNavigate('vault', c.id); }}
                            className="p-4 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-gray-100/80 transition-all cursor-pointer group flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700">
                                <Key size={14} />
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{c.platformName}</h4>
                                <span className="text-gray-400 text-[10px]">User: {c.username}</span>
                              </div>
                            </div>
                            <span className="font-mono text-[10px] bg-gray-200 px-2.5 py-1 rounded-lg">Encrypted Secret</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Super-Tab 6: Communications & Notes */}
                  {active360Tab === 'Communications & Notes' && currentClient && (
                    <div className="space-y-6">
                      {/* Account Executive Notes */}
                      <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText size={15} className="text-gray-700" />
                            <span className="font-bold text-gray-900 text-sm">Strategic Account Notes</span>
                          </div>
                          <button
                            onClick={() => {
                              updateClient(currentClient.id, { notes: clientNoteInput });
                              toast.success('Notes Saved', 'Client account notes updated.');
                            }}
                            className="px-3 py-1.5 bg-black hover:bg-gray-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer btn-press"
                          >
                            <CheckCircle2 size={13} className="text-[#CCFF00]" /> Save Notes
                          </button>
                        </div>
                        <textarea
                          rows={4}
                          value={clientNoteInput}
                          onChange={(e) => setClientNoteInput(e.target.value)}
                          placeholder="Log key client nuances, SLA expectations, executive contacts, communication preferences..."
                          className="w-full text-xs p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
                        />
                      </div>

                      {/* Quick Schedule Meeting / Call */}
                      <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl space-y-3">
                        <div className="flex items-center gap-2">
                          <Calendar size={15} className="text-gray-700" />
                          <span className="font-bold text-gray-900 text-sm">Schedule Meeting / Briefing</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <input
                            type="text"
                            placeholder="Meeting title / agenda..."
                            value={newMeetingTitle}
                            onChange={(e) => setNewMeetingTitle(e.target.value)}
                            className="text-xs p-2.5 bg-white border border-gray-200 rounded-xl md:col-span-2 focus:outline-none focus:ring-2 focus:ring-black/5"
                          />
                          <input
                            type="datetime-local"
                            value={newMeetingDate}
                            onChange={(e) => setNewMeetingDate(e.target.value)}
                            className="text-xs p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
                          />
                        </div>
                        <button
                          disabled={!newMeetingTitle || !newMeetingDate}
                          onClick={() => {
                            addCalendarEvent({
                              title: newMeetingTitle,
                              eventType: 'Meeting',
                              startTime: new Date(newMeetingDate).toISOString(),
                              relatedClientId: currentClient.id,
                              participants: [currentUser.fullName, currentClient.name]
                            });
                            setNewMeetingTitle('');
                            setNewMeetingDate('');
                            toast.success('Meeting Scheduled', 'Added to AGX operational calendar.');
                          }}
                          className="px-3 py-1.5 bg-[#CCFF00] hover:bg-[#b8e600] text-black font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed btn-press"
                        >
                          <Plus size={13} /> Schedule Meeting
                        </button>
                      </div>

                      {/* Logged Meetings & Communication Events */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <MessageSquare size={15} className="text-gray-700" />
                          <span className="font-bold text-gray-900 text-sm">Scheduled Interactions ({clientEvents.length})</span>
                        </div>

                        {clientEvents.length === 0 ? (
                          <div className="text-center py-8 bg-gray-50 rounded-2xl text-gray-400 border border-dashed border-gray-200 text-xs">
                            No scheduled meetings or communication sessions recorded yet.
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {clientEvents.map((evt) => (
                              <div key={evt.id} className="p-3 bg-white border border-gray-200 rounded-xl flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <div className="font-bold text-gray-900 text-xs">{evt.title}</div>
                                  <div className="text-[10px] text-gray-500 flex items-center gap-2">
                                    <Clock size={11} /> {new Date(evt.startTime).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    <span>•</span>
                                    <span>{evt.eventType}</span>
                                  </div>
                                </div>
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full">
                                  Confirmed
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={() => setClientToDelete(currentClient)}
                  className="text-rose-600 hover:bg-rose-50 px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 size={14} /> Delete Account
                </button>
                <button
                  onClick={() => setSelectedClient(null)}
                  className="px-4 py-2 bg-black text-white font-bold text-xs rounded-xl hover:bg-gray-800 cursor-pointer"
                >
                  Close Dossier
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Client Modal */}
      {isAddClientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <h3 className="font-extrabold text-lg text-gray-900">Add New Client Account</h3>
              <button onClick={() => setIsAddClientModalOpen(false)} className="p-1 rounded-lg text-gray-400 hover:text-gray-900 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={newClientData.company}
                    onChange={(e) => setNewClientData({ ...newClientData, company: e.target.value })}
                    placeholder="e.g. Acme Corp"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Primary Contact *</label>
                  <input
                    type="text"
                    required
                    value={newClientData.name}
                    onChange={(e) => setNewClientData({ ...newClientData, name: e.target.value })}
                    placeholder="e.g. John Doe"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={newClientData.email}
                    onChange={(e) => setNewClientData({ ...newClientData, email: e.target.value })}
                    placeholder="contact@acme.com"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={newClientData.phone}
                    onChange={(e) => setNewClientData({ ...newClientData, phone: e.target.value })}
                    placeholder="+91 98450 12345"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Industry</label>
                  <input
                    type="text"
                    value={newClientData.industry}
                    onChange={(e) => setNewClientData({ ...newClientData, industry: e.target.value })}
                    placeholder="e.g. FinTech, Healthcare"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">GSTIN / Tax ID</label>
                  <input
                    type="text"
                    value={newClientData.gstTaxId}
                    onChange={(e) => setNewClientData({ ...newClientData, gstTaxId: e.target.value })}
                    placeholder="29ABCDE1234F1Z5"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Total Contract Value (₹)</label>
                  <input
                    type="number"
                    value={newClientData.totalValue}
                    onChange={(e) => setNewClientData({ ...newClientData, totalValue: Number(e.target.value), outstandingAmount: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Account Manager</label>
                  <select
                    value={newClientData.accountManager}
                    onChange={(e) => setNewClientData({ ...newClientData, accountManager: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none cursor-pointer"
                  >
                    {dynamicManagers.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Address / Location</label>
                  <input
                    type="text"
                    value={newClientData.address}
                    onChange={(e) => setNewClientData({ ...newClientData, address: e.target.value })}
                    placeholder="e.g. Bengaluru, India"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Account Status</label>
                  <select
                    value={newClientData.status}
                    onChange={(e) => setNewClientData({ ...newClientData, status: e.target.value as any })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddClientModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-bold shadow-md cursor-pointer"
                >
                  Save Client
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Client Modal */}
      {editingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <h3 className="font-extrabold text-lg text-gray-900">Edit Client Details</h3>
              <button onClick={() => setEditingClient(null)} className="p-1 rounded-lg text-gray-400 hover:text-gray-900 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEditClient} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    value={editingClient.company}
                    onChange={(e) => setEditingClient({ ...editingClient, company: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Contact Name</label>
                  <input
                    type="text"
                    required
                    value={editingClient.name}
                    onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={editingClient.email}
                    onChange={(e) => setEditingClient({ ...editingClient, email: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={editingClient.phone || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, phone: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Industry</label>
                  <input
                    type="text"
                    value={editingClient.industry || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, industry: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">GSTIN / Tax ID</label>
                  <input
                    type="text"
                    value={editingClient.gstTaxId || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, gstTaxId: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Total Contract (₹)</label>
                  <input
                    type="number"
                    value={editingClient.totalValue}
                    onChange={(e) => setEditingClient({ ...editingClient, totalValue: Number(e.target.value), outstandingAmount: Math.max(0, Number(e.target.value) - editingClient.totalPaid) })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Account Manager</label>
                  <select
                    value={editingClient.accountManager}
                    onChange={(e) => setEditingClient({ ...editingClient, accountManager: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none cursor-pointer"
                  >
                    {dynamicManagers.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={editingClient.address || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, address: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Status</label>
                  <select
                    value={editingClient.status}
                    onChange={(e) => setEditingClient({ ...editingClient, status: e.target.value as any })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingClient(null)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-black text-white font-bold hover:bg-gray-800 shadow-md cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Client Confirmation */}
      {clientToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 text-center"
          >
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 size={24} />
            </div>
            <h3 className="font-extrabold text-base text-gray-900 mb-1">Delete Client Account?</h3>
            <p className="text-xs text-gray-500 mb-5">
              Are you sure you want to permanently remove <strong>{clientToDelete.company}</strong> and all linked dossiers?
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setClientToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 font-bold text-xs text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md cursor-pointer"
              >
                Delete Client
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
