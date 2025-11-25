import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import DashboardList from '../../../components/Dashboard/DashboardList';
import './DashboardsPage.css';

const DashboardsPage = () => {
  const navigate = useNavigate();
  const [dashboards, setDashboards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboards = async () => {
      try {
        // TODO: Reemplazar con tu llamada a la API
        // const response = await axiosClient.get('/dashboards');
        // setDashboards(response.data);
        
        const mockDashboards = [
          {
            id: 1,
            name: 'Dashboard de Ventas',
            createdAt: new Date().toISOString(),
          },
          {
            id: 2,
            name: 'Dashboard de Marketing',
            createdAt: new Date().toISOString(),
          },
        ];
        setDashboards(mockDashboards);
      } catch (error) {
        console.error('Error al cargar dashboards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboards();
  }, []);

  const handleDelete = async (id) => {
    try {
      // TODO: Reemplazar con tu llamada a la API
      // await axiosClient.delete(`/dashboards/${id}`);
      setDashboards(dashboards.filter(d => d.id !== id));
    } catch (error) {
      console.error('Error al eliminar dashboard:', error);
    }
  };

  const handleUpdateName = async (id, newName) => {
    try {
      // TODO: Reemplazar con tu llamada a la API
      // await axiosClient.patch(`/dashboards/${id}`, { name: newName });
      
      setDashboards(dashboards.map(d => 
        d.id === id ? { ...d, name: newName } : d
      ));
      console.log('Nombre actualizado:', newName);
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