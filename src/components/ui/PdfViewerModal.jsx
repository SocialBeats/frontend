import { useEffect } from 'react';
import './PdfViewerModal.css';

/**
 * Modal para visualizar PDFs sin abandonar la página
 */
export default function PdfViewerModal({ isOpen, onClose, pdfUrl, title }) {
  // Cerrar con ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="pdf-modal-overlay" onClick={onClose}>
      <div className="pdf-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="pdf-modal-header">
          <h3 className="pdf-modal-title">{title}</h3>
          <div className="pdf-modal-actions">
            <a 
              href={pdfUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="pdf-modal-btn pdf-modal-download"
              title="Abrir en nueva pestaña"
            >
              ↗️ Abrir
            </a>
            <button 
              className="pdf-modal-btn pdf-modal-close"
              onClick={onClose}
              title="Cerrar"
            >
              ✕
            </button>
          </div>
        </div>
        <div className="pdf-modal-content">
          <iframe
            src={`${pdfUrl}#toolbar=1&navpanes=0`}
            title={title}
            className="pdf-iframe"
          />
        </div>
      </div>
    </div>
  );
}
