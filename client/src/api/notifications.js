import api from './axios';

export function listNotifications(params) {
  return api.get('/notifications', { params }).then((res) => res.data);
}

export function markNotificationAsRead(id) {
  return api.patch(`/notifications/${id}/read`).then((res) => res.data);
}

export function markAllNotificationsAsRead() {
  return api.patch('/notifications/read-all').then((res) => res.data);
}
