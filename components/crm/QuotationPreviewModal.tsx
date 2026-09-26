import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Printer, ArrowRight, Copy, Check, CheckCircle2 } from 'lucide-react';
import { Quotation, QuotationStatus } from '../../types/crm';
import { AGX_BRAND, numberToIndianWords, formatDisplayDate } from '../../lib/pdfTemplates';
import { exportService } from '../../lib/exportService';
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
  const [copiedLink, setCopiedLink] = useState(false);

  if (!quotation) return null;

  const isGst = quotation.isGst !== false;
  const effectiveGstin = quotation.clientGstin || 'Unregistered / Commercial Partner';
  const gstType = quotation.gstType || 'IGST';
  const taxRate = isGst ? (quotation.taxRate ?? 18) : 0;
  const hsnCode = quotation.hsnSacCode || AGX_BRAND.defaultSacCode;

  // Tax calculations
  const cgstAmount = isGst && gstType === 'CGST_SGST' ? Math.round((quotation.tax || 0) / 2) : (quotation.cgst || 0);
  const sgstAmount = isGst && gstType === 'CGST_SGST' ? Math.round((quotation.tax || 0) / 2) : (quotation.sgst || 0);
  const igstAmount = isGst && gstType === 'IGST' ? (quotation.tax || 0) : (quotation.igst || 0);

  const amountWords = numberToIndianWords(quotation.total || 0);

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
    exportService.generateQuotationPdf(quotation);
  };

  const handleCopySummary = () => {
    const summary = `📄 *Commercial Quotation: ${quotation.quotationNumber}*\n` +
      `Client: ${quotation.companyName || quotation.clientName}\n` +
      `Valid Until: ${quotation.validUntil}\n` +
      `Total Commercial Value: ₹${quotation.total.toLocaleString('en-IN')}\n` +
      `Status: ${quotation.status}\n` +
      `Scope Items:\n` +
      (quotation.items || []).map((it, idx) => `  ${idx + 1}. ${it.description} (Qty: ${it.quantity || 1}) - ₹${Number(it.total || 0).toLocaleString('en-IN')}`).join('\n');

    navigator.clipboard.writeText(summary);
    setCopiedLink(true);
    toast.success('Copied to Clipboard', 'Quotation summary copied.');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const items = quotation.items && quotation.items.length > 0 ? quotation.items : [
    {
      description: 'Comprehensive Enterprise AI Architecture, Technical Blueprint & Automated Workflows',
      quantity: 1,
      unitPrice: quotation.subtotal || quotation.total,
      total: quotation.subtotal || quotation.total,
      hsnSac: hsnCode
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[96vh]"
      >
        {/* Modal Controls Header */}
        <div className="p-4 sm:px-6 bg-slate-900 text-white flex items-center justify-between flex-shrink-0 border-b border-slate-800 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-black border border-white/20 flex items-center justify-center shadow-inner overflow-hidden shrink-0">
              <img src="/agx-brandmark-icon.png" alt="AGX" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-white tracking-tight">
                  Quotation {quotation.quotationNumber}
                </h3>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  quotation.status === 'Accepted' || quotation.status === 'Converted'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : quotation.status === 'Declined'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : quotation.status === 'Draft'
                    ? 'bg-slate-700 text-slate-300 border border-slate-600'
                    : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                }`}>
                  {quotation.status}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 block mt-0.5 font-medium">
                Official Commercial Proposal &bull; Valid until {quotation.validUntil}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors btn-press"
              title="Copy Summary to Clipboard"
            >
              {copiedLink ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span>{copiedLink ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-[#CCFF00] hover:bg-[#b5e600] text-black text-xs font-black flex items-center gap-2 shadow-lg shadow-[#CCFF00]/10 cursor-pointer transition-all btn-press"
              title="Print or Save as Vector PDF"
            >
              <Printer size={14} className="text-black" />
              <span>Print / Save PDF</span>
            </button>
            {quotation.status !== 'Converted' && onConvertToInvoice && (
              <button
                onClick={() => onConvertToInvoice(quotation.id)}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-colors btn-press"
              >
                <ArrowRight size={13} />
                <span>Convert to Invoice</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Quotation Sheet Preview */}
        <div className="p-6 sm:p-10 overflow-y-auto flex-1 text-xs text-[#1D1D1F] bg-[#F5F5F7]">
          <div className="max-w-[780px] mx-auto bg-white p-8 sm:p-10 rounded-2xl shadow-xs border border-black/5 relative">
            {/* Document Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start pb-6 border-b border-[#E5E5EA] gap-4">
              <div className="flex items-start gap-3.5">
                <img src="/agx-brandmark-icon.png" alt="AGX" className="w-11 h-11 shrink-0 rounded-xl object-cover shadow-xs" />
                <div>
                  <h1 className="text-lg font-bold text-[#1D1D1F] tracking-tight leading-tight">{AGX_BRAND.enterpriseName}</h1>
                  <p className="text-[11px] font-semibold text-[#515154] mt-0.5">{AGX_BRAND.legalEntity} &bull; {AGX_BRAND.tagline}</p>
                  <p className="text-[9.5px] text-[#86868B] mt-1.5 leading-relaxed">
                    MSME Udyam: <strong className="text-[#1D1D1F]">{AGX_BRAND.udyamRegNo}</strong> &bull; Shops &amp; Est. Reg: <strong className="text-[#1D1D1F]">{AGX_BRAND.gumastaRegNo}</strong> &bull; <span className="whitespace-nowrap">PAN: <strong className="text-[#1D1D1F]">{AGX_BRAND.pan}</strong></span><br />
                    {AGX_BRAND.addressLine1}, {AGX_BRAND.addressLine2} &bull; <span className="whitespace-nowrap">Mobile: <strong className="text-[#1D1D1F]">+91&nbsp;86691&nbsp;97971</strong></span> &bull; {AGX_BRAND.email}
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <div className="text-xl font-bold text-[#1D1D1F] uppercase tracking-tight">
                  Commercial Quotation
                </div>
                <div className="text-xs font-semibold text-[#86868B] font-mono mt-0.5">#{quotation.quotationNumber}</div>
                <div className="mt-1.5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider bg-[#F5F5F7] text-[#1D1D1F] border border-[#E5E5EA]">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      quotation.status === 'Accepted' || quotation.status === 'Converted' ? 'bg-[#34C759]' : quotation.status === 'Declined' ? 'bg-[#FF3B30]' : 'bg-[#0071E3]'
                    }`} />
                    {quotation.status}
                  </span>
                </div>
                <div className="text-[9.5px] text-[#86868B] mt-1 font-mono">Date: {formatDisplayDate(quotation.issueDate)}</div>
                <div className="text-[10.5px] text-[#0071E3] font-semibold mt-0.5">
                  Valid Until: {formatDisplayDate(quotation.validUntil)}
                  {validityDays !== null && (
                    <span className="ml-1 text-[9.5px] text-[#86868B] font-normal">
                      ({validityDays > 0 ? `${validityDays}d left` : validityDays === 0 ? 'Expires today' : 'Expired'})
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Symmetrical Bilateral Coordinates Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 my-6">
              <div>
                <span className="text-[8.5px] font-semibold uppercase tracking-widest text-[#86868B] block mb-1">
                  Prepared Exclusively For (Client Counterparty)
                </span>
                <h4 className="font-bold text-sm text-[#1D1D1F] mb-1.5">{quotation.companyName || quotation.clientName}</h4>
                <div className="space-y-1 text-[10px]">
                  <div className="flex items-baseline"><span className="w-28 text-[#86868B] shrink-0 font-medium">Attention Contact:</span><span className="font-semibold text-[#1D1D1F]">{quotation.leadName || quotation.clientName}</span></div>
                  <div className="flex items-baseline"><span className="w-28 text-[#86868B] shrink-0 font-medium">Client Status / GST:</span><span className="font-semibold text-[#1D1D1F]">{quotation.clientGstin ? 'Registered (' + quotation.clientGstin + ')' : 'Commercial Partner (Non-GST / Exempt)'}</span></div>
                  <div className="flex items-baseline"><span className="w-28 text-[#86868B] shrink-0 font-medium">Target Engagement:</span><span className="font-semibold text-[#1D1D1F]">{quotation.projectName || 'AI Systems Engineering & Bespoke Automation'}</span></div>
                  <div className="flex items-baseline"><span className="w-28 text-[#86868B] shrink-0 font-medium">Place of Supply:</span><span className="font-semibold text-[#1D1D1F]">{isGst ? (gstType === 'CGST_SGST' ? 'Maharashtra (27) - Intra-State' : 'Inter-State Supply') : 'Commercial Supply under MSME Exemption'}</span></div>
                  <div className="flex items-baseline"><span className="w-28 text-[#86868B] shrink-0 font-medium">Official Dispatch:</span><span className="font-semibold text-[#1D1D1F]">{quotation.clientEmail || 'Direct Counterparty Ledger'}</span></div>
                </div>
              </div>

              <div className="sm:border-l sm:border-[#E5E5EA] sm:pl-8">
                <span className="text-[8.5px] font-semibold uppercase tracking-widest text-[#86868B] block mb-1">
                  Quotation &amp; Commercial Parameters
                </span>
                <div className="text-[10px] space-y-1">
                  <div className="flex items-baseline"><span className="w-28 text-[#86868B] shrink-0 font-medium">Date of Issuance:</span><strong className="text-[#1D1D1F] font-semibold">{formatDisplayDate(quotation.issueDate)}</strong></div>
                  <div className="flex items-baseline"><span className="w-28 text-[#86868B] shrink-0 font-medium">Proposal Valid Until:</span><strong className="text-[#0071E3] font-semibold">{formatDisplayDate(quotation.validUntil)}</strong></div>
                  <div className="flex items-baseline"><span className="w-28 text-[#86868B] shrink-0 font-medium">Tax Regime:</span><strong className="text-[#1D1D1F] font-semibold">{isGst ? (gstType === 'CGST_SGST' ? 'Intra-State (CGST + SGST)' : 'Inter-State (IGST 18%)') : 'Zero-Rated / MSME Exemption'}</strong></div>
                  <div className="flex items-baseline"><span className="w-28 text-[#86868B] shrink-0 font-medium">Primary SAC Code:</span><strong className="font-mono text-[#1D1D1F] font-semibold">{hsnCode}</strong></div>
                  <div className="flex items-baseline"><span className="w-28 text-[#86868B] shrink-0 font-medium">Transaction Currency:</span><strong className="text-[#1D1D1F] font-semibold">INR (₹)</strong></div>
                </div>
              </div>
            </div>

            {/* Scope & Deliverables Table */}
            <div className="border-t border-[#E5E5EA] border-b border-[#E5E5EA] mb-6">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAFAFA] text-[#86868B] text-[8.5px] font-semibold uppercase tracking-wider border-b-[1.5px] border-b-[#1D1D1F]">
                  <tr>
                    <th className="py-2.5 px-3 text-center w-12">#</th>
                    <th className="py-2.5 px-4 w-[50%]">Deliverable Specification / Scope of Work</th>
                    <th className="py-2.5 px-3 text-center w-24">SAC Code</th>
                    <th className="py-2.5 px-3 text-center w-16">Qty</th>
                    <th className="py-2.5 px-3 text-right w-28">Unit Rate</th>
                    <th className="py-2.5 px-4 text-right w-32">Total Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5EA] text-[#1D1D1F]">
                  {items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#F5F5F7]/60 transition-colors">
                      <td className="py-3.5 px-3 text-center align-top font-medium text-[#86868B]">{idx + 1}</td>
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-semibold text-[#1D1D1F] text-xs leading-relaxed">{item.description}</div>
                      </td>
                      <td className="py-3.5 px-3 text-center align-top font-mono text-[11px] text-[#86868B]">{item.hsnSac || hsnCode}</td>
                      <td className="py-3.5 px-3 text-center align-top font-semibold">{item.quantity || 1}</td>
                      <td className="py-3.5 px-3 text-right align-top font-mono text-[#1D1D1F]">₹{Number(item.unitPrice || 0).toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-4 text-right align-top font-semibold font-mono text-[#1D1D1F]">₹{Number(item.total || 0).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary & Commercial Words Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 items-stretch">
              <div className="space-y-3 flex flex-col justify-between">
                {/* Amount in Words */}
                <div className="bg-[#F5F5F7] p-3.5 rounded-xl border border-[#E5E5EA]">
                  <span className="text-[8px] font-semibold uppercase tracking-wider text-[#86868B] block">
                    Total Commercial Value in Words:
                  </span>
                  <div className="text-xs font-semibold text-[#1D1D1F] mt-0.5">
                    {amountWords}
                  </div>
                </div>

                {/* Engagement Next Steps Note */}
                <div className="bg-[#FAFAFA] p-3.5 rounded-2xl border border-[#E5E5EA] text-[10px] text-[#515154] space-y-1">
                  <span className="font-bold uppercase text-[#1D1D1F] block tracking-wider text-[9px]">
                    Next Steps Following Approval
                  </span>
                  <div>1. Return this signed commercial proposal to <strong>{AGX_BRAND.email}</strong>.</div>
                  <div>2. A statutory Tax Invoice will be initiated along with access provisioning.</div>
                  <div>3. Architecture sprints commence within 48 business hours.</div>
                </div>
              </div>

              {/* Cupertino Financial Ledger */}
              <div className="bg-[#FAFAFA] p-4 rounded-2xl border border-[#E5E5EA] text-xs space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between text-[#6E6E73]">
                    <span>Scope Subtotal:</span>
                    <span className="font-mono font-semibold text-[#1D1D1F]">₹{Number(quotation.subtotal || quotation.total).toLocaleString('en-IN')}</span>
                  </div>

                  {Boolean(quotation.discountAmount && quotation.discountAmount > 0) && (
                    <div className="flex justify-between text-[#2E7D32] font-medium">
                      <span>Commercial Discount:</span>
                      <span className="font-mono">- ₹{Number(quotation.discountAmount).toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  {isGst ? (
                    gstType === 'CGST_SGST' ? (
                      <>
                        <div className="flex justify-between text-[#6E6E73] mt-1">
                          <span>CGST ({taxRate / 2}%):</span>
                          <span className="font-mono text-[#1D1D1F]">₹{Number(cgstAmount).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-[#6E6E73] mt-1">
                          <span>SGST ({taxRate / 2}%):</span>
                          <span className="font-mono text-[#1D1D1F]">₹{Number(sgstAmount).toLocaleString('en-IN')}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between text-[#6E6E73] mt-1">
                        <span>Estimated IGST ({taxRate}%):</span>
                        <span className="font-mono text-[#1D1D1F]">₹{Number(igstAmount || quotation.tax || 0).toLocaleString('en-IN')}</span>
                      </div>
                    )
                  ) : (
                    <div className="flex justify-between text-[#86868B] mt-1">
                      <span>Tax (MSME Exemption):</span>
                      <span className="font-mono">₹0</span>
                    </div>
                  )}
                </div>

                <div>
                  <div className="border-t-[1.5px] border-[#1D1D1F] my-2" />
                  <div className="flex justify-between items-baseline pt-1">
                    <span className="text-xs font-bold text-[#1D1D1F]">Estimated Grand Total:</span>
                    <span className="font-mono text-base font-bold text-[#1D1D1F]">₹{Number(quotation.total || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Statutory MSME Declaration */}
            <div className="bg-[#F5F5F7] border border-[#E5E5EA] text-[#515154] p-3 rounded-xl text-[9.5px] leading-relaxed mb-4">
              <strong>MSME & Statutory Declaration:</strong> Issued by <strong>{AGX_BRAND.enterpriseName}</strong>, registered as a Micro Enterprise under Government of India MSME (Udyam: <strong>{AGX_BRAND.udyamRegNo}</strong>) and Maharashtra Shops & Establishments Act (Reg: <strong>{AGX_BRAND.gumastaRegNo}</strong>). Supply covered under SAC Code 998313 (AI Automation & Systems Engineering). Reverse charge mechanism is <strong>Not Applicable</strong>.
            </div>

            {/* Terms of Commercial Engagement */}
            <div className="bg-[#FAFAFA] p-4 rounded-xl border border-[#E5E5EA] text-[9.5px] text-[#6E6E73] mb-6 leading-relaxed whitespace-pre-line">
              <strong className="text-[#1D1D1F] block mb-1 uppercase tracking-wider text-[9px]">
                Terms of Commercial Engagement:
              </strong>
              {quotation.termsConditions || `1. Pricing & Scope: Valid for 14 calendar days from the issue date.
2. Payment Schedule: 50% milestone advance upon project kickoff, 50% upon final acceptance & handover.
3. Turnaround Timeline: Work commences within 2 business days following access provisioning.
4. Tax Invoicing: Upon formal quote acceptance, a statutory Tax Invoice will be generated under SAC 998313.`}
            </div>

            {/* Executive Dual Signature Letterhead */}
            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-[#E5E5EA] text-[10px]">
              <div className="p-3.5 rounded-xl border border-[#E5E5EA] relative bg-white flex flex-col justify-between min-h-[110px]">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold uppercase text-[#86868B] text-[8.5px] tracking-wider">
                    For {AGX_BRAND.enterpriseName}
                  </span>
                  <span className="text-[8px] font-semibold text-[#065F46] bg-[#ECFDF5] border border-[#A7F3D0] px-2 py-0.5 rounded-full">
                    ✓ MSME AUTHORIZED
                  </span>
                </div>
                <div className="h-11 flex items-end mb-1">
                  <img src={AGX_BRAND.signaturePath} alt="Signature of Abhinav Ashok Gaikwad" className="h-10 object-contain" />
                </div>
                <div className="border-t-[1.5px] border-[#1D1D1F] pt-1.5">
                  <div className="font-bold text-[#1D1D1F] text-[11px]">{AGX_BRAND.proprietor}</div>
                  <div className="text-[9.5px] text-[#86868B]">{AGX_BRAND.designation}, {AGX_BRAND.enterpriseName}</div>
                  <div className="text-[7.5px] text-[#065F46] font-semibold mt-0.5">&check; Digitally Validated &amp; Handcrafted Authorisation</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-[#E5E5EA] bg-white flex flex-col justify-between min-h-[118px]">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-semibold uppercase text-[#86868B] text-[8.5px] tracking-wider">
                    Client Acceptance Sign-Off
                  </span>
                  <span className="text-[8px] font-semibold text-[#515154] bg-[#F5F5F7] border border-[#E5E5EA] px-2 py-0.5 rounded-full truncate max-w-[120px]">
                    {quotation.companyName || quotation.clientName}
                  </span>
                </div>
                <div className="space-y-1.5 text-[9px] text-[#6E6E73] my-1">
                  <div className="flex items-end"><span className="w-24 shrink-0">Signatory Name:</span><span className="flex-1 border-b border-dashed border-[#C7C7CC] h-0 mb-0.5"></span></div>
                  <div className="flex items-end"><span className="w-24 shrink-0">Designation:</span><span className="flex-1 border-b border-dashed border-[#C7C7CC] h-0 mb-0.5"></span></div>
                  <div className="flex items-end"><span className="w-24 shrink-0">Date of Sign-Off:</span><span className="flex-1 border-b border-dashed border-[#C7C7CC] h-0 mb-0.5"></span></div>
                </div>
                <div className="border-t border-[#E5E5EA] pt-1.5 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-[#1D1D1F] text-[10.5px]">{quotation.companyName || quotation.clientName}</div>
                    <div className="text-[8.5px] text-[#86868B]">Authorized Signatory</div>
                  </div>
                  <span className="text-[7.5px] font-semibold uppercase tracking-wider text-[#86868B] border border-dashed border-[#C7C7CC] px-2 py-1 rounded-sm">
                    Corporate Seal
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-[9px] text-[#86868B] pt-6 mt-4 border-t border-[#E5E5EA]">
              Generated via <strong>AGX Business OS</strong> &bull; Commercial Proposal Strictly Confidential &bull; {AGX_BRAND.website}
            </div>
          </div>
        </div>

        {/* Modal Status Controls Footer */}
        {onUpdateStatus && quotation.status !== 'Converted' && (
          <div className="p-3 px-6 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs flex-wrap gap-2">
            <span className="text-slate-600 font-semibold text-xs">Update Quotation Stage:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpdateStatus(quotation.id, 'Draft')}
                className={`px-3 py-1 rounded-lg font-bold text-xs cursor-pointer transition-colors ${
                  quotation.status === 'Draft' ? 'bg-black text-white' : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
                }`}
              >
                Draft
              </button>
              <button
                onClick={() => onUpdateStatus(quotation.id, 'Sent')}
                className={`px-3 py-1 rounded-lg font-bold text-xs cursor-pointer transition-colors ${
                  quotation.status === 'Sent' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
                }`}
              >
                Sent
              </button>
              <button
                onClick={() => onUpdateStatus(quotation.id, 'Accepted')}
                className={`px-3 py-1 rounded-lg font-bold text-xs cursor-pointer transition-colors ${
                  quotation.status === 'Accepted' ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-300'
                }`}
              >
                Accepted
              </button>
              <button
                onClick={() => onUpdateStatus(quotation.id, 'Declined')}
                className={`px-3 py-1 rounded-lg font-bold text-xs cursor-pointer transition-colors ${
                  quotation.status === 'Declined' ? 'bg-rose-600 text-white' : 'bg-white text-rose-800 hover:bg-rose-50 border border-rose-300'
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
