import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import './Dashboard.css';

export default function Dashboard() {

  return (
    <div className="dashboard fade-in">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Hola, Productor 👋</h1>
          <p>Aquí tienes un resumen de tu actividad musical hoy.</p>
        </div>
        <Button variant="primary" className="upload-btn">
          <span className="btn-icon">⬆️</span> Subir Nuevo Beat
        </Button>
      </div>

      <div className="dashboard-grid">
        <Card className="stat-card-wrapper glass-panel" padding="large">
          <div className="stat-card">
            <div className="stat-icon-wrapper icon-music">
              <span className="stat-icon">🎵</span>
            </div>
            <div className="stat-content">
              <h3>Beats Subidos</h3>
              <p className="stat-value">0</p>
            </div>
          </div>
        </Card>

        <Card className="stat-card-wrapper glass-panel" padding="large">
          <div className="stat-card">
            <div className="stat-icon-wrapper icon-play">
              <span className="stat-icon">▶️</span>
            </div>
            <div className="stat-content">
              <h3>Reproducciones</h3>
              <p className="stat-value">0</p>
            </div>
          </div>
        </Card>

        <Card className="stat-card-wrapper glass-panel" padding="large">
          <div className="stat-card">
            <div className="stat-icon-wrapper icon-heart">
              <span className="stat-icon">❤️</span>
            </div>
            <div className="stat-content">
              <h3>Likes</h3>
              <p className="stat-value">0</p>
            </div>
          </div>
        </Card>

        <Card className="stat-card-wrapper glass-panel" padding="large">
          <div className="stat-card">
            <div className="stat-icon-wrapper icon-users">
              <span className="stat-icon">👥</span>
            </div>
            <div className="stat-content">
              <h3>Seguidores</h3>
              <p className="stat-value">0</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="dashboard-sections-grid">
        <Card className="dashboard-section-card glass-panel" padding="large">
          <div className="section-header">
            <h2>Últimos Beats</h2>
            <Button variant="ghost" size="small">Ver Todo</Button>
          </div>
          <div className="empty-state">
            <div className="empty-icon-container">
              <span className="empty-icon">🎧</span>
            </div>
            <p className="empty-title">Tu biblioteca está creciendo</p>
            <p className="empty-subtitle">
              Sube más beats para aumentar tu visibilidad en la plataforma.
            </p>
            <Button variant="outline" size="small">
              Gestionar Biblioteca
            </Button>
          </div>
        </Card>

        <Card className="dashboard-section-card glass-panel" padding="large">
          <div className="section-header">
            <h2>Actividad Reciente</h2>
          </div>
          <div className="activity-list">
            <div className="empty-state-small">
              <p className="text-muted">No hay actividad reciente</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

