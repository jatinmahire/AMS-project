import api from './axios';

export function listContractors(params) {
  return api.get('/contractors', { params }).then((res) => res.data);
}

export function contractorDropdown() {
  return api.get('/contractors/dropdown').then((res) => res.data);
}

export function getContractor(id) {
  return api.get(`/contractors/${id}`).then((res) => res.data);
}

export function createContractor(payload) {
  return api.post('/contractors', payload).then((res) => res.data);
}

export function updateContractor(id, payload) {
  return api.put(`/contractors/${id}`, payload).then((res) => res.data);
}

export function updateContractorStatus(id, status) {
  return api.patch(`/contractors/${id}/status`, { status }).then((res) => res.data);
}

export function uploadContractorDocument(id, formData) {
  return api.post(`/contractors/${id}/documents`, formData).then((res) => res.data);
}

export function deleteContractorDocument(documentId) {
  return api.delete(`/contractors/documents/${documentId}`);
}
