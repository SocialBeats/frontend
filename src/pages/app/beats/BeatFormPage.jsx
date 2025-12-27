import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../../../components/ui/Card';
import IconButton from '../../../components/ui/IconButton';
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

  const handleSubmit = async (formData, audioFile, coverFile) => {
    setSaving(true);
    setError(null);

    try {
      let submitData = { ...formData };

      // Si estamos editando, necesitamos asegurarnos de no perder los datos de audio existentes
      // Si estamos creando, submitData.audio se construirá abajo
      if (isEditing && beatData && beatData.audio) {
        // Empezamos copiando lo existente para preservar s3Key, filename, duration, waveform, etc.
        // Importante: No queremos que submitData (que viene de formData) sobrescriba accidentalmente audio si formData lo tuviera (no lo tiene por ahora).
        submitData.audio = { ...beatData.audio };
      }

      // 1. Handle Audio Upload (Only for NEW beats currently)
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

        // Add/Overwrite audio info
        // Si ya habíamos copiado algo (caso raro en create si reintentamos), sobrescribimos
        submitData.audio = {
          ...submitData.audio,
          s3Key: presignedData.s3Key,
          filename: audioFile.name,
          size: audioFile.size,
          format: extension,
        };
      }

      // 2. Handle Cover Upload (For both Create and Edit)
      if (coverFile) {
        const extension = coverFile.name.split('.').pop().toLowerCase();
        // Get Presigned URL for Image
        const presignedCoverData = await getPresignedUrl({
          extension,
          mimetype: coverFile.type || 'image/jpeg', // Fallback
          size: coverFile.size
        });

        // Upload Image to S3
        await uploadFileToS3(presignedCoverData.uploadUrl, coverFile);

        // Add s3CoverKey to audio object
        submitData.audio = {
          ...(submitData.audio || {}), // Ensure object exists
          s3CoverKey: presignedCoverData.s3Key
        };
      }

      // Si estamos editando y NO subimos nada, submitData.audio debería ser lo que era (preservado arriba)
      // Si subimos solo cover, submitData.audio tiene todo lo viejo + nuevo s3CoverKey
      // Si estamos creando, submitData.audio tiene lo del audio nuevo + cover (si hay)

      let result;
      if (isEditing) {
        await updateBeat(id, submitData);
        navigate(-1);
      } else {
        result = await createBeat(submitData);
        navigate(`/app/beats/${result._id || result.id}`, { replace: true });
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
    </div>
  );
};

export default BeatFormPage;
