import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import Button from '../../../components/ui/Button';
import AddWidgetModal from '../../../components/Dashboard/AddWidgetModal';
import SpiderWidget from '../../../components/Dashboard/SpiderWidgets';
import GenericWidget from '../../../components/Dashboard/GenericWidget';
import { getDashboardById, updateDashboard } from '../../../services/analytics/dashboards';
import './ViewDashboard.css';

const ViewDashboard = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [widgets, setWidgets] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const inputRef = useRef(null);

  const WIDGET_SECTIONS = {
    CORE: 'Métricas Core',
    TEMPO: 'Tempo',
    TONALIDAD: 'Tonalidad',
    PERFIL_MELODICO: 'Perfil Melódico',
    DINAMICA: 'Dinámica',
    TEXTURA: 'Textura',
    ARTICULACION: 'Articulación'
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await getDashboardById(id);
        const dashboardData = response.data || response;
        setDashboard(dashboardData);
        setEditedName(dashboardData.name);
      } catch (error) {
        console.error('Error al cargar dashboard:', error);
        setDashboard(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [id]);

  useEffect(() => {
    if (isEditingName && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingName]);

  const handleStartEdit = () => {
    setIsEditingName(true);
  };

  const handleCancelEdit = () => {
    setEditedName(dashboard.name);
    setIsEditingName(false);
  };

  const handleSaveName = async () => {
    if (editedName.trim() === '') {
      alert('El nombre no puede estar vacío');
      return;
    }

    if (editedName === dashboard.name) {
      setIsEditingName(false);
      return;
    }

    setIsSaving(true);
    try {
      await updateDashboard(dashboard.id, { name: editedName });
      setDashboard(prev => ({ ...prev, name: editedName }));
      setIsEditingName(false);
    } catch (error) {
      console.error('Error al actualizar nombre:', error);
      alert('Error al actualizar el nombre');
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveName();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleBack = () => {
    navigate('/app/dashboards');
  };

  const handleAddWidget = (widgetDef) => {
    const newWidget = {
      id: `${widgetDef.type}-${Date.now()}`,
      type: widgetDef.type,
      section: widgetDef.section,
      title: widgetDef.title
    };
    setWidgets([...widgets, newWidget]);
  };

  const handleRemoveWidget = (widgetId) => {
    setWidgets(widgets.filter(w => w.id !== widgetId));
  };

  const renderWidget = (widget) => {
    switch (widget.type) {
      case 'spider':
        return <SpiderWidget />;

      // Tempo
      case 'bpm':
        return <GenericWidget title={widget.title} value="120 BPM" />;
      case 'num_beats':
        return <GenericWidget title={widget.title} value="1,234" />;
      case 'duracion_promedio':
        return <GenericWidget title={widget.title} value="0.5s" />;

      // Tonalidad
      case 'clave':
        return <GenericWidget title={widget.title} value="C Major" />;
      case 'uniformidad_notas':
        return <GenericWidget title={widget.title} value="85%" />;
      case 'estabilidad_tonal':
        return <GenericWidget title={widget.title} value="92%" />;

      // Perfil Melódico
      case 'rango_hz':
        return <GenericWidget title={widget.title} value="± 250 Hz" />;
      case 'hz_medios':
        return <GenericWidget title={widget.title} value="440 Hz" />;

      // Dinámica
      case 'db':
        return <GenericWidget title={widget.title} value="75 dB" />;

      // Textura
      case 'caracter':
        return <GenericWidget title={widget.title} value="Brillante" />;
      case 'apertura':
        return <GenericWidget title={widget.title} value="Alta" />;

      // Articulación
      case 'staccato':
        return <GenericWidget title={widget.title} value="65%" />;
      case 'ataques_subitos':
        return <GenericWidget title={widget.title} value="127" />;
      case 'ataques_graduales':
        return <GenericWidget title={widget.title} value="89" />;

      default:
        return <GenericWidget title={widget.title} />;
    }
  };

  const widgetsBySection = widgets.reduce((acc, widget) => {
    if (!acc[widget.section]) {
      acc[widget.section] = [];
    }
    acc[widget.section].push(widget);
    return acc;
  }, {});

  const sections = Object.values(WIDGET_SECTIONS).filter(section => widgetsBySection[section]?.length > 0);

  if (loading) {
    return <div className="view-dashboard__loading">Cargando dashboard...</div>;
  }

  if (!dashboard) {
    return (
      <div className="view-dashboard__error">
        <p>Dashboard no encontrado</p>
        <Button onClick={handleBack}>Volver a Dashboards</Button>
      </div>
    );
  }

  return (
    <div className="view-dashboard">
      <div className="view-dashboard__header">
        <div className="view-dashboard__header-content">
          <div className="view-dashboard__title-container">
            {isEditingName ? (
              <div className="view-dashboard__title-edit">
                <input
                  ref={inputRef}
                  type="text"
                  className="view-dashboard__title-input"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isSaving}
                />
                <button
                  className="view-dashboard__edit-button view-dashboard__edit-button--save"
                  onClick={handleSaveName}
                  disabled={isSaving}
                  title="Guardar"
                >
                  ✓
                </button>
                <button
                  className="view-dashboard__edit-button view-dashboard__edit-button--cancel"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  title="Cancelar"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="view-dashboard__title-view">
                <h1 className="view-dashboard__title">{dashboard.name}</h1>
                <button
                  className="view-dashboard__edit-icon"
                  onClick={handleStartEdit}
                  title="Editar nombre"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
              </div>
            )}
          </div>
          <div className="view-dashboard__metadata">
            <span>Creado: {new Date(dashboard.created_at || dashboard.createdAt).toLocaleDateString()}</span>
            {(dashboard.updated_at || dashboard.updatedAt) && (
              <span>Actualizado: {new Date(dashboard.updated_at || dashboard.updatedAt).toLocaleDateString()}</span>
            )}
          </div>
        </div>
        <div className="view-dashboard__actions">
          <Button onClick={handleBack} variant="secondary">
            Volver
          </Button>
        </div>
      </div>

      <div className="view-dashboard__content">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Visualización del Dashboard</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Añadir Widget
          </button>
        </div>

        {widgets.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400 mb-4">No hay widgets añadidos</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Añade tu primer widget
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {sections.map((section) => (
              <div key={section}>
                <h3 className="text-xl font-semibold mb-4">{section}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {widgetsBySection[section].map((widget) => (
                    <div key={widget.id} className="relative group">
                      <button
                        onClick={() => handleRemoveWidget(widget.id)}
                        className="absolute top-2 right-2 z-10 p-2 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                      {renderWidget(widget)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <AddWidgetModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAddWidget={handleAddWidget}
          dashboardId={id}
        />
      </div>
    </div>
  );
};

export default ViewDashboard;