import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Lock, Mail, X, ArrowRight, Eye, EyeOff
} from 'lucide-react';
import { authService } from '../../lib/authService';
import { toast } from '../../lib/toastStore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onLoginUser?: (user: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess, onLoginUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { profile, error } = await authService.signIn(email, password);
    if (error) {
      toast.error('Authentication Failed', error.message);
    } else if (profile) {
      if (onLoginUser) onLoginUser(profile);
      onClose();
      if (onSuccess) onSuccess();
    }

    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-[#0B0E14] text-white border border-white/10 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
      >
        {/* Neon Glow accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#CCFF00]/15 rounded-full blur-3xl pointer-events-none"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* Logo & Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-[#CCFF00] text-black font-black italic flex items-center justify-center text-xl shadow-md shadow-[#CCFF00]/20">
            A
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-white">
              AG<span className="text-[#CCFF00]">X</span> Enterprise Access
            </h3>
            <p className="text-[11px] text-gray-400">
              Supabase Auth & Session Verification
            </p>
          </div>
        </div>

        {/* Custom Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Work Email Address</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-3 text-gray-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@agxperience.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#CCFF00]"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-3 text-gray-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-10 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#CCFF00]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500 hover:text-white cursor-pointer"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 bg-[#CCFF00] hover:bg-[#b8e600] text-black font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#CCFF00]/20 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Business OS</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
