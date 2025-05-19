import axios from 'axios';
import { toast } from '../../components/ui/toast-utils';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds
});

// Request interceptor for adding auth token
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

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;
    
    if (response) {
      // Handle different status codes
      if (response.status === 401 || response.status === 403) {
        // Unauthorized or forbidden
        toast.destructive({
          title: 'Authentication Error',
          description: 'Your session has expired. Please sign in again.',
        });
        // Optionally redirect to login or clear auth state
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
      } else if (response.status === 404) {
        toast.destructive({
          title: 'Not Found',
          description: 'The requested resource was not found.',
        });
      } else if (response.status >= 500) {
        toast.destructive({
          title: 'Server Error',
          description: 'Something went wrong on our end. Please try again later.',
        });
      } else {
        // Generic error message for other status codes
        const errorMessage = response.data?.message || 'An error occurred. Please try again.';
        toast.destructive({
          title: 'Error',
          description: errorMessage,
        });
      }
    } else {
      // Network errors or other issues
      toast.destructive({
        title: 'Connection Error',
        description: 'Unable to connect to the server. Please check your internet connection.',
      });
    }
    
    return Promise.reject(error);
  }
);

export default apiClient; 