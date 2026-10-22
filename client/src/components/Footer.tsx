import { Link } from "wouter";
import { Facebook, Instagram, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-serif text-lg font-semibold mb-4">About Arlamiluxe</h3>
            <p className="text-sm leading-relaxed">
              Premium Nigerian fabrics celebrating cultural heritage and luxury craftsmanship.
            </p>
          </div>

          <div>
            <h3 className="font-serif text-lg font-semibold mb-4">Collections</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" className="hover:text-brand-accent hover:underline" data-testid="link-footer-products">
                  All Products
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-brand-accent hover:underline" data-testid="link-footer-about">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-brand-accent hover:underline" data-testid="link-footer-contact">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Arlamiluxe. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a
              href="https://facebook.com/arlamiluxe"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit Arlamiluxe on Facebook"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-transparent hover:text-brand-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              data-testid="link-social-facebook"
            >
              <Facebook className="h-5 w-5" aria-hidden="true" />
            </a>
            <a
              href="https://instagram.com/arlami_luxe"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit Arlamiluxe on Instagram"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-transparent hover:text-brand-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              data-testid="link-social-instagram"
            >
              <Instagram className="h-5 w-5" aria-hidden="true" />
            </a>
            <a
              href="https://twitter.com/arlamiluxe"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit Arlamiluxe on Twitter"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-transparent hover:text-brand-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              data-testid="link-social-twitter"
            >
              <Twitter className="h-5 w-5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
