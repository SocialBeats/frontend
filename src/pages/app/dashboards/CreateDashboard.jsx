import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import './CreateDashboard.css';

const CreateDashboard = () => {
  const navigate = useNavigate();
  const [dashboardName, setDashboardName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!dashboardName.trim()) {
      alert('Por favor ingresa un nombre para el dashboard');
      return;
    }

    setIsCreating(true);
    
    try {
      // Aquí harás la llamada al backend cuando esté listo
      // const response = await fetch('/api/dashboards', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ name: dashboardName })
      // });
      // const data = await response.json();
      
      // Por ahora simulamos la creación
      const mockDashboard = {
        id: Date.now(), // ID temporal
        name: dashboardName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      console.log('Dashboard creado:', mockDashboard);
      
      // Redirigir al dashboard creado
      navigate(`/app/dashboards/${mockDashboard.id}`);
      
    } catch (error) {
      console.error('Error al crear dashboard:', error);
      alert('Error al crear el dashboard');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    navigate('/app/dashboards');
  };

  return (
    <div className="create-dashboard">
      <div className="create-dashboard__container">
        <div className="create-dashboard__header">
          <h1 className="create-dashboard__title">Crear Nuevo Dashboard</h1>
          <p className="create-dashboard__subtitle">
            Crea un dashboard y luego podrás añadir widgets personalizados
          </p>
        </div>

        <form onSubmit={handleSubmit} className="create-dashboard__form">
          <div className="create-dashboard__form-group">
            <label htmlFor="dashboardName" className="create-dashboard__label">
              Nombre del Dashboard *
            </label>
            <input
              id="dashboardName"
              type="text"
              className="create-dashboard__input"
              value={dashboardName}
              onChange={(e) => setDashboardName(e.target.value)}
              placeholder="Ej: Análisis de Ritmo y Tonalidad"
              disabled={isCreating}
              autoFocus
            />
          </div>

          <div className="create-dashboard__actions">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              disabled={isCreating}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isCreating || !dashboardName.trim()}
            >
              {isCreating ? 'Creando...' : 'Crear Dashboard'}
            </Button>
          </div>
        </form>

        <div className="create-dashboard__info">
          <h3>¿Qué puedes hacer después?</h3>
          <ul>
            <li>✅ Añadir widgets de métricas core (Diagrama Spider)</li>
            <li>✅ Visualizar datos de tempo (BPM, Beats, Duración)</li>
            <li>✅ Analizar tonalidad (Clave, Uniformidad, Estabilidad)</li>
            <li>✅ Personalizar tu dashboard con múltiples widgets</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreateDashboard;