import api from './axios';

export function getCounts() {
  return api.get('/dashboard/counts').then((res) => res.data);
}

export function getAlerts() {
  return api.get('/dashboard/alerts').then((res) => res.data);
}

export function getSupervisorCounts() {
  return api.get('/dashboard/supervisor-counts').then((res) => res.data);
}

export function getContractorCounts() {
  return api.get('/dashboard/contractor-counts').then((res) => res.data);
}

export function getRecentActivity(limit) {
  return api.get('/dashboard/recent-activity', { params: { limit } }).then((res) => res.data);
}

export function listActivity(params) {
  return api.get('/dashboard/activity', { params }).then((res) => res.data);
}

export function getAttendanceOverview(range) {
  return api.get('/dashboard/attendance-overview', { params: { range } }).then((res) => res.data);
}

export function getRecentRegistrations(type) {
  return api.get('/dashboard/recent-registrations', { params: { type } }).then((res) => res.data);
}
