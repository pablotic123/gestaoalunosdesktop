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
  
  console.log('🚀 Request:', config.method?.toUpperCase(), config.baseURL + config.url);
  
  return config;
});

api.interceptors.response.use(
  response => {
    if (response.status === 307 || response.status === 308) {
      const redirectUrl = response.headers.location || response.headers.Location;
      if (redirectUrl && redirectUrl.startsWith('http://')) {
        const httpsUrl = redirectUrl.replace('http://', 'https://');
        console.log('⚠️ Redirect HTTP detectado, convertendo para HTTPS:', httpsUrl);
        return api.request({
          ...response.config,
          url: httpsUrl,
          baseURL: ''
        });
      }
    }
    return response;
  },
  error => {
    if (error.response) {
      if (error.response.status === 307 || error.response.status === 308) {
        const redirectUrl = error.response.headers.location || error.response.headers.Location;
        if (redirectUrl) {
          const httpsUrl = redirectUrl.startsWith('http://') 
            ? redirectUrl.replace('http://', 'https://') 
            : redirectUrl;
          console.log('🔄 Seguindo redirect para:', httpsUrl);
          return api.request({
            ...error.config,
            url: httpsUrl,
            baseURL: ''
          });
        }
      }
      console.error('❌ API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('❌ Network Error:', error.message);
    } else {
      console.error('❌ Request Error:', error.message);
    }
    return Promise.reject(error);
  }
);

console.log('📡 API configurada:', HTTPS_API_URL);

export default api;