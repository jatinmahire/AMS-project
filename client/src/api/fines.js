import api from './axios';

export function listFines(params) {
  return api.get('/fines', { params }).then((res) => res.data);
}

export function getFine(id) {
  return api.get(`/fines/${id}`).then((res) => res.data);
}

export function createFine(payload) {
  return api.post('/fines', payload).then((res) => res.data);
}

export function updateFine(id, payload) {
  return api.put(`/fines/${id}`, payload).then((res) => res.data);
}

export function deleteFine(id) {
  return api.delete(`/fines/${id}`);
}
