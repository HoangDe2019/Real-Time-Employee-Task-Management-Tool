import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './ui/App.jsx';

// Create React root
const container = document.getElementById('root');
const root = createRoot(container);

// Render application
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


