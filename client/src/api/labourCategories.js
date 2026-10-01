import api from './axios';

export function listLabourCategories() {
  return api.get('/labour-categories').then((res) => res.data);
}

export function getLabourCategory(id) {
  return api.get(`/labour-categories/${id}`).then((res) => res.data);
}

export function createLabourCategory(payload) {
  return api.post('/labour-categories', payload).then((res) => res.data);
}

export function updateLabourCategory(id, payload) {
  return api.put(`/labour-categories/${id}`, payload).then((res) => res.data);
}

export function deleteLabourCategory(id) {
  return api.delete(`/labour-categories/${id}`);
}
