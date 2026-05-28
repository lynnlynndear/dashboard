import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppCvp from './AppCvp'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppCvp />
  </StrictMode>,
)
