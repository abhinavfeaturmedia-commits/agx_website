import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Plus, Search, Filter, Phone, Mail, MapPin, IndianRupee, Calendar,
  CheckCircle2, ArrowRight, UserCheck, Sparkles, Building, MoreVertical,
  X, AlertCircle, Edit3, Trash2, Download, MessageSquare, Send, Clock,
  User, TrendingUp, DollarSign, ChevronRight, ChevronLeft, Briefcase,
  ExternalLink, Layers, ArrowUpRight, Flame, ShieldAlert, ArrowUpDown,
  FileText, CheckSquare, CheckCircle, PlusCircle, Check, Tag
} from 'lucide-react';
import { Lead, LeadStatus, Priority, LeadActivityType, AgreementType, CalendarEventType, Quotation, QuotationStatus } from '../../types/crm';
import { useCrmStore } from '../../lib/crmStore';
import { exportService } from '../../lib/exportService';
import { toast } from '../../lib/toastStore';
import { QuotationModal } from './QuotationModal';
import { QuotationPreviewModal } from './QuotationPreviewModal';

interface LeadsViewProps {
  store: ReturnType<typeof useCrmStore>;
  onNavigate: (route: string, entityId?: string) => void;
  initialSelectedId?: string;
}

const PIPELINE_COLUMNS: {
  status: LeadStatus;
  label: string;
  dotColor: string;
  badgeBg: string;
  borderAccent: string;
  lightBg: string;
}[] = [
  { status: 'NEW', label: 'New Lead', dotColor: 'bg-blue-500', badgeBg: 'bg-blue-50 text-blue-700 border-blue-200', borderAccent: 'border-t-blue-500', lightBg: 'bg-blue-50/30' },
  { status: 'CONTACTED', label: 'Contacted', dotColor: 'bg-purple-500', badgeBg: 'bg-purple-50 text-purple-700 border-purple-200', borderAccent: 'border-t-purple-500', lightBg: 'bg-purple-50/30' },
  { status: 'QUALIFIED', label: 'Qualified', dotColor: 'bg-indigo-500', badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200', borderAccent: 'border-t-indigo-500', lightBg: 'bg-indigo-50/30' },
  { status: 'PROPOSAL SENT', label: 'Proposal Sent', dotColor: 'bg-amber-500', badgeBg: 'bg-amber-50 text-amber-700 border-amber-200', borderAccent: 'border-t-amber-500', lightBg: 'bg-amber-50/30' },
  { status: 'NEGOTIATION', label: 'Negotiation', dotColor: 'bg-orange-500', badgeBg: 'bg-orange-50 text-orange-700 border-orange-200', borderAccent: 'border-t-orange-500', lightBg: 'bg-orange-50/30' },
  { status: 'WON', label: 'Closed Won 🎉', dotColor: 'bg-emerald-500', badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200', borderAccent: 'border-t-emerald-500', lightBg: 'bg-emerald-50/30' },
  { status: 'LOST', label: 'Closed Lost', dotColor: 'bg-gray-400', badgeBg: 'bg-gray-100 text-gray-700 border-gray-200', borderAccent: 'border-t-gray-400', lightBg: 'bg-gray-50/40' }
];

const STAGE_ORDER: LeadStatus[] = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL SENT', 'NEGOTIATION', 'WON'];

// Helper to format ISO dates / timestamps into clean human-readable date & time
const formatFollowUpDate = (dateStr?: string): string => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    
    // If it's a date-only string or midnight UTC/local, format as full date
    const isPureDate = dateStr.length === 10 || dateStr.includes('T00:00:00');
    if (isPureDate) {
      const parts = dateStr.split('T')[0].split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const localDate = new Date(year, month, day);
        return localDate.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
      }
    }
    
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return dateStr;
  }
};

