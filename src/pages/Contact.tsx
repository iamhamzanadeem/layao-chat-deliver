import { MarketingLayout } from '@/components/layout';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const Contact = () => (
  <MarketingLayout>
    <section className="pt-32 pb-20">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">Contact <span className="text-gradient">Us</span></h1>
          <p className="text-muted-foreground text-lg">We'd love to hear from you. Reach out anytime!</p>
        </motion.div>
        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h2 className="font-display text-2xl font-semibold">Get in Touch</h2>
            {[
              { icon: Phone, label: 'Phone', value: '+92 300 1234567', href: 'tel:+923001234567' },
              { icon: MessageCircle, label: 'WhatsApp', value: 'Chat with us', href: 'https://wa.me/923001234567' },
              { icon: Mail, label: 'Email', value: 'hello@layao.app', href: 'mailto:hello@layao.app' },
              { icon: MapPin, label: 'Address', value: 'New City Phase 2, Rawalpindi' },
            ].map((item, i) => (
              <a key={i} href={item.href} className="flex items-center gap-4 p-4 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors">
                <item.icon className="w-6 h-6 text-primary" />
                <div><p className="text-sm text-muted-foreground">{item.label}</p><p className="font-medium">{item.value}</p></div>
              </a>
            ))}
          </motion.div>
          <motion.form initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 p-6 rounded-2xl border border-border bg-card">
            <h2 className="font-display text-2xl font-semibold mb-4">Send a Message</h2>
            <Input placeholder="Your Name" />
            <Input type="email" placeholder="Email Address" />
            <Input placeholder="Phone Number" />
            <Textarea placeholder="Your Message" rows={4} />
            <Button className="w-full bg-gradient-primary">Send Message</Button>
          </motion.form>
        </div>
      </div>
    </section>
  </MarketingLayout>
);

export default Contact;
