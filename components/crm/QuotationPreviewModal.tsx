import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { X, Printer, CheckCircle2, Clock, Shield, ArrowRight, FileCheck, Copy, Check, AlertCircle } from 'lucide-react';
import { Quotation, QuotationStatus } from '../../types/crm';
import { toast } from '../../lib/toastStore';

interface QuotationPreviewModalProps {
  quotation: Quotation | null;
  onClose: () => void;
  onConvertToInvoice?: (quotationId: string) => void | Promise<void>;
  onUpdateStatus?: (quotationId: string, status: QuotationStatus) => void;
}

export const QuotationPreviewModal: React.FC<QuotationPreviewModalProps> = ({
  quotation,
  onClose,
  onConvertToInvoice,
  onUpdateStatus
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);
  const [copiedLink, setCopiedLink] = React.useState(false);

  if (!quotation) return null;

  const isGst = quotation.isGst !== false;
  const effectiveGstin = quotation.clientGstin || 'Unregistered / Exempt';
  const gstType = quotation.gstType || 'IGST';
  const taxRate = isGst ? (quotation.taxRate ?? 18) : 0;
  const hsnCode = quotation.hsnSacCode || '998313';

  // Tax calculations
  const cgstAmount = isGst && gstType === 'CGST_SGST' ? Math.round((quotation.tax || 0) / 2) : (quotation.cgst || 0);
  const sgstAmount = isGst && gstType === 'CGST_SGST' ? Math.round((quotation.tax || 0) / 2) : (quotation.sgst || 0);
  const igstAmount = isGst && gstType === 'IGST' ? (quotation.tax || 0) : (quotation.igst || 0);

  // Validity calculation
  const getValidityDaysLeft = () => {
    if (!quotation.validUntil) return null;
    try {
      const validDate = new Date(quotation.validUntil);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((validDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch {
      return null;
    }
  };

  const validityDays = getValidityDaysLeft();

  const handlePrint = () => {
    if (!printAreaRef.current) return;
    const content = printAreaRef.current.innerHTML;
    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    document.body.appendChild(printFrame);

    const doc = printFrame.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Commercial Quotation - ${quotation.quotationNumber}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'Plus Jakarta Sans', sans-serif; color: #111827; background: #fff; padding: 30px; }
            table { width: 100%; border-collapse: collapse; margin: 16px 0; }
            th { background: #f3f4f6; text-align: left; padding: 8px 12px; font-size: 11px; text-transform: uppercase; border-bottom: 1px solid #e5e7eb; }
            td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 12px; }
            .text-right { text-align: right; }
            .badge { display: inline-block; padding: 3px 8px; border-radius: 9999px; font-size: 10px; font-weight: 700; text-transform: uppercase; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          ${content}
        </body>
        </html>
      `);
      doc.close();
      setTimeout(() => {
        printFrame.contentWindow?.focus();
        printFrame.contentWindow?.print();
        setTimeout(() => document.body.removeChild(printFrame), 1000);
      }, 300);
    }
  };

  const handleCopySummary = () => {
    const summary = `📄 *Commercial Quotation: ${quotation.quotationNumber}*\n` +
      `Client: ${quotation.clientName}\n` +
      `Valid Until: ${quotation.validUntil}\n` +
      `Total Value: ₹${quotation.total.toLocaleString('en-IN')}\n` +
      `Status: ${quotation.status}\n` +
      `Items:\n` +
      (quotation.items || []).map((it, idx) => `  ${idx + 1}. ${it.description} (Qty: ${it.quantity}) - ₹${it.total.toLocaleString('en-IN')}`).join('\n');

    navigator.clipboard.writeText(summary);
    setCopiedLink(true);
    toast.success('Copied to Clipboard', 'Quotation summary copied.');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[95vh]"
      >
        {/* Modal Header */}
        <div className="p-4 sm:px-6 bg-gray-50 border-b border-gray-100 flex items-center justify-between flex-shrink-0 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black italic flex items-center justify-center text-sm shadow-xs">
              Q
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-gray-900 leading-none">
                  Quotation {quotation.quotationNumber}
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  quotation.status === 'Accepted' || quotation.status === 'Converted'
                    ? 'bg-emerald-100 text-emerald-800'
                    : quotation.status === 'Declined'
                    ? 'bg-rose-100 text-rose-800'
                    : quotation.status === 'Expired'
                    ? 'bg-gray-200 text-gray-700'
                    : 'bg-indigo-100 text-indigo-800'
                }`}>
                  {quotation.status}
                </span>
              </div>
              <span className="text-[11px] text-gray-400 block mt-0.5">
                Official Commercial Estimate & Proposal • Valid until {quotation.validUntil}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors btn-press"
              title="Copy Quotation Summary"
            >
              {copiedLink ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
              <span>{copiedLink ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-black hover:bg-gray-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-colors btn-press"
            >
              <Printer size={13} className="text-[#CCFF00]" />
              <span>Print / PDF</span>
            </button>
            {quotation.status !== 'Converted' && onConvertToInvoice && (
              <button
                onClick={() => onConvertToInvoice(quotation.id)}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md cursor-pointer transition-colors btn-press"
              >
                <ArrowRight size={13} />
                <span>Convert to Invoice</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-black rounded-lg hover:bg-gray-200 transition-colors cursor-pointer btn-press"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Quotation Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 text-xs text-gray-800" ref={printAreaRef}>
          {/* Header */}
          <div className="flex justify-between items-start pb-6 border-b-2 border-gray-900 gap-4">
            <div>
              <div className="text-2xl font-black italic tracking-tighter text-gray-900">
                AG<span className="text-lime-600">X</span>
              </div>
              <p className="font-bold text-gray-900 text-xs mt-0.5">AGXperience Technologies Private Limited</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Corporate ID: U72200KA2026PTC123456</p>
              {isGst ? (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                    <Shield size={10} className="text-emerald-600" /> Verified GSTIN: 29AABCA9081F1Z2
                  </span>
                  <span className="text-[10px] text-gray-500">State: Karnataka (29)</span>
                </div>
              ) : (
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded mt-1 inline-block">
                  Export / Non-GST Supply under LUT
                </span>
              )}
            </div>

            <div className="text-right">
              <span className="inline-block font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider mb-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200">
                Commercial Quotation
              </span>
              <div className="text-sm font-extrabold text-gray-900 tabular-nums">#{quotation.quotationNumber}</div>
              <div className="text-[11px] text-gray-500 mt-0.5 tabular-nums">Date: {quotation.issueDate}</div>
              <div className="text-[11px] text-indigo-700 font-semibold tabular-nums">
                Valid Until: {quotation.validUntil}
                {validityDays !== null && (
                  <span className="ml-1 text-[10px] text-gray-400">
                    ({validityDays > 0 ? `${validityDays}d left` : validityDays === 0 ? 'Expires today' : 'Expired'})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Metadata Cards */}
          <div className="grid grid-cols-2 gap-4 my-6">
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Prepared For:</span>
              <h4 className="font-extrabold text-sm text-gray-900">{quotation.clientName}</h4>
              {quotation.leadName && quotation.leadName !== quotation.clientName && (
                <p className="text-[11px] text-gray-600 mt-0.5"><strong>Primary Contact:</strong> {quotation.leadName}</p>
              )}
              {effectiveGstin && <p className="text-[11px] text-gray-600 mt-1"><strong>GSTIN:</strong> {effectiveGstin}</p>}
              {quotation.projectName && <p className="text-[11px] text-gray-600"><strong>Target Project:</strong> {quotation.projectName}</p>}
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Commercial Parameters:</span>
              <p className="font-bold text-gray-900 text-xs">
                {isGst ? (gstType === 'CGST_SGST' ? 'Intra-State (CGST + SGST 18%)' : 'Inter-State (IGST 18%)') : 'Zero-Rated / Export Supply'}
              </p>
              <p className="text-[11px] text-gray-600 mt-1"><strong>Default SAC:</strong> {hsnCode}</p>
              <p className="text-[11px] text-gray-600"><strong>Currency:</strong> INR (₹)</p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-gray-200 rounded-2xl overflow-hidden mb-6">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold uppercase text-gray-600">
                <tr>
                  <th className="py-2.5 px-4">Deliverable / Scope Specification</th>
                  <th className="py-2.5 px-3 text-center">SAC Code</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Unit Rate</th>
                  <th className="py-2.5 px-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs tabular-nums">
                {(quotation.items && quotation.items.length > 0 ? quotation.items : [{ description: 'Custom Software Architecture & AI Engineering', quantity: 1, unitPrice: quotation.subtotal, total: quotation.subtotal }]).map((item: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="py-3 px-4 font-semibold text-gray-900">{item.description}</td>
                    <td className="py-3 px-3 text-center text-gray-500 font-mono text-[11px]">{item.hsnSac || hsnCode}</td>
                    <td className="py-3 px-3 text-center text-gray-700">{item.quantity || 1}</td>
                    <td className="py-3 px-3 text-right font-mono text-gray-700">₹{(item.unitPrice || 0).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right font-bold font-mono text-gray-900">₹{(item.total || 0).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="flex justify-end mb-6">
            <div className="w-72 space-y-1.5 text-xs tabular-nums">
              <div className="flex justify-between text-gray-600">
                <span>Scope Subtotal:</span>
                <span className="font-mono font-bold text-gray-900">₹{(quotation.subtotal || 0).toLocaleString('en-IN')}</span>
              </div>

              {Boolean(quotation.discountAmount && quotation.discountAmount > 0) && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Special Discount:</span>
                  <span className="font-mono">- ₹{(quotation.discountAmount || 0).toLocaleString('en-IN')}</span>
                </div>
              )}

              {isGst && gstType === 'CGST_SGST' ? (
                <>
                  <div className="flex justify-between text-gray-600">
                    <span>CGST (9%):</span>
                    <span className="font-mono text-gray-900">₹{cgstAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>SGST (9%):</span>
                    <span className="font-mono text-gray-900">₹{sgstAmount.toLocaleString('en-IN')}</span>
                  </div>
                </>
              ) : isGst ? (
                <div className="flex justify-between text-gray-600">
                  <span>IGST (18%):</span>
                  <span className="font-mono text-gray-900">₹{igstAmount.toLocaleString('en-IN')}</span>
                </div>
              ) : null}

              <div className="flex justify-between pt-2 border-t-2 border-gray-900 text-sm font-extrabold text-gray-900">
                <span>Estimated Total:</span>
                <span className="font-mono text-indigo-700">₹{(quotation.total || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Terms & Conditions Block */}
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-[11px] mb-6">
            <span className="font-extrabold uppercase text-gray-900 block text-xs mb-1">Terms of Commercial Engagement:</span>
            <div className="text-gray-600 space-y-1 leading-relaxed whitespace-pre-line">
              {quotation.termsConditions || `1. Scope & Pricing Validity: This quotation is binding until ${quotation.validUntil}. Beyond this period, scope and rates are subject to review.
2. Payment Milestone Schedule: 50% advance upon formal contract signing and kickoff, 50% upon successful staging delivery.
3. Turnaround Timeline: Sprints commence within 2 business days following access handover.
4. Formal Tax Invoicing: Upon approval, a statutory GST Tax Invoice will be generated under SAC 998313.`}
            </div>
          </div>

          {/* Signatures & Approval Authorization */}
          <div className="pt-2 grid grid-cols-2 gap-6 text-[11px] border-t border-gray-200">
            <div className="p-3.5 rounded-xl border border-dashed border-gray-300">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Service Provider Authorization</span>
              <div className="h-8 flex items-end">
                <span className="font-mono italic font-bold text-gray-800 text-xs">Abhinav (Managing Partner)</span>
              </div>
              <div className="border-t border-gray-200 pt-1.5 text-[10px] text-gray-400">
                Authorized AGX Signatory • Date: {quotation.issueDate}
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-dashed border-gray-300">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Customer Approval & Acceptance</span>
              <div className="h-8 flex items-end">
                {quotation.status === 'Accepted' || quotation.status === 'Converted' ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 size={13} /> Formally Accepted on Record
                  </span>
                ) : (
                  <span className="text-gray-400 italic text-[11px]">Signatory Name & Seal upon sign-off</span>
                )}
              </div>
              <div className="border-t border-gray-200 pt-1.5 text-[10px] text-gray-400">
                Client Entity: {quotation.clientName}
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center text-[10px] text-gray-400 pt-4 border-t border-gray-100 mt-4">
            AGX Business Operating System • Commercial Proposal & Estimate • Legally valid electronic record.
          </div>
        </div>

        {/* Modal Status Controls Footer */}
        {onUpdateStatus && quotation.status !== 'Converted' && (
          <div className="p-3 px-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="text-gray-500 font-medium">Update Quotation Stage:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpdateStatus(quotation.id, 'Draft')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] cursor-pointer transition-colors ${
                  quotation.status === 'Draft' ? 'bg-black text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Draft
              </button>
              <button
                onClick={() => onUpdateStatus(quotation.id, 'Sent')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] cursor-pointer transition-colors ${
                  quotation.status === 'Sent' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Sent
              </button>
              <button
                onClick={() => onUpdateStatus(quotation.id, 'Accepted')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] cursor-pointer transition-colors ${
                  quotation.status === 'Accepted' ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                }`}
              >
                Accepted
              </button>
              <button
                onClick={() => onUpdateStatus(quotation.id, 'Declined')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] cursor-pointer transition-colors ${
                  quotation.status === 'Declined' ? 'bg-rose-600 text-white' : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                }`}
              >
                Declined
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
