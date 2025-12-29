import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { isAuthenticated } from '../../services/authService';
import { getMyProfile } from '../../services/profileService';
import NavBar from '../ui/NavBar';
import Footer from '../ui/Footer';
import './PrivateLayout.css';
import { usePlayerStore } from '../../store/usePlayerStore';
import GlobalPlayerDock from '../features/player/GlobalPlayerDock';
import MetricsNotifier from '../MetricsNotifier';

export default function PrivateLayout() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [emailVerified, setEmailVerified] = useState(null);

  // Proteger rutas privadas - redirigir a login si no está autenticado
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const { currentBeat } = usePlayerStore();

  useEffect(() => {
    const checkEmailVerification = async () => {
      try {
        const profile = await getMyProfile();
        setEmailVerified(profile.emailVerified);
      } catch (error) {
        console.error('Error checking email verification:', error);
        // En caso de error, asumimos que no está verificado por seguridad
        setEmailVerified(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkEmailVerification();
  }, []);

  // Mostrar loading mientras verificamos
  if (isLoading) {
    return (
      <div className="private-layout" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'var(--bg-main)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loading-spinner" style={{
            width: '40px',
            height: '40px',
            margin: '0 auto 1rem',
            border: '3px solid rgba(139, 92, 246, 0.3)',
            borderTop: '3px solid var(--primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ color: 'var(--text-muted)' }}>Cargando...</p>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Si el email no está verificado, redirigir a la página de verificación
  if (emailVerified === false) {
    return <Navigate to="/verify-email" state={{ from: location }} replace />;
  }

  return (
    <div className="private-layout">
      {/* Sidebar Navigation - Fixed on the left */}
      <NavBar />

      <MetricsNotifier />;

      {/* Main Content Area */}
      <div className="private-content-wrapper">
        <main className={`private-main ${currentBeat ? 'pb-28' : ''}`}>
          <Outlet />
        </main>

        <Footer />
      </div>
      <GlobalPlayerDock />
    </div>
  );
}
