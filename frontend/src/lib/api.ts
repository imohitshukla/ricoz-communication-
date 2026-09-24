import axios from 'axios';

// Base backend URL (e.g. http://localhost:3000 or production Render URL)
const rawBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';
export const API_URL = rawBase.replace(/\/api\/?$/, '');

const axiosInstance = axios.create({
  baseURL: API_URL,
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

export const api = {
  get: async (url: string) => wrapResponse((await axiosInstance.get(normalizePath(url))).data),
  post: async (url: string, data?: any) => wrapResponse((await axiosInstance.post(normalizePath(url), data)).data),
  put: async (url: string, data?: any) => wrapResponse((await axiosInstance.put(normalizePath(url), data)).data),
  delete: async (url: string) => wrapResponse((await axiosInstance.delete(normalizePath(url))).data),
};


