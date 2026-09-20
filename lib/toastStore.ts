// Lightweight Reactive Toast Notification Store
import { useState, useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type: ToastType;
  duration?: number;
}

type Listener = (toasts: ToastMessage[]) => void;

let toasts: ToastMessage[] = [];
let listeners: Listener[] = [];

function emit() {
  listeners.forEach(l => l([...toasts]));
}

export const toast = {
  show(title: string, message?: string, type: ToastType = 'info', duration: number = 4000) {
    const id = crypto.randomUUID ? crypto.randomUUID() : `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastMessage = { id, title, message, type, duration };
    toasts = [newToast, ...toasts].slice(0, 5); // Keep max 5 toasts
    emit();

    if (duration > 0) {
      setTimeout(() => {
        toast.dismiss(id);
      }, duration);
    }
    return id;
  },

  success(title: string, message?: string, duration = 4000) {
    return toast.show(title, message, 'success', duration);
  },

  error(title: string, message?: string, duration = 5000) {
    return toast.show(title, message, 'error', duration);
  },

  info(title: string, message?: string, duration = 4000) {
    return toast.show(title, message, 'info', duration);
  },

  warning(title: string, message?: string, duration = 4000) {
    return toast.show(title, message, 'warning', duration);
  },

  dismiss(id: string) {
    toasts = toasts.filter(t => t.id !== id);
    emit();
  },

  clear() {
    toasts = [];
    emit();
  }
};

export function useToasts(): ToastMessage[] {
  const [currentToasts, setCurrentToasts] = useState<ToastMessage[]>(toasts);

  useEffect(() => {
    listeners.push(setCurrentToasts);
    return () => {
      listeners = listeners.filter(l => l !== setCurrentToasts);
    };
  }, []);

  return currentToasts;
}
