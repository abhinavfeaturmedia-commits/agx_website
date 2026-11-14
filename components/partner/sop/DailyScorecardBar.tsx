import React from 'react';
import { Target, FileSpreadsheet, CheckCircle2, TrendingUp, Sparkles, SlidersHorizontal, AlertCircle } from 'lucide-react';
import { Partner, AgxProductCategory, AGX_PRODUCT_CATEGORIES, PartnerEodReport } from '../../../types/crm';

interface DailyScorecardBarProps {
  partner: Partner;
  todayReport?: PartnerEodReport;
  onOpenEodModal: () => void;
  onOpenFocusModal: () => void;
}

export const DailyScorecardBar: React.FC<DailyScorecardBarProps> = ({
  partner,
  todayReport,
  onOpenEodModal,
  onOpenFocusModal
}) => {
  const primary = partner.primaryProductFocus || 'Pre-owned Car CRM';
  const secondary = partner.secondaryProductFocus || 'Car Rental CRM / GaadiDesk';

  const isSubmittedToday = Boolean(todayReport);

  const primaryMeta = AGX_PRODUCT_CATEGORIES.find(p => p.id === primary);
  const secondaryMeta = AGX_PRODUCT_CATEGORIES.find(p => p.id === secondary);

  return (
    <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-4">
      {/* Top Bar: Sprint Target & Focus */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-black text-[#CCFF00] font-black flex items-center justify-center shrink-0">
            <Target size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-sm text-gray-900 font-['Outfit']">
                30-Day Partner Sprint Target
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold border border-emerald-200">
                Goal: 4–5 Paying Clients
              </span>
            </div>
            <p className="text-[11px] text-gray-400">
              SOP operating rhythm: 25 calls/day &bull; 5 convos &bull; 2 qualified &bull; 1 demo booked
            </p>
          </div>
        </div>

        {/* Category Focus Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-xs">
            <span className="text-[10px] uppercase font-bold text-gray-400">Primary (80%):</span>
            <span className="font-extrabold text-gray-900">{primaryMeta?.name || primary}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-xs">
            <span className="text-[10px] uppercase font-bold text-gray-400">Secondary (20%):</span>
            <span className="font-extrabold text-gray-700">{secondaryMeta?.name || secondary}</span>
          </div>

          <button
            onClick={onOpenFocusModal}
            className="p-1.5 rounded-xl text-gray-400 hover:text-black hover:bg-gray-100 transition-colors cursor-pointer"
            title="Configure Focus Categories"
          >
            <SlidersHorizontal size={14} />
          </button>
        </div>
      </div>

      {/* SOP Daily KPI Scorecard Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        
        {/* Metric 1 */}
        <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase text-gray-400 block">Researched</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-lg font-black text-gray-900 font-mono">
              {todayReport?.metrics.researched ?? 0}
            </span>
            <span className="text-[10px] font-mono text-gray-400">/ 25-30</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase text-gray-400 block">Calls / Contacts</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-lg font-black text-gray-900 font-mono">
              {todayReport?.metrics.contactAttempts ?? 0}
            </span>
            <span className="text-[10px] font-mono text-gray-400">/ 25</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase text-gray-400 block">Meaningful Convos</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-lg font-black text-gray-900 font-mono">
              {todayReport?.metrics.meaningfulConversations ?? 0}
            </span>
            <span className="text-[10px] font-mono text-gray-400">/ 5</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase text-gray-400 block">Qualified Leads</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-lg font-black text-purple-700 font-mono">
              {todayReport?.metrics.qualifiedProspects ?? 0}
            </span>
            <span className="text-[10px] font-mono text-gray-400">/ 2</span>
          </div>
        </div>

        {/* Metric 5 */}
        <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase text-gray-400 block">Demos Booked</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-lg font-black text-amber-600 font-mono">
              {todayReport?.metrics.demosBooked ?? 0}
            </span>
            <span className="text-[10px] font-mono text-gray-400">/ 1</span>
          </div>
        </div>

        {/* Metric 6: EOD Button */}
        <button
          onClick={onOpenEodModal}
          className={`p-3 rounded-2xl border transition-all flex flex-col justify-between text-left cursor-pointer group ${
            isSubmittedToday
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
              : 'bg-black border-black text-white hover:bg-gray-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider block">
              {isSubmittedToday ? 'EOD Submitted' : 'Daily Report'}
            </span>
            {isSubmittedToday ? (
              <CheckCircle2 size={13} className="text-emerald-600" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-pulse" />
            )}
          </div>
          <div className="font-extrabold text-xs flex items-center gap-1 mt-1 group-hover:translate-x-0.5 transition-transform">
            <span>{isSubmittedToday ? 'Update Today\'s EOD' : 'Log Daily EOD →'}</span>
          </div>
        </button>

      </div>
    </div>
  );
};

