import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText, Plus, Search, Download, ExternalLink, Filter, CheckCircle2,
  Clock, Shield, X, Sparkles, Folder, Edit3, Trash2, UploadCloud,
  Layers, IndianRupee, Eye, CheckCircle, AlertCircle, ArrowUpRight,
  Briefcase, Users, FileCheck, Calendar, ArrowRight, Printer
} from 'lucide-react';
import { Agreement, DocumentItem, AgreementType, AgreementStatus } from '../../types/crm';
import { useCrmStore } from '../../lib/crmStore';
import { crmService } from '../../lib/crmService';
import { exportService } from '../../lib/exportService';
import { toast } from '../../lib/toastStore';

interface DocumentsViewProps {
  store: ReturnType<typeof useCrmStore>;
  onNavigate: (route: string, entityId?: string) => void;
  initialSelectedId?: string;
}

const AGREEMENT_TYPES: AgreementType[] = [
  'Master Service Agreement',
  'NDA',
  'Statement of Work',
  'Retainer',
  'Proposal'
];

const AGREEMENT_STATUSES: { status: AgreementStatus; label: string; badge: string }[] = [
  { status: 'Draft', label: 'Draft', badge: 'bg-gray-100 text-gray-700' },
  { status: 'Sent', label: 'Sent', badge: 'bg-blue-100 text-blue-700' },
  { status: 'Signed', label: 'Signed', badge: 'bg-emerald-100 text-emerald-700' }
];

