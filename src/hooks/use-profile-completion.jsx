import { useState, useEffect, useCallback } from 'react';
import { getProfileCompletionStatus } from '@/services/profileService';

/**
 * Hook para obtener y gestionar el estado de completitud del perfil
 * @returns {Object} - Estado de completitud, loading, error, y funciones auxiliares
 */
export function useProfileCompletion() {
  const [completionData, setCompletionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCompletionStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProfileCompletionStatus();
      setCompletionData(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al obtener estado del perfil');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompletionStatus();
  }, [fetchCompletionStatus]);

  /**
   * Verifica si un paso está completado
   * @param {number|string} stepIdOrName - ID o nombre del paso
   */
  const isStepComplete = useCallback(
    (stepIdOrName) => {
      if (!completionData?.steps) return false;
      const step = completionData.steps.find(
        (s) => s.id === stepIdOrName || s.name === stepIdOrName
      );
      return step?.completed || false;
    },
    [completionData]
  );

  /**
   * Obtiene el siguiente paso requerido incompleto
   */
  const getNextStep = useCallback(() => {
    return completionData?.nextStep || null;
  }, [completionData]);

  /**
   * Obtiene un paso por ID o nombre
   * @param {number|string} stepIdOrName
   */
  const getStep = useCallback(
    (stepIdOrName) => {
      if (!completionData?.steps) return null;
      return completionData.steps.find(
        (s) => s.id === stepIdOrName || s.name === stepIdOrName
      );
    },
    [completionData]
  );

  return {
    completionData,
    loading,
    error,
    refetch: fetchCompletionStatus,
    isStepComplete,
    getNextStep,
    getStep,
    // Shortcuts
    steps: completionData?.steps || [],
    completionPercentage: completionData?.completionPercentage || 0,
    verificationLevel: completionData?.verificationLevel || 'none',
  };
}
