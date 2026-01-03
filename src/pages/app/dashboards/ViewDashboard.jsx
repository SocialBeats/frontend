import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import Button from "../../../components/ui/Button";
import AddWidgetModal from "../../../components/Dashboard/AddWidgetModal";
import SpiderWidget from "../../../components/Dashboard/SpiderWidgets";
import GenericWidget from "../../../components/Dashboard/GenericWidget";
import {
  getDashboardById,
  updateDashboard,
} from "../../../services/analytics/dashboards";
import {
  getWidgetsByDashboard,
  deleteWidget,
} from "../../../services/analytics/widgets";
import { getRandomQuote } from "../../../services/analytics/quotable";
import { translateQuote } from "../../../services/analytics/translator";
import { AVAILABLE_WIDGETS } from "../../../components/Dashboard/type";
import "./ViewDashboard.css";
import BPMWidget from "../../../components/Dashboard/BPMWidget";
import KeyWidget from "../../../components/Dashboard/KeyWidget";
import ProgressBarWidget from "../../../components/Dashboard/ProgressBarWidget";
import DecibelsWidget from "../../../components/Dashboard/DecibelsWidget";
import SimpleNumberWidget from "../../../components/Dashboard/SimpleNumberWidget";
import BadgeWidget from "../../../components/Dashboard/BadgeWidget";
import HzRangeWidget from "../../../components/Dashboard/HzRangeWidget";
import FrequencyWidget from "../../../components/Dashboard/FrecuencyWidget";
import GaugeWidget from "../../../components/Dashboard/GaugeWidget";
import RatioWidget from "../../../components/Dashboard/RatioWidget";
import ChromaWidget from "../../../components/Dashboard/ChromaWidget";
import { mockBeatMetrics } from "../../../utils/mockMetrics";
import { getBeatMetrics } from "../../../services/analytics/beatMetrics";
import BeatsPositionWidget from "../../../components/Dashboard/BeatsPositionWidget";

