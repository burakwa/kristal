import React from 'react'
import ReactDOM from 'react-dom/client'

// Polyfill for URL.parse which is missing in Chromium < 126 and required by react-pdf (pdfjs-dist)
if (typeof URL.parse !== 'function') {
  URL.parse = function (url: string | URL, base?: string | URL) {
    try {
      return new URL(url, base);
    } catch (e) {
      return null;
    }
  };
}

import App from './App.tsx'
import "./index.css";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Use contextBridge
if (window.ipcRenderer) {
  window.ipcRenderer.on('main-process-message', (_event, message) => {
    console.log(message)
  })
}
