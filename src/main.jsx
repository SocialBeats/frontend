import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { SpaceProvider } from 'space-react-client';
import './styles/index.css';
import App from './App.jsx';

// Configuración de Space
const spaceConfig = {
  url: window.RUNTIME_CONFIG?.VITE_SPACE_URL || 'http://localhost:5403',
  apiKey: window.RUNTIME_CONFIG?.VITE_SPACE_API_KEY || '',
  allowConnectionWithSpace: true,
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SpaceProvider config={spaceConfig}>
      <App />
    </SpaceProvider>
  </StrictMode>
);
