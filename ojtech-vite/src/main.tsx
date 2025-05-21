import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App'
import { AuthProvider } from './providers/AuthProvider'
import { 
  BrowserRouter 
} from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'

// Google OAuth client ID from environment variable
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// Log client ID (redacting most of it for security)
if (googleClientId) {
  const firstSix = googleClientId.substring(0, 6);
  const lastFour = googleClientId.substring(googleClientId.length - 4);
  console.log(`Loaded Google Client ID: ${firstSix}...${lastFour}`);
} else {
  console.error('No Google Client ID found! Check your .env.local file');
}

// Use BrowserRouter for now since it's simpler to integrate with the current setup
// The v7 warnings are not critical at this point
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>,
)
