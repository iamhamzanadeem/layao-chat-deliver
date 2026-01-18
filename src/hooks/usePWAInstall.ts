import { useState, useEffect, useCallback } from 'react';
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
    return await pwaInstall.install();
  }, []);

  return {
    canInstall,
    isInstalled,
    isIOS,
    promptInstall,
  };
};
