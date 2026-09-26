// Data Export & Dynamic Invoice & Quotation PDF Generator Service
import { Invoice, Quotation } from '../types/crm';
import { renderInvoiceHtml, renderQuotationHtml } from './pdfTemplates';

/**
 * Universal print handler that handles both popups and blocked-popup iframe fallbacks
 */
function printHtmlDocument(htmlContent: string): void {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    return;
  }

  // Fallback: If browser popup blocker intercepts window.open, print via background iframe
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
    doc.write(htmlContent);
    doc.close();
    setTimeout(() => {
      printFrame.contentWindow?.focus();
      printFrame.contentWindow?.print();
      setTimeout(() => {
        if (printFrame.parentNode) {
          document.body.removeChild(printFrame);
        }
      }, 1500);
    }, 400);
  }
}

export const exportService = {
  // Generate & Print/Download Professional AGX Invoice PDF (GST Tax Invoice or Non-GST Commercial Invoice)
  generateInvoicePdf(invoice: Invoice, clientGstin?: string) {
    const html = renderInvoiceHtml(invoice, clientGstin);
    printHtmlDocument(html);
  },

  // Generate & Print/Download Professional AGX Quotation / Commercial Proposal PDF
  generateQuotationPdf(quotation: Quotation) {
    const html = renderQuotationHtml(quotation);
    printHtmlDocument(html);
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
