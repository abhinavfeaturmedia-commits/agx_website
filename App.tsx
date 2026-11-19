import React, { useState, useEffect, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import PetalyxHome from './components/PetalyxHome';
import { ConsultationModal } from './components/ConsultationModal';
import { ErrorBoundary } from './components/crm/ErrorBoundary';
import { ToastNotification } from './components/crm/ToastNotification';
import { UserRole, Partner } from './types/crm';
import { authService } from './lib/authService';
import { CrmStoreProvider } from './lib/crmStore';
import { AgxPetalyxBrand, CherryBlossomBackdrop } from './components/ui/CherryBlossomBackdrop';

// Dynamic Code-Splitting: Lazy-load heavy CRM & Portal modules on demand
const AdminLogin = lazy(() => import('./components/crm/AdminLogin').then(m => ({ default: m.AdminLogin })));
const CrmLayout = lazy(() => import('./components/crm/CrmLayout').then(m => ({ default: m.CrmLayout })));
const ClientIssuePortal = lazy(() => import('./components/portal/ClientIssuePortal').then(m => ({ default: m.ClientIssuePortal })));
const PartnerAuth = lazy(() => import('./components/partner/PartnerAuth').then(m => ({ default: m.PartnerAuth })));
const PartnerPortal = lazy(() => import('./components/partner/PartnerPortal').then(m => ({ default: m.PartnerPortal })));

type AppView = 'website' | 'login' | 'crm' | 'portal' | 'partner-auth' | 'partner-portal';

interface ConsultationInitialData {
  service?: string;
  notes?: string;
  email?: string;
}

const PortalLoadingSpinner: React.FC<{ label?: string }> = ({ label = 'Loading Secure Workspace...' }) => (
  <div className="petalyx-theme min-h-screen w-full relative bg-[#e9eee0] text-[#121410] flex flex-col items-center justify-center p-6 overflow-hidden">
    <CherryBlossomBackdrop petalCount={8} variant="day" showGlassSquares={false} />
    <div className="relative z-10 rounded-[28px] p-2 petalyx-card-frost max-w-xs w-full text-center">
      <div className="rounded-[22px] p-7 bg-white/92 backdrop-blur-md border border-white/80 flex flex-col items-center">
        <div className="mb-4">
          <AgxPetalyxBrand compact />
        </div>
        <div className="w-6 h-6 border-2 border-[var(--olive)] border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-xs font-medium text-[#121410]/70 tracking-wide">{label}</span>
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  const [isDark, setIsDark] = useState(true);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [consultationData, setConsultationData] = useState<ConsultationInitialData>({});

  const [activePartner, setActivePartner] = useState<Partner | null>(() => authService.getCurrentPartner());
  const [partnerAuthMode, setPartnerAuthMode] = useState<'login' | 'register'>('login');

  const [currentView, setCurrentView] = useState<AppView>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const hash = window.location.hash;
      const search = window.location.search;
      if (path.startsWith('/portal') || path.startsWith('/client-portal') || hash.startsWith('#portal') || (search.includes('token=') && !path.startsWith('/admin') && !path.startsWith('/partner'))) {
        return 'portal';
      }
      if (path.startsWith('/partner/portal') || hash === '#partner-portal' || hash === '#partner-dashboard') {
        return authService.getCurrentPartner() ? 'partner-portal' : 'partner-auth';
      }
      if (path.startsWith('/partner') || hash === '#partner-login' || hash === '#partner-register' || hash === '#partner-auth') {
        return authService.getCurrentPartner() ? 'partner-portal' : 'partner-auth';
      }
      if (path.startsWith('/admin/dashboard') || hash === '#crm') {
        return authService.getStaffSession() ? 'crm' : 'login';
      }
      if (path.startsWith('/admin') || hash === '#admin') {
        return authService.getStaffSession() ? 'crm' : 'login';
      }
    }
    return 'website';
  });

  const [activePortalToken, setActivePortalToken] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const qToken = urlParams.get('token');
      if (qToken && qToken !== '[object Object]' && qToken !== 'undefined' && qToken !== 'null') {
        return qToken.trim();
      }
      const hash = window.location.hash;
      if (hash.includes('token=')) {
        const hashMatch = hash.match(/token=([^&]+)/);
        if (hashMatch && hashMatch[1]) {
          const decoded = decodeURIComponent(hashMatch[1]).trim();
          if (decoded && decoded !== '[object Object]' && decoded !== 'undefined' && decoded !== 'null') {
            return decoded;
          }
        }
      }
    }
    return '';
  });

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const navigateToLogin = (forceForm?: boolean) => {
    const staff = authService.getStaffSession();
    if (staff && !forceForm) {
      navigateToCrm(staff.role, staff);
      return;
    }
    setCurrentView('login');
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/admin/login');
    }
  };

  const navigateToPortal = (tokenArg?: unknown) => {
    const validToken = (typeof tokenArg === 'string' && tokenArg.trim() && tokenArg !== '[object Object]' && tokenArg !== 'undefined' && tokenArg !== 'null')
      ? tokenArg.trim()
      : '';
    setActivePortalToken(validToken);
    setCurrentView('portal');
    if (typeof window !== 'undefined') {
      const targetUrl = validToken ? `/portal?token=${encodeURIComponent(validToken)}` : '/portal';
      window.history.pushState(null, '', targetUrl);
    }
  };

  const navigateToCrm = (role: UserRole, profile?: any) => {
    if (profile) {
      authService.setStaffSession(profile);
      authService.notifyAuthChange('SIGNED_IN', profile);
    }
    setCurrentView('crm');
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/admin/dashboard');
    }
  };

  const navigateToPartnerAuth = (mode: 'login' | 'register' = 'login', forceForm?: boolean) => {
    const existingPartner = authService.getCurrentPartner();
    if (existingPartner && !forceForm) {
      navigateToPartnerPortal(existingPartner);
      return;
    }
    setPartnerAuthMode(mode);
    setCurrentView('partner-auth');
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', mode === 'register' ? '/partner/register' : '/partner/login');
    }
  };

  const navigateToPartnerPortal = (partner?: Partner) => {
    const targetPartner = partner || activePartner || authService.getCurrentPartner();
    if (targetPartner) {
      setActivePartner(targetPartner);
      authService.setPartnerSession(targetPartner);
      setCurrentView('partner-portal');
      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', '/partner/portal');
      }
    } else {
      navigateToPartnerAuth('login');
    }
  };

  const navigateToWebsite = () => {
    setCurrentView('website');
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/');
    }
  };

  const handleOpenConsultation = (service?: string, notes?: string, email?: string) => {
    setConsultationData({
      service: service || 'General Automation Diagnostic',
      notes: notes || '',
      email: email || '',
    });
    setIsConsultationOpen(true);
  };

  // Listen to popstate for browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      const search = window.location.search;
      const urlParams = new URLSearchParams(search);
      const queryToken = urlParams.get('token');
      if (queryToken && queryToken !== '[object Object]' && queryToken !== 'undefined' && queryToken !== 'null') {
        setActivePortalToken(queryToken.trim());
      } else {
        setActivePortalToken('');
      }
      if (path.startsWith('/portal') || path.startsWith('/client-portal') || hash.startsWith('#portal') || (search.includes('token=') && !path.startsWith('/admin') && !path.startsWith('/partner'))) {
        setCurrentView('portal');
      } else if (path.startsWith('/partner/portal') || hash === '#partner-portal' || hash === '#partner-dashboard') {
        setCurrentView(authService.getCurrentPartner() ? 'partner-portal' : 'partner-auth');
      } else if (path.startsWith('/partner') || hash === '#partner-login' || hash === '#partner-register' || hash === '#partner-auth') {
        setCurrentView(authService.getCurrentPartner() ? 'partner-portal' : 'partner-auth');
      } else if (path.startsWith('/admin/dashboard') || hash === '#crm') {
        setCurrentView(authService.getStaffSession() ? 'crm' : 'login');
      } else if (path.startsWith('/admin') || hash === '#admin') {
        setCurrentView(authService.getStaffSession() ? 'crm' : 'login');
      } else {
        setCurrentView('website');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Capture ?ref= partner referral links on page landing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const refParam = urlParams.get('ref') || urlParams.get('partner') || urlParams.get('affiliate');
      if (refParam && refParam.trim()) {
        const cleanRef = refParam.trim().toUpperCase();
        try {
          sessionStorage.setItem('agx_partner_ref', cleanRef);
          localStorage.setItem('agx_partner_ref', cleanRef);
        } catch (_) {}
      }
    }
  }, []);

  // Handle Auth state changes (e.g. partner login/session update)
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        if (typeof window !== 'undefined') {
          const path = window.location.pathname;
          const hash = window.location.hash;
          if (path.startsWith('/partner') || hash.startsWith('#partner')) {
            const syncedPartner = authService.getCurrentPartner();
            if (syncedPartner) {
              setActivePartner(syncedPartner);
              setCurrentView('partner-portal');
              window.history.replaceState(null, '', '/partner/portal');
            }
          }
        }
      }
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Listen for live partner profile updates across tabs and portal components
  useEffect(() => {
    const handlePartnerUpdated = (e: any) => {
      if (e?.detail) {
        setActivePartner(e.detail);
      }
    };
    window.addEventListener('agx_crm_partner_updated', handlePartnerUpdated);
    return () => window.removeEventListener('agx_crm_partner_updated', handlePartnerUpdated);
  }, []);

  const renderContent = () => {
    // If in Partner Portal mode, enforce authenticated partner session route guard
    if (currentView === 'partner-portal') {
      const currentPartner = activePartner || authService.getCurrentPartner();
    if (!currentPartner) {
      return (
        <ErrorBoundary fallbackRoute={navigateToWebsite}>
          <Suspense fallback={<PortalLoadingSpinner label="Opening Partner Access Gate..." />}>
            <PartnerAuth
              initialMode="login"
              onLoginSuccess={(p) => navigateToPartnerPortal(p)}
              onBackToWebsite={navigateToWebsite}
              onNavigateToStaffLogin={() => navigateToLogin()}
              onNavigateToPortal={() => navigateToPortal()}
            />
          </Suspense>
        </ErrorBoundary>
      );
    }

    return (
      <ErrorBoundary fallbackRoute={navigateToWebsite}>
        <Suspense fallback={<PortalLoadingSpinner label="Opening Partner Portal..." />}>
          <PartnerPortal
            initialPartner={currentPartner}
            onPartnerUpdated={(p) => setActivePartner(p)}
            onBackToWebsite={navigateToWebsite}
            onLogout={() => {
              authService.clearPartnerSession();
              setActivePartner(null);
              navigateToPartnerAuth('login');
            }}
          />
        </Suspense>
      </ErrorBoundary>
    );
  }

  // If in Partner Auth mode (login or register)
  if (currentView === 'partner-auth') {
    return (
      <ErrorBoundary fallbackRoute={navigateToWebsite}>
        <Suspense fallback={<PortalLoadingSpinner label="Opening Partner Access Gate..." />}>
          <PartnerAuth
            initialMode={partnerAuthMode}
            onLoginSuccess={(p) => navigateToPartnerPortal(p)}
            onBackToWebsite={navigateToWebsite}
            onNavigateToStaffLogin={() => navigateToLogin()}
            onNavigateToPortal={() => navigateToPortal()}
          />
        </Suspense>
      </ErrorBoundary>
    );
  }

  // If in Client Portal mode (accessed via secret token or demo mode)
  if (currentView === 'portal') {
    return (
      <ErrorBoundary fallbackRoute={navigateToWebsite}>
        <Suspense fallback={<PortalLoadingSpinner label="Authenticating Project Ticket Portal..." />}>
          <ClientIssuePortal
            onBackToWebsite={navigateToWebsite}
            onNavigateToStaffLogin={() => navigateToLogin()}
            onNavigateToPartnerPortal={() => navigateToPartnerPortal()}
            tokenOverride={activePortalToken}
          />
        </Suspense>
      </ErrorBoundary>
    );
  }

  // If in CRM mode, enforce authenticated staff session route guard
  if (currentView === 'crm') {
    const staffSession = authService.getStaffSession();
    if (!staffSession) {
      return (
        <ErrorBoundary fallbackRoute={navigateToWebsite}>
          <Suspense fallback={<PortalLoadingSpinner label="Redirecting to Staff Gateway..." />}>
            <AdminLogin
              onLoginSuccess={navigateToCrm}
              onBackToWebsite={navigateToWebsite}
              onNavigateToPortal={navigateToPortal}
              onNavigateToPartnerPortal={() => navigateToPartnerPortal()}
            />
          </Suspense>
        </ErrorBoundary>
      );
    }

    return (
      <ErrorBoundary fallbackRoute={navigateToWebsite}>
        <Suspense fallback={<PortalLoadingSpinner label="Decrypting Workspace OS..." />}>
          <CrmLayout
            onLogout={() => navigateToLogin(true)}
            onBackToWebsite={navigateToWebsite}
          />
        </Suspense>
      </ErrorBoundary>
    );
  }

  // If in Login mode, render the AdminLogin screen
  if (currentView === 'login') {
    return (
      <ErrorBoundary fallbackRoute={navigateToWebsite}>
        <Suspense fallback={<PortalLoadingSpinner label="Opening Staff Gateway..." />}>
          <AdminLogin
            onLoginSuccess={navigateToCrm}
            onBackToWebsite={navigateToWebsite}
            onNavigateToPortal={navigateToPortal}
            onNavigateToPartnerPortal={() => navigateToPartnerPortal()}
          />
        </Suspense>
      </ErrorBoundary>
    );
  }

  // Otherwise, render Public Agency Website
  // Recreated Petalyx Home Landing Page
  return (
    <div className="petalyx-theme min-h-screen bg-[#e9eee0]">
      <PetalyxHome
        onNavigateToLogin={() => navigateToLogin()}
        onNavigateToPortal={() => navigateToPortal()}
        onNavigateToPartnerPortal={() => navigateToPartnerPortal()}
        onOpenConsultation={(service, notes) => handleOpenConsultation(service, notes)}
        isStaffLoggedIn={Boolean(authService.getStaffSession())}
      />

      {/* Inbound Lead Capture / Strategy Call Modal */}
      <ConsultationModal
        isOpen={isConsultationOpen}
        onClose={() => setIsConsultationOpen(false)}
        initialService={consultationData.service}
        initialNotes={consultationData.notes}
        initialEmail={consultationData.email}
      />
    </div>
  );
};

  return (
    <CrmStoreProvider>
      {renderContent()}
      <ToastNotification />
    </CrmStoreProvider>
  );
};

export default App;
