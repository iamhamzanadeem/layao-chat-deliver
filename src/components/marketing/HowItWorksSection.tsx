import { motion } from 'framer-motion';
import { MessageCircle, Search, Truck, CheckCircle } from 'lucide-react';

const steps = [
  {
    icon: MessageCircle,
    title: 'Chat Your Order',
    description: 'Simply type or send a voice note of what you need. No complicated menus!',
    color: 'bg-primary',
  },
  {
    icon: Search,
    title: 'We Find It',
    description: 'Our team finds the best products at the best prices from trusted local stores.',
    color: 'bg-accent',
  },
  {
    icon: Truck,
    title: 'Fast Delivery',
    description: 'Your order is picked up and delivered to your doorstep within 30 minutes.',
    color: 'bg-info',
  },
  {
    icon: CheckCircle,
    title: 'Pay on Delivery',
    description: 'No online payment hassle. Simply pay cash when your order arrives.',
    color: 'bg-success',
  },
];

export const HowItWorksSection = () => {
  return (
    <section className="py-20 md:py-28 bg-secondary/30">
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
            How <span className="text-gradient">Layao</span> Works
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Getting what you need has never been easier. Four simple steps to your doorstep.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              {/* Connector Line (desktop) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-1/2 w-full h-0.5 bg-border" />
              )}
              
              <div className="relative bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
                {/* Step Number */}
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
                
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl ${step.color} flex items-center justify-center mb-4`}>
                  <step.icon className="w-7 h-7 text-white" />
                </div>
                
                {/* Content */}
                <h3 className="font-display font-semibold text-xl mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
