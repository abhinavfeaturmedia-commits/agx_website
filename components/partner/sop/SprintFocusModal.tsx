import React, { useState } from 'react';
import { motion } from 'motion/react';
import { SlidersHorizontal, X, Check, Target, AlertCircle } from 'lucide-react';
import { Partner, AgxProductCategory, AGX_PRODUCT_CATEGORIES } from '../../../types/crm';
import { toast } from '../../../lib/toastStore';
import { CustomSelect } from '../../ui/CustomSelect';

interface SprintFocusModalProps {
  partner: Partner;
  isOpen: boolean;
  onClose: () => void;
  onSaveFocus: (primary: AgxProductCategory, secondary: AgxProductCategory) => void;
}

export const SprintFocusModal: React.FC<SprintFocusModalProps> = ({
  partner,
  isOpen,
  onClose,
  onSaveFocus
}) => {
  const [primary, setPrimary] = useState<AgxProductCategory>(
    partner.primaryProductFocus || 'Pre-owned Car CRM'
  );
  const [secondary, setSecondary] = useState<AgxProductCategory>(
    partner.secondaryProductFocus || 'Car Rental CRM / GaadiDesk'
  );

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (primary === secondary) {
      toast.warning('Different Categories Required', 'SOP specifies one primary and a distinct secondary product category.');
      return;
    }

    onSaveFocus(primary, secondary);
    toast.success('Sprint Focus Configured', 'Your primary and secondary product categories have been updated.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-lg bg-white rounded-3xl border border-gray-200 shadow-2xl overflow-hidden"
      >
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-black text-[#CCFF00] font-black flex items-center justify-center">
              <SlidersHorizontal size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-gray-900 font-['Outfit']">
                Configure 7-Day Sprint Product Focus
              </h3>
              <p className="text-xs text-gray-500">
                SOP Rule: Do not sell 5 products simultaneously
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

        <div className="bg-amber-50 border-b border-amber-100 px-5 py-2.5 text-[11px] text-amber-900 flex items-center gap-2">
          <AlertCircle size={14} className="shrink-0 text-amber-600" />
          <span>
            Focus 80% of daily outreach on your <strong>Primary Category</strong> and 20% on your <strong>Secondary Category</strong>.
          </span>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
          <div>
            <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">
              Primary Product Category (80% of Outreach) *
            </label>
            <CustomSelect
              value={primary}
              onChange={val => setPrimary(val as AgxProductCategory)}
              options={AGX_PRODUCT_CATEGORIES.map(p => ({
                value: p.id,
                label: p.name,
                description: p.targetAudience
              }))}
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">
              Secondary Product Category (20% of Outreach) *
            </label>
            <CustomSelect
              value={secondary}
              onChange={val => setSecondary(val as AgxProductCategory)}
              options={AGX_PRODUCT_CATEGORIES.map(p => ({
                value: p.id,
                label: p.name,
                description: p.targetAudience
              }))}
            />
          </div>

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
              <Check size={14} className="text-[#CCFF00]" />
              Save Sprint Focus
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

