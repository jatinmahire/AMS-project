import api from './axios';

export function listOvertimes(params) {
  return api.get('/overtimes', { params }).then((res) => res.data);
}

export function getOvertime(id) {
  return api.get(`/overtimes/${id}`).then((res) => res.data);
}

export function createOvertime(payload) {
  return api.post('/overtimes', payload).then((res) => res.data);
}

export function updateOvertime(id, payload) {
  return api.put(`/overtimes/${id}`, payload).then((res) => res.data);
}

export function deleteOvertime(id) {
  return api.delete(`/overtimes/${id}`);
}
