import { useEffect } from 'react';
import Button from './Button';
import './Toast.css';

/**
 * Toast notification component
 * Displays temporary notifications at the bottom-right of the screen
 */
export default function Toast({ isOpen, onClose, title, message, actionLabel, onAction, duration = 5000 }) {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  return (
    <div className="toast-container">
      <div className="toast">
        <div className="toast-content">
          <div className="toast-header">
            <span className="toast-icon">✅</span>
            <h4 className="toast-title">{title}</h4>
            <button className="toast-close" onClick={onClose} aria-label="Cerrar">
              ×
            </button>
          </div>
          <p className="toast-message">{message}</p>
          {actionLabel && onAction && (
            <div className="toast-actions">
              <Button onClick={onAction} size="small">
                {actionLabel}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
