import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

// Intercept unhandled promise rejections gracefully so they do not crash the app
window.addEventListener('unhandledrejection', (event) => {
  console.warn('Unhandled rejection intercepted gracefully:', event.reason);
  // Prevent default browser error reporting popup if applicable
  event.preventDefault?.();
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
