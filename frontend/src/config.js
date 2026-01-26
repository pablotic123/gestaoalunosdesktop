const getBackendUrl = () => {
  if (typeof window !== 'undefined') {
    return 'https://easy-desktop-app.preview.emergentagent.com';
  }
  return 'https://easy-desktop-app.preview.emergentagent.com';
};

export const BACKEND_URL = getBackendUrl();
export const API_URL = `${BACKEND_URL}/api`;

console.log('🔧 Config loaded:', { BACKEND_URL, API_URL });
