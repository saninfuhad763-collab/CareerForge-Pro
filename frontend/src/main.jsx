import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Track pointer interaction on form controls to remove jarring mouse/touch focus outline while preserving keyboard :focus-visible
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  document.addEventListener('pointerdown', (e) => {
    const target = e.target;
    if (target && target.matches && target.matches('input, textarea, select')) {
      target.setAttribute('data-focus-mouse', 'true');
    }
  }, true);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      const active = document.activeElement;
      if (active && active.hasAttribute && active.hasAttribute('data-focus-mouse')) {
        active.removeAttribute('data-focus-mouse');
      }
    }
  }, true);

  document.addEventListener('focusout', (e) => {
    const target = e.target;
    if (target && target.hasAttribute && target.hasAttribute('data-focus-mouse')) {
      target.removeAttribute('data-focus-mouse');
    }
  }, true);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
