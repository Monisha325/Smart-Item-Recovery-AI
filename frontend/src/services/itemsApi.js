import api from './api';

function clean(params) {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null)
  );
}

export const fetchItems = async (params = {}) => {
  const { data } = await api.get('/api/items', { params: clean(params) });
  return data.data;
};

export const fetchItemById = async (id) => {
  const { data } = await api.get(`/api/items/${id}`);
  return data.data;
};

export const fetchMyItems = async (params = {}) => {
  const { data } = await api.get('/api/items/mine', { params: clean(params) });
  return data.data;
};

export const createItem = async (formData) => {
  const { data } = await api.post('/api/items', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
};

export const updateItem = async (id, body) => {
  const { data } = await api.put(`/api/items/${id}`, body);
  return data.data;
};

export const deleteItem = async (id) => {
  const { data } = await api.delete(`/api/items/${id}`);
  return data.data;
};