// Helper for follow-up relative urgency badge
const getRelativeFollowUpBadge = (dateStr?: string) => {
  if (!dateStr) return null;
  try {
    const target = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`);
    if (isNaN(target.getTime())) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate());
    
    const diffTime = targetDay.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return (
        <span className="text-[10px] font-extrabold px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full border border-rose-200 shrink-0">
          Overdue ({Math.abs(diffDays)}d ago)
        </span>
      );
    }
    if (diffDays === 0) {
      return (
        <span className="text-[10px] font-extrabold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full border border-amber-200 shrink-0">
          Today ⚡
        </span>
      );
    }
    if (diffDays === 1) {
      return (
        <span className="text-[10px] font-extrabold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full border border-blue-200 shrink-0">
          Tomorrow
        </span>
      );
    }
    return (
      <span className="text-[10px] font-extrabold px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full border border-indigo-200 shrink-0">
        In {diffDays} days
      </span>
    );
  } catch {
    return null;
  }
};

export const ACQUISITION_SOURCE_GROUPS = [
  {
    group: '🌐 Digital & Inbound',
    options: [
      'Website',
      'LinkedIn',
      'Twitter / X',
      'Google Search',
      'YouTube',
      'Meta Ads (IG / FB)',
      'Inbound Call'
    ]
  },
  {
    group: '🤝 Direct & Referrals',
    options: [
      'Client Referral',
      'Partner Network',
      'Direct Outreach',
      'WhatsApp Inbound'
    ]
  },
  {
    group: '🎪 Events & Community',
    options: [
      'Conference / Event',
      'Community / Discord / Slack',
      'Demo Day / Hackathon'
    ]
  }
];

export const ALL_PRESET_SOURCES = ACQUISITION_SOURCE_GROUPS.flatMap(g => g.options);

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

export const LeadsView: React.FC<LeadsViewProps> = ({ store, onNavigate, initialSelectedId }) => {
  const {
    leads, addLead, updateLead, updateLeadStatus, deleteLead,
    addLeadActivity, convertLeadToClient, addAgreement, currentUser, teamMembers,
    tasks, addTask, updateTaskStatus, events, addCalendarEvent, agreements,
    partners, quotations, convertQuotationToInvoice, updateQuotation
  } = store;

  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [selectedSource, setSelectedSource] = useState<string>('All');
  const [selectedStage, setSelectedStage] = useState<string>('All');
  const [selectedOwner, setSelectedOwner] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'date' | 'value' | 'prob' | 'company'>('date');
  const [showLostColumn, setShowLostColumn] = useState(false);

  // Modals & Drawers
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeLeadForDetails, setActiveLeadForDetails] = useState<Lead | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [leadToConvert, setLeadToConvert] = useState<Lead | null>(null);
  const [isConverting, setIsConverting] = useState(false);

  // Quotation Modals in Leads
  const [leadQuotationModalLead, setLeadQuotationModalLead] = useState<Lead | null>(null);
  const [previewQuotation, setPreviewQuotation] = useState<Quotation | null>(null);

  // Lead-Linked Workflow Modals
  const [leadTaskModalLead, setLeadTaskModalLead] = useState<Lead | null>(null);
  const [leadTaskForm, setLeadTaskForm] = useState({
    title: '',
    dueDate: '',
    priority: 'Medium' as Priority,
    assignedTo: '',
    estimatedHours: 2,
    description: ''
  });

  const [leadEventModalLead, setLeadEventModalLead] = useState<Lead | null>(null);
  const [leadEventForm, setLeadEventForm] = useState({
    title: '',
    eventType: 'Meeting' as CalendarEventType,
    startTime: '',
    location: 'Google Meet',
    participants: '',
    notes: '',
    updateFollowUp: true
  });

  const [leadProposalModalLead, setLeadProposalModalLead] = useState<Lead | null>(null);
  const [leadProposalForm, setLeadProposalForm] = useState({
    name: '',
    agreementType: 'Proposal' as AgreementType,
    commercialValue: 150000,
    expiryDate: '',
    autoAdvanceStage: true
  });

  // Touchpoint activity in details drawer
  const [newActivityType, setNewActivityType] = useState<LeadActivityType>('Call');
  const [newActivityNotes, setNewActivityNotes] = useState('');

  // Conversion configuration modal state
  const [conversionConfig, setConversionConfig] = useState({
    accountManager: currentUser?.fullName || '',
    serviceType: '',
    projectDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    createAgreement: true,
    milestoneSplit: '50/50' as '50/50' | '40/30/30' | '30/70' | '100'
  });

  // Loss reason capture modal state
  const [leadToMarkLost, setLeadToMarkLost] = useState<Lead | null>(null);
  const [lossReasonOption, setLossReasonOption] = useState<string>('Budget Constraint / Price Too High');
  const [customLossReason, setCustomLossReason] = useState<string>('');

  // Dynamic filter options extraction
  const dynamicServices = useMemo(() => {
    const set = new Set<string>();
    leads.forEach(l => {
      if (l.interestedService) set.add(l.interestedService);
    });
    return Array.from(set);
  }, [leads]);

  const dynamicSources = useMemo(() => {
    const set = new Set<string>(ALL_PRESET_SOURCES);
    leads.forEach(l => {
      if (l.source) set.add(l.source);
    });
    return Array.from(set);
  }, [leads]);

  const dynamicOwners = useMemo(() => {
    const set = new Set<string>();
    teamMembers.forEach(m => set.add(m.fullName));
    leads.forEach(l => {
      if (l.assignedTo) set.add(l.assignedTo);
    });
    return Array.from(set);
  }, [teamMembers, leads]);

  // Auto-select lead or open add modal on initial navigation
  useEffect(() => {
    if (initialSelectedId === 'new') {
      setIsAddModalOpen(true);
      onNavigate('leads', undefined);
    } else if (initialSelectedId) {
      const match = leads.find(l => l.id === initialSelectedId);
      if (match) setActiveLeadForDetails(match);
      onNavigate('leads', undefined);
    }
  }, [initialSelectedId]);

  // Form State for new lead
  const [newLead, setNewLead] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    whatsapp: '',
    location: '',
    interestedService: 'AI Customer Support & Dispatch Automation',
    estimatedDealValue: 15000,
    probability: 60,
    source: 'Website',
    assignedTo: currentUser?.fullName || 'Taylor Vance',
    priority: 'High' as Priority,
    status: 'NEW' as LeadStatus,
    nextFollowUp: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    partnerId: '',
    notes: ''
  });

  // Pipeline summary metrics
  const metrics = useMemo(() => {
    const activeLeadsList = leads.filter(l => l.status !== 'LOST' && l.status !== 'WON');
    const totalPipelineValue = activeLeadsList.reduce((acc, l) => acc + (l.estimatedDealValue || 0), 0);
    const weightedPipelineValue = activeLeadsList.reduce((acc, l) => acc + ((l.estimatedDealValue || 0) * (l.probability || 50) / 100), 0);
    const wonLeads = leads.filter(l => l.status === 'WON');
    const wonRevenue = wonLeads.reduce((acc, l) => acc + (l.estimatedDealValue || 0), 0);
    const totalDeals = leads.length;
    const winRate = totalDeals > 0 ? Math.round((wonLeads.length / totalDeals) * 100) : 0;
    const inNegotiationCount = leads.filter(l => l.status === 'NEGOTIATION').length;

    return {
      activeCount: activeLeadsList.length,
      totalPipelineValue,
      weightedPipelineValue: Math.round(weightedPipelineValue),
      wonCount: wonLeads.length,
      wonRevenue,
      winRate,
      inNegotiationCount
    };
  }, [leads]);

  // Filter and sort leads
  const filteredLeads = useMemo(() => {
    let result = leads.filter(lead => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        lead.name.toLowerCase().includes(q) ||
        (lead.company && lead.company.toLowerCase().includes(q)) ||
        (lead.email && lead.email.toLowerCase().includes(q)) ||
        (lead.phone && lead.phone.toLowerCase().includes(q)) ||
        (lead.location && lead.location.toLowerCase().includes(q)) ||
        lead.interestedService.toLowerCase().includes(q);

      const matchesService = selectedService === 'All' || lead.interestedService === selectedService;
      const matchesPriority = selectedPriority === 'All' || lead.priority === selectedPriority;
      const matchesSource = selectedSource === 'All' || lead.source === selectedSource;
      const matchesStage = selectedStage === 'All' || lead.status === selectedStage;
      const matchesOwner = selectedOwner === 'All' || lead.assignedTo === selectedOwner;

      // In table list, if selectedStage is 'All' and !showLostColumn, hide LOST
      const matchesLostVisibility = viewMode === 'kanban' || showLostColumn || selectedStage === 'LOST' || lead.status !== 'LOST';

      return matchesSearch && matchesService && matchesPriority && matchesSource && matchesStage && matchesOwner && matchesLostVisibility;
    });

    // Sorting
    return result.sort((a, b) => {
      if (sortBy === 'value') return (b.estimatedDealValue || 0) - (a.estimatedDealValue || 0);
      if (sortBy === 'prob') return (b.probability || 0) - (a.probability || 0);
      if (sortBy === 'company') return (a.company || a.name).localeCompare(b.company || b.name);
      return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
    });
  }, [leads, searchQuery, selectedService, selectedPriority, selectedSource, selectedStage, selectedOwner, showLostColumn, sortBy, viewMode]);

  // Drag and drop in Kanban
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleDrop = (e: React.DragEvent, targetStatus: LeadStatus) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('text/plain');
    if (leadId) {
      if (targetStatus === 'LOST') {
        const targetLead = leads.find(l => l.id === leadId);
        if (targetLead) {
          setLeadToMarkLost(targetLead);
          setLossReasonOption('Budget Constraint / Price Too High');
          setCustomLossReason('');
          return;
        }
      }
      updateLeadStatus(leadId, targetStatus);
      if (targetStatus === 'WON') {
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
        const targetLead = leads.find(l => l.id === leadId);
        if (targetLead && !targetLead.convertedClientId) {
          openConvertModal(targetLead);
        }
      }
    }
  };

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('text/plain', leadId);
  };

  // Open conversion modal
  const openConvertModal = (lead: Lead) => {
    setLeadToConvert(lead);
    setConversionConfig({
      accountManager: lead.assignedTo || currentUser?.fullName || 'Abhinav',
      serviceType: lead.interestedService || 'Custom AI Agent',
      projectDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createAgreement: true,
      milestoneSplit: '50/50'
    });
  };

  // Confirm loss reason
  const handleConfirmLostLead = () => {
    if (!leadToMarkLost) return;
    const finalReason = lossReasonOption === 'Other' ? (customLossReason.trim() || 'Other / Not Specified') : lossReasonOption;
    updateLeadStatus(leadToMarkLost.id, 'LOST', finalReason);
    setLeadToMarkLost(null);
  };

  // Perform full conversion
  const handleExecuteConversion = async () => {
    if (!leadToConvert) return;
    setIsConverting(true);
    try {
      const result = await convertLeadToClient(leadToConvert.id, conversionConfig);

      // If user requested initial agreement creation
      if (conversionConfig.createAgreement && result?.client) {
        addAgreement({
          name: `${leadToConvert.company || leadToConvert.name} - Master Service Agreement`,
          agreementType: 'Master Service Agreement',
          clientId: result.client.id,
          clientName: result.client.company,
          projectId: result.project?.id,
          projectName: result.project?.name,
          startDate: new Date().toISOString().split('T')[0],
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          commercialValue: leadToConvert.estimatedDealValue || 0,
          status: 'Draft'
        });
      }

      confetti({ particleCount: 140, spread: 90, origin: { y: 0.5 } });
      setLeadToConvert(null);
      setActiveLeadForDetails(null);

      // Navigate directly to the converted client account
      if (result?.client?.id) {
        onNavigate('clients', result.client.id);
      } else {
        onNavigate('clients');
      }
    } catch (err) {
      console.error('Lead conversion error:', err);
      toast.error('Conversion Failed', 'Could not complete client account creation.');
    } finally {
      setIsConverting(false);
    }
  };

  // Quick Communication Channels
  const handleOpenWhatsApp = (lead: Lead) => {
    const rawNumber = lead.whatsapp || lead.phone || '';
    const cleanNumber = rawNumber.replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanNumber.length === 10 ? `91${cleanNumber}` : cleanNumber;
    const message = encodeURIComponent(`Hi ${lead.name}, this is ${currentUser?.fullName || 'Abhinav'} from AGXperience regarding your interest in ${lead.interestedService}. How can we assist with your automation goals?`);
    window.open(`https://wa.me/${phoneWithCountry}?text=${message}`, '_blank');
    addLeadActivity(lead.id, 'WhatsApp', `Initiated WhatsApp chat with ${lead.name}`);
  };

  const handleOpenCall = (lead: Lead) => {
    if (lead.phone) {
      window.location.href = `tel:${lead.phone}`;
      addLeadActivity(lead.id, 'Call', `Placed phone call to ${lead.name} (${lead.phone})`);
    }
  };

  const handleOpenEmail = (lead: Lead) => {
    if (lead.email) {
      const subject = encodeURIComponent(`AGXperience • Collaboration on ${lead.interestedService}`);
      window.location.href = `mailto:${lead.email}?subject=${subject}`;
      addLeadActivity(lead.id, 'Email', `Sent email to ${lead.name} (${lead.email})`);
    }
  };

  // --- Lead-Linked Workflow Handlers ---
  const openLeadTaskModal = (lead: Lead) => {
    setLeadTaskModalLead(lead);
    setLeadTaskForm({
      title: `Follow-up: Scope requirements for ${lead.company || lead.name}`,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      priority: lead.priority || 'Medium',
      assignedTo: lead.assignedTo || currentUser?.fullName || '',
      estimatedHours: 2,
      description: `Task tied to opportunity ${lead.company || lead.name} (${lead.interestedService || 'Service Discovery'}).`
    });
  };

  const handleCreateLeadTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadTaskModalLead || !leadTaskForm.title.trim()) return;

    addTask({
      title: leadTaskForm.title.trim(),
      dueDate: leadTaskForm.dueDate,
      priority: leadTaskForm.priority,
      status: 'TO DO',
      assignedTo: leadTaskForm.assignedTo || currentUser?.fullName || 'Unassigned',
      estimatedHours: Number(leadTaskForm.estimatedHours) || 0,
      actualHours: 0,
      description: leadTaskForm.description.trim(),
      leadId: leadTaskModalLead.id,
      leadName: leadTaskModalLead.company || leadTaskModalLead.name
    });

    addLeadActivity(
      leadTaskModalLead.id,
      'Note',
      `📌 Task Created: "${leadTaskForm.title.trim()}" (Assigned: ${leadTaskForm.assignedTo || currentUser?.fullName || 'Unassigned'}, Due: ${leadTaskForm.dueDate})`
    );

    toast.success('Task Attached to Lead', `Task created and linked to ${leadTaskModalLead.company || leadTaskModalLead.name}.`);
    setLeadTaskModalLead(null);
  };

  const openLeadEventModal = (lead: Lead) => {
    setLeadEventModalLead(lead);
    const defaultDate = lead.nextFollowUp 
      ? (lead.nextFollowUp.includes('T') ? lead.nextFollowUp.slice(0, 16) : `${lead.nextFollowUp}T14:00`)
      : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
    
    setLeadEventForm({
      title: `Discovery & Demo Call with ${lead.company || lead.name}`,
      eventType: 'Meeting',
      startTime: defaultDate,
      location: lead.whatsapp ? `WhatsApp Call (${lead.whatsapp})` : 'Google Meet',
      participants: `${currentUser?.fullName || 'AGX Team'}, ${lead.name}`,
      notes: `Review interest in ${lead.interestedService || 'digital solutions'} and determine target milestones.`,
      updateFollowUp: true
    });
  };

  const handleCreateLeadEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadEventModalLead || !leadEventForm.title.trim() || !leadEventForm.startTime) return;

    const eventIso = new Date(leadEventForm.startTime).toISOString();
    const parts = leadEventForm.participants.split(',').map(p => p.trim()).filter(Boolean);

    addCalendarEvent({
      title: leadEventForm.title.trim(),
      eventType: leadEventForm.eventType,
      startTime: eventIso,
      location: leadEventForm.location.trim(),
      participants: parts.length ? parts : [currentUser?.fullName || 'AGX Team'],
      notes: leadEventForm.notes.trim(),
      relatedLeadId: leadEventModalLead.id
    });

    addLeadActivity(
      leadEventModalLead.id,
      'Meeting',
      `📅 Event Scheduled: "${leadEventForm.title.trim()}" (${leadEventForm.eventType}) on ${formatFollowUpDate(eventIso)}${leadEventForm.location ? ` via ${leadEventForm.location}` : ''}`
    );

    if (leadEventForm.updateFollowUp) {
      updateLead(leadEventModalLead.id, { nextFollowUp: eventIso.split('T')[0] });
    }

    toast.success('Event Scheduled for Lead', `Calendar event linked to ${leadEventModalLead.company || leadEventModalLead.name}.`);
    setLeadEventModalLead(null);
  };

  const openLeadProposalModal = (lead: Lead) => {
    setLeadProposalModalLead(lead);
    setLeadProposalForm({
      name: `Proposal - ${lead.interestedService || 'Full-Stack Solution'} for ${lead.company || lead.name}`,
      agreementType: 'Proposal',
      commercialValue: lead.estimatedDealValue || 150000,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      autoAdvanceStage: true
    });
  };

  const handleCreateLeadProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadProposalModalLead || !leadProposalForm.name.trim()) return;

    addAgreement({
      name: leadProposalForm.name.trim(),
      agreementType: leadProposalForm.agreementType,
      commercialValue: Number(leadProposalForm.commercialValue) || 0,
      startDate: new Date().toISOString().split('T')[0],
      expiryDate: leadProposalForm.expiryDate,
      status: 'Sent',
      leadId: leadProposalModalLead.id,
      clientName: leadProposalModalLead.company || leadProposalModalLead.name
    });

    addLeadActivity(
      leadProposalModalLead.id,
      'Note',
      `📄 Proposal Created: "${leadProposalForm.name.trim()}" for ₹${(Number(leadProposalForm.commercialValue) || 0).toLocaleString('en-IN')} (Expires: ${leadProposalForm.expiryDate})`
    );

    if (leadProposalForm.autoAdvanceStage && (leadProposalModalLead.status === 'NEW' || leadProposalModalLead.status === 'CONTACTED' || leadProposalModalLead.status === 'QUALIFIED')) {
      updateLeadStatus(leadProposalModalLead.id, 'PROPOSAL SENT');
      toast.info('Pipeline Stage Updated', `Lead moved to "PROPOSAL SENT" automatically.`);
    }

    toast.success('Proposal Attached to Lead', `Proposal generated and linked to ${leadProposalModalLead.company || leadProposalModalLead.name}.`);
    setLeadProposalModalLead(null);
  };

  // Form Submissions
  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLead.name.trim() || !newLead.company.trim()) {
      toast.error('Validation Error', 'Please provide contact name and company.');
      return;
    }
    const matchedPartner = partners.find(p => p.id === newLead.partnerId);
    const payload = {
      ...newLead,
      partnerId: matchedPartner?.id || undefined,
      partnerName: matchedPartner?.name || undefined,
      partnerCode: matchedPartner?.referralCode || undefined,
      source: matchedPartner ? `Partner Referral (${matchedPartner.name} - ${matchedPartner.referralCode})` : newLead.source
    };
    addLead(payload);
    setIsAddModalOpen(false);
    setNewLead({
      name: '',
      company: '',
      phone: '',
      email: '',
      whatsapp: '',
      location: '',
      interestedService: 'AI Customer Support & Dispatch Automation',
      estimatedDealValue: 15000,
      probability: 60,
      source: 'Website',
      assignedTo: currentUser?.fullName || 'Taylor Vance',
      priority: 'High',
      status: 'NEW',
      nextFollowUp: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      partnerId: '',
      notes: ''
    });
  };

  const handleSaveEditLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;
    updateLead(editingLead.id, editingLead);
    setEditingLead(null);
  };

  const handleConfirmDelete = () => {
    if (!leadToDelete) return;
    deleteLead(leadToDelete.id);
    if (activeLeadForDetails?.id === leadToDelete.id) {
      setActiveLeadForDetails(null);
    }
    setLeadToDelete(null);
  };

  const handleExportCsv = () => {
    exportService.exportToCsv('agx_leads_pipeline', filteredLeads.map(l => ({
      ID: l.id,
      Name: l.name,
      Company: l.company,
      Email: l.email,
      Phone: l.phone,
      WhatsApp: l.whatsapp || l.phone,
      Location: l.location || '',
      Service: l.interestedService,
      DealValueINR: l.estimatedDealValue,
      Probability: `${l.probability}%`,
      WeightedValueINR: Math.round((l.estimatedDealValue * l.probability) / 100),
      Stage: l.status,
      Priority: l.priority,
      Owner: l.assignedTo,
      Source: l.source,
      NextFollowUp: l.nextFollowUp || '',
      ConvertedClientId: l.convertedClientId || '',
      CreatedAt: l.createdAt
    })));
  };

  const visibleColumns = PIPELINE_COLUMNS.filter(col => col.status !== 'LOST' || showLostColumn);
  const currentActiveLead = activeLeadForDetails
    ? (leads.find(l => l.id === activeLeadForDetails.id) || activeLeadForDetails)
    : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            Lead Pipeline & Deal Engine
          </h2>
          <p className="text-xs text-gray-500">
            Systematic deal acquisition workflow with 1-click client conversion, touchpoint logging & Supabase sync.
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
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'kanban' ? 'bg-white text-black shadow-xs' : 'text-gray-500 hover:text-black'
              }`}
            >
              Kanban Board
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'list' ? 'bg-white text-black shadow-xs' : 'text-gray-500 hover:text-black'
              }`}
            >
              Table List
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-bold text-xs shadow-md transition-colors cursor-pointer"
          >
            <Plus size={15} /> Add Lead
          </button>
        </div>
      </div>

      {/* Row 1: KPI Metrics with Double-Bezel Architecture */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="double-bezel-outer card-tactile">
          <div className="double-bezel-inner p-5 flex items-start justify-between">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Active Pipeline Value</span>
              <span className="text-2xl font-black text-gray-900 mt-1 block tabular-nums">
                ₹{metrics.totalPipelineValue.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-indigo-600 font-bold flex items-center gap-1 mt-1 tabular-nums">
                <TrendingUp size={13} /> ₹{metrics.weightedPipelineValue.toLocaleString('en-IN')} weighted
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
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">In-Flight Deals</span>
              <span className="text-2xl font-black text-gray-900 mt-1 block tabular-nums">{metrics.activeCount} Deals</span>
              <span className="text-xs text-amber-600 font-bold flex items-center gap-1 mt-1 tabular-nums">
                <Flame size={13} /> {metrics.inNegotiationCount} in negotiation
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
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Closed Won Revenue</span>
              <span className="text-2xl font-black text-emerald-600 mt-1 block tabular-nums">
                ₹{metrics.wonRevenue.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-emerald-700 font-bold flex items-center gap-1 mt-1 tabular-nums">
                <CheckCircle2 size={13} /> {metrics.wonCount} won contracts
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-xs">
              <Sparkles size={18} />
            </div>
          </div>
        </div>

        <div className="double-bezel-outer card-tactile">
          <div className="double-bezel-inner p-5 flex items-start justify-between">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Pipeline Win Rate</span>
              <span className="text-2xl font-black text-purple-600 mt-1 block tabular-nums">{metrics.winRate}%</span>
              <span className="text-xs text-gray-400 font-medium mt-1 block tabular-nums">
                {leads.length} total captured opportunities
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold shadow-xs">
              <UserCheck size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Dynamic Filters & Search */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search leads by name, company, service, city, phone..."
              className="w-full bg-gray-50 hover:bg-gray-100/60 focus:bg-white border border-gray-200 rounded-xl pl-9 pr-8 py-2 text-xs text-gray-800 outline-none focus:border-black transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Dynamic Services Filter */}
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 rounded-xl px-3 py-2 outline-none cursor-pointer hover:border-gray-300 max-w-[180px] truncate"
            >
              <option value="All">All Services ({dynamicServices.length})</option>
              {dynamicServices.map((svc) => (
                <option key={svc} value={svc}>{svc}</option>
              ))}
            </select>

            {/* Stage Filter (Table mode) */}
            {viewMode === 'list' && (
              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 rounded-xl px-3 py-2 outline-none cursor-pointer hover:border-gray-300"
              >
                <option value="All">All Stages</option>
                {STAGE_ORDER.concat(['LOST']).map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            )}

            {/* Priority Filter */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 rounded-xl px-3 py-2 outline-none cursor-pointer hover:border-gray-300"
            >
              <option value="All">All Priorities</option>
              <option value="Urgent">Urgent 🚨</option>
              <option value="High">High 🔥</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            {/* Sources Filter */}
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 rounded-xl px-3 py-2 outline-none cursor-pointer hover:border-gray-300"
            >
              <option value="All">All Sources ({dynamicSources.length})</option>
              {dynamicSources.map((src) => (
                <option key={src} value={src}>{src}</option>
              ))}
            </select>

            {/* Owner Filter */}
            <select
              value={selectedOwner}
              onChange={(e) => setSelectedOwner(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 rounded-xl px-3 py-2 outline-none cursor-pointer hover:border-gray-300"
            >
              <option value="All">All Owners</option>
              {dynamicOwners.map((own) => (
                <option key={own} value={own}>{own}</option>
              ))}
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 rounded-xl px-3 py-2 outline-none cursor-pointer hover:border-gray-300"
            >
              <option value="date">Sort: Recent</option>
              <option value="value">Sort: Deal Value</option>
              <option value="prob">Sort: Probability</option>
              <option value="company">Sort: Company</option>
            </select>

            <button
              onClick={() => setShowLostColumn(!showLostColumn)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                showLostColumn
                  ? 'bg-gray-800 text-white border-gray-800'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              {showLostColumn ? 'Hide Lost' : 'Show Lost'}
            </button>
          </div>
        </div>

        {/* Active filter badges indicator */}
        {(searchQuery || selectedService !== 'All' || selectedPriority !== 'All' || selectedSource !== 'All' || selectedStage !== 'All' || selectedOwner !== 'All') && (
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100 text-xs text-gray-500 flex-wrap">
            <span className="font-semibold">Active Filters ({filteredLeads.length} matches):</span>
            {searchQuery && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded-md font-medium flex items-center gap-1">
                "{searchQuery}" <X size={11} className="cursor-pointer" onClick={() => setSearchQuery('')} />
              </span>
            )}
            {selectedService !== 'All' && (
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md font-medium flex items-center gap-1">
                {selectedService} <X size={11} className="cursor-pointer" onClick={() => setSelectedService('All')} />
              </span>
            )}
            {selectedStage !== 'All' && (
              <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md font-medium flex items-center gap-1">
                Stage: {selectedStage} <X size={11} className="cursor-pointer" onClick={() => setSelectedStage('All')} />
              </span>
            )}
            {selectedPriority !== 'All' && (
              <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md font-medium flex items-center gap-1">
                Priority: {selectedPriority} <X size={11} className="cursor-pointer" onClick={() => setSelectedPriority('All')} />
              </span>
            )}
            {selectedSource !== 'All' && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md font-medium flex items-center gap-1">
                Source: {selectedSource} <X size={11} className="cursor-pointer" onClick={() => setSelectedSource('All')} />
              </span>
            )}
            {selectedOwner !== 'All' && (
              <span className="px-2 py-0.5 bg-lime-100 text-lime-800 rounded-md font-medium flex items-center gap-1">
                Owner: {selectedOwner} <X size={11} className="cursor-pointer" onClick={() => setSelectedOwner('All')} />
              </span>
            )}
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedService('All');
                setSelectedPriority('All');
                setSelectedSource('All');
                setSelectedStage('All');
                setSelectedOwner('All');
              }}
              className="text-indigo-600 font-bold hover:underline ml-auto cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Row 3: Kanban View */}
      {viewMode === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-6 pt-1 items-start min-h-[620px]">
          {visibleColumns.map((col) => {
            const columnLeads = filteredLeads.filter(l => l.status === col.status);
            const totalColValue = columnLeads.reduce((acc, l) => acc + (l.estimatedDealValue || 0), 0);

            return (
              <div
                key={col.status}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.status)}
                className={`flex-1 min-w-[275px] max-w-[310px] bg-gray-50/70 border border-gray-200/80 rounded-3xl p-3.5 flex flex-col justify-between transition-colors border-t-4 ${col.borderAccent}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2 pb-2.5 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor} shadow-xs`} />
                      <h4 className="text-xs font-black text-gray-900 uppercase tracking-wide">{col.label}</h4>
                      <span className="text-[11px] font-bold px-2 py-0.2 rounded-full bg-white text-gray-800 shadow-2xs border border-gray-100">
                        {columnLeads.length}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setNewLead(prev => ({ ...prev, status: col.status }));
                        setIsAddModalOpen(true);
                      }}
                      className="p-1 text-gray-400 hover:text-black hover:bg-white rounded-lg transition-all cursor-pointer"
                      title={`Add Lead in ${col.label}`}
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className="text-[11px] text-gray-500 font-semibold mb-3 px-1 flex items-center justify-between">
                    <span>Stage Value:</span>
                    <strong className="text-gray-900 font-bold">₹{totalColValue.toLocaleString('en-IN')}</strong>
                  </div>

                  <div className="space-y-3">
                    {columnLeads.length === 0 ? (
                      <div className="py-10 text-center text-gray-400 border border-dashed border-gray-200 rounded-2xl p-4 bg-white/40 text-xs">
                        No deals in this stage
                      </div>
                    ) : (
                      columnLeads.map((lead) => {
                        const monogram = (lead.company || lead.name || 'AG')
                          .split(' ')
                          .map(w => w[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase();

                        return (
                          <div
                            key={lead.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, lead.id)}
                            onClick={() => setActiveLeadForDetails(lead)}
                            className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing group relative hover:border-gray-300 card-tactile"
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${getMonogramGradient(lead.company || lead.name)} text-white font-extrabold text-xs flex items-center justify-center shadow-xs shrink-0`}>
                                  {monogram}
                                </div>
                                <div className="min-w-0">
                                  <h4 className="font-black text-xs text-gray-900 group-hover:text-black transition-colors truncate">
                                    {lead.company || lead.name}
                                  </h4>
                                  <span className="text-[10px] text-gray-400 flex items-center gap-1 truncate">
                                    <User size={10} /> {lead.name} {lead.location ? `• ${lead.location}` : ''}
                                  </span>
                                </div>
                              </div>

                              <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border shrink-0 ${
                                lead.priority === 'Urgent' ? 'bg-red-50 text-red-700 border-red-200' :
                                lead.priority === 'High' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                'bg-gray-50 text-gray-600 border-gray-200'
                              }`}>
                                {lead.priority}
                              </span>
                            </div>

                            <div className="mb-3 flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50/80 px-2.5 py-0.5 rounded-md line-clamp-1 inline-block">
                                {lead.interestedService}
                              </span>
                              {lead.partnerName && (
                                <span className="text-[9px] font-bold text-violet-700 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-md truncate inline-flex items-center gap-1" title={`Partner: ${lead.partnerName}`}>
                                  🤝 {lead.partnerName}
                                </span>
                              )}
                            </div>

                            {lead.status === 'LOST' && lead.lossReason && (
                              <div className="mb-2">
                                <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md truncate block">
                                  Lost: {lead.lossReason}
                                </span>
                              </div>
                            )}

                            <div className="space-y-1.5 pt-2 border-t border-gray-100">
                              <div className="flex items-center justify-between text-xs tabular-nums">
                                <span className="font-black text-gray-900">
                                  ₹{(lead.estimatedDealValue || 0).toLocaleString('en-IN')}
                                </span>
                                <span className="text-[10px] font-bold text-gray-500">
                                  {lead.probability}% Prob
                                </span>
                              </div>
                              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                <div
                                  style={{ width: `${lead.probability}%` }}
                                  className={`h-full rounded-full transition-all ${
                                    lead.probability >= 80 ? 'bg-emerald-500' :
                                    lead.probability >= 50 ? 'bg-[#CCFF00]' : 'bg-indigo-400'
                                  }`}
                                />
                              </div>
                            </div>

                            <div className="mt-3 pt-2.5 border-t border-gray-50 flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                {(lead.whatsapp || lead.phone) && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleOpenWhatsApp(lead); }}
                                    className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer btn-press"
                                    title="WhatsApp Chat"
                                  >
                                    <MessageSquare size={13} />
                                  </button>
                                )}
                                {lead.phone && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleOpenCall(lead); }}
                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer btn-press"
                                    title="Call Lead"
                                  >
                                    <Phone size={13} />
                                  </button>
                                )}
                                {lead.email && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleOpenEmail(lead); }}
                                    className="p-1 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer btn-press"
                                    title="Send Email"
                                  >
                                    <Mail size={13} />
                                  </button>
                                )}
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  onClick={(e) => { e.stopPropagation(); setEditingLead(lead); }}
                                  className="p-1 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-gray-100 cursor-pointer btn-press"
                                  title="Edit Lead"
                                >
                                  <Edit3 size={13} />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setLeadToDelete(lead); }}
                                  className="p-1 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-gray-100 cursor-pointer btn-press"
                                  title="Delete Lead"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>

                            {lead.status === 'WON' && (
                              <div className="mt-2.5 pt-2 border-t border-emerald-100">
                                {lead.convertedClientId ? (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); onNavigate('clients', lead.convertedClientId); }}
                                    className="w-full py-1.5 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                  >
                                    <CheckCircle2 size={13} className="text-emerald-600" /> View Client Account
                                  </button>
                                ) : (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); openConvertModal(lead); }}
                                    className="w-full py-1.5 px-2.5 bg-[#CCFF00] hover:bg-[#b8e600] text-black font-extrabold text-[11px] rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                                  >
                                    <Sparkles size={13} /> Convert to Client 🎉
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Row 4: Table List View */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Company & Lead</th>
                  <th className="py-3.5 px-3">Service Offering</th>
                  <th className="py-3.5 px-3">Deal Value</th>
                  <th className="py-3.5 px-3">Stage / Status</th>
                  <th className="py-3.5 px-3">Priority</th>
                  <th className="py-3.5 px-3">Source & Owner</th>
                  <th className="py-3.5 px-3 text-center">Channels</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-400 text-xs">
                      No leads match the specified filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => {
                    const monogram = (lead.company || lead.name || 'AG')
                      .split(' ')
                      .map(w => w[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase();

                    return (
                      <tr
                        key={lead.id}
                        onClick={() => setActiveLeadForDetails(lead)}
                        className="hover:bg-gray-50/80 transition-colors cursor-pointer group"
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${getMonogramGradient(lead.company || lead.name)} text-white font-extrabold text-xs flex items-center justify-center shadow-2xs shrink-0`}>
                              {monogram}
                            </div>
                            <div>
                              <div className="font-extrabold text-gray-900 text-xs group-hover:text-black">{lead.company || lead.name}</div>
                              <div className="text-[11px] text-gray-400">{lead.name} {lead.location ? `• ${lead.location}` : ''}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-3">
                          <span className="font-medium text-gray-800 line-clamp-1">{lead.interestedService}</span>
                        </td>

                        <td className="py-3.5 px-3">
                          <div className="font-black text-gray-900">₹{(lead.estimatedDealValue || 0).toLocaleString('en-IN')}</div>
                          <div className="text-[10px] text-gray-400 font-semibold">{lead.probability}% Prob</div>
                        </td>

                        <td className="py-3.5 px-3" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={lead.status}
                            onChange={(e) => {
                              const newSt = e.target.value as LeadStatus;
                              if (newSt === 'LOST') {
                                setLeadToMarkLost(lead);
                                setLossReasonOption('Budget Constraint / Price Too High');
                                setCustomLossReason('');
                                return;
                              }
                              updateLeadStatus(lead.id, newSt);
                              if (newSt === 'WON') {
                                confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
                                if (!lead.convertedClientId) {
                                  openConvertModal(lead);
                                }
                              }
                            }}
                            className="bg-gray-50 border border-gray-200 text-[11px] font-bold text-gray-800 rounded-lg px-2.5 py-1 outline-none cursor-pointer hover:border-gray-300"
                          >
                            {STAGE_ORDER.concat(['LOST']).map(st => (
                              <option key={st} value={st}>{st}</option>
                            ))}
                          </select>
                          {lead.status === 'LOST' && lead.lossReason && (
                            <div className="text-[10px] text-rose-600 font-semibold mt-0.5 truncate max-w-[120px]" title={lead.lossReason}>
                              {lead.lossReason}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-3">
                          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                            lead.priority === 'Urgent' ? 'bg-red-50 text-red-700 border-red-200' :
                            lead.priority === 'High' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-gray-50 text-gray-700 border-gray-200'
                          }`}>
                            {lead.priority}
                          </span>
                        </td>

                        <td className="py-3.5 px-3">
                          <div className="text-[11px] font-medium text-gray-700 flex items-center gap-1.5 flex-wrap">
                            <span>{lead.source}</span>
                            {lead.partnerName && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[9px] font-bold border border-indigo-200" title={`Referred by ${lead.partnerName} (${lead.partnerCode || ''})`}>
                                🤝 {lead.partnerName}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-gray-400">{lead.assignedTo || 'Unassigned'}</div>
                        </td>

                        <td className="py-3.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1">
                            {(lead.whatsapp || lead.phone) && (
                              <button
                                onClick={() => handleOpenWhatsApp(lead)}
                                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer"
                                title="WhatsApp"
                              >
                                <MessageSquare size={13} />
                              </button>
                            )}
                            {lead.phone && (
                              <button
                                onClick={() => handleOpenCall(lead)}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                                title="Phone"
                              >
                                <Phone size={13} />
                              </button>
                            )}
                            {lead.email && (
                              <button
                                onClick={() => handleOpenEmail(lead)}
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
                            {lead.status === 'WON' && !lead.convertedClientId && (
                              <button
                                onClick={() => openConvertModal(lead)}
                                className="px-2.5 py-1 bg-[#CCFF00] hover:bg-[#b8e600] text-black font-extrabold text-[10px] rounded-lg shadow-2xs cursor-pointer"
                              >
                                Convert
                              </button>
                            )}
                            {lead.convertedClientId && (
                              <button
                                onClick={() => onNavigate('clients', lead.convertedClientId)}
                                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-lg cursor-pointer"
                              >
                                Client
                              </button>
                            )}
                            <button
                              onClick={() => setEditingLead(lead)}
                              className="p-1 text-gray-400 hover:text-black rounded cursor-pointer"
                              title="Edit"
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              onClick={() => setLeadToDelete(lead)}
                              className="p-1 text-gray-400 hover:text-rose-600 rounded cursor-pointer"
                              title="Delete"
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

      {/* Row 5: 360° Lead Details Drawer */}
      {currentActiveLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="bg-white w-full max-w-xl h-full shadow-2xl border-l border-gray-100 flex flex-col justify-between overflow-y-auto"
          >
            <div>
              <div className="p-6 border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-md z-10">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${getMonogramGradient(currentActiveLead.company || currentActiveLead.name)} text-white font-black text-base flex items-center justify-center shadow-sm`}>
                      {(currentActiveLead.company || currentActiveLead.name).slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-xl text-gray-900">{currentActiveLead.company || currentActiveLead.name}</h3>
                      <p className="text-xs text-gray-500">Contact: {currentActiveLead.name} {currentActiveLead.location ? `• ${currentActiveLead.location}` : ''}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveLeadForDetails(null)}
                    className="p-2 text-gray-400 hover:text-black rounded-xl hover:bg-gray-100 cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Stage Progression Stepper */}
                <div className="mt-5 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pipeline Stage Progression</span>
                    <span className="text-xs font-extrabold text-indigo-600">{currentActiveLead.status}</span>
                  </div>
                  <div className="grid grid-cols-6 gap-1">
                    {STAGE_ORDER.map((stage, idx) => {
                      const currentIdx = STAGE_ORDER.indexOf(currentActiveLead.status);
                      const isComplete = currentIdx >= idx;
                      const isCurrent = currentActiveLead.status === stage;

                      return (
                        <button
                          key={stage}
                          onClick={() => {
                            updateLeadStatus(currentActiveLead.id, stage);
                            if (stage === 'WON') {
                              confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
                              if (!currentActiveLead.convertedClientId) {
                                openConvertModal(currentActiveLead);
                              }
                            }
                          }}
                          className={`py-1.5 px-1 rounded-lg text-[9px] font-bold text-center transition-all cursor-pointer truncate ${
                            isCurrent
                              ? 'bg-black text-[#CCFF00] shadow-xs'
                              : isComplete
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                          title={`Set stage to ${stage}`}
                        >
                          {stage === 'PROPOSAL SENT' ? 'Proposal' : stage}
                        </button>
                      );
                    })}
                  </div>
                  {currentActiveLead.status !== 'LOST' && currentActiveLead.status !== 'WON' && (
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={() => {
                          setLeadToMarkLost(currentActiveLead);
                          setLossReasonOption('Budget Constraint / Price Too High');
                          setCustomLossReason('');
                        }}
                        className="text-[10px] font-bold text-rose-600 hover:text-rose-800 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <X size={11} /> Mark Deal as Closed Lost...
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 space-y-6 text-xs">
                {/* Closed Lost Banner */}
                {currentActiveLead.status === 'LOST' && (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 shadow-xs flex items-center justify-between gap-3">
                    <div>
                      <h4 className="font-extrabold text-sm text-rose-800 flex items-center gap-1.5">
                        <AlertCircle size={16} /> Deal Closed Lost
                      </h4>
                      <p className="text-[11px] text-rose-600 mt-0.5">
                        Reason: <strong>{currentActiveLead.lossReason || 'Closed Lost'}</strong>
                      </p>
                    </div>
                    <button
                      onClick={() => updateLeadStatus(currentActiveLead.id, 'CONTACTED')}
                      className="px-3.5 py-1.5 bg-white text-rose-800 font-extrabold text-xs rounded-xl border border-rose-200 hover:bg-rose-100/50 cursor-pointer shrink-0"
                    >
                      Reopen Deal ↺
                    </button>
                  </div>
                )}

                {/* Closed Won Banner & Conversion Callout */}
                {currentActiveLead.status === 'WON' && (
                  <div className="p-4 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl text-white shadow-md flex items-center justify-between gap-3">
                    <div>
                      <h4 className="font-extrabold text-sm flex items-center gap-1.5">
                        <Sparkles size={16} /> Deal Closed Won!
                      </h4>
                      <p className="text-[11px] text-emerald-100 mt-0.5">
                        Convert into active client account, project deliverables & agreements.
                      </p>
                    </div>

                    {currentActiveLead.convertedClientId ? (
                      <button
                        onClick={() => {
                          const clId = currentActiveLead.convertedClientId;
                          setActiveLeadForDetails(null);
                          onNavigate('clients', clId);
                        }}
                        className="px-4 py-2 bg-white text-emerald-900 font-extrabold text-xs rounded-xl shadow-xs hover:bg-gray-100 cursor-pointer shrink-0"
                      >
                        View Client
                      </button>
                    ) : (
                      <button
                        onClick={() => openConvertModal(currentActiveLead)}
                        className="px-4 py-2 bg-[#CCFF00] text-black font-black text-xs rounded-xl shadow-xs hover:bg-[#b8e600] cursor-pointer shrink-0"
                      >
                        Convert to Client 🎉
                      </button>
                    )}
                  </div>
                )}

                {/* Follow-up reminder if set */}
                {currentActiveLead.nextFollowUp && (
                  <div className="p-3.5 bg-indigo-50/90 border border-indigo-100 rounded-2xl flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                        <Clock size={16} />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block">Next Target Follow-Up</span>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <strong className="text-indigo-950 text-xs font-black">
                            {formatFollowUpDate(currentActiveLead.nextFollowUp)}
                          </strong>
                          {getRelativeFollowUpBadge(currentActiveLead.nextFollowUp)}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => openLeadEventModal(currentActiveLead)}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-[11px] hover:bg-indigo-700 cursor-pointer transition-colors shadow-xs shrink-0"
                    >
                      Schedule on Calendar
                    </button>
                  </div>
                )}

                {/* Quick Communication Channels */}
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-3">Quick Communication Channels</span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleOpenWhatsApp(currentActiveLead)}
                      className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <MessageSquare size={14} /> WhatsApp
                    </button>
                    <button
                      onClick={() => handleOpenCall(currentActiveLead)}
                      className="py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Phone size={14} /> Call Lead
                    </button>
                    <button
                      onClick={() => handleOpenEmail(currentActiveLead)}
                      className="py-2.5 px-3 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Mail size={14} /> Send Email
                    </button>
                  </div>
                </div>

                {/* Deal Intelligence Specs */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <h4 className="font-bold text-gray-900 text-sm">Deal Intelligence</h4>
                    <button
                      onClick={() => setEditingLead(currentActiveLead)}
                      className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 size={12} /> Edit Details
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase">Service Offering</span>
                      <strong className="text-gray-900 text-xs">{currentActiveLead.interestedService}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase">Deal Commercial Value</span>
                      <strong className="text-gray-900 text-xs">₹{(currentActiveLead.estimatedDealValue || 0).toLocaleString('en-IN')}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase">Win Probability</span>
                      <strong className="text-gray-900 text-xs">{currentActiveLead.probability}% ({currentActiveLead.priority} Priority)</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase">Acquisition Source</span>
                      <strong className="text-gray-900 text-xs">{currentActiveLead.source}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase">Assigned Deal Owner</span>
                      <strong className="text-gray-900 text-xs">{currentActiveLead.assignedTo || 'Unassigned'}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase">Direct Phone / WA</span>
                      <strong className="text-gray-900 text-xs">{currentActiveLead.phone || currentActiveLead.whatsapp || 'None'}</strong>
                    </div>
                  </div>
                </div>

                {/* Workflow Shortcuts */}
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2.5">Workflow Shortcuts</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setLeadQuotationModalLead(currentActiveLead)}
                      className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-100 rounded-xl font-bold text-[11px] text-gray-700 flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                    >
                      <Tag size={13} className="text-emerald-600" /> Create Quotation
                    </button>
                    <button
                      onClick={() => openLeadTaskModal(currentActiveLead)}
                      className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-100 rounded-xl font-bold text-[11px] text-gray-700 flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                    >
                      <CheckSquare size={13} className="text-indigo-600" /> Create Task
                    </button>
                    <button
                      onClick={() => openLeadEventModal(currentActiveLead)}
                      className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-100 rounded-xl font-bold text-[11px] text-gray-700 flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                    >
                      <Calendar size={13} className="text-purple-600" /> Schedule Event
                    </button>
                    <button
                      onClick={() => openLeadProposalModal(currentActiveLead)}
                      className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-100 rounded-xl font-bold text-[11px] text-gray-700 flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                    >
                      <FileText size={13} className="text-amber-600" /> Create Proposal
                    </button>
                    {currentActiveLead.convertedProjectId && (
                      <button
                        onClick={() => onNavigate('projects', currentActiveLead.convertedProjectId)}
                        className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-xl font-bold text-[11px] text-indigo-700 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Briefcase size={13} /> View Project Hub
                      </button>
                    )}
                  </div>
                </div>

                {/* Attached Deliverables & Tracking Section */}
                {(() => {
                  const activeLeadTasks = tasks.filter(t => t.leadId === currentActiveLead.id);
                  const activeLeadEvents = events.filter(e => e.relatedLeadId === currentActiveLead.id);
                  const activeLeadAgreements = agreements.filter(a => a.leadId === currentActiveLead.id);
                  const activeLeadQuotations = (quotations || []).filter(q => {
                    if (q.leadId && q.leadId === currentActiveLead.id) return true;
                    const lName = (currentActiveLead.name || '').trim().toLowerCase();
                    const lComp = (currentActiveLead.company || '').trim().toLowerCase();
                    const qLead = (q.leadName || '').trim().toLowerCase();
                    const qClient = (q.clientName || '').trim().toLowerCase();
                    const qComp = (q.companyName || q.company || '').trim().toLowerCase();
                    return (lName && (qLead === lName || qClient === lName)) ||
                           (lComp && (qComp === lComp || qClient === lComp));
                  });
                  const totalLinked = activeLeadTasks.length + activeLeadEvents.length + activeLeadAgreements.length + activeLeadQuotations.length;

                  return (
                    <div className="bg-white rounded-2xl border border-gray-200/80 p-4 space-y-4 shadow-2xs">
                      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                            <Layers size={13} />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-sm text-gray-900 leading-none">Linked Workflows & Deliverables</h4>
                            <span className="text-[10px] text-gray-400 font-semibold">Active quotes, tasks, calendar bookings & commercial proposals</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 bg-gray-100 text-gray-700 rounded-full border border-gray-200">
                          {totalLinked} {totalLinked === 1 ? 'item' : 'items'}
                        </span>
                      </div>

                      {/* 1. Attached Tasks Section */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-extrabold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                            <CheckSquare size={13} className="text-indigo-600" />
                            Attached Tasks ({activeLeadTasks.length})
                          </span>
                          <button
                            onClick={() => openLeadTaskModal(currentActiveLead)}
                            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                          >
                            <Plus size={11} /> New Task
                          </button>
                        </div>

                        {activeLeadTasks.length === 0 ? (
                          <div className="p-3 bg-gray-50/70 border border-dashed border-gray-200 rounded-xl text-center">
                            <p className="text-[11px] text-gray-400">No tasks attached to this opportunity yet.</p>
                          </div>
                        ) : (
                          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                            {activeLeadTasks.map(task => {
                              const isCompleted = task.status === 'COMPLETED';
                              return (
                                <div
                                  key={task.id}
                                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-2.5 transition-colors ${
                                    isCompleted ? 'bg-emerald-50/40 border-emerald-100' : 'bg-gray-50 border-gray-100 hover:bg-gray-100/70'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <button
                                      type="button"
                                      onClick={() => updateTaskStatus(task.id, isCompleted ? 'TO DO' : 'COMPLETED')}
                                      className={`w-5 h-5 rounded-lg flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                                        isCompleted ? 'bg-emerald-500 text-white' : 'border border-gray-300 bg-white hover:border-gray-500'
                                      }`}
                                      title={isCompleted ? 'Mark Incomplete' : 'Mark Completed'}
                                    >
                                      {isCompleted && <Check size={12} className="stroke-3" />}
                                    </button>
                                    <div className="min-w-0">
                                      <p className={`text-xs font-bold truncate ${isCompleted ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                                        {task.title}
                                      </p>
                                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-400">
                                        <span className={`font-bold px-1.5 py-0.2 rounded-md ${
                                          task.priority === 'Urgent' ? 'bg-rose-100 text-rose-700' :
                                          task.priority === 'High' ? 'bg-amber-100 text-amber-700' :
                                          'bg-gray-200 text-gray-700'
                                        }`}>
                                          {task.priority}
                                        </span>
                                        {task.dueDate && <span>Due: {task.dueDate}</span>}
                                        {task.assignedTo && <span>• {task.assignedTo}</span>}
                                      </div>
                                    </div>
                                  </div>
                                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                                    task.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                                    task.status === 'IN PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {task.status}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* 2. Scheduled Events Section */}
                      <div className="space-y-2 pt-2 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-extrabold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                            <Calendar size={13} className="text-purple-600" />
                            Scheduled Events ({activeLeadEvents.length})
                          </span>
                          <button
                            onClick={() => openLeadEventModal(currentActiveLead)}
                            className="text-[10px] font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1 cursor-pointer"
                          >
                            <Plus size={11} /> Schedule
                          </button>
                        </div>

                        {activeLeadEvents.length === 0 ? (
                          <div className="p-3 bg-gray-50/70 border border-dashed border-gray-200 rounded-xl text-center">
                            <p className="text-[11px] text-gray-400">No events or demo meetings scheduled.</p>
                          </div>
                        ) : (
                          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                            {activeLeadEvents.map(event => (
                              <div
                                key={event.id}
                                className="p-2.5 rounded-xl border border-purple-100 bg-purple-50/30 flex items-center justify-between gap-2.5"
                              >
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-extrabold px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded-md">
                                      {event.eventType}
                                    </span>
                                    <p className="text-xs font-bold text-gray-900 truncate">
                                      {event.title}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-500">
                                    <span className="font-semibold">{formatFollowUpDate(event.startTime)}</span>
                                    {event.location && <span>• {event.location}</span>}
                                  </div>
                                </div>
                                <button
                                  onClick={() => onNavigate('calendar', event.id)}
                                  className="p-1.5 text-purple-600 hover:bg-purple-100 rounded-lg cursor-pointer shrink-0 transition-colors"
                                  title="View on Calendar"
                                >
                                  <ExternalLink size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* 3. Proposals & Agreements Section */}
                      <div className="space-y-2 pt-2 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-extrabold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                            <FileText size={13} className="text-amber-600" />
                            Proposals & Agreements ({activeLeadAgreements.length})
                          </span>
                          <button
                            onClick={() => openLeadProposalModal(currentActiveLead)}
                            className="text-[10px] font-bold text-amber-600 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
                          >
                            <Plus size={11} /> New Proposal
                          </button>
                        </div>

                        {activeLeadAgreements.length === 0 ? (
                          <div className="p-3 bg-gray-50/70 border border-dashed border-gray-200 rounded-xl text-center">
                            <p className="text-[11px] text-gray-400">No proposals or formal agreements generated yet.</p>
                          </div>
                        ) : (
                          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                            {activeLeadAgreements.map(agreement => (
                              <div
                                key={agreement.id}
                                className="p-2.5 rounded-xl border border-amber-100 bg-amber-50/30 flex items-center justify-between gap-2.5"
                              >
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-extrabold px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded-md">
                                      {agreement.agreementType}
                                    </span>
                                    <p className="text-xs font-bold text-gray-900 truncate">
                                      {agreement.name}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-500">
                                    <span className="font-extrabold text-gray-800">
                                      ₹{(agreement.commercialValue || 0).toLocaleString('en-IN')}
                                    </span>
                                    {agreement.expiryDate && <span>• Valid till {agreement.expiryDate}</span>}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                                    agreement.status === 'Signed' ? 'bg-emerald-100 text-emerald-800' :
                                    agreement.status === 'Sent' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'
                                  }`}>
                                    {agreement.status}
                                  </span>
                                  <button
                                    onClick={() => onNavigate('documents', agreement.id)}
                                    className="p-1.5 text-amber-700 hover:bg-amber-100 rounded-lg cursor-pointer transition-colors"
                                    title="View Proposal Document"
                                  >
                                    <ExternalLink size={12} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* 4. Attached Quotations & Estimates Section */}
                      <div className="space-y-2 pt-2 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-extrabold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                            <Tag size={13} className="text-emerald-600" />
                            Quotations & Scope ({activeLeadQuotations.length})
                          </span>
                          <button
                            onClick={() => setLeadQuotationModalLead(currentActiveLead)}
                            className="text-[10px] font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                          >
                            <Plus size={11} /> New Quote
                          </button>
                        </div>

                        {activeLeadQuotations.length === 0 ? (
                          <div className="p-3 bg-gray-50/70 border border-dashed border-gray-200 rounded-xl text-center">
                            <p className="text-[11px] text-gray-400">No quotation generated for this lead opportunity yet.</p>
                          </div>
                        ) : (
                          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                            {activeLeadQuotations.map(quote => (
                              <div
                                key={quote.id}
                                className="p-2.5 rounded-xl border border-gray-100 bg-gray-50/80 hover:bg-gray-100 transition-colors flex items-center justify-between gap-2"
                              >
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-extrabold text-gray-900 text-xs">{quote.quotationNumber}</span>
                                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                                      quote.status === 'Accepted' ? 'bg-emerald-100 text-emerald-800' :
                                      quote.status === 'Converted' ? 'bg-indigo-100 text-indigo-800' :
                                      quote.status === 'Declined' ? 'bg-rose-100 text-rose-800' :
                                      quote.status === 'Sent' ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-700'
                                    }`}>
                                      {quote.status}
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-gray-500 truncate mt-0.5">
                                    ₹{quote.total.toLocaleString('en-IN')} • {quote.serviceTitle}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    onClick={() => setPreviewQuotation(quote)}
                                    className="px-2 py-1 bg-black text-white hover:bg-gray-800 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                                  >
                                    PDF
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Touchpoint Activity History */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-gray-900">Touchpoints & Activity History</h4>
                    <span className="text-[10px] text-gray-400 font-semibold">{currentActiveLead.activities?.length || 0} touchpoints</span>
                  </div>

                  <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200/60 space-y-2.5">
                    <div className="flex items-center gap-1.5 overflow-x-auto">
                      {(['Call', 'WhatsApp', 'Email', 'Meeting', 'Note'] as LeadActivityType[]).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setNewActivityType(type)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                            newActivityType === type ? 'bg-black text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newActivityNotes}
                        onChange={(e) => setNewActivityNotes(e.target.value)}
                        placeholder={`Log key talking points for this ${newActivityType.toLowerCase()}...`}
                        className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-black"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!newActivityNotes.trim()) return;
                          addLeadActivity(currentActiveLead.id, newActivityType, newActivityNotes);
                          setNewActivityNotes('');
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-black hover:bg-gray-800 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Send size={12} /> Log
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2.5 max-h-60 overflow-y-auto">
                    {!currentActiveLead.activities || currentActiveLead.activities.length === 0 ? (
                      <p className="text-gray-400 text-center py-4 text-xs italic">No logged touchpoints yet. Use the logger above to track calls & chats.</p>
                    ) : (
                      currentActiveLead.activities.map((act) => (
                        <div key={act.id} className="p-3 bg-gray-50 border border-gray-100 rounded-xl space-y-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                              {act.activityType}
                            </span>
                            <span className="text-gray-400 font-mono">
                              {new Date(act.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-gray-700 text-xs leading-relaxed">{act.notes}</p>
                          <div className="text-[10px] text-gray-400 font-medium">Logged by: {act.userName}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-2">
              <button
                onClick={() => setLeadToDelete(currentActiveLead)}
                className="px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <Trash2 size={13} /> Delete Lead
              </button>

              <button
                onClick={() => setEditingLead(currentActiveLead)}
                className="px-4 py-2 bg-black hover:bg-gray-800 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer"
              >
                Edit Complete Profile
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Row 6: Convert Lead to Client Modal */}
      {leadToConvert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-gray-100"
          >
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#CCFF00] text-black font-black flex items-center justify-center">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-gray-900">Convert Lead to Client Account</h3>
                  <p className="text-[11px] text-gray-400">Instantiate Client, Production Project & Legal Agreement</p>
                </div>
              </div>
              <button onClick={() => setLeadToConvert(null)} className="p-1 text-gray-400 hover:text-black cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
                <div className="font-bold text-gray-900 text-sm">{leadToConvert.company || leadToConvert.name}</div>
                <div className="text-gray-500">Contact: {leadToConvert.name} • {leadToConvert.email}</div>
                <div className="text-emerald-700 font-extrabold">Deal Value: ₹{(leadToConvert.estimatedDealValue || 0).toLocaleString('en-IN')}</div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Assigned Account Manager</label>
                <select
                  value={conversionConfig.accountManager}
                  onChange={(e) => setConversionConfig({ ...conversionConfig, accountManager: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none cursor-pointer"
                >
                  {teamMembers.map(m => (
                    <option key={m.id} value={m.fullName}>{m.fullName} ({m.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Target Project Delivery Date</label>
                <input
                  type="date"
                  value={conversionConfig.projectDueDate}
                  onChange={(e) => setConversionConfig({ ...conversionConfig, projectDueDate: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Contract Milestone Tranches</label>
                <select
                  value={conversionConfig.milestoneSplit}
                  onChange={(e) => setConversionConfig({ ...conversionConfig, milestoneSplit: e.target.value as any })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none cursor-pointer font-semibold"
                >
                  <option value="50/50">50/50 Split (Architecture 50% + Delivery 50%)</option>
                  <option value="40/30/30">40/30/30 Split (Kickoff 40% + Alpha 30% + Go-Live 30%)</option>
                  <option value="30/70">30/70 Split (Advance 30% + Final Handover 70%)</option>
                  <option value="100">100% Single Tranche (Full Handover Delivery)</option>
                </select>
                <span className="text-[10px] text-gray-400 mt-1 block">
                  Automatically initializes milestone deliverables in the project roadmap with proportional billing amounts.
                </span>
              </div>

              <div className="flex items-center gap-2 p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl">
                <input
                  type="checkbox"
                  id="createAgr"
                  checked={conversionConfig.createAgreement}
                  onChange={(e) => setConversionConfig({ ...conversionConfig, createAgreement: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="createAgr" className="text-indigo-900 font-semibold cursor-pointer">
                  Generate draft Master Service Agreement (MSA) in Documents repository
                </label>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setLeadToConvert(null)}
                  className="px-4 py-2 rounded-xl border border-gray-200 font-bold text-gray-600 cursor-pointer hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isConverting}
                  onClick={handleExecuteConversion}
                  className="px-5 py-2 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-extrabold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles size={14} /> {isConverting ? 'Converting...' : 'Confirm & Open Client'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Loss Reason Capture Modal */}
      {leadToMarkLost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100"
          >
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 font-black flex items-center justify-center">
                  <AlertCircle size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-gray-900">Mark Opportunity as Lost</h3>
                  <p className="text-[11px] text-gray-400">Capture reason for sales pipeline analytics</p>
                </div>
              </div>
              <button onClick={() => setLeadToMarkLost(null)} className="p-1 text-gray-400 hover:text-black cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
                <div className="font-bold text-gray-900 text-sm">{leadToMarkLost.company || leadToMarkLost.name}</div>
                <div className="text-gray-500">Pipeline Deal: ₹{(leadToMarkLost.estimatedDealValue || 0).toLocaleString('en-IN')}</div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Primary Loss Reason *</label>
                <select
                  value={lossReasonOption}
                  onChange={(e) => setLossReasonOption(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none cursor-pointer font-semibold"
                >
                  <option value="Budget Constraint / Price Too High">Budget Constraint / Price Too High</option>
                  <option value="Chose Competitor">Chose Competitor</option>
                  <option value="Project Postponed / Timing Mismatch">Project Postponed / Timing Mismatch</option>
                  <option value="No Response / Ghosted">No Response / Ghosted</option>
                  <option value="Scope / Feature Mismatch">Scope / Feature Mismatch</option>
                  <option value="Internal Solution Chosen">Internal Solution Chosen</option>
                  <option value="Other">Other (Specify Custom Reason)...</option>
                </select>
              </div>

              {lossReasonOption === 'Other' && (
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Custom Notes / Context</label>
                  <textarea
                    rows={2}
                    value={customLossReason}
                    onChange={(e) => setCustomLossReason(e.target.value)}
                    placeholder="Describe why the deal was closed lost..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  />
                </div>
              )}

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setLeadToMarkLost(null)}
                  className="px-4 py-2 rounded-xl border border-gray-200 font-bold text-gray-600 cursor-pointer hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmLostLead}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  Confirm Closed Lost
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Row 7: Add Lead Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <h3 className="font-extrabold text-lg text-gray-900">Create New Inbound Lead</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-gray-400 hover:text-black cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Company / Organization *</label>
                  <input
                    type="text"
                    required
                    value={newLead.company}
                    onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
                    placeholder="e.g. Zenith Retail Corp"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Contact Person Name *</label>
                  <input
                    type="text"
                    required
                    value={newLead.name}
                    onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                    placeholder="e.g. Vikram Patel"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={newLead.email}
                    onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                    placeholder="vikram@zenith.com"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={newLead.phone}
                    onChange={(e) => setNewLead({ ...newLead, phone: e.target.value, whatsapp: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Location (City, Country)</label>
                  <input
                    type="text"
                    value={newLead.location}
                    onChange={(e) => setNewLead({ ...newLead, location: e.target.value })}
                    placeholder="e.g. Mumbai, India or London, UK"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Assigned Deal Owner</label>
                  <select
                    value={newLead.assignedTo}
                    onChange={(e) => setNewLead({ ...newLead, assignedTo: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none cursor-pointer"
                  >
                    {dynamicOwners.map(o => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Interested Service</label>
                  <input
                    type="text"
                    value={newLead.interestedService}
                    onChange={(e) => setNewLead({ ...newLead, interestedService: e.target.value })}
                    placeholder="e.g. AI Customer Support & Dispatch Automation"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Estimated Deal Size (₹)</label>
                  <input
                    type="number"
                    value={newLead.estimatedDealValue}
                    onChange={(e) => setNewLead({ ...newLead, estimatedDealValue: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Initial Stage</label>
                  <select
                    value={newLead.status}
                    onChange={(e) => setNewLead({ ...newLead, status: e.target.value as LeadStatus })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none cursor-pointer"
                  >
                    {PIPELINE_COLUMNS.map(c => (
                      <option key={c.status} value={c.status}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Priority</label>
                  <select
                    value={newLead.priority}
                    onChange={(e) => setNewLead({ ...newLead, priority: e.target.value as Priority })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none cursor-pointer"
                  >
                    <option value="Urgent">Urgent 🚨</option>
                    <option value="High">High 🔥</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Win Probability (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newLead.probability}
                    onChange={(e) => setNewLead({ ...newLead, probability: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Acquisition Source</label>
                  <select
                    value={ALL_PRESET_SOURCES.includes(newLead.source) ? newLead.source : 'Other'}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'Other') {
                        setNewLead({ ...newLead, source: '' });
                      } else {
                        setNewLead({ ...newLead, source: val });
                      }
                    }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none cursor-pointer focus:border-black"
                  >
                    {ACQUISITION_SOURCE_GROUPS.map((grp) => (
                      <optgroup key={grp.group} label={grp.group}>
                        {grp.options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                    <optgroup label="✨ Custom Channel">
                      <option value="Other">Other (Specify Custom Source)...</option>
                    </optgroup>
                  </select>
                  {!ALL_PRESET_SOURCES.includes(newLead.source) && (
                    <input
                      type="text"
                      required
                      value={newLead.source}
                      onChange={(e) => setNewLead({ ...newLead, source: e.target.value })}
                      placeholder="Type custom source (e.g. Founder Podcast, Cold Email Batch 4)"
                      className="w-full mt-2 bg-white border border-gray-300 rounded-xl p-2 outline-none text-xs focus:border-black"
                    />
                  )}
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Next Follow-up Date</label>
                  <input
                    type="date"
                    value={newLead.nextFollowUp ? newLead.nextFollowUp.split('T')[0] : ''}
                    onChange={(e) => setNewLead({ ...newLead, nextFollowUp: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Referred By Partner (Optional)</label>
                <select
                  value={newLead.partnerId || ''}
                  onChange={(e) => setNewLead({ ...newLead, partnerId: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none cursor-pointer focus:border-black text-xs"
                >
                  <option value="">No Partner Attribution (Direct Lead)</option>
                  {partners.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.referralCode}) — {Math.round((p.commissionRate >= 1 ? p.commissionRate : p.commissionRate * 100))}% Tier
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Initial Notes & Requirements</label>
                <textarea
                  rows={2}
                  value={newLead.notes}
                  onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                  placeholder="Key context or deliverables mentioned during first touch..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 font-semibold text-gray-600 cursor-pointer hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-bold shadow-md cursor-pointer"
                >
                  Create Lead
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Row 8: Edit Lead Modal */}
      {editingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <h3 className="font-extrabold text-lg text-gray-900">Edit Lead Dossier</h3>
              <button onClick={() => setEditingLead(null)} className="p-1 text-gray-400 hover:text-black cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEditLead} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Company / Organization *</label>
                  <input
                    type="text"
                    required
                    value={editingLead.company || ''}
                    onChange={(e) => setEditingLead({ ...editingLead, company: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Contact Person Name *</label>
                  <input
                    type="text"
                    required
                    value={editingLead.name}
                    onChange={(e) => setEditingLead({ ...editingLead, name: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editingLead.email || ''}
                    onChange={(e) => setEditingLead({ ...editingLead, email: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={editingLead.phone || ''}
                    onChange={(e) => setEditingLead({ ...editingLead, phone: e.target.value, whatsapp: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={editingLead.location || ''}
                    onChange={(e) => setEditingLead({ ...editingLead, location: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Assigned Deal Owner</label>
                  <select
                    value={editingLead.assignedTo || ''}
                    onChange={(e) => setEditingLead({ ...editingLead, assignedTo: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none cursor-pointer"
                  >
                    {dynamicOwners.map(o => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Interested Service</label>
                  <input
                    type="text"
                    value={editingLead.interestedService}
                    onChange={(e) => setEditingLead({ ...editingLead, interestedService: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Estimated Deal Size (₹)</label>
                  <input
                    type="number"
                    value={editingLead.estimatedDealValue}
                    onChange={(e) => setEditingLead({ ...editingLead, estimatedDealValue: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Stage</label>
                  <select
                    value={editingLead.status}
                    onChange={(e) => setEditingLead({ ...editingLead, status: e.target.value as LeadStatus })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none cursor-pointer"
                  >
                    {PIPELINE_COLUMNS.map(c => (
                      <option key={c.status} value={c.status}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Priority</label>
                  <select
                    value={editingLead.priority}
                    onChange={(e) => setEditingLead({ ...editingLead, priority: e.target.value as Priority })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none cursor-pointer"
                  >
                    <option value="Urgent">Urgent 🚨</option>
                    <option value="High">High 🔥</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Win Probability (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editingLead.probability}
                    onChange={(e) => setEditingLead({ ...editingLead, probability: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Acquisition Source</label>
                  <select
                    value={ALL_PRESET_SOURCES.includes(editingLead.source || '') ? editingLead.source : 'Other'}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'Other') {
                        setEditingLead({
                          ...editingLead,
                          source: editingLead.source && !ALL_PRESET_SOURCES.includes(editingLead.source) ? editingLead.source : ''
                        });
                      } else {
                        setEditingLead({ ...editingLead, source: val });
                      }
                    }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none cursor-pointer focus:border-black"
                  >
                    {ACQUISITION_SOURCE_GROUPS.map((grp) => (
                      <optgroup key={grp.group} label={grp.group}>
                        {grp.options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                    <optgroup label="✨ Custom Channel">
                      <option value="Other">Other (Specify Custom Source)...</option>
                    </optgroup>
                  </select>
                  {!ALL_PRESET_SOURCES.includes(editingLead.source || '') && (
                    <input
                      type="text"
                      required
                      value={editingLead.source || ''}
                      onChange={(e) => setEditingLead({ ...editingLead, source: e.target.value })}
                      placeholder="Type custom source (e.g. Founder Podcast, Cold Email Batch 4)"
                      className="w-full mt-2 bg-white border border-gray-300 rounded-xl p-2 outline-none text-xs focus:border-black"
                    />
                  )}
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Next Follow-up Date</label>
                  <input
                    type="date"
                    value={editingLead.nextFollowUp ? editingLead.nextFollowUp.split('T')[0] : ''}
                    onChange={(e) => setEditingLead({ ...editingLead, nextFollowUp: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Attributed Partner</label>
                <select
                  value={editingLead.partnerId || ''}
                  onChange={(e) => {
                    const pId = e.target.value;
                    const matched = partners.find(p => p.id === pId);
                    setEditingLead({
                      ...editingLead,
                      partnerId: matched?.id || undefined,
                      partnerName: matched?.name || undefined,
                      partnerCode: matched?.referralCode || undefined
                    });
                  }}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none cursor-pointer focus:border-black text-xs"
                >
                  <option value="">No Partner Attribution (Direct Lead)</option>
                  {partners.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.referralCode}) — {Math.round((p.commissionRate >= 1 ? p.commissionRate : p.commissionRate * 100))}% Tier
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingLead(null)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 font-semibold text-gray-600 cursor-pointer hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-black hover:bg-gray-800 text-white font-bold shadow-md cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Row 9: Delete Lead Confirmation Modal */}
      {leadToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 text-center"
          >
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 size={24} />
            </div>
            <h3 className="font-extrabold text-base text-gray-900 mb-1">Delete Lead Opportunity?</h3>
            <p className="text-xs text-gray-500 mb-5">
              Are you sure you want to delete <strong>{leadToDelete.company || leadToDelete.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLeadToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 font-bold text-xs text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md cursor-pointer"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Workflow Shortcut Modal 1: Create Task for Lead */}
      {leadTaskModalLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <CheckSquare size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-gray-900 leading-tight">Create Task for Opportunity</h3>
                  <p className="text-[11px] text-gray-400">Attached to {leadTaskModalLead.company || leadTaskModalLead.name}</p>
                </div>
              </div>
              <button
                onClick={() => setLeadTaskModalLead(null)}
                className="p-1.5 text-gray-400 hover:text-black rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateLeadTask} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={leadTaskForm.title}
                  onChange={(e) => setLeadTaskForm({ ...leadTaskForm, title: e.target.value })}
                  placeholder="e.g. Schedule Discovery Call / Send Pitch Deck"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Assigned Staff</label>
                  <select
                    value={leadTaskForm.assignedTo}
                    onChange={(e) => setLeadTaskForm({ ...leadTaskForm, assignedTo: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none cursor-pointer focus:border-black"
                  >
                    <option value={currentUser?.fullName || 'AGX Team'}>{currentUser?.fullName || 'Current User'} (Me)</option>
                    {teamMembers.map(m => (
                      <option key={m.id} value={m.fullName}>{m.fullName} ({m.role})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Priority</label>
                  <select
                    value={leadTaskForm.priority}
                    onChange={(e) => setLeadTaskForm({ ...leadTaskForm, priority: e.target.value as Priority })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none cursor-pointer focus:border-black"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Target Due Date</label>
                  <input
                    type="date"
                    required
                    value={leadTaskForm.dueDate}
                    onChange={(e) => setLeadTaskForm({ ...leadTaskForm, dueDate: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Est. Effort (Hours)</label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={leadTaskForm.estimatedHours}
                    onChange={(e) => setLeadTaskForm({ ...leadTaskForm, estimatedHours: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Description & Acceptance Criteria</label>
                <textarea
                  rows={3}
                  value={leadTaskForm.description}
                  onChange={(e) => setLeadTaskForm({ ...leadTaskForm, description: e.target.value })}
                  placeholder="Include context or specific actions required..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setLeadTaskModalLead(null)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <CheckSquare size={14} /> Attach Task
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Workflow Shortcut Modal 2: Schedule Event for Lead */}
      {leadEventModalLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <Calendar size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-gray-900 leading-tight">Schedule Calendar Event</h3>
                  <p className="text-[11px] text-gray-400">Attached to {leadEventModalLead.company || leadEventModalLead.name}</p>
                </div>
              </div>
              <button
                onClick={() => setLeadEventModalLead(null)}
                className="p-1.5 text-gray-400 hover:text-black rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateLeadEvent} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  value={leadEventForm.title}
                  onChange={(e) => setLeadEventForm({ ...leadEventForm, title: e.target.value })}
                  placeholder="e.g. Discovery & Proposal Review Call"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Event Type</label>
                  <select
                    value={leadEventForm.eventType}
                    onChange={(e) => setLeadEventForm({ ...leadEventForm, eventType: e.target.value as CalendarEventType })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none cursor-pointer focus:border-black"
                  >
                    <option value="Meeting">Meeting</option>
                    <option value="Client Follow-up">Client Follow-up</option>
                    <option value="Project Deadline">Project Deadline</option>
                    <option value="Payment Reminder">Payment Reminder</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Location / Video Link</label>
                  <input
                    type="text"
                    value={leadEventForm.location}
                    onChange={(e) => setLeadEventForm({ ...leadEventForm, location: e.target.value })}
                    placeholder="Google Meet / Zoom / Phone"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={leadEventForm.startTime}
                    onChange={(e) => setLeadEventForm({ ...leadEventForm, startTime: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Participants</label>
                  <input
                    type="text"
                    value={leadEventForm.participants}
                    onChange={(e) => setLeadEventForm({ ...leadEventForm, participants: e.target.value })}
                    placeholder="Abhinav, Client Contact..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Agenda & Meeting Notes</label>
                <textarea
                  rows={2.5}
                  value={leadEventForm.notes}
                  onChange={(e) => setLeadEventForm({ ...leadEventForm, notes: e.target.value })}
                  placeholder="Key discussion points, agenda, or action deliverables..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                />
              </div>

              <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="leadEventUpdateFollowUp"
                  checked={leadEventForm.updateFollowUp}
                  onChange={(e) => setLeadEventForm({ ...leadEventForm, updateFollowUp: e.target.checked })}
                  className="w-4 h-4 rounded text-purple-600 cursor-pointer"
                />
                <label htmlFor="leadEventUpdateFollowUp" className="text-xs font-semibold text-purple-900 cursor-pointer">
                  Sync & set as the lead's <strong>Next Target Follow-Up</strong> date
                </label>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setLeadEventModalLead(null)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Calendar size={14} /> Schedule Event
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Workflow Shortcut Modal 3: Generate Proposal for Lead */}
      {leadProposalModalLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <FileText size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-gray-900 leading-tight">Generate Commercial Proposal</h3>
                  <p className="text-[11px] text-gray-400">Attached to {leadProposalModalLead.company || leadProposalModalLead.name}</p>
                </div>
              </div>
              <button
                onClick={() => setLeadProposalModalLead(null)}
                className="p-1.5 text-gray-400 hover:text-black rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateLeadProposal} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Proposal / Agreement Name *</label>
                <input
                  type="text"
                  required
                  value={leadProposalForm.name}
                  onChange={(e) => setLeadProposalForm({ ...leadProposalForm, name: e.target.value })}
                  placeholder="e.g. Full Stack MVP Build Proposal"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Agreement Type</label>
                  <select
                    value={leadProposalForm.agreementType}
                    onChange={(e) => setLeadProposalForm({ ...leadProposalForm, agreementType: e.target.value as AgreementType })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none cursor-pointer focus:border-black"
                  >
                    <option value="Proposal">Proposal</option>
                    <option value="Statement of Work">Statement of Work</option>
                    <option value="NDA">NDA</option>
                    <option value="Master Service Agreement">Master Service Agreement</option>
                    <option value="Retainer">Retainer</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Commercial Value (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={leadProposalForm.commercialValue}
                    onChange={(e) => setLeadProposalForm({ ...leadProposalForm, commercialValue: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Validity / Expiry Date</label>
                <input
                  type="date"
                  required
                  value={leadProposalForm.expiryDate}
                  onChange={(e) => setLeadProposalForm({ ...leadProposalForm, expiryDate: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                />
              </div>

              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="leadProposalAutoAdvance"
                  checked={leadProposalForm.autoAdvanceStage}
                  onChange={(e) => setLeadProposalForm({ ...leadProposalForm, autoAdvanceStage: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-600 cursor-pointer"
                />
                <label htmlFor="leadProposalAutoAdvance" className="text-xs font-semibold text-amber-900 cursor-pointer">
                  Auto-advance lead stage to <strong>PROPOSAL SENT</strong> in Pipeline
                </label>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setLeadProposalModalLead(null)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <FileText size={14} /> Create Proposal
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Quotation Preview Modal */}
      <QuotationPreviewModal
        quotation={previewQuotation}
        onClose={() => setPreviewQuotation(null)}
        onConvertToInvoice={async (qId) => {
          try {
            const inv = await convertQuotationToInvoice(qId);
            toast.success('Quotation Converted', `Created Invoice ${inv.invoiceNumber}`);
            setPreviewQuotation(null);
            onNavigate('finance', inv.id);
          } catch (err: any) {
            toast.error('Conversion Failed', err.message || 'Failed to convert quotation');
          }
        }}
        onUpdateStatus={(qId, st) => {
          updateQuotation(qId, { status: st });
          toast.success('Status Updated', `Quotation marked as ${st}`);
          if (previewQuotation && previewQuotation.id === qId) {
            setPreviewQuotation({ ...previewQuotation, status: st });
          }
        }}
      />

      {/* Quotation Creation Modal for Lead */}
      <QuotationModal
        isOpen={!!leadQuotationModalLead}
        onClose={() => setLeadQuotationModalLead(null)}
        store={store}
        initialLeadId={leadQuotationModalLead?.id}
      />
    </div>
  );
};
