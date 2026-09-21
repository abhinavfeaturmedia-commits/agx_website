import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Handshake, Users, DollarSign, Wallet, Search, Filter, Plus, Edit2,
  Trash2, ExternalLink, CheckCircle2, AlertCircle, Clock, ArrowUpRight,
  Sparkles, Shield, ChevronRight, X, Phone, Mail, Building, CreditCard, TrendingUp
} from 'lucide-react';
import { Partner, PartnerReferral, PartnerPayout } from '../../types/crm';
import { useCrmStore } from '../../lib/crmStore';
import { toast } from '../../lib/toastStore';

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

  const [isAddPartnerModalOpen, setIsAddPartnerModalOpen] = useState(false);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutTargetPartner, setPayoutTargetPartner] = useState<Partner | null>(null);

  // Add Partner Form State
  const [addName, setAddName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addCompany, setAddCompany] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addCommissionRate, setAddCommissionRate] = useState('0.10');
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

    store.createPartner({
      name: addName.trim(),
      email: addEmail.trim().toLowerCase(),
      company: addCompany.trim() || undefined,
      phone: addPhone.trim() || undefined,
      referralCode,
      commissionRate: parseFloat(addCommissionRate) || 0.10,
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

  // Upgrade / Adjust Commission Rate
  const handleToggleCommissionRate = (partner: Partner) => {
    const nextRate = partner.commissionRate === 0.10 ? 0.15 : 0.10;
    store.updatePartner(partner.id, { commissionRate: nextRate });
    toast.success('Commission Tier Updated', `${partner.name} upgraded to ${Math.round(nextRate * 100)}% tier.`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight font-['Outfit']">
              AGX Partner Program
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#CCFF00] text-black font-extrabold text-[10px] uppercase font-mono tracking-wider">
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
          <div className="flex items-center justify-between text-gray-500 text-[10px] font-mono uppercase tracking-wider">
            <span>Total Partners</span>
            <Handshake size={14} className="text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-gray-900 mt-2 font-['Outfit']">
            {totalPartnersCount}
          </div>
          <span className="text-[10px] text-gray-400 mt-0.5">{activePartnersCount} currently active</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 text-[10px] font-mono uppercase tracking-wider">
            <span>Client Revenue</span>
            <TrendingUp size={14} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2 font-['Outfit']">
            ₹{totalPartnerRevenue.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-gray-400 mt-0.5">Collected via partner deals</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 text-[10px] font-mono uppercase tracking-wider">
            <span>Commissions Accrued</span>
            <DollarSign size={14} className="text-purple-500" />
          </div>
          <div className="text-2xl font-black text-gray-900 mt-2 font-['Outfit']">
            ₹{totalCommissionsEarned.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-gray-400 mt-0.5">Earned by all partners</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 text-[10px] font-mono uppercase tracking-wider">
            <span>Commissions Paid</span>
            <CheckCircle2 size={14} className="text-blue-500" />
          </div>
          <div className="text-2xl font-black text-gray-900 mt-2 font-['Outfit']">
            ₹{totalCommissionsPaid.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-gray-400 mt-0.5">Disbursed successfully</span>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-700 text-[10px] font-mono uppercase tracking-wider font-bold">
            <span>Outstanding Due</span>
            <Wallet size={14} className="text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700 mt-2 font-['Outfit']">
            ₹{outstandingCommissionDue.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-amber-600 font-medium mt-0.5">Pending payouts to disburse</span>
        </div>
      </div>

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
          <span className="text-[10px] font-mono uppercase text-gray-400">Status:</span>
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
              <tr className="border-b border-gray-100 bg-gray-50/70 text-gray-500 uppercase tracking-wider text-[10px] font-mono">
                <th className="py-3 px-4">Partner</th>
                <th className="py-3 px-4">Referral Code</th>
                <th className="py-3 px-4">Tier / Rate</th>
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
                  <td colSpan={9} className="py-12 text-center text-gray-400">
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

                      <td className="py-3.5 px-4 font-mono font-bold text-gray-700">
                        {partner.referralCode}
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleToggleCommissionRate(partner); }}
                          title="Click to toggle between 10% Standard and 15% VIP"
                          className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold cursor-pointer transition-all ${
                            partner.commissionRate >= 0.15
                              ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {Math.round((partner.commissionRate || 0.10) * 100)}% {partner.commissionRate >= 0.15 ? 'VIP' : 'Std'}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-semibold text-gray-900">
                        ₹{(store.partnerReferrals
                          .filter(r => r.partnerId === partner.id)
                          .reduce((sum, r) => sum + (r.totalPaid || 0), 0)
                        ).toLocaleString('en-IN')}
                        <span className="text-[10px] text-gray-400 block">{referralsCount} deals</span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-gray-900 font-bold">
                        ₹{partner.totalEarnings.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-gray-600">
                        ₹{partner.paidEarnings.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold">
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
                          <button
                            onClick={() => setSelectedPartner(partner)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
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

                {/* Partner Coordinates */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-gray-50 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-gray-400 block">Referral Code</span>
                    <strong className="text-gray-900">{selectedPartner.referralCode}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block">Commission Rate</span>
                    <strong className="text-gray-900">{Math.round((selectedPartner.commissionRate || 0.10) * 100)}%</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block">Payout Method</span>
                    <strong className="text-gray-900">{selectedPartner.payoutMethod}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block">Balance Ready</span>
                    <strong className="text-amber-600">
                      ₹{Math.max(0, selectedPartner.totalEarnings - selectedPartner.paidEarnings).toLocaleString('en-IN')}
                    </strong>
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
                    <div className="flex items-center gap-2 text-gray-900 font-mono">
                      <CreditCard size={14} /> <span>UPI ID: {selectedPartner.payoutDetails.upiId}</span>
                    </div>
                  )}
                </div>

                {/* Referred Clients & Live Payment Tracking Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-900 uppercase font-mono tracking-wider">
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

                            <div className="flex justify-between text-[11px] font-mono text-gray-600">
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
                  <h3 className="text-sm font-bold text-gray-900 uppercase font-mono tracking-wider">
                    Disbursed Payouts ({selectedPartnerPayouts.length})
                  </h3>
                  {selectedPartnerPayouts.length === 0 ? (
                    <div className="text-center py-6 text-gray-400 text-xs bg-gray-50 rounded-2xl">
                      No payouts disbursed yet.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedPartnerPayouts.map(p => (
                        <div key={p.id} className="p-3 rounded-xl bg-gray-50 border border-gray-200/80 flex items-center justify-between text-xs font-mono">
                          <div>
                            <span className="text-gray-900 font-bold">₹{p.amount.toLocaleString('en-IN')}</span>
                            <span className="text-gray-400 text-[10px] block">{p.payoutDate} via {p.paymentMethod}</span>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold">
                            {p.transactionRef || 'Completed'}
                          </span>
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
                  <label className="text-[10px] font-mono uppercase text-gray-600 block mb-1">Partner Full Name *</label>
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
                  <label className="text-[10px] font-mono uppercase text-gray-600 block mb-1">Email *</label>
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
                    <label className="text-[10px] font-mono uppercase text-gray-600 block mb-1">Agency / Company</label>
                    <input
                      type="text"
                      value={addCompany}
                      onChange={(e) => setAddCompany(e.target.value)}
                      placeholder="Vance Media"
                      className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase text-gray-600 block mb-1">Phone</label>
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
                    <label className="text-[10px] font-mono uppercase text-gray-600 block mb-1">Commission Rate</label>
                    <select
                      value={addCommissionRate}
                      onChange={(e) => setAddCommissionRate(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-black"
                    >
                      <option value="0.10">10% Standard</option>
                      <option value="0.15">15% VIP Tier</option>
                      <option value="0.20">20% Strategic</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-gray-600 block mb-1">Payout Method</label>
                    <select
                      value={addPayoutMethod}
                      onChange={(e) => setAddPayoutMethod(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-black"
                    >
                      <option value="UPI">UPI</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="PayPal">PayPal</option>
                    </select>
                  </div>
                </div>

                {addPayoutMethod === 'UPI' && (
                  <div>
                    <label className="text-[10px] font-mono uppercase text-gray-600 block mb-1">UPI ID</label>
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
                  <label className="text-[10px] font-mono uppercase text-gray-600 block mb-1">Payout Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-black font-mono font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-gray-600 block mb-1">Payment Method</label>
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
                    <label className="text-[10px] font-mono uppercase text-gray-600 block mb-1">UTR / Ref Number</label>
                    <input
                      type="text"
                      value={payoutTxRef}
                      onChange={(e) => setPayoutTxRef(e.target.value)}
                      placeholder="e.g. UTR-491028"
                      className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-black font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-gray-600 block mb-1">Disbursement Notes</label>
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
    </div>
  );
};