const ViewDashboard = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [widgets, setWidgets] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quote, setQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(true);
  const [translatedQuote, setTranslatedQuote] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const inputRef = useRef(null);
  const addButtonRef = useRef(null);
  const [showFab, setShowFab] = useState(false);

  // Metrics state (moved up so effects can safely reference setters)
  const [metrics, setMetrics] = useState(mockBeatMetrics.extraMetrics);
  const [coreMetrics, setCoreMetrics] = useState(mockBeatMetrics.coreMetrics);
  const [metricsLoading, setMetricsLoading] = useState(false);

  const WIDGET_SECTIONS = {
    CORE: "Métricas Core",
    TEMPO: "Tempo",
    TONALIDAD: "Tonalidad",
    PERFIL_MELODICO: "Perfil Melódico",
    DINAMICA: "Dinámica",
    TEXTURA: "Textura",
    ARTICULACION: "Articulación",
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await getDashboardById(id);
        const dashboardData = response.data || response;
        setDashboard(dashboardData);
        setEditedName(dashboardData.name);
      } catch (error) {
        console.error("Error al cargar dashboard:", error);
        setDashboard(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [id]);

  // Cargar quote aleatoria
  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const response = await getRandomQuote();
        const quoteData = response.data || response;
        setQuote(quoteData);
      } catch (error) {
        console.error("Error al cargar quote:", error);
        setQuote(null);
      } finally {
        setQuoteLoading(false);
      }
    };

    fetchQuote();
  }, []);

  // Try to load real metrics for a beat if the dashboard contains a beatId (fallback to mocks)
  useEffect(() => {
    const tryFetchMetrics = async () => {
      if (!dashboard) return;

      const beatId =
        dashboard.beatId ||
        dashboard.beat_id ||
        dashboard.selectedBeatId ||
        dashboard.metadata?.beatId ||
        dashboard.metadata?.beat_id;
      if (!beatId) {
        // No beatId available on dashboard; keep using mock metrics
        return;
      }

      try {
        setMetricsLoading(true);
        console.log("🔍 Fetching metrics for beatId:", beatId);
        const resp = await getBeatMetrics(beatId);

        // Normalizar la respuesta — el backend puede devolver:
        // - { data: { data: <payload> } }
        // - { data: <payload> }
        // - <payload>
        // Además el payload puede ser un array de análisis (varias entradas).
        let payload = resp?.data?.data ?? resp?.data ?? resp;

        if (Array.isArray(payload)) {
          // Elegir el primer elemento (o el último si prefieres el más reciente)
          const chosen = payload[0] || payload[payload.length - 1];
          console.log(
            "ℹ️ Backend returned array of metrics, choosing element:",
            chosen,
          );
          payload = chosen;
        }

        const extra =
          payload?.extraMetrics ?? payload?.extra_metrics ?? payload;
        const core = payload?.coreMetrics ?? payload?.core_metrics ?? null;

        if (core && typeof core === "object") {
          setCoreMetrics(core);
        } else {
          setCoreMetrics(mockBeatMetrics.coreMetrics);
        }

        if (extra && typeof extra === "object") {
          setMetrics(extra);
          console.log("✅ Metrics loaded for beatId:", beatId, extra);
        } else {
          console.warn(
            "⚠️ No extra metrics found in response for beatId (using mocks):",
            beatId,
            resp,
          );
          setMetrics(mockBeatMetrics.extraMetrics);
        }
      } catch (err) {
        console.error(
          "🚨 Error fetching beat metrics for beatId:",
          beatId,
          err,
        );
        setMetrics(mockBeatMetrics.extraMetrics);
      } finally {
        setMetricsLoading(false);
      }
    };

    tryFetchMetrics();
  }, [dashboard]);

  // Show FAB when the header 'Añadir Widget' button is not visible in viewport
  useEffect(() => {
    if (!addButtonRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        // show FAB when header button is NOT intersecting
        setShowFab(!entry.isIntersecting);
      },
      { root: null, threshold: 0.05 },
    );

    observer.observe(addButtonRef.current);

    return () => {
      observer.disconnect();
    };
  }, [addButtonRef.current]);

  // Cargar widgets del dashboard
  useEffect(() => {
    const fetchWidgets = async () => {
      if (!id) return;

      try {
        console.log("🔍 Cargando widgets para dashboard:", id);
        const response = await getWidgetsByDashboard(id);
        const widgetsData = response.data || response;

        console.log("📦 Widgets recibidos de la API:", widgetsData);

        // Mapear los widgets de la API al formato esperado por la UI
        const mappedWidgets = widgetsData.map((widget) => {
          const metricType = (
            widget.metricType ||
            widget.metric_type ||
            ""
          ).toLowerCase();
          const widgetDef = AVAILABLE_WIDGETS.find(
            (w) => w.type === metricType,
          );

          console.log("🔄 Mapeando widget:", {
            original: widget,
            metricType,
            widgetDef,
          });

          return {
            id: widget.id || widget._id,
            type: metricType,
            section: widgetDef?.section || "Métricas Core",
            title: widgetDef?.title || widget.metricType || "Widget",
          };
        });

        console.log("✅ Widgets mapeados para UI:", mappedWidgets);
        setWidgets(mappedWidgets);
      } catch (error) {
        console.error("❌ Error al cargar widgets:", error);
        console.error("❌ Error response:", error.response?.data);
        setWidgets([]);
      }
    };

    fetchWidgets();
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
    if (editedName.trim() === "") {
      alert("El nombre no puede estar vacío");
      return;
    }

    if (editedName === dashboard.name) {
      setIsEditingName(false);
      return;
    }

    setIsSaving(true);
    try {
      await updateDashboard(dashboard.id, { name: editedName });
      setDashboard((prev) => ({ ...prev, name: editedName }));
      setIsEditingName(false);
    } catch (error) {
      console.error("Error al actualizar nombre:", error);
      alert("Error al actualizar el nombre");
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSaveName();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const handleBack = () => {
    navigate("/app/dashboards");
  };

  const handleAddWidget = (newWidget) => {
    // El widget ya viene formateado desde el modal
    setWidgets([...widgets, newWidget]);
  };

  const handleRemoveWidget = async (widgetId) => {
    try {
      await deleteWidget(widgetId);
      setWidgets(widgets.filter((w) => w.id !== widgetId));
    } catch (error) {
      console.error("Error al eliminar widget:", error);
      alert("Error al eliminar el widget. Por favor, intenta de nuevo.");
    }
  };

  const handleTranslateQuote = async () => {
    if (!quote || !quote.content) {
      return;
    }

    // Si ya tenemos la traducción, solo alternar la visualización
    if (translatedQuote) {
      setShowTranslation(!showTranslation);
      return;
    }

    // Si no tenemos traducción, llamar a la API
    setIsTranslating(true);
    try {
      const response = await translateQuote(quote.content);
      const translationData = response.data || response;
      setTranslatedQuote(translationData);
      setShowTranslation(true);
    } catch (error) {
      console.error("Error al traducir quote:", error);
      alert("Error al traducir la frase. Por favor, intenta de nuevo.");
    } finally {
      setIsTranslating(false);
    }
  };

  const renderWidget = (widget) => {
    switch (widget.type) {
      case "spider":
        return <SpiderWidget coreMetrics={coreMetrics} />;

      // Tempo
      case "bpm":
        return <BPMWidget title={widget.title} value={metrics.bpm} />;
      case "num_beats":
        return (
          <SimpleNumberWidget
            title={widget.title}
            value={metrics.num_beats?.toLocaleString?.() ?? metrics.num_beats}
            icon="💓"
            bpm={metrics.bpm}
          />
        );
      case "duracion_promedio":
        return (
          <SimpleNumberWidget
            title={widget.title}
            value={
              metrics.mean_duration
                ? metrics.mean_duration.toFixed(3)
                : metrics.mean_duration
            }
            unit="s"
          />
        );
      case "beats_position":
        return (
          <BeatsPositionWidget
            title={widget.title}
            value={metrics.beats_position}
          />
        );
      // Tonalidad
      case "clave":
        return <KeyWidget title={widget.title} value={metrics.key} />;
      case "uniformidad_notas":
        return (
          <ProgressBarWidget title={widget.title} value={metrics.uniformity} />
        );
      case "estabilidad_tonal":
        return (
          <ProgressBarWidget title={widget.title} value={metrics.stability} />
        );
      case "chroma_features":
        return (
          <ChromaWidget
            title="Características Cromáticas"
            chromaFeatures={metrics.chroma_features}
          />
        );

      // Potencia Sonora
      case "db":
        return <DecibelsWidget title={widget.title} value={metrics.decibels} />;

      // Perfil Melódico
      case "rango_hz":
        return (
          <HzRangeWidget
            title={widget.title}
            range={metrics.hz_range}
            mean={metrics.mean_hz}
          />
        );
      case "hz_medios":
        return <FrequencyWidget title={widget.title} value={metrics.mean_hz} />;

      // Textura
      case "caracter":
        return (
          <BadgeWidget
            title={widget.title}
            value={metrics.character}
            emoji="✨"
          />
        );
      case "apertura":
        return <GaugeWidget title={widget.title} value={metrics.opening} />;

      // Articulación
      case "staccato":
        return (
          <BadgeWidget title={widget.title} value={metrics.style} emoji="🎵" />
        );
      case "ataques_subitos":
        return (
          <SimpleNumberWidget
            title={widget.title}
            value={metrics.suddent_changes}
            icon="⚡"
          />
        );
      case "ataques_graduales":
        return (
          <SimpleNumberWidget
            title={widget.title}
            value={metrics.soft_changes}
            icon="〰️"
          />
        );
      case "ratio_ataques":
        return (
          <RatioWidget
            title={widget.title}
            suddenChanges={metrics.suddent_changes}
            softChanges={metrics.soft_changes}
            ratio={metrics.ratio_sudden_soft}
          />
        );

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

  /* Reordering of widgets by section was removed — restoring original rendering order. */

  const sections = Object.values(WIDGET_SECTIONS).filter(
    (section) => widgetsBySection[section]?.length > 0,
  );

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
            <span>
              Creado:{" "}
              {new Date(
                dashboard.created_at || dashboard.createdAt,
              ).toLocaleDateString()}
            </span>
            {(dashboard.updated_at || dashboard.updatedAt) && (
              <span>
                Actualizado:{" "}
                {new Date(
                  dashboard.updated_at || dashboard.updatedAt,
                ).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        <div className="view-dashboard__actions">
          <Button onClick={handleBack} variant="secondary">
            Volver
          </Button>
        </div>
      </div>

      {/* Quote Section */}
      {!quoteLoading && quote && (
        <div className="view-dashboard__quote-wrapper">
          <div className="view-dashboard__quote-card">
            <div className="view-dashboard__quote-icon">
              <svg
                fill="currentColor"
                viewBox="0 0 24 24"
                width="48"
                height="48"
              >
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
            </div>
            <div className="view-dashboard__quote-content">
              <p className="view-dashboard__quote-text">
                "
                {showTranslation && translatedQuote
                  ? translatedQuote.translated_text
                  : quote.content}
                "
              </p>
              <div className="view-dashboard__quote-footer">
                <p className="view-dashboard__quote-author">— {quote.author}</p>
                <button
                  onClick={handleTranslateQuote}
                  disabled={isTranslating}
                  className="view-dashboard__translate-btn"
                  title={
                    showTranslation ? "Ver original" : "Traducir al español"
                  }
                >
                  {isTranslating ? (
                    <>
                      <svg
                        className="view-dashboard__spinner"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Traduciendo...</span>
                    </>
                  ) : showTranslation ? (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        width="16"
                        height="16"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Ver original</span>
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        width="16"
                        height="16"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578a18.87 18.87 0 01-1.724 4.78c.29.354.596.696.914 1.026a1 1 0 11-1.44 1.389c-.188-.196-.373-.396-.554-.6a19.098 19.098 0 01-3.107 3.567 1 1 0 01-1.334-1.49 17.087 17.087 0 003.13-3.733 18.992 18.992 0 01-1.487-2.494 1 1 0 111.79-.89c.234.47.489.928.764 1.372.417-.934.752-1.913.997-2.927H3a1 1 0 110-2h3V3a1 1 0 011-1zm6 6a1 1 0 01.894.553l2.991 5.982a.869.869 0 01.02.037l.99 1.98a1 1 0 11-1.79.895L15.383 16h-4.764l-.724 1.447a1 1 0 11-1.788-.894l.99-1.98.019-.038 2.99-5.982A1 1 0 0113 8zm-1.382 6h2.764L13 11.236 11.618 14z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Traducir</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="view-dashboard__content">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Visualización del Dashboard</h2>
          <button
            ref={addButtonRef}
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Añadir Widget
          </button>
        </div>

        {widgets.length === 0 ? (
          <div className="view-dashboard__empty-state">
            <div className="view-dashboard__empty-icon">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="9" y1="9" x2="15" y2="9" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
            </div>
            <p className="view-dashboard__empty-text">
              No hay widgets añadidos
            </p>
            <p className="view-dashboard__empty-description">
              Comienza agregando tu primer widget para visualizar las métricas de tu beat
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="view-dashboard__empty-button"
            >
              <Plus size={20} />
              Añade tu primer widget
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {sections.map((section) => (
              <div key={section}>
                <h3 className="text-xl font-semibold mb-4">{section}</h3>
                {
                  // Use 2 equal columns on large screens for the "Tonalidad" section
                  // so `clave` and `Características Cromáticas` can sit side-by-side.
                }
                {
                  // Make Tonalidad and Perfil Melódico use 2 equal columns
                }
                <div
                  className={
                    section === WIDGET_SECTIONS.TONALIDAD ||
                    section === WIDGET_SECTIONS.PERFIL_MELODICO
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6"
                      : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  }
                >
                  {widgetsBySection[section].map((widget) => (
                    <div
                      key={widget.id}
                      className={(() => {
                        const classes = ["relative", "group"];
                        if (widget.type === "spider")
                          classes.push("spider-widget-container");
                        if (widget.type === "bpm")
                          classes.push("bpm-widget-container");
                        if (widget.type === "db")
                          classes.push("widget-span-full");
                        // Make the Ratio widget span the full grid width by applying
                        // the same `widget-span-full` helper to the grid child wrapper.
                        if (widget.type === "ratio_ataques")
                          classes.push("widget-span-full");
                        if (widget.type === "apertura")
                          classes.push("widget-span-2");
                        // No automatic 3-column span applied here; keep wrapper classes minimal.
                        return classes.join(" ");
                      })()}
                      style={
                        widget.type === "apertura"
                          ? { gridColumn: "span 2" }
                          : undefined
                      }
                    >
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
      </div>

      <AddWidgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddWidget={handleAddWidget}
        dashboardId={id}
        existingWidgets={widgets}
      />
      {showFab && (
        <button
          className="view-dashboard__fab"
          onClick={() => setIsModalOpen(true)}
          aria-label="Añadir Widget"
          title="Añadir Widget"
        >
          <Plus size={20} />
        </button>
      )}
    </div>
  );
};

export default ViewDashboard;
