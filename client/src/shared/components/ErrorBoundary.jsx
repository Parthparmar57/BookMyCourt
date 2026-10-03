import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Captured by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-4 sm:p-6 my-4 bg-rose-50 border-2 border-rose-300 rounded-2xl shadow-md text-rose-950 max-w-2xl mx-auto space-y-4 font-sans animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 border border-rose-300">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1 flex-1">
              <h3 className="text-base font-black text-rose-900 tracking-tight">
                Section Notice & Error Interception
              </h3>
              <p className="text-xs text-rose-800 font-semibold leading-relaxed">
                An unexpected component error occurred, but our application interceptor caught it to keep the rest of your page fully operational.
              </p>
              {this.state.error && (
                <div className="mt-2 p-2.5 bg-white/80 rounded-xl border border-rose-200 font-mono text-[11px] text-rose-800 font-bold overflow-x-auto">
                  {this.state.error.toString()}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-rose-200">
            <button
              onClick={this.handleRetry}
              className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Section</span>
            </button>

            <a
              href="/"
              className="px-4 py-2 bg-white hover:bg-rose-100 text-rose-900 border border-rose-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Home className="w-3.5 h-3.5 text-rose-700" />
              <span>Go to Home</span>
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
