import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { initPlatformSecurityShield } from './lib/antiTamper'

// Initialize client-side anti-tamper and source protection shield
initPlatformSecurityShield()

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
