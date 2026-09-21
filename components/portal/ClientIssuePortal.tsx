import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertCircle, CheckCircle2, Clock, UploadCloud, X, ArrowLeft, ArrowRight,
  ChevronDown, Check, RefreshCw, Image as ImageIcon,
  KeyRound, PlusCircle, ListFilter, Search, ExternalLink
} from 'lucide-react';
import { useCrmStore } from '../../lib/crmStore';
import { crmService } from '../../lib/crmService';
import { ProjectIssue, IssueType, IssuePriority } from '../../types/crm';

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
  const store = useCrmStore();
  const { projects, clients, issues, addIssue } = store;

  // Active token with multi-source fallback (query param -> hash -> override -> localStorage)
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

  // Clean up corrupted URL parameters (e.g. ?token=%5Bobject%20Object%5D) or corrupted localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const rawQueryToken = urlParams.get('token');
      if (rawQueryToken && (rawQueryToken === '[object Object]' || rawQueryToken === 'undefined' || rawQueryToken === 'null' || rawQueryToken === 'omnilog-demo')) {
        const newUrl = window.location.pathname.startsWith('/portal') ? '/portal' : window.location.pathname;
        window.history.replaceState(null, '', newUrl);
      }
      const stored = localStorage.getItem('agx_active_portal_token');
      if (stored === '[object Object]' || stored === 'undefined' || stored === 'null' || stored === 'omnilog-demo') {
        localStorage.removeItem('agx_active_portal_token');
      }
    }
  }, []);

  // Sync token when tokenOverride changes
  useEffect(() => {
    const cleanOverride = sanitizePortalToken(tokenOverride);
    if (cleanOverride && cleanOverride !== token && cleanOverride !== 'omnilog-demo') {
      setToken(cleanOverride);
    }
  }, [tokenOverride, token]);

  // Persist current active token to localStorage
  useEffect(() => {
    const cleanToStore = sanitizePortalToken(token);
    if (cleanToStore && cleanToStore !== 'omnilog-demo' && typeof window !== 'undefined') {
      try {
        localStorage.setItem('agx_active_portal_token', cleanToStore);
      } catch (_) {}
    }
  }, [token]);

  // Match active project with strict verification
  const matchedProject = useMemo(() => {
    const cleanToken = sanitizePortalToken(token).toLowerCase();
    if (cleanToken && cleanToken !== 'omnilog-demo') {
      const byToken = projects.find(p => p.portalToken?.toLowerCase() === cleanToken);
      if (byToken) return byToken;

      const byId = projects.find(p => p.id.toLowerCase() === cleanToken);
      if (byId) return byId;

      const byName = projects.find(p => p.clientName.toLowerCase().includes(cleanToken));
      if (byName) return byName;

      const clientWithEmail = clients.find(c => c.email.toLowerCase() === cleanToken);
      if (clientWithEmail) {
        const byClientId = projects.find(p => p.clientId === clientWithEmail.id);
        if (byClientId) return byClientId;
      }
    }

    return null;
  }, [projects, clients, token]);

  // Client info helper
  const matchedClient = useMemo(() => {
    if (!matchedProject) return null;
    return clients.find(c => c.id === matchedProject.clientId) || null;
  }, [matchedProject, clients]);

  // View state: strictly between 'report' and 'tracker'
  const [activeTab, setActiveTab] = useState<'report' | 'tracker'>('report');

  // Form State for Issue Submission
  const [title, setTitle] = useState('');
  const [issueType, setIssueType] = useState<IssueType>('Bug');
  const [priority, setPriority] = useState<IssuePriority>('Medium');
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmittedTicket, setLastSubmittedTicket] = useState<ProjectIssue | null>(null);

  // Pre-fill reporter name/email if known from client profile
  useEffect(() => {
    if (matchedClient && !reporterEmail) {
      if (matchedClient.email) setReporterEmail(matchedClient.email);
      if (matchedClient.name) setReporterName(matchedClient.name);
    }
  }, [matchedClient]);

  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  // Filter & Search in Tracker
  const [trackerFilter, setTrackerFilter] = useState<'all' | 'open' | 'resolved'>('all');
  const [trackerSearch, setTrackerSearch] = useState('');
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<string | null>(null);

  // Project Switcher Dropdown & Token Modal State
  const [projectSwitcherOpen, setProjectSwitcherOpen] = useState(false);
  const [customTokenModalOpen, setCustomTokenModalOpen] = useState(false);
  const [customTokenInput, setCustomTokenInput] = useState('');
  const [customTokenError, setCustomTokenError] = useState<string | null>(null);

  const handleSelectProject = (newProjectToken: string) => {
    setToken(newProjectToken);
    setProjectSwitcherOpen(false);
    setCustomTokenModalOpen(false);
    if (typeof window !== 'undefined') {
      const targetUrl = `/portal?token=${encodeURIComponent(newProjectToken)}`;
      window.history.pushState(null, '', targetUrl);
    }
  };

  const handleCustomTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomTokenError(null);
    const q = customTokenInput.trim().toLowerCase();
    if (!q) {
      setCustomTokenError('Please enter a project token or email.');
      return;
    }

    const found = projects.find(p => 
      p.portalToken?.toLowerCase() === q || 
      p.id.toLowerCase() === q ||
      p.clientName.toLowerCase().includes(q)
    );

    if (found) {
      handleSelectProject(found.portalToken || found.id);
      setCustomTokenInput('');
    } else {
      setCustomTokenError(`No project matched "${customTokenInput}". Please check the token provided by AGX.`);
    }
  };

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

  const processFiles = (files: File[]) => {
    files.forEach(async (file) => {
      if (file.size > 10 * 1024 * 1024) {
        alert('File exceeds maximum size of 10MB.');
        return;
      }
      try {
        const { publicUrl } = await crmService.uploadAttachment('crm-attachments', file);
        if (publicUrl) {
          setAttachments(prev => [...prev, publicUrl].slice(0, 5));
          return;
        }
      } catch (_) {}

      // Fallback to DataURL if storage is offline
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAttachments(prev => [...prev, event.target!.result as string].slice(0, 5));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Submit issue handler
  const handleSubmitIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchedProject) return;
    if (!title.trim() || !description.trim() || !reporterName.trim() || !reporterEmail.trim()) {
      alert('Please fill in all required fields (Title, Description, Name, Email).');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const createdIssue = addIssue({
        projectId: matchedProject.id,
        projectName: matchedProject.name,
        clientId: matchedProject.clientId,
        clientName: matchedProject.clientName,
        title: title.trim(),
        description: description.trim(),
        issueType,
        priority,
        status: 'REPORTED',
        reporterName: reporterName.trim(),
        reporterEmail: reporterEmail.trim(),
        attachments: attachments.length > 0 ? attachments : undefined
      });

      setLastSubmittedTicket(createdIssue);
      setIsSubmitting(false);

      // Clear inputs
      setTitle('');
      setDescription('');
      setAttachments([]);
    }, 400);
  };

  // Filtered issues for matched project
  const projectIssues = useMemo(() => {
    if (!matchedProject) return [];
    return issues.filter(i => i.projectId === matchedProject.id || i.projectName === matchedProject.name);
  }, [issues, matchedProject]);

  const filteredIssues = useMemo(() => {
    return projectIssues.filter(i => {
      const matchesSearch = 
        i.title.toLowerCase().includes(trackerSearch.toLowerCase()) ||
        i.ticketNumber.toLowerCase().includes(trackerSearch.toLowerCase()) ||
        i.description.toLowerCase().includes(trackerSearch.toLowerCase()) ||
        i.reporterName.toLowerCase().includes(trackerSearch.toLowerCase());

      if (!matchesSearch) return false;

      if (trackerFilter === 'open') {
        return i.status !== 'RESOLVED' && i.status !== 'CLOSED';
      }
      if (trackerFilter === 'resolved') {
        return i.status === 'RESOLVED' || i.status === 'CLOSED';
      }
      return true;
    });
  }, [projectIssues, trackerSearch, trackerFilter]);

  const openIssuesCount = projectIssues.filter(i => i.status !== 'RESOLVED' && i.status !== 'CLOSED').length;

  if (!matchedProject) {
    return (
      <div className="min-h-screen bg-[#070709] text-white flex flex-col justify-between p-6 antialiased selection:bg-[#CCFF00] selection:text-black">
        <div className="w-full max-w-4xl mx-auto flex items-center justify-between py-4">
          <button
            onClick={onBackToWebsite || (() => { window.location.href = '/'; })}
            className="flex items-center gap-2 text-xs font-semibold text-white/60 hover:text-white transition-colors px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer"
          >
            <ArrowLeft size={14} /> Back to Website
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

        <div className="max-w-md w-full mx-auto my-auto p-8 rounded-3xl bg-[#0D1017] border border-white/10 shadow-2xl text-center space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
            <KeyRound size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase text-white tracking-tight font-['Outfit']">
              Client Project Portal
            </h2>
            <p className="text-xs text-white/50 mt-1">
              Enter your confidential project access token to review live deliverables, tickets & updates.
            </p>
          </div>

          <form onSubmit={handleCustomTokenSubmit} className="space-y-3.5 text-left">
            <div>
              <label className="block text-[11px] font-bold text-white/70 uppercase tracking-wider mb-1.5">
                Project Access Token
              </label>
              <div className="relative flex items-center">
                <KeyRound size={15} className="absolute left-3.5 text-white/40" />
                <input
                  type="text"
                  value={customTokenInput}
                  onChange={(e) => { setCustomTokenInput(e.target.value); setCustomTokenError(null); }}
                  placeholder="e.g., prj_sec_..."
                  className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#CCFF00] transition-all font-mono"
                  autoFocus
                />
              </div>
              {customTokenError && (
                <p className="text-[11px] text-rose-400 mt-1.5 font-mono">{customTokenError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer btn-press"
            >
              <span>Access Project Workspace</span>
              <ArrowRight size={13} />
            </button>
          </form>

          <p className="text-[11px] text-white/40 pt-2 border-t border-white/5">
            Need your token? Reach out to your AGX Project Manager or email ops@agxperience.com
          </p>
        </div>

        <div className="w-full text-center py-4 text-[11px] text-white/30 font-mono">
          © {new Date().getFullYear()} AGXPERIENCE INC. • ENTERPRISE CLIENT REPOSITORY
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col justify-between font-sans selection:bg-[#CCFF00] selection:text-black">
      {/* Minimal Top Header */}
      <header className="bg-[#0D1017]/90 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
          {/* Brand & Project Identity */}
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

            {/* Subtle Project Indicator / Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProjectSwitcherOpen(!projectSwitcherOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white/90 transition-all cursor-pointer"
                title="Switch client project workspace"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="max-w-[140px] sm:max-w-[200px] truncate">{matchedProject.clientName}</span>
                <ChevronDown size={12} className={`text-white/40 transition-transform ${projectSwitcherOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {projectSwitcherOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.12 }}
                    className="absolute top-full left-0 mt-2 w-72 rounded-xl bg-[#121620] border border-white/15 p-2.5 shadow-2xl z-50 space-y-1 text-xs"
                  >
                    <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-widest text-gray-400 border-b border-white/10">
                      Client Workspaces
                    </div>

                    <div className="max-h-56 overflow-y-auto space-y-1 pt-1">
                      {projects.map((p) => {
                        const isCurrent = p.id === matchedProject.id || p.portalToken === matchedProject.portalToken;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handleSelectProject(p.portalToken || p.id)}
                            className={`w-full text-left p-2 rounded-lg transition-all flex items-center justify-between cursor-pointer ${
                              isCurrent
                                ? 'bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-white font-bold'
                                : 'hover:bg-white/5 text-gray-300'
                            }`}
                          >
                            <div className="truncate">
                              <span className="block truncate text-xs">{p.clientName}</span>
                              <span className="text-[10px] text-gray-500 block truncate">{p.name}</span>
                            </div>
                            {isCurrent && <Check size={13} className="text-[#CCFF00] shrink-0 ml-2" />}
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-1.5 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => {
                          setProjectSwitcherOpen(false);
                          setCustomTokenModalOpen(true);
                        }}
                        className="w-full py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <KeyRound size={12} className="text-[#CCFF00]" />
                        <span>Enter Access Token</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Action: Return to Website */}
          {onBackToWebsite && (
            <button
              onClick={onBackToWebsite}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-white transition-all cursor-pointer"
            >
              <ArrowLeft size={13} />
              <span>Back to Website</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Focus Container */}
      <main className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 flex-1 space-y-6">
        {/* Page Title & View Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Client Issue & Bug Tracker
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Submit bugs, errors, or feedback directly to your engineering team.
            </p>
          </div>

          {/* Minimal 2-Pill View Switcher */}
          <div className="flex items-center bg-white/5 border border-white/10 p-1 rounded-xl shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('report')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                activeTab === 'report'
                  ? 'bg-[#CCFF00] text-black shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <PlusCircle size={13} />
              <span>Report Issue</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('tracker')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                activeTab === 'tracker'
                  ? 'bg-[#CCFF00] text-black shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <ListFilter size={13} />
              <span>Track Tickets</span>
              {openIssuesCount > 0 && (
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  activeTab === 'tracker' ? 'bg-black text-[#CCFF00]' : 'bg-[#CCFF00]/20 text-[#CCFF00]'
                }`}>
                  {openIssuesCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* TAB 1: Report Issue Form */}
        {activeTab === 'report' && (
          <div className="space-y-6">
            {/* Success notification banner if a ticket was just submitted */}
            {lastSubmittedTicket && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      Ticket {lastSubmittedTicket.ticketNumber} Submitted Successfully
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Our engineering dispatch queue has received this report.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setActiveTab('tracker')}
                    className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-all cursor-pointer text-center"
                  >
                    View in Tracker
                  </button>
                  <button
                    type="button"
                    onClick={() => setLastSubmittedTicket(null)}
                    className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 cursor-pointer"
                    title="Dismiss"
                  >
                    <X size={14} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Clean, Minimalist Submission Form */}
            <form onSubmit={handleSubmitIssue} className="bg-[#0D1017] border border-white/10 rounded-2xl p-6 sm:p-7 space-y-5 shadow-xl">
              {/* Issue Title */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                  Issue Summary <span className="text-[#CCFF00]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Checkout button unresponsive on mobile Safari"
                  className="w-full bg-black/50 border border-white/15 focus:border-[#CCFF00] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-600 outline-none transition-all"
                />
              </div>

              {/* Category & Priority Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category Pills */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                    Category
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['Bug', 'UI/UX Polish', 'Feature Revision'] as IssueType[]).map((type) => {
                      const isSelected = issueType === type;
                      const label = type === 'Bug' ? 'Bug / Error' : type === 'UI/UX Polish' ? 'UI / Polish' : 'Feature';
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setIssueType(type)}
                          className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center cursor-pointer border ${
                            isSelected
                              ? 'bg-[#CCFF00]/15 border-[#CCFF00] text-[#CCFF00]'
                              : 'bg-black/40 border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Priority Selector */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                    Urgency
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['Low', 'Medium', 'Critical'] as IssuePriority[]).map((p) => {
                      const isSelected = priority === p;
                      const label = p === 'Low' ? 'Normal' : p === 'Medium' ? 'High' : 'Urgent';
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPriority(p)}
                          className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center cursor-pointer border ${
                            isSelected
                              ? p === 'Critical'
                                ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                                : 'bg-[#CCFF00]/15 border-[#CCFF00] text-[#CCFF00]'
                              : 'bg-black/40 border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Description & Steps to Reproduce */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                  Description & Steps to Reproduce <span className="text-[#CCFF00]">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what happened, what you expected, and steps to reproduce the issue..."
                  className="w-full bg-black/50 border border-white/15 focus:border-[#CCFF00] rounded-xl p-4 text-xs sm:text-sm text-white placeholder:text-gray-600 outline-none transition-all leading-relaxed"
                />
              </div>

              {/* Minimal Screenshot / Attachment Upload */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                  Attachment / Screenshot <span className="text-gray-500 text-[10px] lowercase">(optional)</span>
                </label>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                    dragActive
                      ? 'border-[#CCFF00] bg-[#CCFF00]/5'
                      : 'border-white/10 hover:border-white/25 bg-black/30'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf,.log,.txt"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                    <UploadCloud size={16} className="text-[#CCFF00]" />
                    <span>Drop screenshot or click to browse (Images, PDF, Logs)</span>
                  </div>
                </div>

                {/* Uploaded File Previews */}
                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {attachments.map((url, idx) => (
                      <div key={idx} className="relative group bg-white/5 border border-white/15 rounded-lg p-1.5 flex items-center gap-2">
                        {url.startsWith('data:image') || url.includes('supabase.co') ? (
                          <img src={url} alt="Attachment" className="w-8 h-8 rounded object-cover" />
                        ) : (
                          <ImageIcon size={16} className="text-gray-400" />
                        )}
                        <span className="text-[10px] text-gray-300 font-mono">Attachment {idx + 1}</span>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeAttachment(idx); }}
                          className="w-4 h-4 rounded-full bg-rose-500/80 text-white flex items-center justify-center text-[10px] hover:bg-rose-600 cursor-pointer"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reporter Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/10">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    Your Name <span className="text-[#CCFF00]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    placeholder="e.g. Alex Mercer"
                    className="w-full bg-black/50 border border-white/15 focus:border-[#CCFF00] rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-gray-600 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    Work Email <span className="text-[#CCFF00]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={reporterEmail}
                    onChange={(e) => setReporterEmail(e.target.value)}
                    placeholder="e.g. alex@aethercapital.com"
                    className="w-full bg-black/50 border border-white/15 focus:border-[#CCFF00] rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-gray-600 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Primary Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#CCFF00]/10 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    <span>Transmitting to Engineering Queue...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Issue Ticket</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: Track Submitted Issues */}
        {activeTab === 'tracker' && (
          <div className="space-y-4">
            {/* Search and Filters Strip */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={trackerSearch}
                  onChange={(e) => setTrackerSearch(e.target.value)}
                  placeholder="Search by ticket # or keyword..."
                  className="w-full bg-[#0D1017] border border-white/10 focus:border-white/25 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-gray-500 outline-none transition-all"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-xl">
                {(['all', 'open', 'resolved'] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setTrackerFilter(filter)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      trackerFilter === filter
                        ? 'bg-white text-black'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Issues Cards List */}
            {filteredIssues.length === 0 ? (
              <div className="bg-[#0D1017] border border-white/10 rounded-2xl p-10 text-center space-y-3">
                <CheckCircle2 size={32} className="text-emerald-400 mx-auto" />
                <h3 className="text-sm font-bold text-white">No Issues Found</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  {trackerSearch
                    ? `No tickets match "${trackerSearch}".`
                    : 'There are currently no reported issues matching this filter.'}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('report')}
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#CCFF00] text-black text-xs font-bold hover:bg-[#b8e600] transition-colors cursor-pointer"
                >
                  <PlusCircle size={13} />
                  <span>Report an Issue</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredIssues.map((issue) => {
                  const isResolved = issue.status === 'RESOLVED' || issue.status === 'CLOSED';
                  const isInProgress = issue.status === 'IN PROGRESS' || issue.status === 'IN REVIEW';

                  return (
                    <div
                      key={issue.id}
                      className="bg-[#0D1017] border border-white/10 hover:border-white/20 rounded-2xl p-5 space-y-3 transition-all shadow-sm"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-[#CCFF00]">
                            {issue.ticketNumber}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/5 text-gray-300 border border-white/10">
                            {issue.issueType}
                          </span>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            issue.priority === 'Critical'
                              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                              : issue.priority === 'High'
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              : 'bg-white/5 text-gray-400 border border-white/10'
                          }`}>
                            {issue.priority}
                          </span>
                        </div>

                        {/* Status Pill */}
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
                            isResolved
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : isInProgress
                              ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                              : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              isResolved ? 'bg-emerald-400' : isInProgress ? 'bg-purple-400 animate-pulse' : 'bg-amber-400'
                            }`} />
                            <span>
                              {isResolved ? 'Resolved' : isInProgress ? 'In Progress' : 'Reported'}
                            </span>
                          </span>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-white">{issue.title}</h3>
                        <p className="text-xs text-gray-400 mt-1 leading-relaxed whitespace-pre-line">
                          {issue.description}
                        </p>
                      </div>

                      {/* Visual Resolution Status Card */}
                      {isResolved && (
                        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                          <div className="flex items-start gap-2.5">
                            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 mt-0.5 sm:mt-0 shrink-0">
                              <CheckCircle2 size={16} />
                            </div>
                            <div>
                              <div className="font-bold text-emerald-300 flex items-center gap-2 flex-wrap">
                                <span>Verified & Deployed to Production</span>
                                {issue.resolvedAt && (
                                  <span className="text-[10px] text-emerald-400/80 font-mono">
                                    • {new Date(issue.resolvedAt).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-300 text-[11px] mt-0.5 leading-relaxed">
                                {issue.resolutionNotes || 'Our engineering team has resolved and verified this fix in the production release.'}
                              </p>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold shrink-0 self-end sm:self-center">
                            Production Live
                          </span>
                        </div>
                      )}

                      {/* Attachments previews */}
                      {issue.attachments && issue.attachments.length > 0 && (
                        <div className="flex items-center gap-2 pt-1">
                          {issue.attachments.map((att, aIdx) => (
                            <button
                              key={aIdx}
                              type="button"
                              onClick={() => setSelectedPreviewImage(att)}
                              className="flex items-center gap-1 text-[11px] text-[#CCFF00] hover:underline cursor-pointer bg-white/5 px-2 py-1 rounded border border-white/10"
                            >
                              <ImageIcon size={12} />
                              <span>View Screenshot {aIdx + 1}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-500 font-mono">
                        <span>Reported by {issue.reporterName}</span>
                        <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-white/5 py-4 text-center text-[10px] font-mono text-gray-500 uppercase tracking-widest">
        AGXperience Client Portal • Confidential & Encrypted
      </footer>

      {/* Image Preview Modal */}
      {selectedPreviewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedPreviewImage(null)}
        >
          <div className="relative max-w-3xl max-h-[85vh] p-2 bg-[#121620] border border-white/20 rounded-2xl">
            <button
              onClick={() => setSelectedPreviewImage(null)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-bold text-xs hover:bg-gray-200 cursor-pointer shadow-lg"
            >
              ✕
            </button>
            <img
              src={selectedPreviewImage}
              alt="Preview"
              className="max-h-[80vh] w-auto rounded-xl object-contain"
            />
          </div>
        </div>
      )}

      {/* Custom Access Token Modal */}
      <AnimatePresence>
        {customTokenModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCustomTokenModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-[#121620] border border-white/20 rounded-2xl p-6 z-10 text-white space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <KeyRound size={16} className="text-[#CCFF00]" />
                  <h3 className="text-sm font-bold">Enter Access Token</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setCustomTokenModalOpen(false)}
                  className="text-gray-400 hover:text-white cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <p className="text-xs text-gray-400 leading-relaxed">
                Paste your secret project token or workspace email to access your tickets.
              </p>

              <form onSubmit={handleCustomTokenSubmit} className="space-y-3">
                <input
                  type="text"
                  value={customTokenInput}
                  onChange={(e) => {
                    setCustomTokenInput(e.target.value);
                    if (customTokenError) setCustomTokenError(null);
                  }}
                  placeholder="e.g. prj_sec_aether_3d7c1e"
                  className="w-full bg-black/60 border border-white/15 focus:border-[#CCFF00] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-gray-600 outline-none font-mono"
                />

                {customTokenError && (
                  <p className="text-xs text-rose-400 font-medium">{customTokenError}</p>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-bold text-xs transition-all cursor-pointer"
                  >
                    Open Workspace
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomTokenModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
