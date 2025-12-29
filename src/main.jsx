import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { SpaceProvider } from 'space-react-client';
import './styles/index.css';
import App from './App.jsx';

// Configuración de Space (desde variables de entorno)
const spaceConfig = {
  url: import.meta.env.VITE_SPACE_URL || 'http://localhost:5403',
  apiKey: import.meta.env.VITE_SPACE_API_KEY || '',
  allowConnectionWithSpace: true,
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SpaceProvider config={spaceConfig}>
      <App />
    </SpaceProvider>
  </StrictMode>
);
