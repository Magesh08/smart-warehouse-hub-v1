import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Unwrap standard envelopes and handle 401s
apiClient.interceptors.response.use(
  (response) => {
    const resData = response.data;
    // Handle the envelope structure { success, data, message, timestamp }
    if (
      resData &&
      typeof resData === 'object' &&
      'success' in resData &&
      'data' in resData
    ) {
      return resData.data;
    }
    return resData;
  },
  (error) => {
    // Auto logout on 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      // Only redirect if not already on the login page to avoid infinite redirect loops
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/smartwarehouseapp/login';
      }
    }
    
    // Extrude error message
    const message = error.response?.data?.detail || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
