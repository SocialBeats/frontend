import { createContext, useContext, useState, useCallback } from 'react';

/**
 * Context para manejar el estado del perfil globalmente
 * Permite que componentes como NavBar se actualicen cuando cambia el perfil
 */
const ProfileContext = createContext();

export function ProfileProvider({ children }) {
  const [profileVersion, setProfileVersion] = useState(0);

  // Función para notificar que el perfil ha cambiado
  const notifyProfileUpdate = useCallback(() => {
    setProfileVersion(v => v + 1);
  }, []);

  return (
    <ProfileContext.Provider value={{ profileVersion, notifyProfileUpdate }}>
      {children}
    </ProfileContext.Provider>
  );
}

/**
 * Hook para acceder al contexto del perfil
 * @returns {{ profileVersion: number, notifyProfileUpdate: () => void }}
 */
export function useProfileContext() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfileContext debe usarse dentro de ProfileProvider');
  }
  return context;
}
