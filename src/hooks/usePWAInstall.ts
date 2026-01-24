import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { pwaInstall, InstallResult } from '@/lib/pwaInstall';

export const usePWAInstall = () => {
  const [canInstall, setCanInstall] = useState(pwaInstall.canPrompt());
  const [isInstalled, setIsInstalled] = useState(pwaInstall.isInstalled());
  const [isIOS, setIsIOS] = useState(pwaInstall.isIOS());

  useEffect(() => {
    // Subscribe to install state changes
    const unsubscribe = pwaInstall.subscribe(() => {
      setCanInstall(pwaInstall.canPrompt());
      setIsInstalled(pwaInstall.isInstalled());
    });

    // Update iOS detection
    setIsIOS(pwaInstall.isIOS());

    return unsubscribe;
  }, []);

  const promptInstall = useCallback(async (): Promise<InstallResult> => {
    const result = await pwaInstall.install();
    
    if (result === 'unavailable') {
      if (pwaInstall.isIOS()) {
        toast.info('To install on iPhone/iPad, tap the Share button and select "Add to Home Screen"');
      } else {
        toast.info('Installation not available. Try opening in Chrome browser.');
      }
    }
    
    return result;
  }, []);

  return {
    canInstall,
    isInstalled,
    isIOS,
    promptInstall,
  };
};
