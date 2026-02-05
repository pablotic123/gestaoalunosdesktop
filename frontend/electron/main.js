const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
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
      timeout: 3000
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
async function waitForBackend(maxAttempts = 45, interval = 1000) {
  console.log('⏳ Aguardando backend iniciar...');
  
  for (let i = 0; i < maxAttempts; i++) {
    const isHealthy = await checkBackendHealth();
    if (isHealthy) {
      console.log('✅ Backend iniciado com sucesso!');
      return true;
    }
    console.log(`   Tentativa ${i + 1}/${maxAttempts}...`);
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  console.error('❌ Timeout aguardando backend');
  return false;
}

// Iniciar o backend Python
function startBackend() {
  return new Promise((resolve, reject) => {
    if (isDev) {
      console.log('🔧 Modo dev: backend deve estar rodando separadamente');
      resolve(true);
      return;
    }

    const backendPath = path.join(getResourcePath(), 'backend');
    
    console.log(`🚀 Iniciando backend em: ${backendPath}`);

    // Variáveis de ambiente para o backend
    const env = {
      ...process.env,
      MONGO_URL: process.env.MONGO_URL || 'mongodb://localhost:27017',
      DB_NAME: process.env.DB_NAME || 'sge_database',
      JWT_SECRET_KEY: process.env.JWT_SECRET_KEY || 'sge-desktop-secret-key-2024',
      CORS_ORIGINS: '*'
    };

    // Usar Python do sistema
    let pythonExecutable = process.platform === 'win32' ? 'python' : 'python3';

    backendProcess = spawn(pythonExecutable, [
      '-m', 'uvicorn',
      'server:app',
      '--host', '0.0.0.0',
      '--port', String(BACKEND_PORT)
    ], {
      cwd: backendPath,
      env: env,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: process.platform === 'win32'
    });

    backendProcess.stdout.on('data', (data) => {
      console.log(`[Backend] ${data}`);
    });

    backendProcess.stderr.on('data', (data) => {
      console.error(`[Backend] ${data}`);
    });

    backendProcess.on('error', (err) => {
      console.error('Erro ao iniciar backend:', err);
      reject(err);
    });

    backendProcess.on('exit', (code) => {
      console.log(`Backend encerrado com código: ${code}`);
      backendProcess = null;
    });

    setTimeout(() => resolve(true), 2000);
  });
}

// Parar o backend
function stopBackend() {
  if (backendProcess) {
    console.log('🛑 Encerrando backend...');
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', backendProcess.pid, '/f', '/t']);
    } else {
      backendProcess.kill('SIGTERM');
    }
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

  const startUrl = isDev
    ? `http://localhost:${FRONTEND_PORT}`
    : `file://${path.join(__dirname, '..', 'build', 'index.html')}`;

  console.log(`📱 Carregando: ${startUrl}`);
  mainWindow.loadURL(startUrl);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

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

// Mostrar erro de conexão
async function showConnectionErrorDialog(errorType) {
  const messages = {
    backend: {
      title: 'Erro ao Iniciar Servidor',
      message: 'Não foi possível iniciar o servidor local.',
      detail: 'Possíveis causas:\n\n' +
        '1. Python não está instalado ou não está no PATH\n' +
        '2. Dependências Python não foram instaladas\n' +
        '3. MongoDB não está rodando\n\n' +
        'Verifique se:\n' +
        '• Python 3.11+ está instalado\n' +
        '• MongoDB está instalado e rodando\n' +
        '• As dependências foram instaladas (pip install -r requirements.txt)'
    },
    mongodb: {
      title: 'MongoDB não encontrado',
      message: 'O MongoDB não está instalado ou não está rodando.',
      detail: 'O SGE precisa do MongoDB para funcionar.\n\n' +
        'Baixe e instale o MongoDB Community Server:\n' +
        'https://www.mongodb.com/try/download/community'
    }
  };

  const msg = messages[errorType] || messages.backend;

  const result = await dialog.showMessageBox({
    type: 'error',
    title: msg.title,
    message: msg.message,
    detail: msg.detail,
    buttons: ['Tentar Novamente', 'Abrir Documentação', 'Sair'],
    defaultId: 0,
    cancelId: 2
  });

  if (result.response === 1) {
    shell.openExternal('https://www.mongodb.com/try/download/community');
  }

  return result.response === 0 ? 'retry' : 'exit';
}

// Inicialização do app
app.whenReady().then(async () => {
  console.log('🎓 SGE Desktop iniciando...');
  console.log(`📂 Modo: ${isDev ? 'Desenvolvimento' : 'Produção'}`);

  const splash = createSplashWindow();

  try {
    // Iniciar backend
    await startBackend();

    // Aguardar backend estar pronto
    let backendReady = await waitForBackend();
    
    // Se não conectou, mostrar erro e permitir tentar novamente
    while (!backendReady && !isDev) {
      const action = await showConnectionErrorDialog('backend');
      
      if (action === 'exit') {
        splash.close();
        app.quit();
        return;
      }
      
      // Tentar iniciar novamente
      await startBackend();
      backendReady = await waitForBackend();
    }

    // Criar janela principal
    createWindow();

    // Fechar splash
    setTimeout(() => {
      splash.close();
    }, 1000);

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

// Diálogo para salvar arquivo
ipcMain.handle('show-save-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: options.title || 'Salvar arquivo',
    defaultPath: options.defaultPath || app.getPath('documents'),
    filters: options.filters || [
      { name: 'PDF', extensions: ['pdf'] },
      { name: 'Todos os arquivos', extensions: ['*'] }
    ]
  });
  
  return result;
});

// Salvar arquivo em caminho específico
ipcMain.handle('save-file', async (event, filePath, data) => {
  try {
    let buffer;
    if (typeof data === 'string' && data.includes('base64')) {
      const base64Data = data.split(',')[1] || data;
      buffer = Buffer.from(base64Data, 'base64');
    } else if (data instanceof ArrayBuffer) {
      buffer = Buffer.from(data);
    } else {
      buffer = Buffer.from(data);
    }
    
    fs.writeFileSync(filePath, buffer);
    return { success: true, path: filePath };
  } catch (error) {
    console.error('Erro ao salvar arquivo:', error);
    return { success: false, error: error.message };
  }
});
