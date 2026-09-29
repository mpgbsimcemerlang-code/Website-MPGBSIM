import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('Tertangkap ralat komponen:', error, errorInfo);
  }

  private handleReload = () => {
    try {
      sessionStorage.clear();
    } catch {}
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleClearAllAndRecover = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
    window.location.href = window.location.origin;
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-slate-950 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-5 border border-amber-500/20">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-extrabold text-white mb-2">
              Sistem Mengalami Gangguan Sementara
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Aplikasi telah mengesan ralat operasi kecil. Data rasmi dan pangkalan data Cloud Firestore anda selamat. Sila klik butang di bawah untuk memuat semula sistem secara bersih.
            </p>

            {this.state.error?.message && (
              <div className="mb-5 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-amber-300/80 font-mono text-left overflow-x-auto max-h-24">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-teal-900/40 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Muat Semula Halaman (Segar)</span>
              </button>
              
              <button
                type="button"
                onClick={this.handleClearAllAndRecover}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer border border-slate-700"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>Pulihkan Cache & Mulakan Semula</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
