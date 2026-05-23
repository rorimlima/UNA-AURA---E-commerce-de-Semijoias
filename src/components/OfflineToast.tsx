import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WifiOff, X, AlertTriangle } from 'lucide-react';

export function OfflineToast() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setIsDismissed(false); // Reset dismiss state on reconnection
    };

    const handleOffline = () => {
      setIsOffline(true);
      setIsDismissed(false); // Make sure toast reappears if they lose connection again
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen to Service Worker message channel for fallback alerts
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'OFFLINE_STATUS') {
        setIsOffline(true);
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      }
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && !isDismissed && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[99999] w-[90%] max-w-lg"
        >
          <div className="bg-neutral-900/95 text-white backdrop-blur-md rounded-2xl border border-brand-gold/40 shadow-2xl p-4 md:p-5 flex gap-4 items-start relative overflow-hidden">
            {/* Visual Gold Progress Accent Line */}
            <div className="absolute top-0 left-0 h-[3px] w-full bg-brand-gold-gradient" />
            
            <div className="bg-brand-gold/10 p-2.5 rounded-xl border border-brand-gold/20 text-brand-gold shrink-0 mt-0.5 shadow-inner">
              <WifiOff size={18} className="animate-pulse" />
            </div>

            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-bold text-brand-gold">
                  Navegação Offline
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
              </div>
              <h4 className="font-serif italic text-sm md:text-base text-neutral-100 mb-1">
                Conexão Limitada ou Inativa
              </h4>
              <p className="text-neutral-400 font-sans text-[11px] leading-relaxed">
                Você está visualizando nossa coleção salva localmente em cache. Note que a disponibilidade e os preços das joias expostas podem estar desatualizados em relação ao servidor em tempo real.
              </p>
            </div>

            <button
              onClick={() => setIsDismissed(true)}
              className="text-neutral-400 hover:text-brand-gold transition-colors p-1 hover:bg-white/5 rounded-lg shrink-0 cursor-pointer"
              title="Fechar aviso"
              aria-label="Fachar aviso offline"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
