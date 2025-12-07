import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3 className="footer-brand">SocialBeats</h3>
          <p className="footer-description">
            La plataforma donde los compositores conectan, comparten y hacen crecer su música.
          </p>
          <div className="footer-social">
            <a href="#" className="footer-social-link" aria-label="Twitter">🐦</a>
            <a href="#" className="footer-social-link" aria-label="Instagram">📷</a>
            <a href="#" className="footer-social-link" aria-label="YouTube">▶️</a>
            <a href="#" className="footer-social-link" aria-label="Discord">💬</a>
          </div>
        </div>

        <div className="footer-section">
          <h4 className="footer-title">Plataforma</h4>
          <ul className="footer-links">
            <li><Link to="/explore">Explorar</Link></li>
            <li><Link to="/trending">Tendencias</Link></li>
            <li><Link to="/charts">Top Charts</Link></li>
            <li><Link to="/genres">Géneros</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-title">Comunidad</h4>
          <ul className="footer-links">
            <li><Link to="/artists">Artistas</Link></li>
            <li><Link to="/producers">Productores</Link></li>
            <li><Link to="/contests">Concursos</Link></li>
            <li><Link to="/blog">Blog</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-title">Recursos</h4>
          <ul className="footer-links">
            <li><Link to="/help">Centro de Ayuda</Link></li>
            <li><Link to="/about">Acerca de</Link></li>
            <li><Link to="/contact">Contacto</Link></li>
            <li><Link to="/api">API</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-title">Legal</h4>
          <ul className="footer-links">
            <li><Link to="/terms">Términos de Uso</Link></li>
            <li><Link to="/privacy">Privacidad</Link></li>
            <li><Link to="/cookies">Cookies</Link></li>
            <li><Link to="/copyright">Copyright</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="footer-copyright">
          &copy; {currentYear} SocialBeats. Todos los derechos reservados.
        </p>
        <p className="footer-tagline">
          Hecho con 💜 para la comunidad de productores musicales
        </p>
      </div>
    </footer>
  );
}
