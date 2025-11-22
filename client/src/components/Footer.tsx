import { Link } from "wouter";
import { Heart, Mail, Phone, MapPin } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-slate-900 to-slate-950 text-slate-100 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-6 h-6 fill-pink-500 text-pink-500" />
              <span className="text-xl font-bold">AxosShop</span>
            </div>
            <p className="text-slate-400 text-sm">
              Your premium destination for unique and curated axolotl merchandise.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/">
                  <a className="text-slate-400 hover:text-white transition">
                    All Products
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/blog">
                  <a className="text-slate-400 hover:text-white transition">
                    Blog
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/wishlist">
                  <a className="text-slate-400 hover:text-white transition">
                    My Wishlist
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/checkout">
                  <a className="text-slate-400 hover:text-white transition">
                    Checkout
                  </a>
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/faq">
                  <a className="text-slate-400 hover:text-white transition">
                    FAQ
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy">
                  <a className="text-slate-400 hover:text-white transition">
                    Privacy Policy
                  </a>
                </Link>
              </li>
              <li>
                <a
                  href="mailto:support@axosshop.com"
                  className="text-slate-400 hover:text-white transition flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Email Support
                </a>
              </li>
              <li>
                <a
                  href="tel:+1234567890"
                  className="text-slate-400 hover:text-white transition flex items-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Get In Touch</h3>
            <div className="space-y-3 text-sm text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Your City, State ZIP</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <a
                  href="mailto:hello@axosshop.com"
                  className="hover:text-white transition"
                >
                  hello@axosshop.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <a href="tel:+1234567890" className="hover:text-white transition">
                  +1 (234) 567-890
                </a>
              </div>
            </div>
          </div>
        </div>

        <Separator className="bg-slate-700 mb-8" />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-slate-400">
          <p>&copy; {currentYear} AxosShop. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a
              href="https://twitter.com"
              className="hover:text-white transition"
              target="_blank"
              rel="noopener noreferrer"
            >
              Twitter
            </a>
            <a
              href="https://instagram.com"
              className="hover:text-white transition"
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram
            </a>
            <a
              href="https://facebook.com"
              className="hover:text-white transition"
              target="_blank"
              rel="noopener noreferrer"
            >
              Facebook
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
