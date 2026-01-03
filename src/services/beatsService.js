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
  console.log('🧹 Signed URL cache cleared');
};

// ============================================================
// BEATS API METHODS
// ============================================================

export const getBeats = async (filters = {}) => {
  try {
    console.log('📡 Making API request to /beats with filters:', filters);
    console.log('🔗 Base URL:', client.defaults.baseURL);

    const { data } = await client.get('/beats', { params: filters });
    console.log('📦 Raw API response:', data);

    // Extract the beats array from the API response structure
    if (data.success && data.data) {
      console.log('✅ Returning beats array:', data.data);
      return data.data;
    } else {
      console.warn('⚠️ Unexpected API response structure:', data);
      return data; // fallback to raw data
    }
  } catch (error) {
    console.error('🚨 Service error details:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      baseURL: error.config?.baseURL
    });
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
      console.log('✅ Returning beats array:', data.data);
      return data.data;
    } else {
      console.warn('⚠️ Unexpected API response structure:', data);
      return data; // fallback to raw data
    }
  } catch (error) {
    console.error(`Error fetching beat with id ${id}:`, error);
    throw error;
  }
};

export const createBeat = async (beatData) => {
  try {
    console.log('📝 Creating new beat:', beatData);
    const { data } = await client.post('/beats', beatData);

    if (data.success && data.data) {
      console.log('✅ Beat created successfully:', data.data);
      return data.data;
    } else {
      console.warn('⚠️ Unexpected API response structure:', data);
      return data;
    }
  } catch (error) {
    console.error('🚨 Error creating beat:', error);
    throw error;
  }
};

export const updateBeat = async (id, beatData) => {
  try {
    console.log('✏️ Updating beat:', id, beatData);
    const { data } = await client.put(`/beats/${id}`, beatData);

    if (data.success && data.data) {
      console.log('✅ Beat updated successfully:', data.data);
      return data.data;
    } else {
      console.warn('⚠️ Unexpected API response structure:', data);
      return data;
    }
  } catch (error) {
    console.error('🚨 Error updating beat:', error);
    throw error;
  }
};

export const deleteBeat = async (id) => {
  try {
    console.log('🗑️ Deleting beat:', id);
    const { data } = await client.delete(`/beats/${id}`);

    if (data.success) {
      console.log('✅ Beat deleted successfully');
      return data;
    } else {
      console.warn('⚠️ Unexpected API response structure:', data);
      return data;
    }
  } catch (error) {
    console.error('🚨 Error deleting beat:', error);
    throw error;
  }
};

export const getPresignedUrl = async ({ extension, mimetype, size }) => {
  try {
    console.log('🔑 Requesting presigned URL:', { extension, mimetype, size });
    const { data } = await client.post('/beats/upload-url', {
      extension,
      mimetype,
      size
    });

    if (data.success && data.data) {
      console.log('✅ Presigned URL received:', data.data);
      return data.data;
    } else {
      throw new Error(data.message || 'Failed to get upload URL');
    }
  } catch (error) {
    console.error('🚨 Error getting presigned URL:', error);
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
    console.log('📤 Uploading file to S3 via Presigned POST...');
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
      console.error('🚨 S3 Upload error response:', errorText);
      throw new Error(`S3 Upload failed: ${response.status} - ${errorText}`);
    }

    console.log('✅ File uploaded to S3 successfully via POST');
    return true;
  } catch (error) {
    console.error('🚨 Error uploading to S3:', error);
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
    console.log('🔍 Searching beats with query:', query);

    if (!query || query.length < 2) {
      console.warn('⚠️ Search query must be at least 2 characters');
      return [];
    }

    const { data } = await client.get('/beats/search', {
      params: { q: query }
    });

    if (data.success && data.data) {
      console.log('✅ Search results:', data.data);
      return data.data;
    } else {
      console.warn('⚠️ Unexpected API response structure:', data);
      return Array.isArray(data) ? data : [];
    }
  } catch (error) {
    console.error('🚨 Error searching beats:', error);
    throw error;
  }
};

/**
 * Get beats statistics
 * @returns {Promise<Object>} Statistics object with counts
 */
export const getBeatsStats = async () => {
  try {
    console.log('📊 Fetching beats statistics...');
    const { data } = await client.get('/beats/stats');

    if (data.success && data.data) {
      console.log('✅ Beats stats:', data.data);
      return data.data;
    } else {
      console.warn('⚠️ Unexpected API response structure:', data);
      return data;
    }
  } catch (error) {
    console.error('🚨 Error fetching beats stats:', error);
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
    console.log('▶️ Incrementing play count for beat:', id);
    const { data } = await client.post(`/beats/${id}/play`);

    if (data.success) {
      console.log('✅ Play count incremented');
      return data.data;
    } else {
      console.warn('⚠️ Unexpected API response structure:', data);
      return data;
    }
  } catch (error) {
    console.error('🚨 Error incrementing play count:', error);
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
    console.log('⬇️ Downloading beat:', id);
    const { data } = await client.get(`/beats/${id}/download`);

    if (data.success && data.data) {
      console.log('✅ Download initiated', data.data);
      return data.data;
    } else {
      console.warn('⚠️ Unexpected API response structure:', data);
      return data;
    }
  } catch (error) {
    console.error('🚨 Error downloading beat:', error);
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
      console.log('📦 Using cached signed URL for beat:', id);
      return cached;
    }
  }

  try {
    console.log('🎵 Fetching signed stream URL for beat:', id);
    const { data } = await client.get(`/beats/${id}/audio`);

    // Backend returns { streamUrl: "...", coverUrl: "..." }
    if (data.streamUrl) {
      console.log('✅ Stream URL received', data.coverUrl ? '(with cover)' : '(no cover)');
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

    throw new Error('No stream URL in response');
  } catch (error) {
    // Handle specific HTTP error codes
    if (error.response?.status === 403) {
      console.error('🚫 Not authorized to stream this beat');
      throw new Error('No autorizado para reproducir este beat');
    }
    if (error.response?.status === 429) {
      console.error('⏳ Rate limit exceeded for streaming');
      throw new Error('Límite de reproducciones excedido. Intenta más tarde.');
    }
    if (error.response?.status === 404) {
      console.error('🔍 Beat audio not found');
      throw new Error('Audio no encontrado');
    }

    console.error('🚨 Error fetching stream URL:', error);
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
    console.log('📦 All', beatIds.length, 'signed URLs from cache');
    return result;
  }

  console.log('📦 Cache hit:', beatIds.length - uncachedIds.length, '| Fetching:', uncachedIds.length);

  try {
    // Batch fetch only uncached IDs (limit 10 per request)
    const batchSize = 10;
    for (let i = 0; i < uncachedIds.length; i += batchSize) {
      const batch = uncachedIds.slice(i, i + batchSize);
      
      console.log('🎵 Batch fetching signed URLs for', batch.length, 'beats');
      const { data } = await client.post('/beats/batch/signed-urls', { beatIds: batch });

      if (data.success && data.data) {
        // Cache and add to result
        setCachedSignedUrls(data.data);
        Object.assign(result, data.data);
        
        console.log('✅ Batch URLs received:', data.meta?.resolved, 'resolved,', data.meta?.errors, 'errors');
      }
    }

    return result;
  } catch (error) {
    console.error('🚨 Error fetching batch signed URLs:', error);
    
    // Fallback: return what we have from cache, don't break the UI
    return result;
  }
};
