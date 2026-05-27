import apiClient from './client';
import { DashboardData } from './types';

export const dashboardApi = {
  getDashboardData: (): Promise<DashboardData> => 
    apiClient.get('/dashboard'),
};
