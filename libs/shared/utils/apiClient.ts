import axios from 'axios';

// In a real app, this would be configured via environment variables.
const API_BASE_URL = 'http://localhost:3334/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Request Interceptor: Attaches the auth token to every request.
apiClient.interceptors.request.use(
  (config) => {
    // In a real app, you would get the token from a state management store or secure storage.
    if (typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handles global errors.
apiClient.interceptors.response.use(
  (response) => response, // Simply return the response if it's successful
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        // Unauthorized: Token is invalid or expired.
        // Clear user session and redirect to login.
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('authToken');
        }
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;