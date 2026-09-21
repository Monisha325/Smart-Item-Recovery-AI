import api from './api';

const unwrap = (res) => res.data.data;

export const fetchAdminStats = () =>
  api.get('/api/admin/stats').then(unwrap);

export const fetchAdminUsers = ({ page = 1, limit = 20, search = '' } = {}) => {
  const params = { page, limit };
  if (search) params.search = search;
  return api.get('/api/admin/users', { params }).then(unwrap);
};

export const toggleBanUser = (userId) =>
  api.put(`/api/admin/users/${userId}/ban`).then(unwrap);

export const fetchAdminItems = ({ page = 1, limit = 20, type, status, category } = {}) => {
  const params = { page, limit };
  if (type)     params.type     = type;
  if (status)   params.status   = status;
  if (category) params.category = category;
  return api.get('/api/admin/items', { params }).then(unwrap);
};

export const deleteAdminItem = (itemId) =>
  api.delete(`/api/admin/items/${itemId}`).then(unwrap);

export const fetchAdminMatches = ({ page = 1, limit = 20, status } = {}) => {
  const params = { page, limit };
  if (status) params.status = status;
  return api.get('/api/admin/matches', { params }).then(unwrap);
};
