import api from './axios';

export function kycLookup(type, code) {
  return api.get(`/kyc/${type}/${code}`).then((res) => res.data);
}
