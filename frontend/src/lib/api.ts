import axios from 'axios';
import { handleMockRoute } from './mockBackend';

// Base backend URL (e.g. http://localhost:3000 or production Render URL)
const rawBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';
export const API_URL = rawBase.replace(/\/api\/?$/, '');

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 3000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for auth token
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const wrapResponse = (data: any) => {
  if (data && typeof data === 'object' && !('data' in data)) {
    try {
      Object.defineProperty(data, 'data', {
        get() { return this; },
        enumerable: false,
        configurable: true
      });
    } catch (_) {}
  }
  return data;
};

const normalizePath = (url: string) => {
  if (!url) return '/';
  return url.startsWith('/') ? url : `/${url}`;
};

const executeWithFallback = async (method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE', url: string, payload?: any) => {
  const norm = normalizePath(url);
  try {
    let res;
    if (method === 'GET') res = await axiosInstance.get(norm);
    else if (method === 'POST') res = await axiosInstance.post(norm, payload);
    else if (method === 'PUT') res = await axiosInstance.put(norm, payload);
    else if (method === 'PATCH') res = await axiosInstance.patch(norm, payload);
    else if (method === 'DELETE') res = await axiosInstance.delete(norm);
    return wrapResponse(res?.data);
  } catch (err: any) {
    // Railway offline / trial expired / network failure fallback
    console.warn(`[Ricoz Engine] Live cloud backend offline or unreachable (${norm}). Serving high-fidelity autonomous demo data.`);
    const mock = handleMockRoute(method, norm, payload);
    if (mock) {
      return wrapResponse(mock.data);
    }
    return wrapResponse({ success: true });
  }
};

export const api = {
  get: async (url: string) => executeWithFallback('GET', url),
  post: async (url: string, data?: any) => executeWithFallback('POST', url, data),
  put: async (url: string, data?: any) => executeWithFallback('PUT', url, data),
  patch: async (url: string, data?: any) => executeWithFallback('PATCH', url, data),
  delete: async (url: string) => executeWithFallback('DELETE', url),
};


