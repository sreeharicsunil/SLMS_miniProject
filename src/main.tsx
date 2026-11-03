import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

class GlobalErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Global React Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F5F4EE',
          fontFamily: 'system-ui, sans-serif',
          padding: '20px'
        }}>
          <div style={{
            maxWidth: '480px',
            backgroundColor: '#ffffff',
            padding: '32px',
            borderRadius: '24px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
            textAlign: 'center',
            border: '1px solid #EAE7DF'
          }}>
            <div style={{ fontSize: '36px', marginBottom: '16px' }}>📚</div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1D1D1F', marginBottom: '8px' }}>
              Smart Library Interface Recovered
            </h2>
            <p style={{ fontSize: '13px', color: '#8A857A', lineHeight: '1.5', marginBottom: '24px' }}>
              A temporary display error was prevented from breaking your session. You can safely reload the page to continue.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: '#1D1D1F',
                color: '#ffffff',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '999px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Refresh Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </StrictMode>,
);
