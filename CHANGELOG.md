# Changelog

All notable changes to AxosShop will be documented in this file.

## [3.2.4] - 2025-11-27

### Added - Comprehensive App-Wide Language System
- **Massive Translation Expansion**
  - Increased translation keys from 24 to 60+ per language
  - Full coverage for products, cart, checkout, auth, and footer sections
  - Every UI element now supports all 8 languages

- **Language Coverage by Section**
  - Header: 13 translatable items
  - Cart & Shopping: 8 items
  - Products: 7 items
  - Common Actions: 10 items
  - Checkout Flow: 8 items
  - Authentication: 7 items
  - Footer: 6 items

- **App-Wide Language Support**
  - Home page filters and sorting labels translate
  - Price ranges display in selected currency with localized text
  - Category filters show translated labels
  - Sort options display in user's language
  - All navigation reflects language selection

### How It Works
- Select any language from Settings ⚙️
- Entire app UI updates in real-time
- All 8 languages fully functional and persistent:
  - 🇺🇸 English
  - 🇪🇸 Spanish
  - 🇫🇷 French
  - 🇩🇪 German
  - 🇯🇵 Japanese
  - 🇨🇳 Chinese
  - 🇵🇱 Polish
  - 🇷🇴 Romanian

### Technical
- 480 total translations (60 keys × 8 languages)
- Language persisted to localStorage automatically
- Fallback to English for missing translations
- React Context for global language state
- t() helper function for translation lookup

---

## [3.2.3] - 2025-11-27

### Fixed - Language Translation Implementation
- **Enabled Dynamic Language Translations**
  - Header component now uses useLanguage() hook to access current language
  - All navigation text translates when user switches languages
  - User menu items (Profile, Orders, Logout) now multilingual
  - Authentication buttons (Login, Sign Up) now multilingual
  - Settings label translates with language changes

- **Translation Coverage Expanded**
  - Added 10 new translation keys across all 8 languages
  - Navigation: Blog, Changelog, Featured Art, Staff, Wishlist
  - User Menu: My Profile, Order History, Logout
  - Auth: Login, Sign Up, Settings
  - Total: 24 translation keys × 8 languages = 192 translations

### How It Works
- Select any language via Settings ⚙️ → Language selector
- Header text instantly updates to reflect selection
- Language preference saved to localStorage and persists across sessions
- Fallback to English for any missing translations
- All 8 languages fully functional: EN, ES, FR, DE, JA, ZH, PL, RO

---

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
