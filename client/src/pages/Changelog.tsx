import { Link } from "wouter";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Zap, Bug, AlertCircle } from "lucide-react";

interface ChangelogEntry {
  version: string;
  date: string;
  type: "feature" | "improvement" | "fix" | "security";
  title: string;
  description: string;
  changes: string[];
}

const changelogs: ChangelogEntry[] = [
  {
    version: "2.5.0",
    date: "November 25, 2025",
    type: "feature",
    title: "Email Notifications & Newsletter System",
    description: "Complete email infrastructure for customer communications",
    changes: [
      "Email service with HTML templates for orders, status updates, and restocks",
      "Newsletter subscription system with admin management",
      "Price tracking for price drop notifications",
      "Abandoned cart reminder emails",
      "Order confirmation and status update emails",
    ],
  },
  {
    version: "2.4.0",
    date: "November 25, 2025",
    type: "feature",
    title: "Smart Recommendations & Tracking",
    description: "Personalized shopping experience with AI-powered suggestions",
    changes: [
      "Product recommendations based on search history",
      "Recently viewed products tracking and display",
      "Session-based tracking for guest users",
      "Viewed products component on homepage",
      "Auto-tracking on product detail views",
    ],
  },
  {
    version: "2.3.0",
    date: "November 25, 2025",
    type: "feature",
    title: "Newsletter Integration",
    description: "Customer communication and email list management",
    changes: [
      "Newsletter signup component in footer",
      "Email validation and subscription management",
      "Admin dashboard to view all subscribers",
      "Unsubscribe functionality",
      "Beautiful subscription UI with toast notifications",
    ],
  },
  {
    version: "2.2.0",
    date: "November 25, 2025",
    type: "improvement",
    title: "Wishlist Persistence Fix",
    description: "Fixed wishlist items not showing in user profile",
    changes: [
      "Added userWishlists table for persistent storage",
      "Implemented backend API endpoints for wishlist sync",
      "Updated wishlistContext to use server storage",
      "Profile page now displays actual wishlist products",
      "Added storage layer methods for wishlist management",
    ],
  },
  {
    version: "2.1.0",
    date: "November 24, 2025",
    type: "feature",
    title: "Advanced Search & Filtering",
    description: "Enhanced product discovery with smart search",
    changes: [
      "Advanced search component with autocomplete",
      "Search history tracking and suggestions",
      "Typo correction with 'Did you mean?' feature",
      "Price range slider",
      "Category filtering",
      "Sort by price, name, or newest",
    ],
  },
  {
    version: "2.0.0",
    date: "November 20, 2025",
    type: "feature",
    title: "Admin & E-Commerce Suite",
    description: "Complete admin dashboard and business features",
    changes: [
      "Admin dashboard with sales analytics",
      "Order management and tracking",
      "Product inventory management",
      "Review moderation system",
      "Coupon and discount management",
      "Customer address management",
      "Restock notifications",
      "Order status history tracking",
    ],
  },
  {
    version: "1.5.0",
    date: "November 15, 2025",
    type: "feature",
    title: "Guest Checkout Flow",
    description: "Seamless checkout for non-registered users",
    changes: [
      "4-step guest checkout wizard",
      "Session-based cart persistence",
      "Guest order tracking",
      "Email confirmation for guest orders",
      "Automatic session expiration",
    ],
  },
  {
    version: "1.4.0",
    date: "November 10, 2025",
    type: "feature",
    title: "Order Tracking & Status",
    description: "Real-time order status updates for customers",
    changes: [
      "Order status timeline view",
      "Shipping carrier information",
      "Tracking number integration",
      "Email notifications on status changes",
      "Order history for logged-in users",
    ],
  },
  {
    version: "1.3.0",
    date: "November 5, 2025",
    type: "feature",
    title: "Product Reviews & Ratings",
    description: "Customer feedback and review system",
    changes: [
      "Product review submission with photos",
      "Star rating system (1-5 stars)",
      "Review moderation queue",
      "Helpful review voting",
      "Review display on product pages",
    ],
  },
  {
    version: "1.2.0",
    date: "October 30, 2025",
    type: "improvement",
    title: "UI/UX Improvements",
    description: "Enhanced user interface and experience",
    changes: [
      "Dark mode theme support",
      "Currency converter (USD, EUR, GBP, PLN, RON)",
      "Responsive mobile design",
      "Improved color palette and typography",
      "Better accessibility (ARIA labels)",
    ],
  },
  {
    version: "1.1.0",
    date: "October 25, 2025",
    type: "feature",
    title: "User Authentication",
    description: "Secure user accounts and authentication",
    changes: [
      "User registration and login",
      "Password hashing with bcrypt",
      "Session management",
      "Admin role system",
      "Email-based authentication",
    ],
  },
  {
    version: "1.0.0",
    date: "October 20, 2025",
    type: "feature",
    title: "Initial Release",
    description: "AxosShop MVP with core e-commerce features",
    changes: [
      "Product catalog with filtering",
      "Shopping cart functionality",
      "Checkout process with Stripe integration",
      "User profiles",
      "Order history",
      "Blog section with videos",
      "Responsive design",
    ],
  },
];

function getTypeIcon(type: ChangelogEntry["type"]) {
  switch (type) {
    case "feature":
      return <Zap className="w-5 h-5" />;
    case "improvement":
      return <CheckCircle className="w-5 h-5" />;
    case "fix":
      return <AlertCircle className="w-5 h-5" />;
    case "security":
      return <AlertCircle className="w-5 h-5" />;
  }
}

function getTypeColor(type: ChangelogEntry["type"]) {
  switch (type) {
    case "feature":
      return "bg-blue-100 text-blue-800";
    case "improvement":
      return "bg-green-100 text-green-800";
    case "fix":
      return "bg-yellow-100 text-yellow-800";
    case "security":
      return "bg-red-100 text-red-800";
  }
}

export default function Changelog() {
  return (
    <div className="min-h-screen bg-background">
      <Header cartItemCount={0} onCartClick={() => {}} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <span className="text-sm font-semibold text-primary">📝 Changelog</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-3">
            What's New
          </h1>
          <p className="text-lg text-muted-foreground">
            Follow all the latest updates, features, and improvements to AxosShop
          </p>
        </div>

        {/* Timeline */}
        <div className="space-y-6">
          {changelogs.map((entry, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg ${getTypeColor(entry.type)}`}>
                        {getTypeIcon(entry.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-xl">{entry.title}</CardTitle>
                          <Badge variant="outline" className="text-xs">
                            v{entry.version}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <CardDescription className="text-base">
                      {entry.description}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                      {entry.date}
                    </p>
                    <Badge
                      className={`mt-1 capitalize ${getTypeColor(
                        entry.type
                      )}`}
                    >
                      {entry.type}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {entry.changes.map((change, changeIndex) => (
                    <li
                      key={changeIndex}
                      className="flex items-start gap-3 text-sm text-muted-foreground"
                    >
                      <span className="text-primary mt-1">•</span>
                      <span>{change}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 p-8 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl border border-primary/20">
          <h3 className="text-lg font-semibold text-foreground mb-3">
            Have feedback?
          </h3>
          <p className="text-muted-foreground mb-4">
            We'd love to hear your thoughts! Join our community and share feature requests or bug reports.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="https://twitter.com/axoshard" target="_blank" rel="noopener noreferrer">
              <Button variant="outline">Share on Twitter</Button>
            </a>
            <a href="https://instagram.com/axoshard" target="_blank" rel="noopener noreferrer">
              <Button variant="outline">Follow on Instagram</Button>
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
