const { contextBridge, ipcRenderer } = require('electron');

// Verificar se está em modo desenvolvimento
const isDev = process.env.ELECTRON_DEV === 'true';

// Expor APIs seguras para o renderer
contextBridge.exposeInMainWorld('electronAPI', {
  // Informações do app
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),
  
  // Status do backend
  checkBackendStatus: () => ipcRenderer.invoke('check-backend-status'),
  
  // Status do MongoDB
  checkMongoDBStatus: () => ipcRenderer.invoke('check-mongodb-status'),
  
  // Diálogo para salvar arquivo
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  
  // Salvar arquivo em caminho específico
  saveFile: (filePath, data) => ipcRenderer.invoke('save-file', filePath, data),
  
  // Verificar se está rodando no Electron
  isElectron: true,
  
  // Verificar se está em modo desenvolvimento
  isDev: isDev,
  
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
console.log(`📂 Modo: ${isDev ? 'Desenvolvimento' : 'Produção'}`);
