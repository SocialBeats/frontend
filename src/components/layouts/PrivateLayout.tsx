import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { isAuthenticated } from '../../services/authService';
import { getMyProfile } from '../../services/profileService';
import NavBar from '../ui/NavBar';
import Footer from '../ui/Footer';
import Toast from '../ui/Toast';
import './PrivateLayout.css';
import { usePlayerStore } from '../../store/usePlayerStore';
import GlobalPlayerDock from '../features/player/GlobalPlayerDock';
import { useMetricsStatus } from '../../hooks/use-metrics-status';
import { MetricsStatusProvider } from '../../contexts/MetricsStatusContext';

export default function PrivateLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [emailVerified, setEmailVerified] = useState<boolean | null>(null);
  
  // Toast notification state
  const [showToast, setShowToast] = useState(false);
  const [toastData, setToastData] = useState({ beatName: '', beatId: '' });

  // SSE for global metrics notifications
  const { metricsStatus } = useMetricsStatus((data) => {
    // Show toast notification when metrics are completed
    setToastData({ 
      beatName: data.beatId, // We'll try to get the beat name if available
      beatId: data.beatId 
    });
    setShowToast(true);
  });
  
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
      } catch (err: unknown) {
        console.error('Error checking email verification:', err);
        const error = err as { response?: { status?: number } };
        if (error.response?.status === 401) {
          setEmailVerified(null);
        } else {
          console.warn('Assuming email verified due to network error');
          setEmailVerified(true);
        }
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
    <MetricsStatusProvider value={{ metricsStatus }}>
      <div className="private-layout">
        {/* Sidebar Navigation - Fixed on the left */}
        <NavBar />

        {/* Main Content Area */}
        <div className="private-content-wrapper">
          <main className={`private-main ${currentBeat ? 'pb-28' : ''}`}>
            <Outlet />
          </main>

          <Footer />
        </div>
        <GlobalPlayerDock />
        
        {/* Global metrics notification toast */}
        <Toast
          isOpen={showToast}
          onClose={() => setShowToast(false)}
          title="¡Métricas Calculadas!"
          message={`Las métricas de tu beat ya están listas. Ahora puedes crear un dashboard.`}
          actionLabel="Crear Dashboard"
          onAction={() => {
            setShowToast(false);
            navigate('/app/dashboards/create');
          }}
          duration={8000}
        />
      </div>
    </MetricsStatusProvider>
  );
}
