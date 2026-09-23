import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Plus, Trash2, IndianRupee, Shield, FileText, CheckCircle2, AlertCircle, Building, UserCheck } from 'lucide-react';
import { Quotation, QuotationItem, QuotationStatus, GstType, Client, Lead, Project } from '../../types/crm';
import { toast } from '../../lib/toastStore';

export interface QuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (quoteData: Omit<Quotation, 'id' | 'createdAt' | 'updatedAt'>) => void;
  store?: any;
  clients?: Client[];
  leads?: Lead[];
  projects?: Project[];
  existingQuotation?: Quotation | null;
  quotation?: Quotation | null;
  initialLeadId?: string;
  initialClientId?: string;
}

export const QuotationModal: React.FC<QuotationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  store,
  clients: propClients,
  leads: propLeads,
  projects: propProjects,
  existingQuotation: propExistingQuotation,
  quotation,
  initialLeadId,
  initialClientId
}) => {
  const clients = propClients || store?.clients || [];
  const leads = propLeads || store?.leads || [];
  const projects = propProjects || store?.projects || [];
  const existingQuotation = quotation || propExistingQuotation || null;

  const [targetType, setTargetType] = useState<'client' | 'lead'>('client');
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  
  const [quotationNumber, setQuotationNumber] = useState('');
  const [clientName, setClientName] = useState('');
  const [leadName, setLeadName] = useState('');
  const [clientGstin, setClientGstin] = useState('');
  const [projectName, setProjectName] = useState('');

  const [issueDate, setIssueDate] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [status, setStatus] = useState<QuotationStatus>('Draft');

  // Items
  const [items, setItems] = useState<QuotationItem[]>([
    { description: 'Architecture, Technical Blueprint & Core AI Integration', quantity: 1, unitPrice: 25000, total: 25000, hsnSac: '998313' }
  ]);

  // Pricing & Tax
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [isGst, setIsGst] = useState<boolean>(true);
  const [gstType, setGstType] = useState<GstType>('IGST');
  const [taxRate, setTaxRate] = useState<number>(18);
  const [hsnSacCode, setHsnSacCode] = useState<string>('998313');

  // Terms & Notes
  const [notes, setNotes] = useState('');
  const [termsConditions, setTermsConditions] = useState(
    `1. Pricing & Scope: Valid for 14 calendar days from the issue date.\n` +
    `2. Payment Schedule: 50% milestone advance upon project kickoff, 50% upon final acceptance & handover.\n` +
    `3. Turnaround Timeline: Work commences within 2 business days following access provisioning.\n` +
    `4. Tax Invoicing: Upon formal quote acceptance, a statutory Tax Invoice will be generated under SAC 998313.`
  );

  // Initialize form state
  useEffect(() => {
    if (!isOpen) return;

    if (existingQuotation) {
      setQuotationNumber(existingQuotation.quotationNumber);
      setSelectedClientId(existingQuotation.clientId || '');
      setSelectedLeadId(existingQuotation.leadId || '');
      setSelectedProjectId(existingQuotation.projectId || '');
      setClientName(existingQuotation.clientName || '');
      setLeadName(existingQuotation.leadName || '');
      setClientGstin(existingQuotation.clientGstin || '');
      setProjectName(existingQuotation.projectName || '');
      setIssueDate(existingQuotation.issueDate);
      setValidUntil(existingQuotation.validUntil);
      setStatus(existingQuotation.status);
      setItems(existingQuotation.items && existingQuotation.items.length > 0 ? existingQuotation.items : [
        { description: 'Scope Deliverable', quantity: 1, unitPrice: existingQuotation.subtotal, total: existingQuotation.subtotal, hsnSac: '998313' }
      ]);
      setDiscountAmount(existingQuotation.discountAmount || 0);
      setIsGst(existingQuotation.isGst !== false);
      setGstType(existingQuotation.gstType || 'IGST');
      setTaxRate(existingQuotation.taxRate ?? 18);
      setHsnSacCode(existingQuotation.hsnSacCode || '998313');
      setNotes(existingQuotation.notes || '');
      setTermsConditions(existingQuotation.termsConditions || '');
      setTargetType(existingQuotation.leadId ? 'lead' : 'client');
    } else {
      // New quotation defaults
      const now = new Date();
      const issueIso = now.toISOString().split('T')[0];
      const validIso = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const randomSeq = String(Math.floor(100 + Math.random() * 900));
      setQuotationNumber(`QT-${now.getFullYear()}-${randomSeq}`);
      setIssueDate(issueIso);
      setValidUntil(validIso);
      setStatus('Draft');
      setDiscountAmount(0);
      setIsGst(true);
      setGstType('IGST');
      setTaxRate(18);
      setHsnSacCode('998313');
      setNotes('');

      if (initialLeadId) {
        setTargetType('lead');
        setSelectedLeadId(initialLeadId);
        const l = leads.find(lead => lead.id === initialLeadId);
        if (l) {
          setLeadName(l.name);
          setClientName(l.company || l.name);
          const val = l.estimatedDealValue || 25000;
          setItems([{ description: `${l.interestedService || 'AI Automation'} Sprint Delivery`, quantity: 1, unitPrice: val, total: val, hsnSac: '998313' }]);
        }
      } else if (initialClientId) {
        setTargetType('client');
        setSelectedClientId(initialClientId);
        const c = clients.find(cl => cl.id === initialClientId);
        if (c) {
          setClientName(c.company || c.name);
          setLeadName(c.name);
          setClientGstin(c.gstTaxId || '');
          setItems([{ description: `Bespoke AI Engineering Sprint`, quantity: 1, unitPrice: 30000, total: 30000, hsnSac: '998313' }]);
        }
      } else if (clients.length > 0) {
        setTargetType('client');
        setSelectedClientId(clients[0].id);
        setClientName(clients[0].company || clients[0].name);
        setLeadName(clients[0].name);
        setClientGstin(clients[0].gstTaxId || '');
        setItems([{ description: `AI Automation & Core Platform Development`, quantity: 1, unitPrice: 25000, total: 25000, hsnSac: '998313' }]);
      }
    }
  }, [isOpen, existingQuotation, initialLeadId, initialClientId, clients, leads]);

  // Handle client selection change
  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    const c = clients.find(cl => cl.id === clientId);
    if (c) {
      setClientName(c.company || c.name);
      setLeadName(c.name);
      setClientGstin(c.gstTaxId || '');
    }
  };

  // Handle lead selection change
  const handleLeadChange = (leadId: string) => {
    setSelectedLeadId(leadId);
    const l = leads.find(ld => ld.id === leadId);
    if (l) {
      setLeadName(l.name);
      setClientName(l.company || l.name);
      if (l.estimatedDealValue && l.estimatedDealValue > 0) {
        setItems(prev => prev.map((it, idx) => idx === 0 ? { ...it, description: `${l.interestedService} Implementation`, unitPrice: l.estimatedDealValue, total: it.quantity * l.estimatedDealValue } : it));
      }
    }
  };

  // Item management
  const handleAddItem = () => {
    setItems(prev => [
      ...prev,
      { description: 'Additional Deliverable / Module', quantity: 1, unitPrice: 10000, total: 10000, hsnSac: '998313' }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      toast.warning('At least one item required', 'A quotation must contain at least 1 line item.');
      return;
    }
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof QuotationItem, value: any) => {
    setItems(prev => {
      const copy = [...prev];
      const item = { ...copy[index], [field]: value };
      if (field === 'quantity' || field === 'unitPrice') {
        const qty = field === 'quantity' ? Number(value) : item.quantity;
        const price = field === 'unitPrice' ? Number(value) : item.unitPrice;
        item.total = Math.round(qty * price);
      }
      copy[index] = item;
      return copy;
    });
  };

  // Calculated totals
  const subtotal = items.reduce((sum, it) => sum + (it.total || 0), 0);
  const netSubtotal = Math.max(0, subtotal - (Number(discountAmount) || 0));
  const effectiveTaxRate = isGst ? (Number(taxRate) || 18) : 0;
  const tax = isGst ? Math.round(netSubtotal * (effectiveTaxRate / 100)) : 0;
  const grandTotal = netSubtotal + tax;

  const cgst = isGst && gstType === 'CGST_SGST' ? Math.round(tax / 2) : 0;
  const sgst = isGst && gstType === 'CGST_SGST' ? Math.round(tax / 2) : 0;
  const igst = isGst && gstType === 'IGST' ? tax : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientName.trim()) {
      toast.error('Recipient Required', 'Please enter or select a recipient company or client.');
      return;
    }

    if (!quotationNumber.trim()) {
      toast.error('Quotation Number Required', 'Please enter a unique quotation reference number.');
      return;
    }

    // Fallback: If targetType is client but selectedClientId was not explicitly picked, attempt matching by clientName
    let resolvedClientId = selectedClientId;
    if (targetType === 'client' && !resolvedClientId && clientName) {
      const match = clients.find(c =>
        c.company.toLowerCase().trim() === clientName.toLowerCase().trim() ||
        c.name.toLowerCase().trim() === clientName.toLowerCase().trim()
      );
      if (match) resolvedClientId = match.id;
    }

    // Fallback for lead
    let resolvedLeadId = selectedLeadId;
    if (targetType === 'lead' && !resolvedLeadId && (leadName || clientName)) {
      const match = leads.find(l =>
        l.name.toLowerCase().trim() === (leadName || clientName).toLowerCase().trim() ||
        (l.company && l.company.toLowerCase().trim() === (clientName || leadName).toLowerCase().trim())
      );
      if (match) resolvedLeadId = match.id;
    }

    const firstItemDesc = items[0]?.description || 'Commercial Scope Delivery';

    const payload: Omit<Quotation, 'id' | 'createdAt' | 'updatedAt'> = {
      quotationNumber: quotationNumber.trim(),
      leadId: targetType === 'lead' ? (resolvedLeadId || undefined) : undefined,
      leadName: leadName.trim() || undefined,
      clientId: targetType === 'client' ? (resolvedClientId || undefined) : undefined,
      clientName: clientName.trim(),
      companyName: clientName.trim(),
      company: clientName.trim(),
      serviceTitle: firstItemDesc,
      title: firstItemDesc,
      projectId: selectedProjectId || undefined,
      projectName: selectedProjectId ? projects.find(p => p.id === selectedProjectId)?.name : (projectName.trim() || undefined),
      issueDate,
      validUntil,
      items,
      subtotal,
      discountAmount: Number(discountAmount) || 0,
      isGst,
      gstType: isGst ? gstType : undefined,
      taxRate: effectiveTaxRate,
      tax,
      cgst,
      sgst,
      igst,
      total: grandTotal,
      status,
      clientGstin: clientGstin.trim() || undefined,
      hsnSacCode: hsnSacCode.trim() || '998313',
      notes: notes.trim() || undefined,
      termsConditions: termsConditions.trim() || undefined
    };

    if (onSave) {
      onSave(payload);
    } else if (store) {
      if (existingQuotation) {
        store.updateQuotation(existingQuotation.id, payload);
        toast.success('Quotation Updated', `Quotation ${payload.quotationNumber} updated successfully.`);
      } else {
        store.addQuotation(payload);
        toast.success('Quotation Created', `Quotation ${payload.quotationNumber} created successfully.`);
      }
    }
    onClose();
  };

  if (!isOpen) return null;

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
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black italic flex items-center justify-center text-sm shadow-xs">
              Q
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-gray-900 leading-none">
                {existingQuotation ? `Edit Quotation ${existingQuotation.quotationNumber}` : 'Create Commercial Quotation'}
              </h3>
              <span className="text-[11px] text-gray-400 block mt-0.5">
                Build itemized deliverables, pricing schedules, discounts & terms
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-black rounded-lg hover:bg-gray-200 transition-colors cursor-pointer btn-press"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-gray-800">
          {/* Target Type Selector */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
              Quotation Recipient Category:
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTargetType('client')}
                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  targetType === 'client'
                    ? 'bg-black text-[#CCFF00] border-black shadow-xs'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <Building size={14} /> Existing Client Account
              </button>
              <button
                type="button"
                onClick={() => setTargetType('lead')}
                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  targetType === 'lead'
                    ? 'bg-black text-[#CCFF00] border-black shadow-xs'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <UserCheck size={14} /> Prospective Deal / Lead
              </button>
            </div>
          </div>

          {/* Recipient Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
            {targetType === 'client' ? (
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">Select Client Account:</label>
                <select
                  value={selectedClientId}
                  onChange={(e) => handleClientChange(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-900 outline-none focus:border-black"
                >
                  <option value="">-- Choose Existing Client --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.company} ({c.name})</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">Select Lead Opportunity:</label>
                <select
                  value={selectedLeadId}
                  onChange={(e) => handleLeadChange(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-900 outline-none focus:border-black"
                >
                  <option value="">-- Choose Active Lead --</option>
                  {leads.map(l => (
                    <option key={l.id} value={l.id}>{l.name} - {l.company || 'No Company'} (₹{l.estimatedDealValue?.toLocaleString('en-IN')})</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">Client / Company Name *:</label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Apex Global Logistics"
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">Contact Person Name:</label>
              <input
                type="text"
                value={leadName}
                onChange={(e) => setLeadName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-900 outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">Client GSTIN (if registered):</label>
              <input
                type="text"
                value={clientGstin}
                onChange={(e) => setClientGstin(e.target.value)}
                placeholder="e.g. 29ABCDE1234F1Z5"
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono font-medium text-gray-900 outline-none focus:border-black"
              />
            </div>
          </div>

          {/* Reference & Validity Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">Quotation Ref #:</label>
              <input
                type="text"
                required
                value={quotationNumber}
                onChange={(e) => setQuotationNumber(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-gray-900 outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">Issue Date:</label>
              <input
                type="date"
                required
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">Valid Until (14d):</label>
              <input
                type="date"
                required
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">Quotation Status:</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as QuotationStatus)}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 outline-none focus:border-black"
              >
                <option value="Draft">Draft</option>
                <option value="Sent">Sent to Customer</option>
                <option value="Accepted">Accepted by Customer</option>
                <option value="Declined">Declined</option>
                <option value="Expired">Expired</option>
              </select>
            </div>
          </div>

          {/* Scope Deliverables (Line Items) Builder */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">Deliverables & Scope Breakdown</span>
                <span className="text-[11px] text-gray-400">Add granular sprints, services or custom deliverables</span>
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-3 py-1.5 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer btn-press"
              >
                <Plus size={13} className="text-[#CCFF00]" /> Add Item
              </button>
            </div>

            <div className="border border-gray-200 rounded-2xl overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 px-4 py-2.5 grid grid-cols-12 gap-2 text-[10px] font-bold uppercase text-gray-600">
                <span className="col-span-6">Scope / Deliverable Description</span>
                <span className="col-span-2 text-center">SAC Code</span>
                <span className="col-span-1 text-center">Qty</span>
                <span className="col-span-2 text-right">Unit Rate (₹)</span>
                <span className="col-span-1 text-center"></span>
              </div>

              <div className="divide-y divide-gray-100 p-2 space-y-2">
                {items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-6">
                      <input
                        type="text"
                        required
                        value={item.description}
                        onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                        placeholder="Description of sprint or technical deliverable"
                        className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 outline-none focus:border-black"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="text"
                        value={item.hsnSac || hsnSacCode}
                        onChange={(e) => handleItemChange(idx, 'hsnSac', e.target.value)}
                        placeholder="998313"
                        className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-center font-mono text-gray-700 outline-none focus:border-black"
                      />
                    </div>
                    <div className="col-span-1">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-1.5 py-1.5 text-xs text-center font-semibold text-gray-900 outline-none focus:border-black"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        min="0"
                        step="500"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-right font-mono font-semibold text-gray-900 outline-none focus:border-black"
                      />
                    </div>
                    <div className="col-span-1 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1 text-gray-400 hover:text-rose-600 rounded cursor-pointer"
                        title="Delete line item"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing, Tax Classification & Calculations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-gray-100">
            {/* Left: Tax & Discount Config */}
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1.5">Tax Classification Mode:</label>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 p-2 bg-gray-50 rounded-xl border border-gray-200 text-xs font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="taxMode"
                      checked={isGst && gstType === 'IGST'}
                      onChange={() => { setIsGst(true); setGstType('IGST'); setTaxRate(18); }}
                    />
                    <span>Inter-State (IGST 18%)</span>
                  </label>
                  <label className="flex items-center gap-1.5 p-2 bg-gray-50 rounded-xl border border-gray-200 text-xs font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="taxMode"
                      checked={isGst && gstType === 'CGST_SGST'}
                      onChange={() => { setIsGst(true); setGstType('CGST_SGST'); setTaxRate(18); }}
                    />
                    <span>Intra-State (CGST + SGST)</span>
                  </label>
                  <label className="flex items-center gap-1.5 p-2 bg-gray-50 rounded-xl border border-gray-200 text-xs font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="taxMode"
                      checked={!isGst}
                      onChange={() => { setIsGst(false); setTaxRate(0); }}
                    />
                    <span>Non-GST / Export</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">Commercial Discount (₹):</label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(Number(e.target.value))}
                  placeholder="0"
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono font-semibold text-emerald-700 outline-none focus:border-black"
                />
              </div>
            </div>

            {/* Right: Calculated Summary Box */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2 text-xs">
              <span className="font-extrabold uppercase text-gray-900 block text-[11px] mb-2">Quotation Financial Summary</span>
              <div className="flex justify-between text-gray-600">
                <span>Items Subtotal:</span>
                <span className="font-mono font-bold text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Special Discount:</span>
                  <span className="font-mono">- ₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              {isGst ? (
                gstType === 'CGST_SGST' ? (
                  <>
                    <div className="flex justify-between text-gray-600">
                      <span>CGST (9%):</span>
                      <span className="font-mono text-gray-900">₹{cgst.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>SGST (9%):</span>
                      <span className="font-mono text-gray-900">₹{sgst.toLocaleString('en-IN')}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-gray-600">
                    <span>IGST (18%):</span>
                    <span className="font-mono text-gray-900">₹{igst.toLocaleString('en-IN')}</span>
                  </div>
                )
              ) : (
                <div className="flex justify-between text-gray-500 text-[11px]">
                  <span>GST:</span>
                  <span>Zero-Rated Export / LUT</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t-2 border-gray-900 text-sm font-extrabold text-gray-900">
                <span>Estimated Grand Total:</span>
                <span className="font-mono text-indigo-700">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Scope Notes & Terms Editor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
            <div>
              <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">Internal Notes & Scope Clarifications:</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes on client expectations, custom integrations, or architecture requirements..."
                className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs text-gray-900 outline-none focus:border-black resize-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">Commercial Terms & Conditions:</label>
              <textarea
                rows={3}
                value={termsConditions}
                onChange={(e) => setTermsConditions(e.target.value)}
                placeholder="Payment terms, timeline, revision rules..."
                className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs text-gray-900 outline-none focus:border-black resize-none"
              />
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-black rounded-xl hover:bg-gray-100 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-md cursor-pointer transition-colors btn-press"
            >
              <CheckCircle2 size={14} className="text-[#CCFF00]" />
              <span>{existingQuotation ? 'Save Changes' : 'Generate Quotation'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
