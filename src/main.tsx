/**
 * Application Entry Point
 *
 * Mounts the root React application into the DOM tree with StrictMode verification.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root DOM element "#root" not found in document.');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
