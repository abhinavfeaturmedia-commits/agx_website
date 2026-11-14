import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, AlertCircle, X, ShieldCheck, Clock, UserCheck, HelpCircle } from 'lucide-react';
import { PartnerReferral, QualificationChecklist } from '../../../types/crm';
import { toast } from '../../../lib/toastStore';
import { CustomSelect } from '../../ui/CustomSelect';

interface QualificationModalProps {
  referral: PartnerReferral;
  isOpen: boolean;
  onClose: () => void;
  onSave: (referralId: string, qualification: QualificationChecklist) => void;
}

export const QualificationModal: React.FC<QualificationModalProps> = ({
  referral,
  isOpen,
  onClose,
  onSave
}) => {
  const existing = referral.qualification;

  const [targetCategoryFit, setTargetCategoryFit] = useState<boolean>(existing?.targetCategoryFit ?? true);
  const [identifiedProblem, setIdentifiedProblem] = useState<string>(existing?.identifiedProblem ?? referral.problemIdentified ?? '');
  const [currentProcess, setCurrentProcess] = useState<'Excel' | 'WhatsApp' | 'Manual Registers' | 'Existing Software' | 'Other'>(
    existing?.currentProcess ?? (referral.currentProcess as any) ?? 'Excel'
  );
  const [decisionMakerConfirmed, setDecisionMakerConfirmed] = useState<boolean>(existing?.decisionMakerConfirmed ?? false);
  const [decisionMakerNameRole, setDecisionMakerNameRole] = useState<string>(existing?.decisionMakerNameRole ?? referral.clientName ?? '');
  const [willingnessToEvaluate, setWillingnessToEvaluate] = useState<boolean>(existing?.willingnessToEvaluate ?? true);
  const [realisticTimeline, setRealisticTimeline] = useState<string>(existing?.realisticTimeline ?? 'Within 15 days');
  const [customizationFeasibilityApproved, setCustomizationFeasibilityApproved] = useState<boolean>(existing?.customizationFeasibilityApproved ?? true);
  const [notes, setNotes] = useState<string>(existing?.notes ?? '');

  if (!isOpen) return null;

  const isFormValid = targetCategoryFit && identifiedProblem.trim().length > 5 && decisionMakerConfirmed && willingnessToEvaluate;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      toast.warning('Qualification Standard Incomplete', 'SOP requires confirming target fit, specific problem, decision-maker, and evaluation willingness.');
      return;
    }

    const qualification: QualificationChecklist = {
      targetCategoryFit,
      identifiedProblem: identifiedProblem.trim(),
      currentProcess,
      decisionMakerConfirmed,
      decisionMakerNameRole: decisionMakerNameRole.trim(),
      willingnessToEvaluate,
      realisticTimeline: realisticTimeline.trim(),
      customizationFeasibilityApproved,
      notes: notes.trim(),
      isQualified: true,
      qualifiedAt: new Date().toISOString()
    };

    onSave(referral.id, qualification);
    toast.success('Prospect Qualified', `${referral.clientName} meets the AGX Qualification Standard.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-xl max-h-[90vh] flex flex-col bg-white rounded-3xl border border-gray-200 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#CCFF00]/20 text-black font-black flex items-center justify-center border border-[#CCFF00]/40">
              <ShieldCheck size={20} className="text-black" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-gray-900 font-['Outfit']">
                6-Point Qualification Standard
              </h3>
              <p className="text-xs text-gray-500">
                {referral.clientName} • {referral.company || referral.projectType}
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

        {/* Notice from SOP */}
        <div className="bg-amber-50 border-b border-amber-100 px-5 py-2.5 text-[11px] text-amber-900 flex items-center gap-2">
          <AlertCircle size={14} className="shrink-0 text-amber-600" />
          <span>
            <strong>SOP Rule:</strong> A prospect who simply says <em>"Send details"</em> is not qualified. Confirm all 6 criteria before requesting an AGX demo.
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs text-gray-700">
          
          {/* 1. Target Category Fit */}
          <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-2">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-extrabold text-gray-900 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-black text-[#CCFF00] text-[10px] flex items-center justify-center font-bold">1</span>
                Fits Target Category
              </span>
              <input
                type="checkbox"
                checked={targetCategoryFit}
                onChange={e => setTargetCategoryFit(e.target.checked)}
                className="w-4 h-4 rounded text-black focus:ring-black cursor-pointer"
              />
            </label>
            <p className="text-[11px] text-gray-500">
              Used car dealership, rental operator, recruitment firm, travel agency, or project/manufacturing business.
            </p>
          </div>

          {/* 2. Discovered Problem & Current Process */}
          <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-2.5">
            <div className="flex items-center gap-1.5 font-extrabold text-gray-900">
              <span className="w-5 h-5 rounded-full bg-black text-[#CCFF00] text-[10px] flex items-center justify-center font-bold">2</span>
              Operational Problem & Current Process *
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">
                How do they manage this workflow right now?
              </label>
              <CustomSelect
                value={currentProcess}
                onChange={val => setCurrentProcess(val as any)}
                options={[
                  { value: 'Excel', label: 'Excel / Google Sheets' },
                  { value: 'WhatsApp', label: 'WhatsApp Chats & Groups' },
                  { value: 'Manual Registers', label: 'Manual Paper Registers' },
                  { value: 'Existing Software', label: 'Existing Software (has flaws/gaps)' },
                  { value: 'Other', label: 'Other / No System' }
                ]}
                buttonClassName="bg-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">
                Specific problem identified (What breaks? Where do they lose time/money?) *
              </label>
              <textarea
                value={identifiedProblem}
                onChange={e => setIdentifiedProblem(e.target.value)}
                placeholder="e.g., Losing vehicle enquiries across 4 sales reps on WhatsApp, double-booking rental fleet, candidate CVs scattered in Gmail..."
                rows={2}
                className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs focus:outline-hidden focus:border-black resize-none"
              />
            </div>
          </div>

          {/* 3. Decision Maker Authority */}
          <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-2.5">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-extrabold text-gray-900 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-black text-[#CCFF00] text-[10px] flex items-center justify-center font-bold">3</span>
                Decision-Maker Access Confirmed *
              </span>
              <input
                type="checkbox"
                checked={decisionMakerConfirmed}
                onChange={e => setDecisionMakerConfirmed(e.target.checked)}
                className="w-4 h-4 rounded text-black focus:ring-black cursor-pointer"
              />
            </label>
            <input
              type="text"
              value={decisionMakerNameRole}
              onChange={e => setDecisionMakerNameRole(e.target.value)}
              placeholder="Decision-maker name & role (e.g. Mr. Sharma, Managing Director)"
              className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs focus:outline-hidden focus:border-black"
            />
          </div>

          {/* 4. Willingness to Evaluate */}
          <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-1.5">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-extrabold text-gray-900 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-black text-[#CCFF00] text-[10px] flex items-center justify-center font-bold">4</span>
                Genuine Willingness to Evaluate Software
              </span>
              <input
                type="checkbox"
                checked={willingnessToEvaluate}
                onChange={e => setWillingnessToEvaluate(e.target.checked)}
                className="w-4 h-4 rounded text-black focus:ring-black cursor-pointer"
              />
            </label>
            <p className="text-[11px] text-gray-500">
              The business genuinely wants to explore upgrading from their current process, not just asking for a brochure.
            </p>
          </div>

          {/* 5. Implementation Timeline */}
          <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-2">
            <div className="flex items-center gap-1.5 font-extrabold text-gray-900">
              <span className="w-5 h-5 rounded-full bg-black text-[#CCFF00] text-[10px] flex items-center justify-center font-bold">5</span>
              Expected Implementation Timeline
            </div>
            <CustomSelect
              value={realisticTimeline}
              onChange={val => setRealisticTimeline(val)}
              options={[
                'Immediate (Within 7 days)',
                'Within 15 days',
                'Within 30 days',
                'Next Quarter (Nurture)'
              ]}
              buttonClassName="bg-white"
            />
          </div>

          {/* 6. Technical Feasibility Check */}
          <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-1.5">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-extrabold text-gray-900 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-black text-[#CCFF00] text-[10px] flex items-center justify-center font-bold">6</span>
                Fits AGX Core Workflow (Feasible)
              </span>
              <input
                type="checkbox"
                checked={customizationFeasibilityApproved}
                onChange={e => setCustomizationFeasibilityApproved(e.target.checked)}
                className="w-4 h-4 rounded text-black focus:ring-black cursor-pointer"
              />
            </label>
            <p className="text-[11px] text-gray-500">
              No unauthorized custom promises made. Fits standard AGX product or flagged for technical review.
            </p>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">
              Internal Qualification Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any specific nuance or owner preference to brief AGX demo team..."
              className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs focus:outline-hidden focus:border-black"
            />
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
              disabled={!isFormValid}
              className="px-5 py-2.5 rounded-xl bg-black hover:bg-gray-800 disabled:opacity-40 text-white font-extrabold transition-all cursor-pointer shadow-md flex items-center gap-1.5"
            >
              <CheckCircle2 size={14} className="text-[#CCFF00]" />
              Mark as Qualified
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

