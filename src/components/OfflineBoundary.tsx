import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

export default function OfflineBoundary({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleCheckConnection = () => {
    setIsChecking(true);
    setTimeout(() => {
      setIsOnline(navigator.onLine);
      setIsChecking(false);
    }, 1000);
  };

  if (!isOnline) {
    return (
      <div className="fixed inset-0 bg-bg z-[9999] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center mb-6">
          <WifiOff size={48} className="text-primary" />
        </div>
        <h1 className="text-2xl font-display font-bold text-white mb-4">Sem Conexão</h1>
        <p className="text-text-muted max-w-sm mb-8">
          Para usar o SuperClipe Analytics você precisa estar conectado à internet.
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button 
            onClick={handleCheckConnection}
            disabled={isChecking}
            className="bg-primary text-black font-bold py-3 px-6 rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isChecking ? <RefreshCw className="animate-spin" size={20} /> : <RefreshCw size={20} />}
            Tentar novamente
          </button>
          <button 
            onClick={handleCheckConnection}
            className="bg-surface text-white font-medium py-3 px-6 rounded-xl border border-white/10 hover:bg-surface-light transition-colors"
          >
            Verificar conexão
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
