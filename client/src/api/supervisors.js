import api from './axios';

export function listSupervisors(params) {
  return api.get('/supervisors', { params }).then((res) => res.data);
}

export function getSupervisor(id) {
  return api.get(`/supervisors/${id}`).then((res) => res.data);
}

export function createSupervisor(formData) {
  return api.post('/supervisors', formData).then((res) => res.data);
}

export function updateSupervisor(id, formData) {
  return api.put(`/supervisors/${id}`, formData).then((res) => res.data);
}

export function updateSupervisorStatus(id, status) {
  return api.patch(`/supervisors/${id}/status`, { status }).then((res) => res.data);
}
