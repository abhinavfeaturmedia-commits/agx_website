import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Handshake, Users, DollarSign, IndianRupee, Wallet, Search, Filter, Plus, Edit2,
  Trash2, ExternalLink, CheckCircle2, AlertCircle, AlertTriangle, Clock, ArrowUpRight,
  Sparkles, Shield, ChevronRight, X, Phone, Mail, Building, CreditCard, TrendingUp, Download,
  Award, Zap
} from 'lucide-react';
import { Partner, PartnerReferral, PartnerPayout, calculatePartnerTier, getEffectivePartnerRate } from '../../types/crm';
import { useCrmStore } from '../../lib/crmStore';
import { toast } from '../../lib/toastStore';
import { exportService } from '../../lib/exportService';

function formatLastLogin(dateStr?: string): { relative: string; full: string; isRecent: boolean } {
  if (!dateStr) return { relative: 'Never', full: 'No login record', isRecent: false };
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return { relative: 'Never', full: 'Invalid date', isRecent: false };

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  const full = d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const isRecent = diffHour < 24 && diffMs >= 0;

  if (diffSec < 60) return { relative: 'Just now', full, isRecent: true };
  if (diffMin < 60) return { relative: `${diffMin}m ago`, full, isRecent: true };
  if (diffHour < 24) return { relative: `${diffHour}h ago`, full, isRecent: true };
  if (diffDay === 1) return { relative: 'Yesterday', full, isRecent: false };
  if (diffDay < 7) return { relative: `${diffDay}d ago`, full, isRecent: false };

  const relative = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  return { relative, full, isRecent: false };
}

interface PartnersViewProps {
  store: ReturnType<typeof useCrmStore>;
  onNavigate?: (route: string, entityId?: string) => void;
  initialSelectedId?: string;
}

