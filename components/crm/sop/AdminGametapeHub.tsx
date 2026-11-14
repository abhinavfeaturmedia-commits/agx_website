import React, { useState } from 'react';
import { Award, Plus, Star, X, Check, Calendar, User, MessageSquare, AlertCircle } from 'lucide-react';
import { Partner, PartnerGametapeReview } from '../../../types/crm';
import { toast } from '../../../lib/toastStore';

interface AdminGametapeHubProps {
  partners: Partner[];
  gametapes: PartnerGametapeReview[];
  onSaveGametape: (review: Omit<PartnerGametapeReview, 'id' | 'createdAt'>) => void;
  reviewerName: string;
}

export const AdminGametapeHub: React.FC<AdminGametapeHubProps> = ({
  partners,
  gametapes,
  onSaveGametape,
  reviewerName
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>(partners[0]?.id || '');
  const [prospectBusiness, setProspectBusiness] = useState<string>('');
  const [callDate, setCallDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // 8 Scores (1 to 5)
  const [researchedBusiness, setResearchedBusiness] = useState<number>(4);
  const [reachedDecisionMaker, setReachedDecisionMaker] = useState<number>(4);
  const [relevantQuestions, setRelevantQuestions] = useState<number>(4);
  const [listeningVsInterrupting, setListeningVsInterrupting] = useState<number>(4);
  const [identifiedRealProblem, setIdentifiedRealProblem] = useState<number>(4);
  const [productClarity, setProductClarity] = useState<number>(4);
  const [definiteNextStep, setDefiniteNextStep] = useState<number>(4);
  const [crmHygiene, setCrmHygiene] = useState<number>(5);

  const [overallNotes, setOverallNotes] = useState<string>('');
  const [oneImprovementFocus, setOneImprovementFocus] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const targetPartner = partners.find(p => p.id === selectedPartnerId);
    if (!targetPartner) {
      toast.error('Partner Required', 'Please select a partner to review.');
      return;
    }

    if (!prospectBusiness.trim()) {
      toast.warning('Prospect Business Required', 'Please enter the prospect business name reviewed.');
      return;
    }

    if (!oneImprovementFocus.trim()) {
      toast.warning('Improvement Focus Required', 'SOP Section 15 requires setting one single improvement focus for next week.');
      return;
    }

    onSaveGametape({
      partnerId: targetPartner.id,
      partnerName: targetPartner.name,
      prospectBusiness: prospectBusiness.trim(),
      callDate,
      reviewerName,
      scores: {
        researchedBusiness,
        reachedDecisionMaker,
        relevantQuestions,
        listeningVsInterrupting,
        identifiedRealProblem,
        productClarity,
        definiteNextStep,
        crmHygiene
      },
      overallNotes: overallNotes.trim(),
      oneImprovementFocus: oneImprovementFocus.trim()
    });

    setIsModalOpen(false);
    setProspectBusiness('');
    setOverallNotes('');
    setOneImprovementFocus('');
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-xl text-gray-900 tracking-tight font-['Outfit']">
              Weekly Call Review & Gametape Coaching
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 text-[10px] font-extrabold border border-purple-200">
              8-Point SOP Rubric
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1 max-w-xl">
            SOP Section 15: Review 2–3 sales calls or meeting notes every week. Focus on listening, problem discovery, and picking one strategic improvement for the following week.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-black hover:bg-gray-800 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5 btn-press"
        >
          <Plus size={14} className="text-[#CCFF00]" />
          <span>Record New Gametape</span>
        </button>
      </div>

      {/* Gametapes List */}
      <div className="space-y-4">
        {gametapes.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
              <Award size={20} />
            </div>
            <h4 className="font-extrabold text-sm text-gray-900">No Gametape Reviews Logged Yet</h4>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Conduct a 30-minute weekly review with your partners and log their call scores here.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-black text-white text-xs font-bold hover:bg-gray-800 transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus size={13} className="text-[#CCFF00]" /> Record First Call Review
            </button>
          </div>
        ) : (
          gametapes.map(gt => {
            const avgScore = (
              Object.values(gt.scores).reduce((a, b) => a + b, 0) / Object.values(gt.scores).length
            ).toFixed(1);

            return (
              <div
                key={gt.id}
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 font-black flex items-center justify-center border border-purple-200 shrink-0">
                      <Award size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-base text-gray-900">{gt.partnerName}</h4>
                        <span className="text-xs text-gray-400">&bull; Call with {gt.prospectBusiness}</span>
                        <span className="text-xs font-mono text-gray-400">({gt.callDate})</span>
                      </div>
                      <span className="text-[11px] text-gray-400">
                        Coached by {gt.reviewerName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500">Overall Rating:</span>
                    <span className="text-sm font-black font-mono px-3 py-1 rounded-xl bg-black text-[#CCFF00]">
                      {avgScore} / 5.0
                    </span>
                  </div>
                </div>

                {/* 8-Point Rubric Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                    <span className="text-gray-600 font-medium">1. Researched Biz</span>
                    <span className="font-mono font-bold text-gray-900">{gt.scores.researchedBusiness}/5</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                    <span className="text-gray-600 font-medium">2. Decision Maker</span>
                    <span className="font-mono font-bold text-gray-900">{gt.scores.reachedDecisionMaker}/5</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                    <span className="text-gray-600 font-medium">3. Relevant Qs</span>
                    <span className="font-mono font-bold text-gray-900">{gt.scores.relevantQuestions}/5</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                    <span className="text-gray-600 font-medium">4. Listening</span>
                    <span className="font-mono font-bold text-gray-900">{gt.scores.listeningVsInterrupting}/5</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                    <span className="text-gray-600 font-medium">5. Problem Discovered</span>
                    <span className="font-mono font-bold text-gray-900">{gt.scores.identifiedRealProblem}/5</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                    <span className="text-gray-600 font-medium">6. Product Clarity</span>
                    <span className="font-mono font-bold text-gray-900">{gt.scores.productClarity}/5</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                    <span className="text-gray-600 font-medium">7. Next Step Secured</span>
                    <span className="font-mono font-bold text-gray-900">{gt.scores.definiteNextStep}/5</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                    <span className="text-gray-600 font-medium">8. CRM Hygiene</span>
                    <span className="font-mono font-bold text-gray-900">{gt.scores.crmHygiene}/5</span>
                  </div>
                </div>

                {/* Coaching Notes & Focus */}
                <div className="bg-purple-50/60 p-4 rounded-2xl border border-purple-200/80 space-y-2 text-xs">
                  <div>
                    <strong className="text-purple-950">Call Review Notes:</strong>{' '}
                    <span className="text-purple-900">{gt.overallNotes}</span>
                  </div>
                  <div className="pt-2 border-t border-purple-200">
                    <strong className="text-purple-950">Single Focus for Next Week:</strong>{' '}
                    <span className="text-purple-900 font-extrabold">{gt.oneImprovementFocus}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Record Gametape Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-xl max-h-[90vh] bg-white rounded-3xl border border-gray-200 shadow-2xl flex flex-col overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 font-black flex items-center justify-center">
                  <Award size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-gray-900 font-['Outfit']">
                    Record Sales Call Gametape
                  </h3>
                  <p className="text-xs text-gray-500">
                    SOP Section 15 &bull; 8-Point Call Coaching Evaluation
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-black transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">Select Partner *</label>
                  <select
                    value={selectedPartnerId}
                    onChange={e => setSelectedPartnerId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold focus:outline-hidden"
                  >
                    {partners.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">Prospect Business *</label>
                  <input
                    type="text"
                    value={prospectBusiness}
                    onChange={e => setProspectBusiness(e.target.value)}
                    placeholder="e.g. Apex Car Zone"
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">Call Date *</label>
                  <input
                    type="date"
                    value={callDate}
                    onChange={e => setCallDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold"
                    required
                  />
                </div>
              </div>

              {/* 8-Point Rubric Rating Inputs */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                <span className="font-extrabold text-gray-900 text-xs block">
                  8-Point Evaluation (Rate 1 to 5)
                </span>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-600 block">1. Researched Business</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={researchedBusiness}
                      onChange={e => setResearchedBusiness(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-gray-200 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-600 block">2. Reached Decision Maker</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={reachedDecisionMaker}
                      onChange={e => setReachedDecisionMaker(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-gray-200 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-600 block">3. Relevant Questions</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={relevantQuestions}
                      onChange={e => setRelevantQuestions(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-gray-200 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-600 block">4. Listening vs Interrupting</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={listeningVsInterrupting}
                      onChange={e => setListeningVsInterrupting(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-gray-200 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-600 block">5. Identified Real Problem</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={identifiedRealProblem}
                      onChange={e => setIdentifiedRealProblem(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-gray-200 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-600 block">6. Product Clarity</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={productClarity}
                      onChange={e => setProductClarity(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-gray-200 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-600 block">7. Definite Next Step</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={definiteNextStep}
                      onChange={e => setDefiniteNextStep(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-gray-200 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-600 block">8. CRM Hygiene</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={crmHygiene}
                      onChange={e => setCrmHygiene(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-gray-200 font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">
                  Overall Coach Observation Notes
                </label>
                <textarea
                  value={overallNotes}
                  onChange={e => setOverallNotes(e.target.value)}
                  placeholder="e.g. Good rapport built; jumped to demo offer too quickly before uncovering WhatsApp lost enquiry count..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs resize-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">
                  One Single Improvement Focus for Next Week *
                </label>
                <input
                  type="text"
                  value={oneImprovementFocus}
                  onChange={e => setOneImprovementFocus(e.target.value)}
                  placeholder="e.g. Pause for 5 seconds after asking the opening workflow question"
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold"
                  required
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-black hover:bg-gray-800 text-white font-extrabold transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <Check size={14} className="text-[#CCFF00]" />
                  Save Gametape Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

