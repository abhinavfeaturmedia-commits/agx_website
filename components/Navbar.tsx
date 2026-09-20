import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Sparkles, Menu, X, ArrowRight, Phone, MessageSquare } from 'lucide-react';

interface NavbarProps {
  isDark?: boolean;
  toggleTheme?: () => void;
  onAdminLoginClick?: () => void;
  onConsultationClick?: () => void;
  onClientPortalClick?: () => void;
}

const NAV_ITEMS = [
  { label: 'Services', targetId: 'services' },
  { label: 'Methodology', targetId: 'how-it-works' },
  { label: 'Case Studies', targetId: 'case-studies' },
  { label: 'ROI Calculator', targetId: 'calculator' },
  { label: 'Partner Program', targetId: 'partner' },
  { label: 'FAQ', targetId: 'faq' }
];

const Navbar: React.FC<NavbarProps> = ({
  isDark,
  toggleTheme,
  onAdminLoginClick,
  onConsultationClick,
  onClientPortalClick
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (targetId: string) => {
    setMobileMenuOpen(false);
    const elem = document.getElementById(targetId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const currentMonth = new Date().toLocaleString('default', { month: 'long' });

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-[#0B0E14]/85 backdrop-blur-xl border-b border-white/10 shadow-2xl' 
          : 'bg-transparent'
      }`}
    >
      {/* Urgency Announcement Bar */}
      <div className="w-full bg-[#CCFF00]/5 border-b border-white/10 backdrop-blur-md py-2 px-4 flex justify-center items-center">
        <div className="flex items-center gap-2 text-[10px] md:text-xs font-semibold text-white/90 tracking-wide uppercase">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Strictly Limited: Only 2 Onboarding Cohort Spots Remaining for {currentMonth}
        </div>
      </div>

      <div className={`flex flex-row items-center justify-between px-6 sm:px-8 max-w-7xl mx-auto w-full transition-all duration-300 ${scrolled ? 'py-3.5' : 'py-5'}`}>
        {/* Brand Logo */}
        <div 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-end cursor-pointer hover:opacity-90 transition-opacity"
        >
          <span className="text-3xl md:text-4xl font-black italic tracking-tighter text-white leading-none" style={{ paddingRight: '2px', transform: 'skewX(-5deg)' }}>
            AG<span className="text-[#CCFF00]">X</span>
          </span>
        </div>
        
        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-7 text-xs font-semibold uppercase tracking-wider text-white/60">
          {NAV_ITEMS.map(item => (
            <button
              key={item.targetId}
              onClick={() => scrollToSection(item.targetId)}
              className="hover:text-white transition-colors cursor-pointer"
            >
              {item.label}
            </button>
          ))}
        </div>
        
        {/* Action Controls */}
        <div className="flex gap-2.5 sm:gap-3.5 items-center">
          {/* Subtle Portals Capsule */}
          <div className="hidden sm:flex items-center p-0.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            {onClientPortalClick && (
              <button
                onClick={() => onClientPortalClick && onClientPortalClick()}
                className="flex items-center gap-1.5 text-[11px] font-semibold text-white/70 hover:text-white px-3 py-1 rounded-full hover:bg-white/10 transition-all cursor-pointer"
                title="Access Client Issue & Request Tracker"
              >
                <Sparkles size={11} className="text-[#CCFF00]" />
                <span>Client Portal</span>
              </button>
            )}

            {onAdminLoginClick && (
              <button
                onClick={() => onAdminLoginClick && onAdminLoginClick()}
                className="flex items-center gap-1 text-[11px] font-semibold text-white/40 hover:text-white px-2.5 py-1 rounded-full hover:bg-white/10 transition-all cursor-pointer"
                title="Open Internal CRM Command Center"
              >
                <Lock size={11} />
                <span>Staff</span>
              </button>
            )}
          </div>

          {/* Primary CTA (Solitary High-Contrast Intent with Button-in-Button) */}
          {onConsultationClick ? (
            <button
              type="button"
              onClick={onConsultationClick}
              className="group relative inline-flex items-center gap-2 px-5 sm:px-6 py-2 sm:py-2.5 rounded-full bg-[#CCFF00] hover:bg-[#b8e600] text-black font-extrabold text-xs uppercase tracking-wider transition-all duration-200 active:scale-[0.98] shadow-lg shadow-[#CCFF00]/15 cursor-pointer btn-press"
            >
              <span>Claim Free Audit</span>
              <span className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                <ArrowRight size={11} className="text-black" />
              </span>
            </button>
          ) : (
            <a 
              href="https://wa.me/918698324316" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="group relative inline-flex items-center gap-2 px-5 sm:px-6 py-2 sm:py-2.5 rounded-full bg-[#CCFF00] hover:bg-[#b8e600] text-black font-extrabold text-xs uppercase tracking-wider transition-all duration-200 active:scale-[0.98] shadow-lg shadow-[#CCFF00]/15 cursor-pointer btn-press"
            >
              <span>Claim Free Audit</span>
              <span className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                <ArrowRight size={11} className="text-black" />
              </span>
            </a>
          )}

          {/* Mobile Menu Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-white/70 hover:text-white rounded-xl bg-white/5 border border-white/10 cursor-pointer transition-colors btn-press"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Animated Slide-out Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="lg:hidden bg-[#0B0E14]/95 backdrop-blur-2xl border-b border-white/10 px-6 py-6 shadow-2xl overflow-hidden"
          >
            <div className="flex flex-col gap-4">
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest pb-1 border-b border-white/5">
                Navigation
              </span>
              
              <div className="grid grid-cols-2 gap-2">
                {NAV_ITEMS.map(item => (
                  <button
                    key={item.targetId}
                    onClick={() => scrollToSection(item.targetId)}
                    className="text-left text-sm font-semibold text-white/80 hover:text-[#CCFF00] p-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer"
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="pt-3 border-t border-white/10 flex flex-col gap-2.5">
                {onClientPortalClick && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onClientPortalClick();
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-xs text-left"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles size={14} className="text-emerald-400" />
                      Client Issue & Work Tracker
                    </span>
                    <ArrowRight size={13} className="text-white/40" />
                  </button>
                )}

                {onAdminLoginClick && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onAdminLoginClick();
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-xs text-left"
                  >
                    <span className="flex items-center gap-2">
                      <Lock size={14} className="text-[#CCFF00]" />
                      Staff CRM Command Center
                    </span>
                    <ArrowRight size={13} className="text-white/40" />
                  </button>
                )}

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onConsultationClick) onConsultationClick();
                  }}
                  className="w-full py-3.5 rounded-xl bg-[#CCFF00] text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg btn-press mt-1"
                >
                  <Phone size={14} />
                  <span>Book Free Strategy Session</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
