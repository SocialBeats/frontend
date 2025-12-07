import Modal from './Modal';
import Button from './Button';
import './ErrorModal.css';

const ErrorModal = ({
  isOpen,
  onClose,
  title = 'Error',
  message,
  buttonText = 'Cerrar',
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="error-modal">
        <div className="error-modal__icon">
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
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <p className="error-modal__message">{message}</p>
        <div className="error-modal__actions">
          <Button onClick={onClose} variant="primary">
            {buttonText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ErrorModal;