export const PartnersView: React.FC<PartnersViewProps> = ({
  store,
  onNavigate,
  initialSelectedId
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Active' | 'Pending' | 'Suspended'>('ALL');
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(() => {
    if (initialSelectedId) {
      return store.partners.find(p => p.id === initialSelectedId) || null;
    }
    return null;
  });

  useEffect(() => {
    if (initialSelectedId) {
      const match = store.partners.find(p => p.id === initialSelectedId);
      if (match) setSelectedPartner(match);
    }
  }, [initialSelectedId, store.partners]);

  const [isAddPartnerModalOpen, setIsAddPartnerModalOpen] = useState(false);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutTargetPartner, setPayoutTargetPartner] = useState<Partner | null>(null);

  // Configure Commission Rate Modal State (Tier vs Custom Fixed %)
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [rateTargetPartner, setRateTargetPartner] = useState<Partner | null>(null);
  const [editRateMode, setEditRateMode] = useState<'tier' | 'custom'>('tier');
  const [editTierRate, setEditTierRate] = useState<number>(0.10);
  const [editCustomRatePct, setEditCustomRatePct] = useState<string>('30');
  const [editCustomRateReason, setEditCustomRateReason] = useState<string>('');

  // Super Admin Partner Deletion State
  const [partnerToDelete, setPartnerToDelete] = useState<Partner | null>(null);
  const [isDeletingPartner, setIsDeletingPartner] = useState(false);

  // Check if current user has Super Admin or Partner Management deletion authority
  const canDeletePartner = useMemo(() => {
    const role = store.currentUser?.role;
    // Super Admin, Admin, and Executive Partnership leads have deletion authority
    return !role || ['Super Admin', 'Admin', 'Partnership', 'Leadership'].includes(role);
  }, [store.currentUser?.role]);

  const handleConfirmDelete = async () => {
    if (!partnerToDelete) return;
    setIsDeletingPartner(true);
    try {
      const partnerId = partnerToDelete.id;
      if (selectedPartner?.id === partnerId) {
        setSelectedPartner(null);
      }
      store.deletePartner(partnerId);
      setPartnerToDelete(null);
    } catch (err: any) {
      console.error('Failed to delete partner:', err);
      toast.error('Deletion Failed', err?.message || 'Could not delete partner. Please try again.');
    } finally {
      setIsDeletingPartner(false);
    }
  };

  // Add Partner Form State
  const [addName, setAddName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addCompany, setAddCompany] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addCommissionRate, setAddCommissionRate] = useState('0.10');
  const [addIsCustomRate, setAddIsCustomRate] = useState(false);
  const [addCustomRatePct, setAddCustomRatePct] = useState('30');
  const [addCustomRateReason, setAddCustomRateReason] = useState('');
  const [addPayoutMethod, setAddPayoutMethod] = useState<'UPI' | 'Bank Transfer' | 'PayPal'>('UPI');
  const [addUpiId, setAddUpiId] = useState('');

  // Record Payout Form State
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('UPI');
  const [payoutTxRef, setPayoutTxRef] = useState('');
  const [payoutNotes, setPayoutNotes] = useState('');

  // Top Metrics
  const totalPartnersCount = store.partners.length;
  const activePartnersCount = store.partners.filter(p => p.status === 'Active').length;
  const totalPartnerRevenue = store.partnerReferrals.reduce((acc, r) => acc + (r.totalPaid || 0), 0);
  const totalCommissionsEarned = store.partners.reduce((acc, p) => acc + (p.totalEarnings || 0), 0);
  const totalCommissionsPaid = store.partners.reduce((acc, p) => acc + (p.paidEarnings || 0), 0);
  const outstandingCommissionDue = Math.max(0, totalCommissionsEarned - totalCommissionsPaid);

  // Filtered partners
  const filteredPartners = useMemo(() => {
    return store.partners.filter(p => {
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.company && p.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.referralCode.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;
      if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
      return true;
    });
  }, [store.partners, searchQuery, statusFilter]);

  // Selected partner's referrals
  const selectedPartnerReferrals = useMemo(() => {
    if (!selectedPartner) return [];
    return store.partnerReferrals.filter(r => r.partnerId === selectedPartner.id);
  }, [store.partnerReferrals, selectedPartner]);

  // Selected partner's payouts
  const selectedPartnerPayouts = useMemo(() => {
    if (!selectedPartner) return [];
    return store.partnerPayouts.filter(p => p.partnerId === selectedPartner.id);
  }, [store.partnerPayouts, selectedPartner]);

  // Add Partner Handler
  const handleAddPartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim() || !addEmail.trim()) {
      toast.error('Required Fields', 'Name and email are required.');
      return;
    }

    const cleanSlug = (addCompany || addName).replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 5) || 'AGX';
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const referralCode = `AGX-${cleanSlug}-${randomSuffix}`;

    const isCustom = addIsCustomRate;
    const customRate = isCustom ? (parseFloat(addCustomRatePct) || 30) / 100 : undefined;
    const baseRate = isCustom ? customRate! : (parseFloat(addCommissionRate) || 0.10);

    store.createPartner({
      name: addName.trim(),
      email: addEmail.trim().toLowerCase(),
      company: addCompany.trim() || undefined,
      phone: addPhone.trim() || undefined,
      referralCode,
      commissionRate: baseRate,
      isCustomRate: isCustom,
      customCommissionRate: customRate,
      customRateReason: isCustom ? (addCustomRateReason.trim() || 'Custom partner agreement upon onboarding') : undefined,
      customRateSetAt: isCustom ? new Date().toISOString() : undefined,
      customRateSetBy: isCustom ? 'Super Admin' : undefined,
      status: 'Active',
      payoutMethod: addPayoutMethod,
      payoutDetails: addPayoutMethod === 'UPI' ? { upiId: addUpiId.trim() } : {},
      totalEarnings: 0,
      paidEarnings: 0,
      pendingEarnings: 0
    });

    setIsAddPartnerModalOpen(false);
    setAddName('');
    setAddEmail('');
    setAddCompany('');
    setAddPhone('');
    setAddUpiId('');
    setAddIsCustomRate(false);
    setAddCustomRatePct('30');
    setAddCustomRateReason('');
  };

  // Open Payout Modal
  const handleOpenPayoutModal = (partner: Partner) => {
    setPayoutTargetPartner(partner);
    setPayoutAmount(String(partner.pendingEarnings || 0));
    setPayoutMethod(partner.payoutMethod || 'UPI');
    setPayoutTxRef(`UTR-${Date.now().toString().slice(-6)}`);
    setPayoutNotes('');
    setIsPayoutModalOpen(true);
  };

  // Execute Payout Handler
  const handleExecutePayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payoutTargetPartner) return;
    const amt = Number(payoutAmount);
    if (!amt || amt <= 0) {
      toast.error('Invalid Amount', 'Please enter a valid payout amount.');
      return;
    }

    store.recordPartnerPayout({
      partnerId: payoutTargetPartner.id,
      partnerName: payoutTargetPartner.name,
      amount: amt,
      payoutDate: new Date().toISOString().split('T')[0],
      paymentMethod: payoutMethod,
      transactionRef: payoutTxRef.trim() || undefined,
      status: 'Completed',
      notes: payoutNotes.trim() || `Disbursed to ${payoutTargetPartner.name}`
    });

    setIsPayoutModalOpen(false);
    setPayoutTargetPartner(null);
  };

  // Open Commission Rate Modal for any partner
  const handleOpenRateModal = (partner: Partner, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setRateTargetPartner(partner);
    if (partner.isCustomRate && partner.customCommissionRate !== undefined) {
      setEditRateMode('custom');
      setEditCustomRatePct(String(Math.round(partner.customCommissionRate * 1000) / 10));
      setEditCustomRateReason(partner.customRateReason || '');
      setEditTierRate(partner.commissionRate || 0.10);
    } else {
      setEditRateMode('tier');
      setEditTierRate(partner.commissionRate || 0.10);
      setEditCustomRatePct('30');
      setEditCustomRateReason('');
    }
    setIsRateModalOpen(true);
  };

  // Save Commission Rate Settings (Super Admin Action)
  const handleSaveRateConfiguration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rateTargetPartner) return;

    if (editRateMode === 'custom') {
      const parsedPct = parseFloat(editCustomRatePct);
      if (isNaN(parsedPct) || parsedPct <= 0 || parsedPct > 100) {
        toast.error('Invalid Percentage', 'Please enter a valid percentage between 0.1% and 100%.');
        return;
      }
      const decimalRate = parsedPct / 100;
      const nowIso = new Date().toISOString();
      const reason = editCustomRateReason.trim() || 'Super Admin Custom Fixed Rate Agreement';

      await store.updatePartner(rateTargetPartner.id, {
        isCustomRate: true,
        customCommissionRate: decimalRate,
        customRateReason: reason,
        customRateSetAt: nowIso,
        customRateSetBy: 'Super Admin',
        commissionRate: decimalRate
      });

      toast.success('Custom Fixed Rate Applied ⚡', `${rateTargetPartner.name} locked at ${parsedPct}% fixed commission.`);
    } else {
      await store.updatePartner(rateTargetPartner.id, {
        isCustomRate: false,
        customCommissionRate: undefined,
        customRateReason: undefined,
        customRateSetAt: undefined,
        customRateSetBy: undefined,
        commissionRate: editTierRate
      });

      const tierLabels: Record<number, string> = {
        0.10: 'Starter Tier (10%)',
        0.15: 'Base Tier (15%)',
        0.20: 'Pro Tier (20%)',
        0.25: 'Elite Tier (25%)'
      };
      toast.success('Tier Plan Restored', `${rateTargetPartner.name} restored to standard dynamic tiers (${tierLabels[editTierRate] || `${Math.round(editTierRate * 100)}%`}).`);
    }

    if (selectedPartner && selectedPartner.id === rateTargetPartner.id) {
      const updated = store.partners.find(p => p.id === rateTargetPartner.id);
      if (updated) setSelectedPartner(updated);
    }

    setIsRateModalOpen(false);
    setRateTargetPartner(null);
  };

  const allPendingPayouts = useMemo(() => {
    return store.partnerPayouts.filter(p => p.status === 'Pending');
  }, [store.partnerPayouts]);

  const handleApprovePayout = (payoutId: string) => {
    const defaultUtr = `UTR-${Date.now().toString().slice(-6)}`;
    const utr = window.prompt('Enter payout transaction reference (e.g., UTR / NEFT / IMPS Ref):', defaultUtr);
    if (utr === null) return;
    store.updatePartnerPayout(payoutId, {
      status: 'Completed',
      transactionRef: utr.trim() || defaultUtr,
      payoutDate: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              AGX Partner Program
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#CCFF00] text-black font-extrabold text-[10px] uppercase tracking-wider">
              {activePartnersCount} Active
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage agency partners, track client referrals through full settlement, and disburse commission payouts.
          </p>
        </div>

        <button
          onClick={() => setIsAddPartnerModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-black hover:bg-gray-800 text-[#CCFF00] text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-sm btn-press"
        >
          <Plus size={15} />
          <span>Onboard New Partner</span>
        </button>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 text-[10px] font-bold uppercase tracking-wider">
            <span>Total Partners</span>
            <Handshake size={14} className="text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-gray-900 mt-1.5 tabular-nums">
            {totalPartnersCount}
          </div>
          <span className="text-[10px] text-gray-400 mt-0.5">{activePartnersCount} currently active</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 text-[10px] font-bold uppercase tracking-wider">
            <span>Client Revenue</span>
            <TrendingUp size={14} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-1.5 tabular-nums">
            ₹{totalPartnerRevenue.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-gray-400 mt-0.5">Collected via partner deals</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 text-[10px] font-bold uppercase tracking-wider">
            <span>Commissions Accrued</span>
            <IndianRupee size={14} className="text-purple-500" />
          </div>
          <div className="text-2xl font-black text-gray-900 mt-1.5 tabular-nums">
            ₹{totalCommissionsEarned.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-gray-400 mt-0.5">Earned by all partners</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 text-[10px] font-bold uppercase tracking-wider">
            <span>Commissions Paid</span>
            <CheckCircle2 size={14} className="text-blue-500" />
          </div>
          <div className="text-2xl font-black text-gray-900 mt-1.5 tabular-nums">
            ₹{totalCommissionsPaid.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-gray-400 mt-0.5">Disbursed successfully</span>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-700 text-[10px] font-bold uppercase tracking-wider">
            <span>Outstanding Due</span>
            <Wallet size={14} className="text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700 mt-1.5 tabular-nums">
            ₹{outstandingCommissionDue.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-amber-600 font-medium mt-0.5">Pending payouts to disburse</span>
        </div>
      </div>

      {/* Pending Payouts Review Banner */}
      {allPendingPayouts.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-950 flex items-center gap-2">
                <span>{allPendingPayouts.length} Pending Partner Payout Request{allPendingPayouts.length > 1 ? 's' : ''} Awaiting Approval</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-extrabold uppercase">Action Required</span>
              </h4>
              <span className="text-[11px] text-amber-800 font-medium">
                Total requested balance: ₹{allPendingPayouts.reduce((acc, p) => acc + p.amount, 0).toLocaleString('en-IN')} across partners
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {allPendingPayouts.slice(0, 3).map(p => (
              <button
                key={p.id}
                onClick={() => handleApprovePayout(p.id)}
                className="px-3 py-1.5 rounded-xl bg-black hover:bg-gray-800 text-[#CCFF00] text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <span>Approve ₹{p.amount.toLocaleString('en-IN')} ({p.partnerName || 'Partner'})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search partners by name, company, email, or referral code..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-black transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase text-gray-400 font-bold">Status:</span>
          {(['ALL', 'Active', 'Pending', 'Suspended'] as const).map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                statusFilter === f
                  ? 'bg-black text-[#CCFF00]'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Partners List Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70 text-gray-500 uppercase tracking-wider text-[10px] font-bold">
                <th className="py-3 px-4">Partner</th>
                <th className="py-3 px-4">Referral Code</th>
                <th className="py-3 px-4">Tier / Rate</th>
                <th className="py-3 px-4">Last Login</th>
                <th className="py-3 px-4">Revenue Brought</th>
                <th className="py-3 px-4">Earned Cut</th>
                <th className="py-3 px-4">Paid Out</th>
                <th className="py-3 px-4">Balance Due</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPartners.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-gray-400">
                    No partners found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredPartners.map(partner => {
                  const referralsCount = store.partnerReferrals.filter(r => r.partnerId === partner.id).length;
                  const balanceDue = Math.max(0, partner.totalEarnings - partner.paidEarnings);

                  return (
                    <tr
                      key={partner.id}
                      onClick={() => setSelectedPartner(partner)}
                      className="hover:bg-gray-50/70 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-black text-[#CCFF00] font-black text-xs flex items-center justify-center">
                            {partner.name.charAt(0)}
                          </div>
                          <div>
                            <strong className="text-gray-900 block font-bold">{partner.name}</strong>
                            <span className="text-[11px] text-gray-400 block">{partner.company || partner.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-gray-700 tracking-wide">
                        {partner.referralCode}
                      </td>

                      <td className="py-3.5 px-4">
                        {(() => {
                          const partnerVol = store.partnerReferrals
                            .filter(r => r.partnerId === partner.id)
                            .reduce((sum, r) => sum + (r.totalPaid || r.dealValue || 0), 0);
                          const effective = getEffectivePartnerRate(partner, partnerVol);
                          
                          if (effective.isCustom) {
                            return (
                              <button
                                onClick={(e) => handleOpenRateModal(partner, e)}
                                title={`Custom Fixed Rate: ${effective.percentage}% (${partner.customRateReason || 'Super Admin Override'}). Click to adjust.`}
                                className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all border font-mono inline-flex items-center gap-1.5 shadow-2xs hover:scale-105 active:scale-95 bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-300"
                              >
                                <Zap size={11} className="text-purple-600 fill-purple-600" />
                                <span>Fixed {effective.percentage}%</span>
                              </button>
                            );
                          }

                          return (
                            <button
                              onClick={(e) => handleOpenRateModal(partner, e)}
                              title={`Standard Tier: ${effective.tier} (${effective.percentage}%). Click to configure custom rate or tier.`}
                              className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all border font-mono inline-flex items-center gap-1.5 hover:scale-105 active:scale-95"
                              style={{
                                backgroundColor: `${effective.tierColor}15`,
                                color: effective.tierColor === '#CCFF00' ? '#166534' : effective.tierColor,
                                borderColor: `${effective.tierColor}40`
                              }}
                            >
                              <span 
                                className="w-1.5 h-1.5 rounded-full shrink-0" 
                                style={{ backgroundColor: effective.tierColor === '#CCFF00' ? '#166534' : effective.tierColor }} 
                              />
                              <span>{effective.percentage}% {effective.tier}</span>
                            </button>
                          );
                        })()}
                      </td>

                      <td className="py-3.5 px-4">
                        {(() => {
                          const loginInfo = formatLastLogin(partner.lastLoginAt || partner.createdAt);
                          return (
                            <div className="flex items-center gap-1.5" title={`Last Active / Login: ${loginInfo.full}`}>
                              <span
                                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                  loginInfo.isRecent ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'
                                }`}
                              />
                              <span className="text-xs text-gray-700 font-medium whitespace-nowrap">
                                {loginInfo.relative}
                              </span>
                            </div>
                          );
                        })()}
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-gray-900 tabular-nums">
                        ₹{(store.partnerReferrals
                          .filter(r => r.partnerId === partner.id)
                          .reduce((sum, r) => sum + (r.totalPaid || 0), 0)
                        ).toLocaleString('en-IN')}
                        <span className="text-[10px] text-gray-400 block font-normal">{referralsCount} deals</span>
                      </td>

                      <td className="py-3.5 px-4 text-gray-900 font-bold tabular-nums">
                        ₹{partner.totalEarnings.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3.5 px-4 text-gray-600 font-medium tabular-nums">
                        ₹{partner.paidEarnings.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3.5 px-4 font-bold tabular-nums">
                        <span className={balanceDue > 0 ? 'text-amber-600' : 'text-emerald-600'}>
                          ₹{balanceDue.toLocaleString('en-IN')}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          partner.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-700'
                            : partner.status === 'Pending'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}>
                          {partner.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenPayoutModal(partner)}
                            disabled={balanceDue <= 0}
                            className="px-2.5 py-1 rounded-lg bg-black hover:bg-gray-800 text-[#CCFF00] text-[10px] font-bold uppercase transition-colors disabled:opacity-30 cursor-pointer"
                          >
                            Pay Cut
                          </button>
                          {canDeletePartner && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setPartnerToDelete(partner);
                              }}
                              className="p-1.5 rounded-lg hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Delete Partner (Super Admin)"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedPartner(partner)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
                            title="View Partner Dossier"
                          >
                            <ChevronRight size={15} />
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

      {/* Partner Detail Drawer Modal */}
      <AnimatePresence>
        {selectedPartner && (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-2xl h-full bg-white shadow-2xl p-6 sm:p-8 flex flex-col justify-between overflow-y-auto"
            >
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-black text-[#CCFF00] font-black text-lg flex items-center justify-center">
                      {selectedPartner.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{selectedPartner.name}</h2>
                      <span className="text-xs text-gray-500">{selectedPartner.company || 'AGX Affiliate Partner'}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedPartner(null)}
                    className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-900"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Partner Coordinates & Tier Status */}
                {(() => {
                  const selectedPartnerVol = store.partnerReferrals
                    .filter(r => r.partnerId === selectedPartner.id)
                    .reduce((sum, r) => sum + (r.totalPaid || r.dealValue || 0), 0);
                  const effective = getEffectivePartnerRate(selectedPartner, selectedPartnerVol);
                  return (
                    <div className="space-y-3">
                      {/* Tier / Custom Rate Status Banner */}
                      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        effective.isCustom 
                          ? 'bg-purple-50/70 border-purple-200' 
                          : 'bg-gray-50 border-gray-100'
                      }`}>
                        <div className="flex items-center gap-3">
                          <div 
                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border shrink-0 ${
                              effective.isCustom 
                                ? 'bg-purple-100 text-purple-700 border-purple-300' 
                                : ''
                            }`}
                            style={!effective.isCustom ? { 
                              backgroundColor: `${effective.tierColor}15`, 
                              color: effective.tierColor === '#CCFF00' ? '#166534' : effective.tierColor,
                              borderColor: `${effective.tierColor}35`
                            } : undefined}
                          >
                            {effective.isCustom ? <Zap size={20} className="fill-purple-600" /> : <Award size={20} />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] uppercase font-bold text-gray-400 font-mono">Commission Structure</span>
                              <span 
                                className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase font-mono tracking-wider border ${
                                  effective.isCustom 
                                    ? 'bg-purple-600 text-white border-purple-700' 
                                    : ''
                                }`}
                                style={!effective.isCustom ? { 
                                  backgroundColor: `${effective.tierColor}15`, 
                                  color: effective.tierColor === '#CCFF00' ? '#166534' : effective.tierColor,
                                  borderColor: `${effective.tierColor}35`
                                } : undefined}
                              >
                                {effective.badgeLabel}
                              </span>
                            </div>
                            <span className="text-xs text-gray-700 block mt-0.5">
                              {effective.isCustom ? (
                                <>
                                  <strong className="text-purple-900">VIP Guaranteed {effective.percentage}% on all deals</strong>
                                  {selectedPartner.customRateReason && (
                                    <span className="text-purple-700 block text-[11px] font-medium mt-0.5">
                                      Terms: {selectedPartner.customRateReason}
                                    </span>
                                  )}
                                </>
                              ) : (
                                <>
                                  {effective.nextTier ? (
                                    <>Needs <strong>₹{effective.volumeNeededForNextTier?.toLocaleString('en-IN')}</strong> more for {effective.nextTier} Tier ({effective.nextTier === 'Elite' ? '25%' : effective.nextTier === 'Pro' ? '20%' : '15%'})</>
                                  ) : (
                                    <strong className="text-emerald-700">Top Elite Tier Qualified (+5% Bonus on total business)</strong>
                                  )}
                                </>
                              )}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleOpenRateModal(selectedPartner)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-gray-200 hover:border-black text-gray-900 transition-all cursor-pointer shadow-2xs shrink-0 self-start sm:self-auto flex items-center gap-1.5 hover:bg-gray-50"
                          title="Configure commission rate or set fixed percentage"
                        >
                          <Edit2 size={12} />
                          <span>Configure Rate</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-gray-50 text-xs">
                        <div>
                          <span className="text-[10px] text-gray-400 block font-medium">Referral Code</span>
                          <strong className="text-gray-900 tracking-wide font-mono">{selectedPartner.referralCode}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 block font-medium">Business Generated</span>
                          <strong className="text-gray-900 tabular-nums">₹{selectedPartnerVol.toLocaleString('en-IN')}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 block font-medium">Payout Method</span>
                          <strong className="text-gray-900">{selectedPartner.payoutMethod}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 block font-medium">Balance Ready</span>
                          <strong className="text-amber-600 tabular-nums">
                            ₹{Math.max(0, selectedPartner.totalEarnings - selectedPartner.paidEarnings).toLocaleString('en-IN')}
                          </strong>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Last Login Info Box */}
                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/70 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Clock size={15} className="text-gray-400" />
                    <span className="text-gray-600 font-medium">Last Login:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const loginInfo = formatLastLogin(selectedPartner.lastLoginAt || selectedPartner.createdAt);
                      return (
                        <>
                          <span className={`w-2 h-2 rounded-full shrink-0 ${loginInfo.isRecent ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`} />
                          <strong className="text-gray-900 tabular-nums">{loginInfo.full}</strong>
                          <span className="text-gray-400 text-[11px]">({loginInfo.relative})</span>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Contact & Payment Info */}
                <div className="p-4 rounded-2xl border border-gray-200 text-xs space-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail size={14} /> <span>{selectedPartner.email}</span>
                  </div>
                  {selectedPartner.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone size={14} /> <span>{selectedPartner.phone}</span>
                    </div>
                  )}
                  {selectedPartner.payoutDetails?.upiId && (
                    <div className="flex items-center gap-2 text-gray-900">
                      <CreditCard size={14} /> <span>UPI ID: <strong className="tracking-wide">{selectedPartner.payoutDetails.upiId}</strong></span>
                    </div>
                  )}
                </div>

                {/* Referred Clients & Live Payment Tracking Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                      Referred Clients & Milestone Settlements ({selectedPartnerReferrals.length})
                    </h3>
                  </div>

                  {selectedPartnerReferrals.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-xs bg-gray-50 rounded-2xl">
                      No clients referred by this partner yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedPartnerReferrals.map(ref => {
                        const pct = ref.dealValue > 0 ? Math.min(100, Math.round((ref.totalPaid / ref.dealValue) * 100)) : 0;
                        const isSettled = ref.totalPaid >= ref.dealValue && ref.dealValue > 0;

                        return (
                          <div key={ref.id} className="p-4 rounded-2xl border border-gray-200 bg-white space-y-2.5">
                            <div className="flex items-center justify-between">
                              <div>
                                <strong className="text-gray-900 text-xs block">{ref.clientName}</strong>
                                <span className="text-[11px] text-gray-400">{ref.projectType} • {ref.company || 'Client'}</span>
                              </div>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isSettled ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                              }`}>
                                {isSettled ? 'Fully Settled 100%' : `${pct}% Paid`}
                              </span>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                              <div
                                className="h-full bg-black rounded-full"
                                style={{ width: `${pct}%` }}
                              />
                            </div>

                            <div className="flex justify-between text-[11px] text-gray-600 tabular-nums">
                              <span>Paid: ₹{ref.totalPaid.toLocaleString('en-IN')} / ₹{ref.dealValue.toLocaleString('en-IN')}</span>
                              <span>Partner Cut: <strong className="text-gray-900">₹{ref.commissionEarned.toLocaleString('en-IN')}</strong></span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Payout History Section */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                    Disbursed Payouts ({selectedPartnerPayouts.length})
                  </h3>
                  {selectedPartnerPayouts.length === 0 ? (
                    <div className="text-center py-6 text-gray-400 text-xs bg-gray-50 rounded-2xl">
                      No payouts disbursed yet.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedPartnerPayouts.map(p => (
                        <div key={p.id} className="p-3 rounded-xl bg-gray-50 border border-gray-200/80 flex items-center justify-between text-xs tabular-nums">
                          <div>
                            <span className="text-gray-900 font-bold">₹{p.amount.toLocaleString('en-IN')}</span>
                            <span className="text-gray-400 text-[10px] block">{p.payoutDate} via {p.paymentMethod}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              p.status === 'Completed'
                                ? 'bg-emerald-100 text-emerald-700'
                                : p.status === 'Pending'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-700'
                            }`}>
                              {p.transactionRef || p.status}
                            </span>
                            {p.status === 'Completed' && selectedPartner && (
                              <button
                                onClick={() => exportService.generatePartnerPayoutVoucherPdf(p, selectedPartner)}
                                className="px-2 py-1 bg-gray-100 hover:bg-black hover:text-[#CCFF00] text-gray-700 rounded-lg text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                                title="Download Official Tax Voucher (PDF)"
                              >
                                <Download size={11} />
                                <span>Voucher</span>
                              </button>
                            )}
                            {p.status === 'Pending' && (
                              <button
                                onClick={() => handleApprovePayout(p.id)}
                                className="px-2.5 py-1 bg-black text-[#CCFF00] hover:bg-gray-800 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                              >
                                Approve & Pay
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-6 border-t border-gray-100 flex gap-3">
                <button
                  onClick={() => handleOpenPayoutModal(selectedPartner)}
                  className="flex-1 py-3 rounded-xl bg-black text-[#CCFF00] font-bold text-xs uppercase tracking-wider hover:bg-gray-800 transition-colors"
                >
                  Record Commission Payout
                </button>
                <button
                  onClick={() => setSelectedPartner(null)}
                  className="px-5 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold text-xs hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>

              {/* Danger Zone: Super Admin Partner Deletion */}
              {canDeletePartner && selectedPartner && (
                <div className="pt-4 mt-2 border-t border-rose-100">
                  <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200/80 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                        <AlertTriangle size={14} className="text-rose-600" />
                        Danger Zone: Decommission Partner
                      </p>
                      <p className="text-[11px] text-rose-700/80 mt-0.5">
                        Soft-delete this partner account. Referral history & ledgers are preserved for financial audits.
                      </p>
                    </div>
                    <button
                      onClick={() => setPartnerToDelete(selectedPartner)}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                    >
                      <Trash2 size={13} />
                      Delete Partner
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 1: Onboard Partner */}
      <AnimatePresence>
        {isAddPartnerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 rounded-3xl bg-white shadow-2xl border border-gray-200 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Onboard AGX Partner</h3>
                <button onClick={() => setIsAddPartnerModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>

              <form onSubmit={handleAddPartner} className="space-y-3 text-xs">
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-600 block mb-1">Partner Full Name *</label>
                  <input
                    type="text"
                    required
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    placeholder="e.g. Marcus Vance"
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-600 block mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={addEmail}
                    onChange={(e) => setAddEmail(e.target.value)}
                    placeholder="partner@agency.com"
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-black"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-gray-600 block mb-1">Agency / Company</label>
                    <input
                      type="text"
                      value={addCompany}
                      onChange={(e) => setAddCompany(e.target.value)}
                      placeholder="Vance Media"
                      className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-gray-600 block mb-1">Phone</label>
                    <input
                      type="tel"
                      value={addPhone}
                      onChange={(e) => setAddPhone(e.target.value)}
                      placeholder="+91 9876543210"
                      className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-gray-600 block mb-1">Commission Plan</label>
                    <select
                      value={addIsCustomRate ? 'custom' : addCommissionRate}
                      onChange={(e) => {
                        if (e.target.value === 'custom') {
                          setAddIsCustomRate(true);
                        } else {
                          setAddIsCustomRate(false);
                          setAddCommissionRate(e.target.value);
                        }
                      }}
                      className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-black text-xs"
                    >
                      <option value="0.10">Dynamic Tiers (10% Starter)</option>
                      <option value="0.15">Dynamic Tiers (15% Base)</option>
                      <option value="0.20">Dynamic Tiers (20% Pro)</option>
                      <option value="0.25">Dynamic Tiers (25% Elite)</option>
                      <option value="custom">⚡ Custom Fixed % (Selective Partner)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-gray-600 block mb-1">Payout Method</label>
                    <select
                      value={addPayoutMethod}
                      onChange={(e) => setAddPayoutMethod(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-black text-xs"
                    >
                      <option value="UPI">UPI</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="PayPal">PayPal</option>
                    </select>
                  </div>
                </div>

                {addIsCustomRate && (
                  <div className="p-3 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-2">
                    <div className="flex items-center gap-1.5 text-purple-900 font-bold text-xs">
                      <Zap size={13} className="text-purple-600 fill-purple-600" />
                      <span>Custom Fixed Commission Percentage</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold uppercase text-purple-800 block mb-1">Fixed Rate (%) *</label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.1"
                            min="0.1"
                            max="100"
                            required
                            value={addCustomRatePct}
                            onChange={(e) => setAddCustomRatePct(e.target.value)}
                            placeholder="e.g. 30"
                            className="w-full p-2 rounded-xl border border-purple-300 bg-white focus:outline-none focus:border-purple-600 font-bold text-xs tabular-nums pr-6"
                          />
                          <span className="absolute right-2.5 top-2 text-purple-600 font-bold text-xs">%</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-purple-800 block mb-1">Agreement Memo / Reason</label>
                        <input
                          type="text"
                          value={addCustomRateReason}
                          onChange={(e) => setAddCustomRateReason(e.target.value)}
                          placeholder="e.g. Strategic Channel VIP"
                          className="w-full p-2 rounded-xl border border-purple-300 bg-white focus:outline-none focus:border-purple-600 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {addPayoutMethod === 'UPI' && (
                  <div>
                    <label className="text-[10px] font-bold uppercase text-gray-600 block mb-1">UPI ID</label>
                    <input
                      type="text"
                      value={addUpiId}
                      onChange={(e) => setAddUpiId(e.target.value)}
                      placeholder="e.g. name@okaxis"
                      className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-black"
                    />
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddPartnerModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-gray-100 font-bold text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-black text-[#CCFF00] font-bold uppercase tracking-wider"
                  >
                    Create Partner
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 2: Disburse Payout */}
      <AnimatePresence>
        {isPayoutModalOpen && payoutTargetPartner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 rounded-3xl bg-white shadow-2xl border border-gray-200 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Record Partner Payout</h3>
                  <span className="text-xs text-gray-500">Disbursing to {payoutTargetPartner.name}</span>
                </div>
                <button onClick={() => setIsPayoutModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>

              <form onSubmit={handleExecutePayout} className="space-y-3 text-xs">
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-600 block mb-1">Payout Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-black font-bold tabular-nums"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-gray-600 block mb-1">Payment Method</label>
                    <select
                      value={payoutMethod}
                      onChange={(e) => setPayoutMethod(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-black"
                    >
                      <option value="UPI">UPI</option>
                      <option value="Bank Transfer">Bank Transfer / IMPS</option>
                      <option value="PayPal">PayPal</option>
                      <option value="Cash">Cash / Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-gray-600 block mb-1">UTR / Ref Number</label>
                    <input
                      type="text"
                      value={payoutTxRef}
                      onChange={(e) => setPayoutTxRef(e.target.value)}
                      placeholder="e.g. UTR-491028"
                      className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-600 block mb-1">Disbursement Notes</label>
                  <textarea
                    rows={2}
                    value={payoutNotes}
                    onChange={(e) => setPayoutNotes(e.target.value)}
                    placeholder="Milestone commission settlement..."
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-black"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsPayoutModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-gray-100 font-bold text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-black text-[#CCFF00] font-bold uppercase tracking-wider"
                  >
                    Confirm Payout
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 3: Configure Commission Rate (Tier vs Custom Fixed %) */}
      <AnimatePresence>
        {isRateModalOpen && rateTargetPartner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg p-6 sm:p-7 rounded-3xl bg-white shadow-2xl border border-gray-200 space-y-5"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                    editRateMode === 'custom' ? 'bg-purple-100 text-purple-700' : 'bg-black text-[#CCFF00]'
                  }`}>
                    {editRateMode === 'custom' ? <Zap size={20} className="fill-purple-600" /> : <Award size={20} />}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Configure Commission Rate</h3>
                    <span className="text-xs text-gray-500">{rateTargetPartner.name} · {rateTargetPartner.company || rateTargetPartner.email}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRateModalOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveRateConfiguration} className="space-y-4 text-xs">
                {/* Plan Mode Selection: Dynamic Tiers vs Custom Fixed */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
                    Commission Model
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Mode 1: Dynamic Monthly Tiers */}
                    <button
                      type="button"
                      onClick={() => setEditRateMode('tier')}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative ${
                        editRateMode === 'tier'
                          ? 'bg-gray-50 border-black ring-2 ring-black/10 shadow-xs'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900 text-xs">Dynamic Tiers</span>
                        {editRateMode === 'tier' && (
                          <span className="w-2 h-2 rounded-full bg-black shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                        10% → 15% → 20% → 25% scale based on monthly business closed.
                      </p>
                    </button>

                    {/* Mode 2: Custom Fixed Percentage */}
                    <button
                      type="button"
                      onClick={() => setEditRateMode('custom')}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative ${
                        editRateMode === 'custom'
                          ? 'bg-purple-50/80 border-purple-600 ring-2 ring-purple-500/20 shadow-xs'
                          : 'bg-white border-gray-200 hover:border-purple-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-purple-900 text-xs flex items-center gap-1">
                          <Zap size={13} className="text-purple-600 fill-purple-600" />
                          Custom Fixed %
                        </span>
                        {editRateMode === 'custom' && (
                          <span className="w-2 h-2 rounded-full bg-purple-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-purple-700/80 mt-1 leading-snug">
                        Guaranteed fixed cut on all deals. Bypasses volume tiers.
                      </p>
                    </button>
                  </div>
                </div>

                {/* Sub-panel 1: Dynamic Tiers Options */}
                {editRateMode === 'tier' && (
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-3">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-gray-600 block mb-1">
                        Default Base Tier
                      </label>
                      <select
                        value={editTierRate}
                        onChange={(e) => setEditTierRate(parseFloat(e.target.value))}
                        className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-medium text-xs focus:outline-none focus:border-black"
                      >
                        <option value="0.10">Starter Tier (10% standard • Up to ₹2.5L business)</option>
                        <option value="0.15">Base Tier (15% standard • ₹2.5L — ₹4.0L business)</option>
                        <option value="0.20">Pro Tier (20% standard • ₹4.0L — ₹12.0L business)</option>
                        <option value="0.25">Elite Bonus Tier (25% top tier • &gt; ₹12.0L business)</option>
                      </select>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-gray-200 text-[11px] text-gray-600 leading-relaxed">
                      💡 <strong>Flexible Automatic Progression:</strong> When the partner brings client deals, their monthly volume automatically upgrades them across the tiers. All business in that month is paid out at the highest qualified rate.
                    </div>
                  </div>
                )}

                {/* Sub-panel 2: Custom Fixed Percentage Options */}
                {editRateMode === 'custom' && (
                  <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-3.5">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-purple-900 block mb-1.5">
                        Fixed Commission Percentage *
                      </label>

                      {/* Quick Presets */}
                      <div className="flex flex-wrap gap-1.5 mb-2.5">
                        {['10', '15', '18', '20', '22.5', '25', '30', '35', '40', '50'].map(pct => (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => setEditCustomRatePct(pct)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold font-mono transition-all cursor-pointer ${
                              editCustomRatePct === pct
                                ? 'bg-purple-700 text-white shadow-xs'
                                : 'bg-white text-purple-900 border border-purple-200 hover:border-purple-400'
                            }`}
                          >
                            {pct}%
                          </button>
                        ))}
                      </div>

                      {/* Percentage Input */}
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          max="100"
                          required
                          value={editCustomRatePct}
                          onChange={(e) => setEditCustomRatePct(e.target.value)}
                          placeholder="e.g. 30"
                          className="w-full p-2.5 rounded-xl border border-purple-300 bg-white font-mono font-black text-sm text-purple-950 focus:outline-none focus:border-purple-700 pr-8"
                        />
                        <span className="absolute right-3 top-2.5 text-purple-600 font-black text-sm">%</span>
                      </div>
                    </div>

                    {/* Simulation Preview */}
                    {(() => {
                      const numPct = parseFloat(editCustomRatePct) || 0;
                      const exampleDeal = 500000;
                      const exampleCut = Math.round(exampleDeal * (numPct / 100));
                      return (
                        <div className="p-2.5 rounded-xl bg-white border border-purple-200 flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[10px] text-gray-400 font-bold uppercase block">Deal Example (₹5,00,000)</span>
                            <span className="text-purple-950 font-extrabold font-mono text-sm">
                              ₹{exampleCut.toLocaleString('en-IN')} Take-Home
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-mono font-bold">
                            Guaranteed {numPct}%
                          </span>
                        </div>
                      );
                    })()}

                    {/* Agreement Memo / Reason */}
                    <div>
                      <label className="text-[10px] font-bold uppercase text-purple-900 block mb-1">
                        Agreement Note / Audit Memo
                      </label>
                      <input
                        type="text"
                        value={editCustomRateReason}
                        onChange={(e) => setEditCustomRateReason(e.target.value)}
                        placeholder="e.g. Strategic Channel VIP / Enterprise closer pre-agreed cut"
                        className="w-full p-2.5 rounded-xl border border-purple-300 bg-white text-xs focus:outline-none focus:border-purple-700"
                      />
                      <span className="text-[10px] text-purple-700/70 block mt-1">
                        Visible on partner profile and ledger audit trails.
                      </span>
                    </div>
                  </div>
                )}

                {/* Modal Actions */}
                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsRateModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 font-bold text-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-black hover:bg-gray-800 text-[#CCFF00] font-bold uppercase tracking-wider transition-all shadow-sm"
                  >
                    Save Rate Settings
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 4: Superadmin Delete Partner Confirmation Modal */}
      <AnimatePresence>
        {partnerToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 relative overflow-hidden"
            >
              {/* Red warning header bar */}
              <div className="h-1.5 bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 absolute top-0 left-0 right-0" />

              <div className="flex items-start gap-3.5 mb-4 mt-1">
                <div className="w-11 h-11 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <Trash2 size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    Decommission Partner Account
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-mono font-bold uppercase">
                      Super Admin Authority
                    </span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Confirm deletion of partner profile from active directory.
                  </p>
                </div>
              </div>

              {/* Partner Card Summary */}
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200/80 mb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-black text-[#CCFF00] flex items-center justify-center font-bold text-xs">
                      {partnerToDelete.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">{partnerToDelete.name}</p>
                      <p className="text-[11px] text-gray-500">{partnerToDelete.company || 'Independent Partner'} • {partnerToDelete.email}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono font-bold bg-white px-2 py-1 rounded border border-gray-200 text-gray-700">
                    {partnerToDelete.referralCode}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-200/60 text-center">
                  <div className="bg-white p-2 rounded-lg border border-gray-100">
                    <p className="text-[10px] uppercase font-bold text-gray-400">Deals Brought</p>
                    <p className="text-xs font-bold text-gray-800 mt-0.5">
                      {store.partnerReferrals.filter(r => r.partnerId === partnerToDelete.id).length} deals
                    </p>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-gray-100">
                    <p className="text-[10px] uppercase font-bold text-gray-400">Total Earned</p>
                    <p className="text-xs font-bold text-emerald-700 font-mono mt-0.5">
                      ₹{(partnerToDelete.totalEarnings || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-gray-100">
                    <p className="text-[10px] uppercase font-bold text-gray-400">Balance Due</p>
                    <p className={`text-xs font-bold font-mono mt-0.5 ${
                      ((partnerToDelete.totalEarnings || 0) - (partnerToDelete.paidEarnings || 0)) > 0
                        ? 'text-rose-600'
                        : 'text-gray-600'
                    }`}>
                      ₹{Math.max(0, (partnerToDelete.totalEarnings || 0) - (partnerToDelete.paidEarnings || 0)).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Outstanding balance warning if balanceDue > 0 */}
              {((partnerToDelete.totalEarnings || 0) - (partnerToDelete.paidEarnings || 0)) > 0 && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 mb-4 flex items-start gap-2.5">
                  <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs leading-relaxed">
                    <span className="font-bold">Outstanding Commission Balance Warning:</span> This partner has an unsettled commission balance of <span className="font-bold font-mono text-amber-950">₹{((partnerToDelete.totalEarnings || 0) - (partnerToDelete.paidEarnings || 0)).toLocaleString('en-IN')}</span>. Deleting will remove them from the active dashboard, but past payout ledgers remain saved for legal and tax compliance.
                  </div>
                </div>
              )}

              {/* Logical safety safeguards notice */}
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200/60 mb-5 text-[11px] text-gray-600 space-y-1">
                <p className="font-semibold text-gray-700 flex items-center gap-1.5">
                  <Shield size={13} className="text-emerald-600" />
                  Enterprise Data Integrity Rules Applied:
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-gray-500 pl-1">
                  <li>Referral clients, deals, and invoices linked to this code are preserved.</li>
                  <li>Soft-deleted in Hostinger MySQL with timestamped audit trail.</li>
                  <li>Partner will no longer be able to log in to the Partner Portal.</li>
                </ul>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={isDeletingPartner}
                  onClick={() => setPartnerToDelete(null)}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeletingPartner}
                  onClick={handleConfirmDelete}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-sm hover:shadow-rose-600/20 disabled:opacity-50"
                >
                  {isDeletingPartner ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={14} />
                      <span>Confirm & Delete Partner</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
