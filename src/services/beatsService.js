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
    return data;
  } catch (error) {
    console.error(`Error fetching beat with id ${id}:`, error);
    throw error;
  }
};
