import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import './Dashboard.css';

export default function Dashboard() {

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Hola 👋</h1>
          <p>Revisa tus estadísticas y últimos beats</p>
        </div>
        <Button variant="primary">
          ⬆️ Subir Beat
        </Button>
      </div>

      <div className="dashboard-grid">
        <Card variant="gradient" padding="large" hover>
          <div className="stat-card">
            <div className="stat-icon">🎵</div>
            <div className="stat-content">
              <h3>Beats Subidos</h3>
              <p className="stat-value">0</p>
              <Badge variant="info" size="small">Sin beats aún</Badge>
            </div>
          </div>
        </Card>

        <Card variant="gradient" padding="large" hover>
          <div className="stat-card">
            <div className="stat-icon">▶️</div>
            <div className="stat-content">
              <h3>Reproducciones</h3>
              <p className="stat-value">0</p>
              <Badge variant="primary" size="small">Total</Badge>
            </div>
          </div>
        </Card>

        <Card variant="gradient" padding="large" hover>
          <div className="stat-card">
            <div className="stat-icon">❤️</div>
            <div className="stat-content">
              <h3>Likes</h3>
              <p className="stat-value">0</p>
              <Badge variant="warning" size="small">Este mes</Badge>
            </div>
          </div>
        </Card>

        <Card variant="gradient" padding="large" hover>
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>Seguidores</h3>
              <p className="stat-value">0</p>
              <Badge variant="success" size="small">Creciendo</Badge>
            </div>
          </div>
        </Card>
      </div>

      <Card padding="large">
        <div className="dashboard-section">
          <h2>Últimos Beats</h2>
          <div className="empty-state">
            <div className="empty-icon">🎧</div>
            <p className="empty-title">Aún no has subido ningún beat</p>
            <p className="empty-subtitle">
              Comparte tu primera producción y comienza a recibir feedback de la comunidad
            </p>
            <Button variant="primary">
              ⬆️ Subir Mi Primer Beat
            </Button>
          </div>
        </div>
      </Card>

      <Card padding="large">
        <div className="dashboard-section">
          <h2>Actividad Reciente</h2>
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <p className="empty-title">No hay actividad reciente</p>
            <p className="empty-subtitle">
              Explora beats de otros productores y comienza a interactuar
            </p>
            <Button variant="outline">
              🔍 Explorar Beats
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
