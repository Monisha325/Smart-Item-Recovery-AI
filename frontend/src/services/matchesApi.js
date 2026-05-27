import api from './api';

const unwrap = (res) => res.data.data;

export const fetchMatchesForItem = (itemId) =>
  api.get(`/api/matches/item/${itemId}`).then(unwrap);

export const fetchMyMatches = () =>
  api.get('/api/matches/mine').then(unwrap);

export const acceptMatch = (matchId) =>
  api.post(`/api/matches/${matchId}/accept`).then(unwrap);

export const rejectMatch = (matchId) =>
  api.post(`/api/matches/${matchId}/reject`).then(unwrap);
