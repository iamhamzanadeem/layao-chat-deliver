import { MarketingLayout } from '@/components/layout';
import { motion } from 'framer-motion';
import { MessageCircle, Search, Truck, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const steps = [
  { icon: MessageCircle, title: 'Chat Your Order', description: 'Open the app and simply type what you need. You can also send a voice note or share a photo of any item you want.' },
  { icon: Search, title: 'We Find & Confirm', description: 'Our team finds the best products at great prices. You\'ll get a confirmation with items and total cost.' },
  { icon: Truck, title: 'Fast Delivery', description: 'Our rider picks up your order and delivers it to your doorstep within 30 minutes.' },
  { icon: CheckCircle, title: 'Pay & Enjoy', description: 'Pay cash on delivery. Rate your experience and reorder anytime with one tap!' },
];

const HowItWorks = () => (
  <MarketingLayout>
    <section className="pt-32 pb-20">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">How <span className="text-gradient">Layao</span> Works</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Ordering has never been this simple. Just chat and get it delivered.</p>
        </motion.div>
        <div className="max-w-3xl mx-auto space-y-8">
          {steps.map((step, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex gap-6 items-start">
              <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center flex-shrink-0">
                <step.icon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="font-display text-xl font-semibold mb-2">Step {i + 1}: {step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Button asChild size="lg" className="bg-gradient-primary"><Link to="/app">Start Ordering <ArrowRight className="ml-2 w-5 h-5" /></Link></Button>
        </div>
      </div>
    </section>
  </MarketingLayout>
);

export default HowItWorks;
