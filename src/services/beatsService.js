import { client } from '../api/axiosClient';

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

export const uploadFileToS3 = async (uploadUrl, file) => {
  try {
    console.log('📤 Uploading file to S3...');

    // Note: We use fetch here because axios might add headers that S3 doesn't like
    // or we want to keep it simple without the interceptors
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type
      }
    });

    if (!response.ok) {
      throw new Error(`S3 Upload failed: ${response.statusText}`);
    }

    console.log('✅ File uploaded to S3 successfully');
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
