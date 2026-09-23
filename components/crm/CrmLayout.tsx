import React, { useState, useEffect, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, UserCheck, Users, Briefcase, CheckSquare, IndianRupee,
  FileText, Key, Calendar as CalendarIcon, BarChart3, Shield, Settings,
  Search, Bell, Plus, ArrowUpRight, LogOut, Globe, Sparkles, X, Check,
  RefreshCw, Database, UserPlus, Lock, AlertOctagon, Layers, Handshake
} from 'lucide-react';
import { useCrmStore } from '../../lib/crmStore';
import { authService } from '../../lib/authService';
import { DashboardView } from './DashboardView';
import { GlobalSearchModal } from './GlobalSearchModal';
import { ToastNotification } from './ToastNotification';
import { AuthModal } from './AuthModal';
import { UserRole, CrmModuleKey } from '../../types/crm';

// Code-split heavy views to optimize bundle performance
const LeadsView = lazy(() => import('./LeadsView').then(m => ({ default: m.LeadsView })));
const ClientsView = lazy(() => import('./ClientsView').then(m => ({ default: m.ClientsView })));
const ProjectsView = lazy(() => import('./ProjectsView').then(m => ({ default: m.ProjectsView })));
const TasksView = lazy(() => import('./TasksView').then(m => ({ default: m.TasksView })));
const IssuesView = lazy(() => import('./IssuesView').then(m => ({ default: m.IssuesView })));
const FinanceView = lazy(() => import('./FinanceView').then(m => ({ default: m.FinanceView })));
const PartnersView = lazy(() => import('./PartnersView').then(m => ({ default: m.PartnersView })));
const DocumentsView = lazy(() => import('./DocumentsView').then(m => ({ default: m.DocumentsView })));
const CredentialsVaultView = lazy(() => import('./CredentialsVaultView').then(m => ({ default: m.CredentialsVaultView })));
const CalendarView = lazy(() => import('./CalendarView').then(m => ({ default: m.CalendarView })));
const AnalyticsView = lazy(() => import('./AnalyticsView').then(m => ({ default: m.AnalyticsView })));
const AuditLogsView = lazy(() => import('./AuditLogsView').then(m => ({ default: m.AuditLogsView })));
const SettingsView = lazy(() => import('./SettingsView').then(m => ({ default: m.SettingsView })));

const ViewLoadingSkeleton = () => (
  <div className="w-full h-96 flex flex-col items-center justify-center gap-3">
    <div className="w-7 h-7 border-2 border-black border-t-[#CCFF00] rounded-full animate-spin" />
    <span className="text-xs font-mono text-gray-500 tracking-wide uppercase">Loading module...</span>
  </div>
);

interface CrmLayoutProps {
  onLogout: () => void;
  onBackToWebsite: () => void;
}

