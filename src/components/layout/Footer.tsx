import { Link } from 'react-router-dom';
import { MessageCircle, MapPin, Phone, Mail, Instagram, Facebook, Twitter } from 'lucide-react';

const footerLinks = {
  company: [
    { name: 'About Us', path: '/about' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'Contact', path: '/contact' },
    { name: 'FAQs', path: '/faqs' },
  ],
  services: [
    { name: 'Groceries', path: '/app' },
    { name: 'Food Delivery', path: '/app' },
    { name: 'Pharmacy', path: '/app' },
    { name: 'Errands', path: '/app' },
  ],
  legal: [
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Terms of Service', path: '/terms' },
    { name: 'Refund Policy', path: '/refunds' },
  ],
};

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-background">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                <span className="text-primary-foreground font-display font-bold text-xl">L</span>
              </div>
              <span className="font-display font-bold text-xl">Layao</span>
            </Link>
            <p className="text-background/70 text-sm mb-6">
              Your personal delivery assistant for groceries, food, pharmacy & more. Just chat and we'll deliver!
            </p>
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-background/10 hover:bg-primary flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-background/10 hover:bg-primary flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-background/10 hover:bg-primary flex items-center justify-center transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-background/70 hover:text-primary text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">Services</h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className="text-background/70 hover:text-primary text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-background/70">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0 text-primary" />
                <span>New City Phase 2, Rawalpindi, Pakistan</span>
              </li>
              <li>
                <a
                  href="tel:+923001234567"
                  className="flex items-center gap-3 text-sm text-background/70 hover:text-primary transition-colors"
                >
                  <Phone className="w-5 h-5 flex-shrink-0 text-primary" />
                  <span>+92 300 1234567</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:hello@layao.app"
                  className="flex items-center gap-3 text-sm text-background/70 hover:text-primary transition-colors"
                >
                  <Mail className="w-5 h-5 flex-shrink-0 text-primary" />
                  <span>hello@layao.app</span>
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/923001234567"
                  className="flex items-center gap-3 text-sm text-background/70 hover:text-primary transition-colors"
                >
                  <MessageCircle className="w-5 h-5 flex-shrink-0 text-primary" />
                  <span>WhatsApp Us</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-background/60">
            <p>© {currentYear} Layao. All rights reserved.</p>
            <div className="flex items-center gap-6">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="hover:text-primary transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
