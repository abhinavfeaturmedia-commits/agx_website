import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck, FileText, CheckCircle2, XCircle, Download, X,
  AlertCircle, Scale, ChevronDown, ChevronUp, Sparkles, HelpCircle,
  Check, Zap, DollarSign, Briefcase, Info, Lock
} from 'lucide-react';
import { Partner } from '../../types/crm';
import {
  PARTNER_AGREEMENT_VERSION,
  PARTNER_AGREEMENT_EFFECTIVE_DATE,
  PARTNER_AGREEMENT_CLAUSES,
  generatePrintableAgreementText
} from '../../lib/partnerLegalAgreement';

interface PartnerTermsModalProps {
  partner: Partner;
  isOpen: boolean;
  isMandatory?: boolean; // When true, modal CANNOT be closed until accepted
  alreadyAccepted?: boolean;
  onAccept: (data: { acceptedAt: string; version: string }) => void;
  onClose?: () => void;
}

export const PartnerTermsModal: React.FC<PartnerTermsModalProps> = ({
  partner,
  isOpen,
  isMandatory = false,
  alreadyAccepted = false,
  onAccept,
  onClose
}) => {
  const [viewMode, setViewMode] = useState<'EASY' | 'LEGAL'>('EASY');
  const [isChecked, setIsChecked] = useState(alreadyAccepted);
  const [activeClauseFilter, setActiveClauseFilter] = useState<number | 'ALL'>('ALL');
  const [expandedLegalClauses, setExpandedLegalClauses] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const toggleLegalExpand = (clauseId: string) => {
    setExpandedLegalClauses(prev => ({
      ...prev,
      [clauseId]: !prev[clauseId]
    }));
  };

  const handleDownloadAgreement = () => {
    const text = generatePrintableAgreementText({
      partnerName: partner.name,
      partnerCompany: partner.company,
      partnerEmail: partner.email,
      referralCode: partner.referralCode,
      acceptanceDate: partner.termsAcceptedAt || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      version: partner.termsVersion || PARTNER_AGREEMENT_VERSION
    });

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AGX-Partner-Agreement-${partner.referralCode}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSubmitAcceptance = async () => {
    if (!isChecked || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const now = new Date().toISOString();
      await onAccept({
        acceptedAt: now,
        version: PARTNER_AGREEMENT_VERSION
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const visibleClauses = activeClauseFilter === 'ALL'
    ? PARTNER_AGREEMENT_CLAUSES
    : PARTNER_AGREEMENT_CLAUSES.filter(c => c.number === activeClauseFilter);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 md:p-8 bg-black/85 backdrop-blur-xl animate-fade-in overflow-hidden">
      <div 
        className="relative w-full max-w-4xl max-h-[94vh] flex flex-col bg-[#0C0F17] text-white rounded-3xl border border-white/15 shadow-[0_25px_80px_rgba(0,0,0,0.9)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="p-5 sm:p-6 pb-4 border-b border-white/10 bg-gradient-to-r from-white/[0.04] to-transparent shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#CCFF00]/10 border border-[#CCFF00]/30 flex items-center justify-center text-[#CCFF00] shrink-0 shadow-lg shadow-[#CCFF00]/10">
                <Scale size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#CCFF00] px-2 py-0.5 rounded-md bg-[#CCFF00]/10 border border-[#CCFF00]/20">
                    Partner Terms &amp; Agreement • Republic of India
                  </span>
                  <span className="text-[10px] font-mono text-white/50">v{PARTNER_AGREEMENT_VERSION}</span>
                </div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white mt-1 tracking-tight">
                  AGX Partner Program Agreement
                </h2>
                <p className="text-xs text-white/60 mt-0.5">
                  Clear, honest, and enforceable under Indian laws (Contract Act 1872, IT Act 2000, Income Tax TDS, &amp; DPDP 2023).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleDownloadAgreement}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white/80 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
                title="Download agreement copy with plain-English summary"
              >
                <Download size={13} />
                <span>Save TXT</span>
              </button>
              {!isMandatory && onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Close modal"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Quick-Glance 4-Pillar Highlights */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#CCFF00] uppercase font-bold">
                <Briefcase size={12} />
                <span>Zero Quotas</span>
              </div>
              <p className="text-xs font-bold text-white mt-0.5">Work Independently</p>
              <span className="text-[10px] text-white/50 block">No bosses, no minimums</span>
            </div>

            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 uppercase font-bold">
                <DollarSign size={12} />
                <span>10% to 25% Share</span>
              </div>
              <p className="text-xs font-bold text-white mt-0.5">Performance Pay</p>
              <span className="text-[10px] text-white/50 block">Upgrades apply retroactively</span>
            </div>

            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-sky-400 uppercase font-bold">
                <Zap size={12} />
                <span>40 / 30 / 30 Plan</span>
              </div>
              <p className="text-xs font-bold text-white mt-0.5">Milestone Payouts</p>
              <span className="text-[10px] text-white/50 block">Direct UPI / Bank Transfer</span>
            </div>

            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-purple-400 uppercase font-bold">
                <ShieldCheck size={12} />
                <span>Govt. Tax Compliant</span>
              </div>
              <p className="text-xs font-bold text-white mt-0.5">5% TDS + Form 16A</p>
              <span className="text-[10px] text-white/50 block">Full ITR tax credit</span>
            </div>
          </div>

          {/* Mode Switcher + Jump Filter */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/10">
            {/* View Mode Switcher */}
            <div className="inline-flex p-1 rounded-xl bg-white/5 border border-white/10 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setViewMode('EASY')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'EASY'
                    ? 'bg-[#CCFF00] text-black shadow-md shadow-[#CCFF00]/20'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Sparkles size={13} />
                <span>Plain-English Guide (Recommended)</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('LEGAL')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'LEGAL'
                    ? 'bg-white text-black shadow-md'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <FileText size={13} />
                <span>Official Legal Contract</span>
              </button>
            </div>

            {/* Quick Clause Jump Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-[11px] font-mono">
              <span className="text-white/40 text-[10px] uppercase font-bold shrink-0 mr-1">Filter:</span>
              <button
                type="button"
                onClick={() => setActiveClauseFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg transition-colors shrink-0 cursor-pointer ${
                  activeClauseFilter === 'ALL'
                    ? 'bg-white/20 text-white font-bold'
                    : 'bg-white/5 text-white/60 hover:text-white'
                }`}
              >
                All 10
              </button>
              {PARTNER_AGREEMENT_CLAUSES.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveClauseFilter(c.number)}
                  className={`px-2 py-1 rounded-lg transition-colors shrink-0 cursor-pointer ${
                    activeClauseFilter === c.number
                      ? 'bg-[#CCFF00] text-black font-bold'
                      : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                  title={c.title}
                >
                  Cl. {c.number}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scrollable Terms Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 md:p-8 space-y-6 text-sm text-white/80 leading-relaxed font-sans custom-scrollbar">
          {viewMode === 'EASY' ? (
            /* =========================================================================
               LAYER 1: PLAIN-ENGLISH EASY GUIDE
               ========================================================================= */
            <div className="space-y-6">
              <div className="p-3.5 rounded-2xl bg-[#CCFF00]/[0.05] border border-[#CCFF00]/20 flex items-start gap-3">
                <Sparkles size={18} className="text-[#CCFF00] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-white">
                    We believe agreements should be simple, transparent, and easy to understand.
                  </p>
                  <p className="text-white/60 mt-0.5">
                    Below is every clause explained in everyday language with real numbers, practical examples, and clear do&apos;s and don&apos;ts. Click the arrow at any time to peek at the formal statutory text.
                  </p>
                </div>
              </div>

              {visibleClauses.map((clause) => {
                const isLegalOpen = !!expandedLegalClauses[clause.id];
                return (
                  <div 
                    key={clause.id}
                    className="p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all space-y-4"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[#CCFF00] font-mono font-bold text-xs flex items-center justify-center shrink-0">
                          {clause.number}
                        </span>
                        <div>
                          <h3 className="font-bold text-base text-white tracking-tight">
                            {clause.title}
                          </h3>
                          <span className="text-[11px] font-mono text-[#CCFF00] block mt-0.5">
                            {clause.shortLabel}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-white/40 bg-white/5 px-2.5 py-1 rounded-md border border-white/5 self-start sm:self-auto">
                        {clause.statutoryReference}
                      </span>
                    </div>

                    {/* What This Means For You (Key Takeaway) */}
                    <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10">
                      <span className="text-[10px] font-mono uppercase font-bold text-[#CCFF00] tracking-wider block mb-1">
                        💡 In Plain Words (What this means for you):
                      </span>
                      <p className="text-xs sm:text-sm text-white font-medium leading-relaxed">
                        {clause.keyTakeaway}
                      </p>
                    </div>

                    {/* Real-World Practical Example */}
                    <div className="p-3.5 rounded-xl bg-amber-500/[0.05] border border-amber-500/20 text-xs space-y-1">
                      <span className="text-[10px] font-mono uppercase font-bold text-amber-400 tracking-wider flex items-center gap-1.5">
                        <span>📌 Real-World Example:</span>
                      </span>
                      <p className="text-white/80 leading-relaxed font-sans">
                        {clause.realWorldExample}
                      </p>
                    </div>

                    {/* Do's and Don'ts Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      {/* What you CAN do */}
                      <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-2">
                        <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 size={13} />
                          <span>What is Encouraged &amp; Allowed:</span>
                        </span>
                        <ul className="space-y-1.5 text-xs text-white/80">
                          {clause.doItems.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <Check size={12} className="text-emerald-400 shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* What you CANNOT do */}
                      <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/20 space-y-2">
                        <span className="text-[10px] font-mono uppercase font-bold text-rose-400 flex items-center gap-1.5">
                          <XCircle size={13} />
                          <span>What is Not Allowed:</span>
                        </span>
                        <ul className="space-y-1.5 text-xs text-white/80">
                          {clause.dontItems.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <X size={12} className="text-rose-400 shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Expandable Statutory Legal Text Toggle */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => toggleLegalExpand(clause.id)}
                        className="text-[11px] font-mono text-white/50 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {isLegalOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        <span>{isLegalOpen ? 'Hide' : 'Peek'} formal legal clause text under Indian Law</span>
                      </button>

                      <AnimatePresence>
                        {isLegalOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden mt-3"
                          >
                            <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-xs text-white/60 font-mono whitespace-pre-line leading-relaxed">
                              {clause.fullText}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* =========================================================================
               LAYER 2: FULL STATUTORY LEGAL CONTRACT
               ========================================================================= */
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-white/70 leading-relaxed font-sans">
                <p className="font-bold text-white mb-1">
                  Republic of India • Formal Legal Contract
                </p>
                <p>
                  This constitutes the complete operative text governed by the Indian Contract Act (1872), Information Technology Act (2000), Income Tax Act (1961), Central Goods and Services Tax Act (2017), Digital Personal Data Protection Act (2023), and Arbitration and Conciliation Act (1996).
                </p>
              </div>

              {visibleClauses.map((clause) => (
                <div 
                  key={clause.id}
                  className="p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-colors space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-white/10 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                        {clause.number}
                      </span>
                      <h3 className="font-bold text-base text-white tracking-tight">
                        {clause.title}
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono text-white/50 bg-white/5 px-2.5 py-1 rounded-md border border-white/5 self-start sm:self-auto">
                      {clause.statutoryReference}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#CCFF00]/[0.04] border border-[#CCFF00]/15 text-xs text-white/90 flex items-start gap-2.5">
                    <CheckCircle2 size={15} className="text-[#CCFF00] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#CCFF00] uppercase text-[10px] tracking-wider block font-mono">Summary Intent:</strong>
                      <span className="leading-snug">{clause.summary}</span>
                    </div>
                  </div>

                  <div className="text-xs text-white/70 whitespace-pre-line leading-relaxed font-mono bg-black/30 p-4 rounded-xl border border-white/5">
                    {clause.fullText}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Electronic Signature Notice Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 text-xs space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] font-mono flex items-center gap-2">
              <Lock size={13} className="text-[#CCFF00]" />
              <span>Electronic Signature &amp; Legal Enforceability (Section 10A, IT Act 2000)</span>
            </h4>
            <p className="text-white/60 leading-relaxed font-sans">
              By checking the consent box below and clicking <strong>&quot;Accept Agreement &amp; Enter Dashboard&quot;</strong>, you confirm that you have read and understood these terms. Pursuant to <strong>Section 10A of the Information Technology Act, 2000</strong>, your digital acceptance forms a legally valid and binding contract under Indian law, having the same standing as a physical handwritten signature.
            </p>
          </div>
        </div>

        {/* Footer Actions & Acceptance Box */}
        <div className="p-5 sm:p-6 pt-4 border-t border-white/10 bg-[#0A0D14] shrink-0 space-y-4">
          {alreadyAccepted ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-xs">
              <div className="flex items-center gap-2.5 text-emerald-400">
                <ShieldCheck size={18} />
                <span>
                  <strong>Agreement Signed &amp; Active.</strong> Certified on {partner.termsAcceptedAt || 'Active Session'}.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadAgreement}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Download size={13} />
                  <span>Download Copy</span>
                </button>
                {onClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-1.5 rounded-xl bg-white text-black font-extrabold text-xs hover:bg-white/90 transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3.5">
              {/* Checkbox */}
              <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-colors cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => setIsChecked(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded accent-[#CCFF00] cursor-pointer shrink-0"
                />
                <span className="text-xs text-white/90 leading-relaxed font-sans">
                  I, <strong className="text-white">{partner.name}</strong>, hereby declare that I have reviewed, understood, and accept the <strong>AGX Partner Program Agreement, Commission Terms, and Professional Code of Conduct</strong> under the laws of the Republic of India.
                </span>
              </label>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-[11px] text-white/40 text-center sm:text-left">
                  {isMandatory 
                    ? '⚠️ Mandatory Step: Please review and accept to unlock your Partner Dashboard.' 
                    : 'You can review or print this agreement anytime from Settings.'}
                </span>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleSubmitAcceptance}
                    disabled={!isChecked || isSubmitting}
                    className={`flex-1 sm:flex-none px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl ${
                      isChecked && !isSubmitting
                        ? 'bg-[#CCFF00] hover:bg-[#b8e600] text-black cursor-pointer shadow-[#CCFF00]/20 hover:scale-[1.02] active:scale-95'
                        : 'bg-white/10 text-white/40 cursor-not-allowed border border-white/5'
                    }`}
                  >
                    <ShieldCheck size={16} />
                    <span>{isSubmitting ? 'Recording Acceptance...' : 'Accept Agreement & Enter Dashboard →'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
