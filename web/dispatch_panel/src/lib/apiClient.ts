import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors (like 401)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      try {
        if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
          const channel = new BroadcastChannel('cabi_dispatch_auth_channel');
          channel.postMessage({ type: 'LOGOUT' });
          channel.close();
        }
      } catch (e) {
        // Ignore broadcast errors
      }
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?reason=expired';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
