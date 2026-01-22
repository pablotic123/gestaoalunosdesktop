const getBackendUrl = () => {
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    return origin.replace('http://', 'https://');
  }
  return process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
};

export const BACKEND_URL = getBackendUrl();
export const API_URL = `${BACKEND_URL}/api`;

console.log('🔧 Config loaded:', { BACKEND_URL, API_URL });
