import React, { useRef, useState } from 'react';
import { Lock, Mail, X, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { authService } from '../../lib/authService';
import { toast } from '../../lib/toastStore';
import { NativeModal } from '../ui/NativeModal';
import { AgxPetalyxBrand } from '../ui/CherryBlossomBackdrop';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onLoginUser?: (user: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onLoginUser,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your work email address.');
      emailRef.current?.focus();
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Please enter your password.');
      passwordRef.current?.focus();
      return;
    }

    setIsLoading(true);
    const { profile, error } = await authService.signIn(email, password);
    if (error) {
      setErrorMessage(error.message || 'Authentication failed.');
      toast.error('Authentication Failed', error.message);
    } else if (profile) {
      if (onLoginUser) onLoginUser(profile);
      onClose();
      if (onSuccess) onSuccess();
    }

    setIsLoading(false);
  };

  return (
    <NativeModal isOpen={isOpen} onClose={onClose} titleId="crm-auth-modal-title">
      <div className="petalyx-theme w-full max-w-md rounded-[28px] p-2 petalyx-card-frost text-[#121410]">
        <div className="rounded-[22px] bg-white/95 p-6 sm:p-8 border border-white/80 relative">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sign in dialog"
            className="absolute top-5 right-5 p-2 rounded-full text-[#121410]/55 hover:text-[#121410] hover:bg-black/5 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-3 mb-6 pr-8">
            <AgxPetalyxBrand compact />
            <div>
              <h2 id="crm-auth-modal-title" className="text-lg font-medium tracking-[-0.02em] text-[#121410]">
                Switch Staff Account
              </h2>
              <p className="text-[11px] text-[#121410]/60">MySQL RBAC Session Verification</p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            method="post"
            aria-labelledby="crm-auth-modal-title"
            noValidate
            className="space-y-4"
          >
            <div>
              <label
                htmlFor="modal-staff-email"
                className="text-[11px] font-semibold uppercase tracking-wide text-[#121410]/80 block mb-1.5"
              >
                Work Email Address
              </label>
              <div className="relative flex items-center">
                <Mail
                  size={15}
                  aria-hidden="true"
                  className="absolute left-3.5 text-[#121410]/45 pointer-events-none"
                />
                <input
                  ref={emailRef}
                  id="modal-staff-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  enterKeyHint="next"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="name@agxperience.com"
                  className="petalyx-input pl-10 pr-4 py-2.5"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="modal-staff-password"
                className="text-[11px] font-semibold uppercase tracking-wide text-[#121410]/80 block mb-1.5"
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
                  ref={passwordRef}
                  id="modal-staff-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  enterKeyHint="done"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="••••••••••••"
                  className="petalyx-input pl-10 pr-12 py-2.5"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-pressed={showPassword}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2 p-2 rounded-lg text-[#121410]/45 hover:text-[#121410] cursor-pointer"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {errorMessage && (
              <div
                role="alert"
                aria-live="assertive"
                className="text-xs text-rose-800 bg-rose-50 border border-rose-200 p-3 rounded-xl"
              >
                {errorMessage}
              </div>
            )}

            <button type="submit" disabled={isLoading} className="petalyx-btn w-full h-11 text-xs gap-2">
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Business OS</span>
                  <ArrowRight size={14} aria-hidden="true" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </NativeModal>
  );
};
