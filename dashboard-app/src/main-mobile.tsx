import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AppMobile } from './mobile/AppMobile'

createRoot(document.getElementById('root-mobile')!).render(
  <StrictMode>
    <AppMobile />
  </StrictMode>,
)
