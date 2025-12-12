import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import DashboardList from '../../../components/Dashboard/DashboardList';
import { getAllDashboards, deleteDashboard, updateDashboard } from '../../../services/analytics/dashboards';
import './DashboardsPage.css';

const DashboardsPage = () => {
  const navigate = useNavigate();
  const [dashboards, setDashboards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboards = async () => {
      try {
        const response = await getAllDashboards();
        setDashboards(response.data || []);
      } catch (error) {
        console.error('Error al cargar dashboards:', error);
        setDashboards([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboards();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteDashboard(id);
      setDashboards(dashboards.filter(d => d.id !== id));
    } catch (error) {
      console.error('Error al eliminar dashboard:', error);
    }
  };

  const handleUpdateName = async (id, newName) => {
    try {
      await updateDashboard(id, { name: newName });

      setDashboards(dashboards.map(d =>
        d.id === id ? { ...d, name: newName } : d
      ));
    } catch (error) {
      console.error('Error al actualizar nombre:', error);
      throw error;
    }
  };

  const handleCreate = () => {
    navigate('/app/dashboards/create');
  };

  if (loading) {
    return <div className="dashboards-page__loading">Cargando...</div>;
  }

  return (
    <div className="dashboards-page">
      <div className="dashboards-page__header">
        <h1 className="dashboards-page__title">Mis Dashboards</h1>
        <Button onClick={handleCreate}>
          + Crear Dashboard
        </Button>
      </div>

      <DashboardList
        dashboards={dashboards}
        onDelete={handleDelete}
        onUpdateName={handleUpdateName}
      />
    </div>
  );
};

export default DashboardsPage;