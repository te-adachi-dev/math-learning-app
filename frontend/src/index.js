import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// WebSocket設定のためのグローバル変数
window.WDS_SOCKET_HOST = process.env.WDS_SOCKET_HOST || '0.0.0.0';
window.WDS_SOCKET_PORT = process.env.WDS_SOCKET_PORT || '3000';
window.WDS_SOCKET_PATH = process.env.WDS_SOCKET_PATH || '/ws';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);