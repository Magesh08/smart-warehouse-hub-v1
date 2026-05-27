import apiClient from './client';
import { User, TokenResponse, UserLogin } from './types';

export const authApi = {
  login: (data: UserLogin): Promise<TokenResponse> => 
    apiClient.post('/auth/login', data),
    
  getMe: (): Promise<User> => 
    apiClient.get('/auth/me'),
    
  register: (data: any): Promise<User> => 
    apiClient.post('/auth/register', data),
    
  listUsers: (): Promise<User[]> => 
    apiClient.get('/users'),
    
  updateUser: (id: number, data: any): Promise<User> => 
    apiClient.patch(`/users/${id}`, data),
    
  deleteUser: (id: number): Promise<any> => 
    apiClient.delete(`/users/${id}`),
};
