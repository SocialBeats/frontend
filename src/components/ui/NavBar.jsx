import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Avatar from './Avatar';
import Button from './Button';
import ConfirmModal from './ConfirmModal';
import { logout } from '../../services/authService';
import { getMyProfile } from '../../services/profileService';
import { useProfileContext } from '../../contexts/ProfileContext';
import logo from '../../assets/logo-dark-no-fondo.png';
import './NavBar.css';

export default function NavBar() {

  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [profile, setProfile] = useState(null);
  const { profileVersion } = useProfileContext();

  useEffect(() => {
    // Cargar perfil del usuario (se re-ejecuta cuando profileVersion cambia)
    const loadProfile = async () => {
      try {
        const data = await getMyProfile();
        setProfile(data);
      } catch (error) {
        console.error('Error cargando perfil en NavBar:', error);
      }
    };
    
    loadProfile();
  }, [profileVersion]);

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

          {/* User Profile Snippet */}
          <div className="sidebar-user">
            <Avatar 
              size="medium" 
              src={profile?.avatar || ''} 
              alt={profile?.username || 'Usuario'}
            />
            <div className="sidebar-user-info">
              <span className="user-name">{profile?.full_name || profile?.username || 'Usuario'}</span>
              <span className="user-handle">@{profile?.username || 'usuario'}</span>
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

