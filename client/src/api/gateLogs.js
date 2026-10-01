import api from './axios';

export function listGateLogs(params) {
  return api.get('/gate-logs', { params }).then((res) => res.data);
}

export function createGateLog(data) {
  return api.post('/gate-logs', data).then((res) => res.data);
}
