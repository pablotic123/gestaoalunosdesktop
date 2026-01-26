const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

// Variáveis globais
let mainWindow = null;
let backendProcess = null;
let isDev = process.env.ELECTRON_DEV === 'true';

// Portas
const BACKEND_PORT = 8001;
const FRONTEND_PORT = 3000;

// Caminho base para recursos
function getResourcePath() {
  if (isDev) {
    return path.join(__dirname, '..');
  }
  return path.join(process.resourcesPath);
}

// Verificar se o backend está rodando
function checkBackendHealth() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: BACKEND_PORT,
      path: '/api/health',
      method: 'GET',
      timeout: 2000
    };

    const req = http.request(options, (res) => {
      resolve(res.statusCode === 200);
    });

    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

// Aguardar o backend iniciar
async function waitForBackend(maxAttempts = 30, interval = 1000) {
  console.log('⏳ Aguardando backend iniciar...');
  
  for (let i = 0; i < maxAttempts; i++) {
    const isHealthy = await checkBackendHealth();
    if (isHealthy) {
      console.log('✅ Backend iniciado com sucesso!');
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  console.error('❌ Timeout aguardando backend');
  return false;
}

// Iniciar o backend Python
function startBackend() {
  return new Promise((resolve, reject) => {
    if (isDev) {
      // Em desenvolvimento, assume que o backend já está rodando
      console.log('🔧 Modo dev: backend deve estar rodando separadamente');
      resolve(true);
      return;
    }

    const backendPath = path.join(getResourcePath(), 'backend');
    const pythonPath = process.platform === 'win32' 
      ? path.join(backendPath, 'python', 'python.exe')
      : 'python3';

    console.log(`🚀 Iniciando backend em: ${backendPath}`);

    // Definir variáveis de ambiente para o backend
    const env = {
      ...process.env,
      MONGO_URL: process.env.MONGO_URL || 'mongodb://localhost:27017',
      DB_NAME: process.env.DB_NAME || 'sge_database',
      JWT_SECRET_KEY: process.env.JWT_SECRET_KEY || 'sge-desktop-secret-key-2024',
      CORS_ORIGINS: '*'
    };

    // Verificar se temos Python empacotado ou usar do sistema
    let pythonExecutable = 'python3';
    if (process.platform === 'win32') {
      pythonExecutable = 'python';
    }

    backendProcess = spawn(pythonExecutable, [
      '-m', 'uvicorn',
      'server:app',
      '--host', '0.0.0.0',
      '--port', String(BACKEND_PORT)
    ], {
      cwd: backendPath,
      env: env,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    backendProcess.stdout.on('data', (data) => {
      console.log(`[Backend] ${data}`);
    });

    backendProcess.stderr.on('data', (data) => {
      console.error(`[Backend Error] ${data}`);
    });

    backendProcess.on('error', (err) => {
      console.error('Erro ao iniciar backend:', err);
      reject(err);
    });

    backendProcess.on('exit', (code) => {
      console.log(`Backend encerrado com código: ${code}`);
      backendProcess = null;
    });

    // Aguardar backend iniciar
    setTimeout(() => resolve(true), 2000);
  });
}

// Parar o backend
function stopBackend() {
  if (backendProcess) {
    console.log('🛑 Encerrando backend...');
    backendProcess.kill('SIGTERM');
    backendProcess = null;
  }
}

// Criar janela principal
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    icon: path.join(__dirname, 'icons', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false,
    backgroundColor: '#f8fafc',
    titleBarStyle: 'default',
    autoHideMenuBar: false
  });

  // URL a carregar
  const startUrl = isDev
    ? `http://localhost:${FRONTEND_PORT}`
    : `file://${path.join(__dirname, '..', 'build', 'index.html')}`;

  console.log(`📱 Carregando: ${startUrl}`);
  mainWindow.loadURL(startUrl);

  // Mostrar quando pronto
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // DevTools em desenvolvimento
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Criar splash screen
function createSplashWindow() {
  const splash = new BrowserWindow({
    width: 500,
    height: 350,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  splash.loadFile(path.join(__dirname, 'splash.html'));
  return splash;
}

// Inicialização do app
app.whenReady().then(async () => {
  console.log('🎓 SGE Desktop iniciando...');
  console.log(`📂 Modo: ${isDev ? 'Desenvolvimento' : 'Produção'}`);

  // Criar splash screen
  const splash = createSplashWindow();

  try {
    // Iniciar backend
    await startBackend();

    // Aguardar backend estar pronto
    const backendReady = await waitForBackend();
    
    if (!backendReady && !isDev) {
      dialog.showErrorBox(
        'Erro ao Iniciar',
        'Não foi possível conectar ao servidor local. Verifique se o MongoDB está instalado e rodando.'
      );
    }

    // Criar janela principal
    createWindow();

    // Fechar splash
    setTimeout(() => {
      splash.close();
    }, 1500);

  } catch (error) {
    console.error('Erro na inicialização:', error);
    splash.close();
    dialog.showErrorBox('Erro', `Falha ao iniciar: ${error.message}`);
    app.quit();
  }
});

// Quando todas as janelas fecharem
app.on('window-all-closed', () => {
  stopBackend();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Reativar no macOS
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Antes de encerrar
app.on('before-quit', () => {
  stopBackend();
});

// IPC handlers
ipcMain.handle('get-app-info', () => {
  return {
    version: app.getVersion(),
    name: app.getName(),
    isDev: isDev
  };
});

ipcMain.handle('check-backend-status', async () => {
  return await checkBackendHealth();
});
