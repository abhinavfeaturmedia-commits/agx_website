import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Handshake, Mail, Lock, User, Building, Phone, ArrowLeft, ArrowRight,
  Sparkles, CheckCircle2, ShieldCheck, DollarSign, Wallet, ExternalLink
} from 'lucide-react';
import { authService } from '../../lib/authService';
import { toast } from '../../lib/toastStore';
import { Partner } from '../../types/crm';

interface PartnerAuthProps {
  onLoginSuccess: (partner: Partner) => void;
  onBackToWebsite: () => void;
  onNavigateToStaffLogin?: () => void;
  initialMode?: 'login' | 'register';
}

export const PartnerAuth: React.FC<PartnerAuthProps> = ({
  onLoginSuccess,
  onBackToWebsite,
  onNavigateToStaffLogin,
  initialMode = 'login'
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Check for error parameters returned from OAuth provider
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const errDesc = params.get('error_description') || params.get('error');
      if (errDesc) {
        setErrorMessage(decodeURIComponent(errDesc.replace(/\+/g, ' ')));
      }
    }
  }, []);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Registration form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCompany, setRegCompany] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [payoutMethod, setPayoutMethod] = useState<'UPI' | 'Bank Transfer' | 'PayPal'>('UPI');
  const [upiId, setUpiId] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');

  // Handle Email/Password Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setErrorMessage('Please enter both email and password.');
      setIsLoading(false);
      return;
    }

    const { partner, error } = await authService.partnerSignIn(loginEmail, loginPassword);
    if (error) {
      setErrorMessage(error.message || 'Login failed. Please check your credentials.');
      toast.error('Partner Login Failed', error.message);
    } else if (partner) {
      toast.success('Welcome Back!', `Logged in as ${partner.name}`);
      onLoginSuccess(partner);
    }
    setIsLoading(false);
  };

  // Handle Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setErrorMessage('Name, email, and password are required.');
      setIsLoading(false);
      return;
    }

    const payoutDetails: any = {};
    if (payoutMethod === 'UPI') payoutDetails.upiId = upiId.trim();
    else if (payoutMethod === 'Bank Transfer') {
      payoutDetails.accountNumber = bankAccount.trim();
      payoutDetails.ifsc = bankIfsc.trim();
    } else if (payoutMethod === 'PayPal') {
      payoutDetails.paypalEmail = paypalEmail.trim() || regEmail.trim();
    }

    const { partner, error } = await authService.partnerSignUp({
      name: regName.trim(),
      email: regEmail.trim(),
      password: regPassword.trim(),
      company: regCompany.trim() || undefined,
      phone: regPhone.trim() || undefined,
      payoutMethod,
      payoutDetails
    });

    if (error) {
      setErrorMessage(error.message || 'Registration failed. Please try again.');
      toast.error('Registration Failed', error.message);
    } else if (partner) {
      toast.success('Partner Account Created! 🎉', `Your unique referral code is ${partner.referralCode}`);
      onLoginSuccess(partner);
    }
    setIsLoading(false);
  };

  // Google OAuth Trigger
  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setErrorMessage('');
    const { error } = await authService.signInWithGoogle('/partner/portal');
    if (error) {
      setErrorMessage(error.message || 'Google authentication error. Please try again.');
      toast.error('Google Sign-In Error', error.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#07090E] text-white flex flex-col justify-between relative overflow-y-auto antialiased">
      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#CCFF00]/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Top Navigation Bar */}
      <div className="w-full max-w-7xl mx-auto px-6 py-5 flex-shrink-0 flex items-center justify-between z-10">
        <button
          onClick={onBackToWebsite}
          className="flex items-center gap-2 text-xs font-semibold text-white/60 hover:text-white transition-colors px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer btn-press"
        >
          <ArrowLeft size={14} /> Back to Website
        </button>

        <div className="flex items-center gap-2.5">
          <span className="text-2xl font-black italic tracking-tighter text-white font-['Outfit']">
            AG<span className="text-[#CCFF00]">X</span>
          </span>
          <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/20 uppercase tracking-widest font-bold flex items-center gap-1.5">
            <Handshake size={12} />
            Partner Portal
          </span>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-lg mx-auto px-6 py-4 sm:py-8 my-auto z-10 flex-shrink-0">
        <div className="p-1 rounded-3xl bg-gradient-to-b from-white/15 via-white/5 to-transparent shadow-2xl">
          <div className="p-6 sm:p-8 rounded-[22px] bg-[#0C0F17] border border-white/10">
            {/* Header / Value Proposition */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#CCFF00]/10 text-[#CCFF00] text-xs font-semibold mb-3 border border-[#CCFF00]/20">
                <DollarSign size={13} />
                <span>10% – 15% Lifetime Deal Commission</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-['Outfit']">
                {mode === 'login' ? 'Partner Login' : 'Become an AGX Partner'}
              </h2>
              <p className="text-xs sm:text-sm text-white/60 mt-1.5 font-light">
                {mode === 'login'
                  ? 'Access your referral dashboard, live milestone payments, and commission payouts.'
                  : 'Monetize your network. Refer clients to AGX and track payments until 100% completion.'}
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-white/5 border border-white/10 mb-6">
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMessage(''); }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mode === 'login'
                    ? 'bg-[#CCFF00] text-black shadow-md'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                <span>Partner Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setErrorMessage(''); }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mode === 'register'
                    ? 'bg-[#CCFF00] text-black shadow-md'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                <span>Apply / Register</span>
              </button>
            </div>

            {/* Google OAuth Quick Button */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white text-xs font-bold transition-all mb-4 cursor-pointer btn-press"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z" />
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2s.7 5.5 1.9 7.9l3.7-2.9z" />
                <path fill="#34A853" d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z" />
              </svg>
              <span>{mode === 'login' ? 'Continue with Google' : 'Register with Google'}</span>
            </button>

            <div className="flex items-center gap-3 my-4">
              <div className="h-px bg-white/10 flex-1" />
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Or with email</span>
              <div className="h-px bg-white/10 flex-1" />
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs mb-4">
                {errorMessage}
              </div>
            )}

            {/* Mode A: Sign In Form */}
            {mode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-[11px] font-mono uppercase tracking-wider text-white/70 block mb-1.5">
                    Partner Email
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="partner@youragency.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-[#CCFF00] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-mono uppercase tracking-wider text-white/70 block mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-[#CCFF00] transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer btn-press mt-2 shadow-lg shadow-[#CCFF00]/15"
                >
                  <span>{isLoading ? 'Signing In...' : 'Enter Partner Portal'}</span>
                  <ArrowRight size={14} />
                </button>
              </form>
            ) : (
              /* Mode B: Registration Form */
              <form onSubmit={handleRegister} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-wider text-white/70 block mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-[#CCFF00]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-wider text-white/70 block mb-1">
                      Agency / Business Name
                    </label>
                    <div className="relative">
                      <Building size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                      <input
                        type="text"
                        value={regCompany}
                        onChange={(e) => setRegCompany(e.target.value)}
                        placeholder="Apex Marketing Ltd."
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-[#CCFF00]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-wider text-white/70 block mb-1">
                      Business Email *
                    </label>
                    <div className="relative">
                      <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="partner@agency.com"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-[#CCFF00]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-wider text-white/70 block mb-1">
                      WhatsApp / Phone
                    </label>
                    <div className="relative">
                      <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-[#CCFF00]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-white/70 block mb-1">
                    Create Password *
                  </label>
                  <div className="relative">
                    <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-[#CCFF00]"
                    />
                  </div>
                </div>

                {/* Payout Preference */}
                <div className="pt-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-white/70 block mb-1">
                    Commission Payout Method
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10 mb-2">
                    {(['UPI', 'Bank Transfer', 'PayPal'] as const).map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPayoutMethod(method)}
                        className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          payoutMethod === method ? 'bg-white/20 text-white shadow-xs' : 'text-white/40 hover:text-white'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>

                  {payoutMethod === 'UPI' && (
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="Enter UPI ID (e.g., yourname@okhdfcbank)"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-[#CCFF00]"
                    />
                  )}

                  {payoutMethod === 'Bank Transfer' && (
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={bankAccount}
                        onChange={(e) => setBankAccount(e.target.value)}
                        placeholder="Account Number"
                        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-[#CCFF00]"
                      />
                      <input
                        type="text"
                        value={bankIfsc}
                        onChange={(e) => setBankIfsc(e.target.value)}
                        placeholder="IFSC Code"
                        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-[#CCFF00]"
                      />
                    </div>
                  )}

                  {payoutMethod === 'PayPal' && (
                    <input
                      type="email"
                      value={paypalEmail}
                      onChange={(e) => setPaypalEmail(e.target.value)}
                      placeholder="PayPal Email Address"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-[#CCFF00]"
                    />
                  )}
                </div>

                <div className="text-[10px] text-white/40 leading-relaxed pt-1">
                  By joining, you agree to AGX's Partner Terms (10% standard commission on milestone payments collected).
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer btn-press shadow-lg shadow-[#CCFF00]/15"
                >
                  <span>{isLoading ? 'Creating Partner Account...' : 'Complete Registration & Get Referral Code'}</span>
                  <ArrowRight size={14} />
                </button>
              </form>
            )}

            {/* Staff CRM Navigation */}
            {onNavigateToStaffLogin && (
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-white/40">
                <span>AGX Employee?</span>
                <button
                  type="button"
                  onClick={onNavigateToStaffLogin}
                  className="text-white/70 hover:text-white font-medium cursor-pointer"
                >
                  Go to Staff CRM Login →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="w-full max-w-7xl mx-auto px-6 py-4 flex-shrink-0 text-center text-white/40 text-[11px] font-mono">
        AGX Partner Network • Enterprise Automation & AI Agency Program
      </div>
    </div>
  );
};
