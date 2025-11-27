import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import IconButton from '../../../components/ui/IconButton';
import Badge from '../../../components/ui/Badge';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import logo from '../../../assets/logo-dark-no-fondo.png';
// import { mockedBeats } from './mockBeats';
import { getBeatById, deleteBeat } from '../../../services/beatsService';
import './BeatDetailPage.css';

const BeatDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [beat, setBeat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchBeat = async () => {
      try {
        const beatData = await getBeatById(id);
        if (beatData) {
          setBeat(beatData);
        } else {
          setError('Beat not found.');
        }
      } catch (err) {
        setError('Error fetching beat details. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBeat();
    }
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!beat) {
    return <div>Beat not found.</div>;
  }

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleDeleteBeat = async () => {
    try {
      setDeleting(true);
      await deleteBeat(beat._id);
      console.log('✅ Beat deleted successfully');
      navigate(-1); // Redirigir a la lista de beats
    } catch (err) {
      console.error('🚨 Error deleting beat:', err);
      setError('Error deleting beat. Please try again.');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="beat-detail-page">
      {/* Back Button */}
      <div className="beat-detail-header">
        <button 
          onClick={() => navigate(-1)} 
          className="back-button"
        >
          <IconButton variant="ghost" size="medium">
            ← Back
          </IconButton>
        </button>
      </div>

      <div className="beat-detail-content">
        {/* Main Beat Info Section */}
        <div className="beat-hero-section">
          <div className="beat-cover-large">
            <img 
              src={logo} 
              alt={beat.title}
              className="beat-cover-image"
            />
            <div className="beat-cover-overlay">
              <Button className="play-button-large" size="large">
                <span className="play-icon-large">▶</span>
                Play
              </Button>
            </div>
          </div>
          
          <div className="beat-info-main">
            <div className="beat-title-section">
              <h1 className="beat-title-large">{beat.title}</h1>
              <p className="beat-artist-large">{beat.artist}</p>
              
              {/* Tags */}
              {beat.tags && beat.tags.length > 0 && (
                <div className="tags-container-inline">
                  {beat.tags.map((tag, index) => (
                    <div key={tag} className="tag-item-inline" style={{ '--tag-index': index }}>
                      <span className="tag-hash">#</span>
                      <span className="tag-text">{tag}</span>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="beat-stats">
                <span className="stat-item">
                  <span className="stat-icon">👁</span>
                  {beat.stats?.plays?.toLocaleString() || '0'} plays
                </span>
                <span className="stat-item">
                  <span className="stat-icon">💾</span>
                  {beat.stats?.downloads?.toLocaleString() || '0'} downloads
                </span>
                <span className="stat-item">
                  <span className="stat-icon">❤️</span>
                  {beat.stats?.likes?.toLocaleString() || '0'} likes
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Beat Details Grid */}
        <div className="beat-details-grid">
          <Card className="beat-info-card">
            <div className="card-header">
              <h2>Beat Information</h2>
            </div>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Genre</span>
                <Badge variant="secondary">{beat.genre}</Badge>
              </div>
              <div className="info-item">
                <span className="info-label">BPM</span>
                <span className="info-value">{beat.bpm}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Key</span>
                <span className="info-value">{beat.key}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Duration</span>
                <span className="info-value">{formatDuration(beat.duration)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Mood</span>
                <Badge variant="outline">{beat.mood}</Badge>
              </div>
              <div className="info-item">
                <span className="info-label">License</span>
                <Badge variant={beat.license === 'Free' ? 'success' : 'default'}>
                  {beat.license}
                </Badge>
              </div>
            </div>
          </Card>

          <Card className="beat-actions-card">
            <div className="card-header">
              <h2>Pricing & Actions</h2>
            </div>
            <div className="pricing-section">
              <div className="price-display">
                <span className="price-label">Price</span>
                <span className="price-value">
                  {beat.pricing?.isFree ? 'Free' : `$${beat.pricing?.price}`}
                </span>
              </div>
              <div className="action-buttons">
                <Button variant="primary" size="large" className="download-btn">
                  💾 Download
                </Button>
                <Button variant="outline" size="large" className="like-btn">
                  ❤️ Like
                </Button>
                <button 
                  onClick={() => navigate(`/app/beats/${beat._id}/edit`)}
                  className="edit-beat-link"
                >
                  <Button variant="secondary" size="large" className="edit-btn">
                    ✏️ Edit Beat
                  </Button>
                </button>
                <Button 
                  variant="danger" 
                  size="large" 
                  className="delete-btn"
                  onClick={() => setShowDeleteModal(true)}
                  disabled={deleting}
                >
                  🗑️ {deleting ? 'Deleting...' : 'Delete Beat'}
                </Button>
              </div>
            </div>
          </Card>
        </div>


      </div>
      
      {/* Modal de confirmación para borrar */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteBeat}
        title="Delete Beat"
        message={`Are you sure you want to delete "${beat?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default BeatDetailPage;