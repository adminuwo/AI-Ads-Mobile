import React from 'react'
import ReactDOM from 'react-dom/client'
import './config/i18n.js'
import App from './App.jsx'
import { ErrorBoundary } from './components/common/ErrorBoundary.jsx'
import './styles/index.css'

import { GoogleOAuthProvider } from '@react-oauth/google';
import { GOOGLE_CLIENT_ID } from './config/googleAuth.js';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <App />
      </GoogleOAuthProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
