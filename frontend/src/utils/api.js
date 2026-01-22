import axios from 'axios';

const HTTPS_API_URL = 'https://escola-manager-7.preview.emergentagent.com/api';

const api = axios.create({
  baseURL: HTTPS_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

console.log('📡 API configurada:', HTTPS_API_URL);

export default api;