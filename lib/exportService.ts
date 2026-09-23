// Data Export & Dynamic Invoice & Quotation PDF Generator Service
import { Invoice, Quotation, Lead, Client, Payment, Expense } from '../types/crm';

export const exportService = {
  // Generate & Print/Download Professional Invoice PDF (GST Tax Invoice or Non-GST Commercial Invoice)
  generateInvoicePdf(invoice: Invoice, clientGstin?: string) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to download/print the invoice PDF.');
      return;
    }

    const isGst = invoice.isGst !== false;
    const effectiveClientGstin = clientGstin || invoice.clientGstin;
    const gstType = invoice.gstType || 'IGST';
    const taxRate = isGst ? (invoice.taxRate ?? 18) : 0;
    const hsnCode = invoice.hsnSacCode || '998313';

    // Tax breakdown
    const cgstAmount = isGst && gstType === 'CGST_SGST' ? Math.round((invoice.tax || 0) / 2) : (invoice.cgst || 0);
    const sgstAmount = isGst && gstType === 'CGST_SGST' ? Math.round((invoice.tax || 0) / 2) : (invoice.sgst || 0);
    const igstAmount = isGst && gstType === 'IGST' ? (invoice.tax || 0) : (invoice.igst || 0);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${isGst ? 'Tax Invoice' : 'Commercial Invoice'} - ${invoice.invoiceNumber}</title>
        <meta charset="utf-8" />
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Plus Jakarta Sans', sans-serif; color: #111827; background: #fff; padding: 40px; }
          .invoice-container { max-width: 800px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 25px; border-bottom: 2px solid #000; padding-bottom: 20px; }
          .brand-logo { font-size: 28px; font-weight: 900; font-style: italic; letter-spacing: -1px; }
          .brand-logo span { color: #84CC16; }
          .doc-type-tag { display: inline-block; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 3px 8px; border-radius: 6px; margin-top: 4px; ${isGst ? 'background: #F3F4F6; color: #1F2937; border: 1px solid #D1D5DB;' : 'background: #EFF6FF; color: #1D4ED8; border: 1px solid #BFDBFE;'} }
          .company-info { text-align: right; font-size: 11px; color: #4B5563; line-height: 1.6; }
          .invoice-meta { display: flex; justify-content: space-between; margin-bottom: 25px; gap: 20px; }
          .meta-box { flex: 1; background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 12px; padding: 14px 16px; }
          .meta-box h4 { font-size: 10px; text-transform: uppercase; color: #6B7280; margin-bottom: 6px; letter-spacing: 0.5px; }
          .meta-box p { font-size: 13px; font-weight: 700; color: #111827; }
          .meta-box span { font-size: 11px; color: #4B5563; display: block; margin-top: 2px; }
          .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; }
          .badge-paid { background: #ECFDF5; color: #059669; border: 1px solid #A7F3D0; }
          .badge-sent { background: #EFF6FF; color: #2563EB; border: 1px solid #BFDBFE; }
          .badge-overdue { background: #FEF2F2; color: #DC2626; border: 1px solid #FECACA; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 12px; }
          th { background: #F3F4F6; text-align: left; padding: 10px 14px; font-weight: 700; text-transform: uppercase; font-size: 10px; color: #374151; border-bottom: 1px solid #E5E7EB; }
          td { padding: 12px 14px; border-bottom: 1px solid #E5E7EB; color: #1F2937; }
          .text-right { text-align: right; }
          .totals-section { display: flex; justify-content: flex-end; margin-bottom: 25px; }
          .totals-table { width: 340px; font-size: 12px; }
          .totals-row { display: flex; justify-content: space-between; padding: 5px 0; color: #4B5563; }
          .totals-row.grand-total { border-top: 2px solid #111827; padding-top: 10px; margin-top: 6px; font-size: 15px; font-weight: 800; color: #111827; }
          .banking-box { background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 12px; padding: 16px; font-size: 11px; line-height: 1.6; margin-bottom: 20px; }
          .banking-box h5 { font-size: 11px; font-weight: 800; margin-bottom: 6px; text-transform: uppercase; color: #111827; }
          .gst-declaration { background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 8px; padding: 10px 14px; font-size: 10px; color: #92400E; margin-bottom: 20px; line-height: 1.5; }
          .footer { text-align: center; font-size: 10px; color: #9CA3AF; border-top: 1px solid #E5E7EB; padding-top: 16px; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="header">
            <div>
              <div class="brand-logo">AG<span>X</span></div>
              <p style="font-size: 11px; color: #4B5563; margin-top: 2px; font-weight: 600;">AGXperience Technologies Private Limited</p>
              ${isGst ? '<p style="font-size: 10px; color: #6B7280; margin-top: 2px;"><strong>GSTIN:</strong> 29AABCA9081F1Z2 | <strong>State:</strong> Karnataka (29)</p>' : '<p style="font-size: 10px; color: #6B7280; margin-top: 2px;">Corporate ID: U72200KA2026PTC123456</p>'}
              <span class="doc-type-tag">${isGst ? 'TAX INVOICE' : 'COMMERCIAL INVOICE / NON-GST'}</span>
            </div>
            <div class="company-info">
              <strong style="font-size: 13px; color: #111827;">Invoice #: ${invoice.invoiceNumber}</strong><br />
              Issue Date: ${invoice.issueDate}<br />
              Due Date: ${invoice.dueDate}<br />
              ${invoice.quotationNumber ? `<span style="display: inline-block; font-size: 10px; font-weight: 700; color: #4F46E5; background: #EEF2FF; border: 1px solid #C7D2FE; padding: 2px 6px; border-radius: 4px; margin-top: 3px;">Quote #${invoice.quotationNumber}</span><br />` : ''}
              <div style="margin-top: 6px;">
                <span class="badge ${invoice.status === 'Paid' ? 'badge-paid' : invoice.status === 'Overdue' ? 'badge-overdue' : 'badge-sent'}">${invoice.status}</span>
              </div>
            </div>
          </div>

          <div class="invoice-meta">
            <div class="meta-box">
              <h4>Billed To (Client Details):</h4>
              <p>${invoice.clientName}</p>
              ${effectiveClientGstin ? `<span><strong>Client GSTIN:</strong> ${effectiveClientGstin}</span>` : ''}
              ${invoice.projectName ? `<span><strong>Project:</strong> ${invoice.projectName}</span>` : ''}
              ${!isGst ? '<span><strong>Classification:</strong> Non-GST Supply / Export</span>' : ''}
            </div>
            <div class="meta-box" style="text-align: right;">
              <h4>Payment & Supply Details:</h4>
              <p>Net 15 Days</p>
              <span><strong>Currency:</strong> INR (₹)</span>
              ${isGst ? `<span><strong>Supply Type:</strong> ${gstType === 'CGST_SGST' ? 'Intra-State (CGST + SGST)' : 'Inter-State (IGST)'}</span>` : '<span><strong>Supply Type:</strong> Non-Taxable / Exempt Supply</span>'}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: ${isGst ? '42%' : '52%'};">Description / Scope of Work</th>
                ${isGst ? '<th style="width: 14%;">HSN/SAC</th>' : ''}
                <th class="text-right" style="width: 10%;">Qty</th>
                <th class="text-right" style="width: 17%;">Unit Price</th>
                <th class="text-right" style="width: 17%;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${(invoice.items || []).map((item: any) => `
                <tr>
                  <td>
                    <strong>${item.description || 'AI & Enterprise Automation Services'}</strong>
                  </td>
                  ${isGst ? `<td><span style="font-family: monospace; font-size: 11px; color: #4B5563;">${item.hsnSac || hsnCode}</span></td>` : ''}
                  <td class="text-right">${item.quantity || 1}</td>
                  <td class="text-right">₹${Number(item.unitPrice || invoice.subtotal || invoice.total).toLocaleString('en-IN')}</td>
                  <td class="text-right"><strong>₹${Number(item.total || invoice.total).toLocaleString('en-IN')}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals-section">
            <div class="totals-table">
              <div class="totals-row">
                <span>Taxable Subtotal:</span>
                <span>₹${Number(invoice.subtotal || invoice.total).toLocaleString('en-IN')}</span>
              </div>

              ${invoice.discountAmount ? `
                <div class="totals-row" style="color: #059669; font-weight: 700;">
                  <span>Discount Applied:</span>
                  <span>- ₹${Number(invoice.discountAmount).toLocaleString('en-IN')}</span>
                </div>
              ` : ''}
              
              ${isGst ? `
                ${gstType === 'CGST_SGST' ? `
                  <div class="totals-row">
                    <span>CGST (${taxRate / 2}%):</span>
                    <span>₹${Number(cgstAmount).toLocaleString('en-IN')}</span>
                  </div>
                  <div class="totals-row">
                    <span>SGST (${taxRate / 2}%):</span>
                    <span>₹${Number(sgstAmount).toLocaleString('en-IN')}</span>
                  </div>
                ` : `
                  <div class="totals-row">
                    <span>IGST (${taxRate}%):</span>
                    <span>₹${Number(igstAmount || invoice.tax || 0).toLocaleString('en-IN')}</span>
                  </div>
                `}
              ` : `
                <div class="totals-row" style="color: #6B7280; font-size: 11px;">
                  <span>GST (0% / Non-GST Supply):</span>
                  <span>₹0</span>
                </div>
              `}

              <div class="totals-row grand-total">
                <span>Grand Total:</span>
                <span>₹${Number(invoice.total).toLocaleString('en-IN')}</span>
              </div>

              ${invoice.paidAmount ? `
                <div class="totals-row" style="color: #059669; font-weight: 700; margin-top: 4px;">
                  <span>Amount Received:</span>
                  <span>- ₹${Number(invoice.paidAmount).toLocaleString('en-IN')}</span>
                </div>
                <div class="totals-row" style="color: #DC2626; font-weight: 800; border-top: 1px solid #E5E7EB; padding-top: 4px;">
                  <span>Balance Due:</span>
                  <span>₹${Number(invoice.total - (invoice.paidAmount || 0)).toLocaleString('en-IN')}</span>
                </div>
              ` : ''}
            </div>
          </div>

          ${invoice.termsConditions ? `
            <div style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 12px 14px; font-size: 11px; margin-bottom: 20px; line-height: 1.5;">
              <strong style="color: #111827; display: block; margin-bottom: 4px;">Terms & Conditions:</strong>
              <div style="color: #4B5563; white-space: pre-line;">${invoice.termsConditions}</div>
            </div>
          ` : ''}

          ${isGst ? `
            <div class="gst-declaration">
              <strong>Declaration:</strong> Certified that the particulars given above are true and correct and the amount indicated represents the price actually charged. Supply is covered under SAC 998313 (Information Technology & AI Solutions). Reverse Charge mechanism is <strong>Not Applicable</strong>.
            </div>
          ` : `
            <div class="gst-declaration" style="background: #F0FDF4; border-color: #BBF7D0; color: #166534;">
              <strong>Non-GST Note:</strong> This commercial invoice is issued for non-taxable / export services without payment of tax under Letter of Undertaking (LUT) or exempt supply category.
            </div>
          `}

          <div class="banking-box">
            <h5>Bank Wire / UPI Payment Coordinates</h5>
            <p><strong>Bank:</strong> HDFC Bank Ltd | Indiranagar Branch, Bengaluru</p>
            <p><strong>Account Name:</strong> AGXperience Technologies Private Limited</p>
            <p><strong>Account Number:</strong> 50200084920192 | <strong>IFSC Code:</strong> HDFC0001209</p>
            <p><strong>UPI ID:</strong> agxperience@hdfcbank</p>
          </div>

          <div class="footer">
            <p>Thank you for partnering with AGXperience. For accounting questions, contact accounts@agxperience.com.</p>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  },

  // Generate & Print/Download Professional Quotation / Estimate PDF
  generateQuotationPdf(quotation: Quotation) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to download/print the quotation PDF.');
      return;
    }

    const isGst = quotation.isGst !== false;
    const gstType = quotation.gstType || 'IGST';
    const taxRate = isGst ? (quotation.taxRate ?? 18) : 0;
    const hsnCode = quotation.hsnSacCode || '998313';

    const cgstAmount = isGst && gstType === 'CGST_SGST' ? Math.round((quotation.tax || 0) / 2) : (quotation.cgst || 0);
    const sgstAmount = isGst && gstType === 'CGST_SGST' ? Math.round((quotation.tax || 0) / 2) : (quotation.sgst || 0);
    const igstAmount = isGst && gstType === 'IGST' ? (quotation.tax || 0) : (quotation.igst || 0);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Commercial Quotation - ${quotation.quotationNumber}</title>
        <meta charset="utf-8" />
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Plus Jakarta Sans', sans-serif; color: #111827; background: #fff; padding: 40px; }
          .quote-container { max-width: 800px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 25px; border-bottom: 2px solid #000; padding-bottom: 20px; }
          .brand-logo { font-size: 28px; font-weight: 900; font-style: italic; letter-spacing: -1px; }
          .brand-logo span { color: #84CC16; }
          .doc-type-tag { display: inline-block; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 3px 8px; border-radius: 6px; margin-top: 4px; background: #EEF2FF; color: #3730A3; border: 1px solid #C7D2FE; }
          .company-info { text-align: right; font-size: 11px; color: #4B5563; line-height: 1.6; }
          .quote-meta { display: flex; justify-content: space-between; margin-bottom: 25px; gap: 20px; }
          .meta-box { flex: 1; background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 12px; padding: 14px 16px; }
          .meta-box h4 { font-size: 10px; text-transform: uppercase; color: #6B7280; margin-bottom: 6px; letter-spacing: 0.5px; }
          .meta-box p { font-size: 13px; font-weight: 700; color: #111827; }
          .meta-box span { font-size: 11px; color: #4B5563; display: block; margin-top: 2px; }
          .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; }
          .badge-accepted { background: #ECFDF5; color: #059669; border: 1px solid #A7F3D0; }
          .badge-sent { background: #EFF6FF; color: #2563EB; border: 1px solid #BFDBFE; }
          .badge-draft { background: #F3F4F6; color: #4B5563; border: 1px solid #E5E7EB; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 12px; }
          th { background: #F3F4F6; text-align: left; padding: 10px 14px; font-weight: 700; text-transform: uppercase; font-size: 10px; color: #374151; border-bottom: 1px solid #E5E7EB; }
          td { padding: 12px 14px; border-bottom: 1px solid #E5E7EB; color: #1F2937; }
          .text-right { text-align: right; }
          .totals-section { display: flex; justify-content: flex-end; margin-bottom: 25px; }
          .totals-table { width: 340px; font-size: 12px; }
          .totals-row { display: flex; justify-content: space-between; padding: 5px 0; color: #4B5563; }
          .totals-row.grand-total { border-top: 2px solid #111827; padding-top: 10px; margin-top: 6px; font-size: 15px; font-weight: 800; color: #111827; }
          .terms-box { background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 12px; padding: 16px; font-size: 11px; line-height: 1.6; margin-bottom: 25px; }
          .terms-box h5 { font-size: 11px; font-weight: 800; margin-bottom: 6px; text-transform: uppercase; color: #111827; }
          .sig-section { display: flex; justify-content: space-between; margin-top: 30px; gap: 30px; }
          .sig-card { flex: 1; border: 1px dashed #CBD5E1; border-radius: 12px; padding: 16px; text-align: left; }
          .sig-line { border-bottom: 1px solid #94A3B8; height: 35px; margin-bottom: 6px; }
          .footer { text-align: center; font-size: 10px; color: #9CA3AF; border-top: 1px solid #E5E7EB; padding-top: 16px; margin-top: 25px; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="quote-container">
          <div class="header">
            <div>
              <div class="brand-logo">AG<span>X</span></div>
              <p style="font-size: 11px; color: #4B5563; margin-top: 2px; font-weight: 600;">AGXperience Technologies Private Limited</p>
              ${isGst ? '<p style="font-size: 10px; color: #6B7280; margin-top: 2px;"><strong>GSTIN:</strong> 29AABCA9081F1Z2 | <strong>State:</strong> Karnataka (29)</p>' : '<p style="font-size: 10px; color: #6B7280; margin-top: 2px;">Corporate ID: U72200KA2026PTC123456</p>'}
              <span class="doc-type-tag">COMMERCIAL PROPOSAL & ESTIMATE</span>
            </div>
            <div class="company-info">
              <strong style="font-size: 13px; color: #111827;">Quotation #: ${quotation.quotationNumber}</strong><br />
              Issue Date: ${quotation.issueDate}<br />
              Valid Until: <strong>${quotation.validUntil}</strong><br />
              <div style="margin-top: 6px;">
                <span class="badge ${quotation.status === 'Accepted' || quotation.status === 'Converted' ? 'badge-accepted' : quotation.status === 'Draft' ? 'badge-draft' : 'badge-sent'}">${quotation.status}</span>
              </div>
            </div>
          </div>

          <div class="quote-meta">
            <div class="meta-box">
              <h4>Prepared For:</h4>
              <p>${quotation.clientName}</p>
              ${quotation.leadName && quotation.leadName !== quotation.clientName ? `<span><strong>Contact:</strong> ${quotation.leadName}</span>` : ''}
              ${quotation.clientGstin ? `<span><strong>GSTIN:</strong> ${quotation.clientGstin}</span>` : ''}
              ${quotation.projectName ? `<span><strong>Project:</strong> ${quotation.projectName}</span>` : ''}
            </div>
            <div class="meta-box" style="text-align: right;">
              <h4>Quotation Terms:</h4>
              <p>Validity: 14 Calendar Days</p>
              <span><strong>Currency:</strong> INR (₹)</span>
              <span><strong>Tax Mode:</strong> ${isGst ? (gstType === 'CGST_SGST' ? 'Intra-State (CGST + SGST)' : 'Inter-State (IGST 18%)') : 'Export / Non-GST'}</span>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: ${isGst ? '42%' : '52%'};">Deliverable / Scope Specification</th>
                ${isGst ? '<th style="width: 14%;">HSN/SAC</th>' : ''}
                <th class="text-right" style="width: 10%;">Qty</th>
                <th class="text-right" style="width: 17%;">Unit Rate</th>
                <th class="text-right" style="width: 17%;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${(quotation.items || []).map((item: any) => `
                <tr>
                  <td>
                    <strong>${item.description || 'AI & Enterprise Software Deliverable'}</strong>
                  </td>
                  ${isGst ? `<td><span style="font-family: monospace; font-size: 11px; color: #4B5563;">${item.hsnSac || hsnCode}</span></td>` : ''}
                  <td class="text-right">${item.quantity || 1}</td>
                  <td class="text-right">₹${Number(item.unitPrice || 0).toLocaleString('en-IN')}</td>
                  <td class="text-right"><strong>₹${Number(item.total || 0).toLocaleString('en-IN')}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals-section">
            <div class="totals-table">
              <div class="totals-row">
                <span>Scope Subtotal:</span>
                <span>₹${Number(quotation.subtotal || quotation.total).toLocaleString('en-IN')}</span>
              </div>

              ${quotation.discountAmount ? `
                <div class="totals-row" style="color: #059669; font-weight: 700;">
                  <span>Commercial Discount:</span>
                  <span>- ₹${Number(quotation.discountAmount).toLocaleString('en-IN')}</span>
                </div>
              ` : ''}

              ${isGst ? `
                ${gstType === 'CGST_SGST' ? `
                  <div class="totals-row">
                    <span>CGST (${taxRate / 2}%):</span>
                    <span>₹${Number(cgstAmount).toLocaleString('en-IN')}</span>
                  </div>
                  <div class="totals-row">
                    <span>SGST (${taxRate / 2}%):</span>
                    <span>₹${Number(sgstAmount).toLocaleString('en-IN')}</span>
                  </div>
                ` : `
                  <div class="totals-row">
                    <span>IGST (${taxRate}%):</span>
                    <span>₹${Number(igstAmount || quotation.tax || 0).toLocaleString('en-IN')}</span>
                  </div>
                `}
              ` : ''}

              <div class="totals-row grand-total">
                <span>Estimated Grand Total:</span>
                <span>₹${Number(quotation.total).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div class="terms-box">
            <h5>Terms of Commercial Engagement:</h5>
            <div style="color: #4B5563; white-space: pre-line;">${quotation.termsConditions || `1. Pricing is valid until ${quotation.validUntil}. Beyond this date, scope and rates are subject to review.
2. Standard payment schedule: 50% milestone advance upon project kickoff, 50% upon successful staging sign-off.
3. Delivery timeline starts following formal quotation approval and access provisioning.
4. Formal Tax Invoice will be issued upon acceptance under statutory GST provisions.`}</div>
          </div>

          <div class="sig-section">
            <div class="sig-card">
              <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748B;">For AGXperience Technologies</span>
              <div class="sig-line"></div>
              <span style="font-size: 11px; font-weight: 700; color: #0F172A;">Authorized Commercial Signatory</span>
            </div>
            <div class="sig-card">
              <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748B;">Customer Acceptance Sign-Off (${quotation.clientName})</span>
              <div class="sig-line"></div>
              <span style="font-size: 11px; font-weight: 700; color: #0F172A;">Signatory Name, Title & Date</span>
            </div>
          </div>

          <div class="footer">
            Generated via AGX Business Operating System • Commercial proposal confidential between parties.
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  },

  // Export array to CSV (supports both (filename, rows) and (rows, filename))
  exportToCsv(arg1: string | object[], arg2?: object[] | string) {
    let filename = 'agx-crm-export.csv';
    let rows: object[] = [];

    if (typeof arg1 === 'string' && Array.isArray(arg2)) {
      filename = arg1;
      rows = arg2;
    } else if (Array.isArray(arg1)) {
      rows = arg1;
      if (typeof arg2 === 'string') filename = arg2;
    }

    if (!rows || rows.length === 0) return;
    const headers = Object.keys(rows[0]);
    const csvContent = [
      headers.join(','),
      ...rows.map(row => 
        headers.map(header => {
          const val = (row as any)[header];
          if (val === null || val === undefined) return '""';
          const escaped = String(val).replace(/"/g, '""');
          return `"${escaped}"`;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
    link.click();
  },

  // Parse CSV string into array of objects
  parseCsv(text: string): Record<string, string>[] {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => {
        obj[h] = values[i] || '';
      });
      return obj;
    });
  }
};
