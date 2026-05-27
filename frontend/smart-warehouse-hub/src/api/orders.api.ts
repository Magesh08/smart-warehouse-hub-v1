import apiClient from './client';
import { Order, OrderCreate, OrderUpdate, OrderStats } from './types';

export const ordersApi = {
  getAll: (params?: { status?: string }): Promise<Order[]> => 
    apiClient.get('/orders', { params }),
    
  getById: (id: string | number): Promise<Order> => 
    apiClient.get(`/orders/${id}`),
    
  create: (data: OrderCreate): Promise<Order> => 
    apiClient.post('/orders', data),
    
  update: (id: number, data: OrderUpdate): Promise<Order> => 
    apiClient.patch(`/orders/${id}`, data),
    
  updateStatus: (id: number, status: string): Promise<Order> => 
    apiClient.patch(`/orders/${id}/status`, { status }),
    
  delete: (id: number): Promise<any> => 
    apiClient.delete(`/orders/${id}`),
    
  getStats: (): Promise<OrderStats> => 
    apiClient.get('/orders/stats'),
};
