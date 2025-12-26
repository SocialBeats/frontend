import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, ShoppingCart, Eye, EyeOff, Tag, Download, CheckCircle2 } from 'lucide-react';

import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import IconButton from '../../../components/ui/IconButton';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import BeatDetailPlayer from '../../../components/features/player/BeatDetailPlayer';

import { getBeatById, deleteBeat, downloadBeat } from '../../../services/beatsService';
import { getCurrentUserId } from '../../../services/authService';
import './BeatDetailPage.css';

const BeatDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [beat, setBeat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
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
            downloads: beatData.stats?.downloads || 0
          });
        }
        else setError('Beat not found.');
        if (beatData.createdBy?.userId === getCurrentUserId()) setIsOwner(true); // Replace with actual user ID check
      } catch (err) {
        setError('Error fetching beat.');
        console.error(err);
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
      console.error(err);
      setError('Error deleting beat.');
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
          setStats(prev => ({
            ...prev,
            downloads: data.stats.downloads,
            plays: data.stats.plays || prev.plays
          }));
          // Also update the main beat object to keep consistency if passed down
          setBeat(prev => ({
            ...prev,
            stats: {
              ...prev.stats,
              downloads: data.stats.downloads,
              plays: data.stats.plays || prev.stats.plays
            }
          }));
        }

        // Trigger download
        const link = document.createElement('a');
        link.href = data.downloadUrl;
        link.setAttribute('download', '');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("Error downloading beat:", error);
      // Error handling/toast could be added here
    }
  };

  if (loading) return <div className="page-loading">Loading...</div>;
  if (error) return <div className="page-error">{error}</div>;
  if (!beat) return null;

  return (
    <div className="beat-detail-page">

      <div className="beat-detail-header">
        <IconButton variant="ghost" size="medium" onClick={() => navigate(-1)} className="back-btn">
          <ArrowLeft size={20} className="mr-2" /> Back
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
                <h3>About this Track</h3>
              </div>
              <div className="detail-card__content">
                <p className="beat-description">
                  {beat.description || "No description provided for this beat."}
                </p>

                <div className="beat-card-genre-key">
                  <span className="beat-card-genre">
                    <span className="meta-icon">♪</span>
                    {beat.genre}
                  </span>
                  {beat.key && (
                    <span className="beat-card-key">
                      <span className="meta-label">Key</span>
                      {beat.key}
                    </span>
                  )}
                </div>

                <div className="tags-section">
                  <span className="tags-label">
                    <Tag size={16} />
                    Vibe & Tags
                  </span>
                  <div className="tags-list">
                    {beat.tags && beat.tags.length > 0 ? (
                      beat.tags.map((tag, index) => (
                        <span key={tag} className="tag-chip" style={{ '--tag-index': index }}>
                          #{tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-muted text-sm italic">No tags added.</span>
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
                <h3>Actions & License</h3>
              </div>

              <div className="detail-card__content actions-layout">

                {/* 1. SECCIÓN PÚBLICA / LICENCIA */}
                <div className="license-section">

                  {isOwner && (
                    <div className="status-container">
                      <div className={`status-badge ${beat.isPublic ? 'status-public' : 'status-private'}`}>
                        {beat.isPublic ? <Eye size={14} /> : <EyeOff size={14} />}
                        <span>{beat.isPublic ? 'Public Beat' : 'Private Beat'}</span>
                      </div>
                    </div>)}

                  {/* Botón Principal */}
                  {beat.isDownloadable && !isOwner && (
                    <Button
                      variant="primary"
                      className="w-full justify-center btn-buy-large"
                      onClick={handleDownload}
                    >
                      <Download size={20} className="mr-2" />
                      Download
                    </Button>
                  )}

                  <div className="license-features">
                    <span className="feature-item"><CheckCircle2 size={12} /> MP3 + WAV</span>
                    <span className="feature-item"><CheckCircle2 size={12} /> Unlimited</span>
                  </div>
                </div>

                <div className="divider" />

                {/* 2. ADMIN CONTROLS (Intacto) */}
                {isOwner && (
                  <div className="admin-controls">
                    <span className="admin-label">Owner Controls</span>
                    <div className="admin-buttons-row">
                      <Button
                        variant="secondary"
                        size="medium"
                        className="flex-1 justify-center"
                        onClick={() => navigate(`/app/beats/${beat._id}/edit`)}
                      >
                        <Edit size={16} className="mr-2" /> Edit
                      </Button>

                      <Button
                        variant="danger"
                        size="medium"
                        className="flex-1 justify-center"
                        onClick={() => setShowDeleteModal(true)}
                        disabled={deleting}
                      >
                        <Trash2 size={16} className="mr-2" /> Delete
                      </Button>
                    </div>
                  </div>
                )}

              </div>
            </Card>
          </div>

        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteBeat}
        title="Delete Beat"
        message={`Delete "${beat.title}"? This cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default BeatDetailPage;