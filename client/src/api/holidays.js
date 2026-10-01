import api from './axios';

export function listHolidays(params) {
  return api.get('/holidays', { params }).then((res) => res.data);
}

export function getHoliday(id) {
  return api.get(`/holidays/${id}`).then((res) => res.data);
}

export function createHoliday(payload) {
  return api.post('/holidays', payload).then((res) => res.data);
}

export function updateHoliday(id, payload) {
  return api.put(`/holidays/${id}`, payload).then((res) => res.data);
}

export function deleteHoliday(id) {
  return api.delete(`/holidays/${id}`);
}
