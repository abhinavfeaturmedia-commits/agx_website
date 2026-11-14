import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, Copy, Check, X, Users, AlertCircle, Sparkles, Send } from 'lucide-react';
import { PartnerReferral, AgxProductCategory, AGX_PRODUCT_CATEGORIES, DemoBookingRequest } from '../../../types/crm';
import { toast } from '../../../lib/toastStore';
import { CustomSelect } from '../../ui/CustomSelect';

interface DemoBookingModalProps {
  referral: PartnerReferral;
  partnerName: string;
  isOpen: boolean;
  onClose: () => void;
  onRequestDemo: (request: Omit<DemoBookingRequest, 'id' | 'createdAt' | 'status'>) => void;
}

export const DemoBookingModal: React.FC<DemoBookingModalProps> = ({
  referral,
  partnerName,
  isOpen,
  onClose,
  onRequestDemo
}) => {
  const [selectedProduct, setSelectedProduct] = useState<AgxProductCategory>(
    referral.productCategory || 'Pre-owned Car CRM'
  );
  const [slot1Date, setSlot1Date] = useState<string>('');
  const [slot1Time, setSlot1Time] = useState<string>('11:30 AM');
  const [slot2Date, setSlot2Date] = useState<string>('');
  const [slot2Time, setSlot2Time] = useState<string>('03:30 PM');
  const [attendees, setAttendees] = useState<string>(
    referral.qualification?.decisionMakerNameRole || referral.clientName || 'Business Owner & Operations Head'
  );
  const [painPoints, setPainPoints] = useState<string>(
    referral.qualification?.identifiedProblem || referral.problemIdentified || ''
  );
  const [currentWorkflow, setCurrentWorkflow] = useState<string>(
    referral.qualification?.currentProcess || referral.currentProcess || 'Excel Sheets & WhatsApp'
  );
  const [copiedConfirmation, setCopiedConfirmation] = useState<boolean>(false);

  if (!isOpen) return null;

  const combinedSlot1 = slot1Date ? `${slot1Date} at ${slot1Time}` : '';
  const combinedSlot2 = slot2Date ? `${slot2Date} at ${slot2Time}` : '';

  // SOP Confirmation Message Template
  const confirmationMessage = `Namaste Sir/Ma'am,

As discussed, we have scheduled your AGXPERIENCE software demonstration.

Date & Time: ${combinedSlot1 || '[Selected Date & Time]'}
Product: ${selectedProduct}

During the 30-minute demonstration, our technical team will understand your current workflow (${currentWorkflow}) and showcase how the system will streamline your operations.

Thank you,
${partnerName}
AGXPERIENCE Partner`;

  const handleCopyConfirmation = () => {
    navigator.clipboard.writeText(confirmationMessage);
    setCopiedConfirmation(true);
    toast.success('Message Copied', 'Demo confirmation message copied to clipboard. Ready to paste into WhatsApp!');
    setTimeout(() => setCopiedConfirmation(false), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!slot1Date) {
      toast.warning('Slot Required', 'Please propose at least one preferred demo date and time.');
      return;
    }

    if (!painPoints.trim()) {
      toast.warning('Pain Points Required', 'AGX engineering requires the customer pain points to customize the 30-min demo.');
      return;
    }

    onRequestDemo({
      partnerId: referral.partnerId,
      partnerName,
      referralId: referral.id,
      clientName: referral.clientName,
      company: referral.company || referral.clientName,
      phone: referral.clientPhone,
      city: referral.city,
      product: selectedProduct,
      currentProcess: currentWorkflow,
      identifiedProblem: painPoints,
      attendees,
      slotPreference1: combinedSlot1,
      slotPreference2: combinedSlot2 || undefined
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
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-900 font-black flex items-center justify-center border border-amber-300">
              <Calendar size={20} className="text-amber-800" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-gray-900 font-['Outfit']">
                Schedule AGX Technical Demonstration
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

        {/* SOP Demo Protocol Notice */}
        <div className="bg-blue-50 border-b border-blue-100 px-5 py-2.5 text-[11px] text-blue-900 flex items-center gap-2">
          <Clock size={14} className="shrink-0 text-blue-600" />
          <span>
            <strong>SOP 30-Min Demo Flow:</strong> 5m Discovery &bull; 5m Solution Fit &bull; 10m Live Product Walkthrough &bull; 5m Customization Scope &bull; 5m Next Steps & Proposal.
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs text-gray-700">
          
          {/* Product Category Selection */}
          <div>
            <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">
              Select AGX Product to Demonstrate *
            </label>
            <CustomSelect
              value={selectedProduct}
              onChange={val => setSelectedProduct(val as AgxProductCategory)}
              options={AGX_PRODUCT_CATEGORIES.map(prod => ({
                value: prod.id,
                label: prod.name,
                description: prod.tagline
              }))}
            />
          </div>

          {/* Meeting Slot Preferences */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
            <span className="font-extrabold text-gray-900 flex items-center gap-1.5 text-xs">
              <Calendar size={14} className="text-black" /> Propose 2 Meeting Slots (As required by SOP)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">Slot 1 Date *</label>
                <input
                  type="date"
                  value={slot1Date}
                  onChange={e => setSlot1Date(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs font-semibold focus:outline-hidden focus:border-black"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">Slot 1 Preferred Time *</label>
                <CustomSelect
                  value={slot1Time}
                  onChange={val => setSlot1Time(val)}
                  options={[
                    '10:30 AM',
                    '11:30 AM',
                    '02:30 PM',
                    '04:00 PM',
                    '05:30 PM',
                    '07:00 PM'
                  ]}
                  buttonClassName="bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-gray-200/60">
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">Slot 2 Date (Alternative)</label>
                <input
                  type="date"
                  value={slot2Date}
                  onChange={e => setSlot2Date(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs font-semibold focus:outline-hidden focus:border-black"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">Slot 2 Time (Alternative)</label>
                <CustomSelect
                  value={slot2Time}
                  onChange={val => setSlot2Time(val)}
                  options={[
                    '11:30 AM',
                    '03:30 PM',
                    '05:00 PM',
                    '06:30 PM'
                  ]}
                  buttonClassName="bg-white"
                />
              </div>
            </div>
          </div>

          {/* Attendees & Current Workflow */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">
                Attendees & Decision-Maker *
              </label>
              <input
                type="text"
                value={attendees}
                onChange={e => setAttendees(e.target.value)}
                placeholder="e.g. Owner, Head of Sales, Operations Mgr"
                className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs focus:outline-hidden focus:border-black"
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">
                Current Workflow / Software
              </label>
              <input
                type="text"
                value={currentWorkflow}
                onChange={e => setCurrentWorkflow(e.target.value)}
                placeholder="e.g. Excel + WhatsApp + Paper registers"
                className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs focus:outline-hidden focus:border-black"
              />
            </div>
          </div>

          {/* Core Pain Points discovered */}
          <div>
            <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">
              Customer Pain Points to Highlight during Demo *
            </label>
            <textarea
              value={painPoints}
              onChange={e => setPainPoints(e.target.value)}
              placeholder="Detail the exact bottlenecks: e.g. Used-car inventory sync across 3 lots, missing follow-ups, manual trip billing in car rental..."
              rows={2}
              className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs focus:outline-hidden focus:border-black resize-none"
              required
            />
          </div>

          {/* SOP 1-Click WhatsApp Confirmation Preview */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-emerald-950 text-xs flex items-center gap-1.5">
                <Send size={13} className="text-emerald-700" /> SOP WhatsApp Demo Confirmation
              </span>
              <button
                type="button"
                onClick={handleCopyConfirmation}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-700 text-white font-bold text-[10px] hover:bg-emerald-800 transition-colors cursor-pointer"
              >
                {copiedConfirmation ? <Check size={11} /> : <Copy size={11} />}
                {copiedConfirmation ? 'Copied!' : 'Copy Template'}
              </button>
            </div>
            <pre className="text-[11px] text-emerald-900 bg-white/80 p-2.5 rounded-xl border border-emerald-200/80 font-sans whitespace-pre-wrap leading-relaxed">
              {confirmationMessage}
            </pre>
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
              <Calendar size={14} className="text-[#CCFF00]" />
              Submit Demo Handoff to AGX
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

