import api from './axios';

export function login(loginId, password) {
  return api.post('/auth/login', { loginId, password }).then((res) => res.data);
}

export function getProfile() {
  return api.get('/auth/me').then((res) => res.data);
}

export function changePassword(payload) {
  return api.post('/auth/change-password', payload).then((res) => res.data);
}
