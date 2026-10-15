/**
 * AGX Partner & Referral Program Legal Agreement
 * 
 * Statutory Foundation under the Laws of India:
 * - Indian Contract Act, 1872 (Section 10 & 10A electronic formation & consideration)
 * - Information Technology Act, 2000 & IT Rules (Electronic click-wrap agreement validity)
 * - Income Tax Act, 1961 (TDS deduction under Section 194H on commission/brokerage)
 * - Central Goods and Services Tax (CGST) Act, 2017 & IGST Act (GST compliance on services)
 * - Digital Personal Data Protection Act, 2023 (DPDP Act - lead privacy & consent)
 * - Arbitration and Conciliation Act, 1996 (Dispute resolution & seat in Maharashtra, India)
 */

export interface LegalClause {
  id: string;
  number: number;
  title: string;
  shortLabel: string;
  statutoryReference: string;
  summary: string;
  keyTakeaway: string;
  realWorldExample: string;
  doItems: string[];
  dontItems: string[];
  fullText: string;
}

export const PARTNER_AGREEMENT_VERSION = '1.0';
export const PARTNER_AGREEMENT_EFFECTIVE_DATE = 'January 1, 2025';

export const PARTNER_AGREEMENT_CLAUSES: LegalClause[] = [
  {
    id: 'clause-1-appointment',
    number: 1,
    title: 'Appointment & Independent Contractor Relationship',
    shortLabel: 'Independent Status',
    statutoryReference: 'Indian Contract Act, 1872 (Section 182-238) & Indian Partnership Act, 1932',
    summary: 'The Partner acts as an independent business contractor on a Principal-to-Principal (P2P) basis. This agreement creates no employer-employee relationship, legal partnership, or joint venture.',
    keyTakeaway: 'You are your own boss. You partner with AGX as an independent business or freelancer, not an employee.',
    realWorldExample: 'You set your own work hours and decide which businesses to introduce. You do not have daily punch-ins, HR manager reviews, or employee provident fund (PF) deductions.',
    doItems: [
      'Introduce potential clients to AGX using your referral links or portal forms',
      'Refer clients on your own flexible schedule as an independent entity',
      'Earn top-tier performance commissions on every closed client contract'
    ],
    dontItems: [
      'Do not claim to be a director, employee, or legal officer of AGX',
      'Do not sign contracts, warranties, or offer unauthorized discounts on AGX\'s behalf'
    ],
    fullText: `1.1 The Company ("AGX", "Antigravity Technologies", "We", "Us") hereby engages the individual or corporate entity registering as a Partner ("Partner", "You"), and the Partner hereby accepts engagement as a non-exclusive referral partner to introduce prospective clients requiring artificial intelligence workflows, custom software engineering, and automation solutions.

1.2 Principal-to-Principal Status: The relationship between the Company and the Partner is strictly that of independent contracting parties. Nothing contained in this Agreement shall be construed to create an employer-employee relationship, master-servant relationship, joint venture, franchise, or legal partnership under the Indian Partnership Act, 1932 or the Limited Liability Partnership Act, 2008.

1.3 Authority Limitations: The Partner has no authority, express or implied, to bind the Company to any contract, representation, warranty, pricing schedule, or legal commitment, nor shall the Partner represent itself as an employee, officer, or legal representative of the Company.`
  },
  {
    id: 'clause-2-commission-tiers',
    number: 2,
    title: 'Commission Structure & Flexible Business Volume',
    shortLabel: '10%–25% Earnings',
    statutoryReference: 'Indian Contract Act, 1872 (Section 2(d) - Lawful Consideration)',
    summary: 'Commissions are 100% performance-based on actual monthly client business delivered. Zero fixed quotas or penalties. Retrospective tier upgrades apply to all business closed in that month.',
    keyTakeaway: 'You get paid strictly based on deals closed. There are zero minimum quotas, zero sales targets, and zero penalties.',
    realWorldExample: 'If you refer a client for an AI automation system worth ₹5,00,000 in a month, you are in the Pro Tier (20%). Your commission is 20% of ₹5,00,000 = ₹1,00,000 cash. If you do zero deals next month, there are no fees or penalties.',
    doItems: [
      'Earn 10% (up to ₹2.5L), 15% (₹2.5L–₹4L), 20% (₹4L–₹12L), and up to 25% (over ₹12L)',
      'Enjoy retrospective tier upgrades applying to all business closed in that monthly cycle',
      'Track all your potential and earned commissions in real time on your Partner Portal'
    ],
    dontItems: [
      'Commissions apply exclusively to actual revenue collected by AGX, not unpaid proposals'
    ],
    fullText: `2.1 Performance-Based Compensation: Commission payouts are calculated exclusively based on the actual client contract revenue collected ("Business Volume") by the Company from client leads introduced by the Partner and accepted by the Company.

2.2 Variable Tier Thresholds:
  (a) Starter Tier (10% Share): Applies to monthly client business up to ₹2,50,000. No minimum commitment or quota.
  (b) Base Tier (15% Share): Applies to monthly client business between ₹2,50,001 and ₹4,00,000.
  (c) Pro Tier (20% Share): Applies when monthly client business exceeds ₹4,00,000 up to ₹12,00,000. The 20% rate applies retrospectively to all business generated within that monthly billing cycle.
  (d) Elite Bonus Tier (25% Share): Applies when monthly client business exceeds ₹12,00,000. This includes a +5% Performance Bonus applied across total monthly business generated.

2.3 No Minimum Quotas: The Partner acknowledges that monthly business is variable and not fixed. There are no mandatory monthly minimums, maintenance fees, or demotion penalties for inactive or low-volume months.`
  },
  {
    id: 'clause-3-milestone-payouts',
    number: 3,
    title: 'Payment Milestones & Invoicing Protocol',
    shortLabel: '40% / 30% / 30% Payouts',
    statutoryReference: 'Sale of Goods Act, 1930 & Indian Contract Act, 1872',
    summary: 'Commissions are disbursed in milestone tranches (40% advance, 30% midway, 30% project completion) as client payments are actually cleared into AGX bank accounts.',
    keyTakeaway: 'Commissions are released in 3 clear milestones (40% advance, 30% midway, 30% completion) matching client payments.',
    realWorldExample: 'On a ₹1,00,000 total commission: You receive ₹40,000 the moment the client pays their deposit, ₹30,000 when the mid-project milestone is approved and paid, and the final ₹30,000 upon project delivery and final client settlement.',
    doItems: [
      'Receive payouts directly into your Indian bank account via UPI, NEFT, IMPS, or RTGS',
      'Get paid early in the project lifecycle instead of waiting months until the very end',
      'Request payout directly from your Partner Dashboard with 1 click'
    ],
    dontItems: [
      'If a client lawfully cancels or defaults before paying, unpaid future milestones cannot be disbursed'
    ],
    fullText: `3.1 Back-to-Back Milestone Realization: Partner commissions are earned and disbursed strictly on a cash-collected basis. The standard milestone distribution for client contracts follows:
  (a) First Tranche (40% of Commission): Released upon client signing contract and clearing the initial advance payment.
  (b) Second Tranche (30% of Commission): Released upon client approval and payment of the mid-project milestone.
  (c) Final Tranche (30% of Commission): Released upon final project handover and full settlement of the remaining invoice balance by the client.

3.2 Payment Methods: Payouts are remitted electronically via Unified Payments Interface (UPI), National Electronic Funds Transfer (NEFT), Real Time Gross Settlement (RTGS), or Immediate Payment Service (IMPS) to the designated Indian bank account or VPA provided by the Partner.

3.3 Refund & Chargeback Deductions: If a client terminates a project prior to completion or demands a lawful refund due to client-side default or insolvency, any unearned or disputed commission tranches already disbursed may be offset against subsequent commission accruals.`
  },
  {
    id: 'clause-4-tax-compliance',
    number: 4,
    title: 'Statutory Taxation, TDS & GST Compliance',
    shortLabel: 'Taxes & TDS (Form 16A)',
    statutoryReference: 'Income Tax Act, 1961 (Section 194H, 206AA) & Central Goods and Services Tax (CGST) Act, 2017',
    summary: 'Commission payments are subject to mandatory TDS withholding under Section 194H. Valid PAN is required. GST-registered partners must issue compliant tax invoices.',
    keyTakeaway: 'We follow Indian tax laws: 5% TDS is deducted on commissions and deposited under your PAN. You get Form 16A to claim full credit on your tax return.',
    realWorldExample: 'If your commission payout is ₹50,000, AGX deducts 5% TDS (₹2,500) and transfers ₹47,500 to your bank account. We pay the ₹2,500 directly to the Income Tax Dept. linked to your PAN. At year-end, you can claim this ₹2,500 back or adjust it in your ITR!',
    doItems: [
      'Provide your valid PAN to ensure standard 5% TDS deduction',
      'Download your quarterly Form 16A TDS certificate for filing your ITR',
      'Provide GSTIN invoice if your annual business turnover exceeds ₹20 Lakhs'
    ],
    dontItems: [
      'Do not provide invalid or missing PAN (Indian law mandates 20% penal deduction if PAN is absent)'
    ],
    fullText: `4.1 Tax Deducted at Source (TDS): All commission payouts made by the Company to the Partner are subject to statutory deduction of income tax under Section 194H of the Indian Income Tax Act, 1961 (applicable rate for commission or brokerage, currently 5% or 2% as amended by the Finance Act).

4.2 Mandatory PAN Requirement: The Partner must furnish a valid Indian Permanent Account Number (PAN). If the Partner fails to furnish a valid PAN or if the PAN is inoperative, tax shall be deducted at the higher penal rate of 20% in compliance with Section 206AA and Section 206AB of the Income Tax Act, 1961. The Company shall issue TDS certificates (Form 16A) on a quarterly basis.

4.3 Goods and Services Tax (GST): If the Partner is registered under the CGST/SGST/IGST Act, 2017, the Partner shall furnish its GST Identification Number (GSTIN) and raise a tax-compliant commercial invoice before commission disbursement. For non-registered partners whose aggregate turnover does not exceed the statutory threshold under Section 22 of the CGST Act, payouts will be processed on a personal commission voucher basis.`
  },
  {
    id: 'clause-5-lead-consent-dpdp',
    number: 5,
    title: 'Client Data Privacy & Lawful Lead Submission',
    shortLabel: 'Client Privacy (DPDP)',
    statutoryReference: 'Digital Personal Data Protection Act, 2023 (DPDP Act) & IT Rules, 2011',
    summary: 'Partners warrant that any client information (name, phone, email) submitted to AGX was obtained with the prospective client’s prior knowledge and explicit consent.',
    keyTakeaway: 'Only submit client contacts who actually want to speak with AGX. Zero spam, zero purchased lists.',
    realWorldExample: 'Introducing a business owner who asked you for AI automation help = 100% Allowed. Buying a database of 5,000 random corporate emails from the internet and spamming them = Strictly Prohibited.',
    doItems: [
      'Introduce genuine business contacts who know you and want AI solutions',
      'Comply with India\'s Digital Personal Data Protection Act (DPDP Act, 2023)',
      'Protect client confidentiality and business requirements at all times'
    ],
    dontItems: [
      'Never upload scraped email lists, leaked phone directories, or bulk spam leads'
    ],
    fullText: `5.1 Data Principal Consent: In compliance with the Digital Personal Data Protection Act, 2023 (DPDP Act) and the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011, the Partner represents and warrants that all personal data of prospective clients submitted through the Partner Portal (including names, email addresses, telephone numbers, and project specifications) is collected lawfully with the prior knowledge, consent, and authorization of the respective client.

5.2 Prohibition of Scraped or Purchased Lists: The Partner shall not submit cold scraped contact databases, purchased email lists, or unsolicited corporate directories. Any referral submitted must stem from a genuine business relationship or direct introduction.

5.3 Indemnification for Privacy Breaches: The Partner shall indemnify and hold harmless the Company against any regulatory penalty, consumer claim, or litigation resulting from unauthorized disclosure of third-party personal data submitted by the Partner.`
  },
  {
    id: 'clause-6-intellectual-property',
    number: 6,
    title: 'Intellectual Property & Proprietary Rights',
    shortLabel: 'AGX Software & IP',
    statutoryReference: 'Copyright Act, 1957 & Patents Act, 1970',
    summary: 'AGX owns 100% of all software, AI workflows, algorithms, brand assets, and client deliverables. Partner receives no license to reproduce or white-label AGX technology.',
    keyTakeaway: 'AGX owns all the AI software, code, algorithms, and brand materials. You have full rights to use our marketing pitch deck to win clients.',
    realWorldExample: 'You can present AGX demo slides, case studies, and brochures to prospective clients. However, you cannot take AGX\'s proprietary AI code and resell or claim it as your own software company\'s product.',
    doItems: [
      'Use official AGX banners, pitch decks, case studies, and referral links to promote solutions',
      'Showcase AGX capabilities proudly to your professional network'
    ],
    dontItems: [
      'Do not copy, reverse-engineer, or white-label AGX\'s underlying software or AI models',
      'Do not alter official AGX logos, trademarks, or copyrights'
    ],
    fullText: `6.1 Sole Proprietary Ownership: The Company retains all right, title, interest, and intellectual property in and to the AGX platform, brand names, trademarks, AI agent software, automated workflows, backend infrastructure, pitch decks, proposals, and customer deliverables.

6.2 Limited Marketing License: The Company grants the Partner a revocable, non-exclusive, non-transferable license to use official AGX logos, banners, and pitch materials solely for the purpose of introducing prospective clients in accordance with this Agreement. The Partner shall not alter, deface, or modify AGX trademarks.

6.3 Derivative Works: Any custom tools, integrations, workflows, or architectural frameworks developed by the Company during any client project remain the exclusive intellectual property of the Company.`
  },
  {
    id: 'clause-7-non-circumvention',
    number: 7,
    title: 'Non-Circumvention & Non-Poaching Covenant',
    shortLabel: '12-Month Fair Play',
    statutoryReference: 'Indian Contract Act, 1872 (Section 27 - Reasonable Business Protection)',
    summary: 'Partners cannot bypass AGX to directly contract with introduced clients for AI development for 12 months, nor solicit AGX engineers and contractors.',
    keyTakeaway: 'Work transparently. Don\'t go behind AGX\'s back to take away introduced clients for side deals, and don\'t poach AGX team members.',
    realWorldExample: 'If you introduce Client X to AGX for an AI project, you agree not to secretly cut AGX out and build the AI project yourself on the side for 12 months. Everyone wins together through transparent partnership.',
    doItems: [
      'Collaborate transparently with AGX technical specialists on every client deal',
      'Enjoy repeat referral credits when your clients expand their contracts'
    ],
    dontItems: [
      'Do not privately contract behind AGX\'s back with clients introduced through this program',
      'Do not solicit or hire away AGX software engineers and AI developers'
    ],
    fullText: `7.1 Non-Circumvention: For a period of twelve (12) months following the date of introduction of any client lead, the Partner covenants and agrees that it shall not, directly or indirectly, circumvent, bypass, or avoid the Company by privately contracting, subcontracting, or transacting with such introduced client for artificial intelligence, workflow automation, or enterprise software development services that compete directly with the Company’s service offerings.

7.2 Non-Solicitation of Personnel: The Partner shall not, directly or indirectly, induce, solicit, or recruit any software engineer, AI developer, contractor, or executive employee of the Company to leave their employment or contractual engagement with the Company.`
  },
  {
    id: 'clause-8-code-of-conduct',
    number: 8,
    title: 'Professional Code of Conduct & Anti-Spam',
    shortLabel: 'Ethical Marketing',
    statutoryReference: 'Information Technology Act, 2000 (Section 66A/43A) & Prevention of Corruption Act, 1988',
    summary: 'Strictly prohibits unsolicited spam, misleading performance claims, illegal inducements, or unauthorized pricing representations.',
    keyTakeaway: 'Be truthful and professional. No deceptive claims, no fake revenue promises, and no illegal bribes.',
    realWorldExample: 'You can say: "AGX builds automated enterprise workflows that saved a client 40 hours a week." You cannot say: "AGX guarantees you will become a millionaire in 3 days!" All pricing and official scopes come from verified AGX quotes.',
    doItems: [
      'Represent AGX solutions honestly and professionally',
      'Connect prospective clients with AGX technical specialists for official estimates'
    ],
    dontItems: [
      'Never send automated mass WhatsApp spam or unsolicited cold robocalls',
      'Never offer or accept bribes, kickbacks, or secret under-the-table commissions'
    ],
    fullText: `8.1 Anti-Spam Standards: The Partner agrees to uphold ethical commercial practices. The Partner shall not engage in unsolicited bulk commercial communications (spam), automated WhatsApp bot blasting without consent, or deceptive marketing tactics in promoting AGX.

8.2 Accurate Representations: The Partner shall not make any false, misleading, or deceptive representations regarding the Company’s AI capabilities, project turnaround schedules, or fee structures. All official pricing, delivery timelines, and project scopes must be finalized through official AGX quotations.

8.3 Anti-Bribery Compliance: The Partner shall comply with all anti-corruption and anti-bribery statutes, including the Prevention of Corruption Act, 1988. The Partner shall not offer, promise, give, or accept any illegal bribe, kickback, or illicit inducement in connection with this Agreement.`
  },
  {
    id: 'clause-9-termination',
    number: 9,
    title: 'Term, Suspension & Mutual Termination',
    shortLabel: '15-Day Exit Notice',
    statutoryReference: 'Indian Contract Act, 1872 (Section 39, 73)',
    summary: 'Either party may terminate with 15 days written notice. Immediate suspension applies for fraud, spam, or breach. Accrued commissions remain payable.',
    keyTakeaway: 'You or AGX can end this partnership anytime with a simple 15-day email notice. You still get paid for deals already closed!',
    realWorldExample: 'If you decide to pivot to another venture and want to leave the program, just email partners@agx.com. You have 15 days notice, and any commissions from active client deals already won are 100% paid to you.',
    doItems: [
      'Exit the partnership anytime without fees or penalties by giving 15 days notice',
      'Receive 100% of your verified earned commissions on active client contracts'
    ],
    dontItems: [
      'Fraudulent behavior, fake accounts, or spamming will lead to immediate account suspension'
    ],
    fullText: `9.1 Term: This Agreement commences upon electronic acceptance by the Partner in the Partner Portal and shall continue in force until terminated by either party.

9.2 Termination for Convenience: Either party may terminate this Agreement without cause upon giving fifteen (15) calendar days written notice via registered email to the other party.

9.3 Immediate Termination for Breach: The Company reserves the unilateral right to immediately suspend or terminate the Partner’s account and referral codes if the Partner engages in fraudulent referrals, self-dealing, material breach of confidentiality, non-circumvention violation, or defamatory conduct.

9.4 Survival of Accrued Earnings: Upon termination without cause, any verified commission balances accrued from deals already won and settled by clients shall remain payable to the Partner in according with Clause 3.`
  },
  {
    id: 'clause-10-governing-law',
    number: 10,
    title: 'Governing Law, Arbitration & Jurisdiction',
    shortLabel: 'Indian Law & Arbitration',
    statutoryReference: 'Arbitration and Conciliation Act, 1996 & Code of Civil Procedure, 1908',
    summary: 'Governed by the laws of India. Any disputes will be resolved through arbitration seated in Maharashtra, India. Exclusive jurisdiction in Maharashtra courts.',
    keyTakeaway: 'This agreement is governed by the laws of India. If any dispute arises, it is resolved quickly by a neutral arbitrator in Maharashtra, India.',
    realWorldExample: 'Instead of spending years in courtrooms, any disagreement is resolved swiftly and fairly by a mutually appointed arbitrator in Pune/Mumbai under the Arbitration and Conciliation Act, 1996.',
    doItems: [
      'Enjoy complete legal protection under the Indian Contract Act, 1872 and IT Act, 2000',
      'Resolve any rare dispute professionally and privately through Indian arbitration'
    ],
    dontItems: [
      'Neither party will initiate frivolous public litigation before attempting amicable arbitration'
    ],
    fullText: `10.1 Governing Law: This Agreement, its validity, performance, interpretation, and all legal relations between the parties shall be governed by, and construed in accordance with, the substantive laws of the Republic of India.

10.2 Dispute Resolution & Arbitration: Any dispute, controversy, claim, or difference arising out of or in connection with this Agreement shall be referred to and finally resolved by binding arbitration administered in accordance with the provisions of the Arbitration and Conciliation Act, 1996 (or any statutory modification or re-enactment thereof).
  (a) The arbitral tribunal shall consist of a sole arbitrator mutually appointed by the parties, or failing agreement within thirty (30) days, appointed in accordance with the Act.
  (b) The seat and legal place of arbitration shall be Pune / Mumbai, Maharashtra, India.
  (c) The arbitral proceedings shall be conducted in the English language.

10.3 Judicial Jurisdiction: Subject to the arbitration clause above, the courts of competent jurisdiction situated in Maharashtra, India shall have exclusive territorial and subject-matter jurisdiction over any suit, legal action, or interim proceedings arising out of this Agreement.`
  }
];

