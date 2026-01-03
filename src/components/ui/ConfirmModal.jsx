import Modal from "./Modal";
import Button from "./Button";
import "./ConfirmModal.css";

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "¿Estás seguro?",
  message,
  confirmText = "Aceptar",
  cancelText = "Cancelar",
  confirmVariant = "primary",
  isLoading = false,
  // New props for third option
  showThirdOption = false,
  thirdOptionText,
  thirdOptionVariant = "danger",
  onThirdOption,
}) => {
  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  const handleThirdOption = async () => {
    await onThirdOption();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      showCloseButton={false}
    >
      <div className="confirm-modal">
        <p className="confirm-modal__message">{message}</p>
        <div className="confirm-modal__actions">
          <Button onClick={onClose} variant="secondary" disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            variant={confirmVariant}
            disabled={isLoading}
          >
            {isLoading ? "Procesando..." : confirmText}
          </Button>
          {showThirdOption && (
            <Button
              onClick={handleThirdOption}
              variant={thirdOptionVariant}
              disabled={isLoading}
            >
              {isLoading ? "Procesando..." : thirdOptionText}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
