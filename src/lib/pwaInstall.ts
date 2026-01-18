/**
 * PWA Install Manager - Centralized utility for handling PWA installation
 * Uses singleton pattern to capture beforeinstallprompt event globally
 */

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export type InstallResult = 'installed' | 'dismissed' | 'unavailable' | 'ios-redirect';

class PWAInstallManager {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private installed: boolean = false;
  private listeners: Set<() => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  private init(): void {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.installed = true;
      return;
    }

    // Capture the beforeinstallprompt event as early as possible
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      this.notifyListeners();
    });

    // Listen for successful installation
    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.installed = true;
      this.notifyListeners();
    });
  }

  /**
   * Subscribe to install state changes
   */
  subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(): void {
    this.listeners.forEach(callback => callback());
  }

  /**
   * Detect if running on iOS
   */
  isIOS(): boolean {
    if (typeof navigator === 'undefined') return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  }

  /**
   * Detect if running on Android
   */
  isAndroid(): boolean {
    if (typeof navigator === 'undefined') return false;
    return /Android/.test(navigator.userAgent);
  }

  /**
   * Check if native install prompt is available
   */
  canPrompt(): boolean {
    return this.deferredPrompt !== null;
  }

  /**
   * Check if app is already installed
   */
  isInstalled(): boolean {
    return this.installed;
  }

  /**
   * Trigger the installation flow
   * - On Android/Desktop with prompt available: Shows native install dialog
   * - On iOS: Redirects to /install page with manual instructions
   * - Otherwise: Redirects to /install page
   */
  async install(): Promise<InstallResult> {
    // If already installed, do nothing
    if (this.installed) {
      return 'installed';
    }

    // iOS doesn't support beforeinstallprompt - redirect to manual instructions
    if (this.isIOS()) {
      window.location.href = '/install';
      return 'ios-redirect';
    }

    // Native prompt available - use it
    if (this.deferredPrompt) {
      try {
        await this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          this.deferredPrompt = null;
          this.installed = true;
          this.notifyListeners();
          return 'installed';
        }
        
        return 'dismissed';
      } catch (error) {
        console.error('PWA install prompt failed:', error);
        // Fallback to install page on error
        window.location.href = '/install';
        return 'unavailable';
      }
    }

    // No native prompt available - redirect to install instructions
    window.location.href = '/install';
    return 'unavailable';
  }
}

// Create singleton instance
export const pwaInstall = new PWAInstallManager();
