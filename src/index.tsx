import './index.css';
// import React from "react"; // No longer needed for JSX in React 17+ if not using React.something
// import { render } from "react-dom"; // Deprecated in React 18
import { createRoot } from 'react-dom/client'; // New API for React 18
import { App } from "./App";

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container); // Create a root.
  root.render(<App />); // Initial render
} else {
  console.error('Failed to find the root element');
}