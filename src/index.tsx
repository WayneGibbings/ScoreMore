/// <reference types="vite/client" />
import './index.css';
// import React from "react"; // No longer needed for JSX in React 17+ if not using React.something
// import { render } from "react-dom"; // Deprecated in React 18
import { createRoot } from 'react-dom/client'; // New API for React 18
import { App } from "./App";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCHCnCjcT6zzdtQOAoEaD8sy3s99Mu1Wvw",
  authDomain: "scoremore-e9de6.firebaseapp.com",
  projectId: "scoremore-e9de6",
  storageBucket: "scoremore-e9de6.firebasestorage.app",
  messagingSenderId: "901259913548",
  appId: "1:901259913548:web:3ce907a919761e739e87e9",
  measurementId: "G-LWYZXBBNP9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics in a production environment only
let analytics = null;
if (import.meta.env.PROD) {
  analytics = getAnalytics(app);
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container); // Create a root.
  root.render(<App />); // Initial render
} else {
  console.error('Failed to find the root element');
}