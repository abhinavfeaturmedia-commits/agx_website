import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Shield,
  Sparkles,
  KeyRound,
  ArrowRight,
  Handshake,
} from 'lucide-react';
import { UserRole, UserProfile } from '../../types/crm';
import { authService } from '../../lib/authService';
import { toast } from '../../lib/toastStore';
import {
  AuthGatewayHeader,
  CherryBlossomBackdrop,
  GatewayType,
} from '../ui/CherryBlossomBackdrop';

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
  onNavigateToPartnerPortal,
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

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const tokenRef = useRef<HTMLInputElement>(null);

  const handleGatewaySwitch = (target: GatewayType) => {
    if (target === 'staff') {
      setActiveTab('staff');
      setErrorMessage('');
    } else if (target === 'client') {
      setActiveTab('client');
      setErrorMessage('');
    } else if (target === 'partner' && onNavigateToPartnerPortal) {
      onNavigateToPartnerPortal();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your work email address.');
      setShakeTrigger((prev) => prev + 1);
      emailRef.current?.focus();
      return;
    }

    if (!password.trim()) {
      setErrorMessage('Please enter your password.');
      setShakeTrigger((prev) => prev + 1);
      passwordRef.current?.focus();
      return;
    }

    setIsLoading(true);
    const { profile, error } = await authService.signIn(email, password);
    if (error) {
      setErrorMessage(error.message || 'Invalid credentials or staff account not found.');
      setShakeTrigger((prev) => prev + 1);
      toast.error('Sign In Failed', error.message);
    } else if (profile) {
      toast.success('Access Granted', `Welcome back, ${profile.fullName}`);
      onLoginSuccess(profile.role, profile);
    }

    setIsLoading(false);
  };

  const handleClientTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const tokenClean = clientToken.trim();
    if (!tokenClean) {
      setErrorMessage('Please enter your confidential project access token.');
      setShakeTrigger((prev) => prev + 1);
      tokenRef.current?.focus();
      toast.error('Token Required', 'Please enter your project access token.');
      return;
    }
    if (onNavigateToPortal) {
      onNavigateToPortal(tokenClean);
    } else {
      window.location.href = `/portal?token=${encodeURIComponent(tokenClean)}`;
    }
  };

  const existingStaff = authService.getStaffSession();

  return (
    <div className="petalyx-theme min-h-screen w-full relative flex flex-col justify-between overflow-x-hidden overflow-y-auto bg-[#e9eee0] text-[#121410] selection:bg-[#b4cd52] selection:text-[#121410]">
      <CherryBlossomBackdrop petalCount={14} variant="day" showGlassSquares />

      <AuthGatewayHeader
        activeGateway={activeTab === 'client' ? 'client' : 'staff'}
        badgeLabel={activeTab === 'client' ? 'Client Portal' : 'Staff Gateway'}
        onBackToWebsite={onBackToWebsite}
        onSwitchGateway={handleGatewaySwitch}
      />

      {/* Main Frosted Double-Bezel Card */}
      <main className="relative z-10 w-full max-w-[460px] mx-auto px-4 sm:px-6 py-6 my-auto shrink-0">
        <motion.div
          key={shakeTrigger}
          initial={shakeTrigger > 0 ? { x: [-10, 10, -7, 7, -3, 3, 0] } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          transition={{ duration: shakeTrigger > 0 ? 0.35 : 0.6, ease: 'easeOut' }}
          className="rounded-[28px] p-2 petalyx-card-frost"
        >
          <div className="rounded-[22px] p-6 sm:p-8 bg-white/92 backdrop-blur-md border border-white/80">
            {/* Gateway Tab Switcher */}
            <div
              role="tablist"
              aria-label="Access mode"
              className="grid grid-cols-2 p-1 rounded-full bg-[var(--pill)] border border-[var(--line)] mb-6"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'staff'}
                onClick={() => {
                  setActiveTab('staff');
                  setErrorMessage('');
                }}
                className={`py-2 px-3 rounded-full text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[38px] ${
                  activeTab === 'staff'
                    ? 'bg-[var(--olive)] text-[#f3f8e4] shadow-sm'
                    : 'text-[#2c3a10]/75 hover:text-[#121410]'
                }`}
              >
                <Lock size={12} aria-hidden="true" />
                <span>Staff Gateway</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'client'}
                onClick={() => {
                  setActiveTab('client');
                  setErrorMessage('');
                }}
                className={`py-2 px-3 rounded-full text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[38px] ${
                  activeTab === 'client'
                    ? 'bg-[var(--olive)] text-[#f3f8e4] shadow-sm'
                    : 'text-[#2c3a10]/75 hover:text-[#121410]'
                }`}
              >
                <Sparkles size={12} aria-hidden="true" />
                <span>Client Portal</span>
              </button>
            </div>

            {activeTab === 'staff' && (
              <>
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--pill)] text-[var(--olive)] flex items-center justify-center mx-auto mb-3 border border-[var(--lime)]/45">
                    <Lock size={20} aria-hidden="true" />
                  </div>
                  <h1 id="staff-login-heading" className="text-2xl font-normal tracking-[-0.03em] text-[#121410]">
                    Staff Command Center
                  </h1>
                  <p className="text-xs text-[#121410]/65 mt-1">
                    Internal AGXperience access with verified role permissions
                  </p>
                </div>

                {/* Active Staff Session Detection */}
                {existingStaff && (
                  <div className="mb-5 p-3.5 rounded-2xl bg-[var(--pill)]/85 border border-[var(--lime)]/55 text-xs">
                    <div className="flex items-center gap-3 mb-2.5">
                      <img
                        src={
                          existingStaff.avatarUrl ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                        }
                        alt={existingStaff.fullName}
                        className="w-9 h-9 rounded-full border border-[var(--olive)]/30 object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[var(--olive)] animate-pulse" />
                          <span className="font-semibold text-[#121410] text-xs block truncate">
                            {existingStaff.fullName}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#121410]/65 block truncate">
                          {existingStaff.email} • {existingStaff.role}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onLoginSuccess(existingStaff.role, existingStaff)}
                        className="flex-1 petalyx-btn h-9 text-xs"
                      >
                        Continue to Workspace →
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          authService.clearStaffSession();
                          setErrorMessage('');
                          toast.info('Session Cleared', 'You can now sign in with another account.');
                          setEmail('');
                          setPassword('');
                        }}
                        className="py-2 px-3 rounded-full bg-white hover:bg-black/5 text-[#121410]/75 hover:text-[#121410] text-xs font-semibold cursor-pointer border border-black/10 min-h-[36px]"
                      >
                        Switch
                      </button>
                    </div>
                  </div>
                )}

                <form
                  onSubmit={handleSubmit}
                  method="post"
                  aria-labelledby="staff-login-heading"
                  noValidate
                  className="space-y-4"
                >
                  <div>
                    <label
                      htmlFor="staff-email"
                      className="block text-[11px] font-semibold text-[#121410]/80 tracking-wide uppercase mb-1.5"
                    >
                      Work Email
                    </label>
                    <div className="relative flex items-center">
                      <Mail
                        size={15}
                        aria-hidden="true"
                        className="absolute left-3.5 text-[#121410]/45 pointer-events-none"
                      />
                      <input
                        ref={emailRef}
                        id="staff-email"
                        name="email"
                        type="email"
                        autoComplete="username"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errorMessage) setErrorMessage('');
                        }}
                        required
                        aria-invalid={Boolean(errorMessage && !email.trim())}
                        enterKeyHint="next"
                        placeholder="name@agxperience.com"
                        className="petalyx-input pl-10 pr-4 py-2.5"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="staff-password"
                        className="block text-[11px] font-semibold text-[#121410]/80 tracking-wide uppercase"
                      >
                        Password
                      </label>
                      <span className="text-[10px] font-mono text-[#121410]/45">MySQL RBAC</span>
                    </div>
                    <div className="relative flex items-center">
                      <Lock
                        size={15}
                        aria-hidden="true"
                        className="absolute left-3.5 text-[#121410]/45 pointer-events-none"
                      />
                      <input
                        ref={passwordRef}
                        id="staff-password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (errorMessage) setErrorMessage('');
                        }}
                        required
                        aria-invalid={Boolean(errorMessage && !password.trim())}
                        enterKeyHint="done"
                        placeholder="••••••••••••"
                        className="petalyx-input pl-10 pr-12 py-2.5"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-pressed={showPassword}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-2 p-2 rounded-lg text-[#121410]/45 hover:text-[#121410] transition-colors cursor-pointer"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#121410]/70 pt-0.5">
                    <label className="inline-flex items-center gap-2 cursor-pointer select-none py-1">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-[#dce3d1] accent-[var(--olive)] cursor-pointer"
                      />
                      <span>Remember session</span>
                    </label>
                  </div>

                  {errorMessage && (
                    <div
                      role="alert"
                      aria-live="assertive"
                      className="text-xs text-rose-800 bg-rose-50 border border-rose-200 p-3 rounded-xl leading-relaxed"
                    >
                      {errorMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="petalyx-btn w-full h-11 text-xs font-semibold gap-2"
                  >
                    {isLoading ? (
                      <span className="w-4 h-4 border-2 border-[#f3f8e4] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Shield size={14} aria-hidden="true" />
                        <span>Sign In to Staff Gateway</span>
                      </>
                    )}
                  </button>
                </form>
              </>
            )}

            {activeTab === 'client' && (
              <div className="space-y-5">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--pill)] text-[var(--olive)] flex items-center justify-center mx-auto mb-3 border border-[var(--lime)]/45">
                    <KeyRound size={20} aria-hidden="true" />
                  </div>
                  <h1 id="client-token-heading" className="text-2xl font-normal tracking-[-0.03em] text-[#121410]">
                    Client Project Portal
                  </h1>
                  <p className="text-xs text-[#121410]/65 mt-1">
                    Enter your confidential project token to access deliverables &amp; tickets
                  </p>
                </div>

                <form
                  onSubmit={handleClientTokenSubmit}
                  method="post"
                  aria-labelledby="client-token-heading"
                  noValidate
                  className="space-y-4"
                >
                  <div>
                    <label
                      htmlFor="client-token"
                      className="block text-[11px] font-semibold text-[#121410]/80 tracking-wide uppercase mb-1.5"
                    >
                      Project Access Token
                    </label>
                    <div className="relative flex items-center">
                      <KeyRound
                        size={15}
                        aria-hidden="true"
                        className="absolute left-3.5 text-[#121410]/45 pointer-events-none"
                      />
                      <input
                        ref={tokenRef}
                        id="client-token"
                        name="client-token"
                        type="text"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        value={clientToken}
                        onChange={(e) => {
                          setClientToken(e.target.value);
                          if (errorMessage) setErrorMessage('');
                        }}
                        required
                        enterKeyHint="go"
                        placeholder="e.g., prj_sec_a8bcd5"
                        className="petalyx-input pl-10 pr-4 py-2.5 font-mono"
                      />
                    </div>
                  </div>

                  {errorMessage && (
                    <div
                      role="alert"
                      aria-live="assertive"
                      className="text-xs text-rose-800 bg-rose-50 border border-rose-200 p-3 rounded-xl leading-relaxed"
                    >
                      {errorMessage}
                    </div>
                  )}

                  <button type="submit" className="petalyx-btn w-full h-11 text-xs font-semibold gap-2">
                    <span>Open Project Portal</span>
                    <ArrowRight size={13} aria-hidden="true" />
                  </button>
                </form>

                <div className="pt-3 border-t border-[var(--line)] text-center text-[11px] text-[#121410]/55">
                  Confidential project workspace. Contact your delivery lead if you need a new token.
                </div>
              </div>
            )}

            {/* Referral Partner Portal Navigation */}
            {onNavigateToPartnerPortal && (
              <div className="mt-5 pt-4 border-t border-[var(--line)] flex items-center justify-between text-xs text-[#121410]/65">
                <span>Affiliate or Referral Partner?</span>
                <button
                  type="button"
                  onClick={onNavigateToPartnerPortal}
                  className="text-[var(--olive)] hover:text-[#5a7c14] font-semibold cursor-pointer inline-flex items-center gap-1.5 transition-colors"
                >
                  <Handshake size={13} aria-hidden="true" />
                  <span>Partner Portal →</span>
                </button>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-[var(--line)] text-center text-[10.5px] text-[#121410]/50 flex items-center justify-center gap-2 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--olive)] animate-pulse" />
              AES-256 Encrypted • Zero-Trust Gateway
            </div>
          </div>
        </motion.div>
      </main>

      <footer className="relative z-10 w-full text-center py-5 shrink-0 text-[11px] text-[#121410]/50">
        © {new Date().getFullYear()} AGXperience Inc. (AGX) • Command Center Gateway. All rights reserved.
      </footer>
    </div>
  );
};

export default AdminLogin;
