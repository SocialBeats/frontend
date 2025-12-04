import { client } from '../api/axiosClient';

export const getBeats = async (filters = {}) => {
  try {
    console.log('📡 Making API request to /beats with filters:', filters);
    console.log('🔗 Base URL:', client.defaults.baseURL);
    
    const { data } = await client.get('/beats', { params: filters });
    console.log('📦 Raw API response:', data);
    
    if (data.success && data.data) {
      console.log('✅ Returning beats array:', data.data);
      return data.data;
    } else {
      console.warn('⚠️ Unexpected API response structure:', data);
      return data;
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
    
    const { data } = await client.get('/beats/my-beats', { params });
    
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
    if (data.success && data.data) {
      console.log('✅ Returning beats array:', data.data);
      return data.data;
    } else {
      console.warn('⚠️ Unexpected API response structure:', data);
      return data;
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