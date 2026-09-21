import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Users, Briefcase, CheckSquare, IndianRupee, Key, FileText, ArrowRight, UserCheck, Shield, Globe, AlertTriangle } from 'lucide-react';
import { Lead, Client, Project, Task, Invoice, CredentialVaultItem, Agreement, DocumentItem, UserProfile, Partner, ProjectIssue } from '../../types/crm';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  leads: Lead[];
  clients: Client[];
  projects: Project[];
  tasks: Task[];
  invoices: Invoice[];
  credentials: CredentialVaultItem[];
  agreements?: Agreement[];
  documents?: DocumentItem[];
  teamMembers?: UserProfile[];
  partners?: Partner[];
  issues?: ProjectIssue[];
  currentUser?: UserProfile;
  onNavigate: (route: string, entityId?: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  leads,
  clients,
  projects,
  tasks,
  invoices,
  credentials,
  agreements = [],
  documents = [],
  teamMembers = [],
  partners = [],
  issues = [],
  currentUser,
  onNavigate
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  // Role-based visibility gates
  const canAccessFinance = !currentUser || ['Super Admin', 'Admin', 'Finance Lead'].includes(currentUser.role);
  const canAccessVault = !currentUser || ['Super Admin', 'Admin', 'DevOps / Infra'].includes(currentUser.role);

  const filteredLeads = q ? leads.filter(l => l.name.toLowerCase().includes(q) || l.company.toLowerCase().includes(q) || l.interestedService.toLowerCase().includes(q)).slice(0, 3) : [];
  const filteredClients = q ? clients.filter(c => c.company.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || (c.industry && c.industry.toLowerCase().includes(q))).slice(0, 3) : [];
  const filteredProjects = q ? projects.filter(p => p.name.toLowerCase().includes(q) || p.clientName.toLowerCase().includes(q) || p.serviceType.toLowerCase().includes(q)).slice(0, 3) : [];
  const filteredTasks = q ? tasks.filter(t => t.title.toLowerCase().includes(q) || (t.projectName && t.projectName.toLowerCase().includes(q))).slice(0, 3) : [];
  const filteredIssues = q ? issues.filter(iss => iss.ticketNumber.toLowerCase().includes(q) || iss.title.toLowerCase().includes(q) || iss.reporterName.toLowerCase().includes(q) || iss.projectName.toLowerCase().includes(q)).slice(0, 3) : [];
  const filteredPartners = q ? partners.filter(p => p.name.toLowerCase().includes(q) || p.referralCode.toLowerCase().includes(q) || (p.company && p.company.toLowerCase().includes(q))).slice(0, 3) : [];
  const filteredInvoices = (q && canAccessFinance) ? invoices.filter(i => i.invoiceNumber.toLowerCase().includes(q) || i.clientName.toLowerCase().includes(q)).slice(0, 3) : [];
  const filteredCredentials = (q && canAccessVault) ? credentials.filter(c => c.platformName.toLowerCase().includes(q) || (c.clientName && c.clientName.toLowerCase().includes(q))).slice(0, 3) : [];
  const filteredAgreements = (q && canAccessFinance) ? agreements.filter(a => a.name.toLowerCase().includes(q) || a.clientName.toLowerCase().includes(q) || a.agreementType.toLowerCase().includes(q)).slice(0, 3) : [];
  const filteredDocuments = q ? documents.filter(d => d.title.toLowerCase().includes(q) || (d.clientName && d.clientName.toLowerCase().includes(q)) || d.docType.toLowerCase().includes(q)).slice(0, 3) : [];
  const filteredStaff = q ? teamMembers.filter(m => m.fullName.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.role.toLowerCase().includes(q)).slice(0, 3) : [];

  const totalResults = filteredLeads.length + filteredClients.length + filteredProjects.length + filteredTasks.length + filteredIssues.length + filteredPartners.length + filteredInvoices.length + filteredCredentials.length + filteredAgreements.length + filteredDocuments.length + filteredStaff.length;

  const handleSelect = (route: string, entityId?: string) => {
    onNavigate(route, entityId);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="crm-theme fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -12 }}
          transition={{ type: 'spring', damping: 26, stiffness: 360 }}
          className="w-full max-w-2xl bg-[#121620]/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Input Header */}
          <div className="relative flex items-center border-b border-white/10 px-5 py-4">
            <Search size={20} className="text-[#CCFF00] mr-3" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search leads, clients, projects, tasks, invoices, credentials..."
              className="w-full bg-transparent text-white placeholder-white/40 text-base outline-none"
            />
            {query && (
              <button onClick={() => setQuery('')} className="p-1 text-white/40 hover:text-white mr-2 btn-press">
                <X size={16} />
              </button>
            )}
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-white/40 bg-white/5 border border-white/10 rounded">ESC</kbd>
          </div>

          {/* Results List */}
          <div className="max-h-[60vh] overflow-y-auto crm-scrollbar p-4 space-y-4">
            {!query && (
              <div className="py-12 text-center text-white/40">
                <Search size={36} className="mx-auto mb-3 opacity-30 text-[#CCFF00]" />
                <p className="text-sm font-medium">Type anything to search across the entire AGX CRM</p>
                <div className="flex justify-center gap-2 mt-3 text-xs text-white/30">
                  <span className="px-2 py-1 rounded bg-white/5">Leads</span>
                  <span className="px-2 py-1 rounded bg-white/5">Clients</span>
                  <span className="px-2 py-1 rounded bg-white/5">Projects</span>
                  <span className="px-2 py-1 rounded bg-white/5">Invoices</span>
                  <span className="px-2 py-1 rounded bg-white/5">Vault</span>
                </div>
              </div>
            )}

            {query && totalResults === 0 && (
              <div className="py-12 text-center text-white/40">
                <p className="text-sm font-medium">No results found for "{query}"</p>
                <p className="text-xs mt-1 text-white/30">Try checking spelling or search by company or service.</p>
              </div>
            )}

            {/* Leads */}
            {filteredLeads.length > 0 && (
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-white/40 mb-2 flex items-center gap-1.5 px-2">
                  <UserCheck size={13} className="text-amber-400" /> Leads
                </div>
                <div className="space-y-1">
                  {filteredLeads.map(l => (
                    <div
                      key={l.id}
                      onClick={() => handleSelect('leads', l.id)}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 cursor-pointer group transition-colors"
                    >
                      <div>
                        <div className="text-sm font-medium text-white group-hover:text-[#CCFF00] transition-colors">{l.name} • {l.company}</div>
                        <div className="text-xs text-white/50">{l.interestedService} • ₹{l.estimatedDealValue.toLocaleString()}</div>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">{l.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Clients */}
            {filteredClients.length > 0 && (
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-white/40 mb-2 flex items-center gap-1.5 px-2">
                  <Users size={13} className="text-blue-400" /> Clients
                </div>
                <div className="space-y-1">
                  {filteredClients.map(c => (
                    <div
                      key={c.id}
                      onClick={() => handleSelect('clients', c.id)}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 cursor-pointer group transition-colors"
                    >
                      <div>
                        <div className="text-sm font-medium text-white group-hover:text-[#CCFF00] transition-colors">{c.company}</div>
                        <div className="text-xs text-white/50">Total Value: ₹{c.totalValue.toLocaleString()} • Mgr: {c.accountManager}</div>
                      </div>
                      <ArrowRight size={14} className="text-white/30 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {filteredProjects.length > 0 && (
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-white/40 mb-2 flex items-center gap-1.5 px-2">
                  <Briefcase size={13} className="text-purple-400" /> Projects
                </div>
                <div className="space-y-1">
                  {filteredProjects.map(p => (
                    <div
                      key={p.id}
                      onClick={() => handleSelect('projects', p.id)}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 cursor-pointer group transition-colors"
                    >
                      <div>
                        <div className="text-sm font-medium text-white group-hover:text-[#CCFF00] transition-colors">{p.name}</div>
                        <div className="text-xs text-white/50">{p.clientName} • Progress: {p.progress}%</div>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">{p.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tasks */}
            {filteredTasks.length > 0 && (
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-white/40 mb-2 flex items-center gap-1.5 px-2">
                  <CheckSquare size={13} className="text-emerald-400" /> Tasks
                </div>
                <div className="space-y-1">
                  {filteredTasks.map(t => (
                    <div
                      key={t.id}
                      onClick={() => handleSelect('tasks', t.id)}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 cursor-pointer group transition-colors"
                    >
                      <div>
                        <div className="text-sm font-medium text-white group-hover:text-[#CCFF00] transition-colors">{t.title}</div>
                        <div className="text-xs text-white/50">{t.projectName} • Assigned: {t.assignedTo}</div>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">{t.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Invoices */}
            {filteredInvoices.length > 0 && (
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-white/40 mb-2 flex items-center gap-1.5 px-2">
                  <IndianRupee size={13} className="text-lime-400" /> Invoices
                </div>
                <div className="space-y-1">
                  {filteredInvoices.map(i => (
                    <div
                      key={i.id}
                      onClick={() => handleSelect('finance', i.id)}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 cursor-pointer group transition-colors"
                    >
                      <div>
                        <div className="text-sm font-medium text-white group-hover:text-[#CCFF00] transition-colors">{i.invoiceNumber} • {i.clientName}</div>
                        <div className="text-xs text-white/50">₹{i.total.toLocaleString()} • Due: {i.dueDate}</div>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-lime-500/20 text-lime-300">{i.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Credentials */}
            {filteredCredentials.length > 0 && (
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-white/40 mb-2 flex items-center gap-1.5 px-2">
                  <Key size={13} className="text-rose-400" /> Vault Credentials
                </div>
                <div className="space-y-1">
                  {filteredCredentials.map(c => (
                    <div
                      key={c.id}
                      onClick={() => handleSelect('vault', c.id)}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 cursor-pointer group transition-colors"
                    >
                      <div>
                        <div className="text-sm font-medium text-white group-hover:text-[#CCFF00] transition-colors">{c.platformName}</div>
                        <div className="text-xs text-white/50">{c.clientName} • User: {c.username}</div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">Protected</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Agreements */}
            {filteredAgreements.length > 0 && (
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-white/40 mb-2 flex items-center gap-1.5 px-2">
                  <FileText size={13} className="text-indigo-400" /> Legal Agreements
                </div>
                <div className="space-y-1">
                  {filteredAgreements.map(a => (
                    <div
                      key={a.id}
                      onClick={() => handleSelect('documents', a.id)}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 cursor-pointer group transition-colors"
                    >
                      <div>
                        <div className="text-sm font-medium text-white group-hover:text-[#CCFF00] transition-colors">{a.name}</div>
                        <div className="text-xs text-white/50">{a.clientName} • {a.agreementType}</div>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">{a.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Documents */}
            {filteredDocuments.length > 0 && (
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-white/40 mb-2 flex items-center gap-1.5 px-2">
                  <FileText size={13} className="text-cyan-400" /> Documents & Specifications
                </div>
                <div className="space-y-1">
                  {filteredDocuments.map(d => (
                    <div
                      key={d.id}
                      onClick={() => handleSelect('documents', d.id)}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 cursor-pointer group transition-colors"
                    >
                      <div>
                        <div className="text-sm font-medium text-white group-hover:text-[#CCFF00] transition-colors">{d.title}</div>
                        <div className="text-xs text-white/50">{d.docType} • {d.clientName || 'Internal'}</div>
                      </div>
                      <span className="text-[10px] text-white/40">{d.fileSize || 'File'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Staff / Team */}
            {filteredStaff.length > 0 && (
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-white/40 mb-2 flex items-center gap-1.5 px-2">
                  <Shield size={13} className="text-teal-400" /> Staff & Team Members
                </div>
                <div className="space-y-1">
                  {filteredStaff.map(m => (
                    <div
                      key={m.id}
                      onClick={() => handleSelect('settings', m.id)}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 cursor-pointer group transition-colors"
                    >
                      <div>
                        <div className="text-sm font-medium text-white group-hover:text-[#CCFF00] transition-colors">{m.fullName}</div>
                        <div className="text-xs text-white/50">{m.email} • {m.department}</div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300">{m.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* QA Tickets & Issues */}
            {filteredIssues.length > 0 && (
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-white/40 mb-2 flex items-center gap-1.5 px-2">
                  <AlertTriangle size={13} className="text-amber-400" /> QA Tickets & Issues
                </div>
                <div className="space-y-1">
                  {filteredIssues.map(iss => (
                    <div
                      key={iss.id}
                      onClick={() => handleSelect('issues', iss.id)}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 cursor-pointer group transition-colors"
                    >
                      <div>
                        <div className="text-sm font-medium text-white group-hover:text-[#CCFF00] transition-colors">{iss.title}</div>
                        <div className="text-xs text-white/50">{iss.projectName} • Priority: {iss.priority} • Type: {iss.issueType}</div>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        iss.status === 'RESOLVED' || iss.status === 'CLOSED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                      }`}>{iss.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Channel Partners */}
            {filteredPartners.length > 0 && (
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-white/40 mb-2 flex items-center gap-1.5 px-2">
                  <Globe size={13} className="text-pink-400" /> Channel Partners
                </div>
                <div className="space-y-1">
                  {filteredPartners.map(p => (
                    <div
                      key={p.id}
                      onClick={() => handleSelect('partners', p.id)}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 cursor-pointer group transition-colors"
                    >
                      <div>
                        <div className="text-sm font-medium text-white group-hover:text-[#CCFF00] transition-colors">{p.name} • {p.company || 'Independent'}</div>
                        <div className="text-xs text-white/50">Ref Code: <span className="font-mono text-white/80">{p.referralCode}</span> • Commission: {Math.round(p.commissionRate >= 1 ? p.commissionRate : p.commissionRate * 100)}%</div>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300">{p.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-white/10 px-5 py-3 bg-black/30 flex items-center justify-between text-xs text-white/40">
            <span>Navigation: Click or press Enter to view details</span>
            <span>AGX Universal Indexer</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
