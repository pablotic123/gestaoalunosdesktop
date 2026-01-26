const { contextBridge, ipcRenderer } = require('electron');

// Expor APIs seguras para o renderer
contextBridge.exposeInMainWorld('electronAPI', {
  // Informações do app
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),
  
  // Status do backend
  checkBackendStatus: () => ipcRenderer.invoke('check-backend-status'),
  
  // Verificar se está rodando no Electron
  isElectron: true,
  
  // Plataforma
  platform: process.platform,
  
  // Versão do Electron
  versions: {
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    node: process.versions.node
  }
});

console.log('✅ Preload script carregado');
