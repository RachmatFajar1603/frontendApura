import { paths } from '@/paths';
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 5000, // Added timeout
  headers: {
    'Cache-Control': 'no-cache'
  }
});

// Fungsi untuk menghapus token dan user dari storage
const clearAuthData = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('custom-auth-token');
    localStorage.removeItem('user');
    localStorage.clear();
  }
};

// Fungsi untuk redirect ke halaman login
const redirectToLogin = () => {
  if (typeof window !== 'undefined') {
    window.location.href = paths.auth.signIn;
  }
};

// Interceptor untuk request: Menyisipkan token di header
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('custom-auth-token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor untuk response: Menangani expired token
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired atau tidak valid
      clearAuthData();
      redirectToLogin();
    }
    return Promise.reject(error);
  }
);

export default api;