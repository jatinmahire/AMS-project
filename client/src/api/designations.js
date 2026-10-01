import api from './axios';

export function listDesignations() {
  return api.get('/designations').then((res) => res.data);
}

export function getDesignation(id) {
  return api.get(`/designations/${id}`).then((res) => res.data);
}

export function createDesignation(payload) {
  return api.post('/designations', payload).then((res) => res.data);
}

export function updateDesignation(id, payload) {
  return api.put(`/designations/${id}`, payload).then((res) => res.data);
}

export function deleteDesignation(id) {
  return api.delete(`/designations/${id}`);
}
