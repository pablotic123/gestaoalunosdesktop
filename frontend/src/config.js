const getBackendUrl = () => {
  if (typeof window !== 'undefined') {
    return 'https://escola-manager-7.preview.emergentagent.com';
  }
  return 'https://escola-manager-7.preview.emergentagent.com';
};

export const BACKEND_URL = getBackendUrl();
export const API_URL = `${BACKEND_URL}/api`;

console.log('🔧 Config loaded:', { BACKEND_URL, API_URL });
