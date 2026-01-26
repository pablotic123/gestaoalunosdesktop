// Detectar se está rodando no Electron
const isElectron = () => {
  if (typeof window !== 'undefined' && window.electronAPI?.isElectron) {
    return true;
  }
  if (typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().includes('electron')) {
    return true;
  }
  return false;
};

const getBackendUrl = () => {
  if (isElectron()) {
    // No Electron, usar localhost
    return 'http://localhost:8001';
  }
  // Na web, usar a URL configurada ou padrão
  return process.env.REACT_APP_BACKEND_URL || 'https://easy-desktop-app.preview.emergentagent.com';
};

export const IS_ELECTRON = isElectron();
export const BACKEND_URL = getBackendUrl();
export const API_URL = `${BACKEND_URL}/api`;

console.log('🔧 Config loaded:', { BACKEND_URL, API_URL, IS_ELECTRON });
