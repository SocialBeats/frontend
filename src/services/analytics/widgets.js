import {client} from "@/api/axiosClient";

export function getAllWidgets() {
  return client.get('/analytics/widgets');
}

export function getWidgetById(id) {
  return client.get(`/analytics/widgets/${id}`);
}

export function getWidgetsByDashboard(dashboardId) {
  return client.get(`/analytics/dashboards/${dashboardId}/widgets`);
}

export function createWidget(data) {
  return client.post('/analytics/widgets', data);
}

export function updateWidget(id, data) {
  return client.put(`/analytics/widgets/${id}`, data);
}

export function deleteWidget(id) {
  return client.delete(`/analytics/widgets/${id}`);
}