import { Link } from "wouter";
import { Facebook, Instagram, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Newsletter signup:', email);
    setEmail("");
  };

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-serif text-lg font-semibold mb-4">About Arlamiluxe</h3>
            <p className="text-sm text-primary-foreground/90 leading-relaxed">
              Premium Nigerian fabrics celebrating cultural heritage and luxury craftsmanship.
            </p>
          </div>

          <div>
            <h3 className="font-serif text-lg font-semibold mb-4">Collections</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" className="hover:underline" data-testid="link-footer-products">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:underline" data-testid="link-footer-fabrics">
                  Premium Fabrics
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:underline" data-testid="link-footer-about">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:underline" data-testid="link-footer-contact">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-lg font-semibold mb-4">Newsletter</h3>
            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              <Input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60"
                data-testid="input-newsletter-email"
              />
              <Button
                type="submit"
                variant="secondary"
                className="w-full"
                data-testid="button-newsletter-submit"
              >
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-primary-foreground/80">
            © 2025 Arlamiluxe. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a 
              href="https://facebook.com/arlamiluxe" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity"
              data-testid="link-social-facebook"
            >
              <Button size="icon" variant="ghost" className="text-primary-foreground hover:text-primary-foreground/80">
                <Facebook className="w-5 h-5" />
              </Button>
            </a>
            <a 
              href="https://instagram.com/arlami_luxe" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity"
              data-testid="link-social-instagram"
            >
              <Button size="icon" variant="ghost" className="text-primary-foreground hover:text-primary-foreground/80">
                <Instagram className="w-5 h-5" />
              </Button>
            </a>
            <a 
              href="https://twitter.com/arlamiluxe" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity"
              data-testid="link-social-twitter"
            >
              <Button size="icon" variant="ghost" className="text-primary-foreground hover:text-primary-foreground/80">
                <Twitter className="w-5 h-5" />
              </Button>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