export const DocumentsView: React.FC<DocumentsViewProps> = ({ store, onNavigate, initialSelectedId }) => {
  const {
    agreements, addAgreement, updateAgreement, deleteAgreement,
    documents, addDocument, deleteDocument,
    clients, projects, leads, currentUser
  } = store;

  const [activeTab, setActiveTab] = useState<'Agreements' | 'Files'>('Agreements');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClientFilter, setSelectedClientFilter] = useState<string>('All');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');
  const [selectedDocTypeFilter, setSelectedDocTypeFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'value' | 'expiry' | 'recent' | 'name'>('value');

  // Modals & Drawer State
  const [selectedAgreement, setSelectedAgreement] = useState<Agreement | null>(null);
  const [previewingAgreement, setPreviewingAgreement] = useState<Agreement | null>(null);
  const [isAddAgreementModalOpen, setIsAddAgreementModalOpen] = useState(false);
  const [isAddDocModalOpen, setIsAddDocModalOpen] = useState(false);
  const [editingAgreement, setEditingAgreement] = useState<Agreement | null>(null);
  const [agreementToDelete, setAgreementToDelete] = useState<Agreement | null>(null);
  const [docToDelete, setDocToDelete] = useState<DocumentItem | null>(null);

  // File Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Auto-select agreement or document if navigated with ID or quick create
  useEffect(() => {
    if (initialSelectedId === 'new') {
      setActiveTab('Agreements');
      setIsAddAgreementModalOpen(true);
      onNavigate('documents', undefined);
    } else if (initialSelectedId) {
      const agrMatch = agreements.find(a => a.id === initialSelectedId);
      if (agrMatch) {
        setActiveTab('Agreements');
        setSelectedAgreement(agrMatch);
      } else {
        const docMatch = documents.find(d => d.id === initialSelectedId);
        if (docMatch) {
          setActiveTab('Files');
          setSearchQuery(docMatch.title);
        }
      }
      onNavigate('documents', undefined);
    }
  }, [initialSelectedId]);

  // Form State for New Agreement
  const [newAgreement, setNewAgreement] = useState({
    name: '',
    agreementType: 'Master Service Agreement' as AgreementType,
    clientId: '',
    clientName: '',
    projectId: '',
    projectName: '',
    leadId: '',
    startDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    commercialValue: 25000,
    status: 'Draft' as AgreementStatus,
    fileUrl: '#'
  });

  // Form State for New Document
  const [newDoc, setNewDoc] = useState({
    title: '',
    docType: 'Specification' as const,
    clientId: clients[0]?.id || '',
    clientName: clients[0]?.company || '',
    fileUrl: '#',
    fileSize: '1.8 MB',
    uploadedBy: currentUser?.fullName || 'Abhinav'
  });

  // Legal & Documents KPI Metrics
  const workspaceMetrics = useMemo(() => {
    const totalAgreements = agreements.length;
    const signedAgreements = agreements.filter(a => a.status === 'Signed').length;
    const pendingSignatures = agreements.filter(a => a.status === 'Sent' || a.status === 'Draft').length;
    const totalContractedValue = agreements.reduce((sum, a) => sum + (a.commercialValue || 0), 0);
    const totalDocs = documents.length;

    return {
      totalAgreements,
      signedAgreements,
      pendingSignatures,
      totalContractedValue,
      totalDocs
    };
  }, [agreements, documents]);

  // Dynamic filter options
  const dynamicClients = useMemo(() => {
    const set = new Set<string>();
    clients.forEach(c => set.add(c.company));
    agreements.forEach(a => { if (a.clientName) set.add(a.clientName); });
    documents.forEach(d => { if (d.clientName) set.add(d.clientName); });
    return Array.from(set);
  }, [clients, agreements, documents]);

  // Filtered and Sorted Agreements
  const filteredAgreements = useMemo(() => {
    let result = agreements.filter(a => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        a.name.toLowerCase().includes(q) ||
        a.clientName.toLowerCase().includes(q) ||
        a.agreementType.toLowerCase().includes(q) ||
        (a.projectName && a.projectName.toLowerCase().includes(q));

      const matchesClient = selectedClientFilter === 'All' || a.clientName === selectedClientFilter || a.clientId === selectedClientFilter;
      const matchesType = selectedTypeFilter === 'All' || a.agreementType === selectedTypeFilter;
      const matchesStatus = selectedStatusFilter === 'All' || a.status === selectedStatusFilter;

      return matchesSearch && matchesClient && matchesType && matchesStatus;
    });

    return result.sort((a, b) => {
      if (sortBy === 'value') return (b.commercialValue || 0) - (a.commercialValue || 0);
      if (sortBy === 'expiry') return new Date(a.expiryDate || '').getTime() - new Date(b.expiryDate || '').getTime();
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
    });
  }, [agreements, searchQuery, selectedClientFilter, selectedTypeFilter, selectedStatusFilter, sortBy]);

  // Filtered Documents
  const filteredDocs = useMemo(() => {
    return documents.filter(d => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        d.title.toLowerCase().includes(q) ||
        (d.clientName && d.clientName.toLowerCase().includes(q)) ||
        d.docType.toLowerCase().includes(q);

      const matchesClient = selectedClientFilter === 'All' || d.clientName === selectedClientFilter || d.clientId === selectedClientFilter;
      const matchesDocType = selectedDocTypeFilter === 'All' || d.docType === selectedDocTypeFilter;

      return matchesSearch && matchesClient && matchesDocType;
    });
  }, [documents, searchQuery, selectedClientFilter, selectedDocTypeFilter]);

  // Agreement Action Handlers
  const handleCreateAgreement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgreement.name.trim()) {
      toast.error('Validation Error', 'Please enter an agreement title.');
      return;
    }
    setIsUploading(true);
    let publicUrl = newAgreement.fileUrl;

    if (selectedFile) {
      const { publicUrl: uploadedUrl, error } = await crmService.uploadAttachment('crm-agreements', selectedFile);
      if (!error && uploadedUrl) {
        publicUrl = uploadedUrl;
      }
    }

    const cl = clients.find(c => c.id === newAgreement.clientId);
    const pr = projects.find(p => p.id === newAgreement.projectId);
    const ld = leads.find(l => l.id === newAgreement.leadId);
    addAgreement({
      ...newAgreement,
      fileUrl: publicUrl,
      clientId: cl ? cl.id : undefined,
      clientName: cl ? cl.company : (ld ? (ld.company || ld.name) : newAgreement.clientName || 'Client'),
      projectId: pr ? pr.id : undefined,
      projectName: pr ? pr.name : newAgreement.projectName || undefined,
      leadId: ld ? ld.id : undefined,
      leadName: ld ? (ld.company || ld.name) : undefined
    });
    setIsUploading(false);
    setSelectedFile(null);
    setIsAddAgreementModalOpen(false);
    toast.success('Agreement Created', `${newAgreement.name} registered.`);
  };

  const handleSaveEditAgreement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAgreement) return;
    updateAgreement(editingAgreement.id, editingAgreement);
    if (selectedAgreement?.id === editingAgreement.id) {
      setSelectedAgreement(editingAgreement);
    }
    setEditingAgreement(null);
    toast.success('Agreement Updated', `${editingAgreement.name} saved.`);
  };

  const handleConfirmDeleteAgreement = () => {
    if (!agreementToDelete) return;
    deleteAgreement(agreementToDelete.id);
    if (selectedAgreement?.id === agreementToDelete.id) {
      setSelectedAgreement(null);
    }
    setAgreementToDelete(null);
    toast.success('Agreement Removed', 'Contract record deleted.');
  };

  const handleUpdateStatus = (agrId: string, status: AgreementStatus) => {
    updateAgreement(agrId, { status });
    if (selectedAgreement?.id === agrId) {
      setSelectedAgreement(prev => prev ? { ...prev, status } : null);
    }
    toast.success('Status Updated', `Agreement moved to ${status}`);
  };

  // Document Upload Handlers
  const handleCreateDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoc.title.trim()) {
      toast.error('Validation Error', 'Please enter a document title.');
      return;
    }
    setIsUploading(true);
    let publicUrl = newDoc.fileUrl;
    let sizeStr = newDoc.fileSize;

    if (selectedFile) {
      sizeStr = `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`;
      const { publicUrl: uploadedUrl, error } = await crmService.uploadAttachment('crm-documents', selectedFile);
      if (!error && uploadedUrl) {
        publicUrl = uploadedUrl;
      }
    }

    const cl = clients.find(c => c.id === newDoc.clientId);
    addDocument({
      ...newDoc,
      fileUrl: publicUrl,
      fileSize: sizeStr,
      clientName: cl ? cl.company : newDoc.clientName
    });
    setIsUploading(false);
    setSelectedFile(null);
    setIsAddDocModalOpen(false);
    toast.success('Document Attached', `${newDoc.title} uploaded.`);
  };

  const handleConfirmDeleteDoc = () => {
    if (!docToDelete) return;
    deleteDocument(docToDelete.id);
    setDocToDelete(null);
    toast.success('Document Removed', 'File deleted.');
  };

  const handleExportCsv = () => {
    if (activeTab === 'Agreements') {
      exportService.exportToCsv('agx_agreements', filteredAgreements.map(a => ({
        ID: a.id,
        Name: a.name,
        Type: a.agreementType,
        Client: a.clientName,
        Project: a.projectName || 'General',
        CommercialINR: a.commercialValue,
        StartDate: a.startDate,
        ExpiryDate: a.expiryDate,
        Status: a.status
      })));
    } else {
      exportService.exportToCsv('agx_documents', filteredDocs.map(d => ({
        ID: d.id,
        Title: d.title,
        DocType: d.docType,
        Client: d.clientName || 'Internal',
        Size: d.fileSize,
        UploadedBy: d.uploadedBy,
        CreatedAt: d.createdAt
      })));
    }
  };

  // Reactive Selected Agreement
  const currentSelectedAgreement = selectedAgreement
    ? (agreements.find(a => a.id === selectedAgreement.id) || selectedAgreement)
    : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            Agreements & Document Workspace
          </h2>
          <p className="text-xs text-gray-500">
            Centralized document hub for MSAs, NDAs, technical blueprints, and client deliverables.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold text-xs shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Download size={14} /> Export CSV
          </button>

          <button
            onClick={() => setIsAddDocModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-gray-900 hover:bg-black text-white font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Plus size={14} /> Upload Document
          </button>
          <button
            onClick={() => setIsAddAgreementModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-bold text-xs shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Plus size={15} /> New Agreement
          </button>
        </div>
      </div>

      {/* Row 1: KPI Metrics Header with Double-Bezel Architecture */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="double-bezel-outer card-tactile">
          <div className="double-bezel-inner p-5 flex items-start justify-between">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Active Contracts</span>
              <span className="text-2xl font-black text-gray-900 mt-1 block tabular-nums">
                {workspaceMetrics.signedAgreements} Signed
              </span>
              <span className="text-xs text-indigo-600 font-bold flex items-center gap-1 mt-1 tabular-nums">
                <FileCheck size={13} /> {workspaceMetrics.totalAgreements} Total Agreements
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shadow-xs">
              <FileText size={18} />
            </div>
          </div>
        </div>

        <div className="double-bezel-outer card-tactile">
          <div className="double-bezel-inner p-5 flex items-start justify-between">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Contracted Value</span>
              <span className="text-2xl font-black text-emerald-600 mt-1 block tabular-nums">
                ₹{workspaceMetrics.totalContractedValue.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-emerald-700 font-bold flex items-center gap-1 mt-1 tabular-nums">
                <IndianRupee size={13} /> Portfolio Commitments
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-xs">
              <IndianRupee size={18} />
            </div>
          </div>
        </div>

        <div className="double-bezel-outer card-tactile">
          <div className="double-bezel-inner p-5 flex items-start justify-between">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Technical Blueprints</span>
              <span className="text-2xl font-black text-purple-600 mt-1 block tabular-nums">
                {workspaceMetrics.totalDocs} Files
              </span>
              <span className="text-xs text-purple-700 font-bold flex items-center gap-1 mt-1 tabular-nums">
                <Layers size={13} /> Specs & Deliverables
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold shadow-xs">
              <Folder size={18} />
            </div>
          </div>
        </div>

        <div className="double-bezel-outer card-tactile">
          <div className="double-bezel-inner p-5 flex items-start justify-between">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Pending Execution</span>
              <span className="text-2xl font-black text-amber-600 mt-1 block tabular-nums">
                {workspaceMetrics.pendingSignatures} Awaiting
              </span>
              <span className="text-xs text-amber-700 font-bold flex items-center gap-1 mt-1 tabular-nums">
                <Clock size={13} /> Drafts & Out for Signature
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shadow-xs">
              <Clock size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Tabs & View Mode & Dynamic Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('Agreements')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'Agreements' ? 'bg-white text-black shadow-xs' : 'text-gray-500 hover:text-black'
                }`}
              >
                Legal Agreements ({agreements.length})
              </button>
              <button
                onClick={() => setActiveTab('Files')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'Files' ? 'bg-white text-black shadow-xs' : 'text-gray-500 hover:text-black'
                }`}
              >
                Files & Attachments ({documents.length})
              </button>
            </div>

            <div className="flex items-center bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white text-black shadow-xs' : 'text-gray-500 hover:text-black'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-black shadow-xs' : 'text-gray-500 hover:text-black'
                }`}
              >
                Table
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap flex-1 justify-end">
            <div className="relative w-full sm:w-64">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search contracts, files..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-xs text-gray-800 outline-none focus:border-black"
              />
            </div>

            {/* Client Filter */}
            <select
              value={selectedClientFilter}
              onChange={(e) => setSelectedClientFilter(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 rounded-xl px-3 py-2 outline-none cursor-pointer hover:border-gray-300 max-w-[170px] truncate"
            >
              <option value="All">All Clients ({dynamicClients.length})</option>
              {dynamicClients.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {activeTab === 'Agreements' ? (
              <>
                {/* Agreement Type Filter */}
                <select
                  value={selectedTypeFilter}
                  onChange={(e) => setSelectedTypeFilter(e.target.value)}
                  className="bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 rounded-xl px-3 py-2 outline-none cursor-pointer hover:border-gray-300 max-w-[170px] truncate"
                >
                  <option value="All">All Types</option>
                  {AGREEMENT_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>

                {/* Status Filter */}
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 rounded-xl px-3 py-2 outline-none cursor-pointer hover:border-gray-300"
                >
                  <option value="All">All Statuses</option>
                  <option value="Draft">Draft</option>
                  <option value="Sent">Sent</option>
                  <option value="Signed">Signed</option>
                </select>
              </>
            ) : (
              /* Doc Type Filter */
              <select
                value={selectedDocTypeFilter}
                onChange={(e) => setSelectedDocTypeFilter(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 rounded-xl px-3 py-2 outline-none cursor-pointer hover:border-gray-300"
              >
                <option value="All">All Doc Types</option>
                <option value="Specification">Specification</option>
                <option value="Design">UI/UX Design</option>
                <option value="Contract">Contract</option>
                <option value="Invoice">Invoice</option>
              </select>
            )}

            {/* Sorting */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 rounded-xl px-3 py-2 outline-none cursor-pointer hover:border-gray-300"
            >
              <option value="value">Sort: Value</option>
              <option value="expiry">Sort: Expiry Date</option>
              <option value="recent">Sort: Recently Added</option>
              <option value="name">Sort: Name</option>
            </select>
          </div>
        </div>

        {/* Active Filter Badges */}
        {(searchQuery || selectedClientFilter !== 'All' || selectedTypeFilter !== 'All' || selectedStatusFilter !== 'All' || selectedDocTypeFilter !== 'All') && (
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100 text-xs text-gray-500 flex-wrap">
            <span className="font-semibold">Active Filters:</span>
            {searchQuery && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded-md font-medium flex items-center gap-1">
                "{searchQuery}" <X size={11} className="cursor-pointer" onClick={() => setSearchQuery('')} />
              </span>
            )}
            {selectedClientFilter !== 'All' && (
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md font-medium flex items-center gap-1">
                Client: {selectedClientFilter} <X size={11} className="cursor-pointer" onClick={() => setSelectedClientFilter('All')} />
              </span>
            )}
            {selectedTypeFilter !== 'All' && (
              <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md font-medium flex items-center gap-1">
                Type: {selectedTypeFilter} <X size={11} className="cursor-pointer" onClick={() => setSelectedTypeFilter('All')} />
              </span>
            )}
            {selectedStatusFilter !== 'All' && (
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md font-medium flex items-center gap-1">
                Status: {selectedStatusFilter} <X size={11} className="cursor-pointer" onClick={() => setSelectedStatusFilter('All')} />
              </span>
            )}
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedClientFilter('All');
                setSelectedTypeFilter('All');
                setSelectedStatusFilter('All');
                setSelectedDocTypeFilter('All');
              }}
              className="text-indigo-600 font-bold hover:underline ml-auto cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Row 3: TAB 1 - LEGAL AGREEMENTS */}
      {activeTab === 'Agreements' && (
        <>
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredAgreements.length === 0 ? (
                <div className="col-span-full bg-white rounded-3xl p-12 text-center text-gray-400 border border-dashed border-gray-200">
                  <FileText size={36} className="mx-auto mb-2 opacity-30" />
                  <p className="text-xs">No legal agreements match the specified filters.</p>
                </div>
              ) : (
                filteredAgreements.map((agr) => (
                  <div
                    key={agr.id}
                    onClick={() => setSelectedAgreement(agr)}
                    className={`bg-white rounded-3xl p-6 border transition-all flex flex-col justify-between relative group cursor-pointer ${
                      selectedAgreement?.id === agr.id
                        ? 'border-black shadow-lg ring-2 ring-black/5'
                        : 'border-gray-100 hover:border-gray-300 shadow-sm hover:shadow-md'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full ${
                          agr.status === 'Signed' ? 'bg-emerald-100 text-emerald-800' :
                          agr.status === 'Sent' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {agr.status}
                        </span>
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setPreviewingAgreement(agr)}
                            className="p-1 text-gray-400 hover:text-indigo-600 rounded cursor-pointer"
                            title="Preview Agreement Document"
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            onClick={() => setEditingAgreement(agr)}
                            className="p-1 text-gray-400 hover:text-indigo-600 rounded cursor-pointer"
                            title="Edit Agreement"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={() => setAgreementToDelete(agr)}
                            className="p-1 text-gray-400 hover:text-rose-600 rounded cursor-pointer"
                            title="Delete Agreement"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <h4 className="font-extrabold text-sm text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {agr.name}
                      </h4>
                      <p className="text-xs text-gray-400 mb-3">
                        Client: <strong className="text-gray-700">{agr.clientName}</strong> {agr.projectName ? `• ${agr.projectName}` : ''}
                      </p>

                      <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 text-xs space-y-1.5 text-gray-600">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Type:</span>
                          <span className="font-semibold text-gray-800">{agr.agreementType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Commercial Value:</span>
                          <span className="font-bold text-gray-900">₹{agr.commercialValue?.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Period:</span>
                          <span>{agr.startDate} → {agr.expiryDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                      <span className="text-gray-400 text-[10px] font-mono">ID: {agr.id.slice(0, 8)}...</span>
                      <span className="font-bold text-gray-900 flex items-center gap-1 group-hover:text-indigo-600">
                        Inspect <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {viewMode === 'table' && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Agreement Name</th>
                      <th className="py-3.5 px-3">Client & Project</th>
                      <th className="py-3.5 px-3">Agreement Type</th>
                      <th className="py-3.5 px-3">Commercial Value</th>
                      <th className="py-3.5 px-3">Validity Period</th>
                      <th className="py-3.5 px-3">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {filteredAgreements.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-gray-400 text-xs">
                          No legal agreements found.
                        </td>
                      </tr>
                    ) : (
                      filteredAgreements.map((agr) => (
                        <tr
                          key={agr.id}
                          onClick={() => setSelectedAgreement(agr)}
                          className="hover:bg-gray-50/80 transition-colors cursor-pointer group"
                        >
                          <td className="py-3.5 px-4 font-bold text-gray-900 group-hover:text-indigo-600">{agr.name}</td>
                          <td className="py-3.5 px-3">
                            <div className="font-semibold text-gray-800">{agr.clientName}</div>
                            <div className="text-[10px] text-gray-400">{agr.projectName || 'General Agreement'}</div>
                          </td>
                          <td className="py-3.5 px-3 text-gray-700">{agr.agreementType}</td>
                          <td className="py-3.5 px-3 font-bold text-gray-900">₹{agr.commercialValue?.toLocaleString('en-IN')}</td>
                          <td className="py-3.5 px-3 text-gray-500">{agr.startDate} → {agr.expiryDate}</td>
                          <td className="py-3.5 px-3">
                            <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                              agr.status === 'Signed' ? 'bg-emerald-100 text-emerald-800' :
                              agr.status === 'Sent' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {agr.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setPreviewingAgreement(agr)}
                                className="p-1 text-gray-400 hover:text-indigo-600 rounded cursor-pointer"
                                title="Preview Agreement Document"
                              >
                                <Eye size={13} />
                              </button>
                              <button
                                onClick={() => setEditingAgreement(agr)}
                                className="p-1 text-gray-400 hover:text-black rounded cursor-pointer"
                                title="Edit Agreement"
                              >
                                <Edit3 size={13} />
                              </button>
                              <button
                                onClick={() => setAgreementToDelete(agr)}
                                className="p-1 text-gray-400 hover:text-rose-600 rounded cursor-pointer"
                                title="Delete Agreement"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Row 4: TAB 2 - FILES & ATTACHMENTS */}
      {activeTab === 'Files' && (
        <>
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredDocs.length === 0 ? (
                <div className="col-span-full bg-white rounded-3xl p-12 text-center text-gray-400 border border-dashed border-gray-200">
                  <Folder size={36} className="mx-auto mb-2 opacity-30" />
                  <p className="text-xs">No files or attachments match the specified filters.</p>
                </div>
              ) : (
                filteredDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative group"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                          <FileText size={20} />
                        </div>
                        <button
                          onClick={() => setDocToDelete(doc)}
                          className="p-1 text-gray-400 hover:text-rose-600 rounded cursor-pointer"
                          title="Delete File"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <h4 className="font-extrabold text-sm text-gray-900 mb-1 line-clamp-1">{doc.title}</h4>
                      <p className="text-xs text-gray-400">
                        {doc.docType} • {doc.clientName || 'AGX Internal'}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                      <span>{doc.fileSize} • By {doc.uploadedBy}</span>
                      <a
                        href={doc.fileUrl !== '#' ? doc.fileUrl : undefined}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => {
                          if (doc.fileUrl === '#') toast.info('File Preview', `Accessing blueprint attachment: ${doc.title}`);
                        }}
                        className="text-indigo-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Download size={13} /> Open
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {viewMode === 'table' && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Document Title</th>
                      <th className="py-3.5 px-3">Type</th>
                      <th className="py-3.5 px-3">Client Allocation</th>
                      <th className="py-3.5 px-3">File Size</th>
                      <th className="py-3.5 px-3">Uploaded By</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {filteredDocs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-gray-400 text-xs">
                          No documents uploaded.
                        </td>
                      </tr>
                    ) : (
                      filteredDocs.map((doc) => (
                        <tr key={doc.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-gray-900">{doc.title}</td>
                          <td className="py-3.5 px-3">
                            <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-gray-100 text-gray-800">
                              {doc.docType}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-gray-600">{doc.clientName || 'Internal AGX'}</td>
                          <td className="py-3.5 px-3 text-gray-500">{doc.fileSize}</td>
                          <td className="py-3.5 px-3 text-gray-700">{doc.uploadedBy}</td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <a
                                href={doc.fileUrl !== '#' ? doc.fileUrl : undefined}
                                target="_blank"
                                rel="noreferrer"
                                onClick={() => {
                                  if (doc.fileUrl === '#') toast.info('File Preview', `Opening ${doc.title}`);
                                }}
                                className="px-2.5 py-1 bg-black text-white rounded-lg font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                              >
                                <Download size={11} /> Open
                              </a>
                              <button
                                onClick={() => setDocToDelete(doc)}
                                className="p-1 text-gray-400 hover:text-rose-600 rounded cursor-pointer"
                                title="Delete File"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Row 5: 360° Agreement Inspection Drawer */}
      <AnimatePresence>
        {currentSelectedAgreement && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, x: 400 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 400 }}
              className="bg-white w-full max-w-2xl h-full shadow-2xl overflow-y-auto flex flex-col p-6 sm:p-8 justify-between"
            >
              <div>
                {/* Drawer Header */}
                <div className="flex items-start justify-between pb-5 border-b border-gray-100">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full ${
                        currentSelectedAgreement.status === 'Signed' ? 'bg-emerald-100 text-emerald-800' :
                        currentSelectedAgreement.status === 'Sent' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {currentSelectedAgreement.status}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400">
                        {currentSelectedAgreement.agreementType}
                      </span>
                    </div>
                    <h2 className="text-xl font-extrabold text-gray-900">{currentSelectedAgreement.name}</h2>
                    <span className="text-xs text-gray-500">
                      Client Account: <strong>{currentSelectedAgreement.clientName}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingAgreement(currentSelectedAgreement)}
                      className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Edit3 size={14} /> Edit
                    </button>
                    <button
                      onClick={() => setSelectedAgreement(null)}
                      className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-900 cursor-pointer transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                {/* Quick Linkage Shortcuts */}
                <div className="grid grid-cols-3 gap-2 my-4">
                  {currentSelectedAgreement.clientId && (
                    <button
                      onClick={() => {
                        const cId = currentSelectedAgreement.clientId;
                        setSelectedAgreement(null);
                        onNavigate('clients', cId);
                      }}
                      className="py-2 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Users size={13} /> Client 360°
                    </button>
                  )}
                  {currentSelectedAgreement.projectId && (
                    <button
                      onClick={() => {
                        const pId = currentSelectedAgreement.projectId;
                        setSelectedAgreement(null);
                        onNavigate('projects', pId);
                      }}
                      className="py-2 px-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Briefcase size={13} /> Project Hub
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSelectedAgreement(null);
                      onNavigate('finance', 'new');
                    }}
                    className="py-2 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <IndianRupee size={13} /> Issue Invoice
                  </button>
                </div>

                {/* 1-Click Status Execution Progression */}
                <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100 mb-5">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-2">Execution & Signature Workflow</span>
                  <div className="flex items-center gap-1.5">
                    {AGREEMENT_STATUSES.map(s => (
                      <button
                        key={s.status}
                        onClick={() => handleUpdateStatus(currentSelectedAgreement.id, s.status)}
                        className={`flex-1 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                          currentSelectedAgreement.status === s.status
                            ? 'bg-black text-white shadow-xs'
                            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Contract Commercials & Validity */}
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-3 mb-5">
                  <h4 className="font-bold text-gray-900 text-xs">Commercial Terms & Period</h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-white p-3 rounded-xl border border-gray-200">
                      <span className="text-gray-400 block text-[10px]">Total Contract Value</span>
                      <strong className="text-base font-extrabold text-gray-900">
                        ₹{currentSelectedAgreement.commercialValue?.toLocaleString('en-IN')}
                      </strong>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-gray-200">
                      <span className="text-gray-400 block text-[10px]">Effective Period</span>
                      <strong className="text-xs font-semibold text-gray-800 block">
                        {currentSelectedAgreement.startDate} → {currentSelectedAgreement.expiryDate}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* File Attachment & Download */}
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900 text-xs">Attached Contract Document</h4>
                      <span className="text-[10px] text-gray-400">Formal legal document preview & printable record</span>
                    </div>
                    <button
                      onClick={() => setPreviewingAgreement(currentSelectedAgreement)}
                      className="px-3.5 py-1.5 bg-black hover:bg-gray-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                    >
                      <Eye size={13} /> View Document
                    </button>
                  </div>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={() => setAgreementToDelete(currentSelectedAgreement)}
                  className="text-rose-600 hover:bg-rose-50 px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 size={14} /> Delete Contract
                </button>
                <button
                  onClick={() => setSelectedAgreement(null)}
                  className="px-4 py-2 bg-black text-white font-bold text-xs rounded-xl hover:bg-gray-800 cursor-pointer"
                >
                  Close Workspace
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Agreement Modal */}
      {isAddAgreementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <h3 className="font-extrabold text-lg text-gray-900">Create Legal Agreement / SOW</h3>
              <button onClick={() => setIsAddAgreementModalOpen(false)} className="p-1 text-gray-400 hover:text-black cursor-pointer"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateAgreement} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Agreement Title *</label>
                <input type="text" required value={newAgreement.name} onChange={(e) => setNewAgreement({ ...newAgreement, name: e.target.value })} placeholder="e.g. Master Services Agreement 2026-2027" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Agreement Type</label>
                  <select value={newAgreement.agreementType} onChange={(e) => setNewAgreement({ ...newAgreement, agreementType: e.target.value as AgreementType })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none cursor-pointer focus:border-black">
                    {AGREEMENT_TYPES.map(t => (<option key={t} value={t}>{t}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Commercial Value (₹)</label>
                  <input type="number" value={newAgreement.commercialValue} onChange={(e) => setNewAgreement({ ...newAgreement, commercialValue: Number(e.target.value) })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Client Account Link</label>
                  <select
                    value={newAgreement.clientId}
                    onChange={(e) => {
                      const c = clients.find(cl => cl.id === e.target.value);
                      const clientProjects = projects.filter(p => p.clientId === e.target.value);
                      setNewAgreement({
                        ...newAgreement,
                        clientId: e.target.value,
                        clientName: c ? c.company : '',
                        projectId: clientProjects[0]?.id || '',
                        projectName: clientProjects[0]?.name || '',
                        leadId: ''
                      });
                    }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none cursor-pointer focus:border-black"
                  >
                    <option value="">-- No Client Account --</option>
                    {clients.map(c => (<option key={c.id} value={c.id}>{c.company}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Or Linked Lead / Opportunity</label>
                  <select
                    value={newAgreement.leadId || ''}
                    onChange={(e) => {
                      const l = leads.find(le => le.id === e.target.value);
                      setNewAgreement({
                        ...newAgreement,
                        leadId: e.target.value,
                        clientName: l ? (l.company || l.name) : '',
                        clientId: '',
                        projectId: '',
                        projectName: ''
                      });
                    }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none cursor-pointer focus:border-black"
                  >
                    <option value="">-- No Lead Opportunity --</option>
                    {leads.map(l => (<option key={l.id} value={l.id}>{l.company || l.name} ({l.status})</option>))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Commercial Value (₹)</label>
                  <input type="number" value={newAgreement.commercialValue} onChange={(e) => setNewAgreement({ ...newAgreement, commercialValue: Number(e.target.value) })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black" />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Status</label>
                  <select value={newAgreement.status} onChange={(e) => setNewAgreement({ ...newAgreement, status: e.target.value as AgreementStatus })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none cursor-pointer">
                    <option value="Draft">Draft</option>
                    <option value="Sent">Sent</option>
                    <option value="Signed">Signed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Start Date</label>
                  <input type="date" value={newAgreement.startDate} onChange={(e) => setNewAgreement({ ...newAgreement, startDate: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none" />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Expiry Date</label>
                  <input type="date" value={newAgreement.expiryDate} onChange={(e) => setNewAgreement({ ...newAgreement, expiryDate: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none" />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Attach Contract PDF / Document</label>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2 text-xs file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-gray-900 file:text-white"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddAgreementModalOpen(false)} className="px-4 py-2.5 rounded-xl border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer">Cancel</button>
                <button type="submit" disabled={isUploading} className="px-5 py-2.5 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-bold shadow-md cursor-pointer disabled:opacity-50">
                  {isUploading ? 'Uploading...' : 'Save Agreement'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Agreement Modal */}
      {editingAgreement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <h3 className="font-extrabold text-lg text-gray-900">Edit Agreement</h3>
              <button onClick={() => setEditingAgreement(null)} className="p-1 text-gray-400 hover:text-black cursor-pointer"><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveEditAgreement} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Agreement Title</label>
                <input type="text" value={editingAgreement.name} onChange={(e) => setEditingAgreement({ ...editingAgreement, name: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Commercial Value (₹)</label>
                  <input type="number" value={editingAgreement.commercialValue} onChange={(e) => setEditingAgreement({ ...editingAgreement, commercialValue: Number(e.target.value) })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black" />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Status</label>
                  <select value={editingAgreement.status} onChange={(e) => setEditingAgreement({ ...editingAgreement, status: e.target.value as AgreementStatus })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none cursor-pointer">
                    <option value="Draft">Draft</option>
                    <option value="Sent">Sent</option>
                    <option value="Signed">Signed</option>
                  </select>
                </div>
              </div>
              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button type="button" onClick={() => setEditingAgreement(null)} className="px-4 py-2.5 rounded-xl border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-black text-white font-bold shadow-md cursor-pointer">Save Changes</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Upload Doc Modal */}
      {isAddDocModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <h3 className="font-extrabold text-lg text-gray-900">Upload Project / Technical File</h3>
              <button onClick={() => setIsAddDocModalOpen(false)} className="p-1 text-gray-400 hover:text-black cursor-pointer"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateDoc} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Document Title *</label>
                <input type="text" required value={newDoc.title} onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })} placeholder="e.g. n8n_webhook_architecture.pdf" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Document Type</label>
                  <select value={newDoc.docType} onChange={(e) => setNewDoc({ ...newDoc, docType: e.target.value as any })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none cursor-pointer">
                    <option value="Specification">Technical Specification</option>
                    <option value="Design">UI/UX Design Spec</option>
                    <option value="Contract">Contract</option>
                    <option value="Invoice">Invoice Receipt</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Client Link</label>
                  <select value={newDoc.clientId} onChange={(e) => { const c = clients.find(cl => cl.id === e.target.value); setNewDoc({ ...newDoc, clientId: e.target.value, clientName: c ? c.company : '' }); }} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none cursor-pointer">
                    {clients.map(c => (<option key={c.id} value={c.id}>{c.company}</option>))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Select File to Upload</label>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2 text-xs file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-gray-900 file:text-white"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddDocModalOpen(false)} className="px-4 py-2.5 rounded-xl border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer">Cancel</button>
                <button type="submit" disabled={isUploading} className="px-5 py-2.5 rounded-xl bg-black text-white font-bold shadow-md cursor-pointer disabled:opacity-50">
                  {isUploading ? 'Uploading...' : 'Attach Document'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Agreement Confirmation */}
      {agreementToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 size={24} />
            </div>
            <h3 className="font-extrabold text-base text-gray-900 mb-1">Delete Agreement?</h3>
            <p className="text-xs text-gray-500 mb-5">
              Are you sure you want to delete <strong>{agreementToDelete.name}</strong>?
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setAgreementToDelete(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 font-bold text-xs text-gray-600 hover:bg-gray-50 cursor-pointer">Cancel</button>
              <button onClick={handleConfirmDeleteAgreement} className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md cursor-pointer">Delete</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Document Confirmation */}
      {docToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 size={24} />
            </div>
            <h3 className="font-extrabold text-base text-gray-900 mb-1">Delete File?</h3>
            <p className="text-xs text-gray-500 mb-5">
              Are you sure you want to delete <strong>{docToDelete.title}</strong>?
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setDocToDelete(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 font-bold text-xs text-gray-600 hover:bg-gray-50 cursor-pointer">Cancel</button>
              <button onClick={handleConfirmDeleteDoc} className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md cursor-pointer">Delete</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Agreement Document Preview Modal */}
      {previewingAgreement && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-gray-200 my-8 overflow-hidden flex flex-col max-h-[92vh]"
          >
            {/* Modal Top Control Bar */}
            <div className="p-4 bg-gray-900 text-white flex items-center justify-between border-b border-gray-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#CCFF00] text-black font-black flex items-center justify-center text-xs">
                  AGX
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white line-clamp-1">{previewingAgreement.name}</h4>
                  <span className="text-[10px] text-gray-400">Ref: AGX-AGR-{previewingAgreement.id.slice(0, 8).toUpperCase()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Print or Save as PDF"
                >
                  <Printer size={13} /> Print / Save PDF
                </button>
                {previewingAgreement.status !== 'Signed' && (
                  <button
                    onClick={() => {
                      handleUpdateStatus(previewingAgreement.id, 'Signed');
                      setPreviewingAgreement({ ...previewingAgreement, status: 'Signed' });
                      toast.success('Document Signed', 'Agreement status updated to Signed.');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-extrabold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 size={13} /> Mark Signed
                  </button>
                )}
                <button
                  onClick={() => setPreviewingAgreement(null)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Document Content (Printable Legal Canvas) */}
            <div className="p-8 sm:p-12 overflow-y-auto space-y-6 text-gray-800 bg-[#FCFCFD]">
              {/* Formal Document Header */}
              <div className="border-b-2 border-gray-900 pb-6 flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">
                    CONFIDENTIAL LEGAL INSTRUMENT
                  </span>
                  <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                    {previewingAgreement.name}
                  </h1>
                  <p className="text-xs font-semibold text-gray-500 mt-1">
                    Classification: {previewingAgreement.agreementType.toUpperCase()}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    previewingAgreement.status === 'Signed' ? 'bg-emerald-100 text-emerald-800' :
                    previewingAgreement.status === 'Sent' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {previewingAgreement.status}
                  </span>
                  <div className="text-[10px] font-mono text-gray-400 mt-1">
                    Dated: {previewingAgreement.startDate}
                  </div>
                </div>
              </div>

              {/* Contracting Parties */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-200 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Party 1 (Service Provider)</span>
                  <strong className="text-sm font-black text-gray-900 block">Antigravity Technologies Pvt. Ltd.</strong>
                  <p className="text-gray-600 mt-0.5">Represented by Executive Management</p>
                  <p className="text-gray-500 text-[11px]">Bengaluru, Karnataka, India • contact@antigravity.in</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Party 2 (Client Entity)</span>
                  <strong className="text-sm font-black text-gray-900 block">{previewingAgreement.clientName}</strong>
                  <p className="text-gray-600 mt-0.5">Project: {previewingAgreement.projectName || 'Enterprise Engagement'}</p>
                  <p className="text-gray-500 text-[11px]">Primary Authorized Signatory on Record</p>
                </div>
              </div>

              {/* Commercial Terms Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-white rounded-xl border border-gray-200">
                  <span className="text-[10px] text-gray-400 block">Total Contract Value</span>
                  <span className="text-base font-black text-gray-900">
                    ₹{previewingAgreement.commercialValue?.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-gray-200">
                  <span className="text-[10px] text-gray-400 block">Commencement Date</span>
                  <span className="text-xs font-bold text-gray-800 block mt-1">
                    {previewingAgreement.startDate}
                  </span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-gray-200 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-gray-400 block">Valid Until</span>
                  <span className="text-xs font-bold text-gray-800 block mt-1">
                    {previewingAgreement.expiryDate}
                  </span>
                </div>
              </div>

              {/* Standard Operative Clauses */}
              <div className="space-y-4 text-xs text-gray-700 leading-relaxed border-t border-b border-gray-200 py-6">
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">1. Scope of Work & Deliverables</h4>
                  <p>
                    The Service Provider agrees to deliver digital engineering, software architecture, UI/UX design, and AI automation services in accordance with agreed project sprints and milestones. Any scope modifications must be mutually confirmed via formal change requests.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">2. Intellectual Property & Ownership</h4>
                  <p>
                    Upon receipt of all due milestone payments, all bespoke software source code, graphics, documentation, and proprietary assets authored specifically for the Client shall vest completely and exclusively in the Client. Pre-existing proprietary agency libraries remain licensed for client execution.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">3. Confidentiality & Non-Disclosure</h4>
                  <p>
                    Both parties covenant to hold in strict confidence all proprietary technical, business, commercial, and financial information disclosed during the course of this engagement for a period of two (2) calendar years from the effective date.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">4. Invoicing, Remittance & Taxes</h4>
                  <p>
                    Invoices are raised in accordance with agreed milestone completion schedules. Payments are due within fifteen (15) calendar days of invoice presentation. All consideration is net of applicable Goods and Services Tax (GST) and subject to statutory Tax Deducted at Source (TDS).
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">5. Governing Law & Jurisdiction</h4>
                  <p>
                    This Agreement shall be construed and governed in all respects in accordance with the substantive laws of India. Courts situated in Bengaluru, Karnataka shall possess exclusive jurisdiction over any proceedings or disputes arising hereunder.
                  </p>
                </div>
              </div>

              {/* Execution Signatures */}
              <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs">
                <div className="p-4 rounded-2xl border border-gray-200 bg-white space-y-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">For Antigravity Technologies</span>
                  <div className="h-10 flex items-end">
                    <span className="font-mono italic font-bold text-gray-800 text-sm">Abhinav (Managing Partner)</span>
                  </div>
                  <div className="border-t border-gray-300 pt-2 text-[11px] text-gray-500">
                    Authorized Signatory • Date: {previewingAgreement.startDate}
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-gray-200 bg-white space-y-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">For {previewingAgreement.clientName}</span>
                  <div className="h-10 flex items-end">
                    {previewingAgreement.status === 'Signed' ? (
                      <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                        <CheckCircle2 size={16} /> Digitally Signed & Verified
                      </div>
                    ) : (
                      <span className="text-gray-400 italic text-xs">Awaiting Execution</span>
                    )}
                  </div>
                  <div className="border-t border-gray-300 pt-2 text-[11px] text-gray-500">
                    Client Signatory • Status: {previewingAgreement.status}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Bottom Bar */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
              <span>AGX Secure Document Engine • Legally Binding Contract Record</span>
              <button
                onClick={() => setPreviewingAgreement(null)}
                className="px-4 py-2 bg-black text-white font-bold rounded-xl hover:bg-gray-800 cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
