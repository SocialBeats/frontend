import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated } from '../../services/authService';
import NavBar from '../ui/NavBar';
import Footer from '../ui/Footer';
import './PrivateLayout.css';

export default function PrivateLayout() {
  // Proteger rutas privadas - redirigir a login si no está autenticado
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="private-layout">
      {/* Sidebar Navigation - Fixed on the left */}
      <NavBar />

      {/* Main Content Area */}
      <div className="private-content-wrapper">
        <main className="private-main">
          <Outlet />
        </main>

        {/* Footer - Full width but respects sidebar */}
        <Footer />
      </div>
    </div>
  );
}
