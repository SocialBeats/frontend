import { client } from '../api/axiosClient';

// ============================================================
// SIGNED URL CACHE - Lightweight cache with TTL (1.5 hours)
// ============================================================
const CACHE_TTL_MS = 90 * 60 * 1000; // 1.5 hours (URLs expire in 2h)
const signedUrlCache = new Map();

/**
 * Get cached signed URL if still valid
 * @param {string} beatId 
 * @returns {Object|null} { streamUrl, coverUrl } or null if expired/missing
 */
const getCachedSignedUrl = (beatId) => {
  const cached = signedUrlCache.get(beatId);
  if (!cached) return null;
  
  // Check if expired
  if (Date.now() > cached.expiresAt) {
    signedUrlCache.delete(beatId);
    return null;
  }
  
  return cached.urls;
};

/**
 * Store signed URLs in cache
 * @param {string} beatId 
 * @param {Object} urls - { streamUrl, coverUrl }
 */
const setCachedSignedUrl = (beatId, urls) => {
  signedUrlCache.set(beatId, {
    urls,
    expiresAt: Date.now() + CACHE_TTL_MS
  });
};

/**
 * Store multiple signed URLs in cache (from batch response)
 * @param {Object} urlsMap - { beatId: { streamUrl, coverUrl } }
 */
const setCachedSignedUrls = (urlsMap) => {
  const expiresAt = Date.now() + CACHE_TTL_MS;
  Object.entries(urlsMap).forEach(([beatId, urls]) => {
    if (urls) {
      signedUrlCache.set(beatId, { urls, expiresAt });
    }
  });
};

/**
 * Clear all cached signed URLs (useful on logout)
 */
export const clearSignedUrlCache = () => {
  signedUrlCache.clear();
};

// ============================================================
// BEATS API METHODS
// ============================================================

export const getBeats = async (filters = {}) => {
  try {
    const { data } = await client.get('/beats', { params: filters });

    // Extract the beats array from the API response structure
    if (data.success && data.data) {
      return data.data;
    } else {
      return data; // fallback to raw data
    }
  } catch (error) {
    throw error;
  }
};

// 👇 CAMBIAR AQUÍ: QUITAR /api/v1
export const getMyBeats = async (params = {}) => {
  try {
    console.log('📡 Fetching my beats with params:', params);
    console.log('🔑 Token presente:', localStorage.getItem('accessToken') ? 'SÍ' : 'NO');
    console.log('🔗 Base URL:', client.defaults.baseURL);

    const { data } = await client.get('/beats/my-beats');

    console.log('📦 My beats response:', data);
    console.log('📊 data.data value:', data.data);
    console.log('📊 data.data length:', data.data?.length);
    console.log('📊 data.data is Array?:', Array.isArray(data.data));
    console.log('📊 First beat if any:', data.data?.[0]);

    if (data.success && data.data) {
      const beatsArray = data.data;
      console.log('✅ Returning my beats count:', beatsArray.length);
      console.log('✅ Returning my beats:', beatsArray);
      return beatsArray;
    } else {
      console.warn('⚠️ Unexpected API response structure:', data);
      return data;
    }
  } catch (error) {
    console.error('🚨 Error fetching my beats:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers,
      url: error.config?.url,
      fullUrl: error.config?.baseURL + error.config?.url
    });
    throw error;
  }
};

export const getBeatById = async (id) => {
  try {
    const { data } = await client.get(`/beats/${id}`);
    // Extract the beats array from the API response structure
    if (data.success && data.data) {
      return data.data;
    } else {
      return data; // fallback to raw data
    }
  } catch (error) {
    throw error;
  }
};

export const createBeat = async (beatData) => {
  try {
    const { data } = await client.post('/beats', beatData);

    if (data.success && data.data) {
      return data.data;
    } else {
      return data;
    }
  } catch (error) {
    throw error;
  }
};

export const updateBeat = async (id, beatData) => {
  try {
    const { data } = await client.put(`/beats/${id}`, beatData);

    if (data.success && data.data) {
      return data.data;
    } else {
      return data;
    }
  } catch (error) {
    throw error;
  }
};

export const deleteBeat = async (id) => {
  try {
    const { data } = await client.delete(`/beats/${id}`);

    if (data.success) {
      return data;
    } else {
      return data;
    }
  } catch (error) {
    throw error;
  }
};

