import { motion } from 'framer-motion';
import { Mic, Image, Clock, MapPin, Bell, Star } from 'lucide-react';

const features = [
  {
    icon: Mic,
    title: 'Voice Notes',
    description: 'Too lazy to type? Just send a voice message with your order.',
  },
  {
    icon: Image,
    title: 'Send Photos',
    description: 'Share a picture of what you need and we\'ll find it for you.',
  },
  {
    icon: Clock,
    title: '30-Min Delivery',
    description: 'Fast delivery within your neighborhood. Track in real-time.',
  },
  {
    icon: MapPin,
    title: 'Saved Addresses',
    description: 'Save your home, office, or any location for quick ordering.',
  },
  {
    icon: Bell,
    title: 'Live Updates',
    description: 'Get notified at every step from order confirmation to delivery.',
  },
  {
    icon: Star,
    title: 'Rate & Review',
    description: 'Share your feedback to help us serve you better.',
  },
];

export const FeaturesSection = () => {
  return (
    <section className="py-20 md:py-28 bg-foreground text-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Features That Make Ordering <span className="text-primary">Effortless</span>
          </h2>
          <p className="text-background/70 text-lg max-w-2xl mx-auto">
            We've built Layao to be the simplest way to get things delivered.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group p-6 rounded-2xl bg-background/5 border border-background/10 hover:bg-background/10 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-background/60 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
