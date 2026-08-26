import api from './axios';

export function getCounts() {
  return api.get('/dashboard/counts').then((res) => res.data);
}
