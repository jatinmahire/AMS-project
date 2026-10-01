import api from './axios';

export function listWorkers(params) {
  return api.get('/workers', { params }).then((res) => res.data);
}

export function searchWorkers(q, contractorId) {
  return api.get('/workers/search', { params: { q, contractorId } }).then((res) => res.data);
}

export function scanWorkerQr(code) {
  return api.get(`/workers/scan/${encodeURIComponent(code)}`).then((res) => res.data);
}

export function getWorker(id) {
  return api.get(`/workers/${id}`).then((res) => res.data);
}

export function createWorker(formData) {
  return api.post('/workers', formData).then((res) => res.data);
}

export function updateWorker(id, formData) {
  return api.put(`/workers/${id}`, formData).then((res) => res.data);
}

export function updateWorkerStatus(id, status) {
  return api.patch(`/workers/${id}/status`, { status }).then((res) => res.data);
}
