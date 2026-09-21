import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as qrApi from '../services/qrApi';

export function useQRForItem(itemId) {
  return useQuery({
    queryKey:            ['qr', itemId],
    queryFn:             () => qrApi.fetchQRForItem(itemId),
    enabled:             !!itemId,
    retry:               false,   // 404 = no tag yet; don't hammer the server
    refetchOnWindowFocus: false,
  });
}

export function useGenerateQR(itemId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => qrApi.generateQR(itemId),
    onSuccess: () => {
      toast.success('QR tag generated!');
      queryClient.invalidateQueries({ queryKey: ['qr', itemId] });
      queryClient.invalidateQueries({ queryKey: ['item', itemId] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to generate QR tag');
    },
  });
}

export function useDeleteQR(itemId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => qrApi.deleteQR(itemId),
    onSuccess: () => {
      toast.success('QR tag removed.');
      queryClient.invalidateQueries({ queryKey: ['qr', itemId] });
      queryClient.invalidateQueries({ queryKey: ['item', itemId] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to remove QR tag');
    },
  });
}

export function useScanQR(token) {
  return useQuery({
    queryKey:             ['qr-scan', token],
    queryFn:              () => qrApi.scanQR(token),
    enabled:              !!token,
    retry:                false,
    staleTime:            Infinity,  // scan result is stable; avoid double-incrementing
    refetchOnWindowFocus: false,
  });
}
