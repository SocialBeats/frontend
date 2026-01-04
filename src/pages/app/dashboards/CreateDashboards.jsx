import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import SuccessModal from '../../../components/ui/SuccessModal';
import './CreateDashboards.css';

import { createDashboard, getAllDashboards } from '../../../services/analytics/dashboards';
import { getMyBeats } from '../../../services/beatsService';
import { useMetricsStatusContext } from '../../../contexts/MetricsStatusContext';
import { logger } from '../../../logger';

const CreateDashboards = () => {
  const navigate = useNavigate();
  const [dashboardName, setDashboardName] = useState('');
  const [selectedBeatId, setSelectedBeatId] = useState('');
  const [beats, setBeats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdDashboardId, setCreatedDashboardId] = useState(null);
  const [initialMetricsCheck, setInitialMetricsCheck] = useState(new Map());
  const [existingDashboards, setExistingDashboards] = useState([]);
  const [beatsWithDashboard, setBeatsWithDashboard] = useState(new Set());
  const [beatToDashboardName, setBeatToDashboardName] = useState(new Map());
  
  // Get metrics status from global context (SSE in PrivateLayout)
  const { metricsStatus } = useMetricsStatusContext();

  // Función para cargar dashboards existentes
  const loadExistingDashboards = async () => {
    try {
      const response = await getAllDashboards();
      const dashboardsData = response.data || response;
      console.log('📊 Dashboards existentes (raw):', response);
      console.log('📊 Dashboards existentes (data):', dashboardsData);
      
      if (dashboardsData && Array.isArray(dashboardsData)) {
        setExistingDashboards(dashboardsData);
        
        // Crear un Set con los beatIds que ya tienen dashboard
        const beatsWithDash = new Set(
          dashboardsData
            .map(d => d.beatId || d.beat_id)
            .filter(Boolean)
        );
        setBeatsWithDashboard(beatsWithDash);
        
        // Crear un Map de beatId -> nombre del dashboard
        const beatToDashMap = new Map(
          dashboardsData
            .filter(d => d.beatId || d.beat_id)
            .map(d => [d.beatId || d.beat_id, d.name])
        );
        setBeatToDashboardName(beatToDashMap);
        
        console.log('🚫 Beats con dashboard:', Array.from(beatsWithDash));
        console.log('📊 Mapa beat -> dashboard:', Object.fromEntries(beatToDashMap));
      }
    } catch (err) {
      console.error('❌ Error cargando dashboards:', err);
      // No bloquear si falla, solo loguear
    }
  };

  // Función para cargar beats (expuesta para poder reutilizarla)
  const loadUserBeats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const beatsData = await getMyBeats();

      console.log('🎵 Beats recibidos:', beatsData);

      if (beatsData && Array.isArray(beatsData)) {
        setBeats(beatsData);

        // Check initial metrics status for each beat using new status endpoint
        if (beatsData.length > 0) {
          try {
            const analyticsUrl = window.RUNTIME_CONFIG?.VITE_ANALYTICS_SERVICE_URL || 
                               import.meta.env.VITE_ANALYTICS_SERVICE_URL || 
                               'http://localhost:3000';
            
            const beatIds = beatsData.map(b => b._id).join(',');
            const response = await fetch(`${analyticsUrl}/api/v1/analytics/beat-metrics-status?beatIds=${beatIds}`);
            const { data } = await response.json();
            
            const statusMap = new Map();
            for (const beat of beatsData) {
              const status = data[beat._id];
              statusMap.set(beat._id, status?.status || 'calculating');
            }
            setInitialMetricsCheck(statusMap);
          } catch (err) {
            logger.warn('Error fetching metrics status:', err);
            // If status check fails, assume calculating for all
            const statusMap = new Map();
            beatsData.forEach(beat => statusMap.set(beat._id, 'calculating'));
            setInitialMetricsCheck(statusMap);
          }
        }

        if (beatsData.length === 0) {
          setError('No tienes beats subidos. Sube un beat primero para crear un dashboard.');
        }
      } else {
        setError('Error al cargar los beats. Formato de respuesta inválido.');
      }
    } catch (err) {
      console.error('❌ Error cargando beats:', err);
      setError('Error al cargar tus beats. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar dashboards y beats del usuario al montar el componente
  useEffect(() => {
    const loadData = async () => {
      await loadExistingDashboards();
      await loadUserBeats();
    };
    loadData();
  }, []);

  // Si venimos con query param ?beatId=..., preseleccionar ese beat
  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pre = params.get('beatId');
    if (pre) setSelectedBeatId(pre);
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!dashboardName.trim() || !selectedBeatId) {
      console.error('❌ Validación fallida: faltan datos');
      return;
    }

    try {
      setIsCreating(true);
      setError(null);

      const dashboardData = {
        name: dashboardName.trim(),
        beatId: selectedBeatId
      };

      const response = await createDashboard(dashboardData);

      console.log('Dashboard creado:', response);
      const createdDashboard = response.data || response;
      const dashboardId = createdDashboard.id || createdDashboard._id;

      // Guardar el ID y mostrar modal de éxito
      setCreatedDashboardId(dashboardId);
      setShowSuccessModal(true);
    } catch (err) {
      console.error('❌ Error al crear dashboard:', err);
      // Si hay error, simplemente navegar de vuelta
      navigate('/app/dashboards');
    } finally {
      setIsCreating(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    if (createdDashboardId) {
      navigate(`/app/dashboards/view/${createdDashboardId}`);
    }
  };

  const handleCancel = () => {
    navigate('/app/dashboards');
  };

  const handleBeatSelect = (beatId) => {
    setSelectedBeatId(selectedBeatId === beatId ? '' : beatId);
  };

  // Get metrics status for selected beat (combine initial check + SSE updates)
  const getMetricsStatusForBeat = (beatId) => {
    // First check if we have a realtime update from SSE
    if (metricsStatus.has(beatId)) {
      return metricsStatus.get(beatId);
    }
    // Otherwise use initial check
    return initialMetricsCheck.get(beatId) || 'calculating';
  };

  const selectedBeat = beats.find((b) => b._id === selectedBeatId);
  const selectedBeatMetricsReady = getMetricsStatusForBeat(selectedBeatId) === 'completed';

  return (
    <div className="create-dashboard">
      <div className="create-dashboard__container">
        {/* Header */}
        <div className="create-dashboard__header">
          <h1 className="create-dashboard__title">Crear Nuevo Dashboard</h1>
          <p className="create-dashboard__subtitle">
            Selecciona un beat y dale un nombre a tu dashboard de análisis
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="create-dashboard__form">
          {/* Nombre del Dashboard */}
          <div className="create-dashboard__form-section">
            <label htmlFor="dashboardName" className="create-dashboard__label">
              Nombre del Dashboard
            </label>
            <input
              id="dashboardName"
              type="text"
              className="create-dashboard__input"
              value={dashboardName}
              onChange={(e) => setDashboardName(e.target.value)}
              placeholder="Ej: Análisis de Trap Dark"
              disabled={isCreating}
              autoFocus
            />
          </div>

          {/* Selector de Beats */}
          <div className="create-dashboard__form-section">
            <div className="create-dashboard__beats-header">
              <h3 className="create-dashboard__label">
                Seleccionar Beat {selectedBeatId && '✓'}
              </h3>
              {beats.length > 0 && (
                <span className="create-dashboard__beats-count">
                  {beats.length} {beats.length === 1 ? 'beat disponible' : 'beats disponibles'}
                </span>
              )}
            </div>

            {isLoading ? (
              <div className="create-dashboard__loading">
                <div className="spinner"></div>
                <p>Cargando tus beats...</p>
              </div>
            ) : error ? (
              <div className="create-dashboard__error">
                <p>{error}</p>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={loadUserBeats}
                  size="small"
                >
                  Reintentar
                </Button>
              </div>
            ) : beats.length > 0 ? (
              <div className="beats-grid">
                {beats.map((beat) => {
                  const metricsStatusValue = getMetricsStatusForBeat(beat._id);
                  const isCalculating = metricsStatusValue === 'calculating';
                  const hasDashboard = beatsWithDashboard.has(beat._id);
                  const isDisabled = isCalculating || hasDashboard;
                  
                  return (
                  <div
                    key={beat._id}
                    className={`beat-card ${selectedBeatId === beat._id ? 'beat-card--selected' : ''} ${isDisabled ? 'beat-card--disabled' : ''}`}
                    onClick={() => {
                      if (isDisabled) return; // prevent selecting if calculating or has dashboard
                      handleBeatSelect(beat._id);
                    }}
                    role="button"
                    aria-disabled={isDisabled}
                  >
                    {selectedBeatId === beat._id && (
                      <div className="beat-card__check">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" fill="currentColor" />
                          <path d="M7 12l3 3 7-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}

                    <div className="beat-card__content">
                      <h4 className="beat-card__title">{beat.title}</h4>
                      <div className="beat-card__meta">
                        <span className="beat-card__genre">{beat.genre}</span>
                        <span className="beat-card__separator">•</span>
                        <span className="beat-card__bpm">{beat.bpm} BPM</span>
                        <span className="beat-card__separator">•</span>
                        <span className="beat-card__duration">
                          {Math.floor(beat.duration / 60)}:{(beat.duration % 60).toString().padStart(2, '0')}
                        </span>
                      </div>

                      {hasDashboard ? (
                        <div className="beat-card__metrics">
                          <span className="beat-card__metrics-badge beat-card__metrics-badge--has-dashboard">
                           Este beat se ha usado para crear el Dashboard: "{beatToDashboardName.get(beat._id)}"
                          </span>
                        </div>
                      ) : isCalculating ? (
                        <div className="beat-card__metrics">
                          <span className="beat-card__metrics-badge beat-card__metrics-badge--calculating">
                           Calculando métricas…
                          </span>
                        </div>
                      ) : (
                        <div className="beat-card__metrics">
                          <span className="beat-card__metrics-badge beat-card__metrics-badge--done">
                            ✅ Métricas calculadas
                          </span>
                        </div>
                      )}

                      {beat.tags && beat.tags.length > 0 && (
                        <div className="beat-card__tags">
                          {beat.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="beat-tag">#{tag}</span>
                          ))}
                          {beat.tags.length > 3 && (
                            <span className="beat-tag beat-tag--more">+{beat.tags.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
                })}
              </div>
            ) : (
              <div className="create-dashboard__no-beats">
                <p>No tienes beats disponibles.</p>
                <Button
                  type="button"
                  onClick={() => navigate('/app/beats/upload')}
                >
                  Subir tu primer beat
                </Button>
              </div>
            )}
          </div>

          {/* Actions */}
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
              disabled={
                isCreating ||
                !dashboardName.trim() ||
                !selectedBeatId ||
                !selectedBeatMetricsReady
              }
            >
              {isCreating ? 'Creando...' : 'Crear Dashboard'}
            </Button>
          </div>
        </form>

        {selectedBeatId && !selectedBeatMetricsReady && (
          <div className="create-dashboard__warning">
            <p>
              Las métricas del beat seleccionado aún se están calculando. No puedes
              crear el dashboard hasta que finalice el cálculo.
            </p>
            <Button type="button" variant="secondary" onClick={loadUserBeats}>
              Actualizar estados
            </Button>
          </div>
        )}
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        title="Dashboard Creado"
        message="Tu dashboard se ha creado exitosamente y está listo para usar."
        buttonText="Ver Dashboard"
      />
    </div>
  );
};

export default CreateDashboards;