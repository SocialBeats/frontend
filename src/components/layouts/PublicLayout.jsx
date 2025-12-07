import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated } from '../../services/authService';
import Footer from '../ui/Footer';
import TopNavBar from '../ui/TopNavBar';
import './PublicLayout.css';

export default function PublicLayout() {
  // Redirigir usuarios autenticados a /app/feed
  if (isAuthenticated()) {
    return <Navigate to="/app/feed" replace />;
  }

  return (
    <div className="public-layout">
      <TopNavBar />
      <main className="public-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

