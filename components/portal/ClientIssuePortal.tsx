import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertCircle, CheckCircle2, Clock, UploadCloud, X, ArrowLeft, ArrowRight,
  RefreshCw, Image as ImageIcon, KeyRound, PlusCircle, ListFilter, Search,
  ExternalLink, Calendar, CheckSquare, FileText, CreditCard, ShieldCheck,
  Copy, ChevronRight, Download, Check
} from 'lucide-react';
import { crmService } from '../../lib/crmService';
import {
  Project, Client, ProjectMilestone, Invoice, ProjectIssue,
  IssueType, IssuePriority, IssueStatus, DocumentItem
} from '../../types/crm';

interface ClientIssuePortalProps {
  onBackToWebsite?: () => void;
  tokenOverride?: string;
}

export const sanitizePortalToken = (val: unknown): string => {
  if (typeof val !== 'string') return '';
  const trimmed = val.trim();
  if (!trimmed || trimmed === '[object Object]' || trimmed === 'undefined' || trimmed === 'null') {
    return '';
  }
  return trimmed;
};

export const ClientIssuePortal: React.FC<ClientIssuePortalProps> = ({ onBackToWebsite, tokenOverride }) => {
  // Active token with multi-source fallback (tokenOverride -> query param -> hash -> localStorage)
  const [token, setToken] = useState<string>(() => {
    const overrideClean = sanitizePortalToken(tokenOverride);
    if (overrideClean) return overrideClean;

    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const queryToken = sanitizePortalToken(urlParams.get('token'));
      if (queryToken && queryToken !== 'omnilog-demo') return queryToken;

      const hash = window.location.hash;
      if (hash.includes('token=')) {
        const hashMatch = hash.match(/token=([^&]+)/);
        if (hashMatch && hashMatch[1]) {
          const hashClean = sanitizePortalToken(decodeURIComponent(hashMatch[1]));
          if (hashClean && hashClean !== 'omnilog-demo') return hashClean;
        }
      }

      const stored = sanitizePortalToken(localStorage.getItem('agx_active_portal_token'));
      if (stored && stored !== 'omnilog-demo') return stored;
    }
    return '';
  });

  // Portal Scoped Data State
  const [portalData, setPortalData] = useState<{
    project: Project;
    client: Client;
    milestones: ProjectMilestone[];
    invoices: Invoice[];
    issues: ProjectIssue[];
    documents?: DocumentItem[];
  } | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [tokenInputValue, setTokenInputValue] = useState<string>('');
  const [tokenModalError, setTokenModalError] = useState<string | null>(null);

  // Active Navigation Tab: 'roadmap' | 'issues' | 'invoices' | 'documents'
  const [activeTab, setActiveTab] = useState<'roadmap' | 'issues' | 'invoices' | 'documents'>('roadmap');
  const [issueViewMode, setIssueViewMode] = useState<'list' | 'report'>('list');

  // Issue Reporting Form State
  const [title, setTitle] = useState('');
  const [issueType, setIssueType] = useState<IssueType>('Bug');
  const [priority, setPriority] = useState<IssuePriority>('Medium');
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmittedTicket, setLastSubmittedTicket] = useState<ProjectIssue | null>(null);

  // Issue Tracking Filters
  const [trackerFilter, setTrackerFilter] = useState<'all' | 'open' | 'resolved'>('all');
  const [trackerSearch, setTrackerSearch] = useState('');
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<string | null>(null);
  const [selectedIssueDetail, setSelectedIssueDetail] = useState<ProjectIssue | null>(null);

  // File Upload Handling
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  // Synchronize Token Override prop
  useEffect(() => {
    const cleanOverride = sanitizePortalToken(tokenOverride);
    if (cleanOverride && cleanOverride !== token && cleanOverride !== 'omnilog-demo') {
      setToken(cleanOverride);
    }
  }, [tokenOverride]);

  // Fetch scoped portal data on token changes
  const loadPortalData = async (activeTok: string) => {
    if (!activeTok) {
      setPortalData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setFetchError(null);

    try {
      const data = await crmService.fetchClientPortalData(activeTok);
      if (!data) {
        setPortalData(null);
        setFetchError('Access denied or invalid project token. Please verify with your AGX project manager.');
      } else {
        setPortalData(data);
        // Pre-fill reporter information
        if (!reporterEmail && data.client.email) {
          setReporterEmail(data.client.email);
        }
        if (!reporterName && data.client.name) {
          setReporterName(data.client.name);
        }
        // Save valid token to localStorage
        try {
          localStorage.setItem('agx_active_portal_token', activeTok);
        } catch (_) {}
      }
    } catch (err: any) {
      console.warn('Error fetching client portal data:', err);
      setFetchError('Unable to load client portal. Please check your network connection.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPortalData(token);
  }, [token]);

  // Handle Token Manual Submission
  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTokenModalError(null);
    const clean = sanitizePortalToken(tokenInputValue);
    if (!clean) {
      setTokenModalError('Please enter your project access token.');
      return;
    }

    setToken(clean);
    if (typeof window !== 'undefined') {
      const targetUrl = `/portal?token=${encodeURIComponent(clean)}`;
      window.history.pushState(null, '', targetUrl);
    }
  };

  // Handle Copy Token
  const handleCopyToken = () => {
    if (!token) return;
    navigator.clipboard.writeText(token);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  // Switch Workspace / Log Out
  const handleSignOutPortal = () => {
    setToken('');
    setPortalData(null);
    try {
      localStorage.removeItem('agx_active_portal_token');
    } catch (_) {}
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', '/portal');
    }
  };

  // File Upload Handlers
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
  };

  const [uploadingFiles, setUploadingFiles] = useState(false);

  const processFiles = async (files: File[]) => {
    setUploadingFiles(true);
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        alert(`"${file.name}" exceeds the maximum limit of 10MB.`);
        continue;
      }
      try {
        const { publicUrl, error } = await crmService.uploadAttachment('crm-attachments', file);
        if (publicUrl) {
          setAttachments(prev => [...prev, publicUrl].slice(0, 5));
          continue;
        }
        if (error) {
          console.warn('Storage upload error:', error);
        }
      } catch (err) {
        console.warn('Attachment upload failed:', err);
      }

      // If storage upload fails, compress image client-side to thumbnail to prevent DB bloat
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const maxDim = 800;
            let width = img.width;
            let height = img.height;
            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.6);
            setAttachments(prev => [...prev, compressed].slice(0, 5));
          };
          img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
      } else {
        alert(`Could not upload ${file.name}. Please ensure your file format is supported.`);
      }
    }
    setUploadingFiles(false);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleVerifyTicket = async (issueId: string) => {
    try {
      await crmService.updateIssue(issueId, { status: 'CLOSED' });
      setPortalData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          issues: prev.issues.map(iss => iss.id === issueId ? { ...iss, status: 'CLOSED' as const } : iss)
        };
      });
    } catch (err) {
      console.warn('Error closing issue:', err);
    }
  };

  const handleReopenTicket = async (issueId: string) => {
    const reason = window.prompt('Please describe what is still not working or why this ticket is being reopened:');
    if (!reason || !reason.trim()) return;

    try {
      const issue = portalData?.issues.find(i => i.id === issueId);
      const updatedNotes = issue?.resolutionNotes
        ? `${issue.resolutionNotes}\n\n[Reopened by Client]: ${reason.trim()}`
        : `[Reopened by Client]: ${reason.trim()}`;

      await crmService.updateIssue(issueId, {
        status: 'REPORTED',
        resolutionNotes: updatedNotes
      });

      setPortalData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          issues: prev.issues.map(iss => iss.id === issueId ? {
            ...iss,
            status: 'REPORTED' as const,
            resolutionNotes: updatedNotes
          } : iss)
        };
      });
    } catch (err) {
      console.warn('Error reopening issue:', err);
    }
  };

  // Submit Issue Handler
  const handleSubmitIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!portalData) return;
    if (!title.trim() || !description.trim() || !reporterName.trim() || !reporterEmail.trim()) {
      alert('Please fill in all required fields (Title, Description, Name, Email).');
      return;
    }

    setIsSubmitting(true);

    try {
      const ticketNumber = `ISSUE-${Math.floor(100 + Math.random() * 900)}`;
      const newIssue = await crmService.createIssue({
        projectId: portalData.project.id,
        projectName: portalData.project.name,
        clientId: portalData.client.id,
        clientName: portalData.client.company || portalData.client.name,
        ticketNumber,
        title: title.trim(),
        description: description.trim(),
        issueType,
        priority,
        status: 'REPORTED',
        reporterName: reporterName.trim(),
        reporterEmail: reporterEmail.trim(),
        attachments: attachments.length > 0 ? attachments : undefined
      });

      // Update local state immediately
      setPortalData(prev => prev ? { ...prev, issues: [newIssue, ...prev.issues] } : prev);
      setLastSubmittedTicket(newIssue);

      // Trigger Staff Alert
      crmService.createNotification({
        title: `Client Portal Ticket #${ticketNumber}`,
        message: `${reporterName.trim()} reported "${title.trim()}" for ${portalData.project.name}`,
        type: priority === 'Critical' ? 'urgent' : 'system'
      }).catch(() => {});

      // Clear Form
      setTitle('');
      setDescription('');
      setAttachments([]);
      setIssueViewMode('list');
    } catch (err: any) {
      console.warn('Submit issue error:', err);
      alert('Failed to submit issue. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered Issues for Tracker Tab
  const filteredIssues = useMemo(() => {
    if (!portalData) return [];
    return portalData.issues.filter(issue => {
      const q = trackerSearch.toLowerCase().trim();
      const matchesSearch = !q ||
        issue.ticketNumber.toLowerCase().includes(q) ||
        issue.title.toLowerCase().includes(q) ||
        issue.description.toLowerCase().includes(q) ||
        issue.reporterName.toLowerCase().includes(q);

      if (!matchesSearch) return false;
      if (trackerFilter === 'open') return issue.status === 'REPORTED' || issue.status === 'IN PROGRESS';
      if (trackerFilter === 'resolved') return issue.status === 'RESOLVED' || issue.status === 'CLOSED';
      return true;
    });
  }, [portalData, trackerSearch, trackerFilter]);

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070709] text-white flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 rounded-2xl bg-[#CCFF00]/10 border border-[#CCFF00]/20 flex items-center justify-center text-[#CCFF00] animate-spin mb-4">
          <RefreshCw size={24} />
        </div>
        <h3 className="text-lg font-bold font-['Outfit']">Authenticating Client Workspace</h3>
        <p className="text-xs text-white/50 mt-1">Verifying encrypted access token with AGX Cloud...</p>
      </div>
    );
  }

  // Gate Screen: Invalid or Missing Token
  if (!portalData) {
    return (
      <div className="min-h-screen bg-[#070709] text-white flex flex-col justify-between p-6 antialiased font-sans selection:bg-[#CCFF00] selection:text-black">
        {/* Top Header */}
        <div className="max-w-4xl w-full mx-auto flex items-center justify-between py-2">
          <button
            onClick={onBackToWebsite || (() => { window.location.href = '/'; })}
            className="flex items-center gap-2 text-xs font-semibold text-white/60 hover:text-white transition-colors px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer"
          >
            <ArrowLeft size={14} /> Back to AGX Website
          </button>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black italic tracking-tighter text-white font-['Outfit']">
              AG<span className="text-[#CCFF00]">X</span>
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/20 font-bold">
              Client Portal
            </span>
          </div>
        </div>

        {/* Token Form Card */}
        <div className="max-w-md w-full mx-auto my-auto p-8 rounded-3xl bg-[#0D1017] border border-white/10 shadow-2xl text-center space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
            <KeyRound size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase text-white tracking-tight font-['Outfit']">
              Client Project Portal
            </h2>
            <p className="text-xs text-white/50 mt-1">
              Enter your secure project access token to inspect live milestones, submit QA tickets, and view invoices.
            </p>
          </div>

          <form onSubmit={handleTokenSubmit} className="space-y-3.5 text-left">
            <div>
              <label className="block text-[11px] font-bold text-white/70 uppercase tracking-wider mb-1.5">
                Secret Project Token
              </label>
              <div className="relative flex items-center">
                <KeyRound size={15} className="absolute left-3.5 text-white/40" />
                <input
                  type="text"
                  value={tokenInputValue}
                  onChange={(e) => { setTokenInputValue(e.target.value); setTokenModalError(null); }}
                  placeholder="e.g., prj_live_7x8f9..."
                  className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/25 focus:outline-none focus:border-[#CCFF00] transition-all font-mono"
                  autoFocus
                />
              </div>
              {(tokenModalError || fetchError) && (
                <p className="text-[11px] text-rose-400 mt-2 font-mono flex items-center gap-1.5">
                  <AlertCircle size={13} className="shrink-0" />
                  <span>{tokenModalError || fetchError}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer btn-press"
            >
              <span>Access Client Workspace</span>
              <ArrowRight size={13} />
            </button>
          </form>

          <p className="text-[11px] text-white/40 pt-2 border-t border-white/5">
            Token not found? Inquire with your AGX delivery lead or email <span className="text-white/70 font-mono">support@agxperience.com</span>
          </p>
        </div>

        <div className="w-full text-center py-4 text-[11px] text-white/30 font-mono">
          © {new Date().getFullYear()} AGXPERIENCE INC. • CLIENT REPOSITORY & OPERATIONS
        </div>
      </div>
    );
  }

  // Authenticated Portal Workspace
  const { project, client, milestones, invoices, issues } = portalData;
  const completedMilestones = milestones.filter(m => m.status === 'Completed').length;
  const roadmapPct = milestones.length > 0 ? Math.round((completedMilestones / milestones.length) * 100) : (project.progress || 0);

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col justify-between font-sans selection:bg-[#CCFF00] selection:text-black">
      {/* Top Header */}
      <header className="bg-[#0D1017]/95 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          {/* Brand & Project Name */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToWebsite || (() => { window.location.href = '/'; })}
              className="flex items-center gap-2 cursor-pointer hover:opacity-85 transition-opacity"
            >
              <span className="text-xl font-black italic tracking-tighter text-white font-['Outfit']">
                AG<span className="text-[#CCFF00]">X</span>
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-md bg-white/5 text-white/80 border border-white/10 font-bold hidden sm:inline-block">
                Client Portal
              </span>
            </button>

            <span className="h-4 w-px bg-white/15 hidden sm:inline-block" />

            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-pulse shrink-0" />
              <div className="truncate">
                <span className="text-xs font-bold text-white block truncate">{project.name}</span>
                <span className="text-[10px] text-white/50 block truncate">{client.company || client.name}</span>
              </div>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyToken}
              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono text-white/70 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copy your project portal token"
            >
              <Copy size={12} />
              <span className="hidden sm:inline">{copiedToken ? 'Copied!' : 'Token'}</span>
            </button>

            <button
              onClick={handleSignOutPortal}
              className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-xs font-semibold transition-colors cursor-pointer"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6 flex-1">
        {/* Project Snapshot Header */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0D1017] to-[#121622] border border-white/10 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/20 text-[10px] font-mono font-bold uppercase tracking-wider">
                  {project.serviceType || 'AI System'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold uppercase">
                  Status: {project.status}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1 font-['Outfit']">
                {project.name}
              </h1>
              <p className="text-xs text-white/60 mt-0.5">
                Client Organization: <strong className="text-white">{client.company || client.name}</strong> • PM: {project.projectManager || 'AGX Solution Architect'}
              </p>
            </div>

            {/* Overall Delivery Progress */}
            <div className="sm:text-right bg-white/5 p-3 rounded-2xl border border-white/5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-white/50 block">Roadmap Velocity</span>
              <span className="text-2xl font-black text-[#CCFF00] font-mono block mt-0.5">{roadmapPct}%</span>
              <span className="text-[11px] text-white/60 font-medium">
                {completedMilestones} of {milestones.length} milestones completed
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-[#CCFF00] to-[#CCFF00] rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(5, roadmapPct))}%` }}
            />
          </div>
        </div>

        {/* 3 Core Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-2">
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'roadmap'
                ? 'bg-[#CCFF00] text-black shadow-md'
                : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <CheckSquare size={14} />
            <span>Milestones & Roadmap</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 font-mono">
              {milestones.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('issues')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'issues'
                ? 'bg-[#CCFF00] text-black shadow-md'
                : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <AlertCircle size={14} />
            <span>QA Tickets & Issues</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 font-mono">
              {issues.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'invoices'
                ? 'bg-[#CCFF00] text-black shadow-md'
                : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <FileText size={14} />
            <span>Invoices & Payments</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 font-mono">
              {invoices.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'documents'
                ? 'bg-[#CCFF00] text-black shadow-md'
                : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <Download size={14} />
            <span>Documents & SOWs</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 font-mono">
              {(portalData?.documents || []).length}
            </span>
          </button>
        </div>

        {/* TAB 1: Milestones & Roadmap */}
        {activeTab === 'roadmap' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-white">Deliverable Milestones & Sprints</h2>
                <p className="text-xs text-white/50">Track architecture releases, alpha deployments, and sign-offs in real time.</p>
              </div>
            </div>

            {milestones.length === 0 ? (
              <div className="p-10 rounded-3xl bg-[#0D1017] border border-white/5 text-center space-y-2">
                <CheckCircle2 size={32} className="mx-auto text-white/30" />
                <h3 className="font-bold text-sm text-white">No Milestones Published Yet</h3>
                <p className="text-xs text-white/50">Your delivery team will schedule and publish sprint milestones shortly.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {milestones.map((m, idx) => {
                  const isDone = m.status === 'Completed';
                  const isCurrent = m.status === 'In Progress';
                  return (
                    <div
                      key={m.id}
                      className={`p-5 rounded-2xl border transition-all ${
                        isDone
                          ? 'bg-[#0E151B] border-emerald-500/20'
                          : isCurrent
                          ? 'bg-[#121624] border-[#CCFF00]/30 shadow-lg'
                          : 'bg-[#0D1017] border-white/5 opacity-80'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3.5">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            isDone
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : isCurrent
                              ? 'bg-[#CCFF00]/20 text-[#CCFF00] border border-[#CCFF00]/40'
                              : 'bg-white/5 text-white/40 border border-white/10'
                          }`}>
                            {isDone ? <Check size={14} /> : idx + 1}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white">{m.title}</span>
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase ${
                                isDone
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : isCurrent
                                  ? 'bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/20'
                                  : 'bg-white/5 text-white/40 border border-white/10'
                              }`}>
                                {m.status}
                              </span>
                              {m.isBilled && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                  Billed
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3 text-xs text-white/50 mt-1">
                              {m.dueDate && (
                                <span className="flex items-center gap-1 font-mono text-[11px]">
                                  <Calendar size={12} /> Target: {m.dueDate}
                                </span>
                              )}
                              {m.amount ? (
                                <span className="font-mono text-[11px] text-white/70">
                                  Allocation: ₹{m.amount.toLocaleString('en-IN')}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>

                        {/* Progress Meter */}
                        <div className="sm:text-right min-w-[120px]">
                          <div className="flex items-center justify-between sm:justify-end gap-2 text-xs font-mono font-bold text-white mb-1">
                            <span className="text-[11px] text-white/40 sm:hidden">Progress</span>
                            <span>{m.progress || (isDone ? 100 : 0)}%</span>
                          </div>
                          <div className="w-full sm:w-28 bg-white/10 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                isDone ? 'bg-emerald-400' : isCurrent ? 'bg-[#CCFF00]' : 'bg-white/30'
                              }`}
                              style={{ width: `${m.progress || (isDone ? 100 : 0)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: QA Tickets & Issues */}
        {activeTab === 'issues' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-extrabold text-white">Client Issue & Bug Tracker</h2>
                <p className="text-xs text-white/50">Direct pipeline to AGX engineers for triage, feedback and bug resolutions.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIssueViewMode(issueViewMode === 'report' ? 'list' : 'report')}
                  className="px-4 py-2 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  {issueViewMode === 'report' ? (
                    <>
                      <CheckSquare size={14} /> View All Tickets
                    </>
                  ) : (
                    <>
                      <PlusCircle size={14} /> Submit New Ticket
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Submission Form View */}
            {issueViewMode === 'report' && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-3xl bg-[#0D1017] border border-white/10 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div>
                    <h3 className="text-sm font-extrabold text-white">Report Bug, Blocker or Change Request</h3>
                    <p className="text-[11px] text-white/50">Logged directly into the engineering sprint board with immediate notification.</p>
                  </div>
                  <button onClick={() => setIssueViewMode('list')} className="p-1 text-white/40 hover:text-white cursor-pointer">
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleSubmitIssue} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-white/70 uppercase mb-1">Issue Category *</label>
                      <select
                        value={issueType}
                        onChange={(e) => setIssueType(e.target.value as IssueType)}
                        className="w-full bg-black/60 border border-white/15 rounded-xl p-2.5 text-xs text-white outline-none cursor-pointer"
                      >
                        <option value="Bug">Defect / Bug</option>
                        <option value="Feature Request">Change / Feature Request</option>
                        <option value="Performance">Performance / Latency</option>
                        <option value="Question">Clarification / Question</option>
                        <option value="Other">Other Operational Item</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-white/70 uppercase mb-1">Priority Level *</label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as IssuePriority)}
                        className="w-full bg-black/60 border border-white/15 rounded-xl p-2.5 text-xs text-white outline-none cursor-pointer"
                      >
                        <option value="Low">Low (Cosmetic / Low Urgency)</option>
                        <option value="Medium">Medium (Normal Sprint Triage)</option>
                        <option value="High">High (Impacting User Flow)</option>
                        <option value="Critical">Critical (Production Blocker)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-white/70 uppercase mb-1">Issue Summary *</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Webhook returning 502 during checkout flow"
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 outline-none focus:border-[#CCFF00]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-white/70 uppercase mb-1">Detailed Description & Steps to Reproduce *</label>
                    <textarea
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe what happened, expected behavior, steps to reproduce, or required adjustment..."
                      className="w-full bg-black/60 border border-white/15 rounded-xl p-3 text-xs text-white placeholder-white/30 outline-none focus:border-[#CCFF00]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-white/70 uppercase mb-1">Reporter Name *</label>
                      <input
                        type="text"
                        value={reporterName}
                        onChange={(e) => setReporterName(e.target.value)}
                        placeholder="Your Name"
                        className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-white/70 uppercase mb-1">Reporter Email *</label>
                      <input
                        type="email"
                        value={reporterEmail}
                        onChange={(e) => setReporterEmail(e.target.value)}
                        placeholder="your.email@company.com"
                        className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 outline-none"
                        required
                      />
                    </div>
                  </div>

                  {/* Drag-and-drop Attachments */}
                  <div>
                    <label className="block text-[11px] font-bold text-white/70 uppercase mb-1">Screenshots & Attachments (Max 5)</label>
                    <div
                      onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                      onDragLeave={() => setDragActive(false)}
                      onDrop={handleFileDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-colors ${
                        dragActive ? 'border-[#CCFF00] bg-[#CCFF00]/5' : 'border-white/15 hover:border-white/30 bg-black/30'
                      }`}
                    >
                      <UploadCloud size={24} className="mx-auto text-white/40 mb-1" />
                      <p className="text-xs text-white/70">
                        Drag screenshots or logs here, or <span className="text-[#CCFF00] font-bold">browse</span>
                      </p>
                      <p className="text-[10px] text-white/40 mt-0.5">PNG, JPG, PDF up to 10MB each</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*,.pdf"
                        onChange={handleFileInputChange}
                        className="hidden"
                      />
                    </div>

                    {attachments.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap mt-2">
                        {attachments.map((url, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 border border-white/15 text-[11px]">
                            <ImageIcon size={12} className="text-[#CCFF00]" />
                            <span className="font-mono truncate max-w-[120px]">Attachment #{idx + 1}</span>
                            <button type="button" onClick={() => removeAttachment(idx)} className="text-white/40 hover:text-white ml-1 cursor-pointer">
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setIssueViewMode('list')}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white/60 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2.5 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw size={13} className="animate-spin" /> Submitting...
                        </>
                      ) : (
                        <>
                          <Check size={14} /> Submit QA Ticket
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Tickets Table / List */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-white/50 text-[11px] font-mono">Filter:</span>
                  {(['all', 'open', 'resolved'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setTrackerFilter(f)}
                      className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer uppercase font-mono ${
                        trackerFilter === f
                          ? 'bg-white/20 text-white border border-white/20'
                          : 'bg-white/5 text-white/50 hover:text-white'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    value={trackerSearch}
                    onChange={(e) => setTrackerSearch(e.target.value)}
                    placeholder="Search ticket # or title..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-white/30 outline-none"
                  />
                </div>
              </div>

              {filteredIssues.length === 0 ? (
                <div className="p-12 rounded-3xl bg-[#0D1017] border border-white/5 text-center space-y-2">
                  <CheckCircle2 size={32} className="mx-auto text-emerald-400/50" />
                  <h3 className="font-bold text-sm text-white">All Clear! No Matching Tickets</h3>
                  <p className="text-xs text-white/50">No tickets found matching current search and filter criteria.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2.5">
                  {filteredIssues.map(iss => {
                    const isResolved = iss.status === 'RESOLVED' || iss.status === 'CLOSED';
                    return (
                      <div
                        key={iss.id}
                        onClick={() => setSelectedIssueDetail(selectedIssueDetail?.id === iss.id ? null : iss)}
                        className="p-4 rounded-2xl bg-[#0D1017] hover:bg-[#121622] border border-white/10 transition-all cursor-pointer space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-[#CCFF00]">{iss.ticketNumber}</span>
                            <span className="text-xs font-bold text-white">{iss.title}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase ${
                              isResolved
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>
                              {iss.status}
                            </span>
                            <span className="text-[10px] text-white/40 font-mono">
                              {new Date(iss.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-white/60 line-clamp-2">{iss.description}</p>

                        {/* Expanded details */}
                        {selectedIssueDetail?.id === iss.id && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-3 border-t border-white/10 space-y-2 text-xs">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-white/50 font-mono">
                              <span>Reporter: <strong className="text-white">{iss.reporterName}</strong></span>
                              <span>Category: <strong className="text-white">{iss.issueType}</strong></span>
                              <span>Priority: <strong className="text-white">{iss.priority}</strong></span>
                            </div>

                            {iss.resolutionNotes && (
                              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs space-y-1">
                                <span className="font-bold block flex items-center gap-1">
                                  <CheckCircle2 size={13} /> Engineering Resolution Sign-off:
                                </span>
                                <p className="text-emerald-200">{iss.resolutionNotes}</p>
                              </div>
                            )}

                            {iss.status === 'RESOLVED' && (
                              <div className="flex items-center gap-2 pt-2 border-t border-white/10 flex-wrap">
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); handleVerifyTicket(iss.id); }}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Check size={13} />
                                  <span>Confirm Fix & Close Ticket</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); handleReopenTicket(iss.id); }}
                                  className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                                >
                                  <RefreshCw size={13} />
                                  <span>Reopen Ticket (Issue Persists)</span>
                                </button>
                              </div>
                            )}

                            {iss.status === 'CLOSED' && (
                              <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                                <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                                  <CheckCircle2 size={13} /> Verified & Closed by Client
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); handleReopenTicket(iss.id); }}
                                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white text-[11px] font-mono transition-all ml-auto cursor-pointer"
                                >
                                  Reopen if needed
                                </button>
                              </div>
                            )}

                            {iss.attachments && iss.attachments.length > 0 && (
                              <div className="space-y-1">
                                <span className="text-[10px] text-white/50 uppercase font-bold block">Attachments:</span>
                                <div className="flex items-center gap-2 flex-wrap">
                                  {iss.attachments.map((url, i) => (
                                    <a
                                      key={i}
                                      href={url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] text-white flex items-center gap-1 font-mono"
                                    >
                                      <ImageIcon size={11} className="text-[#CCFF00]" />
                                      <span>View #{i + 1}</span>
                                      <ExternalLink size={10} />
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: Invoices & Payments */}
        {activeTab === 'invoices' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-white">Commercial Invoices & Payment Ledger</h2>
                <p className="text-xs text-white/50">Tax invoices, settlement records and wire remittance instructions for {client.company || client.name}.</p>
              </div>
            </div>

            {invoices.length === 0 ? (
              <div className="p-10 rounded-3xl bg-[#0D1017] border border-white/5 text-center space-y-2">
                <CreditCard size={32} className="mx-auto text-white/30" />
                <h3 className="font-bold text-sm text-white">No Invoices Issued Yet</h3>
                <p className="text-xs text-white/50">Invoices will appear here upon milestone completion or contract inception.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {invoices.map(inv => {
                  const isPaid = inv.status === 'Paid';
                  return (
                    <div
                      key={inv.id}
                      className="p-5 rounded-2xl bg-[#0D1017] border border-white/10 shadow-md space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-sm text-white">{inv.invoiceNumber}</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                              isPaid
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : inv.status === 'Partially Paid'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                            }`}>
                              {inv.status}
                            </span>
                            {inv.isGst && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-white/5 text-white/60">
                                GST Invoice
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-white/50 font-mono mt-0.5 block">
                            Issued: {inv.issueDate} • Due: {inv.dueDate}
                          </span>
                        </div>

                        <div className="sm:text-right">
                          <span className="text-lg font-black text-[#CCFF00] font-mono block">
                            ₹{inv.total.toLocaleString('en-IN')}
                          </span>
                          {inv.paidAmount > 0 && (
                            <span className="text-[11px] text-emerald-400 font-mono block">
                              ₹{inv.paidAmount.toLocaleString('en-IN')} Settled
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Items Preview */}
                      {inv.items && inv.items.length > 0 && (
                        <div className="pt-2 border-t border-white/5 space-y-1 text-xs">
                          {inv.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-white/70">
                              <span>{item.description}</span>
                              <span className="font-mono">₹{item.total.toLocaleString('en-IN')}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Wire Transfer & Remittance Instructions */}
            <div className="p-6 rounded-3xl bg-[#0D1017] border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-white">
                <ShieldCheck size={18} className="text-[#CCFF00]" />
                <h3 className="font-extrabold text-sm">Official Bank Remittance Details</h3>
              </div>
              <p className="text-xs text-white/60">
                To settle open invoices, transfer the invoice amount referencing your Invoice Number as the transaction remark:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono bg-black/40 p-4 rounded-2xl border border-white/5">
                <div>
                  <span className="text-white/40 block text-[10px] uppercase">Account Holder</span>
                  <span className="text-white font-bold">AGXPERIENCE PRIVATE LIMITED</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px] uppercase">Bank</span>
                  <span className="text-white font-bold">HDFC Bank Ltd</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px] uppercase">Account Number</span>
                  <span className="text-white font-bold">50200088921822</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px] uppercase">IFSC Code</span>
                  <span className="text-white font-bold">HDFC0001822</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Documents & Agreements Repository */}
        {activeTab === 'documents' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-white">Project Deliverables & SOW Repository</h3>
                <p className="text-xs text-white/50">Access signed Master Service Agreements, Statements of Work, and technical specifications.</p>
              </div>
            </div>

            {(!portalData?.documents || portalData.documents.length === 0) ? (
              <div className="p-12 rounded-3xl bg-[#0D1017] border border-white/5 text-center space-y-2">
                <FileText size={32} className="mx-auto text-white/30" />
                <h4 className="font-bold text-sm text-white">No Uploaded Documents Found</h4>
                <p className="text-xs text-white/50">Official project documentation and signed contracts will be made available here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {portalData.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-5 rounded-2xl bg-[#0D1017] hover:bg-[#121622] border border-white/10 transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#CCFF00] shrink-0">
                          <FileText size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-white line-clamp-1">{doc.title}</h4>
                          <span className="text-[10px] text-white/40 font-mono block">
                            {doc.fileSize} • Uploaded {new Date(doc.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/20">
                        {doc.docType}
                      </span>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[10px] text-white/40 font-mono">By {doc.uploadedBy}</span>
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors flex items-center gap-1.5 font-mono cursor-pointer"
                      >
                        <Download size={13} />
                        <span>Download / View</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Sleek Footer */}
      <footer className="border-t border-white/10 bg-[#0D1017]/80 py-4 px-6 text-center text-xs text-white/40 font-mono">
        © {new Date().getFullYear()} AGXPERIENCE INC. • CONFIDENTIAL CLIENT PORTAL • ALL DELIVERABLES PROTECTED
      </footer>
    </div>
  );
};
