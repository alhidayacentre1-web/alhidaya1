import { Link } from 'react-router-dom';
import { Shield, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                <Shield className="h-6 w-6 text-secondary-foreground" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold">ALHIDAYA CENTRE</h3>
                <p className="text-xs text-primary-foreground/70">Excellence in Education</p>
              </div>
            </div>
            <p className="text-sm text-primary-foreground/80">
              Nurturing minds, building character, and shaping futures through quality education.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-semibold">Quick Links</h4>
            <nav className="flex flex-col space-y-2">
              <Link to="/" className="text-sm text-primary-foreground/80 hover:text-secondary transition-colors">
                Home
              </Link>
              <Link to="/about" className="text-sm text-primary-foreground/80 hover:text-secondary transition-colors">
                About Us
              </Link>
              <Link to="/contact" className="text-sm text-primary-foreground/80 hover:text-secondary transition-colors">
                Contact
              </Link>
              <Link to="/verify" className="text-sm text-primary-foreground/80 hover:text-secondary transition-colors">
                Verify Certificate
              </Link>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-semibold">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 mt-1 text-secondary" />
                <p className="text-sm text-primary-foreground/80">
                  MANDERA, KENYA
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="h-4 w-4 mt-1 text-secondary" />
                <div className="text-sm text-primary-foreground/80 space-y-1">
                  <p>+254 708 803 072</p>
                  <p>+254 716 165 551</p>
                  <p>+254 796 846 431</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-secondary" />
                <p className="text-sm text-primary-foreground/80">alhidayacentre1@gmail.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-primary-foreground/20">
        <div className="container py-4 text-center">
          <p className="text-sm text-primary-foreground/60">
            © {currentYear} ALHIDAYA CENTRE. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
