import { MarketingLayout } from '@/components/layout';
import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqs = [
  { q: 'What areas do you deliver to?', a: 'Currently we serve New City Phase 2, Rawalpindi. We\'re expanding soon!' },
  { q: 'How long does delivery take?', a: 'Most orders are delivered within 30 minutes. Complex orders may take a bit longer.' },
  { q: 'What payment methods do you accept?', a: 'We currently accept Cash on Delivery (COD). Digital payments coming soon!' },
  { q: 'Is there a minimum order amount?', a: 'There\'s no minimum order. Order as little or as much as you need!' },
  { q: 'How do I track my order?', a: 'You\'ll receive status updates in the chat. Real-time tracking coming soon!' },
  { q: 'What if I receive a wrong item?', a: 'Contact us immediately through chat or phone. We\'ll make it right!' },
  { q: 'Can I schedule orders in advance?', a: 'Not yet, but this feature is coming soon. Stay tuned!' },
  { q: 'Do you deliver medicines without prescription?', a: 'We deliver OTC medicines. Prescription items require a valid prescription.' },
];

const FAQs = () => (
  <MarketingLayout>
    <section className="pt-32 pb-20">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">Frequently Asked <span className="text-gradient">Questions</span></h1>
          <p className="text-muted-foreground text-lg">Everything you need to know about Layao.</p>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border border-border rounded-xl px-6 data-[state=open]:bg-secondary/50">
                <AccordionTrigger className="text-left font-medium hover:no-underline">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  </MarketingLayout>
);

export default FAQs;
