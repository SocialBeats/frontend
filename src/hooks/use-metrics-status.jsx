import { useState, useEffect, useRef } from 'react';
import { logger } from '../logger';

/**
 * Custom hook to monitor metrics status via Server-Sent Events (SSE)
 * 
 * SSE mantiene UNA conexión persistente abierta que escucha eventos del servidor.
 * NO hace polling - el servidor PUSH eventos cuando ocurren.
 * 
 * Consumo de recursos:
 * - CPU: 0% en idle (solo escucha)
 * - Red: Mínimo - solo keep-alive cada 30s (~pocos bytes)
 * - Conexiones: 1 conexión persistente HTTP/2
 * 
 * Ciclo de vida:
 * - Se conecta cuando el componente monta
 * - Se desconecta cuando el componente desmonta
 * - Auto-reconecta si falla la conexión (cada 5s)
 * 
 * @param {Function} onMetricsCompleted - Callback when metrics are completed
 * @returns {Map} Map of beatId -> status ('calculating' | 'completed')
 */
export function useMetricsStatus(onMetricsCompleted) {
  const [metricsStatus, setMetricsStatus] = useState(new Map());
  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const connectSSE = () => {
      try {
        // Connect directly to analytics service (SSE shouldn't go through API Gateway)
        const analyticsUrl = window.RUNTIME_CONFIG?.VITE_ANALYTICS_SERVICE_URL || 
                           import.meta.env.VITE_ANALYTICS_SERVICE_URL || 
                           'http://localhost:3003';
        
        const sseUrl = `${analyticsUrl}/api/v1/analytics/metrics-events`;
        
        logger.info('🔌 Connecting to SSE:', sseUrl);
        
        const eventSource = new EventSource(sseUrl, {
          withCredentials: false // No auth needed for SSE
        });
        
        eventSourceRef.current = eventSource;

        eventSource.addEventListener('open', () => {
          logger.info('✅ SSE connection established');
          
          // After connecting, fetch current status of all beats to catch any completed while offline
          // This is handled by the CreateDashboards page loadUserBeats function
        });

        // Listen for METRICS_COMPLETED events
        eventSource.addEventListener('METRICS_COMPLETED', (event) => {
          if (!mounted) return;
          
          try {
            const data = JSON.parse(event.data);
            const { beatId, status } = data;
            
            logger.info('📊 Metrics completed for beat:', beatId, 'Status:', status);
            
            // Update status map
            setMetricsStatus(prev => {
              const newMap = new Map(prev);
              newMap.set(beatId, status || 'completed');
              return newMap;
            });
            
            // Call callback if provided
            if (onMetricsCompleted && typeof onMetricsCompleted === 'function') {
              onMetricsCompleted(data);
            }
            
            // Dispatch custom event for backward compatibility
            window.dispatchEvent(new CustomEvent('metricsCompleted', {
              detail: data
            }));
          } catch (err) {
            logger.error('Error processing METRICS_COMPLETED event:', err);
          }
        });

        // Handle connection errors
        eventSource.addEventListener('error', (error) => {
          logger.error('❌ SSE connection error:', error);
          eventSource.close();
          
          // Attempt to reconnect after 5 seconds
          if (mounted) {
            reconnectTimeoutRef.current = setTimeout(() => {
              if (mounted) {
                logger.info('🔄 Attempting to reconnect SSE...');
                connectSSE();
              }
            }, 5000);
          }
        });

      } catch (err) {
        logger.error('Failed to create SSE connection:', err);
      }
    };

    // Establish SSE connection
    connectSSE();

    // Cleanup on unmount
    return () => {
      mounted = false;
      
      if (eventSourceRef.current) {
        logger.info('Closing SSE connection');
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      onMetricsCompleted
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return { metricsStatus };
}
