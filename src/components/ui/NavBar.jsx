import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Avatar from './Avatar';
import Button from './Button';
import ConfirmModal from './ConfirmModal';
import { logout } from '../../services/authService';
import logo from '../../assets/logo-dark-no-fondo.png';
import './NavBar.css';

export default function NavBar() {

  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const navItems = [
    { path: '/app/feed', icon: '🏠', label: 'Inicio' },
    { path: '/app/my-beats', icon: '🎵', label: 'Mis Beats' },
    { path: '/app/explore', icon: '🔍', label: 'Explorar' },
    { path: '/app/upload', icon: '⬆️', label: 'Subir' },
    { path: '/app/library', icon: '📚', label: 'Biblioteca' },
    { path: '/app/messages', icon: '💬', label: 'Mensajes' },
    { path: '/app/profile', icon: '👤', label: 'Perfil' },
    { path: '/app/dashboards', icon: '📊', label: 'Dashboards' },
  ];

  return (
    <>
      <nav className="sidebar glass-panel">
        <div className="sidebar-content">
          {/* Logo */}
          <Link to="/app/dashboard" className="sidebar-logo">
            <img src={logo} alt="SocialBeats Logo" className="logo-image" />
            <span className="logo-text">SocialBeats</span>
          </Link>

          {/* Navigation */}
          <div className="sidebar-nav">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-link ${isActive(item.path) ? 'sidebar-link-active' : ''}`}
              >
                <span className="sidebar-link-icon">{item.icon}</span>
                <span className="sidebar-link-label">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* User Profile Snippet (Optional but good for design) */}
          <div className="sidebar-user">
            <Avatar size="sm" />
            <div className="sidebar-user-info">
              <span className="user-name">Usuario</span>
              <span className="user-handle">@usuario</span>
            </div>
          </div>

          {/* Logout Button */}
          <div style={{ padding: '0 1rem 1rem' }}>
            <Button
              variant="secondary"
              fullWidth
              size="small"
              onClick={handleLogoutClick}
            >
              🚪 Cerrar sesión
            </Button>
          </div>
        </div>
      </nav>

      {/* Confirm Logout Modal - Fuera del nav para evitar herencia de estilos */}
      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
        title="Cerrar sesión"
        message="¿Estás seguro de que quieres cerrar sesión?"
        confirmText="Sí, cerrar sesión"
        cancelText="Cancelar"
        confirmVariant="primary"
      />
    </>
  );
}

