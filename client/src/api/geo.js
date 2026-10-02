import api from './axios';

export function getStates() {
  return api.get('/geo/states').then((res) => res.data);
}

export function getCities(state) {
  return api.get('/geo/cities', { params: { state } }).then((res) => res.data);
}