export interface FormattedAgreementData {
  partnerName: string;
  partnerCompany?: string;
  partnerEmail: string;
  referralCode: string;
  acceptanceDate: string;
  version: string;
}

export function generatePrintableAgreementText(data: FormattedAgreementData): string {
  const divider = '='.repeat(80);
  const subDivider = '-'.repeat(80);

  let output = `${divider}\n`;
  output += `           AGX PARTNER & REFERRAL PROGRAM LEGAL AGREEMENT\n`;
  output += `                (Under the Laws of the Republic of India)\n`;
  output += `Version: ${data.version} | Effective: ${PARTNER_AGREEMENT_EFFECTIVE_DATE}\n`;
  output += `${divider}\n\n`;

  output += `PARTIES TO THIS AGREEMENT:\n`;
  output += `1. FIRST PARTY (THE COMPANY): AGX (Antigravity Technologies / AGX Automation Labs),\n`;
  output += `   Enterprise AI & Automation Infrastructure Provider.\n`;
  output += `2. SECOND PARTY (THE PARTNER):\n`;
  output += `   Legal Name:     ${data.partnerName}\n`;
  if (data.partnerCompany) {
    output += `   Organization:   ${data.partnerCompany}\n`;
  }
  output += `   Registered Email: ${data.partnerEmail}\n`;
  output += `   Referral Code:  ${data.referralCode}\n`;
  output += `   Electronic Acceptance Timestamp: ${data.acceptanceDate}\n\n`;

  output += `${divider}\n`;
  output += `PART 1: PLAIN-ENGLISH EXECUTIVE SUMMARY (AT-A-GLANCE GUIDE)\n`;
  output += `${divider}\n\n`;

  for (const clause of PARTNER_AGREEMENT_CLAUSES) {
    output += `[Clause ${clause.number}] ${clause.title.toUpperCase()}\n`;
    output += `• Key Takeaway: ${clause.keyTakeaway}\n`;
    output += `• Real-World Example: ${clause.realWorldExample}\n`;
    output += `• What You Can Do:\n`;
    for (const doItem of clause.doItems) {
      output += `  + ${doItem}\n`;
    }
    output += `• What You Cannot Do:\n`;
    for (const dontItem of clause.dontItems) {
      output += `  - ${dontItem}\n`;
    }
    output += `\n`;
  }

  output += `${divider}\n`;
  output += `PART 2: FORMAL OPERATIVE LEGAL COVENANTS & STATUTORY CLAUSES\n`;
  output += `${divider}\n\n`;

  for (const clause of PARTNER_AGREEMENT_CLAUSES) {
    output += `CLAUSE ${clause.number}: ${clause.title.toUpperCase()}\n`;
    output += `Statutory Reference: ${clause.statutoryReference}\n`;
    output += `Summary: ${clause.summary}\n\n`;
    output += `${clause.fullText}\n\n`;
    output += `${subDivider}\n\n`;
  }

  output += `${divider}\n`;
  output += `ELECTRONIC EXECUTION & SIGNATURE RECORD\n`;
  output += `Pursuant to Section 10A of the Information Technology Act, 2000:\n`;
  output += `Digitally Accepted By: ${data.partnerName} (${data.partnerEmail})\n`;
  output += `Partner Identification: ${data.referralCode}\n`;
  output += `Certified Timestamp: ${data.acceptanceDate}\n`;
  output += `Status: Legally Binding Electronic Contract Executed in India\n`;
  output += `${divider}\n`;

  return output;
}
