import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Support direct backend URL via environment variable in production
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

if (API_BASE_URL) {
  const originalFetch = window.fetch;
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    if (typeof input === 'string') {
      if (input.startsWith('/api') || input.startsWith('/uploads')) {
        input = `${API_BASE_URL}${input}`;
      }
    } else if (input instanceof URL) {
      if (input.pathname.startsWith('/api') || input.pathname.startsWith('/uploads')) {
        input = new URL(`${API_BASE_URL}${input.pathname}${input.search}`);
      }
    }
    return originalFetch(input, init);
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
