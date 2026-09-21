import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

const unwrap = (res) => res.data.data;

export function useMyStats() {
  return useQuery({
    queryKey: ['myStats'],
    queryFn:  () => api.get('/api/auth/my-stats').then(unwrap),
    staleTime: 60_000,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.put('/api/auth/profile', data).then(unwrap),
    onSuccess: (user) => {
      // Sync authStore with fresh user data
      qc.setQueryData(['me'], user);
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data) => api.put('/api/auth/change-password', data).then(unwrap),
  });
}

export function usePublicStats() {
  return useQuery({
    queryKey: ['publicStats'],
    queryFn:  () => api.get('/api/stats').then(unwrap),
    staleTime: 5 * 60_000,
  });
}
