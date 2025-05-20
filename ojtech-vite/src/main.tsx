import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App'
import { AuthProvider } from './providers/AuthProvider'
import { 
  BrowserRouter 
} from 'react-router-dom'

// Use BrowserRouter for now since it's simpler to integrate with the current setup
// The v7 warnings are not critical at this point
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
