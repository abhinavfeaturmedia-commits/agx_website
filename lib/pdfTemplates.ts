// Centralized High-Fidelity AGX Brand PDF & Document Template Engine
import { Invoice, Quotation } from '../types/crm';
import { AGX_BRANDMARK_BASE64 } from './agxLogoBase64';

// Official AGX Corporate & Commercial Identity Constants (Verified via MSME Udyam & Maharashtra Shops & Establishment)
export const AGX_BRAND = {
  enterpriseName: 'AGXPERIENCE',
  legalEntity: 'AGXPERIENCE (Proprietary Enterprise)',
  companyName: 'AGXPERIENCE',
  brandShortName: 'AGX',
  tagline: 'AI Automation & Systems Engineering',
  proprietor: 'ABHINAV ASHOK GAIKWAD',
  signatoryName: 'ABHINAV ASHOK GAIKWAD',
  designation: 'Proprietor & Founder',
  signatoryTitle: 'Proprietor & Founder',
  udyamRegNo: 'UDYAM-MH-15-0283607',
  msmeCategory: 'Micro Enterprise (Services)',
  gumastaRegNo: '2631200320939846',
  pan: 'CKGPG8393E',
  gstin: 'Exempt / Non-GST Registered (MSME Micro)',
  stateName: 'Maharashtra',
  stateCode: '27',
  district: 'Kolhapur',
  addressLine1: 'Rankala Tower, Karvir, Kolhapur',
  addressLine2: 'Maharashtra 416012, India',
  phone: '+91 86691 97971',
  email: 'abhinavagxprience@gmail.com',
  billingEmail: 'abhinavagxprience@gmail.com',
  website: 'https://agxperience.com',
  defaultSacCode: '998313',
  nicCode: '62099',
  sacDescription: 'Information Technology Software Development & AI Engineering Services',
  signaturePath: '/signature.png',
  signatureUrl: '/signature.png',
  paymentQrSquare: '/payment-qr-square.png',
  paymentQrCard: '/payment-qr.jpg',
  brandmarkSquare: '/agx-brandmark.png',
  brandmarkIcon: '/agx-brandmark-icon.png',
  brandmarkSvg: '/agx-brandmark.svg',
  bank: {
    accountHolderName: 'ABHINAV ASHOK GAIKWAD',
    bankName: 'Slice Small Finance Bank',
    branch: 'Koramangala, Bangalore',
    accountNumber: '033325222958361',
    accountType: 'Current / Business Account',
    ifsc: 'NESF0000333',
    alternateIfsc: 'NESF0000096',
    upiId: '8669197971@slc',
    alternateUpiId: '033325222958361@slice'
  }
};

/**
 * Executive Human Date Formatter
 * Converts ISO strings (2026-09-25) into executive human typography (25 Sep 2026).
 */
