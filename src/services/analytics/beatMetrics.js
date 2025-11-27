import { client } from '@api/axiosClient';

export function analyzeBeatMetrics(audioFile) {
  const formData = new FormData();
  formData.append('file', audioFile);

  return client.post('/analytics/beat-metrics', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

export function getAllBeatMetrics() {
  return client.get('/analytics/beat-metrics');
}

export function getBeatMetricById(id) {
  return client.get(`/analytics/beat-metrics/${id}`);
}

export function updateBeatMetric(id, data) {
  return client.put(`/analytics/beat-metrics/${id}`, data);
}

export function deleteBeatMetric(id) {
  return client.delete(`/analytics/beat-metrics/${id}`);
}