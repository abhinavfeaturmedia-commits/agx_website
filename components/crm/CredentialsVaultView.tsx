import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Key, Shield, Plus, Search, Eye, EyeOff, Copy, Check, Lock, Unlock,
  AlertTriangle, ExternalLink, X, Sparkles, Edit3, Trash2, Download,
  Layers, Users, Briefcase, Clock, FileText, CheckCircle2, ArrowRight
} from 'lucide-react';
import { CredentialVaultItem, UserRole } from '../../types/crm';
import { useCrmStore } from '../../lib/crmStore';
import { exportService } from '../../lib/exportService';
import { toast } from '../../lib/toastStore';
import { cryptoService } from '../../lib/cryptoService';

interface CredentialsVaultViewProps {
  store: ReturnType<typeof useCrmStore>;
  onNavigate: (route: string, entityId?: string) => void;
  initialSelectedId?: string;
}

const ALL_ROLES: UserRole[] = [
  'Super Admin',
  'Admin',
  'Project Manager',
  'Developer',
  'Sales Manager',
  'Sales Executive',
  'Accountant'
];

export const CredentialsVaultView: React.FC<CredentialsVaultViewProps> = ({ store, onNavigate, initialSelectedId }) => {
  const {
    credentials, addCredential, updateCredential, deleteCredential,
    revealCredentialSecret, clients, projects,
    currentUser, canAccessCredentials
  } = store;

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClientFilter, setSelectedClientFilter] = useState<string>('All');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'recent' | 'platform' | 'client'>('recent');

  const [revealedIds, setRevealedIds] = useState<{ [key: string]: boolean }>({});
  const [revealTimers, setRevealTimers] = useState<{ [key: string]: number }>({});
  const [decryptedValues, setDecryptedValues] = useState<{ [key: string]: { password?: string; apiKey?: string } }>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [showAddApiKey, setShowAddApiKey] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [showEditApiKey, setShowEditApiKey] = useState(false);

  // Master PIN Challenge & Session Authorization (5 minutes validity)
  const [vaultUnlockedUntil, setVaultUnlockedUntil] = useState<number>(0);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [pinError, setPinError] = useState('');
  const [pendingAction, setPendingAction] = useState<
    | { type: 'reveal'; id: string }
    | { type: 'copy'; text: string; id: string; label: string }
    | null
  >(null);

  // Edit & Delete states
  const [editingCred, setEditingCred] = useState<CredentialVaultItem | null>(null);
  const [credToDelete, setCredToDelete] = useState<CredentialVaultItem | null>(null);

  // Auto-filter or open create modal if navigated with entity ID
  useEffect(() => {
    if (initialSelectedId === 'new') {
      setIsAddModalOpen(true);
      onNavigate('vault', undefined);
    } else if (initialSelectedId) {
      const match = credentials.find(c => c.id === initialSelectedId);
      if (match) {
        setSearchQuery(match.platformName);
      }
      onNavigate('vault', undefined);
    }
  }, [initialSelectedId]);

  const [newCred, setNewCred] = useState({
    platformName: '',
    serviceUrl: '',
    username: '',
    passwordEncrypted: '',
    apiKeyEncrypted: '',
    clientId: clients[0]?.id || '',
    clientName: clients[0]?.company || '',
    projectId: projects[0]?.id || '',
    projectName: projects[0]?.name || '',
    notes: '',
    accessRoles: ['Super Admin', 'Admin', 'Developer'] as UserRole[]
  });

  // Countdown timer for automatic mask
  useEffect(() => {
    const interval = setInterval(() => {
      setRevealTimers(prev => {
        const updated = { ...prev };
        let hasChanges = false;
        Object.keys(updated).forEach(id => {
          if (updated[id] > 0) {
            updated[id] -= 1;
            hasChanges = true;
          } else if (updated[id] === 0) {
            delete updated[id];
            setRevealedIds(r => ({ ...r, [id]: false }));
            hasChanges = true;
          }
        });
        return hasChanges ? updated : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Vault KPI Metrics
  const vaultMetrics = useMemo(() => {
    const totalSecrets = credentials.length;
    const uniqueClientsCovered = new Set(credentials.map(c => c.clientName).filter(Boolean)).size;
    const apiKeysCount = credentials.filter(c => c.apiKeyEncrypted).length;
    const totalRevealsLogged = Object.keys(revealedIds).filter(k => revealedIds[k]).length;

    return {
      totalSecrets,
      uniqueClientsCovered,
      apiKeysCount,
      totalRevealsLogged
    };
  }, [credentials, revealedIds]);

  // Dynamic client list for filtering
  const dynamicClients = useMemo(() => {
    const set = new Set<string>();
    clients.forEach(c => set.add(c.company));
    credentials.forEach(c => { if (c.clientName) set.add(c.clientName); });
    return Array.from(set);
  }, [clients, credentials]);

  // Filtered and sorted credentials
  const filteredCredentials = useMemo(() => {
    let result = credentials.filter(c => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        c.platformName.toLowerCase().includes(q) ||
        (c.clientName && c.clientName.toLowerCase().includes(q)) ||
        (c.projectName && c.projectName.toLowerCase().includes(q)) ||
        c.username.toLowerCase().includes(q) ||
        (c.notes && c.notes.toLowerCase().includes(q));

      const matchesClient = selectedClientFilter === 'All' || c.clientName === selectedClientFilter || c.clientId === selectedClientFilter;
      const matchesProject = selectedProjectFilter === 'All' || c.projectId === selectedProjectFilter;

      return matchesSearch && matchesClient && matchesProject;
    });

    return result.sort((a, b) => {
      if (sortBy === 'platform') return a.platformName.localeCompare(b.platformName);
      if (sortBy === 'client') return (a.clientName || '').localeCompare(b.clientName || '');
      return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
    });
  }, [credentials, searchQuery, selectedClientFilter, selectedProjectFilter, sortBy]);

  if (!canAccessCredentials) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
        <Lock size={48} className="text-rose-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900">Secure Vault Restricted</h3>
        <p className="text-xs text-gray-500 mt-2">
          Your role (<strong>{currentUser?.role}</strong>) does not have authorization to access customer infrastructure credentials.
        </p>
      </div>
    );
  }

  const isVaultAuthorized = () => {
    return vaultUnlockedUntil > Date.now();
  };

  const executeReveal = async (id: string) => {
    const isCurrentlyRevealed = revealedIds[id];
    if (isCurrentlyRevealed) {
      setRevealedIds(prev => ({ ...prev, [id]: false }));
      setRevealTimers(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    } else {
      const cred = credentials.find(c => c.id === id);
      if (cred) {
        const decPass = await cryptoService.decrypt(cred.passwordEncrypted);
        const decKey = cred.apiKeyEncrypted ? await cryptoService.decrypt(cred.apiKeyEncrypted) : '';
        setDecryptedValues(prev => ({ ...prev, [id]: { password: decPass, apiKey: decKey } }));
      }
      setRevealedIds(prev => ({ ...prev, [id]: true }));
      setRevealTimers(prev => ({ ...prev, [id]: 15 }));
      revealCredentialSecret(id);
      toast.info('Vault Secret Revealed', 'Decrypted AES-256 secret. Auto-masks in 15 seconds.');
    }
  };

  const executeCopy = async (text: string, id: string, label: string) => {
    const plain = cryptoService.isEncrypted(text) ? await cryptoService.decrypt(text) : text;
    navigator.clipboard.writeText(plain);
    setCopiedId(id);
    revealCredentialSecret(id.split('-')[0]);
    toast.success('Copied to Clipboard', `${label} decrypted & copied.`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleReveal = async (id: string) => {
    // Hiding secret doesn't require PIN challenge
    if (revealedIds[id]) {
      executeReveal(id);
      return;
    }
    if (!isVaultAuthorized()) {
      setPendingAction({ type: 'reveal', id });
      setPinCode('');
      setPinError('');
      setShowPinModal(true);
      return;
    }
    executeReveal(id);
  };

  const handleCopy = async (text: string, id: string, label: string) => {
    if (!isVaultAuthorized()) {
      setPendingAction({ type: 'copy', text, id, label });
      setPinCode('');
      setPinError('');
      setShowPinModal(true);
      return;
    }
    executeCopy(text, id, label);
  };

  const handleVerifyPin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    // Agency Master PINs: 9924 or 0000
    if (pinCode.trim() === '9924' || pinCode.trim() === '0000') {
      const unlockExpires = Date.now() + 5 * 60 * 1000; // 5 mins
      setVaultUnlockedUntil(unlockExpires);
      setShowPinModal(false);
      setPinError('');
      toast.success('Vault Session Authorized', 'Master access granted for 5 minutes. Decryption active.');

      if (pendingAction) {
        if (pendingAction.type === 'reveal') {
          executeReveal(pendingAction.id);
        } else if (pendingAction.type === 'copy') {
          executeCopy(pendingAction.text, pendingAction.id, pendingAction.label);
        }
        setPendingAction(null);
      }
    } else {
      setPinError('Invalid Master PIN. Default: 9924');
    }
  };

  const handleLockVaultNow = () => {
    setVaultUnlockedUntil(0);
    setRevealedIds({});
    setRevealTimers({});
    setDecryptedValues({});
    toast.info('Vault Locked', 'Master session cleared. All secrets masked.');
  };

  const handleCreateCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCred.platformName.trim()) {
      toast.error('Validation Error', 'Please enter a platform name.');
      return;
    }
    const cl = clients.find(c => c.id === newCred.clientId);
    const pr = projects.find(p => p.id === newCred.projectId);

    // Encrypt sensitive secrets using AES-GCM before saving
    const encryptedPassword = await cryptoService.encrypt(newCred.passwordEncrypted);
    const encryptedApiKey = newCred.apiKeyEncrypted ? await cryptoService.encrypt(newCred.apiKeyEncrypted) : '';

    addCredential({
      ...newCred,
      passwordEncrypted: encryptedPassword,
      apiKeyEncrypted: encryptedApiKey,
      clientName: cl ? cl.company : newCred.clientName,
      projectName: pr ? pr.name : newCred.projectName
    });
    setIsAddModalOpen(false);
    toast.success('Secret Vaulted', `${newCred.platformName} credentials encrypted (AES-GCM) & stored.`);
  };

  const handleSaveEditCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCred) return;

    // Encrypt if modified
    const encryptedPassword = await cryptoService.encrypt(editingCred.passwordEncrypted);
    const encryptedApiKey = editingCred.apiKeyEncrypted ? await cryptoService.encrypt(editingCred.apiKeyEncrypted) : '';

    updateCredential(editingCred.id, {
      ...editingCred,
      passwordEncrypted: encryptedPassword,
      apiKeyEncrypted: encryptedApiKey
    });
    setEditingCred(null);
    toast.success('Vault Record Updated', `${editingCred.platformName} updated & encrypted.`);
  };

  const handleConfirmDelete = () => {
    if (!credToDelete) return;
    deleteCredential(credToDelete.id);
    setCredToDelete(null);
    toast.success('Secret Erased', 'Credential record permanently deleted.');
  };

  const handleExportCsv = () => {
    exportService.exportToCsv('agx_credentials_vault_index', filteredCredentials.map(c => ({
      ID: c.id,
      Platform: c.platformName,
      ServiceURL: c.serviceUrl || 'N/A',
      Username: c.username,
      Client: c.clientName || 'Internal',
      Project: c.projectName || 'Internal',
      HasApiKey: c.apiKeyEncrypted ? 'Yes' : 'No',
      AuthorizedRoles: c.accessRoles.join('; ')
    })));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            Secure Infrastructure Vault
          </h2>
          <p className="text-xs text-gray-500">
            Encrypted client platform passwords, API keys & cloud tokens with auto-masking and audit tracing.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {isVaultAuthorized() ? (
            <button
              onClick={handleLockVaultNow}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 font-bold text-xs shadow-2xs transition-colors cursor-pointer"
              title="Click to immediately lock the vault and hide all secrets"
            >
              <Unlock size={14} className="text-emerald-600" />
              <span>Vault Unlocked (Lock Now)</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setPendingAction(null);
                setPinCode('');
                setPinError('');
                setShowPinModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200 font-bold text-xs shadow-2xs transition-colors cursor-pointer"
            >
              <Lock size={14} className="text-gray-500" />
              <span>Unlock Master Vault</span>
            </button>
          )}

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold text-xs shadow-2xs transition-colors cursor-pointer"
          >
            <Download size={14} /> Export Index CSV
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black text-white hover:bg-gray-800 font-bold text-xs shadow-md transition-colors cursor-pointer"
          >
            <Plus size={15} className="text-[#CCFF00]" /> Store Credential
          </button>
        </div>
      </div>

      {/* Row 1: Vault KPI Metrics Banner with Double-Bezel Architecture */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="double-bezel-outer card-tactile">
          <div className="double-bezel-inner p-5 flex items-start justify-between">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Stored Secrets</span>
              <span className="text-2xl font-black text-gray-900 mt-1 block tabular-nums">
                {vaultMetrics.totalSecrets} Vault Records
              </span>
              <span className="text-xs text-indigo-600 font-bold flex items-center gap-1 mt-1 tabular-nums">
                <Key size={13} /> {vaultMetrics.apiKeysCount} API Keys & Tokens
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shadow-xs">
              <Key size={18} />
            </div>
          </div>
        </div>

        <div className="double-bezel-outer card-tactile">
          <div className="double-bezel-inner p-5 flex items-start justify-between">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Clients Protected</span>
              <span className="text-2xl font-black text-emerald-600 mt-1 block tabular-nums">
                {vaultMetrics.uniqueClientsCovered} Customer Environments
              </span>
              <span className="text-xs text-emerald-700 font-bold flex items-center gap-1 mt-1 tabular-nums">
                <Shield size={13} /> Segregated Access
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-xs">
              <Users size={18} />
            </div>
          </div>
        </div>

        <div className="double-bezel-outer card-tactile">
          <div className="double-bezel-inner p-5 flex items-start justify-between">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Zero-Exposure Policy</span>
              <span className="text-2xl font-black text-purple-600 mt-1 block tabular-nums">
                AES-256 Encrypted
              </span>
              <span className="text-xs text-purple-700 font-bold flex items-center gap-1 mt-1 tabular-nums">
                <Clock size={13} /> 15s Auto-Masking Timer
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold shadow-xs">
              <Lock size={18} />
            </div>
          </div>
        </div>

        <div className="double-bezel-outer card-tactile">
          <div className="double-bezel-inner p-5 flex items-start justify-between">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Audit Tracing</span>
              <span className="text-2xl font-black text-amber-600 mt-1 block tabular-nums">
                Active Logging
              </span>
              <span className="text-xs text-amber-700 font-bold flex items-center gap-1 mt-1 tabular-nums">
                <CheckCircle2 size={13} /> Reveal & Copy Traced
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shadow-xs">
              <Shield size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* Security Warning Notice */}
      <div className="p-4 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-center gap-3 text-xs text-amber-900">
        <AlertTriangle size={18} className="text-amber-600 flex-shrink-0" />
        <div>
          <strong>Zero-Exposure Security Policy:</strong> Every reveal or copy event is logged directly to the immutable AGX audit trail. Secrets automatically re-mask after 15 seconds.
        </div>
      </div>

      {/* Row 2: Search, View Switcher & Filters */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white text-black shadow-xs' : 'text-gray-500 hover:text-black'
                }`}
              >
                Grid Cards
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-black shadow-xs' : 'text-gray-500 hover:text-black'
                }`}
              >
                Directory Table
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap flex-1 justify-end">
            <div className="relative w-full sm:w-64">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search platform, client, username..."
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

            {/* Sorting */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 rounded-xl px-3 py-2 outline-none cursor-pointer hover:border-gray-300"
            >
              <option value="recent">Sort: Recently Added</option>
              <option value="platform">Sort: Platform Name</option>
              <option value="client">Sort: Client Name</option>
            </select>
          </div>
        </div>

        {/* Active Filter Badges */}
        {(searchQuery || selectedClientFilter !== 'All' || selectedProjectFilter !== 'All') && (
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
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedClientFilter('All');
                setSelectedProjectFilter('All');
              }}
              className="text-indigo-600 font-bold hover:underline ml-auto cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Row 3: Credentials Presentation */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredCredentials.length === 0 ? (
            <div className="col-span-full bg-white rounded-3xl p-12 text-center text-gray-400 border border-dashed border-gray-200">
              <Key size={36} className="mx-auto mb-2 opacity-30" />
              <p className="text-xs">No credentials found matching the search criteria.</p>
            </div>
          ) : (
            filteredCredentials.map((cred) => {
              const isRevealed = revealedIds[cred.id];
              const remainingTime = revealTimers[cred.id] || 0;

              return (
                <div
                  key={cred.id}
                  className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative group card-tactile"
                >
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 font-bold shadow-xs">
                          <Key size={20} />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-gray-900">{cred.platformName}</h4>
                          <span className="text-[11px] text-gray-400">
                            Client: <strong className="text-gray-700">{cred.clientName || 'AGX Internal'}</strong>
                            {cred.projectName ? ` • ${cred.projectName}` : ''}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isRevealed && (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-mono font-bold shadow-2xs">
                            <svg className="w-3.5 h-3.5 -rotate-90 text-amber-600" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" className="opacity-20 fill-none" />
                              <circle
                                cx="12"
                                cy="12"
                                r="9"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                className="fill-none transition-all duration-1000 ease-linear"
                                strokeDasharray={2 * Math.PI * 9}
                                strokeDashoffset={2 * Math.PI * 9 * (1 - (remainingTime / 15))}
                                strokeLinecap="round"
                              />
                            </svg>
                            <span className="tabular-nums">{remainingTime}s</span>
                          </div>
                        )}
                        <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                          AES-256
                        </span>
                        <button
                          onClick={() => setEditingCred(cred)}
                          className="p-1 text-gray-400 hover:text-indigo-600 rounded cursor-pointer"
                          title="Edit Credential"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={() => setCredToDelete(cred)}
                          className="p-1 text-gray-400 hover:text-rose-600 rounded cursor-pointer"
                          title="Delete Credential"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3 bg-gray-50/80 p-4 rounded-2xl border border-gray-100 text-xs mt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 font-medium">Username / Email:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-gray-800">{cred.username}</span>
                          <button
                            onClick={() => handleCopy(cred.username, `${cred.id}-user`, 'Username')}
                            className="p-1 rounded hover:bg-gray-200 text-gray-500 cursor-pointer"
                            title="Copy Username"
                          >
                            {copiedId === `${cred.id}-user` ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 font-medium">Password:</span>
                        <div className="flex items-center gap-2">
                          <span className={`font-mono font-bold px-2.5 py-1 rounded-lg border transition-all ${
                            isRevealed
                              ? 'bg-indigo-50 text-indigo-900 border-indigo-200 select-all font-semibold'
                              : 'bg-white text-gray-900 border-gray-200'
                          }`}>
                            {isRevealed ? (decryptedValues[cred.id]?.password || cred.passwordEncrypted) : '••••••••••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleReveal(cred.id)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isRevealed ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-200 text-gray-600'
                            }`}
                            title={isRevealed ? 'Mask Password' : 'Reveal Password (15s)'}
                          >
                            {isRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopy(decryptedValues[cred.id]?.password || cred.passwordEncrypted, `${cred.id}-pwd`, 'Password')}
                            className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-600 cursor-pointer"
                            title="Copy Password"
                          >
                            {copiedId === `${cred.id}-pwd` ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                          </button>
                        </div>
                      </div>

                      {cred.apiKeyEncrypted && (
                        <div className="flex items-center justify-between pt-2 border-t border-gray-200/60">
                          <span className="text-gray-400 font-medium">API Token:</span>
                          <div className="flex items-center gap-2">
                            <span className={`font-mono text-[11px] font-bold px-2.5 py-1 rounded-lg border max-w-[180px] truncate transition-all ${
                              isRevealed
                                ? 'bg-indigo-50 text-indigo-900 border-indigo-200 select-all'
                                : 'bg-white text-indigo-700 border-gray-200'
                            }`}>
                              {isRevealed ? (decryptedValues[cred.id]?.apiKey || cred.apiKeyEncrypted) : '••••••••••••••••••••••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(decryptedValues[cred.id]?.apiKey || cred.apiKeyEncrypted || '', `${cred.id}-api`, 'API Key')}
                              className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-600 cursor-pointer"
                              title="Copy API Key"
                            >
                              {copiedId === `${cred.id}-api` ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      {cred.clientId && (
                        <button
                          onClick={() => onNavigate('clients', cred.clientId)}
                          className="font-bold text-indigo-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <Users size={11} /> Client 360°
                        </button>
                      )}
                      {cred.projectId && (
                        <button
                          onClick={() => onNavigate('projects', cred.projectId)}
                          className="font-bold text-purple-600 hover:underline flex items-center gap-0.5 cursor-pointer ml-2"
                        >
                          <Briefcase size={11} /> Project Hub
                        </button>
                      )}
                    </div>
                    {cred.serviceUrl && (
                      <a
                        href={cred.serviceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-black font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        Open Console <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {viewMode === 'table' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Platform & Service</th>
                  <th className="py-3.5 px-3">Client / Project</th>
                  <th className="py-3.5 px-3">Username / Account</th>
                  <th className="py-3.5 px-3">Password / Secret</th>
                  <th className="py-3.5 px-3">Authorized Roles</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredCredentials.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400 text-xs">
                      No credentials found in vault.
                    </td>
                  </tr>
                ) : (
                  filteredCredentials.map((cred) => {
                    const isRevealed = revealedIds[cred.id];

                    return (
                      <tr key={cred.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-gray-900">
                          <div className="flex items-center gap-2">
                            <Key size={14} className="text-rose-500" />
                            {cred.platformName}
                          </div>
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="font-semibold text-gray-800">{cred.clientName || 'Internal AGX'}</div>
                          <div className="text-[10px] text-gray-400">{cred.projectName || 'General Environment'}</div>
                        </td>
                        <td className="py-3.5 px-3 font-mono">{cred.username}</td>
                        <td className="py-3.5 px-3 font-mono">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`font-bold transition-all ${
                              isRevealed
                                ? 'text-indigo-900 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200 select-all font-mono font-semibold'
                                : 'text-gray-900'
                            }`}>
                              {isRevealed ? (decryptedValues[cred.id]?.password || cred.passwordEncrypted) : '••••••••••••'}
                            </span>
                            {isRevealed && (
                              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-mono font-bold shadow-2xs">
                                <svg className="w-3 h-3 -rotate-90 text-amber-600" viewBox="0 0 24 24">
                                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" className="opacity-20 fill-none" />
                                  <circle
                                    cx="12"
                                    cy="12"
                                    r="9"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    className="fill-none transition-all duration-1000 ease-linear"
                                    strokeDasharray={2 * Math.PI * 9}
                                    strokeDashoffset={2 * Math.PI * 9 * (1 - ((revealTimers[cred.id] ?? 15) / 15))}
                                    strokeLinecap="round"
                                  />
                                </svg>
                                <span className="tabular-nums">{revealTimers[cred.id] || 15}s</span>
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => toggleReveal(cred.id)}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer btn-press ${
                                isRevealed ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-200 text-gray-600'
                              }`}
                              title={isRevealed ? 'Mask Password' : 'View Password (15s)'}
                            >
                              {isRevealed ? <EyeOff size={13} /> : <Eye size={13} />}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCopy(decryptedValues[cred.id]?.password || cred.passwordEncrypted, `${cred.id}-pwd-tbl`, 'Password')}
                              className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-600 cursor-pointer"
                              title="Copy Password"
                            >
                              {copiedId === `${cred.id}-pwd-tbl` ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                            </button>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-gray-500">{cred.accessRoles.join(', ')}</td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {cred.serviceUrl && (
                              <a
                                href={cred.serviceUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1 text-gray-400 hover:text-black rounded"
                                title="Open Console"
                              >
                                <ExternalLink size={13} />
                              </a>
                            )}
                            <button
                              onClick={() => setEditingCred(cred)}
                              className="p-1 text-gray-400 hover:text-black rounded cursor-pointer"
                              title="Edit Credential"
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              onClick={() => setCredToDelete(cred)}
                              className="p-1 text-gray-400 hover:text-rose-600 rounded cursor-pointer"
                              title="Delete Credential"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Store Credential Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <h3 className="font-extrabold text-lg text-gray-900">Store Secret Credential in Vault</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-gray-400 hover:text-black cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCredential} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Platform / Service Name *</label>
                  <input
                    type="text"
                    required
                    value={newCred.platformName}
                    onChange={(e) => setNewCred({ ...newCred, platformName: e.target.value })}
                    placeholder="e.g. Supabase DB Prod"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Console URL</label>
                  <input
                    type="url"
                    value={newCred.serviceUrl}
                    onChange={(e) => setNewCred({ ...newCred, serviceUrl: e.target.value })}
                    placeholder="https://app.supabase.com"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Username / Account *</label>
                  <input
                    type="text"
                    required
                    value={newCred.username}
                    onChange={(e) => setNewCred({ ...newCred, username: e.target.value })}
                    placeholder="admin_agx"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Secret Password *</label>
                  <div className="relative">
                    <input
                      type={showAddPassword ? "text" : "password"}
                      required
                      value={newCred.passwordEncrypted}
                      onChange={(e) => setNewCred({ ...newCred, passwordEncrypted: e.target.value })}
                      placeholder="Secure password value"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 pr-10 outline-none font-mono focus:border-black"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAddPassword(!showAddPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-black cursor-pointer"
                      title={showAddPassword ? "Hide password" : "View password"}
                    >
                      {showAddPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">API Key / Secret Token (Optional)</label>
                <div className="relative">
                  <input
                    type={showAddApiKey ? "text" : "password"}
                    value={newCred.apiKeyEncrypted}
                    onChange={(e) => setNewCred({ ...newCred, apiKeyEncrypted: e.target.value })}
                    placeholder="sk_live_..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 pr-10 outline-none font-mono focus:border-black"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAddApiKey(!showAddApiKey)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-black cursor-pointer"
                    title={showAddApiKey ? "Hide token" : "View token"}
                  >
                    {showAddApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Client Link</label>
                  <select
                    value={newCred.clientId}
                    onChange={(e) => {
                      const c = clients.find(cl => cl.id === e.target.value);
                      const clientProjects = projects.filter(p => p.clientId === e.target.value);
                      setNewCred({
                        ...newCred,
                        clientId: e.target.value,
                        clientName: c ? c.company : '',
                        projectId: clientProjects[0]?.id || '',
                        projectName: clientProjects[0]?.name || ''
                      });
                    }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none cursor-pointer"
                  >
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.company}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Project Link</label>
                  <select
                    value={newCred.projectId}
                    onChange={(e) => {
                      const p = projects.find(pr => pr.id === e.target.value);
                      setNewCred({ ...newCred, projectId: e.target.value, projectName: p ? p.name : '' });
                    }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none cursor-pointer"
                  >
                    <option value="">General Environment / No Project</option>
                    {(newCred.clientId ? projects.filter(p => p.clientId === newCred.clientId) : projects).map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-black text-white font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Lock size={13} className="text-[#CCFF00]" /> Encrypt & Store
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Credential Modal */}
      {editingCred && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <h3 className="font-extrabold text-lg text-gray-900">Edit Vault Credential</h3>
              <button onClick={() => setEditingCred(null)} className="p-1 text-gray-400 hover:text-black cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEditCredential} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Platform Name</label>
                  <input
                    type="text"
                    value={editingCred.platformName}
                    onChange={(e) => setEditingCred({ ...editingCred, platformName: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Console URL</label>
                  <input
                    type="url"
                    value={editingCred.serviceUrl || ''}
                    onChange={(e) => setEditingCred({ ...editingCred, serviceUrl: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Username / Email</label>
                  <input
                    type="text"
                    value={editingCred.username}
                    onChange={(e) => setEditingCred({ ...editingCred, username: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showEditPassword ? "text" : "password"}
                      value={editingCred.passwordEncrypted}
                      onChange={(e) => setEditingCred({ ...editingCred, passwordEncrypted: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 pr-10 outline-none font-mono focus:border-black"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditPassword(!showEditPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-black cursor-pointer"
                      title={showEditPassword ? "Hide password" : "View password"}
                    >
                      {showEditPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">API Key / Token</label>
                <div className="relative">
                  <input
                    type={showEditApiKey ? "text" : "password"}
                    value={editingCred.apiKeyEncrypted || ''}
                    onChange={(e) => setEditingCred({ ...editingCred, apiKeyEncrypted: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 pr-10 outline-none font-mono focus:border-black"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditApiKey(!showEditApiKey)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-black cursor-pointer"
                    title={showEditApiKey ? "Hide token" : "View token"}
                  >
                    {showEditApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCred(null)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-black text-white font-bold shadow-md cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Credential Confirmation */}
      {credToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 size={24} />
            </div>
            <h3 className="font-extrabold text-base text-gray-900 mb-1">Delete Vault Secret?</h3>
            <p className="text-xs text-gray-500 mb-5">
              Are you sure you want to permanently erase credentials for <strong>{credToDelete.platformName}</strong>?
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setCredToDelete(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 font-bold text-xs text-gray-600 hover:bg-gray-50 cursor-pointer">Cancel</button>
              <button onClick={handleConfirmDelete} className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md cursor-pointer">Delete Secret</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Master PIN Challenge Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/80 flex items-center justify-center mx-auto mb-3">
              <Shield size={24} />
            </div>
            <h3 className="font-extrabold text-base text-gray-900 mb-1">Master Vault Security PIN</h3>
            <p className="text-xs text-gray-500 mb-4">
              Enter the 4-digit agency master PIN to decrypt production client secrets. Authorized sessions remain valid for 5 minutes.
            </p>

            <form onSubmit={handleVerifyPin} className="space-y-4">
              <div>
                <input
                  type="password"
                  maxLength={6}
                  autoFocus
                  value={pinCode}
                  onChange={(e) => {
                    setPinCode(e.target.value);
                    if (pinError) setPinError('');
                  }}
                  placeholder="••••"
                  className="w-36 mx-auto text-center tracking-[0.4em] font-mono text-xl py-2.5 px-4 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:border-black focus:ring-2 focus:ring-black/5"
                />
                {pinError ? (
                  <p className="text-[11px] text-rose-500 font-bold mt-2">{pinError}</p>
                ) : (
                  <p className="text-[10px] text-gray-400 mt-2 font-mono">Master PIN: 9924</p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPinModal(false);
                    setPendingAction(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 font-bold text-xs text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-black hover:bg-gray-800 text-[#CCFF00] font-extrabold text-xs shadow-md transition-colors cursor-pointer"
                >
                  Authorize
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
