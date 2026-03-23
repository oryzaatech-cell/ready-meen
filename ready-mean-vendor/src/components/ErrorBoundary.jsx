import { Component } from 'react';
import { RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('App error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6" style={{ background: 'linear-gradient(170deg, #f0f4f7 0%, #f5f8fa 40%, #eef3f6 100%)' }}>
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-5">
            <span className="text-3xl">🐟</span>
          </div>
          <h1 className="text-xl font-bold text-surface-900 mb-2">Something went wrong</h1>
          <p className="text-sm text-surface-400 text-center mb-6 max-w-[280px]">
            Don't worry, your data is safe. Try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-5 py-3 bg-primary-600 text-white text-sm font-semibold rounded-xl shadow-md shadow-primary-600/20 hover:bg-primary-700 transition-colors min-h-[48px]"
          >
            <RefreshCw size={16} />
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
