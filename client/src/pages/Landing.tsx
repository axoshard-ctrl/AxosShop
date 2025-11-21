import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Github, Instagram, Twitter, Mail, Youtube } from "lucide-react";
import heroImage from "@assets/hero-purple-axolotl-mascot_1762939234262.png";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex flex-col">
      {/* Header with logo */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img src={heroImage} alt="AxosShop Logo" className="h-10 w-10 rounded-lg object-contain" />
              <span className="text-2xl font-bold text-gray-900">AxosShop</span>
            </div>
            <nav className="hidden md:flex space-x-4">
              <a href="/shop" className="text-gray-600 hover:text-gray-900">Products</a>
              <a href="mailto:axoshard@gmail.com" className="text-gray-600 hover:text-gray-900">Contact</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="text-center max-w-2xl">
          {/* Hero section */}
          <div className="mb-12">
            <div className="mb-8 flex justify-center">
              <img src={heroImage} alt="Purple Axolotl" className="h-32 w-32 object-contain" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
              Welcome to <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">AxosShop</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Your ultimate destination for adorable purple axolotl merchandise and collectibles
            </p>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition">
              <div className="text-3xl mb-2">🎨</div>
              <h3 className="font-semibold text-gray-900 mb-2">Unique Designs</h3>
              <p className="text-gray-600 text-sm">Exclusive axolotl-themed merchandise</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition">
              <div className="text-3xl mb-2">🛡️</div>
              <h3 className="font-semibold text-gray-900 mb-2">Secure Checkout</h3>
              <p className="text-gray-600 text-sm">Safe and secure payment processing</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition">
              <div className="text-3xl mb-2">📦</div>
              <h3 className="font-semibold text-gray-900 mb-2">Fast Shipping</h3>
              <p className="text-gray-600 text-sm">Quick delivery to your doorstep</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/login">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg rounded-lg font-semibold">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="outline" className="border-2 border-purple-600 text-purple-600 hover:bg-purple-50 px-8 py-6 text-lg rounded-lg font-semibold">
                Create Account
              </Button>
            </Link>
          </div>

          {/* Info text */}
          <p className="text-gray-600 text-sm mb-8">
            Already have an account? <Link href="/login"><span className="text-purple-600 hover:underline font-semibold">Sign in here</span></Link>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Shop</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="/shop" className="hover:text-gray-900">All Products</a></li>
                <li><a href="/shop" className="hover:text-gray-900">New Arrivals</a></li>
                <li><a href="/shop" className="hover:text-gray-900">Best Sellers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="mailto:axoshard@gmail.com" className="hover:text-gray-900">Contact Us</a></li>
                <li><a href="/privacy-policy" className="hover:text-gray-900">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Follow Us</h4>
              <div className="flex space-x-3">
                <a href="https://twitter.com/axoshard" target="_blank" rel="noopener noreferrer" className="bg-purple-100 p-3 rounded-lg text-purple-600 hover:bg-purple-200 transition"><Twitter size={20} /></a>
                <a href="https://instagram.com/axoshard" target="_blank" rel="noopener noreferrer" className="bg-pink-100 p-3 rounded-lg text-pink-600 hover:bg-pink-200 transition"><Instagram size={20} /></a>
                <a href="https://www.tiktok.com" target="_blank" rel="noopener noreferrer" className="bg-gray-100 p-3 rounded-lg text-gray-600 hover:bg-gray-200 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.96-.1z"></path></svg>
                </a>
                <a href="https://www.youtube.com/@axo_shard" target="_blank" rel="noopener noreferrer" className="bg-red-100 p-3 rounded-lg text-red-600 hover:bg-red-200 transition"><Youtube size={20} /></a>
                <a href="https://www.reddit.com/user/Myhagaby/" target="_blank" rel="noopener noreferrer" className="bg-orange-100 p-3 rounded-lg text-orange-600 hover:bg-orange-200 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="1"></circle><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"></path></svg>
                </a>
                <a href="https://discord.gg/U3cgX7HDFd" target="_blank" rel="noopener noreferrer" className="bg-indigo-100 p-3 rounded-lg text-indigo-600 hover:bg-indigo-200 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.793 19.793 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.211.375-.444.864-.607 1.25a18.27 18.27 0 0 0-5.487 0c-.163-.386-.395-.875-.607-1.25a.077.077 0 0 0-.079-.037A19.773 19.773 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.975 14.975 0 0 0 1.293-2.1a.07.07 0 0 0-.038-.098a13.11 13.11 0 0 1-1.872-.892a.072.072 0 0 1-.007-.12a10.519 10.519 0 0 0 .372-.294a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01a10.475 10.475 0 0 0 .372.294a.072.072 0 0 1-.006.12a12.977 12.977 0 0 1-1.873.892a.07.07 0 0 0-.038.098a14.998 14.998 0 0 0 1.293 2.1a.078.078 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.079.079 0 0 0 .033-.057c.55-4.564-.823-8.529-3.48-12.064a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-.965-2.157-2.156c0-1.193.964-2.157 2.157-2.157c1.193 0 2.157.964 2.157 2.157c0 1.19-.964 2.156-2.157 2.156zm7.975 0c-1.183 0-2.157-.965-2.157-2.156c0-1.193.964-2.157 2.157-2.157c1.193 0 2.157.964 2.157 2.157c0 1.19-.964 2.156-2.157 2.156z"></path></svg>
                </a>
                <a href="mailto:axoshard@gmail.com" className="bg-blue-100 p-3 rounded-lg text-blue-600 hover:bg-blue-200 transition"><Mail size={20} /></a>
              </div>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-gray-600 text-sm">
            <p>&copy; 2025 AxosShop. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
