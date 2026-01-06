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
          const errorMessage = err.response?.data?.message || 'Error al cargar los datos del beat';
          setError(errorMessage);
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

        // Get Presigned POST data from backend
        const presignedData = await getPresignedUrl({
          extension,
          mimetype: audioFile.type || 'audio/mpeg',
          size: audioFile.size
        });

        // Upload to S3 using POST with FormData
        // presignedData contains: { url, fields, fileKey, expiresIn, maxFileSize }
        await uploadFileToS3(presignedData, audioFile);

        // Add/Overwrite audio info
        submitData.audio = {
          ...submitData.audio,
          s3Key: presignedData.fileKey,
          filename: audioFile.name,
          size: audioFile.size,
          format: extension,
        };
      }

      // 2. Handle Cover Upload (For both Create and Edit)
      if (coverFile) {
        const extension = coverFile.name.split('.').pop().toLowerCase();
        // Get Presigned POST data for Image
        const presignedCoverData = await getPresignedUrl({
          extension,
          mimetype: coverFile.type || 'image/jpeg',
          size: coverFile.size
        });

        // Upload Image to S3 using POST with FormData
        await uploadFileToS3(presignedCoverData, coverFile);

        // Add s3CoverKey to audio object
        submitData.audio = {
          ...(submitData.audio || {}),
          s3CoverKey: presignedCoverData.fileKey
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
        // Instead of navigating immediately, show a modal informing the user
        const idResult = result._id || result.id || result;
        setCreatedBeatId(idResult);
        setShowCreatedModal(true);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || `Error al ${isEditing ? 'actualizar' : 'crear'} el beat. Por favor, inténtalo de nuevo.`;
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="beat-form-loading">
        <div className="text-xl text-muted">Cargando datos del beat...</div>
      </div>
    );
  }

  return (
    <div className="beat-form-page">
      {/* Header */}
      <div className="beat-form-header">
        <button onClick={() => navigate(-1)} className="back-button">
          <IconButton variant="ghost" size="medium">
            ← Volver
          </IconButton>
        </button>
        <h1 className="beat-form-title">
          {isEditing ? 'Editar Beat' : 'Crear Nuevo Beat'}
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
        onClose={() => {
          setShowCreatedModal(false);
          if (createdBeatId) navigate(`/app/beats/${createdBeatId}`);
        }}
        title="Métricas en proceso"
      >
        <div className="created-beat-modal">
          <p>Se están calculando las métricas de tu beat. En breve podrás crear tus dashboards basados en este beat.</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            <Button variant="secondary" onClick={() => {
              setShowCreatedModal(false);
              if (createdBeatId) navigate(`/app/beats/${createdBeatId}`);
            }}>Cerrar</Button>
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
