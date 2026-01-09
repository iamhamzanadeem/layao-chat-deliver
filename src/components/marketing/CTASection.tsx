import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MessageCircle, ArrowRight, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWAInstall } from '@/hooks/usePWAInstall';

export const CTASection = () => {
  const { canInstall, promptInstall } = usePWAInstall();

  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-primary p-8 md:p-12 lg:p-16"
        >
          {/* Background Decorations */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Order?
              <br />
              Start Chatting Now!
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
              Join hundreds of happy customers in New City Phase 2 who are already enjoying fast, convenient delivery.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="bg-white text-primary hover:bg-white/90 text-lg px-8 h-14 w-full sm:w-auto"
              >
                <Link to="/app" className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Open App
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              
              {canInstall && (
                <Button
                  onClick={promptInstall}
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 text-lg px-8 h-14 w-full sm:w-auto"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Install App
                </Button>
              )}
            </div>
            
            <p className="text-white/60 text-sm mt-6">
              No download required. Works instantly on any device.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
