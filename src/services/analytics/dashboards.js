import { client } from '@/api/axiosClient';

// Dashboard APIs
export function getAllDashboards() {
  return client.get('/analytics/dashboards')
}

export function getDashboardById(id) {
  return client.get(`/analytics/dashboards/${id}`);
}

export function createDashboard(data) {
  return client.post('/analytics/dashboards', data);
}

export function updateDashboard(id, data) {
  return client.put(`/analytics/dashboards/${id}`, data);
}

export function deleteDashboard(id) {
  return client.delete(`/analytics/dashboards/${id}`);
}

