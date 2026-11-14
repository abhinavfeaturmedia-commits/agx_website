import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Building, Phone, Mail, MapPin, Calendar, Clock, ShieldCheck,
  CheckCircle2, AlertCircle, Trash2, ExternalLink, MessageSquare,
  IndianRupee, Layers, FileText, Sparkles, ArrowRight, Save, User,
  TrendingUp, CheckSquare, Briefcase, ChevronRight, DollarSign, Send,
  Lock, FileCheck, Check
} from 'lucide-react';
import {
  PartnerReferral, LeadStageSop, LEAD_STAGES_SOP,
  AgxProductCategory, AGX_PRODUCT_CATEGORIES,
  CLIENT_BUDGET_OPTIONS
} from '../../../types/crm';
import { toast } from '../../../lib/toastStore';
import { CustomSelect } from '../../ui/CustomSelect';

interface ManageProspectModalProps {
  referral: PartnerReferral;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (referralId: string, updates: Partial<PartnerReferral>) => void;
  onDelete: (referralId: string) => void;
  onOpenQualifyModal: (referral: PartnerReferral) => void;
  onOpenDemoModal: (referral: PartnerReferral) => void;
  partnerRate: number;
}

type ModalTab = 'details' | 'funnel' | 'financials' | 'qualification';

