import './assets/main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import Auth from './components/Auth'      // ← your new Auth page
import { Toaster } from 'react-hot-toast'

const root = createRoot(document.getElementById('root'))



root.render(
  <StrictMode>

    <App />       
    <Toaster position="top-right" />
  </StrictMode>
)
