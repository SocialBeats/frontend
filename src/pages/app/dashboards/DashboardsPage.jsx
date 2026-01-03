import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/ui/Button";
import DashboardList from "../../../components/Dashboard/DashboardList";
import {
  getAllDashboards,
  deleteDashboard,
  deleteDashboardWithBeat,
  updateDashboard,
} from "../../../services/analytics/dashboards";
import "./DashboardsPage.css";
import { Default, Feature } from "space-react-client";

const DashboardsPage = () => {
  const navigate = useNavigate();
  const [dashboards, setDashboards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    const cached = (() => {
      try {
        const raw = localStorage.getItem("dashboards_cache");
        return raw ? JSON.parse(raw) : null;
      } catch (err) {
        return null;
      }
    })();

    if (cached && Array.isArray(cached) && cached.length > 0) {
      setDashboards(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }

    const fetchDashboards = async (attempt = 1) => {
      try {
        const response = await getAllDashboards();
        if (!isMountedRef.current) return;
        const list = response.data || [];
        setDashboards(list);
        try {
          localStorage.setItem("dashboards_cache", JSON.stringify(list));
        } catch (e) {
          /* ignore */
        }
        setLoadError(null);
      } catch (error) {
        console.error(
          "Error al cargar dashboards (attempt " + attempt + "):",
          error,
        );
        if (attempt >= 3) {
          if (!cached) {
            setLoadError(
              "Error cargando dashboards. Por favor, intenta de nuevo.",
            );
          }
        } else {
          // retry with backoff
          const backoff = 1000 * Math.pow(2, attempt);
          setTimeout(() => fetchDashboards(attempt + 1), backoff);
        }
      } finally {
        if (isMountedRef.current) setLoading(false);
        setShowTimeoutWarning(false);
      }
    };

    fetchDashboards();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // If loading takes too long, show a non-blocking warning and keep trying in background
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        setShowTimeoutWarning(true);
      }
    }, 8000); // 8s

    return () => clearTimeout(timeout);
  }, [loading]);

  const handleDelete = async (id) => {
    try {
      await deleteDashboard(id);
      setDashboards(dashboards.filter((d) => d.id !== id));
    } catch (error) {
      console.error("Error al eliminar dashboard:", error);
    }
  };

  const handleDeleteWithBeat = async (dashboardId, beatId) => {
    try {
      await deleteDashboardWithBeat(dashboardId, beatId);
      setDashboards(dashboards.filter((d) => d.id !== dashboardId));
    } catch (error) {
      console.error("Error al eliminar dashboard con beat:", error);
    }
  };

  const handleUpdateName = async (id, newName) => {
    try {
      await updateDashboard(id, { name: newName });

      setDashboards(
        dashboards.map((d) => (d.id === id ? { ...d, name: newName } : d)),
      );
    } catch (error) {
      console.error("Error al actualizar nombre:", error);
      throw error;
    }
  };

  const handleCreate = () => {
    navigate("/app/dashboards/create");
  };
  
  const handleUpgrade = () => {
    navigate("/app/pricing")
  }

  // If there's a fatal load error and we have no data cached, show full error/retry
  if (loadError && dashboards.length === 0) {
    return (
      <div className="dashboards-page__error">
        <p>{loadError}</p>
        <Button
          onClick={() => {
            setLoading(true);
            setLoadError(null);
            (async () => {
              try {
                const response = await getAllDashboards();
                setDashboards(response.data || []);
                try {
                  localStorage.setItem(
                    "dashboards_cache",
                    JSON.stringify(response.data || []),
                  );
                } catch (e) {}
              } catch (err) {
                setLoadError(
                  "Error cargando dashboards. Por favor, intenta de nuevo.",
                );
              } finally {
                setLoading(false);
              }
            })();
          }}
        >
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="dashboards-page">
      <Feature id="socialbeats-dashboards">
        <On>
          {/* Rendered when feature is enabled */}
          <div className="dashboards-page__header">
            <h1 className="dashboards-page__title">Mis Dashboards</h1>
            <Button onClick={handleCreate}>+ Crear Dashboard</Button>
          </div>
        </On>
        <Default>
          {/* Rendered when feature is disabled */}
          <div className="dashboards-page__header">
            <h1 className="dashboards-page__title">Mis Dashboards</h1>
            <Button onClick={handleUpgrade}>+ Obtener más dashboards</Button>
          </div>
        </Default>
      </Feature>

      <DashboardList
        dashboards={dashboards}
        onDelete={handleDelete}
        onDeleteWithBeat={handleDeleteWithBeat}
        onUpdateName={handleUpdateName}
      />
    </div>
  );
};

export default DashboardsPage;
