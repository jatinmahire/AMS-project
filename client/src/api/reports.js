import api from './axios';

export function getIdCard(workerCode) {
  return api.get(`/reports/id-card/${workerCode}`).then((res) => res.data);
}

export function generateIdCard(workerId, validityMonths) {
  return api.post(`/reports/id-card/${workerId}/generate`, { validityMonths }).then((res) => res.data);
}

export function getNinetyDays(workerCode) {
  return api.get(`/reports/90-days/${workerCode}`).then((res) => res.data);
}

export function getStatutoryRegister(type, params) {
  return api.get(`/reports/statutory/${type}`, { params }).then((res) => res.data);
}
