import { Link, useLocation } from 'react-router-dom';
import Avatar from './Avatar';
import logo from '../../assets/logo-dark-no-fondo.png';
import './NavBar.css';

export default function NavBar() {

  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/app/feed', icon: '🏠', label: 'Inicio' },
    { path: '/app/my-beats', icon: '🎵', label: 'Mis Beats' },
    { path: '/app/explore', icon: '🔍', label: 'Explorar' },
    { path: '/app/upload', icon: '⬆️', label: 'Subir' },
    { path: '/app/playlists/me', icon: '📚', label: 'Biblioteca' },
    { path: '/app/messages', icon: '💬', label: 'Mensajes' },
    { path: '/app/profile', icon: '👤', label: 'Perfil' },
    { path: '/app/dashboards', icon: '📊', label: 'Dashboards' },
  ];

  return (
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
      </div>
    </nav>
  );
}

