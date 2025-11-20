import { Link, useLocation } from 'react-router-dom';
import Avatar from './Avatar';
import './NavBar.css';

export default function NavBar() {

  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/app/dashboard', icon: '🏠', label: 'Inicio' },
    { path: '/app/explore', icon: '🔍', label: 'Explorar' },
    { path: '/app/upload', icon: '⬆️', label: 'Subir' },
    { path: '/app/library', icon: '📚', label: 'Biblioteca' },
    { path: '/app/messages', icon: '💬', label: 'Mensajes' },
    { path: '/app/profile', icon: '👤', label: 'Perfil' },
  ];

  return (
    <nav className="sidebar">
      <div className="sidebar-content">
        {/* Logo */}
        <Link to="/app/dashboard" className="sidebar-logo">
          <div className="logo-icon">S</div>
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
      </div>
    </nav>
  );
}
