import Modal from './Modal';
import Button from './Button';
import './SuccessModal.css';

const SuccessModal = ({
  isOpen,
  onClose,
  title = 'Éxito',
  message,
  buttonText = 'Aceptar',
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="success-modal">
        <div className="success-modal__icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <p className="success-modal__message">{message}</p>
        <div className="success-modal__actions">
          <Button onClick={onClose} variant="primary">
            {buttonText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SuccessModal;