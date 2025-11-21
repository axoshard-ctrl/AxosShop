import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import heroImage from "@assets/hero-purple-axolotl-mascot_1762939234262.png";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer">
                <img src={heroImage} alt="AxosShop Logo" className="h-10 w-10 rounded-lg object-contain" />
                <span className="text-2xl font-bold text-gray-900">AxosShop</span>
              </div>
            </Link>
            <Link href="/shop">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                Back to Shop
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <p className="text-gray-600 mb-6">
            Last Updated: November 21, 2025
          </p>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 mb-4">
              Welcome to AxosShop ("Company," "we," "our," or "us"). We are committed to protecting your privacy and ensuring you have a positive experience on our website and when using our services. This Privacy Policy explains how we collect, use, disclose, and otherwise handle your personal information when you visit our website, make purchases, and interact with our services.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
            <p className="text-gray-700 mb-4">We may collect information about you in the following ways:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li><strong>Personal Information:</strong> Name, email address, phone number, postal address, and payment information when you place an order.</li>
              <li><strong>Account Information:</strong> Username, password, and profile information if you create an account.</li>
              <li><strong>Browsing Information:</strong> Pages visited, time spent on pages, links clicked, and other browsing behavior.</li>
              <li><strong>Device Information:</strong> Device type, operating system, browser type, IP address, and other technical information.</li>
              <li><strong>Cookies and Tracking Technologies:</strong> We use cookies and similar technologies to enhance your experience.</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-700 mb-4">We use the information we collect for various purposes, including:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Processing and fulfilling your orders</li>
              <li>Sending order confirmations and updates</li>
              <li>Responding to your inquiries and customer service requests</li>
              <li>Personalizing your shopping experience</li>
              <li>Improving our website and services</li>
              <li>Sending promotional emails and updates (with your consent)</li>
              <li>Preventing fraud and ensuring security</li>
              <li>Complying with legal obligations</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Information Sharing</h2>
            <p className="text-gray-700 mb-4">
              We do not sell, trade, or rent your personal information to third parties. However, we may share your information with:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Service providers who assist us in operating our website and conducting business</li>
              <li>Payment processors for transaction processing</li>
              <li>Shipping partners for order delivery</li>
              <li>Legal authorities when required by law</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Security</h2>
            <p className="text-gray-700 mb-4">
              We implement appropriate technical and organizational measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is completely secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Your Rights and Choices</h2>
            <p className="text-gray-700 mb-4">You have the following rights regarding your personal information:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Right to access your personal information</li>
              <li>Right to correct inaccurate information</li>
              <li>Right to request deletion of your information</li>
              <li>Right to opt-out of promotional communications</li>
              <li>Right to data portability</li>
            </ul>
            <p className="text-gray-700 mb-4">
              To exercise any of these rights, please contact us using the information provided in the "Contact Us" section below.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cookies and Tracking Technologies</h2>
            <p className="text-gray-700 mb-4">
              We use cookies and similar tracking technologies to enhance your experience. These may include session cookies (temporary) and persistent cookies (long-term). You can control cookie settings through your browser preferences, but disabling cookies may affect website functionality.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Third-Party Links</h2>
            <p className="text-gray-700 mb-4">
              Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of external sites. We encourage you to review the privacy policies of any third-party services before providing your information.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Children's Privacy</h2>
            <p className="text-gray-700 mb-4">
              Our website and services are not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware of such collection, we will take steps to delete the information and terminate the child's use of the service.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Policy Updates</h2>
            <p className="text-gray-700 mb-4">
              We may update this Privacy Policy from time to time. We will notify you of significant changes by updating the "Last Updated" date and posting the revised policy on our website. Your continued use of our services indicates your acceptance of the updated policy.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have questions about this Privacy Policy or our privacy practices, please contact us at:
            </p>
            <div className="bg-gray-100 p-6 rounded-lg">
              <p className="text-gray-700 mb-2">
                <strong>Email:</strong> <a href="mailto:axoshard@gmail.com" className="text-purple-600 hover:text-purple-700">axoshard@gmail.com</a>
              </p>
              <p className="text-gray-700 mb-2">
                <strong>Website:</strong> www.axoshard.com
              </p>
              <p className="text-gray-700">
                We will make every effort to respond to your inquiries within 30 days.
              </p>
            </div>
          </section>

          <section className="text-center pt-12 border-t">
            <Link href="/shop">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 text-lg rounded-lg font-semibold">
                Back to Shop
              </Button>
            </Link>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 text-sm">
            <p>&copy; 2025 AxosShop. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
