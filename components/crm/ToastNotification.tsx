import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useToasts, toast, ToastType } from '../../lib/toastStore';

const TOAST_ICONS: Record<ToastType, React.ElementType> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle
};

const TOAST_STYLES: Record<ToastType, { bg: string; border: string; iconColor: string; titleColor: string }> = {
  success: {
    bg: 'bg-emerald-950/90 text-white',
    border: 'border-emerald-500/40 shadow-emerald-500/10',
    iconColor: 'text-emerald-400',
    titleColor: 'text-white'
  },
  error: {
    bg: 'bg-rose-950/90 text-white',
    border: 'border-rose-500/40 shadow-rose-500/10',
    iconColor: 'text-rose-400',
    titleColor: 'text-white'
  },
  info: {
    bg: 'bg-slate-900/90 text-white',
    border: 'border-blue-500/40 shadow-blue-500/10',
    iconColor: 'text-blue-400',
    titleColor: 'text-white'
  },
  warning: {
    bg: 'bg-amber-950/90 text-white',
    border: 'border-amber-500/40 shadow-amber-500/10',
    iconColor: 'text-amber-400',
    titleColor: 'text-white'
  }
};

export const ToastNotification: React.FC = () => {
  const toasts = useToasts();

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = TOAST_ICONS[t.type];
          const style = TOAST_STYLES[t.type];

          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto backdrop-blur-xl border rounded-2xl p-4 shadow-xl flex items-start gap-3 relative ${style.bg} ${style.border}`}
            >
              <Icon size={20} className={`${style.iconColor} shrink-0 mt-0.5`} />
              <div className="flex-1 min-w-0 pr-4">
                <h4 className={`text-xs font-bold ${style.titleColor}`}>{t.title}</h4>
                {t.message && (
                  <p className="text-[11px] text-gray-300 mt-0.5 leading-relaxed break-words">
                    {t.message}
                  </p>
                )}
              </div>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="text-gray-400 hover:text-white transition-colors shrink-0 cursor-pointer p-0.5"
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
