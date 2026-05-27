import axios from 'axios';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { useAuthStore } from '../store/authStore';

NProgress.configure({ showSpinner: false, speed: 400, minimum: 0.15 });

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
});

api.interceptors.request.use(config => {
  NProgress.start();
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => {
    NProgress.done();
    return res;
  },
  err => {
    NProgress.done();
    if (err.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
