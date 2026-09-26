import React from 'react';
import { motion } from 'motion/react';
import { X, Printer } from 'lucide-react';
import { Invoice } from '../../types/crm';
import { AGX_BRAND, numberToIndianWords, formatDisplayDate } from '../../lib/pdfTemplates';
import { exportService } from '../../lib/exportService';

interface InvoicePreviewModalProps {
  invoice: Invoice | null;
  onClose: () => void;
}

export const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({ invoice, onClose }) => {
  if (!invoice) return null;

  const isGst = invoice.isGst !== false;
  const effectiveGstin = invoice.clientGstin || 'Unregistered / Exempt';
  const gstType = invoice.gstType || 'IGST';
  const taxRate = isGst ? (invoice.taxRate ?? 18) : 0;
  const hsnCode = invoice.hsnSacCode || AGX_BRAND.defaultSacCode;

  // Tax calculations
  const cgstAmount = isGst && gstType === 'CGST_SGST' ? Math.round((invoice.tax || 0) / 2) : (invoice.cgst || 0);
  const sgstAmount = isGst && gstType === 'CGST_SGST' ? Math.round((invoice.tax || 0) / 2) : (invoice.sgst || 0);
  const igstAmount = isGst && gstType === 'IGST' ? (invoice.tax || 0) : (invoice.igst || 0);

  const balanceDue = Math.max(0, (invoice.total || 0) - (invoice.paidAmount || 0));
  const amountWords = numberToIndianWords(invoice.total || 0);

  // Official Slice Bank UPI Payment QR Code Asset
  const qrCodeUrl = AGX_BRAND.paymentQrSquare;

  const handlePrint = () => {
    exportService.generateInvoicePdf(invoice, invoice.clientGstin);
  };

  const items = invoice.items && invoice.items.length > 0 ? invoice.items : [
    {
      description: 'Enterprise AI Systems Architecture & Cloud Engineering Services',
      quantity: 1,
      unitPrice: invoice.subtotal || invoice.total,
      total: invoice.subtotal || invoice.total,
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
        <div className="p-4 sm:px-6 bg-slate-900 text-white flex items-center justify-between flex-shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-black border border-white/20 flex items-center justify-center shadow-inner overflow-hidden shrink-0">
              <img src="/agx-brandmark-icon.png" alt="AGX" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-white tracking-tight">
                  Invoice {invoice.invoiceNumber}
                </h3>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  invoice.status === 'Paid'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : invoice.status === 'Overdue'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                }`}>
                  {invoice.status}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 block mt-0.5 font-medium">
                {isGst ? 'Official GST Tax Invoice' : 'Commercial Export Invoice under LUT'} • SAC {hsnCode}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-[#CCFF00] hover:bg-[#b5e600] text-black text-xs font-black flex items-center gap-2 shadow-lg shadow-[#CCFF00]/10 cursor-pointer transition-all btn-press"
              title="Print or Save as Vector PDF"
            >
              <Printer size={14} className="text-black" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet Preview */}
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
                  {isGst ? 'Tax Invoice' : 'Commercial Invoice'}
                </div>
                <div className="text-xs font-semibold text-[#86868B] font-mono mt-0.5">#{invoice.invoiceNumber}</div>
                {invoice.quotationNumber && (
                  <div className="text-[10px] font-semibold text-[#0071E3] mt-0.5">
                    Linked Quote: #{invoice.quotationNumber}
                  </div>
                )}
                <div className="mt-1.5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider bg-[#F5F5F7] text-[#1D1D1F] border border-[#E5E5EA]">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      invoice.status === 'Paid' ? 'bg-[#34C759]' : invoice.status === 'Overdue' ? 'bg-[#FF3B30]' : 'bg-[#0071E3]'
                    }`} />
                    {invoice.status}
                  </span>
                </div>
                <div className="text-[9.5px] text-[#86868B] mt-1 font-mono">Date: {formatDisplayDate(invoice.issueDate)} &bull; Due: {formatDisplayDate(invoice.dueDate)}</div>
              </div>
            </div>

            {/* Symmetrical Bilateral Coordinates Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 my-6">
              <div>
                <span className="text-[8.5px] font-semibold uppercase tracking-widest text-[#86868B] block mb-1">
                  Billed To (Client Counterparty)
                </span>
                <h4 className="font-bold text-sm text-[#1D1D1F] mb-1.5">{invoice.clientName}</h4>
                <div className="space-y-1 text-[10px]">
                  <div className="flex items-baseline"><span className="w-28 text-[#86868B] shrink-0 font-medium">Attention Contact:</span><span className="font-semibold text-[#1D1D1F]">{invoice.contactPerson || invoice.clientName}</span></div>
                  <div className="flex items-baseline"><span className="w-28 text-[#86868B] shrink-0 font-medium">Client Status / GST:</span><span className="font-semibold text-[#1D1D1F]">{effectiveGstin ? 'Registered (' + effectiveGstin + ')' : 'Commercial Client / Partner'}</span></div>
                  <div className="flex items-baseline"><span className="w-28 text-[#86868B] shrink-0 font-medium">Project Reference:</span><span className="font-semibold text-[#1D1D1F]">{invoice.projectName || 'AI Systems Engineering & Bespoke Automation'}</span></div>
                  <div className="flex items-baseline"><span className="w-28 text-[#86868B] shrink-0 font-medium">Place of Supply:</span><span className="font-semibold text-[#1D1D1F]">{isGst ? (gstType === 'CGST_SGST' ? 'Maharashtra (27) - Intra-State' : 'Inter-State Supply') : 'Commercial Supply under MSME Exemption'}</span></div>
                  <div className="flex items-baseline"><span className="w-28 text-[#86868B] shrink-0 font-medium">Official Dispatch:</span><span className="font-semibold text-[#1D1D1F]">{invoice.clientEmail || 'Direct Counterparty Ledger'}</span></div>
                </div>
              </div>

              <div className="sm:border-l sm:border-[#E5E5EA] sm:pl-8">
                <span className="text-[8.5px] font-semibold uppercase tracking-widest text-[#86868B] block mb-1">
                  Commercial &amp; Billing Coordinates
                </span>
                <div className="text-[10px] space-y-1">
                  <div className="flex items-baseline"><span className="w-28 text-[#86868B] shrink-0 font-medium">Invoice Date:</span><strong className="text-[#1D1D1F] font-semibold">{formatDisplayDate(invoice.issueDate)}</strong></div>
                  <div className="flex items-baseline"><span className="w-28 text-[#86868B] shrink-0 font-medium">Payment Due:</span><strong className="text-[#1D1D1F] font-semibold">{formatDisplayDate(invoice.dueDate)}</strong></div>
                  <div className="flex items-baseline"><span className="w-28 text-[#86868B] shrink-0 font-medium">Payment Terms:</span><strong className="text-[#1D1D1F] font-semibold">Net 15 Calendar Days</strong></div>
                  <div className="flex items-baseline"><span className="w-28 text-[#86868B] shrink-0 font-medium">Tax Treatment:</span><strong className="text-[#1D1D1F] font-semibold">{isGst ? (gstType === 'CGST_SGST' ? 'CGST (9%) + SGST (9%)' : 'IGST (18%)') : 'Zero-Rated / MSME Exemption'}</strong></div>
                  <div className="flex items-baseline"><span className="w-28 text-[#86868B] shrink-0 font-medium">Transaction Currency:</span><strong className="text-[#1D1D1F] font-semibold">INR (₹)</strong></div>
                </div>
              </div>
            </div>

            {/* Line Items Table with Minimalist Cupertino Styling */}
            <div className="border-t border-[#E5E5EA] border-b border-[#E5E5EA] mb-6">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAFAFA] text-[#86868B] text-[8.5px] font-semibold uppercase tracking-wider border-b-[1.5px] border-b-[#1D1D1F]">
                  <tr>
                    <th className="py-2.5 px-3 text-center w-12">#</th>
                    <th className="py-2.5 px-4 w-[50%]">Deliverable / Scope Specification</th>
                    <th className="py-2.5 px-3 text-center w-24">SAC Code</th>
                    <th className="py-2.5 px-3 text-center w-16">Qty</th>
                    <th className="py-2.5 px-3 text-right w-28">Unit Rate</th>
                    <th className="py-2.5 px-4 text-right w-32">Total</th>
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

            {/* Financial Summary & Bank Row - Balanced 2 Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 items-stretch">
              <div className="space-y-3 flex flex-col justify-between">
                {/* Amount in Words */}
                <div className="bg-[#F5F5F7] p-3.5 rounded-xl border border-[#E5E5EA]">
                  <span className="text-[8px] font-semibold uppercase tracking-wider text-[#86868B] block">
                    Invoice Amount in Words:
                  </span>
                  <div className="text-xs font-semibold text-[#1D1D1F] mt-0.5">
                    {amountWords}
                  </div>
                </div>

                {/* Apple Wallet-Style Remittance Card */}
                <div className="bg-[#FAFAFA] p-3.5 rounded-2xl border border-[#E5E5EA] flex items-center gap-3.5">
                  <div className="relative shrink-0">
                    <img
                      src={qrCodeUrl}
                      alt="Slice Official Payment QR"
                      className="w-20 h-20 bg-white p-1 rounded-xl border border-[#E5E5EA] object-contain"
                    />
                  </div>
                  <div className="text-[10px] text-[#515154] space-y-0.5 flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[9px] font-bold uppercase text-[#1D1D1F] tracking-wider">
                        Bank & Instant UPI Coordinates
                      </span>
                      <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-[#F3E8FF] text-[#7E22CE] border border-[#E9D5FF]">
                        slice
                      </span>
                    </div>
                    <div>Bank: <strong className="text-[#1D1D1F]">{AGX_BRAND.bank.bankName}</strong> ({AGX_BRAND.bank.branch})</div>
                    <div>A/C Name: <strong className="text-[#1D1D1F]">{AGX_BRAND.bank.accountHolderName}</strong></div>
                    <div>A/C No: <strong className="font-mono text-[#1D1D1F]">{AGX_BRAND.bank.accountNumber}</strong></div>
                    <div>IFSC: <strong className="font-mono text-[#1D1D1F]">{AGX_BRAND.bank.ifsc}</strong> &bull; Alt: <span className="font-mono text-[#6E6E73]">{AGX_BRAND.bank.alternateIfsc}</span></div>
                    <div>UPI ID: <strong className="font-mono text-[#059669]">{AGX_BRAND.bank.upiId}</strong></div>
                  </div>
                </div>
              </div>

              {/* Cupertino Financial Ledger */}
              <div className="bg-[#FAFAFA] p-4 rounded-2xl border border-[#E5E5EA] text-xs space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between text-[#6E6E73]">
                    <span>Taxable Subtotal:</span>
                    <span className="font-mono font-semibold text-[#1D1D1F]">₹{Number(invoice.subtotal || invoice.total).toLocaleString('en-IN')}</span>
                  </div>

                  {Boolean(invoice.discountAmount && invoice.discountAmount > 0) && (
                    <div className="flex justify-between text-[#2E7D32] font-medium">
                      <span>Promotional Discount:</span>
                      <span className="font-mono">- ₹{Number(invoice.discountAmount).toLocaleString('en-IN')}</span>
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
                        <span>IGST ({taxRate}%):</span>
                        <span className="font-mono text-[#1D1D1F]">₹{Number(igstAmount || invoice.tax || 0).toLocaleString('en-IN')}</span>
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
                    <span className="text-xs font-bold text-[#1D1D1F]">Grand Total:</span>
                    <span className="font-mono text-base font-bold text-[#1D1D1F]">₹{Number(invoice.total || 0).toLocaleString('en-IN')}</span>
                  </div>

                  {Boolean(invoice.paidAmount && invoice.paidAmount > 0) && (
                    <div className="flex justify-between text-[#059669] text-[11px] font-semibold mt-1">
                      <span>Amount Paid / Settled:</span>
                      <span className="font-mono">- ₹{Number(invoice.paidAmount).toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  {balanceDue > 0 ? (
                    <div className={`flex justify-between font-bold text-[11px] p-2 rounded-lg border mt-2 ${
                      invoice.status === 'Overdue'
                        ? 'text-[#9F1239] bg-[#FFF1F2] border-[#FECDD3]'
                        : 'text-[#1D1D1F] bg-[#F5F5F7] border-[#E5E5EA]'
                    }`}>
                      <span>Net Balance Due:</span>
                      <span className="font-mono">₹{Number(balanceDue).toLocaleString('en-IN')}</span>
                    </div>
                  ) : (
                    <div className="text-center font-semibold text-[#065F46] text-[10px] bg-[#ECFDF5] p-1.5 rounded-lg border border-[#A7F3D0] mt-2">
                      ✓ Invoice Fully Settled (Nil Balance)
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Statutory MSME Declaration (Quiet Legal Footnote) */}
            <div className="bg-[#F5F5F7] border border-[#E5E5EA] text-[#515154] p-3 rounded-xl text-[9.5px] leading-relaxed mb-4">
              <strong>MSME Declaration:</strong> Issued by <strong>{AGX_BRAND.enterpriseName}</strong>, registered as a Micro Enterprise under Government of India MSME (Udyam: <strong>{AGX_BRAND.udyamRegNo}</strong>) and Maharashtra Shops & Establishments Act (Reg: <strong>{AGX_BRAND.gumastaRegNo}</strong>). Supply covered under SAC Code 998313 (AI Software & IT Solutions). Reverse charge mechanism is <strong>Not Applicable</strong>.
            </div>

            {/* Commercial Terms & Conditions */}
            <div className="bg-[#FAFAFA] p-3.5 rounded-xl border border-[#E5E5EA] text-[9.5px] text-[#6E6E73] mb-6 leading-relaxed whitespace-pre-line">
              <strong className="text-[#1D1D1F] block mb-1">Payment &amp; Commercial Terms:</strong>
              {invoice.termsConditions || `1. Remittance Terms: Net payment is due within 15 calendar days from the date of invoice issuance.
2. Mode of Settlement: Direct electronic transfer (IMPS / NEFT / RTGS) or instant UPI to Slice Small Finance Bank.
3. Statutory Scheme: Issued under Government of India MSME Micro Enterprise Udyam framework; GST reverse charge is not applicable.
4. Late Settlement: Overdue accounts may be subject to commercial interest in accordance with the MSMED Act, 2006.`}
            </div>

            {/* Dual Signature Section */}
            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-[#E5E5EA] text-[10px]">
              <div className="p-3.5 rounded-xl border border-[#E5E5EA] relative bg-white flex flex-col justify-between min-h-[110px]">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold uppercase text-[#86868B] text-[8.5px] tracking-wider">
                    For {AGX_BRAND.enterpriseName}
                  </span>
                  <span className="text-[8px] font-semibold text-[#065F46] bg-[#ECFDF5] border border-[#A7F3D0] px-2 py-0.5 rounded-full">
                    ✓ MSME VERIFIED
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
                    Counterparty Acknowledgment
                  </span>
                  <span className="text-[8px] font-semibold text-[#515154] bg-[#F5F5F7] border border-[#E5E5EA] px-2 py-0.5 rounded-full truncate max-w-[120px]">
                    {invoice.clientName}
                  </span>
                </div>
                <div className="space-y-1.5 text-[9px] text-[#6E6E73] my-1">
                  <div className="flex items-end"><span className="w-24 shrink-0">Signatory Name:</span><span className="flex-1 border-b border-dashed border-[#C7C7CC] h-0 mb-0.5"></span></div>
                  <div className="flex items-end"><span className="w-24 shrink-0">Designation:</span><span className="flex-1 border-b border-dashed border-[#C7C7CC] h-0 mb-0.5"></span></div>
                  <div className="flex items-end"><span className="w-24 shrink-0">Date of Receipt:</span><span className="flex-1 border-b border-dashed border-[#C7C7CC] h-0 mb-0.5"></span></div>
                </div>
                <div className="border-t border-[#E5E5EA] pt-1.5 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-[#1D1D1F] text-[10.5px]">{invoice.clientName}</div>
                    <div className="text-[8.5px] text-[#86868B]">Authorized Counterparty Seal & Signature</div>
                  </div>
                  <span className="text-[7.5px] font-semibold uppercase tracking-wider text-[#86868B] border border-dashed border-[#C7C7CC] px-2 py-1 rounded-sm">
                    Corporate Seal
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-[9px] text-[#86868B] pt-6 mt-4 border-t border-[#E5E5EA]">
              Generated via <strong>AGX Business OS</strong> &bull; Commercial Instrument Strictly Confidential &bull; {AGX_BRAND.website}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