export const CrmLayout: React.FC<CrmLayoutProps> = ({ onLogout, onBackToWebsite }) => {
  const store = useCrmStore();
  const {
    currentUser, switchRole, notifications, markNotificationAsRead,
    markAllNotificationsRead, leads, clients, projects, tasks, invoices, credentials, issues,
    isSupabaseConnected, isSyncing, lastSyncedAt, refreshFromCloud, logoutUser
  } = store;

  const [activeRoute, setActiveRoute] = useState<string>('dashboard');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);

  // Global Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const unreadNotifsCount = notifications.filter(n => !n.isRead).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'leads', label: 'Leads & Deals', icon: UserCheck, count: leads.filter(l => l.status === 'NEW').length },
    { id: 'clients', label: 'Clients 360°', icon: Users },
    { id: 'projects', label: 'Projects', icon: Briefcase, count: projects.filter(p => p.status === 'IN PROGRESS').length },
    { id: 'tasks', label: 'Tasks & Sprints', icon: CheckSquare, count: tasks.filter(t => t.status === 'IN PROGRESS').length },
    { id: 'issues', label: 'Client Issues & QA', icon: AlertOctagon, count: issues.filter(i => i.status === 'REPORTED').length },
    { id: 'finance', label: 'Finance & P&L', icon: IndianRupee },
    { id: 'partners', label: 'AGX Partners', icon: Handshake, count: store.partners.filter(p => p.status === 'Active').length },
    { id: 'documents', label: 'Agreements & Docs', icon: FileText },
    { id: 'vault', label: 'Credentials Vault', icon: Key },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'audit', label: 'Audit Trail', icon: Shield },
    { id: 'settings', label: 'Settings & RBAC', icon: Settings },
  ];

  // Dynamic RBAC Filtered Navigation Items
  const permittedNavItems = navItems.filter(item => store.hasPermission(item.id as CrmModuleKey));

  const [selectedEntityId, setSelectedEntityId] = useState<string | undefined>(undefined);

  const handleNavigate = (route: string, entityId?: string) => {
    setActiveRoute(route);
    setSelectedEntityId(entityId);
  };

  const handleQuickCreate = (type: 'lead' | 'client' | 'project' | 'task' | 'invoice' | 'quotation' | 'event') => {
    if (type === 'lead') { setActiveRoute('leads'); setSelectedEntityId('new'); }
    else if (type === 'client') { setActiveRoute('clients'); setSelectedEntityId('new'); }
    else if (type === 'project') { setActiveRoute('projects'); setSelectedEntityId('new'); }
    else if (type === 'task') { setActiveRoute('tasks'); setSelectedEntityId('new'); }
    else if (type === 'invoice') { setActiveRoute('finance'); setSelectedEntityId('new'); }
    else if (type === 'quotation') { setActiveRoute('finance'); setSelectedEntityId('new-quotation'); }
    else if (type === 'event') { setActiveRoute('calendar'); setSelectedEntityId('new'); }
  };

  const handleSignOut = async () => {
    await authService.signOut();
    logoutUser();
    onLogout();
  };

  return (
    <div className="crm-theme min-h-screen bg-[#F4F3F9] text-gray-900 flex antialiased overflow-x-hidden relative">
      {/* Realtime Toast Notifications */}
      <ToastNotification />

      {/* Auth & Login Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginUser={store.loginUser}
      />

      {/* 1. Left Dark Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-[#0C0F17] via-[#090C12] to-[#06080D] border-r border-white/[0.08] text-white flex-shrink-0 flex flex-col justify-between p-4 hidden md:flex z-30 shadow-2xl">
        <div>
          {/* Top Logo */}
          <div
            onClick={() => handleNavigate('dashboard')}
            className="flex items-center gap-3 px-3 py-4 cursor-pointer hover:opacity-90 transition-opacity mb-4 group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#CCFF00] text-black font-black italic flex items-center justify-center text-lg shadow-[0_0_15px_rgba(204,255,0,0.3)] group-hover:scale-105 transition-transform">
              A
            </div>
            <div>
              <span className="text-xl font-black italic tracking-tighter text-white block leading-none">
                AG<span className="text-[#CCFF00]">X</span>
              </span>
              <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest block mt-0.5">
                Business OS
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {permittedNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeRoute === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer relative btn-press ${
                    isActive
                      ? 'bg-white/[0.12] text-white shadow-inner border border-white/10'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#CCFF00] rounded-r-full shadow-[0_0_10px_#CCFF00]" />
                  )}
                  <div className="flex items-center gap-3">
                    <Icon size={16} className={isActive ? 'text-[#CCFF00]' : 'text-gray-400'} />
                    <span className={isActive ? 'text-white font-extrabold' : 'font-medium'}>{item.label}</span>
                  </div>
                  {item.count !== undefined && item.count > 0 && (
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-[#CCFF00] text-black font-black' : 'bg-white/10 text-white'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          {/* Cloud Sync Status */}
          <div className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-2xl border border-white/5 text-[11px]">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isSupabaseConnected ? 'bg-[#CCFF00] animate-pulse shadow-[0_0_6px_#CCFF00]' : 'bg-amber-400'}`} />
              <span className="text-gray-300 font-medium">Supabase Cloud</span>
            </div>
            <button
              onClick={() => refreshFromCloud()}
              className="text-gray-400 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer btn-press"
              title="Sync latest data"
            >
              <RefreshCw size={12} className={isSyncing ? 'animate-spin text-[#CCFF00]' : ''} />
            </button>
          </div>

          {/* Back to Website */}
          <button
            onClick={onBackToWebsite}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer btn-press"
          >
            <div className="flex items-center gap-2">
              <Globe size={15} />
              <span>Back to Website</span>
            </div>
            <ArrowUpRight size={14} />
          </button>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Floating Glass Island Top Header */}
        <div className="px-4 sm:px-6 pt-3 pb-1 z-20 sticky top-0">
          <header className="glass-island h-14 rounded-2xl px-4 sm:px-5 flex items-center justify-between">
            {/* Search Trigger */}
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="w-full flex items-center justify-between bg-gray-100/70 hover:bg-gray-100 text-gray-500 px-3.5 py-1.5 rounded-xl text-xs transition-colors border border-gray-200/50 cursor-pointer btn-press"
              >
                <div className="flex items-center gap-2">
                  <Search size={14} className="text-gray-400" />
                  <span className="text-gray-400 font-medium">Search leads, clients, invoices, keys...</span>
                </div>
                <kbd className="hidden sm:inline-block bg-white text-gray-600 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded border border-gray-200 shadow-2xs">
                  Ctrl K
                </kbd>
              </button>
            </div>

            {/* Right Header Actions */}
            <div className="flex items-center gap-2.5">
              {/* Quick Auth Switcher / Sign In button */}
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100/80 hover:bg-gray-200/80 text-gray-800 font-bold text-xs cursor-pointer transition-colors btn-press"
              >
                <Lock size={12} className="text-[#CCFF00] bg-black p-0.5 rounded" />
                <span>Auth Session</span>
              </button>

              {/* Quick Actions Button with nested icon */}
              <div className="relative hidden sm:block">
                <button
                  onClick={() => handleQuickCreate('lead')}
                  className="flex items-center gap-2 pl-3.5 pr-2 py-1.5 rounded-full bg-black hover:bg-gray-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer btn-press group"
                >
                  <span>New Lead</span>
                  <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-[#CCFF00] group-hover:text-black transition-colors">
                    <Plus size={12} className="text-[#CCFF00] group-hover:text-black transition-colors" />
                  </span>
                </button>
              </div>

              {/* Notifications Bell */}
              <div className="relative">
                <button
                  onClick={() => setIsNotifDrawerOpen(!isNotifDrawerOpen)}
                  className="p-2 rounded-xl bg-gray-100/80 hover:bg-gray-200/80 text-gray-600 transition-colors relative cursor-pointer btn-press"
                >
                  <Bell size={17} />
                  {unreadNotifsCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white shadow-xs" />
                  )}
                </button>

              {/* Notifications Popover */}
              <AnimatePresence>
                {isNotifDrawerOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                    style={{ transformOrigin: 'top right' }}
                    className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl p-4 shadow-2xl border border-gray-100 z-50 text-xs"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                      <div>
                        <h4 className="font-extrabold text-sm text-gray-900">Notifications</h4>
                        <span className="text-[10px] text-gray-400">{unreadNotifsCount} unread events</span>
                      </div>
                      {unreadNotifsCount > 0 && (
                        <button
                          onClick={markAllNotificationsRead}
                          className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer btn-press"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-gray-50 py-2 space-y-2">
                      {notifications.length === 0 ? (
                        <p className="text-gray-400 py-6 text-center text-xs">No notifications yet.</p>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => markNotificationAsRead(notif.id)}
                            className={`p-3 rounded-2xl transition-colors cursor-pointer ${
                              notif.isRead ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100/80 font-medium'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <span className="font-bold text-gray-900 text-xs">{notif.title}</span>
                              <span className="text-[10px] text-gray-400 font-normal">
                                {notif.timeAgo || (notif.createdAt ? new Date(notif.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Recent')}
                              </span>
                            </div>
                            <p className="text-gray-600 text-xs mt-0.5 leading-relaxed">{notif.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Current User Profile & Role Switcher */}
            <div className="relative">
              <div
                onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200/80 p-1.5 pr-3 rounded-full cursor-pointer transition-colors btn-press"
              >
                <img
                  src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={currentUser?.fullName || 'User'}
                  className="w-8 h-8 rounded-full object-cover border border-white shadow-xs"
                />
                <div className="hidden sm:block text-left">
                  <span className="text-xs font-extrabold text-gray-900 block leading-none">
                    {(currentUser?.fullName || 'Admin').split(' ')[0]}
                  </span>
                  <span className="text-[9px] font-semibold text-gray-400 block leading-none mt-0.5">
                    {currentUser?.role || 'Super Admin'}
                  </span>
                </div>
              </div>

              {/* User Profile Popover */}
              <AnimatePresence>
                {isRoleMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                    style={{ transformOrigin: 'top right' }}
                    className="absolute right-0 mt-2 w-72 bg-white rounded-3xl p-4 shadow-2xl border border-gray-100 z-50 text-xs"
                  >
                    <div className="flex items-center gap-3 pb-3 border-b border-gray-100 mb-3">
                      <img
                        src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                        alt={currentUser?.fullName || 'User'}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-xs"
                      />
                      <div className="min-w-0 flex-1">
                        <strong className="text-gray-900 text-xs font-black block truncate">{currentUser?.fullName || 'Admin User'}</strong>
                        <span className="text-[11px] text-gray-400 block truncate">{currentUser?.email}</span>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-black text-[#CCFF00]">
                            {currentUser?.role || 'Super Admin'}
                          </span>
                          <span className="text-[9px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            {currentUser?.department || 'General'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <button
                        onClick={() => { handleNavigate('settings'); setIsRoleMenuOpen(false); }}
                        className="w-full px-3 py-2.5 rounded-xl text-left font-semibold text-gray-700 hover:bg-gray-100 flex items-center gap-2 cursor-pointer transition-colors btn-press"
                      >
                        <Settings size={14} className="text-gray-400" />
                        <span>Manage Team & Access Control</span>
                      </button>
                      <button
                        onClick={() => { setIsAuthModalOpen(true); setIsRoleMenuOpen(false); }}
                        className="w-full px-3 py-2.5 rounded-xl text-left font-semibold text-indigo-600 hover:bg-indigo-50 flex items-center gap-2 cursor-pointer transition-colors btn-press"
                      >
                        <UserPlus size={14} />
                        <span>Switch Account / Sign In</span>
                      </button>
                    </div>

                    <div className="pt-2 mt-2 border-t border-gray-100">
                      <button
                        onClick={handleSignOut}
                        className="w-full px-3 py-2.5 rounded-xl text-left font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer transition-colors btn-press"
                      >
                        <LogOut size={14} />
                        <span>Sign Out Session</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>
      </div>

      {/* Mobile Floating Bottom Dock */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/80 px-2 py-1.5 flex items-center justify-around shadow-2xl">
          {[
            { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
            { id: 'projects', label: 'Projects', icon: Briefcase, count: projects.filter(p => p.status === 'IN PROGRESS').length },
            { id: 'leads', label: 'Leads', icon: UserCheck, count: leads.filter(l => l.status === 'NEW').length },
            { id: 'finance', label: 'Finance', icon: IndianRupee },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeRoute === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { handleNavigate(tab.id); setIsMobileMoreOpen(false); }}
                className={`flex flex-col items-center py-1 px-3 rounded-xl text-[10px] font-bold transition-all relative btn-press ${
                  isActive ? 'text-black' : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                <div className="relative">
                  <Icon size={18} className={isActive ? 'text-black' : 'text-gray-400'} />
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="absolute -top-1 -right-2 bg-black text-[#CCFF00] text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
                      {tab.count}
                    </span>
                  )}
                </div>
                <span className="mt-0.5">{tab.label}</span>
                {isActive && <span className="w-1 h-1 rounded-full bg-black mt-0.5" />}
              </button>
            );
          })}

          <button
            onClick={() => setIsMobileMoreOpen(!isMobileMoreOpen)}
            className={`flex flex-col items-center py-1 px-3 rounded-xl text-[10px] font-bold transition-all btn-press ${
              isMobileMoreOpen ? 'text-black' : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            <Layers size={18} />
            <span className="mt-0.5">More</span>
            {isMobileMoreOpen && <span className="w-1 h-1 rounded-full bg-black mt-0.5" />}
          </button>
        </div>

        {/* Mobile "More" Drawer Sheet */}
        <AnimatePresence>
          {isMobileMoreOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMoreOpen(false)}
                className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-xs z-40"
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="md:hidden fixed bottom-14 left-0 right-0 z-50 bg-white rounded-t-3xl p-5 border-t border-gray-200 shadow-2xl max-h-[75vh] overflow-y-auto"
              >
                <div className="w-10 h-1 rounded-full bg-gray-300 mx-auto mb-4" />
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3">All Modules & Operations</h4>
                <div className="grid grid-cols-2 gap-2">
                  {permittedNavItems.map(item => {
                    const Icon = item.icon;
                    const isActive = activeRoute === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => { handleNavigate(item.id); setIsMobileMoreOpen(false); }}
                        className={`flex items-center gap-2.5 p-2.5 rounded-2xl text-xs font-bold text-left transition-all btn-press ${
                          isActive ? 'bg-black text-[#CCFF00]' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon size={16} className={isActive ? 'text-[#CCFF00]' : 'text-gray-400'} />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Workspace Dynamic View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-2 sm:pt-4 pb-24 md:pb-8 overflow-y-auto crm-scrollbar">
          {!store.hasPermission(activeRoute as CrmModuleKey) ? (
            <div className="max-w-2xl mx-auto text-center py-20 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
              <Shield size={48} className="text-amber-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900">Restricted Access (RBAC)</h3>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                You do not have permission to access the <strong>{navItems.find(n => n.id === activeRoute)?.label || activeRoute}</strong> module.
                Your current role is <strong>{currentUser?.role}</strong>. Please contact your Super Admin to update your access privileges.
              </p>
              <button
                onClick={() => handleNavigate('dashboard')}
                className="mt-5 px-5 py-2.5 bg-black text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-gray-800 transition-colors"
              >
                Return to Dashboard
              </button>
            </div>
          ) : (
            <Suspense fallback={<ViewLoadingSkeleton />}>
              {activeRoute === 'dashboard' && <DashboardView store={store} onNavigate={handleNavigate} onOpenQuickCreate={handleQuickCreate} />}
              {activeRoute === 'leads' && <LeadsView store={store} onNavigate={handleNavigate} initialSelectedId={selectedEntityId} />}
              {activeRoute === 'clients' && <ClientsView store={store} onNavigate={handleNavigate} initialSelectedId={selectedEntityId} />}
              {activeRoute === 'projects' && <ProjectsView store={store} onNavigate={handleNavigate} initialSelectedId={selectedEntityId} />}
              {activeRoute === 'tasks' && <TasksView store={store} onNavigate={handleNavigate} initialSelectedId={selectedEntityId} />}
              {activeRoute === 'issues' && <IssuesView store={store} onNavigate={handleNavigate} initialSelectedId={selectedEntityId} />}
              {activeRoute === 'finance' && <FinanceView store={store} onNavigate={handleNavigate} initialSelectedId={selectedEntityId} />}
              {activeRoute === 'partners' && <PartnersView store={store} onNavigate={handleNavigate} initialSelectedId={selectedEntityId} />}
              {activeRoute === 'documents' && <DocumentsView store={store} onNavigate={handleNavigate} initialSelectedId={selectedEntityId} />}
              {activeRoute === 'vault' && <CredentialsVaultView store={store} onNavigate={handleNavigate} initialSelectedId={selectedEntityId} />}
              {activeRoute === 'calendar' && <CalendarView store={store} onNavigate={handleNavigate} initialSelectedId={selectedEntityId} />}
              {activeRoute === 'analytics' && <AnalyticsView store={store} onNavigate={handleNavigate} />}
              {activeRoute === 'audit' && <AuditLogsView store={store} onNavigate={handleNavigate} />}
              {activeRoute === 'settings' && <SettingsView store={store} onNavigate={handleNavigate} />}
            </Suspense>
          )}
        </main>
      </div>

      {/* Global Spotlight Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        leads={leads}
        clients={clients}
        projects={projects}
        tasks={tasks}
        invoices={invoices}
        credentials={credentials}
        agreements={store.agreements}
        documents={store.documents}
        teamMembers={store.teamMembers}
        partners={store.partners}
        issues={store.issues}
        quotations={store.quotations}
        currentUser={store.currentUser}
        onNavigate={handleNavigate}
      />
    </div>
  );
};
