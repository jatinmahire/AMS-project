import api from './axios';

export function listVerifications(type, params) {
  return api.get(`/verifications/${type}`, { params }).then((res) => res.data);
}

export function getVerification(type, workerId) {
  return api.get(`/verifications/${type}/${workerId}`).then((res) => res.data);
}

export function saveVerification(type, workerId, payload) {
  return api.put(`/verifications/${type}/${workerId}`, payload).then((res) => res.data);
}
