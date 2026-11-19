import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  Mail,
  Lock,
  User,
  Building,
  Phone,
  ArrowRight,
  Sparkles,
  Eye,
  EyeOff,
} from 'lucide-react';
import { authService } from '../../lib/authService';
import { toast } from '../../lib/toastStore';
import { Partner } from '../../types/crm';
import {
  AuthGatewayHeader,
  CherryBlossomBackdrop,
  GatewayType,
} from '../ui/CherryBlossomBackdrop';

interface PartnerAuthProps {
  onLoginSuccess: (partner: Partner) => void;
  onBackToWebsite: () => void;
  onNavigateToStaffLogin?: () => void;
  onNavigateToPortal?: () => void;
  initialMode?: 'login' | 'register';
}

export const PartnerAuth: React.FC<PartnerAuthProps> = ({
  onLoginSuccess,
  onBackToWebsite,
  onNavigateToStaffLogin,
  onNavigateToPortal,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [shakeTrigger, setShakeTrigger] = useState(0);

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);

  const loginEmailRef = useRef<HTMLInputElement>(null);
  const loginPassRef = useRef<HTMLInputElement>(null);
  const regNameRef = useRef<HTMLInputElement>(null);
  const regEmailRef = useRef<HTMLInputElement>(null);
  const regPassRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

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

  const handleGatewaySwitch = (target: GatewayType) => {
    if (target === 'staff' && onNavigateToStaffLogin) {
      onNavigateToStaffLogin();
    } else if (target === 'client' && onNavigateToPortal) {
      onNavigateToPortal();
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!loginEmail.trim()) {
      setErrorMessage('Please enter your partner email address.');
      setShakeTrigger((prev) => prev + 1);
      loginEmailRef.current?.focus();
      return;
    }

    if (!loginPassword.trim()) {
      setErrorMessage('Please enter your password.');
      setShakeTrigger((prev) => prev + 1);
      loginPassRef.current?.focus();
      return;
    }

    setIsLoading(true);
    const { partner, error } = await authService.partnerSignIn(loginEmail, loginPassword);
    if (error) {
      setErrorMessage(error.message || 'Login failed. Please check your credentials.');
      setShakeTrigger((prev) => prev + 1);
      toast.error('Partner Login Failed', error.message);
    } else if (partner) {
      toast.success('Welcome Back!', `Logged in as ${partner.name}`);
      onLoginSuccess(partner);
    }
    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!regName.trim()) {
      setErrorMessage('Full name is required.');
      setShakeTrigger((prev) => prev + 1);
      regNameRef.current?.focus();
      return;
    }
    if (!regEmail.trim()) {
      setErrorMessage('Business email is required.');
      setShakeTrigger((prev) => prev + 1);
      regEmailRef.current?.focus();
      return;
    }
    if (!regPassword.trim() || regPassword.trim().length < 6) {
      setErrorMessage('Please create a password with at least 6 characters.');
      setShakeTrigger((prev) => prev + 1);
      regPassRef.current?.focus();
      return;
    }

    setIsLoading(true);
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
      payoutDetails,
    });

    if (error) {
      setErrorMessage(error.message || 'Registration failed. Please try again.');
      setShakeTrigger((prev) => prev + 1);
      toast.error('Registration Failed', error.message);
    } else if (partner) {
      toast.success('Partner Account Created!', `Your unique referral code is ${partner.referralCode}`);
      onLoginSuccess(partner);
    }
    setIsLoading(false);
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setErrorMessage('');
    const { partner, error } = await authService.signInWithGooglePartner();
    if (error) {
      setErrorMessage(error.message || 'Google authentication error. Please try again.');
      setShakeTrigger((prev) => prev + 1);
      toast.error('Google Sign-In Error', error.message);
      setIsLoading(false);
    } else if (partner) {
      toast.success('Welcome Back!', `Signed in with Google as ${partner.name}`);
      onLoginSuccess(partner);
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  };

  const existingPartner = authService.getCurrentPartner();

  return (
    <div className="petalyx-theme min-h-screen w-full relative flex flex-col justify-between overflow-x-hidden overflow-y-auto bg-[#e9eee0] text-[#121410] selection:bg-[#b4cd52] selection:text-[#121410]">
      <CherryBlossomBackdrop petalCount={14} variant="day" showGlassSquares />

      <AuthGatewayHeader
        activeGateway="partner"
        badgeLabel="Partner Gateway"
        onBackToWebsite={onBackToWebsite}
        onSwitchGateway={
          onNavigateToStaffLogin || onNavigateToPortal ? handleGatewaySwitch : undefined
        }
      />

      {/* Main Frosted Double-Bezel Card */}
      <main className="relative z-10 w-full max-w-[520px] mx-auto px-4 sm:px-6 py-6 my-auto shrink-0">
        <motion.div
          key={shakeTrigger}
          initial={shakeTrigger > 0 ? { x: [-10, 10, -7, 7, -3, 3, 0] } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          transition={{ duration: shakeTrigger > 0 ? 0.35 : 0.6, ease: 'easeOut' }}
          className="rounded-[28px] p-2 petalyx-card-frost"
        >
          <div className="rounded-[22px] p-6 sm:p-8 bg-white/92 backdrop-blur-md border border-white/80">
            {/* Value Proposition Header */}
            <div className="text-center mb-6">
              <span className="petalyx-pill mb-2.5 inline-flex items-center gap-1.5">
                <Sparkles size={12} aria-hidden="true" />
                10% – 15% Lifetime Deal Commission
              </span>
              <h1
                id="partner-auth-heading"
                className="text-2xl sm:text-[28px] font-normal tracking-[-0.03em] text-[#121410] mt-1"
              >
                {mode === 'login' ? 'Partner Command Center' : 'Become an AGX Partner'}
              </h1>
              <p className="text-xs text-[#121410]/65 mt-1.5 max-w-sm mx-auto leading-relaxed">
                {mode === 'login'
                  ? 'Access your referral dashboard, live milestone payouts, and client project tracking.'
                  : 'Monetize your network. Refer businesses to AGX and earn on verified milestone payments.'}
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div
              role="tablist"
              aria-label="Partner authentication mode"
              className="grid grid-cols-2 p-1 rounded-full bg-[var(--pill)] border border-[var(--line)] mb-6"
            >
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'login'}
                onClick={() => {
                  setMode('login');
                  setErrorMessage('');
                }}
                className={`py-2 px-3 rounded-full text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[38px] ${
                  mode === 'login'
                    ? 'bg-[var(--olive)] text-[#f3f8e4] shadow-sm'
                    : 'text-[#2c3a10]/75 hover:text-[#121410]'
                }`}
              >
                <Lock size={12} aria-hidden="true" />
                <span>Partner Sign In</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'register'}
                onClick={() => {
                  setMode('register');
                  setErrorMessage('');
                }}
                className={`py-2 px-3 rounded-full text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[38px] ${
                  mode === 'register'
                    ? 'bg-[var(--olive)] text-[#f3f8e4] shadow-sm'
                    : 'text-[#2c3a10]/75 hover:text-[#121410]'
                }`}
              >
                <Sparkles size={12} aria-hidden="true" />
                <span>Apply / Register</span>
              </button>
            </div>

            {/* Active Partner Session Resume Widget */}
            {existingPartner && (
              <div className="mb-5 p-3.5 rounded-2xl bg-[var(--pill)]/85 border border-[var(--lime)]/55 text-xs">
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="w-9 h-9 rounded-full bg-[var(--olive)] text-[#f3f8e4] font-bold text-xs flex items-center justify-center">
                    {existingPartner.name?.charAt(0) || 'P'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[var(--olive)] animate-pulse" />
                      <span className="font-semibold text-[#121410] text-xs block truncate">
                        {existingPartner.name}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#121410]/65 block truncate">
                      {existingPartner.email} • Code:{' '}
                      <strong className="text-[#121410]">{existingPartner.referralCode}</strong>
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onLoginSuccess(existingPartner)}
                    className="flex-1 petalyx-btn h-9 text-xs"
                  >
                    Enter Partner Portal →
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      authService.clearPartnerSession();
                      setErrorMessage('');
                      toast.info('Session Cleared', 'You can now sign in with another partner account.');
                      setLoginEmail('');
                      setLoginPassword('');
                    }}
                    className="py-2 px-3 rounded-full bg-white hover:bg-black/5 text-[#121410]/75 hover:text-[#121410] text-xs font-semibold cursor-pointer border border-black/10 min-h-[36px]"
                  >
                    Switch
                  </button>
                </div>
              </div>
            )}

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-white hover:bg-[#f7faf2] border border-[#dce3d1] text-[#121410] text-xs font-semibold transition-all mb-4 cursor-pointer min-h-[44px]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2s.7 5.5 1.9 7.9l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
                />
              </svg>
              <span>{mode === 'login' ? 'Continue with Google' : 'Register with Google'}</span>
            </button>

            <div className="flex items-center gap-3 my-4">
              <div className="h-px bg-[var(--line)] flex-1" />
              <span className="text-[10px] font-semibold text-[#121410]/45 uppercase tracking-widest">
                Or with email
              </span>
              <div className="h-px bg-[var(--line)] flex-1" />
            </div>

            {errorMessage && (
              <div
                role="alert"
                aria-live="assertive"
                className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs mb-4 leading-relaxed"
              >
                {errorMessage}
              </div>
            )}

            {mode === 'login' ? (
              <form
                onSubmit={handleLogin}
                method="post"
                aria-labelledby="partner-auth-heading"
                noValidate
                className="space-y-4"
              >
                <div>
                  <label
                    htmlFor="partner-login-email"
                    className="text-[11px] font-semibold text-[#121410]/80 uppercase tracking-wide block mb-1.5"
                  >
                    Partner Email
                  </label>
                  <div className="relative flex items-center">
                    <Mail
                      size={15}
                      aria-hidden="true"
                      className="absolute left-3.5 text-[#121410]/45 pointer-events-none"
                    />
                    <input
                      ref={loginEmailRef}
                      id="partner-login-email"
                      name="email"
                      type="email"
                      required
                      autoComplete="username"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      enterKeyHint="next"
                      value={loginEmail}
                      onChange={(e) => {
                        setLoginEmail(e.target.value);
                        if (errorMessage) setErrorMessage('');
                      }}
                      placeholder="partner@youragency.com"
                      className="petalyx-input pl-10 pr-4 py-2.5"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="partner-login-password"
                    className="text-[11px] font-semibold text-[#121410]/80 uppercase tracking-wide block mb-1.5"
                  >
                    Password
                  </label>
                  <div className="relative flex items-center">
                    <Lock
                      size={15}
                      aria-hidden="true"
                      className="absolute left-3.5 text-[#121410]/45 pointer-events-none"
                    />
                    <input
                      ref={loginPassRef}
                      id="partner-login-password"
                      name="password"
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      enterKeyHint="done"
                      value={loginPassword}
                      onChange={(e) => {
                        setLoginPassword(e.target.value);
                        if (errorMessage) setErrorMessage('');
                      }}
                      placeholder="••••••••••••"
                      className="petalyx-input pl-10 pr-12 py-2.5"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword((prev) => !prev)}
                      aria-pressed={showLoginPassword}
                      aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-2 p-2 rounded-lg text-[#121410]/45 hover:text-[#121410] cursor-pointer"
                    >
                      {showLoginPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={isLoading} className="petalyx-btn w-full h-11 text-xs mt-2 gap-1.5">
                  <span>{isLoading ? 'Signing In...' : 'Sign In to Partner Portal'}</span>
                  <ArrowRight size={14} aria-hidden="true" />
                </button>
              </form>
            ) : (
              <form
                onSubmit={handleRegister}
                method="post"
                aria-labelledby="partner-auth-heading"
                noValidate
                className="space-y-3.5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="partner-reg-name"
                      className="text-[10.5px] font-semibold text-[#121410]/80 uppercase tracking-wide block mb-1"
                    >
                      Full Name <span aria-hidden="true">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <User
                        size={14}
                        aria-hidden="true"
                        className="absolute left-3 text-[#121410]/45 pointer-events-none"
                      />
                      <input
                        ref={regNameRef}
                        id="partner-reg-name"
                        name="name"
                        type="text"
                        required
                        autoComplete="name"
                        enterKeyHint="next"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="Aarav Sharma"
                        className="petalyx-input pl-9 pr-3 py-2"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="partner-reg-company"
                      className="text-[10.5px] font-semibold text-[#121410]/80 uppercase tracking-wide block mb-1"
                    >
                      Agency / Business
                    </label>
                    <div className="relative flex items-center">
                      <Building
                        size={14}
                        aria-hidden="true"
                        className="absolute left-3 text-[#121410]/45 pointer-events-none"
                      />
                      <input
                        id="partner-reg-company"
                        name="organization"
                        type="text"
                        autoComplete="organization"
                        enterKeyHint="next"
                        value={regCompany}
                        onChange={(e) => setRegCompany(e.target.value)}
                        placeholder="Apex Media Ltd."
                        className="petalyx-input pl-9 pr-3 py-2"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="partner-reg-email"
                      className="text-[10.5px] font-semibold text-[#121410]/80 uppercase tracking-wide block mb-1"
                    >
                      Business Email <span aria-hidden="true">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <Mail
                        size={14}
                        aria-hidden="true"
                        className="absolute left-3 text-[#121410]/45 pointer-events-none"
                      />
                      <input
                        ref={regEmailRef}
                        id="partner-reg-email"
                        name="email"
                        type="email"
                        required
                        autoComplete="username"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        enterKeyHint="next"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="partner@agency.com"
                        className="petalyx-input pl-9 pr-3 py-2"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="partner-reg-phone"
                      className="text-[10.5px] font-semibold text-[#121410]/80 uppercase tracking-wide block mb-1"
                    >
                      WhatsApp / Phone
                    </label>
                    <div className="relative flex items-center">
                      <Phone
                        size={14}
                        aria-hidden="true"
                        className="absolute left-3 text-[#121410]/45 pointer-events-none"
                      />
                      <input
                        id="partner-reg-phone"
                        name="tel"
                        type="tel"
                        autoComplete="tel"
                        inputMode="tel"
                        enterKeyHint="next"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="petalyx-input pl-9 pr-3 py-2"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="partner-reg-password"
                    className="text-[10.5px] font-semibold text-[#121410]/80 uppercase tracking-wide block mb-1"
                  >
                    Create Password <span aria-hidden="true">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <Lock
                      size={14}
                      aria-hidden="true"
                      className="absolute left-3 text-[#121410]/45 pointer-events-none"
                    />
                    <input
                      ref={regPassRef}
                      id="partner-reg-password"
                      name="new-password"
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      autoComplete="new-password"
                      aria-describedby="partner-password-hint"
                      enterKeyHint="done"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="petalyx-input pl-9 pr-11 py-2"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword((prev) => !prev)}
                      aria-pressed={showRegPassword}
                      aria-label={showRegPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-2 p-2 rounded-lg text-[#121410]/45 hover:text-[#121410] cursor-pointer"
                    >
                      {showRegPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  <p id="partner-password-hint" className="text-[10.5px] text-[#121410]/50 mt-1">
                    At least 6 characters. Browser password generators supported.
                  </p>
                </div>

                {/* Accessible Payout Preference Fieldset */}
                <fieldset className="pt-1 border-0 p-0 m-0">
                  <legend className="text-[10.5px] font-semibold text-[#121410]/80 uppercase tracking-wide mb-1.5">
                    Commission Payout Method
                  </legend>
                  <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[var(--pill)] border border-[var(--line)] mb-2">
                    {(['UPI', 'Bank Transfer', 'PayPal'] as const).map((method) => {
                      const active = payoutMethod === method;
                      return (
                        <label
                          key={method}
                          className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold text-center transition-all cursor-pointer select-none ${
                            active
                              ? 'bg-[var(--olive)] text-[#f3f8e4] shadow-xs'
                              : 'text-[#2c3a10]/75 hover:text-[#121410]'
                          }`}
                        >
                          <input
                            type="radio"
                            name="payoutMethod"
                            value={method}
                            checked={active}
                            onChange={() => setPayoutMethod(method)}
                            className="sr-only"
                          />
                          {method}
                        </label>
                      );
                    })}
                  </div>

                  {payoutMethod === 'UPI' && (
                    <input
                      type="text"
                      aria-label="UPI ID"
                      spellCheck={false}
                      autoCapitalize="none"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="Enter UPI ID (e.g., yourname@okhdfcbank)"
                      className="petalyx-input px-3 py-2"
                    />
                  )}

                  {payoutMethod === 'Bank Transfer' && (
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        aria-label="Bank account number"
                        inputMode="numeric"
                        value={bankAccount}
                        onChange={(e) => setBankAccount(e.target.value)}
                        placeholder="Account Number"
                        className="petalyx-input px-3 py-2"
                      />
                      <input
                        type="text"
                        aria-label="IFSC code"
                        spellCheck={false}
                        autoCapitalize="characters"
                        value={bankIfsc}
                        onChange={(e) => setBankIfsc(e.target.value)}
                        placeholder="IFSC Code"
                        className="petalyx-input px-3 py-2"
                      />
                    </div>
                  )}

                  {payoutMethod === 'PayPal' && (
                    <input
                      type="email"
                      aria-label="PayPal email address"
                      spellCheck={false}
                      autoCapitalize="none"
                      value={paypalEmail}
                      onChange={(e) => setPaypalEmail(e.target.value)}
                      placeholder="PayPal Email Address"
                      className="petalyx-input px-3 py-2"
                    />
                  )}
                </fieldset>

                <p className="text-[10.5px] text-[#121410]/55 leading-relaxed pt-1">
                  By joining, you agree to AGX's Partner Terms (10% standard deal commission on verified client
                  milestone payments).
                </p>

                <button type="submit" disabled={isLoading} className="petalyx-btn w-full h-11 text-xs mt-2 gap-1.5">
                  <span>{isLoading ? 'Creating Partner Account...' : 'Create Partner Account'}</span>
                  <ArrowRight size={14} aria-hidden="true" />
                </button>
              </form>
            )}

            {onNavigateToStaffLogin && (
              <div className="mt-6 pt-4 border-t border-[var(--line)] flex items-center justify-between text-xs text-[#121410]/65">
                <span>AGX Staff Member?</span>
                <button
                  type="button"
                  onClick={onNavigateToStaffLogin}
                  className="text-[var(--olive)] hover:underline font-semibold cursor-pointer"
                >
                  Staff Command Center →
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </main>

      <footer className="relative z-10 w-full max-w-6xl mx-auto px-6 py-4 shrink-0 text-center text-[#121410]/50 text-[11px] font-medium">
        AGX Partner Network • Enterprise Automation &amp; Custom Software Agency Program • Pune, India
      </footer>
    </div>
  );
};
