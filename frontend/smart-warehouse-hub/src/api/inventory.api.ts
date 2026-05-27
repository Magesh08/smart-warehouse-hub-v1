import apiClient from './client';
import { InventoryItem, InventoryItemCreate, InventoryItemUpdate, InventoryStats } from './types';

export const inventoryApi = {
  getAll: (params?: { search?: string; category?: string; status?: string }): Promise<InventoryItem[]> => 
    apiClient.get('/inventory', { params }),
    
  getById: (id: number): Promise<InventoryItem> => 
    apiClient.get(`/inventory/${id}`),
    
  create: (data: InventoryItemCreate): Promise<InventoryItem> => 
    apiClient.post('/inventory', data),
    
  update: (id: number, data: InventoryItemUpdate): Promise<InventoryItem> => 
    apiClient.patch(`/inventory/${id}`, data),
    
  delete: (id: number): Promise<any> => 
    apiClient.delete(`/inventory/${id}`),
    
  getStats: (): Promise<InventoryStats> => 
    apiClient.get('/inventory/stats'),
};
