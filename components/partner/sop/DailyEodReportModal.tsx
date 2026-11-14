import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FileCheck, X, TrendingUp, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';
import { Partner, AgxProductCategory, AGX_PRODUCT_CATEGORIES, PartnerEodReport, PartnerEodMetrics, PartnerEodObservations } from '../../../types/crm';
import { toast } from '../../../lib/toastStore';
import { CustomSelect } from '../../ui/CustomSelect';

interface DailyEodReportModalProps {
  partner: Partner;
  existingReport?: PartnerEodReport;
  isOpen: boolean;
  onClose: () => void;
  onSubmitReport: (report: Omit<PartnerEodReport, 'id' | 'submittedAt'>) => void;
}

export const DailyEodReportModal: React.FC<DailyEodReportModalProps> = ({
  partner,
  existingReport,
  isOpen,
  onClose,
  onSubmitReport
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState<string>(existingReport?.date || todayStr);
  const [city, setCity] = useState<string>(existingReport?.city || '');
  const [primaryCategory, setPrimaryCategory] = useState<AgxProductCategory>(
    existingReport?.primaryCategory || partner.primaryProductFocus || 'Pre-owned Car CRM'
  );
  const [secondaryCategory, setSecondaryCategory] = useState<AgxProductCategory>(
    existingReport?.secondaryCategory || partner.secondaryProductFocus || 'Car Rental CRM / GaadiDesk'
  );

  // Metrics
  const [researched, setResearched] = useState<number>(existingReport?.metrics.researched ?? 25);
  const [contactAttempts, setContactAttempts] = useState<number>(existingReport?.metrics.contactAttempts ?? 25);
  const [meaningfulConversations, setMeaningfulConversations] = useState<number>(existingReport?.metrics.meaningfulConversations ?? 5);
  const [decisionMakersReached, setDecisionMakersReached] = useState<number>(existingReport?.metrics.decisionMakersReached ?? 3);
  const [qualifiedProspects, setQualifiedProspects] = useState<number>(existingReport?.metrics.qualifiedProspects ?? 2);
  const [demosBooked, setDemosBooked] = useState<number>(existingReport?.metrics.demosBooked ?? 1);
  const [demosCompleted, setDemosCompleted] = useState<number>(existingReport?.metrics.demosCompleted ?? 0);
  const [proposalsRequested, setProposalsRequested] = useState<number>(existingReport?.metrics.proposalsRequested ?? 0);
  const [followUpsCompleted, setFollowUpsCompleted] = useState<number>(existingReport?.metrics.followUpsCompleted ?? 10);
  const [dealsWon, setDealsWon] = useState<number>(existingReport?.metrics.dealsWon ?? 0);
  const [cashCollected, setCashCollected] = useState<number>(existingReport?.metrics.cashCollected ?? 0);

  // Observations (5 SOP Questions)
  const [bestIndustry, setBestIndustry] = useState<string>(existingReport?.observations.bestIndustry || '');
  const [commonObjections, setCommonObjections] = useState<string>(existingReport?.observations.commonObjections || '');
  const [supportNeeded, setSupportNeeded] = useState<string>(existingReport?.observations.supportNeeded || '');
  const [blockers, setBlockers] = useState<string>(existingReport?.observations.blockers || '');
  const [tomorrowPriority, setTomorrowPriority] = useState<string>(existingReport?.observations.tomorrowPriority || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!tomorrowPriority.trim()) {
      toast.warning('Priority Required', 'Please fill tomorrow\'s priority in the daily observations.');
      return;
    }

    const metrics: PartnerEodMetrics = {
      researched: Number(researched) || 0,
      contactAttempts: Number(contactAttempts) || 0,
      meaningfulConversations: Number(meaningfulConversations) || 0,
      decisionMakersReached: Number(decisionMakersReached) || 0,
      qualifiedProspects: Number(qualifiedProspects) || 0,
      demosBooked: Number(demosBooked) || 0,
      demosCompleted: Number(demosCompleted) || 0,
      proposalsRequested: Number(proposalsRequested) || 0,
      followUpsCompleted: Number(followUpsCompleted) || 0,
      dealsWon: Number(dealsWon) || 0,
      cashCollected: Number(cashCollected) || 0
    };

    const observations: PartnerEodObservations = {
      bestIndustry: bestIndustry.trim(),
      commonObjections: commonObjections.trim(),
      supportNeeded: supportNeeded.trim(),
      blockers: blockers.trim(),
      tomorrowPriority: tomorrowPriority.trim()
    };

    onSubmitReport({
      partnerId: partner.id,
      partnerName: partner.name,
      date,
      city: city.trim() || undefined,
      primaryCategory,
      secondaryCategory,
      metrics,
      observations
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-2xl max-h-[92vh] flex flex-col bg-white rounded-3xl border border-gray-200 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-black text-[#CCFF00] font-black flex items-center justify-center">
              <FileCheck size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-gray-900 font-['Outfit']">
                Daily End-of-Day (EOD) Prospecting Report
              </h3>
              <p className="text-xs text-gray-500">
                SOP Reporting Format &bull; Due by end of each working day
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-black transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Notice */}
        <div className="bg-gray-50 border-b border-gray-100 px-5 py-2 text-[11px] text-gray-600 flex items-center gap-2">
          <AlertCircle size={13} className="shrink-0 text-gray-400" />
          <span>
            Accurate updates build the data foundation for weekly pipeline reviews, script improvements, and commission disbursements.
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs text-gray-700">
          
          {/* Date, City, Focus Categories */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">Date *</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold focus:outline-hidden focus:border-black"
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">City Covered</label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="e.g. Bhopal, Indore"
                className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold focus:outline-hidden focus:border-black"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">Primary Category</label>
              <CustomSelect
                value={primaryCategory}
                onChange={val => setPrimaryCategory(val as AgxProductCategory)}
                options={AGX_PRODUCT_CATEGORIES.map(c => ({
                  value: c.id,
                  label: c.name,
                  description: c.tagline
                }))}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">Secondary Category</label>
              <CustomSelect
                value={secondaryCategory}
                onChange={val => setSecondaryCategory(val as AgxProductCategory)}
                options={AGX_PRODUCT_CATEGORIES.map(c => ({
                  value: c.id,
                  label: c.name,
                  description: c.tagline
                }))}
              />
            </div>
          </div>

          {/* Section: Activity Metrics */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
            <span className="font-extrabold text-gray-900 text-xs block">
              Today's Activity Numbers (Compare with Daily SOP Targets)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[10px] font-bold text-gray-500 block">Researched (Target: 25-30)</label>
                <input
                  type="number"
                  value={researched}
                  onChange={e => setResearched(parseInt(e.target.value) || 0)}
                  min={0}
                  className="w-full px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 block">Contact Attempts (Target: 25)</label>
                <input
                  type="number"
                  value={contactAttempts}
                  onChange={e => setContactAttempts(parseInt(e.target.value) || 0)}
                  min={0}
                  className="w-full px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 block">Meaningful Convos (Target: 5)</label>
                <input
                  type="number"
                  value={meaningfulConversations}
                  onChange={e => setMeaningfulConversations(parseInt(e.target.value) || 0)}
                  min={0}
                  className="w-full px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 block">Decision Makers Reached</label>
                <input
                  type="number"
                  value={decisionMakersReached}
                  onChange={e => setDecisionMakersReached(parseInt(e.target.value) || 0)}
                  min={0}
                  className="w-full px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 block">Qualified Prospects (Target: 2)</label>
                <input
                  type="number"
                  value={qualifiedProspects}
                  onChange={e => setQualifiedProspects(parseInt(e.target.value) || 0)}
                  min={0}
                  className="w-full px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-mono font-bold text-purple-700"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 block">Demos Booked (Target: 1)</label>
                <input
                  type="number"
                  value={demosBooked}
                  onChange={e => setDemosBooked(parseInt(e.target.value) || 0)}
                  min={0}
                  className="w-full px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-mono font-bold text-amber-700"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 block">Demos Completed</label>
                <input
                  type="number"
                  value={demosCompleted}
                  onChange={e => setDemosCompleted(parseInt(e.target.value) || 0)}
                  min={0}
                  className="w-full px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 block">Proposals Requested</label>
                <input
                  type="number"
                  value={proposalsRequested}
                  onChange={e => setProposalsRequested(parseInt(e.target.value) || 0)}
                  min={0}
                  className="w-full px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 block">Follow-ups Completed (Target: 10)</label>
                <input
                  type="number"
                  value={followUpsCompleted}
                  onChange={e => setFollowUpsCompleted(parseInt(e.target.value) || 0)}
                  min={0}
                  className="w-full px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 block">Deals Won</label>
                <input
                  type="number"
                  value={dealsWon}
                  onChange={e => setDealsWon(parseInt(e.target.value) || 0)}
                  min={0}
                  className="w-full px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-mono font-bold text-emerald-700"
                />
              </div>

              <div className="col-span-2">
                <label className="text-[10px] font-bold text-gray-500 block">Customer Cash Collected (₹)</label>
                <input
                  type="number"
                  value={cashCollected}
                  onChange={e => setCashCollected(parseInt(e.target.value) || 0)}
                  min={0}
                  step={1000}
                  placeholder="₹ Actual advance verified"
                  className="w-full px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-mono font-extrabold text-emerald-700"
                />
              </div>
            </div>
          </div>

          {/* Section: 5 Daily Qualitative Observations */}
          <div className="space-y-3">
            <span className="font-extrabold text-gray-900 text-xs block">
              Daily Qualitative Observations (Required by SOP Section 14)
            </span>

            <div>
              <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">
                1. Which industry responded best today?
              </label>
              <input
                type="text"
                value={bestIndustry}
                onChange={e => setBestIndustry(e.target.value)}
                placeholder="e.g. Used-car dealers in Indore showed high interest in inventory sync"
                className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs focus:outline-hidden focus:border-black"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">
                2. What were the most common objections?
              </label>
              <input
                type="text"
                value={commonObjections}
                onChange={e => setCommonObjections(e.target.value)}
                placeholder="e.g. 'Excel is working fine for us', 'Budget concerns'"
                className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs focus:outline-hidden focus:border-black"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">
                3. Which prospects need AGX support or custom review?
              </label>
              <input
                type="text"
                value={supportNeeded}
                onChange={e => setSupportNeeded(e.target.value)}
                placeholder="e.g. Sharma Motors needs quotation for 3 branches; asked if GPS integration is included"
                className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs focus:outline-hidden focus:border-black"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">
                4. What prevented meetings or demos?
              </label>
              <input
                type="text"
                value={blockers}
                onChange={e => setBlockers(e.target.value)}
                placeholder="e.g. Decision-makers traveling; Diwali showroom rush"
                className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs focus:outline-hidden focus:border-black"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">
                5. What is tomorrow's top priority? *
              </label>
              <input
                type="text"
                value={tomorrowPriority}
                onChange={e => setTomorrowPriority(e.target.value)}
                placeholder="e.g. Follow up with 4 qualified prospects, complete 2 scheduled demos"
                className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs focus:outline-hidden focus:border-black"
                required
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-black hover:bg-gray-800 text-white font-extrabold transition-all cursor-pointer shadow-md flex items-center gap-1.5"
            >
              <FileCheck size={14} className="text-[#CCFF00]" />
              Submit Daily EOD Report
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

