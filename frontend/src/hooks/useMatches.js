import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as matchesApi from '../services/matchesApi';

export function useMatchesForItem(itemId) {
  return useQuery({
    queryKey: ['matches', itemId],
    queryFn:  () => matchesApi.fetchMatchesForItem(itemId),
    enabled:  !!itemId,
  });
}

export function useMyMatches() {
  return useQuery({
    queryKey: ['myMatches'],
    queryFn:  matchesApi.fetchMyMatches,
  });
}

export function useAcceptMatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ matchId }) => matchesApi.acceptMatch(matchId),
    onSuccess: (_, { itemId }) => {
      toast.success('Match accepted — both items marked as Claimed.');
      queryClient.invalidateQueries({ queryKey: ['matches', itemId] });
      queryClient.invalidateQueries({ queryKey: ['myMatches'] });
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['item'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to accept match');
    },
  });
}

export function useRejectMatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ matchId }) => matchesApi.rejectMatch(matchId),
    onSuccess: (_, { itemId }) => {
      toast.success('Match rejected.');
      queryClient.invalidateQueries({ queryKey: ['matches', itemId] });
      queryClient.invalidateQueries({ queryKey: ['myMatches'] });
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to reject match');
    },
  });
}
