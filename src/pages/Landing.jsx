import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import logo from '../assets/logo-dark-no-fondo.png';
import './Landing.css';

export default function Landing() {
  return (
    <div className="landing">
      {/* Hero Section */}
      <div className="landing-hero">
        <div className="hero-glow"></div>
        <img src={logo} alt="SocialBeats" className="logo-large-img" />
        <h1 className="landing-title">SocialBeats</h1>
        <p className="landing-subtitle">
          La red social para productores musicales. Comparte tus beats, conecta con otros compositores y haz crecer tu música.
        </p>
        <div className="landing-actions">
          <Link to="/login">
            <Button size="large" variant="primary">
              Iniciar Sesión
            </Button>
          </Link>
          <Link to="/register">
            <Button size="large" variant="outline">
              Crear Cuenta Gratis
            </Button>
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="landing-features">
        <Card hover padding="large" className="feature-card">
          <div className="feature-icon">🎵</div>
          <h3>Sube tus Beats</h3>
          <p>Comparte tus producciones con una comunidad de productores apasionados</p>
        </Card>
        <Card hover padding="large" className="feature-card">
          <div className="feature-icon">📊</div>
          <h3>Métricas Detalladas</h3>
          <p>Analiza reproducciones, likes y engagement de tus tracks en tiempo real</p>
        </Card>
        <Card hover padding="large" className="feature-card">
          <div className="feature-icon">🤝</div>
          <h3>Conecta y Colabora</h3>
          <p>Comenta, da likes y colabora con productores de todo el mundo</p>
        </Card>
        <Card hover padding="large" className="feature-card">
          <div className="feature-icon">🎧</div>
          <h3>Descubre Talento</h3>
          <p>Explora beats de otros productores y encuentra inspiración</p>
        </Card>
        <Card hover padding="large" className="feature-card">
          <div className="feature-icon">🏆</div>
          <h3>Gana Visibilidad</h3>
          <p>Aparece en rankings y tendencias según el engagement de tus beats</p>
        </Card>
        <Card hover padding="large" className="feature-card">
          <div className="feature-icon">🔔</div>
          <h3>Notificaciones</h3>
          <p>Mantente al día con comentarios, likes y nuevos seguidores</p>
        </Card>
      </div>

      {/* CTA Section */}
      <div className="landing-cta glass-panel">
        <h2>¿Listo para hacer crecer tu música?</h2>
        <p>Únete a miles de productores que ya están compartiendo sus beats</p>
        <Link to="/register">
          <Button size="large" variant="secondary">
            Comenzar Ahora
          </Button>
        </Link>
      </div>
    </div>
  );
}

