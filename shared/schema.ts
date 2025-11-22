import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
}).extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
});

export const signupSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Products table
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("image_url").notNull(),
  stock: integer("stock").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  category: text("category").notNull().default("general"), // "tshirt", "hoodie", "mug", "plushie", "bag", "stickers", "phone_case"
  availableSizes: text("available_sizes"), // JSON string of available sizes
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

// Orders table
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  customerEmail: text("customer_email").notNull(),
  customerName: text("customer_name").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

// Order items table
export const orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull(),
  productId: varchar("product_id").notNull(),
  productName: text("product_name").notNull(),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
});

export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItems.$inferSelect;

// Cart item type (frontend only, not persisted)
export type CartItem = {
  product: Product;
  quantity: number;
  size?: string; // Optional size
};

// Blog posts table
export const blogPosts = pgTable("blog_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  videoUrl: text("video_url").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  createdAt: true,
}).extend({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  videoUrl: z.string().url("Invalid URL").min(1, "Video URL is required"),
});

export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;

// Product Reviews table
export const productReviews = pgTable("product_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull(),
  userId: varchar("user_id").notNull(),
  rating: integer("rating").notNull(), // 1-5 stars
  title: text("title").notNull(),
  comment: text("comment").notNull(),
  photos: text("photos"), // JSON array of photo URLs
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Restock Notifications table
export const restockNotifications = pgTable("restock_notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull(),
  userEmail: text("user_email").notNull(),
  isNotified: boolean("is_notified").notNull().default(false),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  notifiedAt: text("notified_at"),
});