export function formatDisplayDate(dateStr?: string): string {
  if (!dateStr) return 'N/A';
  try {
    const clean = String(dateStr).trim();
    const parts = clean.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      if (!isNaN(year) && !isNaN(month) && !isNaN(day) && month >= 1 && month <= 12) {
        return `${day < 10 ? '0' + day : day} ${months[month - 1]} ${year}`;
      }
    }
    const d = new Date(clean);
    if (!isNaN(d.getTime())) {
      const day = d.getDate();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${day < 10 ? '0' + day : day} ${months[d.getMonth()]} ${d.getFullYear()}`;
    }
  } catch {
    // fallback
  }
  return String(dateStr);
}

/**
 * Robust Indian Currency Number-to-Words Formatter
 * Converts numeric INR amount to standard Indian legal words format (e.g. Indian Rupees One Lakh Fifty Thousand Only).
 */
export function numberToIndianWords(amount: number): string {
  if (!amount || isNaN(amount) || amount === 0) return 'Indian Rupees Zero Only';

  const singleDigits = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convertTwoDigits = (n: number): string => {
    if (n === 0) return '';
    if (n < 10) return singleDigits[n];
    if (n >= 10 && n < 20) return teens[n - 10];
    const unit = n % 10;
    return tens[Math.floor(n / 10)] + (unit > 0 ? ' ' + singleDigits[unit] : '');
  };

  const convertThreeDigits = (n: number): string => {
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    let res = '';
    if (hundred > 0) {
      res += singleDigits[hundred] + ' Hundred';
    }
    if (rest > 0) {
      res += (res ? ' and ' : '') + convertTwoDigits(rest);
    }
    return res;
  };

  const rounded = Math.round(amount * 100) / 100;
  const wholePart = Math.floor(rounded);
  const paisePart = Math.round((rounded - wholePart) * 100);

  if (wholePart === 0 && paisePart > 0) {
    return `Indian Rupees Zero and ${convertTwoDigits(paisePart)} Paise Only`;
  }

  // Break according to Indian numbering: Crores, Lakhs, Thousands, Hundreds
  let num = wholePart;
  const crores = Math.floor(num / 10000000);
  num %= 10000000;
  const lakhs = Math.floor(num / 100000);
  num %= 100000;
  const thousands = Math.floor(num / 1000);
  num %= 1000;
  const remainder = num;

  const parts: string[] = [];
  if (crores > 0) parts.push(convertTwoDigits(crores) + ' Crore');
  if (lakhs > 0) parts.push(convertTwoDigits(lakhs) + ' Lakh');
  if (thousands > 0) parts.push(convertTwoDigits(thousands) + ' Thousand');
  if (remainder > 0) parts.push(convertThreeDigits(remainder));

  let words = 'Indian Rupees ' + parts.join(' ');
  if (paisePart > 0) {
    words += ' and ' + convertTwoDigits(paisePart) + ' Paise';
  }
  return words.trim() + ' Only';
}

export const AGX_OFFICIAL_LOGO_BASE64 = AGX_BRANDMARK_BASE64;

/**
 * Returns authentic, official AGX Brandmark logo.
 * Embedded directly as high-density Base64 data URI for 100% brand fidelity,
 * zero network delay, and zero print engine font/CORS rendering issues.
 */
export function getAgxLogoSvg(size = 44): string {
  return `
    <img 
      src="${AGX_OFFICIAL_LOGO_BASE64}" 
      width="${size}" 
      height="${size}" 
      alt="AGX" 
      onerror="this.onerror=null;this.src='/agx-brandmark-icon.png';"
      style="display: block; width: ${size}px; height: ${size}px; border-radius: 11px; flex-shrink: 0; object-fit: cover; box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.15);" 
    />
  `;
}

/**
 * Shared Apple-Style Cupertino Print & Web Layout CSS
 * Clean typographic hierarchy, hairline dividers, open editorial grid, and Apple Wallet remittance styling.
 * Enforces -webkit-print-color-adjust: exact for razor-sharp vector PDF rendering.
 */
export const DOCUMENT_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
  
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Inter", "Helvetica Neue", sans-serif;
    color: #1D1D1F;
    background-color: #F5F5F7;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    padding: 32px 16px;
    font-size: 11px;
    line-height: 1.45;
  }

  .page-container {
    max-width: 820px;
    margin: 0 auto;
    background: #FFFFFF;
    border-radius: 18px;
    padding: 38px 44px 34px 44px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02);
    border: 1px solid rgba(0, 0, 0, 0.04);
    position: relative;
    display: flex;
    flex-direction: column;
  }

  /* Header Section */
  .brand-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding-bottom: 20px;
    border-bottom: 1px solid #E5E5EA;
    gap: 20px;
  }

  .brand-left {
    display: flex;
    align-items: flex-start;
    gap: 15px;
    flex: 1;
  }

  .brand-details h1 {
    font-size: 21px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: #1D1D1F;
    line-height: 1.1;
  }

  .brand-details .company-legal {
    font-size: 10.5px;
    font-weight: 600;
    color: #515154;
    margin-top: 3px;
    line-height: 1.4;
  }

  .brand-details .company-meta {
    font-size: 9px;
    color: #86868B;
    margin-top: 4px;
    line-height: 1.5;
  }

  .brand-details .company-meta strong {
    color: #1D1D1F;
    font-weight: 600;
  }

  .brand-right {
    text-align: right;
    min-width: 185px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }

  .doc-type-title {
    font-size: 20px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: #1D1D1F;
    text-transform: uppercase;
    line-height: 1.1;
  }

  .doc-number {
    font-size: 12.5px;
    font-weight: 600;
    color: #86868B;
    margin-top: 3px;
    font-variant-numeric: tabular-nums;
  }

  .doc-status-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 9px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding: 3px 9px;
    border-radius: 9999px;
    margin-top: 6px;
    background: #F5F5F7 !important;
    color: #1D1D1F !important;
    border: 1px solid #E5E5EA;
  }

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 9999px;
    display: inline-block;
  }
  .status-dot-paid { background-color: #34C759; }
  .status-dot-sent { background-color: #0071E3; }
  .status-dot-draft { background-color: #8E8E93; }
  .status-dot-overdue { background-color: #FF3B30; }
  .status-dot-accepted { background-color: #34C759; }
  .status-dot-declined { background-color: #FF3B30; }

  /* Bilateral Coordinates Grid with Subtle Divider */
  .meta-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 32px;
    margin: 22px 0 24px 0;
  }

  .meta-column:first-child {
    padding-right: 8px;
  }

  .meta-column:last-child {
    border-left: 1px solid #E5E5EA;
    padding-left: 28px;
  }

  .meta-label {
    font-size: 8.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #86868B;
    margin-bottom: 5px;
  }

  .meta-title {
    font-size: 15px;
    font-weight: 700;
    letter-spacing: -0.01em;
    color: #1D1D1F;
    line-height: 1.25;
    margin-bottom: 6px;
  }

  .meta-list {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .meta-row {
    display: flex;
    align-items: baseline;
    font-size: 10px;
    line-height: 1.45;
  }

  .meta-row .meta-key {
    width: 120px;
    flex-shrink: 0;
    color: #6E6E73;
    font-weight: 500;
  }

  .meta-row .meta-val {
    color: #1D1D1F;
    font-weight: 600;
    flex: 1;
    word-break: break-word;
  }

  /* Minimalist Scope Table with Top Baseline Alignment */
  .table-wrap {
    width: 100%;
    margin-bottom: 22px;
  }

  table.data-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 11px;
    text-align: left;
  }

  table.data-table thead th {
    background: #F9F9FB !important;
    color: #6E6E73 !important;
    padding: 10px 12px;
    font-size: 8.5px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-top: 1px solid #E5E5EA;
    border-bottom: 1.5px solid #1D1D1F;
    vertical-align: middle;
    white-space: nowrap;
  }

  table.data-table thead th.text-right { text-align: right; }
  table.data-table thead th.text-center { text-align: center; }

  table.data-table tbody tr {
    border-bottom: 1px solid #E5E5EA;
  }

  table.data-table tbody td {
    padding: 14px 12px;
    vertical-align: top;
    color: #1D1D1F;
    line-height: 1.45;
  }

  table.data-table tbody td.text-right { text-align: right; }
  table.data-table tbody td.text-center { text-align: center; }

  .item-index {
    color: #86868B;
    font-weight: 500;
    font-size: 10px;
  }

  .item-title {
    font-weight: 600;
    color: #1D1D1F;
    font-size: 11px;
    line-height: 1.45;
  }

  .item-sac {
    font-family: 'JetBrains Mono', -apple-system, monospace;
    font-size: 9.5px;
    color: #86868B;
  }

  .item-qty {
    font-weight: 600;
    font-size: 10.5px;
  }

  .item-amount {
    font-variant-numeric: tabular-nums;
    font-weight: 600;
    color: #1D1D1F;
    font-size: 11px;
  }

  /* Bottom Grid: Words & Remittance Card (Left) + Structured Ledger (Right) */
  .bottom-grid {
    display: grid;
    grid-template-columns: 1.12fr 0.88fr;
    gap: 22px;
    margin-bottom: 18px;
    align-items: stretch;
  }

  .left-stack {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 10px;
  }

  .words-box {
    background: #F5F5F7 !important;
    border: 1px solid #E5E5EA;
    border-radius: 12px;
    padding: 10px 14px;
  }

  .words-box-label {
    font-size: 8px;
    font-weight: 600;
    text-transform: uppercase;
    color: #86868B;
    letter-spacing: 0.06em;
  }

  .words-box-text {
    font-weight: 600;
    color: #1D1D1F;
    margin-top: 2px;
    font-size: 10.5px;
  }

  /* Apple Wallet Remittance Card */
  .remittance-card {
    background: #FAFAFA !important;
    border: 1px solid #E5E5EA;
    border-radius: 12px;
    padding: 12px 14px;
    display: flex;
    gap: 14px;
    align-items: center;
    flex: 1;
  }

  .remittance-qr {
    width: 74px;
    height: 74px;
    border-radius: 8px;
    border: 1px solid #E5E5EA;
    background: #FFFFFF;
    padding: 4px;
    flex-shrink: 0;
    object-fit: contain;
  }

  .remittance-details {
    flex: 1;
    font-size: 9.5px;
    line-height: 1.45;
    color: #515154;
  }

  .remittance-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
  }

  .remittance-title {
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    color: #1D1D1F;
    letter-spacing: 0.06em;
  }

  .slice-tag {
    background: #F3E8FF !important;
    color: #7E22CE !important;
    font-size: 8px;
    font-weight: 700;
    padding: 1px 6px;
    border-radius: 4px;
    border: 1px solid #E9D5FF;
  }

  .remittance-details strong {
    color: #1D1D1F;
    font-weight: 600;
  }

  .remittance-code {
    font-family: 'JetBrains Mono', -apple-system, monospace;
    font-weight: 600;
    color: #1D1D1F;
  }

  /* Structured Financial Ledger (No Hollow Gaps) */
  .totals-ledger {
    background: #FAFAFA !important;
    border: 1px solid #E5E5EA;
    border-radius: 12px;
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 7px;
  }

  .ledger-lines-group {
    display: flex;
    flex-direction: column;
    gap: 3.5px;
  }

  .ledger-line {
    display: flex;
    justify-content: space-between;
    padding: 2.5px 0;
    font-size: 10.5px;
    color: #6E6E73;
  }

  .ledger-line span:last-child {
    font-variant-numeric: tabular-nums;
    font-weight: 600;
    color: #1D1D1F;
  }

  .ledger-line.discount {
    color: #2E7D32;
  }

  .ledger-line.discount span:last-child {
    color: #2E7D32;
  }

  .ledger-divider {
    border-top: 1.5px solid #1D1D1F;
    margin: 6px 0 4px 0;
  }

  .ledger-line.grand {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 2px 0 1px 0;
  }

  .ledger-line.grand span:first-child {
    font-size: 11.5px;
    font-weight: 700;
    color: #1D1D1F;
  }

  .ledger-line.grand span:last-child {
    font-size: 16px;
    font-weight: 700;
    letter-spacing: -0.01em;
    color: #1D1D1F;
    font-variant-numeric: tabular-nums;
  }

  .ledger-badge {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 5px;
    padding: 5px 10px;
    border-radius: 8px;
    font-size: 9.5px;
    font-weight: 600;
  }

  .ledger-badge-settled {
    background: #ECFDF5 !important;
    color: #065F46 !important;
    border: 1px solid #A7F3D0;
  }

  .ledger-badge-due {
    background: #F5F5F7 !important;
    color: #1D1D1F !important;
    border: 1px solid #E5E5EA;
  }

  .ledger-badge-overdue {
    background: #FFF1F2 !important;
    color: #9F1239 !important;
    border: 1px solid #FECDD3;
  }

  .ledger-method-note {
    font-size: 8px;
    color: #86868B;
    text-align: right;
    margin-top: 3px;
    letter-spacing: 0.02em;
  }

  /* Statutory Note (Legal Footnote Style) */
  .statutory-note {
    background: #F5F5F7 !important;
    border: 1px solid #E5E5EA;
    border-radius: 9px;
    padding: 8px 12px;
    font-size: 8.5px;
    color: #515154;
    line-height: 1.45;
    margin-bottom: 14px;
  }

  .statutory-note strong {
    color: #1D1D1F;
  }

  /* Commercial Terms Section */
  .terms-card {
    background: #FAFAFA !important;
    border: 1px solid #E5E5EA;
    border-radius: 9px;
    padding: 10px 14px;
    font-size: 8.5px;
    color: #6E6E73;
    line-height: 1.45;
    margin-bottom: 14px;
  }

  .terms-card h4 {
    font-size: 8.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #1D1D1F;
    margin-bottom: 3px;
  }

  /* Executive Signatures with Grounded Baseline */
  .signatures-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-top: 12px;
    padding-top: 14px;
    border-top: 1px solid #E5E5EA;
  }

  .signature-block {
    border: 1px solid #E5E5EA;
    border-radius: 12px;
    padding: 12px 14px;
    background: #FFFFFF !important;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 122px;
  }

  .sig-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 8px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #86868B;
    margin-bottom: 4px;
  }

  .msme-verified-badge {
    font-size: 7.5px;
    font-weight: 600;
    color: #065F46 !important;
    background: #ECFDF5 !important;
    border: 1px solid #A7F3D0;
    padding: 2px 6px;
    border-radius: 9999px;
    display: inline-flex;
    align-items: center;
    gap: 3px;
  }

  .sig-party-tag {
    font-size: 8px;
    font-weight: 600;
    color: #515154;
    background: #F5F5F7;
    border: 1px solid #E5E5EA;
    padding: 1px 6px;
    border-radius: 4px;
    max-width: 140px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .sig-image-container {
    height: 44px;
    display: flex;
    align-items: flex-end;
    margin-bottom: 2px;
  }

  .sig-image-container img {
    height: 42px;
    object-fit: contain;
  }

  .sig-divider {
    border-top: 1.5px solid #1D1D1F;
    padding-top: 5px;
    margin-top: 3px;
  }

  .sig-name {
    font-size: 10px;
    font-weight: 700;
    color: #1D1D1F;
  }

  .sig-title {
    font-size: 8.5px;
    color: #86868B;
    margin-top: 1px;
  }

  .sig-validation {
    font-size: 7.5px;
    color: #065F46;
    font-weight: 600;
    letter-spacing: 0.02em;
    margin-top: 2px;
  }

  .counterparty-body {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    flex: 1;
    margin-top: 4px;
  }

  .counterparty-lines {
    display: flex;
    flex-direction: column;
    gap: 5.5px;
  }

  .cp-row {
    display: flex;
    align-items: flex-end;
    font-size: 8.5px;
    color: #6E6E73;
  }

  .cp-label {
    width: 105px;
    flex-shrink: 0;
  }

  .cp-dots {
    flex: 1;
    border-bottom: 1px dashed #C7C7CC;
    margin-bottom: 2px;
    height: 1px;
  }

  .counterparty-stamp-box {
    margin-top: 8px;
    padding-top: 5px;
    border-top: 1px solid #E5E5EA;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 8px;
    font-weight: 600;
    color: #86868B;
  }

  .seal-placeholder {
    font-size: 7.5px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border: 1px dashed #C7C7CC;
    padding: 2px 6px;
    border-radius: 4px;
    color: #86868B;
  }

  /* Page Footer */
  .page-footer {
    margin-top: 20px;
    padding-top: 12px;
    border-top: 1px solid #E5E5EA;
    display: flex;
    justify-content: space-between;
    font-size: 8px;
    color: #86868B;
  }

  @page {
    size: A4 portrait;
    margin: 0mm !important;
  }

  @media print {
    html, body {
      background: #FFFFFF !important;
      padding: 0 !important;
      margin: 0 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .page-container {
      box-shadow: none !important;
      border: none !important;
      border-radius: 0 !important;
      padding: 12mm 14mm 10mm 14mm !important;
      max-width: 100% !important;
      width: 100% !important;
      margin: 0 !important;
      box-sizing: border-box !important;
      min-height: 297mm;
      justify-content: space-between;
    }
    .table-wrap, .bottom-grid, .signatures-grid, .meta-grid, .terms-card, .statutory-note {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    table.data-table tbody tr {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
  }
`;

/**
 * Renders complete HTML for a Commercial / Tax Invoice
 */
export function renderInvoiceHtml(invoice: Invoice, clientGstin?: string): string {
  const isGst = invoice.isGst !== false && invoice.isGst !== undefined;
  const effectiveClientGstin = clientGstin || invoice.clientGstin || '';
  const gstType = invoice.gstType || 'IGST';
  const taxRate = isGst ? (invoice.taxRate ?? 18) : 0;
  const defaultHsn = invoice.hsnSacCode || AGX_BRAND.defaultSacCode;

  // Tax split
  const cgstAmount = isGst && gstType === 'CGST_SGST' ? Math.round((invoice.tax || 0) / 2) : (invoice.cgst || 0);
  const sgstAmount = isGst && gstType === 'CGST_SGST' ? Math.round((invoice.tax || 0) / 2) : (invoice.sgst || 0);
  const igstAmount = isGst && gstType === 'IGST' ? (invoice.tax || 0) : (invoice.igst || 0);

  const balanceDue = Math.max(0, (invoice.total || 0) - (invoice.paidAmount || 0));
  const amountWords = numberToIndianWords(invoice.total || 0);

  // Official Slice Bank UPI Payment QR Code Asset
  const qrCodeUrl = AGX_BRAND.paymentQrSquare;

  const items = invoice.items && invoice.items.length > 0 ? invoice.items : [
    {
      description: 'Enterprise AI Automation & Software Delivery Services',
      quantity: 1,
      unitPrice: invoice.subtotal || invoice.total,
      total: invoice.subtotal || invoice.total,
      hsnSac: defaultHsn
    }
  ];

  const statusDotClass = invoice.status === 'Paid'
    ? 'status-dot-paid'
    : invoice.status === 'Overdue'
    ? 'status-dot-overdue'
    : 'status-dot-sent';

  const clientName = invoice.clientName || 'Counterparty';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <title>${isGst ? 'Tax Invoice' : 'Commercial Invoice'} - ${invoice.invoiceNumber} - AGX</title>
      <base href="${typeof window !== 'undefined' ? window.location.origin : ''}/" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style>${DOCUMENT_CSS}</style>
    </head>
    <body>
      <div class="page-container">
        <!-- Brand & Document Header (Zero Widow Wraps) -->
        <header class="brand-header">
          <div class="brand-left">
            ${getAgxLogoSvg(44)}
            <div class="brand-details">
              <h1>${AGX_BRAND.enterpriseName}</h1>
              <p class="company-legal">${AGX_BRAND.legalEntity} &bull; ${AGX_BRAND.tagline}</p>
              <p class="company-meta">
                MSME Udyam: <strong>${AGX_BRAND.udyamRegNo}</strong> &bull; Shops &amp; Est. Reg: <strong>${AGX_BRAND.gumastaRegNo}</strong> &bull; <span style="white-space: nowrap;">PAN: <strong>${AGX_BRAND.pan}</strong></span><br />
                ${AGX_BRAND.addressLine1}, ${AGX_BRAND.addressLine2} &bull; <span style="white-space: nowrap;">Mobile: <strong>+91&nbsp;86691&nbsp;97971</strong></span> &bull; ${AGX_BRAND.email}
              </p>
            </div>
          </div>
          <div class="brand-right">
            <div class="doc-type-title">${isGst ? 'Tax Invoice' : 'Commercial Invoice'}</div>
            <div class="doc-number">#${invoice.invoiceNumber}</div>
            <div>
              <span class="doc-status-badge">
                <span class="status-dot ${statusDotClass}"></span>
                ${invoice.status}
              </span>
            </div>
            ${invoice.quotationNumber ? `
              <div style="font-size: 9px; color: #0071E3; font-weight: 600; margin-top: 4px;">
                Linked Quote: #${invoice.quotationNumber}
              </div>
            ` : ''}
          </div>
        </header>

        <!-- Symmetrical Bilateral Coordinates Grid -->
        <div class="meta-grid">
          <div class="meta-column">
            <div class="meta-label">Billed To (Client Counterparty)</div>
            <div class="meta-title">${clientName}</div>
            <div class="meta-list">
              <div class="meta-row">
                <span class="meta-key">Attention Contact:</span>
                <span class="meta-val">${invoice.contactPerson || clientName}</span>
              </div>
              <div class="meta-row">
                <span class="meta-key">Client Status / GST:</span>
                <span class="meta-val">${effectiveClientGstin ? 'Registered (' + effectiveClientGstin + ')' : 'Commercial Client / Partner'}</span>
              </div>
              <div class="meta-row">
                <span class="meta-key">Project Reference:</span>
                <span class="meta-val">${invoice.projectName || 'AI Systems Engineering & Bespoke Automation'}</span>
              </div>
              <div class="meta-row">
                <span class="meta-key">Place of Supply:</span>
                <span class="meta-val">${isGst ? (gstType === 'CGST_SGST' ? 'Maharashtra (27) - Intra-State' : 'Inter-State Supply') : 'Commercial Supply under MSME Exemption'}</span>
              </div>
              <div class="meta-row">
                <span class="meta-key">Official Dispatch:</span>
                <span class="meta-val">${invoice.clientEmail || 'Direct Counterparty Ledger'}</span>
              </div>
            </div>
          </div>

          <div class="meta-column">
            <div class="meta-label">Commercial &amp; Billing Coordinates</div>
            <div class="meta-list">
              <div class="meta-row"><span class="meta-key">Invoice Date:</span><span class="meta-val">${formatDisplayDate(invoice.issueDate)}</span></div>
              <div class="meta-row"><span class="meta-key">Payment Due:</span><span class="meta-val">${formatDisplayDate(invoice.dueDate)}</span></div>
              <div class="meta-row"><span class="meta-key">Payment Terms:</span><span class="meta-val">Net 15 Calendar Days</span></div>
              <div class="meta-row"><span class="meta-key">Tax Treatment:</span><span class="meta-val">${isGst ? (gstType === 'CGST_SGST' ? 'CGST (9%) + SGST (9%)' : 'IGST (18%)') : 'Zero-Rated / MSME Exemption'}</span></div>
              <div class="meta-row"><span class="meta-key">Transaction Currency:</span><span class="meta-val">INR (₹)</span></div>
            </div>
          </div>
        </div>

        <!-- Scope & Deliverable Table (Top Baseline Alignment) -->
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 5%;" class="text-center">#</th>
                <th style="width: 51%;">Deliverable Specification / Scope of Work</th>
                <th style="width: 12%;" class="text-center">SAC Code</th>
                <th style="width: 7%;" class="text-center">Qty</th>
                <th style="width: 12.5%;" class="text-right">Rate (₹)</th>
                <th style="width: 12.5%;" class="text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${items.map((item, idx) => `
                <tr>
                  <td class="text-center item-index">${idx + 1}</td>
                  <td>
                    <div class="item-title">${item.description}</div>
                  </td>
                  <td class="text-center item-sac">${item.hsnSac || defaultHsn}</td>
                  <td class="text-center item-qty">${item.quantity || 1}</td>
                  <td class="text-right item-amount">₹${Number(item.unitPrice || 0).toLocaleString('en-IN')}</td>
                  <td class="text-right item-amount">₹${Number(item.total || 0).toLocaleString('en-IN')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Bottom Grid: Remittance (Left) + Structured Financial Ledger (Right) -->
        <div class="bottom-grid">
          <div class="left-stack">
            <!-- Amount in Words -->
            <div class="words-box">
              <span class="words-box-label">Invoice Amount in Words:</span>
              <div class="words-box-text">${amountWords}</div>
            </div>

            <!-- Apple Wallet-Style Remittance Card -->
            <div class="remittance-card">
              <img src="${qrCodeUrl}" alt="Slice Official Payment QR" class="remittance-qr" />
              <div class="remittance-details">
                <div class="remittance-header">
                  <span class="remittance-title">Bank &amp; Instant UPI Remittance</span>
                  <span class="slice-tag">slice</span>
                </div>
                <div>Bank: <strong>${AGX_BRAND.bank.bankName}</strong> (${AGX_BRAND.bank.branch})</div>
                <div>A/C Name: <strong>${AGX_BRAND.bank.accountHolderName}</strong></div>
                <div>A/C No: <strong class="remittance-code">${AGX_BRAND.bank.accountNumber}</strong></div>
                <div>IFSC: <strong class="remittance-code">${AGX_BRAND.bank.ifsc}</strong> &bull; Alt: <span class="remittance-code">${AGX_BRAND.bank.alternateIfsc}</span></div>
                <div>UPI VPA: <strong class="remittance-code" style="color: #059669;">${AGX_BRAND.bank.upiId}</strong></div>
              </div>
            </div>
          </div>

          <!-- Structured Cupertino Financial Ledger (Zero Hollow Gap) -->
          <div class="totals-ledger">
            <div class="ledger-lines-group">
              <div class="ledger-line">
                <span>Taxable Subtotal:</span>
                <span>₹${Number(invoice.subtotal || invoice.total).toLocaleString('en-IN')}</span>
              </div>

              ${Boolean(invoice.discountAmount && invoice.discountAmount > 0) ? `
                <div class="ledger-line discount">
                  <span>Commercial Discount:</span>
                  <span>- ₹${Number(invoice.discountAmount).toLocaleString('en-IN')}</span>
                </div>
              ` : ''}

              ${isGst ? (
                gstType === 'CGST_SGST' ? `
                  <div class="ledger-line">
                    <span>CGST (${taxRate / 2}%):</span>
                    <span>₹${Number(cgstAmount).toLocaleString('en-IN')}</span>
                  </div>
                  <div class="ledger-line">
                    <span>SGST (${taxRate / 2}%):</span>
                    <span>₹${Number(sgstAmount).toLocaleString('en-IN')}</span>
                  </div>
                ` : `
                  <div class="ledger-line">
                    <span>IGST (${taxRate}%):</span>
                    <span>₹${Number(igstAmount || invoice.tax || 0).toLocaleString('en-IN')}</span>
                  </div>
                `
              ) : `
                <div class="ledger-line">
                  <span>Tax (MSME Exemption):</span>
                  <span>₹0</span>
                </div>
              `}
            </div>

            <div>
              <div class="ledger-divider"></div>
              <div class="ledger-line grand">
                <span>Grand Total:</span>
                <span>₹${Number(invoice.total || 0).toLocaleString('en-IN')}</span>
              </div>

              ${Boolean(invoice.paidAmount && invoice.paidAmount > 0) ? `
                <div class="ledger-line" style="color: #059669; font-weight: 600; margin-top: 3px;">
                  <span>Amount Settled:</span>
                  <span>- ₹${Number(invoice.paidAmount).toLocaleString('en-IN')}</span>
                </div>
              ` : ''}

              ${balanceDue > 0 ? `
                <div class="ledger-badge ${invoice.status === 'Overdue' ? 'ledger-badge-overdue' : 'ledger-badge-due'}">
                  <span>Net Balance Due:</span>
                  <span>₹${Number(balanceDue).toLocaleString('en-IN')}</span>
                </div>
              ` : `
                <div class="ledger-badge ledger-badge-settled">
                  <span>Payment Status:</span>
                  <span>&check; Fully Settled (Nil Balance)</span>
                </div>
              `}

              <div class="ledger-method-note">
                Settlement via Direct Bank IMPS/NEFT or Instant UPI
              </div>
            </div>
          </div>
        </div>

        <!-- Statutory MSME Declaration -->
        <div class="statutory-note">
          <strong>MSME &amp; Statutory Declaration:</strong> Issued by <strong>${AGX_BRAND.enterpriseName}</strong>, registered as a Micro Enterprise under Government of India MSME (Udyam: <strong>${AGX_BRAND.udyamRegNo}</strong>) and Maharashtra Shops &amp; Establishments Act (Reg: <strong>${AGX_BRAND.gumastaRegNo}</strong>). Supply covered under SAC Code <strong>998313</strong> (AI Automation &amp; Systems Engineering). Reverse charge mechanism is <strong>Not Applicable</strong>.
        </div>

        <!-- Payment & Commercial Terms (Sibling Consistency) -->
        <div class="terms-card">
          <h4>Payment &amp; Commercial Terms:</h4>
          <div style="white-space: pre-line;">${invoice.termsConditions || `1. Remittance Terms: Net payment is due within 15 calendar days from the date of invoice issuance.
2. Mode of Settlement: Direct electronic transfer (IMPS / NEFT / RTGS) or instant UPI to Slice Small Finance Bank.
3. Statutory Scheme: Issued under Government of India MSME Micro Enterprise Udyam framework; GST reverse charge is not applicable.
4. Late Settlement: Overdue accounts may be subject to commercial interest in accordance with the MSMED Act, 2006.`}</div>
        </div>

        <!-- Executive Dual Signature Horizon -->
        <div class="signatures-grid">
          <div class="signature-block">
            <div class="sig-header">
              <span>For ${AGX_BRAND.enterpriseName}</span>
              <span class="msme-verified-badge">&check; MSME VERIFIED</span>
            </div>
            <div class="sig-image-container">
              <img src="${AGX_BRAND.signaturePath}" alt="Signature of ${AGX_BRAND.proprietor}" />
            </div>
            <div class="sig-divider">
              <div class="sig-name">${AGX_BRAND.proprietor}</div>
              <div class="sig-title">${AGX_BRAND.designation} &bull; ${AGX_BRAND.enterpriseName}</div>
              <div class="sig-validation">&check; Digitally Validated &amp; Handcrafted Authorisation</div>
            </div>
          </div>

          <div class="signature-block">
            <div class="sig-header">
              <span>Counterparty Acknowledgment</span>
              <span class="sig-party-tag">${clientName}</span>
            </div>
            <div class="counterparty-body">
              <div class="counterparty-lines">
                <div class="cp-row"><span class="cp-label">Authorized Signatory:</span><span class="cp-dots"></span></div>
                <div class="cp-row"><span class="cp-label">Title / Designation:</span><span class="cp-dots"></span></div>
                <div class="cp-row"><span class="cp-label">Date of Receipt:</span><span class="cp-dots"></span></div>
              </div>
              <div class="counterparty-stamp-box">
                <span>Counterparty Verification</span>
                <span class="seal-placeholder">Corporate Seal &amp; Signature</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Document Footer -->
        <footer class="page-footer">
          <div>Generated via <strong>AGX Business OS</strong> &bull; Commercial Instrument Strictly Confidential</div>
          <div>Page 1 of 1 &bull; ${AGX_BRAND.website}</div>
        </footer>
      </div>

      <script>
        function triggerPrint() {
          setTimeout(function() {
            window.focus();
            window.print();
          }, 300);
        }
        if (document.readyState === 'complete') {
          triggerPrint();
        } else {
          window.addEventListener('load', triggerPrint);
        }
      </script>
    </body>
    </html>
  `;
}

/**
 * Renders complete HTML for an Executive Commercial Quotation / Scope Proposal
 */
export function renderQuotationHtml(quotation: Quotation): string {
  const isGst = quotation.isGst !== false && quotation.isGst !== undefined;
  const gstType = quotation.gstType || 'IGST';
  const taxRate = isGst ? (quotation.taxRate ?? 18) : 0;
  const defaultHsn = quotation.hsnSacCode || AGX_BRAND.defaultSacCode;

  // Tax calculations
  const cgstAmount = isGst && gstType === 'CGST_SGST' ? Math.round((quotation.tax || 0) / 2) : (quotation.cgst || 0);
  const sgstAmount = isGst && gstType === 'CGST_SGST' ? Math.round((quotation.tax || 0) / 2) : (quotation.sgst || 0);
  const igstAmount = isGst && gstType === 'IGST' ? (quotation.tax || 0) : (quotation.igst || 0);

  const amountWords = numberToIndianWords(quotation.total || 0);

  const items = quotation.items && quotation.items.length > 0 ? quotation.items : [
    {
      description: 'Enterprise AI Architecture, Technical Blueprint & Automated Workflows',
      quantity: 1,
      unitPrice: quotation.subtotal || quotation.total,
      total: quotation.subtotal || quotation.total,
      hsnSac: defaultHsn
    }
  ];

  const statusDotClass = quotation.status === 'Accepted'
    ? 'status-dot-accepted'
    : quotation.status === 'Declined'
    ? 'status-dot-declined'
    : quotation.status === 'Draft'
    ? 'status-dot-draft'
    : 'status-dot-sent';

  const clientName = quotation.companyName || quotation.clientName || 'Counterparty';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <title>Commercial Quotation - ${quotation.quotationNumber} - AGX</title>
      <base href="${typeof window !== 'undefined' ? window.location.origin : ''}/" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style>${DOCUMENT_CSS}</style>
    </head>
    <body>
      <div class="page-container">
        <!-- Brand & Document Header (Zero Widow Wraps) -->
        <header class="brand-header">
          <div class="brand-left">
            ${getAgxLogoSvg(44)}
            <div class="brand-details">
              <h1>${AGX_BRAND.enterpriseName}</h1>
              <p class="company-legal">${AGX_BRAND.legalEntity} &bull; ${AGX_BRAND.tagline}</p>
              <p class="company-meta">
                MSME Udyam: <strong>${AGX_BRAND.udyamRegNo}</strong> &bull; Shops &amp; Est. Reg: <strong>${AGX_BRAND.gumastaRegNo}</strong> &bull; <span style="white-space: nowrap;">PAN: <strong>${AGX_BRAND.pan}</strong></span><br />
                ${AGX_BRAND.addressLine1}, ${AGX_BRAND.addressLine2} &bull; <span style="white-space: nowrap;">Mobile: <strong>+91&nbsp;86691&nbsp;97971</strong></span> &bull; ${AGX_BRAND.email}
              </p>
            </div>
          </div>
          <div class="brand-right">
            <div class="doc-type-title">Commercial Quotation</div>
            <div class="doc-number">#${quotation.quotationNumber}</div>
            <div>
              <span class="doc-status-badge">
                <span class="status-dot ${statusDotClass}"></span>
                ${quotation.status}
              </span>
            </div>
          </div>
        </header>

        <!-- Symmetrical Bilateral Coordinates Grid -->
        <div class="meta-grid">
          <div class="meta-column">
            <div class="meta-label">Prepared Exclusively For (Client Counterparty)</div>
            <div class="meta-title">${clientName}</div>
            <div class="meta-list">
              <div class="meta-row">
                <span class="meta-key">Attention Contact:</span>
                <span class="meta-val">${quotation.leadName || clientName}</span>
              </div>
              <div class="meta-row">
                <span class="meta-key">Client Status / GST:</span>
                <span class="meta-val">${quotation.clientGstin ? 'Registered (' + quotation.clientGstin + ')' : 'Commercial Partner (Non-GST / Exempt)'}</span>
              </div>
              <div class="meta-row">
                <span class="meta-key">Target Engagement:</span>
                <span class="meta-val">${quotation.projectName || 'AI Systems Engineering & Bespoke Automation'}</span>
              </div>
              <div class="meta-row">
                <span class="meta-key">Place of Supply:</span>
                <span class="meta-val">${isGst ? (gstType === 'CGST_SGST' ? 'Maharashtra (27) - Intra-State' : 'Inter-State Supply') : 'Commercial Supply under MSME Exemption'}</span>
              </div>
              <div class="meta-row">
                <span class="meta-key">Official Dispatch:</span>
                <span class="meta-val">${quotation.clientEmail || 'Direct Counterparty Ledger'}</span>
              </div>
            </div>
          </div>

          <div class="meta-column">
            <div class="meta-label">Quotation &amp; Commercial Parameters</div>
            <div class="meta-list">
              <div class="meta-row"><span class="meta-key">Date of Issuance:</span><span class="meta-val">${formatDisplayDate(quotation.issueDate)}</span></div>
              <div class="meta-row"><span class="meta-key">Proposal Valid Until:</span><span class="meta-val" style="color: #0071E3; font-weight: 700;">${formatDisplayDate(quotation.validUntil)}</span></div>
              <div class="meta-row"><span class="meta-key">Tax Regime:</span><span class="meta-val">${isGst ? (gstType === 'CGST_SGST' ? 'Intra-State (CGST + SGST)' : 'Inter-State (IGST 18%)') : 'Zero-Rated / MSME Exemption'}</span></div>
              <div class="meta-row"><span class="meta-key">Primary SAC Code:</span><span class="meta-val">${defaultHsn}</span></div>
              <div class="meta-row"><span class="meta-key">Transaction Currency:</span><span class="meta-val">INR (₹)</span></div>
            </div>
          </div>
        </div>

        <!-- Scope & Deliverable Table (Top Baseline Alignment) -->
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 5%;" class="text-center">#</th>
                <th style="width: 51%;">Deliverable Specification / Scope of Work</th>
                <th style="width: 12%;" class="text-center">SAC Code</th>
                <th style="width: 7%;" class="text-center">Qty</th>
                <th style="width: 12.5%;" class="text-right">Rate (₹)</th>
                <th style="width: 12.5%;" class="text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${items.map((item, idx) => `
                <tr>
                  <td class="text-center item-index">${idx + 1}</td>
                  <td>
                    <div class="item-title">${item.description}</div>
                  </td>
                  <td class="text-center item-sac">${item.hsnSac || defaultHsn}</td>
                  <td class="text-center item-qty">${item.quantity || 1}</td>
                  <td class="text-right item-amount">₹${Number(item.unitPrice || 0).toLocaleString('en-IN')}</td>
                  <td class="text-right item-amount">₹${Number(item.total || 0).toLocaleString('en-IN')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Bottom Grid: Scope in Words & Next Steps (Left) + Structured Ledger (Right) -->
        <div class="bottom-grid">
          <div class="left-stack">
            <!-- Amount in Words -->
            <div class="words-box">
              <span class="words-box-label">Total Commercial Value in Words:</span>
              <div class="words-box-text">${amountWords}</div>
            </div>

            <!-- Engagement Next Steps Note -->
            <div class="remittance-card" style="flex-direction: column; align-items: flex-start; gap: 6px;">
              <div class="remittance-header" style="width: 100%;">
                <span class="remittance-title">Next Steps Following Approval</span>
                <span class="slice-tag" style="background: #E0F2FE !important; color: #0369A1 !important; border-color: #BAE6FD;">Proposal</span>
              </div>
              <div style="font-size: 9.5px; line-height: 1.45; color: #515154;">
                <div>1. Return this signed commercial proposal to <strong>${AGX_BRAND.email}</strong>.</div>
                <div>2. A statutory Tax Invoice will be initiated along with access provisioning.</div>
                <div>3. Architecture &amp; technical sprints commence within 48 business hours.</div>
              </div>
            </div>
          </div>

          <!-- Structured Cupertino Financial Ledger (Zero Hollow Gap) -->
          <div class="totals-ledger">
            <div class="ledger-lines-group">
              <div class="ledger-line">
                <span>Scope Subtotal:</span>
                <span>₹${Number(quotation.subtotal || quotation.total).toLocaleString('en-IN')}</span>
              </div>

              ${Boolean(quotation.discountAmount && quotation.discountAmount > 0) ? `
                <div class="ledger-line discount">
                  <span>Commercial Discount:</span>
                  <span>- ₹${Number(quotation.discountAmount).toLocaleString('en-IN')}</span>
                </div>
              ` : ''}

              ${isGst ? (
                gstType === 'CGST_SGST' ? `
                  <div class="ledger-line">
                    <span>CGST (${taxRate / 2}%):</span>
                    <span>₹${Number(cgstAmount).toLocaleString('en-IN')}</span>
                  </div>
                  <div class="ledger-line">
                    <span>SGST (${taxRate / 2}%):</span>
                    <span>₹${Number(sgstAmount).toLocaleString('en-IN')}</span>
                  </div>
                ` : `
                  <div class="ledger-line">
                    <span>Estimated IGST (${taxRate}%):</span>
                    <span>₹${Number(igstAmount || quotation.tax || 0).toLocaleString('en-IN')}</span>
                  </div>
                `
              ) : `
                <div class="ledger-line">
                  <span>Tax (MSME Exemption):</span>
                  <span>₹0</span>
                </div>
              `}
            </div>

            <div>
              <div class="ledger-divider"></div>
              <div class="ledger-line grand">
                <span>Estimated Grand Total:</span>
                <span>₹${Number(quotation.total || 0).toLocaleString('en-IN')}</span>
              </div>

              <div class="ledger-badge ledger-badge-due" style="margin-top: 6px;">
                <span>Commercial Regime:</span>
                <span>Firm Fixed-Price Contract</span>
              </div>

              <div class="ledger-method-note">
                Milestone Advances via Slice Bank IMPS/NEFT or Instant UPI
              </div>
            </div>
          </div>
        </div>

        <!-- Statutory MSME Declaration -->
        <div class="statutory-note">
          <strong>MSME &amp; Statutory Declaration:</strong> Issued by <strong>${AGX_BRAND.enterpriseName}</strong>, registered as a Micro Enterprise under Government of India MSME (Udyam: <strong>${AGX_BRAND.udyamRegNo}</strong>) and Maharashtra Shops &amp; Establishments Act (Reg: <strong>${AGX_BRAND.gumastaRegNo}</strong>). Supply covered under SAC Code <strong>998313</strong> (AI Automation &amp; Systems Engineering). Reverse charge mechanism is <strong>Not Applicable</strong>.
        </div>

        <!-- Commercial Terms of Engagement -->
        <div class="terms-card">
          <h4>Commercial Terms &amp; Conditions:</h4>
          <div style="white-space: pre-line;">${quotation.termsConditions || `1. Pricing & Scope: Valid for 14 calendar days from the date of issuance.
2. Payment Schedule: 50% milestone advance upon kickoff, 50% upon final acceptance & handover.
3. Turnaround Timeline: Work commences within 2 business days following access provisioning.
4. Tax Invoicing: Upon formal quote acceptance, a statutory Tax Invoice will be generated under SAC 998313.`}</div>
        </div>

        <!-- Executive Dual Signature Horizon -->
        <div class="signatures-grid">
          <div class="signature-block">
            <div class="sig-header">
              <span>For ${AGX_BRAND.enterpriseName}</span>
              <span class="msme-verified-badge">&check; MSME VERIFIED</span>
            </div>
            <div class="sig-image-container">
              <img src="${AGX_BRAND.signaturePath}" alt="Signature of ${AGX_BRAND.proprietor}" />
            </div>
            <div class="sig-divider">
              <div class="sig-name">${AGX_BRAND.proprietor}</div>
              <div class="sig-title">${AGX_BRAND.designation} &bull; ${AGX_BRAND.enterpriseName}</div>
              <div class="sig-validation">&check; Digitally Validated &amp; Handcrafted Authorisation</div>
            </div>
          </div>

          <div class="signature-block">
            <div class="sig-header">
              <span>Client Acceptance &amp; Sign-off</span>
              <span class="sig-party-tag">${clientName}</span>
            </div>
            <div class="counterparty-body">
              <div class="counterparty-lines">
                <div class="cp-row"><span class="cp-label">Authorized Signatory:</span><span class="cp-dots"></span></div>
                <div class="cp-row"><span class="cp-label">Title / Designation:</span><span class="cp-dots"></span></div>
                <div class="cp-row"><span class="cp-label">Date of Acceptance:</span><span class="cp-dots"></span></div>
              </div>
              <div class="counterparty-stamp-box">
                <span>Counterparty Execution</span>
                <span class="seal-placeholder">Corporate Seal &amp; Signature</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Document Footer -->
        <footer class="page-footer">
          <div>Generated via <strong>AGX Business OS</strong> &bull; Commercial Proposal Strictly Confidential</div>
          <div>Page 1 of 1 &bull; ${AGX_BRAND.website}</div>
        </footer>
      </div>

      <script>
        function triggerPrint() {
          setTimeout(function() {
            window.focus();
            window.print();
          }, 300);
        }
        if (document.readyState === 'complete') {
          triggerPrint();
        } else {
          window.addEventListener('load', triggerPrint);
        }
      </script>
    </body>
    </html>
  `;
}
