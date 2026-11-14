import React, { useState } from 'react';
import {
  Users, Search, Filter, Plus, Calendar, ShieldCheck, ChevronRight,
  Phone, Building, Mail, CheckCircle2, Clock, AlertCircle, ArrowRight,
  TrendingUp, CheckSquare, MessageSquare, DollarSign, Send, IndianRupee,
  Edit3, Sliders
} from 'lucide-react';
import {
  PartnerReferral, LeadStageSop, LEAD_STAGES_SOP,
  AgxProductCategory, AGX_PRODUCT_CATEGORIES
} from '../../../types/crm';
import { CustomSelect } from '../../ui/CustomSelect';

interface SopPipelineViewProps {
  referrals: PartnerReferral[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenSubmitModal: () => void;
  onOpenQualifyModal: (referral: PartnerReferral) => void;
  onOpenDemoModal: (referral: PartnerReferral) => void;
  onManageProspect: (referral: PartnerReferral) => void;
  onUpdateStage: (referralId: string, stage: LeadStageSop) => void;
  partnerRate: number;
}

export const SopPipelineView: React.FC<SopPipelineViewProps> = ({
  referrals,
  searchQuery,
  onSearchChange,
  onOpenSubmitModal,
  onOpenQualifyModal,
  onOpenDemoModal,
  onManageProspect,
  onUpdateStage,
  partnerRate
}) => {
  const [selectedProductFilter, setSelectedProductFilter] = useState<string>('ALL');
  const [selectedCategoryGroup, setSelectedCategoryGroup] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('table');

  // Filter referrals
  const filteredReferrals = referrals.filter(ref => {
    const matchesSearch =
      ref.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ref.company && ref.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (ref.clientPhone && ref.clientPhone.includes(searchQuery)) ||
      (ref.city && ref.city.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (selectedProductFilter !== 'ALL' && ref.productCategory !== selectedProductFilter && ref.projectType !== selectedProductFilter) {
      return false;
    }

    if (selectedCategoryGroup !== 'ALL') {
      const stageMeta = LEAD_STAGES_SOP.find(s => s.stage === (ref.sopStage || 'Prospect Identified'));
      if (stageMeta?.category !== selectedCategoryGroup) return false;
    }

    return true;
  });

  return (
    <div className="space-y-5">
      
      {/* Top Filter & Controls Bar */}
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="Search prospects by name, company, city, or phone..."
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-semibold focus:outline-hidden focus:border-black transition-colors"
            />
          </div>

          {/* Action & View Toggles */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-black shadow-xs' : 'text-gray-500 hover:text-black'
                }`}
              >
                Table View
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'kanban' ? 'bg-white text-black shadow-xs' : 'text-gray-500 hover:text-black'
                }`}
              >
                14-Stage Kanban
              </button>
            </div>

            <button
              onClick={onOpenSubmitModal}
              className="px-4 py-2.5 rounded-2xl bg-black hover:bg-gray-800 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5 btn-press"
            >
              <Plus size={14} className="text-[#CCFF00]" />
              <span>Add Prospect</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-gray-100 text-xs">
          <span className="text-[10px] font-bold uppercase text-gray-400">Stage Group:</span>
          {[
            { id: 'ALL', label: 'All 14 Stages' },
            { id: 'prospecting', label: '1. Prospecting (1-4)' },
            { id: 'qualification', label: '2. Qualification (5-6)' },
            { id: 'demo', label: '3. Technical Demo (7-8)' },
            { id: 'closing', label: '4. Closing & Proposal (9-11)' },
            { id: 'outcome', label: '5. Won / Lost (12-14)' }
          ].map(g => (
            <button
              key={g.id}
              onClick={() => setSelectedCategoryGroup(g.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                selectedCategoryGroup === g.id
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {g.label}
            </button>
          ))}

          <span className="text-[10px] font-bold uppercase text-gray-400 ml-2">Product:</span>
          <div className="min-w-[150px]">
            <CustomSelect
              value={selectedProductFilter}
              onChange={val => setSelectedProductFilter(val)}
              options={[
                { value: 'ALL', label: 'All Products' },
                ...AGX_PRODUCT_CATEGORIES.map(p => ({
                  value: p.id,
                  label: p.name
                }))
              ]}
              buttonClassName="px-2.5 py-1 rounded-lg bg-gray-100 border-none text-[11px] font-bold text-gray-700 hover:bg-gray-200"
            />
          </div>
        </div>
      </div>

      {/* TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
          {filteredReferrals.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
                <Users size={22} />
              </div>
              <h4 className="font-extrabold text-sm text-gray-900">No Prospects Found</h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                No matching leads in this filter. Register a new business to begin your daily prospecting SOP.
              </p>
              <button
                onClick={onOpenSubmitModal}
                className="px-4 py-2 rounded-xl bg-black text-white text-xs font-bold hover:bg-gray-800 transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus size={13} className="text-[#CCFF00]" /> Add New Prospect
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 text-[10px] font-extrabold uppercase text-gray-400 border-b border-gray-100">
                    <th className="py-3 px-4">Prospect / Business</th>
                    <th className="py-3 px-4">Product & Problem</th>
                    <th className="py-3 px-4">Current SOP Stage</th>
                    <th className="py-3 px-4">Cash Collected & Commission</th>
                    <th className="py-3 px-4">Follow-up Cadence</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredReferrals.map(ref => {
                    const currentStage: LeadStageSop = ref.sopStage || (ref.dealStatus === 'WON' ? 'Won — Advance Received' : 'Prospect Identified');
                    const stageMeta = LEAD_STAGES_SOP.find(s => s.stage === currentStage) || LEAD_STAGES_SOP[0];
                    const isQualified = Boolean(ref.qualification?.isQualified);
                    const cashCollected = ref.cashCollectedAmount || ref.totalPaid || 0;
                    const commissionOnCash = Math.round(cashCollected * (ref.commissionRate || partnerRate));

                    return (
                      <tr
                        key={ref.id}
                        onClick={() => onManageProspect(ref)}
                        className="hover:bg-gray-50/80 transition-colors cursor-pointer group"
                      >
                        
                        {/* Prospect & Business */}
                        <td className="py-3.5 px-4">
                          <div>
                            <span className="font-extrabold text-gray-900 block group-hover:text-black group-hover:underline">
                              {ref.clientName}
                            </span>
                            <span className="text-[11px] text-gray-500 flex items-center gap-1">
                              <Building size={11} className="text-gray-400" />
                              {ref.company || 'Individual Business'}
                              {ref.city && <span className="text-gray-400">• {ref.city}</span>}
                            </span>
                            {ref.clientPhone && (
                              <a
                                href={`https://wa.me/${ref.clientPhone.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                onClick={e => e.stopPropagation()}
                                className="text-[10px] font-mono text-emerald-600 hover:underline flex items-center gap-1 mt-0.5"
                              >
                                <Phone size={10} /> {ref.clientPhone}
                              </a>
                            )}
                          </div>
                        </td>

                        {/* Product & Discovered Problem */}
                        <td className="py-3.5 px-4">
                          <div>
                            <span className="font-bold text-gray-800 block text-xs">
                              {ref.productCategory || ref.projectType}
                            </span>
                            <span className="text-[11px] text-gray-500 block max-w-xs truncate" title={ref.problemIdentified || ref.notes}>
                              {ref.problemIdentified || ref.notes || 'Problem not documented yet'}
                            </span>
                          </div>
                        </td>

                        {/* SOP Stage Selector */}
                        <td className="py-3.5 px-4" onClick={e => e.stopPropagation()}>
                          <div className="space-y-1 min-w-[190px]">
                            <CustomSelect
                              value={currentStage}
                              onChange={val => onUpdateStage(ref.id, val as LeadStageSop)}
                              options={LEAD_STAGES_SOP.map(s => ({
                                value: s.stage,
                                label: `Step ${s.stepNumber}: ${s.stage}`,
                                badge: `#${s.stepNumber}`,
                                badgeColor: s.color,
                                description: s.description
                              }))}
                              buttonClassName={`text-[11px] font-extrabold px-2.5 py-1 rounded-xl border ${stageMeta.color}`}
                            />
                            <span className="text-[10px] text-gray-400 block font-mono">
                              Step {stageMeta.stepNumber} of 14
                            </span>
                          </div>
                        </td>

                        {/* Cash Collected & Commission */}
                        <td className="py-3.5 px-4 font-mono">
                          <div>
                            <span className="text-xs font-bold text-gray-900 block">
                              ₹{cashCollected.toLocaleString('en-IN')}
                              <span className="text-[10px] text-gray-400 font-normal">
                                {' / '}
                                {ref.dealValue > 0 ? `₹${ref.dealValue.toLocaleString('en-IN')}` : 'Quote Pending'}
                              </span>
                            </span>
                            <span className="text-[10px] text-emerald-600 font-bold block">
                              {ref.dealValue > 0
                                ? `Commission: ₹${commissionOnCash.toLocaleString('en-IN')} (${Math.round((ref.commissionRate || partnerRate) * 100)}%)`
                                : `Rate: ${Math.round((ref.commissionRate || partnerRate) * 100)}% on cash received`}
                            </span>
                            {ref.budgetRange && ref.dealValue === 0 && (
                              <span className="text-[9px] text-gray-500 block truncate max-w-[180px]" title={ref.budgetRange}>
                                Budget: {ref.budgetRange}
                              </span>
                            )}
                            {ref.dealValue > 0 && cashCollected < ref.dealValue && (
                              <span className="text-[9px] text-amber-600 block">
                                SOP: Commission releases on cash received
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Follow-up Cadence */}
                        <td className="py-3.5 px-4">
                          <div className="text-[11px]">
                            <span className="font-bold text-gray-700 block">
                              {ref.nextAction || 'Follow-up pending'}
                            </span>
                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                              <Clock size={10} /> {ref.nextFollowUpDate || 'No date set'}
                            </span>
                          </div>
                        </td>

                        {/* Action Buttons */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            
                            {/* Manage Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onManageProspect(ref);
                              }}
                              className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-black text-white hover:bg-gray-800 transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                              title="Manage Prospect & Deal SOP"
                            >
                              <Edit3 size={11} className="text-[#CCFF00]" />
                              <span>Manage</span>
                            </button>

                            {/* Qualify Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenQualifyModal(ref);
                              }}
                              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
                                isQualified
                                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200'
                              }`}
                              title="6-Point Qualification Rubric"
                            >
                              <ShieldCheck size={12} className={isQualified ? 'text-purple-600' : 'text-gray-400'} />
                              <span>{isQualified ? 'Qualified' : 'Qualify'}</span>
                            </button>

                            {/* AGX Demo Request Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenDemoModal(ref);
                              }}
                              className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-amber-500/10 text-amber-800 border border-amber-300 hover:bg-amber-500/20 transition-colors cursor-pointer flex items-center gap-1"
                              title="Schedule AGX Demo Handoff"
                            >
                              <Calendar size={12} className="text-amber-700" />
                              <span>Demo</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* KANBAN VIEW */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5 overflow-x-auto pb-4">
          {[
            { id: 'prospecting', title: '1. Prospecting', stages: LEAD_STAGES_SOP.slice(0, 4) },
            { id: 'qualification', title: '2. Qualification', stages: LEAD_STAGES_SOP.slice(4, 6) },
            { id: 'demo', title: '3. AGX Demo', stages: LEAD_STAGES_SOP.slice(6, 8) },
            { id: 'closing', title: '4. Proposal & Closing', stages: LEAD_STAGES_SOP.slice(8, 11) },
            { id: 'outcome', title: '5. Won / Lost', stages: LEAD_STAGES_SOP.slice(11) }
          ].map(col => {
            const colStages = col.stages.map(s => s.stage);
            const colReferrals = filteredReferrals.filter(r =>
              colStages.includes((r.sopStage || 'Prospect Identified') as any)
            );

            return (
              <div
                key={col.id}
                className="bg-white rounded-3xl p-3.5 border border-gray-200/80 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.04)] flex flex-col min-w-[240px]"
              >
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-gray-100">
                  <span className="font-extrabold text-xs text-gray-900">{col.title}</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                    {colReferrals.length}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1">
                  {colReferrals.length === 0 ? (
                    <div className="p-4 rounded-2xl bg-gray-50/60 border border-dashed border-gray-200 text-center text-[10px] text-gray-400">
                      No leads in this stage
                    </div>
                  ) : (
                    colReferrals.map(ref => {
                      const currentStage = ref.sopStage || 'Prospect Identified';
                      const stageMeta = LEAD_STAGES_SOP.find(s => s.stage === currentStage);

                      return (
                        <div
                          key={ref.id}
                          onClick={() => onManageProspect(ref)}
                          className="p-3 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-2 hover:border-black transition-all cursor-pointer shadow-xs hover:shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <div>
                              <span className="font-extrabold text-xs text-gray-900 block hover:underline">{ref.clientName}</span>
                              <span className="text-[10px] text-gray-500 block truncate">{ref.company || ref.projectType}</span>
                            </div>
                            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md border ${stageMeta?.color}`}>
                              #{stageMeta?.stepNumber}
                            </span>
                          </div>

                          <div className="text-[10px] text-gray-600 font-mono flex items-center justify-between pt-1 border-t border-gray-200/60">
                            <span>{ref.dealValue > 0 ? `₹${ref.dealValue.toLocaleString('en-IN')}` : 'Quote Pending'}</span>
                            <span className="text-emerald-700 font-bold">
                              ₹{(ref.cashCollectedAmount || ref.totalPaid || 0).toLocaleString('en-IN')} paid
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-1 gap-1 text-[10px]">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onManageProspect(ref);
                              }}
                              className="font-bold text-black hover:underline cursor-pointer flex items-center gap-0.5"
                            >
                              <Edit3 size={10} /> Manage
                            </button>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenQualifyModal(ref);
                                }}
                                className="font-bold text-purple-700 hover:underline cursor-pointer"
                              >
                                Qualify
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenDemoModal(ref);
                                }}
                                className="font-bold text-amber-700 hover:underline cursor-pointer"
                              >
                                Demo →
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

