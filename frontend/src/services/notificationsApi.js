import api from './api';

const unwrap = (res) => res.data.data;

export const fetchNotifications = (params = {}) =>
  api.get('/api/notifications', { params }).then(unwrap);

export const fetchUnreadCount = () =>
  api.get('/api/notifications/unread-count').then(unwrap);

export const markRead = (id) =>
  api.put(`/api/notifications/${id}/read`).then(unwrap);

export const markAllRead = () =>
  api.put('/api/notifications/read-all').then(unwrap);
