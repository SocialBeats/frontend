import { Link } from 'react-router-dom';
import logo from '../../assets/logo-dark-no-fondo.png';
import './TopNavBar.css';

export default function TopNavBar() {
  return (
    <nav className="top-navbar glass-panel">
      <div className="container top-navbar-content">
        <Link to="/" className="top-logo">
          <img src={logo} alt="SocialBeats" className="top-logo-img" />
          <span className="top-logo-text">SocialBeats</span>
        </Link>

        <div className="top-nav-links">
          <Link to="/login" className="nav-link">Iniciar Sesión</Link>
          <Link to="/register" className="nav-button">Registrarse</Link>
        </div>
      </div>
    </nav>
  );
}
