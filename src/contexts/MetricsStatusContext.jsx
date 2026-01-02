import { createContext, useContext } from 'react';

/**
 * Context for sharing metrics status across the application
 * Provides real-time SSE updates about beat metrics calculations
 */
const MetricsStatusContext = createContext({
  metricsStatus: new Map(),
});

export const MetricsStatusProvider = MetricsStatusContext.Provider;

export function useMetricsStatusContext() {
  return useContext(MetricsStatusContext);
}