// Search History table
export const searchHistory = pgTable("search_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  query: text("query").notNull(),
  resultCount: integer("result_count").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const insertProductReviewSchema = z.object({
  productId: z.string().min(1, "Product ID required"),
  userId: z.string().min(1, "User ID required"),
  rating: z.number().min(1).max(5, "Rating must be 1-5 stars"),
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  comment: z.string().min(1, "Comment is required").max(1000, "Comment too long"),
  photos: z.string().optional(), // JSON array string of photo URLs
});

export type InsertProductReview = z.infer<typeof insertProductReviewSchema>;
export type ProductReview = {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title: string;
  comment: string;
  photos?: string; // JSON array string
  createdAt: string;
};

// Restock Notification types
export type InsertRestockNotification = {
  productId: string;
  userEmail: string;
};

export type RestockNotification = {
  id: string;
  productId: string;
  userEmail: string;
  isNotified: boolean;
  createdAt: string;
  notifiedAt?: string;
};

// Search History types
export const insertSearchHistorySchema = z.object({
  query: z.string().min(1, "Search query required"),
  resultCount: z.number().min(0).optional(),
});

export type InsertSearchHistory = z.infer<typeof insertSearchHistorySchema>;
export type SearchHistory = {
  id: string;
  userId?: string;
  query: string;
  resultCount: number;
  createdAt: string;
};

// Coupons table
export const coupons = pgTable("coupons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  discountType: text("discount_type").notNull().default("percentage"), // "percentage" or "fixed"
  discountValue: integer("discount_value").notNull(),
  maxUses: integer("max_uses"),
  usedCount: integer("used_count").notNull().default(0),
  expiresAt: text("expires_at"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const insertCouponSchema = z.object({
  code: z.string().min(3).max(20).toUpperCase(),
  discountType: z.enum(["percentage", "fixed"]).default("percentage"),
  discountValue: z.number().min(1),
  maxUses: z.number().optional(),
  expiresAt: z.string().optional(),
});

export type InsertCoupon = z.infer<typeof insertCouponSchema>;
export type Coupon = {
  id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  maxUses?: number;
  usedCount: number;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
};

export const reviewSchema = z.object({
  id: z.string().optional(),
  productId: z.string(),
  userId: z.string(),
  userName: z.string(),
  rating: z.number().min(1).max(5),
  title: z.string().min(3).max(100),
  comment: z.string().min(10).max(1000),
  createdAt: z.date().optional(),
});

export const insertReviewSchema = reviewSchema.omit({ id: true, createdAt: true });

export type Review = z.infer<typeof reviewSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;

// User Addresses table (for saved addresses)
export const userAddresses = pgTable("user_addresses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  type: text("type").notNull(), // "shipping" or "billing"
  fullName: text("full_name").notNull(),
  street: text("street").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  country: text("country").notNull(),
  phone: text("phone"),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const insertUserAddressSchema = z.object({
  userId: z.string().min(1, "User ID required"),
  type: z.enum(["shipping", "billing"]),
  fullName: z.string().min(1, "Full name required"),
  street: z.string().min(1, "Street required"),
  city: z.string().min(1, "City required"),
  state: z.string().min(1, "State required"),
  zipCode: z.string().min(1, "Zip code required"),
  country: z.string().min(1, "Country required"),
  phone: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export type InsertUserAddress = z.infer<typeof insertUserAddressSchema>;
export type UserAddress = typeof userAddresses.$inferSelect;

// Order Status History table (for tracking order updates)
export const orderStatusHistory = pgTable("order_status_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull(),
  status: text("status").notNull(), // "pending", "processing", "shipped", "delivered", "cancelled"
  trackingNumber: text("tracking_number"),
  carrier: text("carrier"), // "fedex", "ups", "usps", "dhl"
  notes: text("notes"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const insertOrderStatusHistorySchema = z.object({
  orderId: z.string().min(1, "Order ID required"),
  status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]),
  trackingNumber: z.string().optional(),
  carrier: z.enum(["fedex", "ups", "usps", "dhl"]).optional(),
  notes: z.string().optional(),
});

export type InsertOrderStatusHistory = z.infer<typeof insertOrderStatusHistorySchema>;
export type OrderStatusHistory = typeof orderStatusHistory.$inferSelect;

// Review Moderation table
export const reviewModerations = pgTable("review_moderations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reviewId: varchar("review_id").notNull(),
  status: text("status").notNull().default("approved"), // "approved", "pending", "rejected"
  reason: text("reason"), // reason for rejection if applicable
  moderatedBy: varchar("moderated_by"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const insertReviewModerationSchema = z.object({
  reviewId: z.string().min(1, "Review ID required"),
  status: z.enum(["approved", "pending", "rejected"]).optional(),
  reason: z.string().optional(),
  moderatedBy: z.string().optional(),
});

export type InsertReviewModeration = z.infer<typeof insertReviewModerationSchema>;
export type ReviewModeration = typeof reviewModerations.$inferSelect;

// Guest Checkout Sessions table
export const guestCheckoutSessions = pgTable("guest_checkout_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionToken: text("session_token").notNull().unique(),
  email: text("email").notNull(),
  phone: text("phone"),
  cartData: text("cart_data").notNull(), // JSON string of cart items
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const insertGuestCheckoutSessionSchema = z.object({
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  cartData: z.string().min(1, "Cart data required"),
});

export type InsertGuestCheckoutSession = z.infer<typeof insertGuestCheckoutSessionSchema>;
export type GuestCheckoutSession = typeof guestCheckoutSessions.$inferSelect;

// Analytics Events table (for tracking user behavior)
export const analyticsEvents = pgTable("analytics_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  eventType: text("event_type").notNull(), // "view_product", "add_to_cart", "purchase", "search"
  productId: varchar("product_id"),
  value: decimal("value", { precision: 10, scale: 2 }), // for purchase events
  metadata: text("metadata"), // JSON for additional data
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const insertAnalyticsEventSchema = z.object({
  userId: z.string().optional(),
  eventType: z.string().min(1, "Event type required"),
  productId: z.string().optional(),
  value: z.number().optional(),
  metadata: z.string().optional(),
});

export type InsertAnalyticsEvent = z.infer<typeof insertAnalyticsEventSchema>;
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;

export const CURRENCIES = {
  USD: { symbol: '$', rate: 1 },
  EUR: { symbol: '€', rate: 0.92 },
  GBP: { symbol: '£', rate: 0.79 },
  PLN: { symbol: 'zł', rate: 4.10 },
} as const;

export type Currency = keyof typeof CURRENCIES;
