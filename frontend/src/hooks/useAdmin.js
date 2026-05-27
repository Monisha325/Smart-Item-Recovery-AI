import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as adminApi from '../services/adminApi';

export function useAdminStats() {
  return useQuery({
    queryKey: ['adminStats'],
    queryFn:  adminApi.fetchAdminStats,
    staleTime: 60_000,
  });
}

export function useAdminUsers({ page, limit, search }) {
  return useQuery({
    queryKey: ['adminUsers', { page, limit, search }],
    queryFn:  () => adminApi.fetchAdminUsers({ page, limit, search }),
    placeholderData: (prev) => prev,
  });
}

export function useToggleBanUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId) => adminApi.toggleBanUser(userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminUsers'] }),
  });
}

export function useAdminItems({ page, limit, type, status, category }) {
  return useQuery({
    queryKey: ['adminItems', { page, limit, type, status, category }],
    queryFn:  () => adminApi.fetchAdminItems({ page, limit, type, status, category }),
    placeholderData: (prev) => prev,
  });
}

export function useDeleteAdminItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId) => adminApi.deleteAdminItem(itemId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adminItems'] });
      qc.invalidateQueries({ queryKey: ['adminStats'] });
    },
  });
}

export function useAdminMatches({ page, limit, status }) {
  return useQuery({
    queryKey: ['adminMatches', { page, limit, status }],
    queryFn:  () => adminApi.fetchAdminMatches({ page, limit, status }),
    placeholderData: (prev) => prev,
  });
}
