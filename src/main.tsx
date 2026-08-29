import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import OfflineBoundary from './components/OfflineBoundary';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <OfflineBoundary>
      <App />
    </OfflineBoundary>
  </StrictMode>,
);
