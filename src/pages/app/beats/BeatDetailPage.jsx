import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  ShoppingCart,
  Eye,
  EyeOff,
  Tag,
  Download,
  CheckCircle2,
  Star,
} from "lucide-react";
import { Feature, On, Default, Loading, ErrorFallback } from 'space-react-client';

import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import IconButton from "../../../components/ui/IconButton";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import BeatDetailPlayer from "../../../components/features/player/BeatDetailPlayer";
import ListComments from "../beats-interaction/comment/ListComments";
import ListRatings from "../beats-interaction/rating/ListRatings";

import {
  getBeatById,
  deleteBeat,
  downloadBeat,
  togglePromotion,
} from "../../../services/beatsService";
import { getCurrentUserId } from "../../../services/authService";
import "./BeatDetailPage.css";

const BeatDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [beat, setBeat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [promoting, setPromoting] = useState(false);
  const [isOwner, setIsOwner] = useState(false); // Placeholder for ownership logic
  // Stats state to update download count locally
  const [stats, setStats] = useState({ plays: 0, downloads: 0 });

  useEffect(() => {
    const fetchBeat = async () => {
      try {
        const beatData = await getBeatById(id);
        if (beatData) {
          setBeat(beatData);
          setStats({
            plays: beatData.stats?.plays || 0,
            downloads: beatData.stats?.downloads || 0,
          });
        } else setError("Beat no encontrado.");
        if (beatData.createdBy?.userId === getCurrentUserId()) setIsOwner(true);
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Error al cargar el beat.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchBeat();
  }, [id]);

  const handleDeleteBeat = async () => {
    try {
      setDeleting(true);
      await deleteBeat(beat._id);
      navigate(-1);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Error al eliminar el beat.";
      setError(errorMessage);
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleDownload = async () => {
    try {
      // Optimistic feedback or loading state could be added here
      const data = await downloadBeat(beat._id);
      if (data && data.downloadUrl) {
        // Updated stats if returned
        if (data.stats) {
          setStats((prev) => ({
            ...prev,
            downloads: data.stats.downloads,
            plays: data.stats.plays || prev.plays,
          }));
          // Also update the main beat object to keep consistency if passed down
          setBeat((prev) => ({
            ...prev,
            stats: {
              ...prev.stats,
              downloads: data.stats.downloads,
              plays: data.stats.plays || prev.stats.plays,
            },
          }));
        }

        // Trigger download
        const link = document.createElement("a");
        link.href = data.downloadUrl;
        link.setAttribute("download", "");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Error al descargar el beat.");
    }
  };

  const handleTogglePromotion = async () => {
    try {
      setPromoting(true);
      const data = await togglePromotion(beat._id);
      if (data) {
        setBeat((prev) => ({
          ...prev,
          promoted: data.promoted,
        }));
      }
    } catch (error) {
      setError(error.response?.data?.message || "Error al cambiar el estado de promoción.");
    } finally {
      setPromoting(false);
    }
  };

  if (loading) return <div className="page-loading">Cargando...</div>;
  if (error) return <div className="page-error">{error}</div>;
  if (!beat) return null;

  return (
    <div className="beat-detail-page">
      <div className="beat-detail-header">
        <IconButton
          variant="ghost"
          size="medium"
          onClick={() => navigate(-1)}
          className="back-btn"
        >
          <ArrowLeft size={20} className="mr-2" /> Volver
        </IconButton>
      </div>

      <div className="beat-detail-container">
        {/* PLAYER HERO */}
        <BeatDetailPlayer beat={beat} isOwner={isOwner} />

        <div className="detail-grid">
          {/* COLUMNA IZQUIERDA: Info */}
          <div className="detail-column-content">
            <Card className="detail-card info-card">
              <div className="detail-card__header">
                <h3>Sobre este Beat</h3>
              </div>
              <div className="detail-card__content">
                <p className="beat-description">
                  {beat.description || "Sin descripción para este beat."}
                </p>

                <div className="beat-card-genre-key">
                  <span className="beat-card-genre">
                    <span className="meta-icon">♪</span>
                    {beat.genre}
                  </span>
                </div>

                <div className="tags-section">
                  <span className="tags-label">
                    <Tag size={16} />
                    Etiquetas
                  </span>
                  <div className="tags-list">
                    {beat.tags && beat.tags.length > 0 ? (
                      beat.tags.map((tag, index) => (
                        <span
                          key={tag}
                          className="tag-chip"
                          style={{ "--tag-index": index }}
                        >
                          #{tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-muted text-sm italic">
                        Sin etiquetas.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* COLUMNA DERECHA: Actions (Rediseñado limpio) */}
          <div className="detail-column-actions">
            <Card className="detail-card actions-card">
              <div className="detail-card__header">
                <h3>Acciones y Licencia</h3>
              </div>

              <div className="detail-card__content actions-layout">
                {/* 1. SECCIÓN PÚBLICA / LICENCIA */}
                <div className="license-section">
                  {isOwner && (
                    <div className="status-container">
                      <div
                        className={`status-badge ${beat.isPublic ? "status-public" : "status-private"
                          }`}
                      >
                        {beat.isPublic ? (
                          <Eye size={14} />
                        ) : (
                          <EyeOff size={14} />
                        )}
                        <span>
                          {beat.isPublic ? "Beat Público" : "Beat Privado"}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Botón Principal */}
                  {beat.isDownloadable && !isOwner && (
                    <Feature id="socialbeats-downloads">
                      <On>
                        <Button
                          variant="primary"
                          className="w-full justify-center btn-buy-large"
                          onClick={handleDownload}
                        >
                          <Download size={20} className="mr-2" />
                          Descargar
                        </Button>
                      </On>
                      <Default>
                        <Button
                          variant="primary"
                          className="w-full justify-center btn-buy-large"
                          onClick={() => {
                            // Redirect to pricing or upgrade page
                            navigate("/app/pricing");
                          }}
                        >
                          Mejorar plan para descargar
                        </Button>
                      </Default>
                      <Loading>
                        <span>Comprobando tu plan...</span>
                      </Loading>
                      <ErrorFallback>
                        <span>Error al verificar tu plan</span>
                      </ErrorFallback>
                    </Feature>
                  )}

                  <div className="license-features">
                    <span className="feature-item">
                      <CheckCircle2 size={12} /> MP3 + WAV
                    </span>
                    <span className="feature-item">
                      <CheckCircle2 size={12} /> Ilimitado
                    </span>
                  </div>
                </div>

                <div className="divider" />

                {/* 2. ADMIN CONTROLS (Intacto) */}
                {isOwner && (
                  <div className="admin-controls">
                    <span className="admin-label">Controles del Propietario</span>
                    
                    {/* Promote Beat Button */}
                    <Feature id="socialbeats-promotedBeat">
                      <On>
                        <Button
                          variant={beat.promoted ? "secondary" : "primary"}
                          size="medium"
                          className="w-full justify-center mb-3"
                          onClick={handleTogglePromotion}
                          disabled={promoting}
                        >
                          <Star
                            size={16}
                            className="mr-2"
                            fill={beat.promoted ? "currentColor" : "none"}
                          />
                          {promoting
                            ? "Procesando..."
                            : beat.promoted
                              ? "Quitar Promoción"
                              : "Promocionar Beat"}
                        </Button>
                      </On>
                      <Default>
                        <Button
                          variant="secondary"
                          size="medium"
                          className="w-full justify-center mb-3"
                          onClick={() => navigate("/app/pricing")}
                        >
                          <Star size={16} className="mr-2" />
                          Promocionar (Add-on)
                        </Button>
                      </Default>
                      <Loading>
                        <span className="text-sm text-muted">Comprobando add-on...</span>
                      </Loading>
                      <ErrorFallback>
                        <span className="text-sm text-danger">Error al verificar add-on</span>
                      </ErrorFallback>
                    </Feature>

                    <div className="admin-buttons-row">
                      <Button
                        variant="secondary"
                        size="medium"
                        className="flex-1 justify-center"
                        onClick={() => navigate(`/app/beats/${beat._id}/edit`)}
                      >
                        <Edit size={16} className="mr-2" /> Editar
                      </Button>

                      <Button
                        variant="danger"
                        size="medium"
                        className="flex-1 justify-center"
                        onClick={() => setShowDeleteModal(true)}
                        disabled={deleting}
                      >
                        <Trash2 size={16} className="mr-2" /> Eliminar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      <div>
        <ListComments isBeat={true} resourceId={beat._id} />
        <ListRatings isBeat={true} resourceId={beat._id} />
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteBeat}
        title="Eliminar Beat"
        message={`¿Eliminar "${beat.title}"? Esta acción no se puede deshacer.`}
        confirmText="Sí, Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
};

export default BeatDetailPage;
