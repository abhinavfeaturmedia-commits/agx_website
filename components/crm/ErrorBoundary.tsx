import React, { ErrorInfo, ReactNode } from 'react';
import { RefreshCw, Globe, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackRoute?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('CRM Uncaught Error Boundary Caught:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleResetStorage = () => {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('agx_crm_') || key.startsWith('agx_active_portal_token') || key.startsWith('agx_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.warn('Could not clear local storage', e);
    }
    if (typeof window !== 'undefined') {
      if (window.location.pathname.startsWith('/portal')) {
        window.location.href = '/portal';
      } else {
        window.location.href = '/admin/dashboard';
      }
    }
  };

  private handleBackToWebsite = () => {
    if (this.props.fallbackRoute) {
      this.props.fallbackRoute();
    } else {
      window.location.href = '/';
    }
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="crm-theme min-h-screen bg-[#0B0E14] text-white flex items-center justify-center p-6 antialiased">
          <div className="max-w-md w-full bg-[#121620] border border-white/10 rounded-3xl p-8 shadow-2xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-5 shadow-inner">
              <ShieldAlert size={32} />
            </div>

            <h2 className="text-2xl font-black text-white tracking-tight mb-2">
              Workspace Recovery Mode
            </h2>
            <p className="text-xs text-white/60 mb-6 leading-relaxed">
              An unexpected client-side state error occurred while loading this view. You can safely reset your cached state or return to the website.
            </p>

            {this.state.error && (
              <div className="bg-black/60 border border-white/5 rounded-xl p-3 mb-6 text-left max-h-32 overflow-y-auto">
                <p className="text-[11px] font-mono text-rose-300 break-words">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="space-y-2.5">
              <button
                onClick={this.handleResetStorage}
                className="w-full py-3 px-4 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md"
              >
                <RefreshCw size={15} /> Reset Local Cache & Reload
              </button>

              <button
                onClick={this.handleBackToWebsite}
                className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all border border-white/10"
              >
                <Globe size={15} /> Return to Agency Website
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
