import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Mail, MapPin, Building, ShieldCheck, FileText, X } from 'lucide-react';

interface FooterProps {
  onAdminLoginClick?: () => void;
  onClientPortalClick?: () => void;
  onProcessAuditClick?: (email: string) => void;
  onPartnerPortalClick?: () => void;
  onBecomePartnerClick?: () => void;
  isStaffLoggedIn?: boolean;
  isPartnerLoggedIn?: boolean;
}

const Footer: React.FC<FooterProps> = ({ 
  onAdminLoginClick, 
  onClientPortalClick, 
  onProcessAuditClick,
  onPartnerPortalClick,
  onBecomePartnerClick,
  isStaffLoggedIn,
  isPartnerLoggedIn
}) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [legalModal, setLegalModal] = useState<'privacy' | 'terms' | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setEmailError('Please enter your business email');
      return;
    }
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!isValid) {
      setEmailError('Please enter a valid email address');
      return;
    }
    setEmailError('');
    if (onProcessAuditClick) {
      onProcessAuditClick(email.trim());
    } else {
      window.open(`https://wa.me/918698324316?text=Hi%20AGX,%20I'd%20like%20a%20process%20audit%20for%20email:%20${encodeURIComponent(email.trim())}`, '_blank');
    }
  };

  return (
    <footer className="bg-transparent text-white px-6 md:px-12 py-20 md:py-24 flex flex-col items-center gap-16 md:gap-20 border-t border-white/5 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl w-full flex flex-col items-center text-center gap-8"
      >
        <div className="flex flex-col gap-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-[#CCFF00] font-mono text-xs uppercase tracking-[0.25em] flex items-center justify-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-ping" />
            END REPETITIVE PAYROLL FRICTION
          </motion.div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold uppercase text-white tracking-tight leading-[1.08] font-['Outfit']">
            READY TO <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-[#CCFF00]">AUTOMATE?</span>
          </h2>
          <p className="text-white/60 text-sm md:text-base font-light max-w-xl mx-auto">
            Book a 20-minute diagnostic session. We identify your top operational leaks and present a fixed 14-day automation roadmap with our 30-day zero-risk guarantee.
          </p>
        </div>
        
        {/* Email Lead Capture Box with Double-Bezel */}
        <motion.form 
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col md:flex-row gap-0 items-stretch w-full max-w-2xl bg-white/[0.03] backdrop-blur-md border border-white/15 rounded-2xl overflow-hidden shadow-2xl relative"
        >
          <input 
            type="email" 
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError('');
            }}
            placeholder="ENTER YOUR WORK EMAIL" 
            aria-label="Email Address"
            className="flex-grow bg-transparent p-5 font-mono text-xs sm:text-sm outline-none text-white placeholder:text-white/30 border-b md:border-b-0 md:border-r border-white/10"
          />
          <button 
            type="submit"
            className="group text-black bg-[#CCFF00] hover:bg-[#b8e600] px-8 py-5 text-xs font-extrabold font-mono transition-all uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer btn-press shrink-0"
          >
            <span>CLAIM FREE AUDIT</span>
            <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-0.5 transition-transform" />
          </button>
        </motion.form>
        {emailError && (
          <span className="text-xs text-red-400 font-mono -mt-6">{emailError}</span>
        )}
        
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-white/50 text-xs mt-1 flex items-center justify-center gap-2 uppercase tracking-wider font-mono flex-wrap"
        >
          <span className="text-[#CCFF00]">⚡️</span> Strict Maximum of 4 Client Deployments Per Month • 30-Day Zero-Risk Guarantee Active
        </motion.p>
      </motion.div>
      
      {/* Footer Navigation Columns */}
      <div className="w-full max-w-7xl grid grid-cols-2 md:grid-cols-4 gap-12 text-left pt-20 border-t border-white/5">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col gap-4"
        >
          <div className="text-[10px] font-mono uppercase text-[#CCFF00] tracking-[0.2em]">Navigation</div>
          <a href="#" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Back to Top ↑</a>
          <a href="#services" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Services</a>
          <a href="#how-it-works" className="text-sm font-medium text-white/60 hover:text-white transition-colors">How It Works</a>
          <a href="#case-studies" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Case Studies</a>
          <a href="#calculator" className="text-sm font-medium text-white/60 hover:text-white transition-colors">ROI Calculator</a>
          <a href="#faq" className="text-sm font-medium text-white/60 hover:text-white transition-colors">FAQ</a>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col gap-4"
        >
          <div className="text-[10px] font-mono uppercase text-[#CCFF00] tracking-[0.2em]">Portals & Clients</div>
          {onPartnerPortalClick && (
            <button
              onClick={() => onPartnerPortalClick()}
              className="text-left text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>{isPartnerLoggedIn ? 'Partner Portal (Active)' : 'Partner Portal'}</span> 🤝
            </button>
          )}
          {!isPartnerLoggedIn && onBecomePartnerClick && (
            <button
              onClick={() => onBecomePartnerClick()}
              className="text-left text-sm font-medium text-white/70 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>Become a Partner</span> 🚀
            </button>
          )}
          {onClientPortalClick && (
            <button
              onClick={() => onClientPortalClick && onClientPortalClick()}
              className="text-left text-sm font-medium text-white/80 hover:text-[#CCFF00] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>Client Issue Portal</span> 🎫
            </button>
          )}
          {onAdminLoginClick && (
            <button
              onClick={() => onAdminLoginClick && onAdminLoginClick()}
              className="text-left text-sm font-medium text-[#CCFF00]/80 hover:text-[#CCFF00] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>{isStaffLoggedIn ? 'Staff CRM Dashboard (Active)' : 'Staff CRM Portal'}</span> 🔐
            </button>
          )}
          <a 
            href="https://wa.me/918698324316" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-sm font-medium text-white/60 hover:text-white transition-colors"
          >
            Direct WhatsApp VIP Line
          </a>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col gap-4"
        >
          <div className="text-[10px] font-mono uppercase text-[#CCFF00] tracking-[0.2em]">Legal & Compliance</div>
          <button
            onClick={() => setLegalModal('privacy')}
            className="text-left text-sm font-medium text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            Privacy Policy
          </button>
          <button
            onClick={() => setLegalModal('terms')}
            className="text-left text-sm font-medium text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            Terms of Service
          </button>
          <div className="flex items-center gap-1.5 text-xs text-white/40 font-mono mt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>SOC2-Compliant AI Stack</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col gap-4"
        >
          <div className="text-[10px] font-mono uppercase text-[#CCFF00] tracking-[0.2em]">Global HQ</div>
          <div className="text-sm font-medium text-white/60 leading-relaxed flex flex-col gap-3">
            <span className="flex items-center gap-2"><Building className="w-4 h-4 text-white/40" /> AGXperience Inc.</span>
            <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-white/40" /> Pune, Maharashtra, India</span>
          </div>
          <a href="mailto:abhinavagxprience@gmail.com" className="text-sm font-medium text-white/80 hover:text-[#CCFF00] transition-colors break-all flex items-center gap-2 mt-2">
            <Mail className="w-4 h-4" /> abhinavagxprience@gmail.com
          </a>
        </motion.div>
      </div>

      {/* Copyright Line */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.5 }}
        className="w-full max-w-7xl flex flex-col md:flex-row justify-between items-center text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 pt-8 border-t border-white/5"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-end opacity-80">
            <span className="text-xl font-black italic tracking-tighter text-white leading-none" style={{ paddingRight: '1px', transform: 'skewX(-5deg)' }}>
              AG<span className="text-[#CCFF00]">X</span>
            </span>
          </div>
          <span>© {new Date().getFullYear()} AGXPERIENCE INC. ALL RIGHTS RESERVED</span>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-6">
          <span className="text-emerald-400/80">Systems Operational</span>
          {onAdminLoginClick && (
            <button onClick={() => onAdminLoginClick && onAdminLoginClick()} className="hover:text-white cursor-pointer transition-colors">
              CRM Admin
            </button>
          )}
        </div>
      </motion.div>

      {/* Simple Legal Modal */}
      <AnimatePresence>
        {legalModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLegalModal(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-[#0d1117] border border-white/20 rounded-2xl p-6 md:p-8 z-10 text-white max-h-[80vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center pb-4 border-b border-white/10 mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#CCFF00]" />
                  <h3 className="text-lg font-bold uppercase tracking-wider font-mono">
                    {legalModal === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
                  </h3>
                </div>
                <button 
                  onClick={() => setLegalModal(null)}
                  className="p-1.5 text-white/40 hover:text-white rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="text-xs text-white/70 space-y-4 font-light leading-relaxed">
                {legalModal === 'privacy' ? (
                  <>
                    <p>At AGXperience Inc., we treat your proprietary business data and automation blueprints with institutional-grade confidentiality.</p>
                    <p><strong>1. Data Ownership:</strong> All custom code, agent workflows, vectors, and credentials built for your company are 100% owned by your organization upon deployment.</p>
                    <p><strong>2. Zero Model Training:</strong> We enforce zero-retention and zero-training policies across our LLM integrations (OpenAI, Anthropic Claude, Perplexity). Your business data is never used to train public models.</p>
                    <p><strong>3. Encryption:</strong> All webhook endpoints and API keys are stored with AES-256 encryption within isolated Supabase vaults.</p>
                  </>
                ) : (
                  <>
                    <p><strong>1. Scope of Engagement:</strong> AGXperience provides customized software, API orchestrations, and autonomous AI agents as agreed upon in writing.</p>
                    <p><strong>2. 30-Day Performance Guarantee:</strong> If our automated deployment fails to save your team at least 10 hours per week within 30 days of production launch, we continue optimizing at zero additional fee until that target is achieved.</p>
                    <p><strong>3. Intellectual Property:</strong> Client retains full ownership of deliverables upon final milestone payment settlement.</p>
                  </>
                )}
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
                <button
                  onClick={() => setLegalModal(null)}
                  className="px-5 py-2 bg-white/10 hover:bg-white/20 text-xs font-mono uppercase rounded-lg text-white"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </footer>
  );
};

export default Footer;
