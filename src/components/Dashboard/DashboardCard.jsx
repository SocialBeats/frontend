import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import Card from '../ui/Card';
import ConfirmModal from '../ui/ConfirmModal';
import { useModal } from '../../hooks/use-modal';
import './DashboardCard.css';

const DashboardCard = ({ dashboard, onDelete, onUpdateName }) => {
  const navigate = useNavigate();
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(dashboard.name);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef(null);
  const { isOpen: isDeleteModalOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal();

  useEffect(() => {
    if (isEditingName && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingName]);

  const handleView = () => {
    navigate(`/app/dashboards/view/${dashboard.id}`);
  };

  const handleDeleteClick = () => {
    openDeleteModal();
  };

  const handleConfirmDelete = async () => {
    await onDelete(dashboard.id);
  };

  const handleStartEdit = (e) => {
    e.stopPropagation();
    setIsEditingName(true);
  };

  const handleCancelEdit = () => {
    setEditedName(dashboard.name);
    setIsEditingName(false);
  };

  const handleSaveName = async () => {
    if (editedName.trim() === '') {
      alert('El nombre no puede estar vacío');
      return;
    }

    if (editedName === dashboard.name) {
      setIsEditingName(false);
      return;
    }

    setIsSaving(true);
    try {
      await onUpdateName(dashboard.id, editedName);
      setIsEditingName(false);
    } catch (error) {
      console.error('Error al actualizar nombre:', error);
      alert('Error al actualizar el nombre');
      setEditedName(dashboard.name);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveName();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <>
      <Card className="dashboard-card">
        <div className="dashboard-card__header">
          {isEditingName ? (
            <div className="dashboard-card__title-edit">
              <input
                ref={inputRef}
                type="text"
                className="dashboard-card__title-input"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isSaving}
                onClick={(e) => e.stopPropagation()}
              />
              <button
                className="dashboard-card__edit-button dashboard-card__edit-button--save"
                onClick={handleSaveName}
                disabled={isSaving}
                title="Guardar"
              >
                ✓
              </button>
              <button
                className="dashboard-card__edit-button dashboard-card__edit-button--cancel"
                onClick={handleCancelEdit}
                disabled={isSaving}
                title="Cancelar"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="dashboard-card__title-view">
              <h3 className="dashboard-card__title">{dashboard.name}</h3>
              <button
                className="dashboard-card__edit-icon"
                onClick={handleStartEdit}
                title="Editar nombre"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
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
          <span className="dashboard-card__date">
            {new Date(dashboard.createdAt).toLocaleDateString()}
          </span>
        </div>
        
        <div className="dashboard-card__actions">
          <Button onClick={handleView} variant="primary">
            Visualizar
          </Button>
          <Button onClick={handleDeleteClick} variant="danger">
            Eliminar
          </Button>
        </div>
      </Card>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        title="¿Estás seguro?"
        message="¿Estás seguro de que quieres eliminar este dashboard? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        confirmVariant="danger"
      />
    </>
  );
};

export default DashboardCard;