export const getPresignedUrl = async ({ extension, mimetype, size }) => {
  try {
    const { data } = await client.post('/beats/upload-url', {
      extension,
      mimetype,
      size
    });

    if (data.success && data.data) {
      return data.data;
    } else {
      throw new Error(data.message || 'Error al obtener la URL de subida');
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Upload file to S3 using Presigned POST
 * @param {Object} presignedData - Object containing {url, fields} from backend
 * @param {File} file - File to upload
 * @returns {Promise<boolean>} True if upload succeeded
 */
export const uploadFileToS3 = async (presignedData, file) => {
  try {
    const { url, fields } = presignedData;

    // Build FormData with all presigned policy fields
    const formData = new FormData();

    // Add all policy fields FIRST (order matters for S3)
    Object.entries(fields).forEach(([key, value]) => {
      formData.append(key, value);
    });

    // ⚠️ CRITICAL: File MUST be appended LAST (AWS S3 requirement)
    // If file is not the last field, S3 will reject the upload
    formData.append('file', file);

    // POST to S3 endpoint
    // Note: Don't set Content-Type header - browser will set it with correct boundary
    const response = await fetch(url, {
      method: 'POST',
      body: formData
      // No headers needed - signature is in the form fields
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al subir a S3: ${response.status} - ${errorText}`);
    }

    return true;
  } catch (error) {
    throw error;
  }
};

/**
 * Search beats by query string
 * @param {string} query - Search query (min 2 characters)
 * @returns {Promise<Array>} Array of matching beats
 */
export const searchBeats = async (query) => {
  try {
    if (!query || query.length < 2) {
      return [];
    }

    const { data } = await client.get('/beats/search', {
      params: { q: query }
    });

    if (data.success && data.data) {
      return data.data;
    } else {
      return Array.isArray(data) ? data : [];
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Get beats statistics
 * @returns {Promise<Object>} Statistics object with counts
 */
export const getBeatsStats = async () => {
  try {
    const { data } = await client.get('/beats/stats');

    if (data.success && data.data) {
      return data.data;
    } else {
      return data;
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Increment play count for a beat
 * @param {string} id - Beat ID
 * @returns {Promise<Object>} Updated beat data
 */
export const incrementPlayCount = async (id) => {
  try {
    const { data } = await client.post(`/beats/${id}/play`);

    if (data.success) {
      return data.data;
    } else {
      return data;
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Download beat
 * @param {string} id - Beat ID
 * @returns {Promise<Object>} Download URL and updated stats
 */
export const downloadBeat = async (id) => {
  try {
    const { data } = await client.get(`/beats/${id}/download`);

    if (data.success && data.data) {
      return data.data;
    } else {
      return data;
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Get signed CloudFront URLs for audio streaming and cover (Just-in-Time)
 * Uses cache to avoid redundant requests. Call this before playing.
 * @param {string} id - Beat ID
 * @param {boolean} skipCache - Force fresh fetch (default: false)
 * @returns {Promise<{streamUrl: string, coverUrl: string|null}>} Signed CloudFront URLs
 */
export const getAudioStreamUrl = async (id, skipCache = false) => {
  // Check cache first (unless skipCache is true)
  if (!skipCache) {
    const cached = getCachedSignedUrl(id);
    if (cached) {
      return cached;
    }
  }

  try {
    const { data } = await client.get(`/beats/${id}/audio`);

    // Backend returns { streamUrl: "...", coverUrl: "..." }
    if (data.streamUrl) {
      const urls = {
        streamUrl: data.streamUrl,
        coverUrl: data.coverUrl || null
      };
      
      // Cache the result
      setCachedSignedUrl(id, urls);
      
      return urls;
    }

    // Fallback: direct URL in response (legacy support)
    if (typeof data === 'string' && data.startsWith('http')) {
      return { streamUrl: data, coverUrl: null };
    }

    throw new Error('No se recibió URL de streaming');
  } catch (error) {
    // Handle specific HTTP error codes
    if (error.response?.status === 403) {
      throw new Error('No autorizado para reproducir este beat');
    }
    if (error.response?.status === 429) {
      throw new Error('Límite de reproducciones excedido. Intenta más tarde.');
    }
    if (error.response?.status === 404) {
      throw new Error('Audio no encontrado');
    }

    throw error;
  }
};

/**
 * Get signed CloudFront URLs for multiple beats at once (batch)
 * More efficient than calling getAudioStreamUrl multiple times.
 * Max 10 beats per request. Uses cache intelligently.
 * @param {string[]} beatIds - Array of beat IDs (max 10)
 * @returns {Promise<Object>} Map of beatId -> { streamUrl, coverUrl }
 */
export const getBatchSignedUrls = async (beatIds) => {
  if (!Array.isArray(beatIds) || beatIds.length === 0) {
    return {};
  }

  // Separate cached and uncached IDs
  const result = {};
  const uncachedIds = [];

  for (const id of beatIds) {
    const cached = getCachedSignedUrl(id);
    if (cached) {
      result[id] = cached;
    } else {
      uncachedIds.push(id);
    }
  }

  // If all are cached, return immediately
  if (uncachedIds.length === 0) {
    return result;
  }

  try {
    // Batch fetch only uncached IDs (limit 10 per request)
    const batchSize = 10;
    for (let i = 0; i < uncachedIds.length; i += batchSize) {
      const batch = uncachedIds.slice(i, i + batchSize);
      
      const { data } = await client.post('/beats/batch/signed-urls', { beatIds: batch });

      if (data.success && data.data) {
        // Cache and add to result
        setCachedSignedUrls(data.data);
        Object.assign(result, data.data);
      }
    }

    return result;
  } catch (error) {
    // Fallback: return what we have from cache, don't break the UI
    return result;
  }
};

/**
 * Toggle beat promotion status
 * @param {string} id - Beat ID
 * @returns {Promise<Object>} Updated promotion status { beatId, promoted }
 */
export const togglePromotion = async (id) => {
  try {
    const { data } = await client.patch(`/beats/${id}/promote`);

    if (data.success && data.data) {
      return data.data;
    } else {
      return data;
    }
  } catch (error) {
    throw error;
  }
};
