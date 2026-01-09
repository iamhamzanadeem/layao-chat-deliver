import { motion } from 'framer-motion';
import { ShoppingCart, UtensilsCrossed, Pill, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const services = [
  {
    icon: ShoppingCart,
    title: 'Groceries',
    description: 'Fresh fruits, vegetables, dairy, snacks, and all your daily essentials.',
    examples: ['Milk & Dairy', 'Fresh Produce', 'Pantry Staples', 'Beverages'],
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    icon: UtensilsCrossed,
    title: 'Food Delivery',
    description: 'Your favorite meals from local restaurants and home kitchens.',
    examples: ['Biryani', 'Fast Food', 'Desi Food', 'Desserts'],
    gradient: 'from-orange-500 to-red-500',
  },
  {
    icon: Pill,
    title: 'Pharmacy',
    description: 'Medicines, healthcare products, and personal care items.',
    examples: ['Prescriptions', 'OTC Medicines', 'First Aid', 'Personal Care'],
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Package,
    title: 'Errands',
    description: 'Anything else you need picked up or delivered. Just ask!',
    examples: ['Documents', 'Packages', 'Hardware', 'Custom Requests'],
    gradient: 'from-purple-500 to-pink-500',
  },
];

export const ServicesSection = () => {
  return (
    <section className="py-20 md:py-28">
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
            One App, <span className="text-gradient">Everything</span> Delivered
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From daily groceries to urgent medicines — we've got you covered.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              {/* Gradient Background on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              <div className="relative p-6 md:p-8">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.gradient} flex items-center justify-center flex-shrink-0`}>
                    <service.icon className="w-7 h-7 text-white" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="font-display font-semibold text-xl mb-2">{service.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{service.description}</p>
                    
                    {/* Examples */}
                    <div className="flex flex-wrap gap-2">
                      {service.examples.map((example) => (
                        <span
                          key={example}
                          className="text-xs px-3 py-1 rounded-full bg-secondary text-secondary-foreground"
                        >
                          {example}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-12"
        >
          <Button asChild size="lg" className="bg-gradient-primary hover:opacity-90">
            <Link to="/app">
              Explore All Services
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
