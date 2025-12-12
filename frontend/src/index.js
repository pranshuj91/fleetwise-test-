import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import "@/responsive-optimizations.css";
import App from "@/App";
import ErrorBoundary from "@/components/ErrorBoundary";

// Suppress React Error Overlay in development for non-critical errors
if (process.env.NODE_ENV === 'development') {
  const showErrorOverlay = (err) => {
    // Only show overlay for truly critical errors, not generic "Script error"
    if (err && err.message && err.message !== 'Script error.') {
      const ErrorOverlay = require('react-error-overlay');
      if (ErrorOverlay) {
        ErrorOverlay.reportRuntimeError(err);
      }
    }
  };
  
  window.addEventListener('error', (event) => {
    // Suppress generic "Script error" from showing overlay
    if (event.message === 'Script error.') {
      event.preventDefault();
      console.warn('Generic script error suppressed from overlay');
    }
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    // Log but don't crash for unhandled promise rejections
    console.error('Unhandled promise rejection:', event.reason);
  });
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
