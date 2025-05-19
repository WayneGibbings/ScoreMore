/// <reference types="vite/client" />
import './index.css';

import { createRoot } from 'react-dom/client'; // New API for React 18
import { App } from "./App";

// Import Firebase initialization (no need to initialize Firebase again here)
import './firebase';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container); // Create a root.
  root.render(<App />); // Initial render
} else {
  console.error('Failed to find the root element');
}