import axios from 'axios';

const HTTPS_API_URL = 'https://escola-manager-7.preview.emergentagent.com/api';

axios.defaults.baseURL = HTTPS_API_URL;

const api = axios.create({
  baseURL: HTTPS_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  maxRedirects: 0,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  if (config.url && !config.url.endsWith('/')) {
    config.url = config.url + '/';
  }
  
  console.log('🔍 Request:', config.method?.toUpperCase(), config.url || config.baseURL);
  
  return config;
});

console.log('📡 API configurada:', HTTPS_API_URL);

export default api;