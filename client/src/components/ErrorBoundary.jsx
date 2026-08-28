import React from 'react';
import { AlertCircle, RotateCcw, Home, ShieldAlert } from 'lucide-react';
import Button from './ui/Button';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("Genesis CareerFit UI Runtime Crash Caught:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const isDev = import.meta.env.DEV || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      return (
        <div className="min-h-screen bg-[#F7F7F5] flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-white border border-genesis-border rounded-2xl shadow-elevated p-8 text-center space-y-6">
            <div className="w-12 h-12 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-subtle">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-black text-genesis-black tracking-tight">
                Genesis CareerFit couldn't load this workspace
              </h1>
              <p className="text-xs text-genesis-muted leading-relaxed font-medium">
                An unexpected interface state occurred. Your assessment records and data integrity remain secure.
              </p>
            </div>

            {isDev && this.state.error && (
              <div className="p-3 bg-zinc-900 text-zinc-300 rounded-xl text-left text-[11px] font-mono overflow-x-auto max-h-40 border border-zinc-800">
                <div className="text-rose-400 font-bold mb-1">{this.state.error.toString()}</div>
                <div className="text-zinc-500 text-[10px] whitespace-pre-wrap">
                  {this.state.errorInfo?.componentStack || this.state.error.stack}
                </div>
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="outline"
                size="md"
                icon={RotateCcw}
                onClick={this.handleReset}
                className="text-xs font-bold"
              >
                Retry
              </Button>
              <Button
                variant="primary"
                size="md"
                icon={Home}
                onClick={() => {
                  window.location.href = '/';
                }}
                className="text-xs font-black"
              >
                Return Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
