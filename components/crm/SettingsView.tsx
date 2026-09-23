import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Settings, Users, Shield, Database, Check, Key, Bell, Globe, Sparkles,
  Plus, X, Edit3, Trash2, Download, RefreshCw, CheckCircle2, UserPlus,
  Mail, Lock, Briefcase, Phone, AlertTriangle, ShieldCheck, ArrowRight,
  Server, HardDrive, Cpu, Terminal, Eye, EyeOff, CheckSquare,
  LayoutDashboard, UserCheck, IndianRupee, FileText, Calendar as CalendarIcon,
  BarChart3, ToggleLeft, ToggleRight, Copy
} from 'lucide-react';
import { UserRole, UserProfile, CrmModuleKey, ModulePermissions, ROLE_DEFAULT_PERMISSIONS } from '../../types/crm';
import { useCrmStore } from '../../lib/crmStore';
import { exportService } from '../../lib/exportService';
import { toast } from '../../lib/toastStore';
import { McpSettingsSection } from './McpSettingsSection';

interface SettingsViewProps {
  store: ReturnType<typeof useCrmStore>;
  onNavigate: (route: string) => void;
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

const MODULE_DEFINITIONS: { key: CrmModuleKey; label: string; desc: string; icon: any }[] = [
  { key: 'dashboard', label: 'Dashboard Overview', desc: 'Main revenue KPIs, quick action hub & performance summary', icon: LayoutDashboard },
  { key: 'leads', label: 'Leads & Deals Pipeline', desc: 'Lead generation, stages, touchpoints & deal values', icon: UserCheck },
  { key: 'clients', label: 'Clients 360°', desc: 'Client account rosters, lifetime values & active agreements', icon: Users },
  { key: 'projects', label: 'Projects & Milestones', desc: 'Project delivery tracking, milestones & development sprints', icon: Briefcase },
  { key: 'tasks', label: 'Tasks & Sprints', desc: 'Sprint board, engineering tasks, assignees & hour logs', icon: CheckSquare },
  { key: 'issues', label: 'Client QA & Tickets', desc: 'Client portal issue tracker, triage workflows & bug resolutions', icon: CheckSquare },
  { key: 'finance', label: 'Finance & P&L', desc: 'Commercial invoices, recorded payments, expenses & tax metrics', icon: IndianRupee },
  { key: 'partners', label: 'Partner Program & Affiliates', desc: 'Channel partner commissions, referral links & payout logs', icon: Globe },
  { key: 'documents', label: 'Agreements & Docs', desc: 'Commercial proposals, legal MSAs & uploaded client files', icon: FileText },
  { key: 'vault', label: 'Credentials Vault', desc: 'Encrypted production keys, database credentials & server secrets', icon: Key },
  { key: 'calendar', label: 'Operations Calendar', desc: 'Client meetings, project deadlines & follow-up schedules', icon: CalendarIcon },
  { key: 'analytics', label: 'Analytics & Reports', desc: 'Business velocity, sales conversion & performance dashboards', icon: BarChart3 },
  { key: 'audit', label: 'Security Audit Trail', desc: 'Immutable activity logs, role events & data mutation history', icon: Shield },
  { key: 'settings', label: 'Settings & RBAC', desc: 'Staff account provisioning, passwords & permission governance', icon: Settings }
];

export const SettingsView: React.FC<SettingsViewProps> = ({ store, onNavigate }) => {
  const {
    currentUser, isSupabaseConnected, teamMembers, isSyncing, refreshFromCloud,
    createTeamMember, updateTeamMember, resetStaffPassword, toggleStaffStatus,
    deleteTeamMember, updateTeamMemberRole,
    leads, clients, projects, tasks, invoices, payments, expenses, agreements, credentials,
    issues, partners, partnerReferrals, partnerPayouts
  } = store;

  const [activeSubTab, setActiveSubTab] = useState<'Team' | 'RBAC' | 'Database' | 'MCP'>('Team');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('All');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('All');

  // Modals state
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<UserProfile | null>(null);
  const [staffForPasswordReset, setStaffForPasswordReset] = useState<UserProfile | null>(null);
  const [staffToDelete, setStaffToDelete] = useState<UserProfile | null>(null);

  // Add Staff Form state
  const [newStaff, setNewStaff] = useState({
    email: '',
    fullName: '',
    phone: '',
    role: 'Developer' as UserRole,
    department: 'Engineering',
    password: '',
    isActive: true,
    useCustomPermissions: false,
    permissions: { ...ROLE_DEFAULT_PERMISSIONS['Developer'] } as ModulePermissions,
    avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${Math.random().toString(36).substring(2, 7)}`
  });

  const [showPassword, setShowPassword] = useState(false);
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);

  // Helper: Generate a strong, secure random password
  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*';
    let pass = 'Agx@';
    for (let i = 0; i < 8; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  };

  const handleApplyGeneratedPassword = () => {
    const p = generatePassword();
    setNewStaff(prev => ({ ...prev, password: p }));
    setShowPassword(true);
    toast.info('Secure Password Generated', 'Copied to password field.');
  };

  const handleApplyResetGeneratedPassword = () => {
    const p = generatePassword();
    setResetNewPassword(p);
    setShowResetPassword(true);
    toast.info('Secure Password Generated', 'Copied to new password field.');
  };

  const rolesMatrix = [
    { role: 'Super Admin', desc: 'Full unrestricted system control, user provisioning, database mutations, and system keys', access: 'All 12 Modules (Unrestricted)' },
    { role: 'Admin', desc: 'Operations oversight, team coordination, projects, and finance approvals', access: 'All Modules' },
    { role: 'Sales Manager', desc: 'Leads pipeline, deal assignments, client conversions, and revenue forecasting', access: 'Dashboard, Leads, Clients, Tasks, Documents, Calendar, Analytics' },
    { role: 'Sales Executive', desc: 'Direct lead outreach, contact logging, and quotation generation', access: 'Dashboard, Leads, Clients, Tasks, Documents, Calendar' },
    { role: 'Project Manager', desc: 'Project deliverables, milestone tracking, sprint assignments, and client briefs', access: 'Dashboard, Clients, Projects, Tasks, Documents, Vault, Calendar, Analytics' },
    { role: 'Developer', desc: 'Assigned engineering tasks, code deliveries, milestone statuses, and sprint items', access: 'Dashboard, Projects, Tasks, Calendar' },
    { role: 'Accountant', desc: 'Commercial invoices, payment reconciliations, GST compliance, and expense logs', access: 'Dashboard, Clients, Finance, Documents, Calendar, Analytics' }
  ];

  const tableStats = [
    { name: 'Leads Pipeline', count: leads.length, table: 'leads' },
    { name: 'Client Accounts', count: clients.length, table: 'clients' },
    { name: 'Active Projects', count: projects.length, table: 'projects' },
    { name: 'Sprint Tasks', count: tasks.length, table: 'tasks' },
    { name: 'Client QA Issues', count: issues.length, table: 'project_issues' },
    { name: 'Commercial Invoices', count: invoices.length, table: 'invoices' },
    { name: 'Recorded Payments', count: payments.length, table: 'payments' },
    { name: 'Expense Logs', count: expenses.length, table: 'expenses' },
    { name: 'Channel Partners', count: partners.length, table: 'partners' },
    { name: 'Partner Referrals', count: partnerReferrals.length, table: 'partner_referrals' },
    { name: 'Partner Payouts', count: partnerPayouts.length, table: 'partner_payouts' },
    { name: 'Legal Agreements', count: agreements.length, table: 'agreements' },
    { name: 'Encrypted Vault', count: credentials.length, table: 'credentials_vault' },
    { name: 'Staff Profiles', count: teamMembers.length, table: 'profiles' }
  ];

  // Settings & Governance KPIs
  const governanceMetrics = useMemo(() => {
    const totalStaff = teamMembers.length;
    const activeStaff = teamMembers.filter(u => u.isActive !== false).length;
    const superAdmins = teamMembers.filter(u => u.role === 'Super Admin').length;
    const totalTables = tableStats.length;
    const totalRows = tableStats.reduce((s, t) => s + t.count, 0);

    return {
      totalStaff,
      activeStaff,
      superAdmins,
      totalTables,
      totalRows
    };
  }, [teamMembers, tableStats]);

  // Filtered staff list
  const filteredStaff = useMemo(() => {
    return teamMembers.filter(u => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone && u.phone.toLowerCase().includes(q)) ||
        (u.department && u.department.toLowerCase().includes(q));

      const matchesRole = selectedRoleFilter === 'All' || u.role === selectedRoleFilter;
      const matchesDept = selectedDeptFilter === 'All' || u.department === selectedDeptFilter;

      return matchesSearch && matchesRole && matchesDept;
    });
  }, [teamMembers, searchQuery, selectedRoleFilter, selectedDeptFilter]);

  // Action Handlers
  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.fullName.trim() || !newStaff.email.trim()) {
      toast.error('Validation Error', 'Please provide full name and work email.');
      return;
    }

    if (newStaff.password && newStaff.password.length < 6) {
      toast.error('Weak Password', 'Password must be at least 6 characters.');
      return;
    }

    const defaultPass = newStaff.password.trim() || 'agx@2026';
    const effectivePermissions = newStaff.useCustomPermissions
      ? newStaff.permissions
      : { ...ROLE_DEFAULT_PERMISSIONS[newStaff.role] };

    createTeamMember({
      fullName: newStaff.fullName.trim(),
      email: newStaff.email.trim().toLowerCase(),
      phone: newStaff.phone.trim() || undefined,
      role: newStaff.role,
      department: newStaff.department,
      passwordHash: defaultPass,
      isActive: newStaff.isActive,
      permissions: effectivePermissions,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(newStaff.fullName)}`
    });

    setIsAddUserModalOpen(false);
    setNewStaff({
      email: '',
      fullName: '',
      phone: '',
      role: 'Developer',
      department: 'Engineering',
      password: '',
      isActive: true,
      useCustomPermissions: false,
      permissions: { ...ROLE_DEFAULT_PERMISSIONS['Developer'] },
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${Math.random().toString(36).substring(2, 7)}`
    });
    toast.success('Staff Account Provisioned', `${newStaff.fullName} can now log in with their credentials.`);
  };

  const handleSaveEditStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;

    updateTeamMember(editingStaff.id, editingStaff);
    setEditingStaff(null);
    toast.success('Staff Profile Updated', `${editingStaff.fullName} permissions and details saved.`);
  };

  const handleExecuteResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForPasswordReset) return;
    if (!resetNewPassword.trim() || resetNewPassword.trim().length < 6) {
      toast.error('Validation Error', 'Password must be at least 6 characters.');
      return;
    }

    resetStaffPassword(staffForPasswordReset.id, resetNewPassword.trim());
    setStaffForPasswordReset(null);
    setResetNewPassword('');
  };

  const handleConfirmDeleteStaff = () => {
    if (!staffToDelete) return;
    deleteTeamMember(staffToDelete.id);
    setStaffToDelete(null);
    toast.success('Staff Removed', 'Staff account deleted from Supabase.');
  };

  const handleExportTeamCsv = () => {
    exportService.exportToCsv('agx_staff_directory', teamMembers.map(u => ({
      ID: u.id,
      FullName: u.fullName,
      Email: u.email,
      Phone: u.phone || 'N/A',
      Role: u.role,
      Department: u.department,
      Status: u.isActive !== false ? 'Active' : 'Suspended',
      CustomPermissions: u.permissions ? JSON.stringify(u.permissions) : 'Role Defaults',
      LastActive: u.lastActiveAt || 'Active'
    })));
    toast.success('Staff Directory Exported', 'CSV roster downloaded.');
  };

  const handleSyncCloud = async () => {
    await refreshFromCloud();
    toast.success('Database Synced', 'Refreshed all live schemas from Supabase Cloud.');
  };

  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case 'Super Admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Admin': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Sales Manager': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Sales Executive': return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'Project Manager': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Developer': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Accountant': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const calculateEffectivePermissionCount = (profile: UserProfile): number => {
    if (profile.role === 'Super Admin') return 14;
    const perms = profile.permissions && Object.keys(profile.permissions).length > 0
      ? profile.permissions
      : ROLE_DEFAULT_PERMISSIONS[profile.role] || {};
    return Object.values(perms).filter(Boolean).length;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            Staff Management & Access Control
          </h2>
          <p className="text-xs text-gray-500">
            Create staff accounts, configure passwords, assign granular module permissions, and manage live Supabase PostgreSQL RBAC.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleExportTeamCsv}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer shadow-xs"
          >
            <Download size={14} /> Export Staff CSV
          </button>
          <button
            onClick={() => setIsAddUserModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black text-xs font-black shadow-md cursor-pointer transition-transform active:scale-95"
          >
            <Plus size={16} /> Add Staff Member
          </button>
        </div>
      </div>

      {/* Row 1: Governance KPIs with Double-Bezel Architecture */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="double-bezel-outer card-tactile">
          <div className="double-bezel-inner p-5 flex items-start justify-between">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Provisioned Staff</span>
              <span className="text-2xl font-black text-gray-900 mt-1 block tabular-nums">
                {governanceMetrics.totalStaff} Team Members
              </span>
              <span className="text-xs text-indigo-600 font-bold flex items-center gap-1 mt-1 tabular-nums">
                <Users size={13} /> {governanceMetrics.activeStaff} Active ({governanceMetrics.superAdmins} Super Admins)
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shadow-xs">
              <Users size={18} />
            </div>
          </div>
        </div>

        <div className="double-bezel-outer card-tactile">
          <div className="double-bezel-inner p-5 flex items-start justify-between">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">RBAC Governance</span>
              <span className="text-2xl font-black text-emerald-600 mt-1 block tabular-nums">
                7 Access Tiers
              </span>
              <span className="text-xs text-emerald-700 font-bold flex items-center gap-1 mt-1 tabular-nums">
                <Shield size={13} /> 12 Modular Permissions
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-xs">
              <Shield size={18} />
            </div>
          </div>
        </div>

        <div className="double-bezel-outer card-tactile">
          <div className="double-bezel-inner p-5 flex items-start justify-between">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Supabase Schemas</span>
              <span className="text-2xl font-black text-purple-600 mt-1 block tabular-nums">
                {governanceMetrics.totalTables} Tables
              </span>
              <span className="text-xs text-purple-700 font-bold flex items-center gap-1 mt-1 tabular-nums">
                <Database size={13} /> {governanceMetrics.totalRows} Managed Records
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold shadow-xs">
              <Database size={18} />
            </div>
          </div>
        </div>

        <div className="double-bezel-outer card-tactile">
          <div className="double-bezel-inner p-5 flex items-start justify-between">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Current Session</span>
              <span className="text-2xl font-black text-gray-900 mt-1 block truncate max-w-[170px]">
                {currentUser?.role || 'Super Admin'}
              </span>
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 mt-1">
                <CheckCircle2 size={13} /> Logged in as {currentUser?.fullName?.split(' ')[0] || 'User'}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-lime-50 text-lime-800 flex items-center justify-center font-bold shadow-xs">
              <ShieldCheck size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Navigation Sub-Tabs & View Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
          {(['Team', 'RBAC', 'Database', 'MCP'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeSubTab === tab ? 'bg-black text-white shadow-xs' : 'text-gray-500 hover:text-black'
              }`}
            >
              {tab === 'Team' ? `Staff & Team (${teamMembers.length})` : 
               tab === 'RBAC' ? 'Role Permissions Matrix' : 
               tab === 'Database' ? 'Supabase Infrastructure' : 
               'AI & MCP Connectors'}
              {tab === 'MCP' && (
                <span className="w-2 h-2 rounded-full bg-[#CCFF00] inline-block animate-pulse" />
              )}
            </button>
          ))}
        </div>

        {activeSubTab === 'Team' && (
          <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl self-end sm:self-auto">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                viewMode === 'table' ? 'bg-white text-black shadow-xs' : 'text-gray-500 hover:text-black'
              }`}
            >
              Table List
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                viewMode === 'grid' ? 'bg-white text-black shadow-xs' : 'text-gray-500 hover:text-black'
              }`}
            >
              Grid Cards
            </button>
          </div>
        )}
      </div>

      {/* 1. Staff & Team Tab */}
      {activeSubTab === 'Team' && (
        <div className="space-y-4">
          {/* Active Logged-in Staff Banner */}
          <div className="p-4 bg-lime-50 border border-lime-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-lime-900 shadow-xs">
            <div className="flex items-center gap-3">
              <img
                src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={currentUser?.fullName || 'User'}
                className="w-10 h-10 rounded-full object-cover border border-lime-300 shadow-xs"
              />
              <div>
                <span className="text-[10px] text-lime-700 uppercase font-bold tracking-wider block">Active Session</span>
                <strong className="text-sm font-black text-gray-900">{currentUser?.fullName}</strong>
                <span className="text-gray-500 text-xs ml-2">({currentUser?.email})</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getRoleBadgeStyle(currentUser?.role || 'Super Admin')}`}>
                {currentUser?.role || 'Super Admin'}
              </span>
              <span className="font-mono text-[10px] bg-lime-200/80 text-lime-900 px-2.5 py-1 rounded-full font-bold">
                {currentUser?.department || 'Executive'}
              </span>
            </div>
          </div>

          {/* Search & Filters Bar */}
          <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-3 text-xs">
            <div className="relative flex-1 w-full">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search staff by name, email, phone, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:border-black"
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={selectedRoleFilter}
                onChange={(e) => setSelectedRoleFilter(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none cursor-pointer focus:border-black"
              >
                <option value="All">All Roles ({teamMembers.length})</option>
                {ALL_ROLES.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <select
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none cursor-pointer focus:border-black"
              >
                <option value="All">All Departments</option>
                <option value="Executive">Executive</option>
                <option value="Engineering">Engineering</option>
                <option value="Sales & Growth">Sales & Growth</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
              </select>
            </div>
          </div>

          {/* TABLE LIST VIEW (Default) */}
          {viewMode === 'table' && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3.5 px-5">Staff Member</th>
                      <th className="py-3.5 px-4">System Role</th>
                      <th className="py-3.5 px-4">Department</th>
                      <th className="py-3.5 px-4">Module Access</th>
                      <th className="py-3.5 px-4">Account Status</th>
                      <th className="py-3.5 px-4">Password</th>
                      <th className="py-3.5 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {filteredStaff.map((staff) => {
                      const permCount = calculateEffectivePermissionCount(staff);
                      const isSelf = currentUser?.id === staff.id;
                      return (
                        <tr key={staff.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-3">
                              <img
                                src={staff.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(staff.fullName)}`}
                                alt={staff.fullName}
                                className="w-9 h-9 rounded-full object-cover border border-gray-200 shrink-0"
                              />
                              <div>
                                <span className="font-bold text-gray-900 block text-xs">{staff.fullName}</span>
                                <span className="text-gray-400 text-[11px] block">{staff.email}</span>
                                {staff.phone && <span className="text-gray-400 text-[10px] block">{staff.phone}</span>}
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-1 rounded-lg font-bold text-[11px] border ${getRoleBadgeStyle(staff.role)}`}>
                              {staff.role}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 font-semibold text-gray-600">
                            {staff.department || 'General'}
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="font-bold text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md inline-flex items-center gap-1">
                              <Shield size={12} />
                              {staff.role === 'Super Admin' ? 'Full Access (12/12)' : `${permCount}/12 Modules`}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => toggleStaffStatus(staff.id)}
                              disabled={isSelf}
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 transition-colors ${
                                staff.isActive !== false
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                              } ${isSelf ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                              title={isSelf ? 'Cannot deactivate your own active session' : 'Click to toggle status'}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${staff.isActive !== false ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                              {staff.isActive !== false ? 'Active' : 'Suspended'}
                            </button>
                          </td>

                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => {
                                setStaffForPasswordReset(staff);
                                setResetNewPassword('');
                              }}
                              className="text-xs font-bold text-gray-600 hover:text-black flex items-center gap-1 px-2.5 py-1 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 cursor-pointer"
                              title="Reset Password"
                            >
                              <Key size={12} className="text-amber-500" /> Reset
                            </button>
                          </td>

                          <td className="py-3.5 px-5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setEditingStaff(staff)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                                title="Edit Profile & Permissions"
                              >
                                <Edit3 size={15} />
                              </button>
                              <button
                                onClick={() => setStaffToDelete(staff)}
                                disabled={isSelf}
                                className={`p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ${
                                  isSelf ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
                                }`}
                                title={isSelf ? 'Cannot delete current user' : 'Delete Staff Account'}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* GRID CARDS VIEW */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredStaff.map((staff) => {
                const permCount = calculateEffectivePermissionCount(staff);
                const isSelf = currentUser?.id === staff.id;
                return (
                  <div
                    key={staff.id}
                    className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between hover:border-gray-200 transition-all"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={staff.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(staff.fullName)}`}
                            alt={staff.fullName}
                            className="w-12 h-12 rounded-2xl object-cover border border-gray-100 shadow-xs shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-sm text-gray-900 truncate">{staff.fullName}</h4>
                            <span className="text-xs text-gray-400 truncate block">{staff.email}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => setEditingStaff(staff)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                            title="Edit Staff"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => setStaffToDelete(staff)}
                            disabled={isSelf}
                            className={`p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ${
                              isSelf ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
                            }`}
                            title="Delete Staff"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2.5 py-3 border-t border-gray-100 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Department:</span>
                          <span className="font-semibold text-gray-700 bg-gray-100 px-2.5 py-0.5 rounded-md">
                            {staff.department || 'General'}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">System Role:</span>
                          <span className={`font-bold px-2 py-0.5 rounded-md border text-xs ${getRoleBadgeStyle(staff.role)}`}>
                            {staff.role}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Permissions:</span>
                          <span className="font-bold text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md">
                            {staff.role === 'Super Admin' ? 'Full Access (14/14)' : `${permCount}/14 Modules`}
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-[11px] pt-1">
                          <span className="text-gray-400">Status:</span>
                          <span className={`flex items-center gap-1 font-bold ${staff.isActive !== false ? 'text-emerald-600' : 'text-rose-600'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${staff.isActive !== false ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            {staff.isActive !== false ? 'Active' : 'Suspended'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-[11px] text-gray-400">
                      <button
                        onClick={() => {
                          setStaffForPasswordReset(staff);
                          setResetNewPassword('');
                        }}
                        className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Key size={12} /> Reset Password
                      </button>
                      <span
                        className="text-gray-900 font-bold cursor-pointer hover:underline"
                        onClick={() => setEditingStaff(staff)}
                      >
                        Manage Permissions →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. RBAC Permissions Matrix Tab */}
      {activeSubTab === 'RBAC' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-extrabold text-base text-gray-900">Role-Based Access Control (RBAC) Matrix</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Permissions are strictly enforced on client views, navigation routes, and database mutations.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">System Role</th>
                  <th className="py-3.5 px-4">Primary Scope & Objective</th>
                  <th className="py-3.5 px-5">Authorized Modules</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {rolesMatrix.map((r, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-4 px-5">
                      <span className={`px-2.5 py-1 rounded-lg font-black text-xs border ${getRoleBadgeStyle(r.role as UserRole)}`}>
                        {r.role}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-600 leading-relaxed max-w-sm">{r.desc}</td>
                    <td className="py-4 px-5">
                      <span className="font-semibold text-gray-900 bg-gray-100 px-2.5 py-1 rounded-lg">
                        {r.access}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Database Cloud Infrastructure Tab */}
      {activeSubTab === 'Database' && (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Database size={22} />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-gray-900">Supabase Cloud PostgreSQL</h3>
                <span className="text-xs text-gray-400 font-mono">Project ID: lgvqkumqjmeyycqvgycv</span>
              </div>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Connected & Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <span className="text-gray-400 block mb-1 font-bold">Database Engine</span>
              <strong className="text-gray-900 text-sm">PostgreSQL 17.6 (Supabase Cloud)</strong>
            </div>
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <span className="text-gray-400 block mb-1 font-bold">Region</span>
              <strong className="text-gray-900 text-sm">ap-southeast-1 (Singapore)</strong>
            </div>
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <span className="text-gray-400 block mb-1 font-bold">Storage Buckets</span>
              <strong className="text-emerald-700 text-sm">4 Active Buckets</strong>
            </div>
          </div>

          {/* Real-time Table Metrics */}
          <div>
            <h4 className="font-bold text-sm text-gray-900 mb-3 flex items-center gap-2">
              <span>Operational Schema & Active Records</span>
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
              {tableStats.map((stat, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                  <span className="text-gray-400 block text-[10px] truncate">{stat.table}</span>
                  <span className="font-bold text-gray-900 text-xs block truncate">{stat.name}</span>
                  <strong className="text-base font-extrabold text-indigo-600 mt-1 block">{stat.count} rows</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. MCP & AI Connectors Tab */}
      {activeSubTab === 'MCP' && (
        <McpSettingsSection store={store} />
      )}

      {/* ================= MODALS ================= */}

      {/* 1. Add Staff Member Modal */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#CCFF00] text-black flex items-center justify-center font-bold shadow-xs">
                  <UserPlus size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-gray-900">Add New Staff Member</h3>
                  <span className="text-xs text-gray-400">Configure credentials, role, and granular module permissions</span>
                </div>
              </div>
              <button onClick={() => setIsAddUserModalOpen(false)} className="p-1 text-gray-400 hover:text-black cursor-pointer"><X size={18} /></button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-4 text-xs">
              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newStaff.fullName}
                    onChange={(e) => setNewStaff({ ...newStaff, fullName: e.target.value })}
                    placeholder="e.g. Rahul Verma"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Work Email Address *</label>
                  <input
                    type="email"
                    required
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                    placeholder="rahul@agxperience.com"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">System Role *</label>
                  <select
                    value={newStaff.role}
                    onChange={(e) => {
                      const newRole = e.target.value as UserRole;
                      setNewStaff({
                        ...newStaff,
                        role: newRole,
                        permissions: { ...ROLE_DEFAULT_PERMISSIONS[newRole] }
                      });
                    }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none cursor-pointer focus:border-black font-semibold"
                  >
                    {ALL_ROLES.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Department</label>
                  <select
                    value={newStaff.department}
                    onChange={(e) => setNewStaff({ ...newStaff, department: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none cursor-pointer focus:border-black font-semibold"
                  >
                    <option value="Executive">Executive</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Sales & Growth">Sales & Growth</option>
                    <option value="Finance">Finance</option>
                    <option value="Operations">Operations</option>
                    <option value="Product & Design">Product & Design</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={newStaff.phone}
                    onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  />
                </div>
              </div>

              {/* Password Section */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-gray-800 flex items-center gap-1.5">
                    <Lock size={14} className="text-amber-500" /> Account Password
                  </label>
                  <button
                    type="button"
                    onClick={handleApplyGeneratedPassword}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles size={12} /> Auto-Generate Secure
                  </button>
                </div>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newStaff.password}
                    onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                    placeholder="Enter password (default: agx@2026)"
                    className="w-full bg-white border border-gray-200 rounded-xl pl-3 pr-10 py-2.5 text-xs outline-none focus:border-black font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-gray-400 hover:text-black cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <span className="text-[10px] text-gray-400 block">
                  Staff member will use their work email and this password to log in via the AGX Command Center.
                </span>
              </div>

              {/* Granular Permissions Matrix */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block font-bold text-gray-800 flex items-center gap-1.5">
                      <Shield size={14} className="text-emerald-600" /> Module Access Permissions
                    </label>
                    <span className="text-[10px] text-gray-400">Control which pages and business modules this staff member can access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-gray-500">
                      {newStaff.useCustomPermissions ? 'Custom Overrides' : `Default (${newStaff.role})`}
                    </span>
                    <button
                      type="button"
                      onClick={() => setNewStaff(prev => ({
                        ...prev,
                        useCustomPermissions: !prev.useCustomPermissions,
                        permissions: { ...ROLE_DEFAULT_PERMISSIONS[prev.role] }
                      }))}
                      className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                    >
                      {newStaff.useCustomPermissions ? 'Reset to Role Defaults' : 'Customize Permissions'}
                    </button>
                  </div>
                </div>

                {newStaff.useCustomPermissions && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-gray-200/60">
                    {MODULE_DEFINITIONS.map(mod => {
                      const Icon = mod.icon;
                      const isChecked = Boolean(newStaff.permissions[mod.key]);
                      return (
                        <label
                          key={mod.key}
                          className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                            isChecked
                              ? 'bg-white border-indigo-200 shadow-xs'
                              : 'bg-gray-100/70 border-transparent opacity-60'
                          }`}
                        >
                          <div className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out mt-0.5 ${isChecked ? 'bg-[#CCFF00]' : 'bg-gray-300'}`}>
                            <span className={`pointer-events-none inline-block h-3 w-3 transform rounded-full shadow-sm ring-0 transition duration-200 ease-in-out ${isChecked ? 'translate-x-3 bg-black' : 'translate-x-0 bg-white'}`} />
                          </div>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              setNewStaff(prev => ({
                                ...prev,
                                permissions: {
                                  ...prev.permissions,
                                  [mod.key]: e.target.checked
                                }
                              }));
                            }}
                            className="sr-only"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-gray-900 flex items-center gap-1 text-[11px]">
                              <Icon size={12} className="text-indigo-600 shrink-0" />
                              {mod.label}
                            </span>
                            <span className="text-[10px] text-gray-500 leading-tight block mt-0.5">
                              {mod.desc}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddUserModalOpen(false)} className="px-4 py-2.5 rounded-xl border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-black shadow-md cursor-pointer">Provision Staff Account</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* 2. Edit Staff & Permissions Modal */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shadow-xs">
                  <Edit3 size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-gray-900">Manage Staff & Permissions</h3>
                  <span className="text-xs text-gray-400">Edit {editingStaff.fullName} ({editingStaff.email})</span>
                </div>
              </div>
              <button onClick={() => setEditingStaff(null)} className="p-1 text-gray-400 hover:text-black cursor-pointer"><X size={18} /></button>
            </div>

            <form onSubmit={handleSaveEditStaff} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editingStaff.fullName}
                    onChange={(e) => setEditingStaff({ ...editingStaff, fullName: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={editingStaff.email}
                    onChange={(e) => setEditingStaff({ ...editingStaff, email: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Role</label>
                  <select
                    value={editingStaff.role}
                    onChange={(e) => {
                      const newRole = e.target.value as UserRole;
                      setEditingStaff({
                        ...editingStaff,
                        role: newRole,
                        permissions: { ...ROLE_DEFAULT_PERMISSIONS[newRole] }
                      });
                    }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none cursor-pointer focus:border-black font-semibold"
                  >
                    {ALL_ROLES.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={editingStaff.department || ''}
                    onChange={(e) => setEditingStaff({ ...editingStaff, department: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={editingStaff.phone || ''}
                    onChange={(e) => setEditingStaff({ ...editingStaff, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black font-semibold"
                  />
                </div>
              </div>

              {/* Status Toggle */}
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-gray-900 block text-xs">Account Status</span>
                  <span className="text-[10px] text-gray-400">Suspended staff members cannot log in</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingStaff({ ...editingStaff, isActive: !editingStaff.isActive })}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                    editingStaff.isActive !== false
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${editingStaff.isActive !== false ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  {editingStaff.isActive !== false ? 'Active Account' : 'Suspended Account'}
                </button>
              </div>

              {/* Granular Permissions Editor */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-gray-800 flex items-center gap-1.5">
                    <Shield size={14} className="text-emerald-600" /> Module Access Permissions
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingStaff({
                        ...editingStaff,
                        permissions: { ...ROLE_DEFAULT_PERMISSIONS[editingStaff.role] }
                      });
                      toast.info('Permissions Reset', `Restored defaults for ${editingStaff.role}`);
                    }}
                    className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
                  >
                    Reset to {editingStaff.role} Defaults
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-gray-200/60">
                  {MODULE_DEFINITIONS.map(mod => {
                    const Icon = mod.icon;
                    const isChecked = editingStaff.role === 'Super Admin' ||
                      (editingStaff.permissions && typeof editingStaff.permissions[mod.key] === 'boolean'
                        ? Boolean(editingStaff.permissions[mod.key])
                        : Boolean(ROLE_DEFAULT_PERMISSIONS[editingStaff.role]?.[mod.key]));

                    return (
                      <label
                        key={mod.key}
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-white border-indigo-200 shadow-xs'
                            : 'bg-gray-100/70 border-transparent opacity-60'
                        }`}
                      >
                        <div className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out mt-0.5 ${isChecked ? 'bg-[#CCFF00]' : 'bg-gray-300'} ${editingStaff.role === 'Super Admin' ? 'opacity-50 cursor-not-allowed' : ''}`}>
                          <span className={`pointer-events-none inline-block h-3 w-3 transform rounded-full shadow-sm ring-0 transition duration-200 ease-in-out ${isChecked ? 'translate-x-3 bg-black' : 'translate-x-0 bg-white'}`} />
                        </div>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={editingStaff.role === 'Super Admin'}
                          onChange={(e) => {
                            setEditingStaff({
                              ...editingStaff,
                              permissions: {
                                ...(editingStaff.permissions || ROLE_DEFAULT_PERMISSIONS[editingStaff.role]),
                                [mod.key]: e.target.checked
                              }
                            });
                          }}
                          className="sr-only"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="font-bold text-gray-900 flex items-center gap-1 text-[11px]">
                            <Icon size={12} className="text-indigo-600 shrink-0" />
                            {mod.label}
                          </span>
                          <span className="text-[10px] text-gray-500 leading-tight block mt-0.5">
                            {mod.desc}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setStaffForPasswordReset(editingStaff);
                    setEditingStaff(null);
                  }}
                  className="text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Key size={14} /> Reset Password
                </button>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setEditingStaff(null)} className="px-4 py-2.5 rounded-xl border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer">Cancel</button>
                  <button type="submit" className="px-5 py-2.5 rounded-xl bg-black text-white font-bold shadow-md cursor-pointer">Save Changes</button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* 3. Reset Password Modal */}
      {staffForPasswordReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shadow-xs">
                  <Key size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-gray-900">Reset Staff Password</h3>
                  <span className="text-xs text-gray-400">For {staffForPasswordReset.fullName}</span>
                </div>
              </div>
              <button onClick={() => setStaffForPasswordReset(null)} className="p-1 text-gray-400 hover:text-black cursor-pointer"><X size={18} /></button>
            </div>

            <form onSubmit={handleExecuteResetPassword} className="space-y-4 text-xs">
              <div>
                <span className="text-gray-500 block mb-1">Work Email:</span>
                <strong className="text-gray-900 font-mono block bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                  {staffForPasswordReset.email}
                </strong>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-gray-700">New Password *</label>
                  <button
                    type="button"
                    onClick={handleApplyResetGeneratedPassword}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles size={12} /> Auto-Generate
                  </button>
                </div>
                <div className="relative flex items-center">
                  <input
                    type={showResetPassword ? 'text' : 'password'}
                    required
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                    placeholder="Enter new password (min 6 characters)"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-3 pr-10 py-2.5 text-xs outline-none focus:border-black font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    className="absolute right-3 text-gray-400 hover:text-black cursor-pointer"
                  >
                    {showResetPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button type="button" onClick={() => setStaffForPasswordReset(null)} className="px-4 py-2.5 rounded-xl border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-black text-white font-bold shadow-md cursor-pointer">Update Password</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* 4. Delete Confirmation Modal */}
      {staffToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="font-extrabold text-lg text-gray-900 mb-2">Remove Staff Member?</h3>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              Are you sure you want to remove <strong>{staffToDelete.fullName}</strong> ({staffToDelete.email})? This staff account and role permissions will be removed from Supabase.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setStaffToDelete(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 font-bold text-xs text-gray-600 hover:bg-gray-50 cursor-pointer">Cancel</button>
              <button onClick={handleConfirmDeleteStaff} className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md cursor-pointer">Confirm Remove</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
