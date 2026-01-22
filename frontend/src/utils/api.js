import axios from 'axios';
import { API_URL } from '@/config';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  if (config.url && config.url.startsWith('http://')) {
    config.url = config.url.replace('http://', 'https://');
  }
  if (config.baseURL && config.baseURL.startsWith('http://')) {
    config.baseURL = config.baseURL.replace('http://', 'https://');
  }
  
  return config;
});

export default api;