import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import AuthProvider from './context/authProvider.tsx'
import AdminAuthProvider from './context/adminAuthProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <AdminAuthProvider>
        <BrowserRouter>
            <App />
        </BrowserRouter>
      </AdminAuthProvider>
    </AuthProvider>
  </StrictMode>,
)
