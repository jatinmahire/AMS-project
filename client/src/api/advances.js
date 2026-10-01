import api from './axios';

export function listAdvances(params) {
  return api.get('/advances', { params }).then((res) => res.data);
}

export function getAdvance(id) {
  return api.get(`/advances/${id}`).then((res) => res.data);
}

export function createAdvance(payload) {
  return api.post('/advances', payload).then((res) => res.data);
}

export function updateAdvance(id, payload) {
  return api.put(`/advances/${id}`, payload).then((res) => res.data);
}

export function deleteAdvance(id) {
  return api.delete(`/advances/${id}`);
}
