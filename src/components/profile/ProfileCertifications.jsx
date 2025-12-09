import { useState, useRef } from 'react';
import Button from '@/components/ui/Button';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { uploadCertificationToS3 } from '@/services/uploadService';
import PdfViewerModal from '@/components/ui/PdfViewerModal';
import './ProfileCertifications.css';

/**
 * ProfileCertifications - Sección de certificaciones del perfil
 * Permite ver, añadir y eliminar certificaciones (PDFs)
 */
export default function ProfileCertifications({
  certifications = [],
  isOwnProfile,
  onAddCertification,
  onRemoveCertification,
  onError,
  saving,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const fileInputRef = useRef(null);

  const handleAddClick = () => {
    if (newTitle.trim() && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !newTitle.trim()) return;

    try {
      setIsUploading(true);
      const url = await uploadCertificationToS3(file);
      
      await onAddCertification({
        title: newTitle.trim(),
        url,
      });
      
      setNewTitle('');
      setIsEditing(false);
    } catch (error) {
      console.error('Error subiendo certificación:', error);
      if (onError) {
        onError(error.message || 'Error al subir la certificación');
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (index) => {
    setDeleteIndex(index);
  };

  const confirmDelete = async () => {
    if (deleteIndex !== null) {
      await onRemoveCertification(deleteIndex);
      setDeleteIndex(null);
    }
  };

  const handleCertClick = (cert) => {
    setSelectedPdf(cert);
  };

  return (
    <div className="profile-certifications">
      <div className="certs-header">
        <h3 className="certs-title">CERTIFICACIONES</h3>
        {isOwnProfile && !isEditing && (
          <button 
            className="certs-add-btn"
            onClick={() => setIsEditing(true)}
            title="Añadir certificación"
          >
            +
          </button>
        )}
      </div>

      {/* Formulario para añadir */}
      {isEditing && isOwnProfile && (
        <div className="certs-add-form">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Título del certificado..."
            className="certs-title-input"
            maxLength={100}
            disabled={isUploading}
          />
          <div className="certs-add-actions">
            <Button
              variant="secondary"
              size="small"
              onClick={() => {
                setIsEditing(false);
                setNewTitle('');
              }}
              disabled={isUploading}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="small"
              onClick={handleAddClick}
              disabled={!newTitle.trim() || isUploading}
            >
              {isUploading ? '⏳' : '📄'} Subir
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>
      )}

      {/* Lista de certificaciones con scroll */}
      <div className="certs-list">
        {certifications.length === 0 ? (
          <p className="certs-empty">
            {isOwnProfile ? 'Añade tus certificaciones' : 'Sin certificaciones'}
          </p>
        ) : (
          certifications.map((cert, index) => (
            <div 
              key={cert._id || index} 
              className="cert-item"
              onClick={() => handleCertClick(cert)}
            >
              <span className="cert-title">{cert.title}</span>
              {isOwnProfile && isEditing && (
                <button
                  className="cert-remove-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(index);
                  }}
                  disabled={saving}
                  title="Eliminar"
                >
                  ×
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal para ver PDF */}
      {selectedPdf && (
        <PdfViewerModal
          isOpen={!!selectedPdf}
          onClose={() => setSelectedPdf(null)}
          pdfUrl={selectedPdf.url}
          title={selectedPdf.title}
        />
      )}

      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        isOpen={deleteIndex !== null}
        onClose={() => setDeleteIndex(null)}
        onConfirm={confirmDelete}
        title="Eliminar certificación"
        message="¿Estás seguro de que quieres eliminar esta certificación?"
        confirmText="Eliminar"
        cancelText="Cancelar"
        confirmVariant="danger"
      />
    </div>
  );
}
