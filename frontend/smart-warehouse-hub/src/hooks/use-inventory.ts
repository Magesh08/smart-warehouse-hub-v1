import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '../api/inventory.api';
import { InventoryItemCreate, InventoryItemUpdate } from '../api/types';
import { useToast } from './use-toast';

export function useInventoryItems(params?: { search?: string; category?: string; status?: string }) {
  return useQuery({
    queryKey: ['inventory', params],
    queryFn: () => inventoryApi.getAll(params),
    staleTime: 10000,
  });
}

export function useInventoryItem(id: number) {
  return useQuery({
    queryKey: ['inventoryItem', id],
    queryFn: () => inventoryApi.getById(id),
    enabled: !!id,
  });
}

export function useInventoryStats() {
  return useQuery({
    queryKey: ['inventoryStats'],
    queryFn: () => inventoryApi.getStats(),
    staleTime: 30000,
  });
}

export function useCreateInventoryItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: InventoryItemCreate) => inventoryApi.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventoryStats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        title: 'Success',
        description: `Inventory item ${data.name} (SKU: ${data.sku}) created successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create inventory item.',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateInventoryItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: InventoryItemUpdate }) => 
      inventoryApi.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventoryItem', data.id] });
      queryClient.invalidateQueries({ queryKey: ['inventoryStats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        title: 'Success',
        description: `Inventory item ${data.name} updated successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update inventory item.',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteInventoryItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => inventoryApi.delete(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventoryStats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        title: 'Deleted',
        description: 'Inventory item has been deleted successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete inventory item.',
        variant: 'destructive',
      });
    },
  });
}
