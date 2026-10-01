import api from './axios';

export function listDamages(params) {
  return api.get('/damages', { params }).then((res) => res.data);
}

export function getDamage(id) {
  return api.get(`/damages/${id}`).then((res) => res.data);
}

export function createDamage(formData) {
  return api.post('/damages', formData).then((res) => res.data);
}

export function updateDamage(id, formData) {
  return api.put(`/damages/${id}`, formData).then((res) => res.data);
}

export function deleteDamage(id) {
  return api.delete(`/damages/${id}`);
}
