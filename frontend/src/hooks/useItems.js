import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as itemsApi from '../services/itemsApi';

export function useItems(filters = {}) {
  return useQuery({
    queryKey: ['items', filters],
    queryFn:  () => itemsApi.fetchItems(filters),
  });
}

export function useItem(id) {
  return useQuery({
    queryKey: ['item', id],
    queryFn:  () => itemsApi.fetchItemById(id),
    enabled:  !!id,
  });
}

export function useMyItems(params = {}) {
  return useQuery({
    queryKey: ['myItems', params],
    queryFn:  () => itemsApi.fetchMyItems(params),
  });
}

export function useCreateItem() {
  const queryClient = useQueryClient();
  const navigate    = useNavigate();

  return useMutation({
    mutationFn: itemsApi.createItem,
    onSuccess: () => {
      toast.success('Item posted!');
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['myItems'] });
      navigate('/items/mine');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to post item');
    },
  });
}

export function useUpdateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }) => itemsApi.updateItem(id, body),
    onSuccess: (_, { id }) => {
      toast.success('Item updated');
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['item', id] });
      queryClient.invalidateQueries({ queryKey: ['myItems'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update item');
    },
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => {
      if (!window.confirm('Delete this item? This cannot be undone.')) {
        return Promise.reject(new Error('cancelled'));
      }
      return itemsApi.deleteItem(id);
    },
    onSuccess: () => {
      toast.success('Item deleted');
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['myItems'] });
    },
    onError: (err) => {
      if (err.message !== 'cancelled') {
        toast.error(err.response?.data?.message || 'Failed to delete item');
      }
    },
  });
}
