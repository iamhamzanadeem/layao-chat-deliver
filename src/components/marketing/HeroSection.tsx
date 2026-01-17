import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { MessageCircle, ArrowRight, Sparkles, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWAInstall } from '@/hooks/usePWAInstall';

export const HeroSection = () => {
  const navigate = useNavigate();
  const { canInstall, promptInstall, isInstalled } = usePWAInstall();

  const handleInstall = async () => {
    if (canInstall) {
      await promptInstall();
    } else {
      navigate('/install');
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-subtle" />
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 py-12 md:py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border mb-6"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-secondary-foreground">
              Serving New City Phase 2, Rawalpindi
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-6"
          >
            Order Anything.
            <br />
            <span className="text-gradient">Just Chat.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
          >
            Your personal delivery assistant for groceries, food, pharmacy & more. 
            Send a message, and we'll deliver it to your doorstep — fast!
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button asChild size="lg" className="bg-gradient-primary hover:opacity-90 text-lg px-8 h-14 w-full sm:w-auto">
              <Link to="/app" className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Start Ordering Now
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            
            {!isInstalled && (
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 h-14 w-full sm:w-auto border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                onClick={handleInstall}
              >
                <Download className="w-5 h-5 mr-2" />
                Install App
              </Button>
            )}
            
            <Button asChild variant="outline" size="lg" className="text-lg px-8 h-14 w-full sm:w-auto">
              <Link to="/how-it-works">
                See How It Works
              </Link>
            </Button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span>Free Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span>Cash on Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span>30-Min Delivery</span>
            </div>
          </motion.div>
        </div>

        {/* Chat Preview Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-12 md:mt-16 max-w-sm mx-auto"
        >
          <div className="relative">
            {/* Phone Frame */}
            <div className="bg-card rounded-[2.5rem] p-3 shadow-2xl border border-border">
              <div className="bg-secondary rounded-[2rem] overflow-hidden">
                {/* Chat Header */}
                <div className="bg-primary px-4 py-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                    <span className="text-primary-foreground font-bold">L</span>
                  </div>
                  <div>
                    <p className="text-primary-foreground font-semibold text-sm">Layao</p>
                    <p className="text-primary-foreground/70 text-xs">Online • Ready to help</p>
                  </div>
                </div>
                
                {/* Chat Messages */}
                <div className="p-4 space-y-3 min-h-[280px]">
                  {/* Bot Message */}
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold text-xs">L</span>
                    </div>
                    <div className="bg-chat-bot text-chat-bot-foreground rounded-2xl rounded-tl-md px-4 py-2 max-w-[80%]">
                      <p className="text-sm">Hey! 👋 What would you like to order today?</p>
                    </div>
                  </div>
                  
                  {/* User Message */}
                  <div className="flex justify-end">
                    <div className="bg-chat-user text-chat-user-foreground rounded-2xl rounded-tr-md px-4 py-2 max-w-[80%]">
                      <p className="text-sm">I need milk, eggs, and bread please</p>
                    </div>
                  </div>
                  
                  {/* Bot Message */}
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold text-xs">L</span>
                    </div>
                    <div className="bg-chat-bot text-chat-bot-foreground rounded-2xl rounded-tl-md px-4 py-2 max-w-[80%]">
                      <p className="text-sm">Got it! 🛒 I found these for you. Confirm to order?</p>
                    </div>
                  </div>

                  {/* Product Cards Preview */}
                  <div className="flex gap-2 pl-10">
                    <div className="bg-card rounded-xl p-2 shadow-sm border border-border">
                      <div className="w-12 h-12 bg-muted rounded-lg mb-1" />
                      <p className="text-xs font-medium">Milk 1L</p>
                      <p className="text-xs text-primary">Rs. 180</p>
                    </div>
                    <div className="bg-card rounded-xl p-2 shadow-sm border border-border">
                      <div className="w-12 h-12 bg-muted rounded-lg mb-1" />
                      <p className="text-xs font-medium">Eggs x12</p>
                      <p className="text-xs text-primary">Rs. 320</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -right-4 top-1/4 w-16 h-16 bg-accent/20 rounded-full blur-xl animate-float" />
            <div className="absolute -left-4 bottom-1/4 w-12 h-12 bg-primary/20 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }} />
          </div>
        </motion.div>
      </div>
    </section>
  );
};
