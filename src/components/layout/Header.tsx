import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, MessageCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { usePWAInstall } from '@/hooks/usePWAInstall';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'How It Works', path: '/how-it-works' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
  { name: 'FAQs', path: '/faqs' },
];

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { canInstall, isInstalled, promptInstall } = usePWAInstall();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleInstall = async () => {
    await promptInstall();
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled ? 'glass-strong shadow-sm' : 'bg-transparent'
      )}
    >
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-xl">L</span>
            </div>
            <span className="font-display font-bold text-xl text-foreground">Layao</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  location.pathname === link.path
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {/* Install Button - Only show if installable and not already installed */}
            {canInstall && !isInstalled && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleInstall}
                className="gap-2 border-primary/30 text-primary hover:bg-primary/10"
              >
                <Download className="w-4 h-4" />
                Install App
              </Button>
            )}
            
            <Button asChild variant="ghost" size="sm">
              <Link to="/app">Login</Link>
            </Button>
            <Button asChild size="sm" className="bg-gradient-primary hover:opacity-90">
              <Link to="/app" className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Start Ordering
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-strong border-t border-border"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    'py-3 px-4 rounded-lg text-sm font-medium transition-colors',
                    location.pathname === link.path
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-secondary'
                  )}
                >
                  {link.name}
                </Link>
              ))}
              <div className="border-t border-border mt-2 pt-4 flex flex-col gap-2">
                {/* Mobile Install Button */}
                {canInstall && !isInstalled && (
                  <Button 
                    variant="outline" 
                    className="w-full gap-2 border-primary text-primary"
                    onClick={handleInstall}
                  >
                    <Download className="w-4 h-4" />
                    Install App
                  </Button>
                )}
                
                <Button asChild variant="outline" className="w-full">
                  <Link to="/app">Login</Link>
                </Button>
                <Button asChild className="w-full bg-gradient-primary">
                  <Link to="/app" className="flex items-center justify-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Start Ordering
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
