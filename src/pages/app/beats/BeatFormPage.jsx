import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../../../components/ui/Card';
import IconButton from '../../../components/ui/IconButton';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import BeatForm from '../../../components/forms/BeatForm';
import { createBeat, updateBeat, getBeatById, getPresignedUrl, uploadFileToS3 } from '../../../services/beatsService';
import './BeatFormPage.css';

const BeatFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [beatData, setBeatData] = useState(null);
  const [createdBeatId, setCreatedBeatId] = useState(null);
  const [showCreatedModal, setShowCreatedModal] = useState(false);

  // Load beat data for editing
  useEffect(() => {
    if (isEditing) {
      const loadBeat = async () => {
        try {
          const beat = await getBeatById(id);
          setBeatData(beat);
        } catch (err) {
          setError('Error loading beat data');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      loadBeat();
    }
  }, [id, isEditing]);

  const handleSubmit = async (formData, audioFile) => {
    setSaving(true);
    setError(null);

    try {
      let submitData = { ...formData };

      // Handle file upload for new beats
      if (audioFile && !isEditing) {
        const extension = audioFile.name.split('.').pop().toLowerCase();

        // Get Presigned URL
        const presignedData = await getPresignedUrl({
          extension,
          mimetype: audioFile.type || 'audio/mpeg',
          size: audioFile.size
        });

        // Upload to S3
        await uploadFileToS3(presignedData.uploadUrl, audioFile);

        // Add audio info to submit data
        submitData.audio = {
          s3Key: presignedData.s3Key,
          filename: audioFile.name,
          size: audioFile.size,
          format: extension,
        };
      }

      let result;
      if (isEditing) {
        await updateBeat(id, submitData);
        navigate(-1);
      } else {
        result = await createBeat(submitData);
        // Instead of navigating immediately, show a modal informing the user
        const idResult = result._id || result.id || result;
        setCreatedBeatId(idResult);
        setShowCreatedModal(true);
      }
    } catch (err) {
      setError(`Error ${isEditing ? 'updating' : 'creating'} beat. Please try again.`);
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="beat-form-loading">
        <div className="text-xl text-muted">Loading beat data...</div>
      </div>
    );
  }

  return (
    <div className="beat-form-page">
      {/* Header */}
      <div className="beat-form-header">
        <button onClick={() => navigate(-1)} className="back-button">
          <IconButton variant="ghost" size="medium">
            ← Back
          </IconButton>
        </button>
        <h1 className="beat-form-title">
          {isEditing ? 'Edit Beat' : 'Create New Beat'}
        </h1>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="error-card">
          <p className="error-message">{error}</p>
        </Card>
      )}

      {/* Beat Form Component */}
      <BeatForm
        initialData={beatData}
        onSubmit={handleSubmit}
        onCancel={() => navigate(-1)}
        loading={saving}
        isEditing={isEditing}
      />

      <Modal
        isOpen={showCreatedModal}
        onClose={() => setShowCreatedModal(false)}
        title="Métricas en proceso"
      >
        <div className="created-beat-modal">
          <p>Se están calculando las métricas de tu beat. En breve podrás crear tus dashboards basados en este beat.</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            <Button variant="secondary" onClick={() => setShowCreatedModal(false)}>Cerrar</Button>
            <Button variant="primary" onClick={() => {
              setShowCreatedModal(false);
              if (createdBeatId) navigate(`/app/beats/${createdBeatId}`);
            }}>Ver beat</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BeatFormPage;
