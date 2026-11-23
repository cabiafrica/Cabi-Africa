import axios from 'axios';

/**
 * Resolves the correct base URL for the Dispatch Microservice.
 * Handles local dev and production Docker container environments.
 */
export function getDispatchBaseUrl(): string {
  const envDispatch = import.meta.env.VITE_DISPATCH_SERVICE_URL || import.meta.env.VITE_DISPATCH_API_URL;
  if (envDispatch) {
    return envDispatch.replace(/\/+$/, '');
  }

  // Production heuristic for DigitalOcean Droplet / production domain
  const isProd = import.meta.env.PROD || 
    (typeof window !== 'undefined' && 
     (window.location.hostname.includes('cabi.africa') || window.location.hostname.includes('vercel.app')));

  if (isProd) {
    return 'https://cabi.africa';
  }

  // Local development fallback
  return 'http://localhost:3334';
}

/**
 * Returns the base URL with guaranteed '/api' prefix
 */
export function getDispatchApiBaseUrl(): string {
  const base = getDispatchBaseUrl();
  return base.endsWith('/api') ? base : `${base}/api`;
}

/**
 * Returns the active authentication token
 */
export function getAuthToken(): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem('authToken') || localStorage.getItem('token');
}

/**
 * Axios instance preconfigured for the Dispatch Microservice with JWT authentication
 */
export const dispatchApiClient = axios.create({
  baseURL: getDispatchApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

dispatchApiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Authenticated fetch helper for calls directly to the Dispatch Microservice
 */
export async function dispatchFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const apiBase = getDispatchApiBaseUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const fullUrl = path.startsWith('http://') || path.startsWith('https://') 
    ? path 
    : `${apiBase}${normalizedPath}`;

  const token = getAuthToken();
  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(fullUrl, {
    ...options,
    credentials: 'include',
    headers,
  });
}

export default dispatchApiClient;
