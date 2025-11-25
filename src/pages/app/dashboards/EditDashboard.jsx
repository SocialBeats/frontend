import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Card from '../../../components/ui/Card';
import './EditDashboard.css';

const EditDashboard = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        // TODO: Reemplazar con tu llamada a la API
        // const response = await axiosClient.get(`/dashboards/${id}`);
        // setFormData(response.data);
        
        // Datos de ejemplo
        const mockDashboard = {
          name: 'Dashboard de Ventas',
          description: 'Análisis de ventas mensuales',
        };
        setFormData(mockDashboard);
      } catch (error) {
        console.error('Error al cargar dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // TODO: Reemplazar con tu llamada a la API
      // await axiosClient.put(`/dashboards/${id}`, formData);
      console.log('Dashboard actualizado:', formData);
      navigate('/app/dashboards');
    } catch (error) {
      console.error('Error al actualizar dashboard:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/app/dashboards');
  };

  if (loading) {
    return <div className="edit-dashboard__loading">Cargando...</div>;
  }

  return (
    <div className="edit-dashboard">
      <div className="edit-dashboard__container">
        <h1 className="edit-dashboard__title">Editar Dashboard</h1>
        
        <Card className="edit-dashboard__form-card">
          <form onSubmit={handleSubmit} className="edit-dashboard__form">
            <div className="edit-dashboard__form-group">
              <label htmlFor="name" className="edit-dashboard__label">
                Nombre del Dashboard *
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ej: Dashboard de Ventas"
                required
              />
            </div>

            <div className="edit-dashboard__form-group">
              <label htmlFor="description" className="edit-dashboard__label">
                Descripción
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe el propósito de este dashboard..."
                className="edit-dashboard__textarea"
                rows="4"
              />
            </div>

            <div className="edit-dashboard__actions">
              <Button
                type="button"
                onClick={handleCancel}
                variant="secondary"
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default EditDashboard;