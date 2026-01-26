import axios from 'axios';

// Detectar se está rodando no Electron
const isElectron = () => {
  // Verificar se o objeto electronAPI foi exposto pelo preload
  if (typeof window !== 'undefined' && window.electronAPI?.isElectron) {
    return true;
  }
  // Verificar pelo userAgent (fallback)
  if (typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().includes('electron')) {
    return true;
  }
  return false;
};

// Definir URL base baseado no ambiente
const getApiUrl = () => {
  if (isElectron()) {
    // No Electron, usar localhost
    return 'http://localhost:8001/api';
  }
  // Na web, usar a URL de produção ou variável de ambiente
  return process.env.REACT_APP_BACKEND_URL 
    ? `${process.env.REACT_APP_BACKEND_URL}/api`
    : 'https://easy-desktop-app.preview.emergentagent.com/api';
};

const API_URL = getApiUrl();

axios.defaults.baseURL = API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  console.log('🚀 Request:', config.method?.toUpperCase(), config.baseURL + config.url);
  
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      console.error('❌ API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('❌ Network Error:', error.message);
    } else {
      console.error('❌ Request Error:', error.message);
    }
    return Promise.reject(error);
  }
);

console.log('📡 API configurada:', API_URL);
console.log('🖥️ Ambiente:', isElectron() ? 'Electron (Desktop)' : 'Web');

export default api;