export const ManageProspectModal: React.FC<ManageProspectModalProps> = ({
  referral,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  onOpenQualifyModal,
  onOpenDemoModal,
  partnerRate
}) => {
  const [activeTab, setActiveTab] = useState<ModalTab>('details');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Form states
  const [clientName, setClientName] = useState(referral.clientName || '');
  const [company, setCompany] = useState(referral.company || '');
  const [clientPhone, setClientPhone] = useState(referral.clientPhone || '');
  const [clientEmail, setClientEmail] = useState(referral.clientEmail || '');
  const [city, setCity] = useState(referral.city || '');
  
  const [productCategory, setProductCategory] = useState<AgxProductCategory>(
    referral.productCategory || 'AI Automation Workflow'
  );
  const [budgetRange, setBudgetRange] = useState<string>(
    referral.budgetRange || (referral.dealValue ? 'Custom Specific Budget' : 'To be determined (After Call & Quotation)')
  );
  const [customBudgetAmount, setCustomBudgetAmount] = useState<string>(
    referral.dealValue ? String(referral.dealValue) : ''
  );
  const [problemIdentified, setProblemIdentified] = useState(referral.problemIdentified || '');
  const [currentProcess, setCurrentProcess] = useState(referral.currentProcess || 'Excel Sheets & WhatsApp');

  const [sopStage, setSopStage] = useState<LeadStageSop>(
    referral.sopStage || (referral.dealStatus === 'WON' ? 'Won — Advance Received' : 'Prospect Identified')
  );
  const [dealStatus, setDealStatus] = useState(referral.dealStatus || 'NEW');
  const [nextAction, setNextAction] = useState(referral.nextAction || '');
  const [nextFollowUpDate, setNextFollowUpDate] = useState(referral.nextFollowUpDate || '');
  const [followUpCadenceDay, setFollowUpCadenceDay] = useState(referral.followUpCadenceDay || 1);
  const [notes, setNotes] = useState(referral.notes || '');

  // Financial values (Governed exclusively by AGX Corporate Finance — Read-Only for Partner)
  const dealValue = referral.dealValue || 0;
  const cashCollectedAmount = referral.cashCollectedAmount ?? referral.totalPaid ?? 0;

  // UTR / Client Payment Report State
  const [showUtrForm, setShowUtrForm] = useState(false);
  const [utrAmount, setUtrAmount] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [utrDate, setUtrDate] = useState(new Date().toISOString().split('T')[0]);
  const [utrBankNotes, setUtrBankNotes] = useState('');

  if (!isOpen) return null;

  // Calculation helpers (Strict Read-Only)
  const effectiveRate = referral.commissionRate || partnerRate || 0.10;
  const pendingPayment = Math.max(0, dealValue - cashCollectedAmount);
  const commissionEarned = Math.round(cashCollectedAmount * effectiveRate);
  const potentialTotalCommission = Math.round(dealValue * effectiveRate);

  const cleanPhone = clientPhone.replace(/\D/g, '');
  const stageMeta = LEAD_STAGES_SOP.find(s => s.stage === sopStage) || LEAD_STAGES_SOP[0];
  const isQualified = Boolean(referral.qualification?.isQualified);

  const handleStageChange = (newStage: LeadStageSop) => {
    setSopStage(newStage);
    if (newStage === 'Won — Advance Received') {
      setDealStatus('WON');
    } else if (newStage === 'Lost') {
      setDealStatus('LOST');
    } else if (newStage === 'Qualified') {
      setDealStatus('QUALIFIED');
    } else if (['Demo Scheduled', 'Demo Completed', 'Proposal Requested', 'Proposal Sent', 'Negotiation / Decision Pending'].includes(newStage)) {
      if (dealStatus === 'NEW') setDealStatus('CONTACTED');
    }
  };

  const handleSubmitUtrReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrAmount || Number(utrAmount) <= 0) {
      toast.warning('Amount Required', 'Please enter the transferred amount in Rupees.');
      return;
    }
    if (!utrNumber.trim()) {
      toast.warning('UTR / Reference Required', 'Please provide the bank UTR or payment reference number.');
      return;
    }

    const claimText = `\n[CLIENT PAYMENT REPORT - ${new Date().toLocaleDateString('en-IN')}]: Transferred ₹${Number(utrAmount).toLocaleString('en-IN')} | Ref/UTR: ${utrNumber.trim()} | Date: ${utrDate}${utrBankNotes ? ` | Note: ${utrBankNotes.trim()}` : ''} | Awaiting AGX bank reconciliation.`;
    const updatedNotes = notes ? `${notes}\n${claimText}` : claimText;
    setNotes(updatedNotes);

    onUpdate(referral.id, {
      notes: updatedNotes,
      updatedAt: new Date().toISOString()
    });

    toast.success('Payment Report Submitted', 'AGX Corporate Accounts notified. Verified funds will reflect in cash collected automatically.');
    setShowUtrForm(false);
    setUtrAmount('');
    setUtrNumber('');
    setUtrBankNotes('');
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!clientName.trim()) {
      toast.warning('Name Required', 'Please provide a prospect contact name.');
      return;
    }

    // Save only operational & relationship fields. Financials remain governed by AGX Accounts.
    const updates: Partial<PartnerReferral> = {
      clientName: clientName.trim(),
      company: company.trim() || undefined,
      clientPhone: clientPhone.trim() || undefined,
      clientEmail: clientEmail.trim() || undefined,
      city: city.trim() || undefined,
      productCategory,
      projectType: productCategory,
      budgetRange: budgetRange === 'Custom Specific Budget' && customBudgetAmount ? `₹${Number(customBudgetAmount).toLocaleString('en-IN')}` : budgetRange,
      problemIdentified: problemIdentified.trim() || undefined,
      currentProcess: currentProcess.trim() || undefined,
      sopStage,
      dealStatus: dealStatus as any,
      nextAction: nextAction.trim() || undefined,
      nextFollowUpDate: nextFollowUpDate || undefined,
      followUpCadenceDay: Number(followUpCadenceDay) || 1,
      notes: notes.trim() || undefined,
      updatedAt: new Date().toISOString()
    };

    onUpdate(referral.id, updates);
    toast.success('Prospect Updated', `${clientName} has been updated in your 14-Stage Funnel.`);
    onClose();
  };

  const handleDelete = () => {
    onDelete(referral.id);
    toast.info('Prospect Removed', `${referral.clientName} has been deleted from your funnel.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        className="w-full max-w-3xl max-h-[92vh] flex flex-col bg-white rounded-3xl border border-gray-200 shadow-2xl overflow-hidden"
      >
        {/* TOP HEADER */}
        <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 via-white to-gray-50 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-lg text-gray-900 font-['Outfit']">
                {clientName || 'Prospect Overview'}
              </span>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${stageMeta.color}`}>
                Step {stageMeta.stepNumber}: {stageMeta.stage}
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                Status: {dealStatus}
              </span>
            </div>
            <p className="text-xs text-gray-500 flex items-center gap-1.5">
              <Building size={12} className="text-gray-400" />
              <span>{company || 'Individual Business'}</span>
              {city && <span className="text-gray-400">• {city}</span>}
              <span className="text-gray-400">• ID: {referral.id.slice(-6).toUpperCase()}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-black transition-colors cursor-pointer shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* QUICK COMMUNICATION & SOP ACTION BAR */}
        <div className="px-5 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {cleanPhone ? (
              <>
                <a
                  href={`tel:${cleanPhone}`}
                  className="px-2.5 py-1 rounded-xl bg-white hover:bg-gray-100 border border-gray-200 text-[11px] font-bold text-gray-700 flex items-center gap-1 transition-colors"
                >
                  <Phone size={11} className="text-emerald-600" /> Call
                </a>
                <a
                  href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                    `Namaste ${clientName}, this is regarding AGX solutions for ${company || 'your business'}.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-300 text-[11px] font-bold text-emerald-800 flex items-center gap-1 transition-colors"
                >
                  <MessageSquare size={11} className="text-emerald-600" /> WhatsApp
                </a>
              </>
            ) : (
              <span className="text-[10px] text-gray-400 italic">No phone number saved</span>
            )}

            {clientEmail && (
              <a
                href={`mailto:${clientEmail}`}
                className="px-2.5 py-1 rounded-xl bg-white hover:bg-gray-100 border border-gray-200 text-[11px] font-bold text-gray-700 flex items-center gap-1 transition-colors"
              >
                <Mail size={11} className="text-blue-600" /> Email
              </a>
            )}
          </div>

          {/* Quick Hand-offs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenQualifyModal(referral);
              }}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
                isQualified
                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <ShieldCheck size={11} className={isQualified ? 'text-purple-600' : 'text-gray-400'} />
              <span>{isQualified ? 'Qualified' : '6-Point Qualify'}</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenDemoModal(referral);
              }}
              className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-amber-500/10 text-amber-800 border border-amber-300 hover:bg-amber-500/20 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Calendar size={11} className="text-amber-700" />
              <span>Request Demo</span>
            </button>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex items-center px-5 border-b border-gray-100 bg-white gap-1 overflow-x-auto">
          {[
            { id: 'details', label: '1. Contact & Problem', icon: User },
            { id: 'funnel', label: '2. 14-Stage Funnel & Next Steps', icon: Layers },
            { id: 'financials', label: '3. Cash & Commission', icon: IndianRupee },
            { id: 'qualification', label: '4. Qualification & Status', icon: ShieldCheck }
          ].map(t => {
            const Icon = t.icon;
            const isSelected = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as ModalTab)}
                className={`py-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-black'
                }`}
              >
                <Icon size={13} className={isSelected ? 'text-black' : 'text-gray-400'} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB CONTENTS (Scrollable Area) */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          
          {/* TAB 1: CONTACT & PROBLEM */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">
                    Contact Person / Decision Maker *
                  </label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={e => setClientName(e.target.value)}
                    placeholder="e.g. Rajesh Kumar"
                    className="w-full px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold focus:outline-hidden focus:border-black"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">
                    Company / Firm Name
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                    placeholder="e.g. Apex Autos & Logistics"
                    className="w-full px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold focus:outline-hidden focus:border-black"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">
                    Phone / WhatsApp Number
                  </label>
                  <input
                    type="text"
                    value={clientPhone}
                    onChange={e => setClientPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold focus:outline-hidden focus:border-black"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={e => setClientEmail(e.target.value)}
                    placeholder="e.g. rajesh@apexautos.in"
                    className="w-full px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold focus:outline-hidden focus:border-black"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">
                    City / Operating Location
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="e.g. Pune, Maharashtra"
                    className="w-full px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold focus:outline-hidden focus:border-black"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">
                      Product Category Match
                    </label>
                    <CustomSelect
                      value={productCategory}
                      onChange={val => setProductCategory(val as AgxProductCategory)}
                      options={AGX_PRODUCT_CATEGORIES.map(p => ({
                        value: p.id,
                        label: p.name,
                        description: p.tagline
                      }))}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">
                      Client Budget Expectation
                    </label>
                    <CustomSelect
                      value={budgetRange}
                      onChange={val => setBudgetRange(val)}
                      options={CLIENT_BUDGET_OPTIONS.map(opt => ({
                        value: opt,
                        label: opt
                      }))}
                    />
                  </div>
                </div>

                {budgetRange === 'Custom Specific Budget' && (
                  <div>
                    <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">
                      Specific Estimated Budget (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">₹</span>
                      <input
                        type="number"
                        min={0}
                        value={customBudgetAmount}
                        onChange={e => setCustomBudgetAmount(e.target.value)}
                        placeholder="e.g. 75000"
                        className="w-full pl-7 pr-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-mono font-bold focus:outline-hidden focus:border-black"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">
                    Identified Operational Problem / Bottleneck
                  </label>
                  <textarea
                    rows={2}
                    value={problemIdentified}
                    onChange={e => setProblemIdentified(e.target.value)}
                    placeholder="What specific operational headache or revenue loss is this client experiencing today?"
                    className="w-full px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold focus:outline-hidden focus:border-black"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">
                    Current Process in Place
                  </label>
                  <input
                    type="text"
                    value={currentProcess}
                    onChange={e => setCurrentProcess(e.target.value)}
                    placeholder="e.g. Excel Spreadsheets, WhatsApp groups, Manual physical ledgers"
                    className="w-full px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold focus:outline-hidden focus:border-black"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 14-STAGE FUNNEL & NEXT STEPS */}
          {activeTab === 'funnel' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-2xl border border-gray-200 space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold uppercase text-gray-600 block">
                      Current SOP Stage (1 to 14)
                    </label>
                    <span className="text-[10px] font-mono text-gray-500 font-bold">
                      Category: {stageMeta.category.toUpperCase()}
                    </span>
                  </div>
                  <CustomSelect
                    value={sopStage}
                    onChange={val => handleStageChange(val as LeadStageSop)}
                    options={LEAD_STAGES_SOP.map(s => ({
                      value: s.stage,
                      label: `Step ${s.stepNumber}: ${s.stage}`,
                      badge: s.category.toUpperCase(),
                      badgeColor: s.color,
                      description: s.description
                    }))}
                  />
                  <p className="text-[11px] text-gray-500 mt-1 italic">
                    ℹ️ {stageMeta.description}
                  </p>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-gray-600 block mb-1">
                    Overall Deal Status
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL SENT', 'WON', 'IN PROGRESS', 'COMPLETED', 'LOST'] as const).map(status => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setDealStatus(status)}
                        className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold border transition-colors cursor-pointer text-center ${
                          dealStatus === status
                            ? 'bg-black text-white border-black shadow-xs'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Follow-up & Cadence */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2 border-t border-gray-100">
                <div>
                  <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">
                    Next Action Required
                  </label>
                  <input
                    type="text"
                    value={nextAction}
                    onChange={e => setNextAction(e.target.value)}
                    placeholder="e.g. Call founder Rajesh at 3:30 PM with proposal scope"
                    className="w-full px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold focus:outline-hidden focus:border-black"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">
                    Next Follow-up Date
                  </label>
                  <input
                    type="date"
                    value={nextFollowUpDate}
                    onChange={e => setNextFollowUpDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold focus:outline-hidden focus:border-black"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">
                    SOP Cadence Day
                  </label>
                  <CustomSelect
                    value={String(followUpCadenceDay)}
                    onChange={val => setFollowUpCadenceDay(Number(val))}
                    options={[
                      { value: '1', label: 'Day 1: Discovery / First Contact' },
                      { value: '3', label: 'Day 3: Second Touch / Follow-up' },
                      { value: '7', label: 'Day 7: Demo Preparation' },
                      { value: '10', label: 'Day 10: Proposal Discussion' },
                      { value: '14', label: 'Day 14: Closing & Advance Check' },
                      { value: '30', label: 'Day 30: Nurture Cadence' }
                    ]}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">
                    Partner Activity & Discovery Notes
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Record meeting outcomes, specific client concerns, team structure, or customized requirements..."
                    className="w-full px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold focus:outline-hidden focus:border-black"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CASH & COMMISSION (Strict Read-Only for Partner) */}
          {activeTab === 'financials' && (
            <div className="space-y-4">
              
              {/* Financial Dashboard Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200">
                  <span className="text-[10px] font-bold uppercase text-gray-500 block">Agreed Deal Value</span>
                  <span className="text-base font-extrabold text-gray-900 font-mono block mt-1">
                    {dealValue > 0 ? `₹${dealValue.toLocaleString('en-IN')}` : 'Quotation Pending'}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium block">
                    {dealValue > 0
                      ? `Potential Comm: ₹${potentialTotalCommission.toLocaleString('en-IN')} (${Math.round(effectiveRate * 100)}%)`
                      : `Budget: ${referral.budgetRange || budgetRange || 'Determined after scope'}`}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] font-bold uppercase text-emerald-700 block">Cash Collected so far</span>
                  <span className="text-base font-extrabold text-emerald-900 font-mono block mt-1">
                    ₹{cashCollectedAmount.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold block">
                    Earned: ₹{commissionEarned.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
                  <span className="text-[10px] font-bold uppercase text-amber-700 block">Balance Pending</span>
                  <span className="text-base font-extrabold text-amber-900 font-mono block mt-1">
                    ₹{pendingPayment.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-amber-700 font-medium block">
                    {pendingPayment === 0 && dealValue > 0 ? 'Fully Paid & Cleared' : 'Awaiting collection'}
                  </span>
                </div>
              </div>

              {/* READ-ONLY VERIFIED FINANCIAL AUDIT BOX */}
              <div className="p-4 rounded-2xl border border-gray-200 bg-white space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700">
                      <Lock size={14} />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider font-['Outfit']">
                        Verified Financial Record
                      </h4>
                      <p className="text-[10px] text-gray-400">
                        Governed by AGX Corporate Finance • Read-Only View
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 border border-gray-200 text-[10px] font-extrabold text-gray-600 font-mono">
                    <Lock size={10} className="text-gray-500" />
                    Audit Locked
                  </span>
                </div>

                {/* Read-Only Ledger Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-gray-400 block">
                      Contractual Deal Value
                    </span>
                    <span className="text-sm font-extrabold text-gray-900 font-mono block">
                      {dealValue > 0 ? `₹${dealValue.toLocaleString('en-IN')}` : 'Quotation / Invoice Pending'}
                    </span>
                    <span className="text-[10px] text-gray-500 block">
                      {dealValue > 0
                        ? 'Official commercial scope agreed with client'
                        : `Client Budget: ${referral.budgetRange || budgetRange || 'To be decided after call'}`}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-emerald-800 block">
                        Verified Cash In Bank
                      </span>
                      {cashCollectedAmount > 0 && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 flex items-center gap-0.5">
                          <Check size={9} /> Verified
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-extrabold text-emerald-900 font-mono block">
                      ₹{cashCollectedAmount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-emerald-700 block">
                      Cleared deposit in AGX corporate account
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-gray-400 block">
                      Outstanding Remittance
                    </span>
                    <span className="text-sm font-extrabold text-gray-900 font-mono block">
                      ₹{pendingPayment.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-gray-500 block">
                      Remaining payment schedule
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-purple-800 block">
                      Partner Commission Unlocked ({Math.round(effectiveRate * 100)}%)
                    </span>
                    <span className="text-sm font-extrabold text-purple-900 font-mono block">
                      ₹{commissionEarned.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-purple-700 block">
                      Payable against verified cash received
                    </span>
                  </div>
                </div>

                {/* Progress bar of cash collected */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-gray-500">Collection & Commission Release</span>
                    <span className="font-mono text-gray-900">
                      {dealValue > 0 ? Math.min(100, Math.round((cashCollectedAmount / dealValue) * 100)) : 0}% collected
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${dealValue > 0 ? Math.min(100, Math.round((cashCollectedAmount / dealValue) * 100)) : 0}%`
                      }}
                    />
                  </div>
                </div>

                {/* SOP Payout Policy Banner */}
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                  <AlertCircle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">AGX Financial Governance:</span> Deal values and cash collections are verified and updated exclusively by <strong>AGX Corporate Finance</strong> upon bank statement reconciliation.
                  </div>
                </div>
              </div>

              {/* REPORT CLIENT TRANSFER / SUBMIT UTR WORKFLOW */}
              <div className="p-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-extrabold text-gray-900">
                      Did the client make a payment?
                    </h5>
                    <p className="text-[11px] text-gray-500">
                      Report the transaction reference or UTR so AGX Accounts can verify and update cash received.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowUtrForm(!showUtrForm)}
                    className="px-3 py-1.5 rounded-xl bg-black text-white hover:bg-gray-800 text-[11px] font-bold transition-colors cursor-pointer shrink-0"
                  >
                    {showUtrForm ? 'Close Form' : '+ Report Payment (UTR)'}
                  </button>
                </div>

                {showUtrForm && (
                  <form onSubmit={handleSubmitUtrReport} className="pt-3 border-t border-gray-200/60 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">
                          Amount Transferred (₹) *
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={utrAmount}
                          onChange={e => setUtrAmount(e.target.value)}
                          placeholder="e.g. 50000"
                          className="w-full px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-mono font-bold focus:outline-hidden focus:border-black"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">
                          Bank UTR / Reference No. *
                        </label>
                        <input
                          type="text"
                          value={utrNumber}
                          onChange={e => setUtrNumber(e.target.value)}
                          placeholder="e.g. UTR / UPI / IMPS Ref"
                          className="w-full px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-mono font-semibold focus:outline-hidden focus:border-black"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">
                          Transfer Date
                        </label>
                        <input
                          type="date"
                          value={utrDate}
                          onChange={e => setUtrDate(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-semibold focus:outline-hidden focus:border-black"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">
                          Payment Remarks (Payer name / Bank)
                        </label>
                        <input
                          type="text"
                          value={utrBankNotes}
                          onChange={e => setUtrBankNotes(e.target.value)}
                          placeholder="e.g. Paid via HDFC current account of Apex Enterprises"
                          className="w-full px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-semibold focus:outline-hidden focus:border-black"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowUtrForm(false)}
                        className="px-3 py-1.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Send size={11} />
                        <span>Submit for Verification</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>

            </div>
          )}

          {/* TAB 4: QUALIFICATION & HANDOFF */}
          {activeTab === 'qualification' && (
            <div className="space-y-4">
              
              {/* 6-Point Rubric Summary */}
              <div className="p-4 rounded-2xl border border-gray-200 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={18} className={isQualified ? 'text-purple-600' : 'text-gray-400'} />
                    <span className="font-extrabold text-xs text-gray-900">
                      6-Point Qualification Rubric
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isQualified ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-gray-100 text-gray-600 border-gray-200'
                  }`}>
                    {isQualified ? 'Passed Standard' : 'Incomplete / Unqualified'}
                  </span>
                </div>

                {referral.qualification ? (
                  <div className="space-y-2 text-xs">
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 rounded-xl bg-gray-50 flex items-center justify-between">
                        <span className="text-gray-500">Target Fit:</span>
                        <span className="font-bold">{referral.qualification.targetCategoryFit ? '✅ Confirmed' : '❌ No'}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-gray-50 flex items-center justify-between">
                        <span className="text-gray-500">Decision Maker:</span>
                        <span className="font-bold">{referral.qualification.decisionMakerConfirmed ? '✅ Confirmed' : '❌ No'}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-gray-50 flex items-center justify-between">
                        <span className="text-gray-500">Willing to Evaluate:</span>
                        <span className="font-bold">{referral.qualification.willingnessToEvaluate ? '✅ Yes' : '❌ No'}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-gray-50 flex items-center justify-between">
                        <span className="text-gray-500">Timeline:</span>
                        <span className="font-bold">{referral.qualification.realisticTimeline || '15 Days'}</span>
                      </div>
                    </div>

                    {referral.qualification.identifiedProblem && (
                      <div className="p-2.5 rounded-xl bg-purple-50/50 border border-purple-100 text-[11px]">
                        <span className="font-bold text-purple-900 block mb-0.5">Documented Core Problem:</span>
                        <p className="text-purple-800">{referral.qualification.identifiedProblem}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">
                    The 6-point qualification rubric has not been completed for this prospect yet.
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenQualifyModal(referral);
                  }}
                  className="w-full py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs border border-purple-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck size={13} />
                  <span>{isQualified ? 'Review & Edit 6-Point Rubric' : 'Complete 6-Point Qualification'}</span>
                </button>
              </div>

              {/* Technical Demo Handoff */}
              <div className="p-4 rounded-2xl border border-gray-200 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-amber-600" />
                    <span className="font-extrabold text-xs text-gray-900">
                      AGX Engineering Demo Handoff
                    </span>
                  </div>
                  {referral.demoScheduledAt ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                      Scheduled
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      Not Requested
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-500">
                  Once a prospect passes qualification, submit a 30-minute demonstration request for the AGX technical solutions engineering team.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenDemoModal(referral);
                  }}
                  className="w-full py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs border border-amber-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Calendar size={13} />
                  <span>{referral.demoScheduledAt ? 'Update Demo Request' : 'Schedule AGX Demo Handoff'}</span>
                </button>
              </div>

            </div>
          )}

        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/80 flex items-center justify-between gap-3">
          {showDeleteConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-red-600">Permanently delete?</span>
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs cursor-pointer"
              >
                Yes, Delete
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-2.5 py-1.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-gray-400 hover:text-red-600 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
              title="Delete this prospect"
            >
              <Trash2 size={13} />
              <span>Delete Prospect</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white hover:bg-gray-100 text-gray-700 text-xs font-bold border border-gray-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSave()}
              className="px-5 py-2 rounded-xl bg-black hover:bg-gray-800 text-white text-xs font-extrabold shadow-md transition-all cursor-pointer flex items-center gap-1.5 btn-press"
            >
              <Save size={13} className="text-[#CCFF00]" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
};
