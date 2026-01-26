import React, { useEffect, useState } from 'react';
import { Monitor, Wifi, WifiOff, Server } from 'lucide-react';

const DesktopStatus = () => {
  const [isElectron, setIsElectron] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [appInfo, setAppInfo] = useState(null);

  useEffect(() => {
    // Verificar se está no Electron
    const checkElectron = async () => {
      if (window.electronAPI?.isElectron) {
        setIsElectron(true);
        
        // Obter informações do app
        try {
          const info = await window.electronAPI.getAppInfo();
          setAppInfo(info);
        } catch (e) {
          console.error('Erro ao obter info do app:', e);
        }

        // Verificar status do backend
        try {
          const status = await window.electronAPI.checkBackendStatus();
          setBackendStatus(status ? 'online' : 'offline');
        } catch (e) {
          setBackendStatus('offline');
        }
      }
    };

    checkElectron();

    // Verificar backend periodicamente
    const interval = setInterval(async () => {
      if (window.electronAPI?.checkBackendStatus) {
        try {
          const status = await window.electronAPI.checkBackendStatus();
          setBackendStatus(status ? 'online' : 'offline');
        } catch (e) {
          setBackendStatus('offline');
        }
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Não mostrar nada se não estiver no Electron
  if (!isElectron) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Monitor className="h-4 w-4 text-blue-500" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
              Desktop {appInfo?.version || ''}
            </span>
          </div>
          
          <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />
          
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-gray-500" />
            {backendStatus === 'online' ? (
              <>
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-xs text-green-600 dark:text-green-400">Servidor Online</span>
              </>
            ) : backendStatus === 'offline' ? (
              <>
                <WifiOff className="h-4 w-4 text-red-500" />
                <span className="text-xs text-red-600 dark:text-red-400">Servidor Offline</span>
              </>
            ) : (
              <span className="text-xs text-yellow-600 dark:text-yellow-400">Verificando...</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesktopStatus;
