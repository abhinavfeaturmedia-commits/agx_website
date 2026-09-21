import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Lock, Mail, Eye, EyeOff, Shield, ArrowLeft, Sparkles, KeyRound, ArrowRight, CheckCircle2, ShieldCheck, Handshake
} from 'lucide-react';
import { UserRole, UserProfile } from '../../types/crm';
import { authService } from '../../lib/authService';
import { toast } from '../../lib/toastStore';

interface AdminLoginProps {
  onLoginSuccess: (role: UserRole, profile?: UserProfile) => void;
  onBackToWebsite: () => void;
  onNavigateToPortal?: (token?: string) => void;
  onNavigateToPartnerPortal?: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ 
  onLoginSuccess, 
  onBackToWebsite, 
  onNavigateToPortal,
  onNavigateToPartnerPortal
}) => {
  const [activeTab, setActiveTab] = useState<'staff' | 'client'>('staff');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [clientToken, setClientToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [shakeTrigger, setShakeTrigger] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both your work email and password.');
      setShakeTrigger(prev => prev + 1);
      setIsLoading(false);
      return;
    }

    const { profile, error } = await authService.signIn(email, password);
    if (error) {
      setErrorMessage(error.message || 'Invalid credentials or staff account not found.');
      setShakeTrigger(prev => prev + 1);
      toast.error('Sign In Failed', error.message);
    } else if (profile) {
      toast.success('Access Granted', `Welcome back, ${profile.fullName}`);
      onLoginSuccess(profile.role, profile);
    }

    setIsLoading(false);
  };

  const handleClientTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tokenClean = clientToken.trim();
    if (!tokenClean) {
      toast.error('Token Required', 'Please enter your project access token.');
      return;
    }
    if (onNavigateToPortal) {
      onNavigateToPortal(tokenClean);
    } else {
      window.location.href = `/portal?token=${encodeURIComponent(tokenClean)}`;
    }
  };


  return (
    <div className="min-h-screen w-full bg-[#07090E] text-white flex flex-col justify-between relative overflow-y-auto antialiased">
      {/* Background Decorative Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#CCFF00]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Top Bar */}
      <div className="w-full max-w-7xl mx-auto px-6 py-5 flex-shrink-0 flex items-center justify-between z-10">
        <button
          onClick={onBackToWebsite}
          className="flex items-center gap-2 text-xs font-semibold text-white/60 hover:text-white transition-colors px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer btn-press"
        >
          <ArrowLeft size={14} /> Back to Agency Website
        </button>

        <div className="flex items-center gap-2.5">
          <span className="text-2xl font-black italic tracking-tighter text-white font-['Outfit']">
            AG<span className="text-[#CCFF00]">X</span>
          </span>
          <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/20 uppercase tracking-widest font-bold">
            Command Center
          </span>
        </div>
      </div>

      {/* Main Login Card with Double-Bezel */}
      <div className="w-full max-w-md mx-auto px-6 py-4 sm:py-6 my-auto z-10 flex-shrink-0">
        <motion.div
          key={shakeTrigger}
          initial={shakeTrigger > 0 ? { x: [-10, 10, -7, 7, -3, 3, 0] } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          transition={{ duration: shakeTrigger > 0 ? 0.35 : 0.5, ease: 'easeInOut' }}
          className="double-bezel-outer shadow-2xl !bg-white/[0.03] !border-white/10"
        >
          <div className="double-bezel-inner p-6 sm:p-8 !bg-[#0D1017] border border-white/10">
            {/* Bifurcated Mode Switcher */}
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-white/5 border border-white/10 mb-6">
              <button
                type="button"
                onClick={() => { setActiveTab('staff'); setErrorMessage(''); }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'staff'
                    ? 'bg-[#CCFF00] text-black shadow-md'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                <Lock size={12} />
                <span>Staff CRM Gate</span>
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('client'); setErrorMessage(''); }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'client'
                    ? 'bg-[#CCFF00] text-black shadow-md'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                <Sparkles size={12} />
                <span>Client Portal</span>
              </button>
            </div>

            {/* Mode 1: Staff CRM Login */}
            {activeTab === 'staff' && (
              <>
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[#CCFF00] mx-auto mb-3 shadow-inner">
                    <Lock size={22} />
                  </div>
                  <h1 className="text-xl font-black uppercase text-white tracking-tight font-['Outfit']">
                    Staff Command Center
                  </h1>
                  <p className="text-[11px] text-white/50 font-light mt-0.5">
                    Authorized internal team credentials with RBAC permissions
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-white/70 uppercase tracking-wider mb-1.5">
                      Work Email
                    </label>
                    <div className="relative flex items-center">
                      <Mail size={15} className="absolute left-3.5 text-white/40" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="name@agxperience.com"
                        className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#CCFF00] transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-white/70 uppercase tracking-wider mb-1.5">
                      Password
                    </label>
                    <div className="relative flex items-center">
                      <Lock size={15} className="absolute left-3.5 text-white/40" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••••••"
                        className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#CCFF00] transition-all font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 text-white/40 hover:text-white transition-colors cursor-pointer"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-white/60 pt-0.5">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-white/20 bg-black/40 text-[#CCFF00] accent-[#CCFF00] focus:ring-[#CCFF00] cursor-pointer"
                      />
                      <span>Remember session</span>
                    </label>
                    <span className="text-white/40 text-[10px] font-mono">
                      Supabase Cloud Auth
                    </span>
                  </div>

                  {errorMessage && (
                    <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl leading-relaxed animate-pulse font-mono">
                      {errorMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-4 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#CCFF00]/15 flex items-center justify-center gap-2 cursor-pointer btn-press"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Shield size={14} />
                        <span>Sign In to Workspace</span>
                      </>
                    )}
                  </button>
                </form>
              </>
            )}

            {/* Mode 2: Client Portal Direct Access */}
            {activeTab === 'client' && (
              <div className="space-y-5">
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto mb-3 shadow-inner">
                    <KeyRound size={22} />
                  </div>
                  <h2 className="text-xl font-black uppercase text-white tracking-tight font-['Outfit']">
                    Client Project Portal
                  </h2>
                  <p className="text-[11px] text-white/50 font-light mt-0.5">
                    Enter your confidential project token to access your live deliverables & tickets
                  </p>
                </div>

                <form onSubmit={handleClientTokenSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-white/70 uppercase tracking-wider mb-1.5">
                      Project Access Token
                    </label>
                    <div className="relative flex items-center">
                      <KeyRound size={15} className="absolute left-3.5 text-white/40" />
                      <input
                        type="text"
                        value={clientToken}
                        onChange={(e) => setClientToken(e.target.value)}
                        placeholder="e.g., prj_sec_a8bcd5 or enter your access token"
                        className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#CCFF00] transition-all font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer btn-press"
                  >
                    <span>Open My Project Portal</span>
                    <ArrowRight size={13} />
                  </button>
                </form>

                <div className="pt-4 border-t border-white/10 text-center text-[11px] text-white/50">
                  Confidential client portal. Lost or need access? Contact your AGX Project Manager or email ops@agxperience.com
                </div>
              </div>
            )}

            {onNavigateToPartnerPortal && (
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-white/50">
                <span>AGX Referral Partner?</span>
                <button
                  type="button"
                  onClick={onNavigateToPartnerPortal}
                  className="text-emerald-400 hover:text-emerald-300 font-bold font-mono cursor-pointer flex items-center gap-1 transition-colors"
                >
                  <Handshake size={12} />
                  <span>Partner Portal →</span>
                </button>
              </div>
            )}

            {/* Bottom Security Pulse */}
            <div className="mt-5 pt-3 border-t border-white/5 text-center text-[10px] text-white/40 flex items-center justify-center gap-2 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              AES-256 Encrypted Session • Supabase Live RBAC
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="w-full text-center py-5 flex-shrink-0 text-[11px] text-white/30 font-mono">
        © {new Date().getFullYear()} AGXPERIENCE INC. • ENTERPRISE BUSINESS OS
      </div>
    </div>
  );
};
