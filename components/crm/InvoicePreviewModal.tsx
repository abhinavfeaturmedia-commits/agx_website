import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { X, Printer, Download, CheckCircle2, Building, IndianRupee, Shield } from 'lucide-react';
import { Invoice } from '../../types/crm';

interface InvoicePreviewModalProps {
  invoice: Invoice | null;
  onClose: () => void;
}

export const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({ invoice, onClose }) => {
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!invoice) return null;

  const isGst = invoice.isGst !== false;
  const effectiveGstin = invoice.clientGstin || 'Unregistered / Not Provided';
  const gstType = invoice.gstType || 'IGST';
  const taxRate = isGst ? (invoice.taxRate ?? 18) : 0;
  const hsnCode = invoice.hsnSacCode || '998313';

  // Tax calculations
  const cgstAmount = isGst && gstType === 'CGST_SGST' ? Math.round((invoice.tax || 0) / 2) : (invoice.cgst || 0);
  const sgstAmount = isGst && gstType === 'CGST_SGST' ? Math.round((invoice.tax || 0) / 2) : (invoice.sgst || 0);
  const igstAmount = isGst && gstType === 'IGST' ? (invoice.tax || 0) : (invoice.igst || 0);

  const balanceDue = Math.max(0, (invoice.total || 0) - (invoice.paidAmount || 0));
  const upiIntentUri = `upi://pay?pa=agxperience@hdfcbank&pn=AGXperience&am=${balanceDue}&cu=INR&tn=Invoice-${invoice.invoiceNumber}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&margin=0&data=${encodeURIComponent(upiIntentUri)}`;

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
          <title>${isGst ? 'Tax Invoice' : 'Commercial Invoice'} - ${invoice.invoiceNumber}</title>
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[95vh]"
      >
        {/* Modal Header */}
        <div className="p-4 sm:px-6 bg-gray-50 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-black text-[#CCFF00] font-black italic flex items-center justify-center text-sm">
              A
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-gray-900 leading-none">
                Invoice {invoice.invoiceNumber}
              </h3>
              <span className="text-[11px] text-gray-400 block mt-0.5">
                {isGst ? 'Official GST Tax Invoice' : 'Commercial Export Invoice'} • Net 15 Days
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-black hover:bg-gray-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-colors btn-press"
            >
              <Printer size={13} className="text-[#CCFF00]" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-black rounded-lg hover:bg-gray-200 transition-colors cursor-pointer btn-press"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Invoice Body */}
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
              <span className={`inline-block font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider mb-1.5 ${
                invoice.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : invoice.status === 'Overdue' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {invoice.status}
              </span>
              <div className="text-sm font-extrabold text-gray-900 tabular-nums">#{invoice.invoiceNumber}</div>
              <div className="text-[11px] text-gray-500 mt-0.5 tabular-nums">Issue: {invoice.issueDate}</div>
              <div className="text-[11px] text-gray-500 tabular-nums">Due: {invoice.dueDate}</div>
            </div>
          </div>

          {/* Metadata Cards */}
          <div className="grid grid-cols-2 gap-4 my-6">
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Billed To (Customer):</span>
              <h4 className="font-extrabold text-sm text-gray-900">{invoice.clientName}</h4>
              {effectiveGstin && <p className="text-[11px] text-gray-600 mt-1"><strong>GSTIN:</strong> {effectiveGstin}</p>}
              {invoice.projectName && <p className="text-[11px] text-gray-600"><strong>Project:</strong> {invoice.projectName}</p>}
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Tax & Supply Classification:</span>
              <p className="font-bold text-gray-900 text-xs">{isGst ? (gstType === 'CGST_SGST' ? 'Intra-State (CGST + SGST)' : 'Inter-State (IGST 18%)') : 'Zero-Rated / Non-GST Supply'}</p>
              <p className="text-[11px] text-gray-600 mt-1"><strong>HSN/SAC Code:</strong> {hsnCode}</p>
              <p className="text-[11px] text-gray-600"><strong>Currency:</strong> INR (₹)</p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-gray-200 rounded-2xl overflow-hidden mb-6">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold uppercase text-gray-600">
                <tr>
                  <th className="py-2.5 px-4">Item Description</th>
                  <th className="py-2.5 px-3 text-center">SAC Code</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Unit Price</th>
                  <th className="py-2.5 px-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs tabular-nums">
                {(invoice.items && invoice.items.length > 0 ? invoice.items : [{ description: 'AI Development & Software Delivery Services', quantity: 1, unitPrice: invoice.subtotal || invoice.total, total: invoice.subtotal || invoice.total }]).map((item: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="py-3 px-4 font-semibold text-gray-900">{item.description}</td>
                    <td className="py-3 px-3 text-center text-gray-500 font-mono text-[11px]">{hsnCode}</td>
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
                <span>Subtotal (Taxable Value):</span>
                <span className="font-mono font-bold text-gray-900">₹{(invoice.subtotal || 0).toLocaleString('en-IN')}</span>
              </div>
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
                <span>Grand Total:</span>
                <span className="font-mono text-lime-700">₹{(invoice.total || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[11px] text-gray-500 pt-1">
                <span>Amount Paid:</span>
                <span className="font-mono">₹{(invoice.paidAmount || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[11px] font-bold text-amber-700">
                <span>Balance Due:</span>
                <span className="font-mono">₹{Math.max(0, (invoice.total || 0) - (invoice.paidAmount || 0)).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Banking & Remittance Instructions with Dynamic UPI QR Code */}
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-[11px] mb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <span className="font-extrabold uppercase text-gray-900 block text-xs mb-1">Electronic Remittance Instructions:</span>
              <div className="grid grid-cols-2 gap-2 text-gray-600">
                <div><strong>Account Name:</strong> AGXperience Technologies Pvt Ltd</div>
                <div><strong>Bank:</strong> HDFC Bank Ltd, Indiranagar</div>
                <div><strong>Account Number:</strong> 50200088921829</div>
                <div><strong>IFSC Code:</strong> HDFC0001234</div>
                <div><strong>UPI VPA:</strong> agxperience@hdfcbank</div>
                <div><strong>Card Settlement:</strong> Stripe Verified</div>
              </div>
              {balanceDue > 0 && (
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <a
                    href={upiIntentUri}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors"
                  >
                    <span>Instant Pay via UPI</span>
                  </a>
                  <a
                    href={`https://buy.stripe.com/test_inbound?client_reference_id=${encodeURIComponent(invoice.invoiceNumber)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black hover:bg-gray-800 text-[#CCFF00] font-bold text-[11px] transition-colors"
                  >
                    <span>Pay via Card (Stripe)</span>
                  </a>
                </div>
              )}
            </div>

            {balanceDue > 0 && (
              <div className="flex flex-col items-center justify-center p-2.5 bg-white rounded-xl border border-gray-200 shadow-xs shrink-0 text-center">
                <img
                  src={qrCodeUrl}
                  alt="UPI QR Code"
                  className="w-20 h-20 object-contain rounded"
                  loading="lazy"
                />
                <span className="text-[9px] font-bold text-gray-700 mt-1 uppercase tracking-wider">Scan & Pay via UPI</span>
                <span className="text-[8px] font-mono text-gray-400">GPay • PhonePe • Paytm</span>
              </div>
            )}
          </div>

          {/* Footer Note */}
          <div className="text-center text-[10px] text-gray-400 pt-3 border-t border-gray-100">
            This is a computer-generated commercial tax invoice and is valid without physical signature under the Information Technology Act.
          </div>
        </div>
      </motion.div>
    </div>
  );
};
