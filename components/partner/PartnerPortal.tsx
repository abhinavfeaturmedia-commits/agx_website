import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Handshake, Users, IndianRupee, Wallet, ArrowUpRight, Copy, Check,
  Plus, LogOut, ArrowLeft, TrendingUp, Clock, CheckCircle2, AlertCircle,
  ExternalLink, Sparkles, Building, Phone, Mail, FileText, ChevronRight,
  CreditCard, Shield, Download, RefreshCw
} from 'lucide-react';
import { Partner, PartnerReferral, PartnerPayout } from '../../types/crm';
import { useCrmStore } from '../../lib/crmStore';
import { authService } from '../../lib/authService';
import { toast } from '../../lib/toastStore';

interface PartnerPortalProps {
  initialPartner?: Partner | null;
  onBackToWebsite: () => void;
  onLogout: () => void;
}

export const PartnerPortal: React.FC<PartnerPortalProps> = ({
  initialPartner,
  onBackToWebsite,
  onLogout
}) => {
  const store = useCrmStore();
  const activeSessionPartner = initialPartner || authService.getCurrentPartner();

  // If no authenticated partner session exists, immediately trigger logout/login screen
  useEffect(() => {
    if (!activeSessionPartner) {
      onLogout();
    }
  }, [activeSessionPartner, onLogout]);

  const [partner, setPartner] = useState<Partner | null>(activeSessionPartner || null);

  useEffect(() => {
    if (activeSessionPartner) {
      setPartner(activeSessionPartner);
    }
  }, [activeSessionPartner]);

  if (!partner) {
    return null;
  }

  const [activeTab, setActiveTab] = useState<'referrals' | 'payouts' | 'settings' | 'resources'>('referrals');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'NEW' | 'WON' | 'COMPLETED'>('ALL');

  // New Client Referral Form State
  const [newClientName, setNewClientName] = useState('');
  const [newClientCompany, setNewClientCompany] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newProjectType, setNewProjectType] = useState('AI Automation');
  const [newDealValue, setNewDealValue] = useState('75000');
  const [newNotes, setNewNotes] = useState('');

  // Payout Request Form State
  const [payoutRequestAmount, setPayoutRequestAmount] = useState('');
  const [payoutNotes, setPayoutNotes] = useState('');

  // Referral link
  const referralUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?ref=${encodeURIComponent(partner.referralCode)}`
    : `https://agxperience.com/?ref=${partner.referralCode}`;

  // Filter referrals specifically for this partner
  const myReferrals = useMemo(() => {
    return store.partnerReferrals.filter(r => r.partnerId === partner.id);
  }, [store.partnerReferrals, partner.id]);

  // Filter payouts for this partner
  const myPayouts = useMemo(() => {
    return store.partnerPayouts.filter(p => p.partnerId === partner.id);
  }, [store.partnerPayouts, partner.id]);

  // Dynamic calculations from actual referrals
  const totalReferredClients = myReferrals.length;
  const totalPipelineValue = myReferrals.reduce((acc, r) => acc + (r.dealValue || 0), 0);
  const totalClientPaymentsReceived = myReferrals.reduce((acc, r) => acc + (r.totalPaid || 0), 0);
  const totalPendingClientPayments = myReferrals.reduce((acc, r) => acc + (r.pendingPayment || 0), 0);
  const totalCommissionEarned = myReferrals.reduce((acc, r) => acc + (r.commissionEarned || 0), 0);
  const totalCommissionPaidOut = myPayouts.filter(p => p.status === 'Completed').reduce((acc, p) => acc + p.amount, 0);
  const availablePendingPayout = Math.max(0, totalCommissionEarned - totalCommissionPaidOut);

  // Copy helpers
  const handleCopyCode = () => {
    navigator.clipboard.writeText(partner.referralCode);
    setCopiedCode(true);
    toast.success('Referral Code Copied!', partner.referralCode);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopiedLink(true);
    toast.success('Referral Link Copied!', 'Share this URL with prospective clients.');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Submit Client Referral
  const handleSubmitReferral = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) {
      toast.error('Required', 'Please enter client contact name.');
      return;
    }

    const val = Number(newDealValue) || 50000;
    const rawRate = partner.commissionRate || 0.10;
    const rate = rawRate >= 1 ? rawRate / 100 : rawRate;

    // 1. Register lead directly into AGX CRM Leads pipeline first to obtain leadId
    const createdLeadId = store.addLead({
      name: newClientName.trim(),
      company: newClientCompany.trim() || newClientName.trim(),
      email: newClientEmail.trim() || '',
      phone: newClientPhone.trim() || '',
      interestedService: newProjectType,
      estimatedDealValue: val,
      probability: 60,
      source: `Partner Referral (${partner.name} - ${partner.referralCode})`,
      priority: 'High',
      status: 'NEW',
      assignedTo: 'Unassigned',
      partnerId: partner.id,
      partnerName: partner.name,
      partnerCode: partner.referralCode,
      notes: `Referred by AGX Partner: ${partner.name} (${partner.company || partner.email}). Notes: ${newNotes.trim()}`
    });

    // 2. Add to partner referrals linked with leadId
    store.addPartnerReferral({
      partnerId: partner.id,
      leadId: createdLeadId,
      partnerName: partner.name,
      clientName: newClientName.trim(),
      company: newClientCompany.trim() || newClientName.trim(),
      clientEmail: newClientEmail.trim() || undefined,
      clientPhone: newClientPhone.trim() || undefined,
      projectType: newProjectType,
      dealValue: val,
      totalPaid: 0,
      pendingPayment: val,
      dealStatus: 'NEW',
      paymentStatus: 'Pending',
      commissionRate: rate,
      commissionEarned: 0,
      commissionPaid: 0,
      notes: newNotes.trim() || undefined
    });

    toast.success('Referral Registered! 🚀', `${newClientName} has been submitted to AGX team.`);
    setIsSubmitModalOpen(false);

    // Reset form
    setNewClientName('');
    setNewClientCompany('');
    setNewClientEmail('');
    setNewClientPhone('');
    setNewNotes('');
  };

  // Request Payout
  const handleRequestPayout = (e: React.FormEvent) => {
    e.preventDefault();
    const reqAmt = Number(payoutRequestAmount);
    if (!reqAmt || reqAmt <= 0) {
      toast.error('Invalid Amount', 'Please enter a valid payout amount.');
      return;
    }
    const MIN_PAYOUT_INR = 1000;
    if (reqAmt < MIN_PAYOUT_INR) {
      toast.error('Minimum Threshold', `Minimum payout amount is ₹${MIN_PAYOUT_INR.toLocaleString('en-IN')}.`);
      return;
    }
    if (reqAmt > availablePendingPayout) {
      toast.error('Insufficient Balance', `Your maximum available payout balance is ₹${availablePendingPayout.toLocaleString('en-IN')}.`);
      return;
    }

    store.recordPartnerPayout({
      partnerId: partner.id,
      partnerName: partner.name,
      amount: reqAmt,
      payoutDate: new Date().toISOString().split('T')[0],
      paymentMethod: partner.payoutMethod || 'UPI',
      status: 'Pending',
      notes: payoutNotes.trim() || 'Requested via Partner Portal'
    });

    toast.success('Payout Request Submitted', `₹${reqAmt.toLocaleString('en-IN')} requested. Our finance team will process it via ${partner.payoutMethod}.`);
    setIsPayoutModalOpen(false);
    setPayoutRequestAmount('');
    setPayoutNotes('');
  };

  const handleLogoutPartner = () => {
    authService.signOutPartner();
    onLogout();
  };

  // Filtered referrals list for display
  const filteredReferrals = myReferrals.filter(r => {
    const matchesSearch = 
      r.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.company && r.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      r.projectType.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'NEW') return r.dealStatus === 'NEW' || r.dealStatus === 'CONTACTED' || r.dealStatus === 'QUALIFIED';
    if (statusFilter === 'WON') return r.dealStatus === 'WON' || r.dealStatus === 'IN PROGRESS';
    if (statusFilter === 'COMPLETED') return r.dealStatus === 'COMPLETED';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#07090E] text-white flex flex-col relative antialiased overflow-x-hidden">
      {/* Background Decorative Ambient Flares */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[350px] bg-[#CCFF00]/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-emerald-600/5 rounded-full blur-[180px] pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="w-full bg-[#0C0F17]/90 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToWebsite}
              className="flex items-center gap-2 text-xs font-semibold text-white/60 hover:text-white transition-colors px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer btn-press"
            >
              <ArrowLeft size={13} /> Agency Site
            </button>

            <div className="flex items-center gap-2">
              <span className="text-2xl font-black italic tracking-tighter text-white font-['Outfit']">
                AG<span className="text-[#CCFF00]">X</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/20 font-bold flex items-center gap-1">
                <Handshake size={11} />
                Partner Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-white">{partner.name}</span>
              <span className="text-[10px] text-white/50">{partner.company || partner.email}</span>
            </div>

            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-bold text-xs text-[#CCFF00]">
              {partner.name.charAt(0)}
            </div>

            <button
              onClick={handleLogoutPartner}
              title="Sign Out Partner Session"
              className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/50 hover:text-red-400 border border-white/10 transition-colors cursor-pointer"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 flex flex-col gap-8 z-10">
        {/* Partner Welcome & Referral Link Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-white/[0.05] via-white/[0.02] to-transparent border border-white/10 relative overflow-hidden flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#CCFF00]/10 text-[#CCFF00] text-xs font-bold mb-2.5">
              <Sparkles size={12} />
              <span>{Math.round((partner.commissionRate || 0.10) * 100)}% Verified Commission Tier</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-['Outfit']">
              Welcome, {partner.name}
            </h1>
            <p className="text-xs sm:text-sm text-white/60 mt-1 font-light leading-relaxed">
              Every client you introduce to AGX is tracked right here. Watch payment milestones unfold in real time and collect your commission as each installment lands.
            </p>
          </div>

          {/* Referral Code & Quick Link Box */}
          <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-black/40 border border-white/15 backdrop-blur-md">
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-widest text-white/40 font-semibold">Your Referral Code</span>
                <span className="text-sm font-bold text-[#CCFF00] tracking-wider">{partner.referralCode}</span>
              </div>
              <button
                onClick={handleCopyCode}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Copy Referral Code"
              >
                {copiedCode ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>
            </div>

            <button
              onClick={handleCopyLink}
              className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer btn-press"
            >
              {copiedLink ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copiedLink ? 'Link Copied!' : 'Copy Partner Link'}</span>
            </button>

            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="px-6 py-3 rounded-2xl bg-[#CCFF00] hover:bg-[#b8e600] text-black text-xs font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer btn-press shadow-lg shadow-[#CCFF00]/15"
            >
              <Plus size={16} />
              <span>Submit Client</span>
            </button>
          </div>
        </div>

        {/* Financial & Deal Metric Cards (The 6 Pillars) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between text-white/50 text-[10px] font-bold uppercase tracking-wider">
              <span>Clients Referred</span>
              <Users size={14} className="text-blue-400" />
            </div>
            <div className="text-2xl font-black text-white mt-2 tabular-nums">
              {totalReferredClients}
            </div>
            <span className="text-[10px] text-white/40 mt-1">Total introductions</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between text-white/50 text-[10px] font-bold uppercase tracking-wider">
              <span>Deal Pipeline</span>
              <TrendingUp size={14} className="text-purple-400" />
            </div>
            <div className="text-2xl font-black text-white mt-2 tabular-nums">
              ₹{totalPipelineValue.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-white/40 mt-1">Total contract value</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between text-white/50 text-[10px] font-bold uppercase tracking-wider">
              <span>Payments Collected</span>
              <CreditCard size={14} className="text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400 mt-2 tabular-nums">
              ₹{totalClientPaymentsReceived.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-white/40 mt-1 tabular-nums">
              ₹{totalPendingClientPayments.toLocaleString('en-IN')} pending
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between text-white/50 text-[10px] font-bold uppercase tracking-wider">
              <span>Total Earned</span>
              <IndianRupee size={14} className="text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white mt-2 tabular-nums">
              ₹{totalCommissionEarned.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-white/40 mt-1">Accrued to date</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#CCFF00]/5 border border-[#CCFF00]/20 flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between text-[#CCFF00] text-[10px] font-bold uppercase tracking-wider">
              <span>Ready for Payout</span>
              <Wallet size={14} className="text-[#CCFF00]" />
            </div>
            <div className="text-2xl font-black text-[#CCFF00] mt-2 tabular-nums">
              ₹{availablePendingPayout.toLocaleString('en-IN')}
            </div>
            <button
              onClick={() => setIsPayoutModalOpen(true)}
              disabled={availablePendingPayout <= 0}
              className="mt-2 text-[10px] font-bold text-black bg-[#CCFF00] hover:bg-[#b8e600] py-1 rounded-lg text-center uppercase tracking-wider transition-colors disabled:opacity-40 cursor-pointer"
            >
              Request Payout
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between text-white/50 text-[10px] font-bold uppercase tracking-wider">
              <span>Paid Out</span>
              <CheckCircle2 size={14} className="text-cyan-400" />
            </div>
            <div className="text-2xl font-black text-white/80 mt-2 tabular-nums">
              ₹{totalCommissionPaidOut.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-white/40 mt-1">Disbursed via {partner.payoutMethod}</span>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 flex-wrap gap-4">
          <div className="flex items-center gap-2">
            {[
              { id: 'referrals', label: `Referred Clients & Deals (${myReferrals.length})`, icon: Users },
              { id: 'payouts', label: `Payout History (${myPayouts.length})`, icon: Wallet },
              { id: 'resources', label: 'Pitch Deck & Links', icon: FileText },
              { id: 'settings', label: 'Payout Account', icon: CreditCard }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer btn-press ${
                    isActive
                      ? 'bg-white text-black shadow-md'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {activeTab === 'referrals' && (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search clients..."
                className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-[#CCFF00]"
              />
              <div className="flex items-center p-0.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold">
                {(['ALL', 'NEW', 'WON', 'COMPLETED'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setStatusFilter(f)}
                    className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                      statusFilter === f ? 'bg-white/20 text-white font-bold' : 'text-white/40 hover:text-white'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tab 1: Referred Clients & Live Payment Tracking */}
        {activeTab === 'referrals' && (
          <div className="space-y-4">
            {filteredReferrals.length === 0 ? (
              <div className="text-center py-16 p-8 rounded-3xl bg-white/[0.02] border border-white/10">
                <Users size={40} className="text-white/20 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white">No Referred Clients Found</h3>
                <p className="text-xs text-white/50 mt-1 max-w-md mx-auto">
                  Submit your first prospective client intro or share your referral link to earn 10%–15% on closed contracts.
                </p>
                <button
                  onClick={() => setIsSubmitModalOpen(true)}
                  className="mt-4 px-5 py-2.5 rounded-xl bg-[#CCFF00] text-black text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Submit Client Referral
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredReferrals.map((referral) => {
                  const percentPaid = referral.dealValue > 0 
                    ? Math.min(100, Math.round((referral.totalPaid / referral.dealValue) * 100))
                    : 0;
                  const isFullySettled = referral.totalPaid >= referral.dealValue && referral.dealValue > 0;

                  return (
                    <div
                      key={referral.id}
                      className="p-5 sm:p-6 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all flex flex-col gap-4 relative group"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-white">{referral.clientName}</h3>
                            {referral.company && (
                              <span className="text-xs text-white/50">• {referral.company}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-white/60 mt-1">
                            <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/80 font-bold text-[10px]">
                              {referral.projectType}
                            </span>
                            <span>Referred on {new Date(referral.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-start sm:self-auto">
                          {/* Deal Stage Badge */}
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            referral.dealStatus === 'COMPLETED'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : referral.dealStatus === 'WON' || referral.dealStatus === 'IN PROGRESS'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {referral.dealStatus}
                          </span>

                          {/* Payment Completion Badge */}
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isFullySettled
                              ? 'bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/30'
                              : percentPaid > 0
                              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                              : 'bg-white/5 text-white/40 border border-white/10'
                          }`}>
                            {isFullySettled ? '100% Full Payment Received' : `${percentPaid}% Paid`}
                          </span>
                        </div>
                      </div>

                      {/* Milestone Payment Progress Bar */}
                      <div className="space-y-1.5 pt-2 border-t border-white/5">
                        <div className="flex justify-between text-xs tabular-nums">
                          <span className="text-white/60">
                            Client Payment Progress: <strong className="text-white">₹{referral.totalPaid.toLocaleString('en-IN')}</strong> of ₹{referral.dealValue.toLocaleString('en-IN')}
                          </span>
                          <span className={isFullySettled ? 'text-[#CCFF00] font-bold' : 'text-white/60'}>
                            {isFullySettled ? 'Fully Settled ✓' : `₹${referral.pendingPayment.toLocaleString('en-IN')} Pending`}
                          </span>
                        </div>

                        {/* Animated Progress Bar */}
                        <div className="w-full h-2.5 rounded-full bg-white/5 overflow-hidden p-0.5 border border-white/10">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isFullySettled
                                ? 'bg-gradient-to-r from-emerald-400 to-[#CCFF00]'
                                : 'bg-gradient-to-r from-blue-500 to-emerald-400'
                            }`}
                            style={{ width: `${percentPaid}%` }}
                          />
                        </div>
                      </div>

                      {/* Commission Audit Footer */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/5 text-xs tabular-nums">
                        <div>
                          <span className="text-[10px] text-white/40 block">Commission Rate</span>
                          <span className="text-white font-bold">{Math.round(referral.commissionRate * 100)}%</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-white/40 block">Your Earned Cut</span>
                          <span className="text-[#CCFF00] font-bold">₹{referral.commissionEarned.toLocaleString('en-IN')}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-white/40 block">Potential Full Cut</span>
                          <span className="text-white font-bold">
                            ₹{Math.round(referral.dealValue * referral.commissionRate).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-white/40 block">Settlement Status</span>
                          <span className="text-white/80">
                            {isFullySettled ? 'Complete (100%)' : 'Awaiting Next Milestone'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Payout History */}
        {activeTab === 'payouts' && (
          <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Commission Payout History</h3>
                <p className="text-xs text-white/50">Disbursements processed by AGX finance team</p>
              </div>
              <button
                onClick={() => setIsPayoutModalOpen(true)}
                disabled={availablePendingPayout <= 0}
                className="px-4 py-2 rounded-xl bg-[#CCFF00] text-black text-xs font-extrabold uppercase tracking-wider transition-colors disabled:opacity-30 cursor-pointer"
              >
                Request Withdrawal
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-white/40 uppercase tracking-wider text-[10px] font-bold">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4">Reference ID</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {myPayouts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-white/40 text-xs">
                        No commission payouts processed yet. Once your client referrals close and pay milestones, your payouts will appear here.
                      </td>
                    </tr>
                  ) : (
                    myPayouts.map(p => (
                      <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4 text-white/80 tabular-nums">{p.payoutDate}</td>
                        <td className="py-3 px-4 text-[#CCFF00] font-bold tabular-nums">₹{p.amount.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 text-white/70">{p.paymentMethod}</td>
                        <td className="py-3 px-4 text-white/50">{p.transactionRef || 'Processing'}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            p.status === 'Completed'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-amber-500/10 text-amber-400'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-white/50 text-[11px] max-w-xs truncate">{p.notes || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Marketing & Sales Collateral */}
        {activeTab === 'resources' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#CCFF00]/10 border border-[#CCFF00]/20 flex items-center justify-center text-[#CCFF00]">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Direct Client Pitch Cheat Sheet</h3>
                  <span className="text-xs text-white/50">For agencies talking to their existing clients</span>
                </div>
              </div>
              <p className="text-xs text-white/60 leading-relaxed">
                When you pitch clients, highlight that AGX builds custom autonomous AI workflows, customer support agents, and automations within 14 business days backed by our 30-Day Zero-Risk Guarantee.
              </p>
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-xs text-white/80 space-y-1.5">
                <div className="text-[#CCFF00] font-bold text-[11px]">Recommended Pitch:</div>
                <p className="text-[11px] text-white/70 leading-relaxed italic">
                  "We handle your core design/marketing, and our specialized engineering partner (AGX) automates your back-office and operations so you eliminate manual headcount burn."
                </p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <ExternalLink size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Your Unique Tracking Link</h3>
                  <span className="text-xs text-white/50">Cookie lifetime: 60 days</span>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between gap-3 text-xs">
                <span className="text-[#CCFF00] truncate font-medium">{referralUrl}</span>
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] shrink-0"
                >
                  {copiedLink ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-[11px] text-white/40">
                Any lead who visits this link or schedules an audit within 60 days is automatically mapped to your partner account.
              </p>
            </div>
          </div>
        )}

        {/* Tab 4: Payout Profile Settings */}
        {activeTab === 'settings' && (
          <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 max-w-xl space-y-4">
            <h3 className="text-base font-bold text-white">Payout Receiving Coordinates</h3>
            <p className="text-xs text-white/50">
              Update where you want AGX finance to disburse your commissions.
            </p>

            <div className="space-y-3 pt-2">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-white/60 block mb-1">
                  Preferred Method
                </label>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white">
                  {partner.payoutMethod || 'UPI'}
                </div>
              </div>

              {partner.payoutDetails?.upiId && (
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-white/60 block mb-1">
                    UPI ID
                  </label>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-[#CCFF00]">
                    {partner.payoutDetails.upiId}
                  </div>
                </div>
              )}

              {partner.payoutDetails?.accountNumber && (
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-white/60 block mb-1">
                    Bank Account Number
                  </label>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white">
                    {partner.payoutDetails.accountNumber} ({partner.payoutDetails.ifsc || 'IFSC'})
                  </div>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-[#CCFF00]/5 border border-[#CCFF00]/20 text-[11px] text-white/70">
                To modify these payout coordinates, submit a request or message Abhinav directly on WhatsApp via the VIP Line.
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal 1: Submit Client Referral */}
      <AnimatePresence>
        {isSubmitModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-[#0D1017] border border-white/15 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black uppercase text-white font-['Outfit']">
                    Submit Client Referral
                  </h3>
                  <p className="text-xs text-white/60">
                    We will initiate discovery and keep your portal updated with live deal milestones.
                  </p>
                </div>
                <button
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmitReferral} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-white/70 block mb-1">Contact Name *</label>
                    <input
                      type="text"
                      required
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                      placeholder="e.g. David Miller"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-[#CCFF00]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-white/70 block mb-1">Company Name</label>
                    <input
                      type="text"
                      value={newClientCompany}
                      onChange={(e) => setNewClientCompany(e.target.value)}
                      placeholder="e.g. Acme Corp"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-[#CCFF00]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-white/70 block mb-1">Email</label>
                    <input
                      type="email"
                      value={newClientEmail}
                      onChange={(e) => setNewClientEmail(e.target.value)}
                      placeholder="david@acmecorp.com"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-[#CCFF00]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-white/70 block mb-1">Phone / WhatsApp</label>
                    <input
                      type="tel"
                      value={newClientPhone}
                      onChange={(e) => setNewClientPhone(e.target.value)}
                      placeholder="+1 (555) 019-2831"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-[#CCFF00]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-white/70 block mb-1">Target Service</label>
                    <select
                      value={newProjectType}
                      onChange={(e) => setNewProjectType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#CCFF00]"
                    >
                      <option value="AI Automation" className="bg-[#0C0F17]">AI Automation Blueprint</option>
                      <option value="Custom AI Agent" className="bg-[#0C0F17]">Custom Autonomous AI Agent</option>
                      <option value="Workflow Automation" className="bg-[#0C0F17]">Workflow & Operations Automation</option>
                      <option value="Internal Business OS" className="bg-[#0C0F17]">Custom Internal Business OS</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-white/70 block mb-1">Estimated Budget (₹)</label>
                    <input
                      type="number"
                      value={newDealValue}
                      onChange={(e) => setNewDealValue(e.target.value)}
                      placeholder="75000"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-[#CCFF00] tabular-nums"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-white/70 block mb-1">Context / Introduction Notes</label>
                  <textarea
                    rows={3}
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="Tell us what bottlenecks this client faces or how the introduction occurred..."
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-[#CCFF00]"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSubmitModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black text-xs font-extrabold uppercase tracking-wider transition-colors cursor-pointer shadow-lg shadow-[#CCFF00]/15"
                  >
                    Submit Intro
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 2: Request Payout */}
      <AnimatePresence>
        {isPayoutModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 rounded-3xl bg-[#0D1017] border border-white/15 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black uppercase text-white font-['Outfit']">
                  Request Commission Payout
                </h3>
                <button
                  onClick={() => setIsPayoutModalOpen(false)}
                  className="p-1 rounded-full hover:bg-white/10 text-white/50 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-[#CCFF00]/5 border border-[#CCFF00]/20 flex justify-between items-center">
                <span className="text-xs text-white/70 font-semibold">Available Balance:</span>
                <span className="text-xl font-black text-[#CCFF00] tabular-nums">
                  ₹{availablePendingPayout.toLocaleString('en-IN')}
                </span>
              </div>

              <form onSubmit={handleRequestPayout} className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-white/70 block mb-1">
                    Withdrawal Amount (₹) *
                  </label>
                  <input
                    type="number"
                    max={availablePendingPayout}
                    required
                    value={payoutRequestAmount}
                    onChange={(e) => setPayoutRequestAmount(e.target.value)}
                    placeholder={`Max ₹${availablePendingPayout.toLocaleString('en-IN')}`}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-[#CCFF00] tabular-nums font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-white/70 block mb-1">
                    Destination
                  </label>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white/80 font-medium">
                    {partner.payoutMethod} {partner.payoutDetails?.upiId ? `(${partner.payoutDetails.upiId})` : ''}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-white/70 block mb-1">
                    Optional Reference Notes
                  </label>
                  <textarea
                    rows={2}
                    value={payoutNotes}
                    onChange={(e) => setPayoutNotes(e.target.value)}
                    placeholder="e.g., Q3 Client Referral settlement"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-[#CCFF00]"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsPayoutModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black text-xs font-extrabold uppercase tracking-wider transition-colors cursor-pointer shadow-lg shadow-[#CCFF00]/15"
                  >
                    Confirm Request
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
