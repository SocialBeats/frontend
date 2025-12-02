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
