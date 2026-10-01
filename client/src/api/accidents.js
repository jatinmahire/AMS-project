import api from './axios';

export function listAccidents(params) {
  return api.get('/accidents', { params }).then((res) => res.data);
}

export function getAccident(id) {
  return api.get(`/accidents/${id}`).then((res) => res.data);
}

export function createAccident(formData) {
  return api.post('/accidents', formData).then((res) => res.data);
}

export function updateAccident(id, formData) {
  return api.put(`/accidents/${id}`, formData).then((res) => res.data);
}

export function deleteAccident(id) {
  return api.delete(`/accidents/${id}`);
}
