import { useState, useEffect } from 'react';
import { getMyProfile, getProfileByUsername } from '@/services/profileService';
import { getCurrentUsername } from '@/services/authService';

/**
 * Custom hook for managing profile data fetching and state
 * @param {string|undefined} username - Optional username to fetch. If not provided, fetches current user's profile
 * @param {function|undefined} onRedirect - Optional callback for handling redirects
 * @returns {Object} Profile data and loading states
 */
export const useProfileData = (username = null, onRedirect = null) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  
  const currentUsername = getCurrentUsername();

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, currentUsername]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // If username is provided and matches current user, trigger redirect
      if (username && username === currentUsername && onRedirect) {
        onRedirect();
        return;
      }
      
      // Load profile (own or another user's)
      let data;
      if (username) {
        // View another user's profile
        data = await getProfileByUsername(username);
        setIsOwnProfile(false);
      } else {
        // View own profile
        data = await getMyProfile();
        setIsOwnProfile(true);
      }
      
      setProfile(data);
    } catch (err) {
      const errorMessage = err.response?.status === 404 
        ? 'Usuario no encontrado' 
        : 'Error al cargar el perfil';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading,
    error,
    isOwnProfile,
    loadProfile,
  };
};
