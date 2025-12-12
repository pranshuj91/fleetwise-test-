import React from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console (in production, send to error tracking service)
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI instead of crashing the app
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Alert variant="destructive" className="max-w-2xl">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <h3 className="font-semibold mb-2">Something went wrong</h3>
              <p className="text-sm mb-4">
                We encountered an unexpected error. Please try refreshing the page.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-white text-red-600 rounded hover:bg-gray-100 transition-colors"
              >
                Refresh Page
              </button>
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
