import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Marquee from './components/Marquee';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Stats from './components/Stats';
import Services from './components/Services';
import TechStack from './components/TechStack';
import HowItWorks from './components/HowItWorks';
import OnboardingTimeline from './components/OnboardingTimeline';
import CostCalculator from './components/CostCalculator';
import TaskEliminator from './components/TaskEliminator';
import Comparison from './components/Comparison';
import SuccessStories from './components/SuccessStories';
import PartnerProgram from './components/PartnerProgram';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import { GrandSlamStack } from './components/GrandSlamStack';
import { ConsultationModal } from './components/ConsultationModal';
import { AdminLogin } from './components/crm/AdminLogin';
import { CrmLayout } from './components/crm/CrmLayout';
import { ClientIssuePortal } from './components/portal/ClientIssuePortal';
import { ErrorBoundary } from './components/crm/ErrorBoundary';
import { UserRole } from './types/crm';

type AppView = 'website' | 'login' | 'crm' | 'portal';

interface ConsultationInitialData {
  service?: string;
  notes?: string;
  email?: string;
}

const App: React.FC = () => {
  const [isDark, setIsDark] = useState(true);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [consultationData, setConsultationData] = useState<ConsultationInitialData>({});

  const [currentView, setCurrentView] = useState<AppView>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const hash = window.location.hash;
      const search = window.location.search;
      if (path.startsWith('/portal') || path.startsWith('/client-portal') || hash.startsWith('#portal') || (search.includes('token=') && !path.startsWith('/admin'))) {
        return 'portal';
      }
      if (path.startsWith('/admin/dashboard') || hash === '#crm') return 'crm';
      if (path.startsWith('/admin') || hash === '#admin') return 'login';
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

  const navigateToLogin = () => {
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
      try {
        localStorage.setItem('agx_crm_current_user', JSON.stringify(profile));
      } catch (e) {
        console.warn(e);
      }
    }
    setCurrentView('crm');
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/admin/dashboard');
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
      if (path.startsWith('/portal') || path.startsWith('/client-portal') || hash.startsWith('#portal') || (search.includes('token=') && !path.startsWith('/admin'))) {
        setCurrentView('portal');
      } else if (path.startsWith('/admin/dashboard') || hash === '#crm') {
        setCurrentView('crm');
      } else if (path.startsWith('/admin') || hash === '#admin') {
        setCurrentView('login');
      } else {
        setCurrentView('website');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // If in Client Portal mode (accessed via secret token or demo mode)
  if (currentView === 'portal') {
    return (
      <ErrorBoundary fallbackRoute={navigateToWebsite}>
        <ClientIssuePortal 
          onBackToWebsite={navigateToWebsite} 
          tokenOverride={activePortalToken} 
        />
      </ErrorBoundary>
    );
  }

  // If in CRM mode, render the full CrmLayout
  if (currentView === 'crm') {
    return (
      <ErrorBoundary fallbackRoute={navigateToWebsite}>
        <CrmLayout
          onLogout={navigateToLogin}
          onBackToWebsite={navigateToWebsite}
        />
      </ErrorBoundary>
    );
  }

  // If in Login mode, render the AdminLogin screen
  if (currentView === 'login') {
    return (
      <ErrorBoundary fallbackRoute={navigateToWebsite}>
        <AdminLogin
          onLoginSuccess={navigateToCrm}
          onBackToWebsite={navigateToWebsite}
          onNavigateToPortal={navigateToPortal}
        />
      </ErrorBoundary>
    );
  }

  // Otherwise, render Public Agency Website
  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen flex flex-col overflow-x-hidden bg-transparent text-white transition-colors duration-300">
        <Navbar
          isDark={isDark}
          toggleTheme={toggleTheme}
          onAdminLoginClick={navigateToLogin}
          onClientPortalClick={() => navigateToPortal()}
          onConsultationClick={() => handleOpenConsultation()}
        />
        <AnimatePresence mode="wait">
          <motion.main 
            key={isDark ? 'dark' : 'light'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-grow"
          >
            <Hero onGetStartedClick={() => handleOpenConsultation('Full Operations Diagnostic')} />
            <Marquee />
            <Stats />
            <Services 
              onSelectService={(serviceName) => 
                handleOpenConsultation(serviceName, `Interested in custom architecture proposal for ${serviceName}`)
              } 
            />
            <TechStack />
            <HowItWorks />
            <OnboardingTimeline />
            <SuccessStories 
              onOpenConsultation={(service, notes) => 
                handleOpenConsultation(service, notes)
              } 
            />
            <Comparison 
              onUpgradeClick={() => 
                handleOpenConsultation(
                  'Operations Upgrade & Migration',
                  'Initiated from Comparison section: Transitioning operations from manual headcount to autonomous agent architecture'
                )
              } 
            />
            <CostCalculator 
              onAuditClick={(hours, loss) => 
                handleOpenConsultation(
                  'Financial Leak & Time Audit', 
                  `Calculated weekly administrative waste: ${hours} hours/week (~$${loss.toLocaleString()}/month burn rate)`
                )
              } 
            />
            <TaskEliminator 
              onAuditClick={() => 
                handleOpenConsultation(
                  'Task Elimination Audit', 
                  'Requested custom blueprint to eliminate repetitive operational bottlenecks'
                )
              } 
            />
            <GrandSlamStack 
              onClaimOffer={() => 
                handleOpenConsultation(
                  'Grand Slam Offer Deployment Package', 
                  'Claiming custom implementation package including full $9,800 free bonus stack and 30-day zero-risk guarantee'
                )
              } 
            />
            <PartnerProgram />
            <FAQ />
          </motion.main>
        </AnimatePresence>
        <Footer 
          onAdminLoginClick={navigateToLogin} 
          onClientPortalClick={() => navigateToPortal()}
          onProcessAuditClick={(email) => 
            handleOpenConsultation('Process Audit (Footer Inbound)', 'Inbound process audit request via footer input', email)
          } 
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
    </div>
  );
};

export default App;
