import { useState, useCallback } from 'react';
import { getCurrentUserId } from '@/services/authService';

// Configuración de Persona
const PERSONA_CONFIG = {
  templateId: 'itmpl_a7zK89p1PNBwNF226sSmntcsGqZu',
  environmentId: 'env_khQ65h7h5HsUgYqfqU2jJEnkgEfC',
};

/**
 * Hook para manejar el flujo de verificación de identidad con Persona
 */
export function usePersonaVerification() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Inicia el flujo de verificación embebido de Persona
   */
  const startVerification = useCallback(() => {
    // Verificar que el SDK de Persona está cargado
    if (typeof window.Persona === 'undefined') {
      setError('El SDK de Persona no está disponible. Por favor, recarga la página.');
      return;
    }

    // Obtener el ID del usuario actual
    const userId = getCurrentUserId();
    if (!userId) {
      setError('No se pudo obtener el ID del usuario. Por favor, inicia sesión de nuevo.');
      return;
    }

    setIsVerifying(true);
    setError(null);
    setVerificationStatus(null);

    try {
      const client = new window.Persona.Client({
        templateId: PERSONA_CONFIG.templateId,
        environmentId: PERSONA_CONFIG.environmentId,
        
        // Vincula la verificación con el ID del usuario en nuestra BD
        referenceId: userId,

        onReady: () => {
          client.open();
        },

        onComplete: ({ inquiryId, status }) => {
          setIsVerifying(false);
          setVerificationStatus(status);

          if (status === 'completed') {
            // Mostrar modal de éxito
            setShowSuccessModal(true);
          }
        },

        onCancel: () => {
          setIsVerifying(false);
          setVerificationStatus('cancelled');
        },

        onError: (err) => {
          setIsVerifying(false);
          setError(err?.message || 'Ocurrió un error durante la verificación');
        },
      });
    } catch (err) {
      setIsVerifying(false);
      setError(err?.message || 'Error al iniciar la verificación');
    }
  }, []);

  /**
   * Cierra el modal de éxito
   */
  const closeSuccessModal = useCallback(() => {
    setShowSuccessModal(false);
  }, []);

  /**
   * Limpia el estado de error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isVerifying,
    verificationStatus,
    showSuccessModal,
    error,
    startVerification,
    closeSuccessModal,
    clearError,
  };
}
