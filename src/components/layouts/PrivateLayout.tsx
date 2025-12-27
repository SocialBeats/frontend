import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated } from '../../services/authService';
import NavBar from '../ui/NavBar';
import Footer from '../ui/Footer';
import './PrivateLayout.css';
import { usePlayerStore } from '../../store/usePlayerStore';
import GlobalPlayerDock from '../features/player/GlobalPlayerDock';

export default function PrivateLayout() {
  // Proteger rutas privadas - redirigir a login si no está autenticado
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const { currentBeat } = usePlayerStore();

  return (
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
    </div>
  );
}
