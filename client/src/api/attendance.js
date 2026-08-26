import api from './axios';

export function listAttendance(params) {
  return api.get('/attendance', { params }).then((res) => res.data);
}

export function getAttendance(id) {
  return api.get(`/attendance/${id}`).then((res) => res.data);
}

export function createAttendance(payload) {
  return api.post('/attendance', payload).then((res) => res.data);
}

export function updateAttendance(id, payload) {
  return api.put(`/attendance/${id}`, payload).then((res) => res.data);
}
