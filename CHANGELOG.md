# Changelog

All notable changes to AxosShop will be documented in this file.

## [3.2.2] - 2025-11-27

### Fixed - UI & State Management
- **Removed Duplicate UI Elements**
  - Eliminated duplicate currency selector from Header settings dropdown
  - Consolidated currency + language selection in single Internationalization component

- **Implemented Persistent Language System**
  - Created `languageContext.tsx` with LanguageProvider component
  - Implemented `useLanguage()` hook for global language state
  - Added localStorage persistence for language preferences (key: `axosshop_language`)
  - Language selection now persists across browser sessions

- **Refactored Localization Architecture**
  - Updated Internationalization component to use language/currency context hooks
  - Made currency array dynamic from CURRENCIES schema (single source of truth)
  - Fixed language and currency selection handlers to update global context

### Technical
- Added LanguageProvider to app root (`main.tsx`)
- Created comprehensive translation system with 8 languages × 14+ UI strings
- Language type validation with fallback to English
- Currency selection now uses context hooks for consistency

---

## [3.2.1] - 2025-11-27

### Added - Language & Currency Support
- **New Languages**
  - Polish (pl) 🇵🇱
  - Romanian (ro) 🇷🇴

- **New Currencies**
  - Polish Zloty (PLN) - zł
  - Romanian Leu (RON) - lei

### Technical
- Updated Internationalization component to include 8 languages (was 6)
- Extended CURRENCIES schema to include all 8 supported currencies
- Added exchange rates for all currencies

---

## [3.2.0] - 2025-11-27

### Added - Major Features
- **Two-Factor Authentication (2FA)**
  - SMS verification support
  - Authenticator app with QR code generation
  - Enable/disable 2FA in user settings

- **Multi-Payment Methods Display**
  - Stripe, PayPal, Apple Pay, Google Pay, Bank Transfer support
  - Payment method management interface

- **Referral Program**
  - Generate unique referral codes
  - Social media sharing (Facebook, Twitter, Pinterest)
  - Track successful referrals with $10 per signup rewards
  - Referral history table with status tracking

- **Gift Cards**
  - Create custom gift cards ($5-$500)
  - Email recipients directly
  - Balance tracking and redemption
  - Redeem gift cards at checkout with store credit
  - Active/redeemed/expired status management

- **Email Marketing Dashboard**
  - Multiple campaign types (post-purchase, birthday, winback, upsell)
  - Campaign metrics (open rate, click rate)
  - Campaign management and automation

- **Wishlist Sharing**
  - Share via unique link and email
  - Social media sharing (Facebook, Twitter, Pinterest)
  - Import wishlists from Amazon, Target, Etsy

- **Live Chat Widget**
  - 24/7 customer support availability
  - Real-time messaging
  - Chat history tracking

- **Product Filters**
  - Advanced filtering sidebar (price, category, rating, brand)
  - Price range slider ($0-$1000)
  - In-stock only toggle
  - Clear all filters button

- **Sitemap Manager**
  - Automatic XML sitemap generation
  - Search engine submission (Google, Bing, Yahoo, Yandex)
  - 1,247+ pages indexed

- **Internationalization (i18n) - Public Feature**
  - 6 languages: English, Spanish, French, German, Japanese, Chinese
  - 6 currencies: USD, EUR, GBP, JPY, CAD, AUD
  - Auto-detect user location
  - Real-time currency conversion
  - Available in Settings menu for all users (not admin-only)

- **Progressive Web App (PWA)**
  - Install as native app on mobile/desktop
  - Push notifications for order/shipping updates
  - Offline browsing support
  - Background sync

### Changed
- Removed Inventory Alerts component (not in scope)
- Moved Internationalization from admin-only to public Header Settings
- Updated AdminSidebar marketing menu from 6 to 4 items
- Restructured gift card flow for user checkout

### Technical
- Added 12 new API endpoints for features
- Installed `qrcode.react` dependency for 2FA
- Full TypeScript support for all new components
- React Query integration for server state
- Tailwind CSS styling consistency

### Bug Fixes
- Fixed ProductFilters checkbox event handler (onChange → onCheckedChange)
- Fixed TwoFactorAuth maxLength type (string → number)
- Wired up admin routes for all new marketing features

---

## [3.1.0] - 2025-11-26

### Added
- Loyalty Program with points tracking
- Abandoned Cart Management
- Bulk Product Import
- Customer Analytics Dashboard
- Color Theme Selector
- Notification Center
- Advanced Search functionality
- Newsletter Signup component

### Changed
- Updated admin sidebar layout
- Improved product discovery UX
- Enhanced analytics visualization

---

## [3.0.0] - Previous Release

### Initial Features
- Product catalog and management
- Shopping cart and checkout
- User authentication (login/signup)
- Order history and tracking
- Product reviews and ratings
- Wishlist functionality
- Admin dashboard
- Responsive design
- Dark mode support
