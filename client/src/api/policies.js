import api from './axios';

export function listPolicies(params) {
  return api.get('/policies', { params }).then((res) => res.data);
}

export function getPolicy(id) {
  return api.get(`/policies/${id}`).then((res) => res.data);
}

export function createPolicy(formData) {
  return api.post('/policies', formData).then((res) => res.data);
}

export function updatePolicy(id, formData) {
  return api.put(`/policies/${id}`, formData).then((res) => res.data);
}

export function deletePolicy(id) {
  return api.delete(`/policies/${id}`);
}
