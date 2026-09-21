import api from './api';

const unwrap = (res) => res.data.data;

export const fetchQRForItem = (itemId) =>
  api.get(`/api/qr/item/${itemId}`).then(unwrap);

export const generateQR = (itemId) =>
  api.post('/api/qr/generate', { itemId }).then(unwrap);

export const deleteQR = (itemId) =>
  api.delete(`/api/qr/item/${itemId}`).then(unwrap);

export const scanQR = (token) =>
  api.get(`/api/qr/scan/${token}`).then(unwrap);
