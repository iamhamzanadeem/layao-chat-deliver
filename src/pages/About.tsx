import { MarketingLayout } from '@/components/layout';
import { motion } from 'framer-motion';
import { Heart, Users, Zap, MapPin } from 'lucide-react';

const About = () => (
  <MarketingLayout>
    <section className="pt-32 pb-20">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">About <span className="text-gradient">Layao</span></h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Your neighborhood delivery partner in New City Phase 2, Rawalpindi.</p>
        </motion.div>
        <div className="max-w-3xl mx-auto prose prose-lg">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-6 text-muted-foreground">
            <p>Layao was born from a simple idea: ordering should be as easy as texting a friend. No complicated apps, no endless scrolling through menus — just tell us what you need, and we'll get it for you.</p>
            <p>We serve the vibrant community of New City Phase 2, bringing groceries, food, medicines, and more right to your doorstep in under 30 minutes.</p>
          </motion.div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          {[
            { icon: Heart, title: 'Customer First', desc: 'Your satisfaction is our priority' },
            { icon: Zap, title: 'Fast Delivery', desc: '30-minute delivery promise' },
            { icon: MapPin, title: 'Local Focus', desc: 'Serving New City Phase 2' },
            { icon: Users, title: 'Community', desc: 'Built for our neighborhood' },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }} className="text-center p-6 rounded-2xl bg-secondary">
              <item.icon className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-display font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  </MarketingLayout>
);

export default About;
