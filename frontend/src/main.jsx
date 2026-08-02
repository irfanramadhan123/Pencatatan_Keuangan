import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import './styles/app.css'
import './styles/auth.css'
import './styles/responsive.css'
import './styles/landing.css'
import App from './App.jsx'

document.documentElement.setAttribute(
  "data-theme",
  localStorage.getItem("theme") === "light" ? "light" : "dark"
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
