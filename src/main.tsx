import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AuthProvider } from './contexts/AuthContext'
import { TaskProvider } from './contexts/TaskContext'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <TaskProvider>
        <App />
      </TaskProvider>
    </AuthProvider>
  </StrictMode>,
)
