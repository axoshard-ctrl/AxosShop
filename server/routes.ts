// Improved by Python11235:)
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, loginSchema, insertProductSchema, insertOrderSchema, insertOrderItemSchema, insertBlogPostSchema, insertProductReviewSchema, insertCouponSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import Stripe from "stripe";
import "dotenv/config";

const STRIPE_SECRET_KEY = process.env.VITE_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY || "sk_test_placeholder";
let stripe: Stripe | null = null;

// Initialize Stripe only if we have a valid key
if (STRIPE_SECRET_KEY && STRIPE_SECRET_KEY !== "sk_test_placeholder") {
  stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16", // Updated to stable API version
  });
} else {
  console.warn("Stripe secret key not found or invalid. Payment processing will be mocked.");
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup route - create default admin account
  app.post("/api/setup", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      if (users.length > 0) {
        return res.status(400).json({ message: "Admin user already exists" });
      }

      const hashedPassword = await bcrypt.hash("admin123", 10);
      let user = await storage.createUser({
        email: "admin@axosshop.com",
        password: hashedPassword,
        name: "Admin",
      });

      user = await storage.makeAdmin(user.id) || user;
      const { password, ...userWithoutPassword } = user;
      res.json({ message: "Admin user created", user: userWithoutPassword });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Initialize admin user on startup if needed
  app.get("/api/init", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      if (users.length === 0) {
        const hashedPassword = await bcrypt.hash("admin123", 10);
        let user = await storage.createUser({
          email: "admin@axosshop.com",
          password: hashedPassword,
          name: "Admin",
        });
        user = await storage.makeAdmin(user.id) || user;
        const { password, ...userWithoutPassword } = user;
        res.json({ message: "Admin user created", user: userWithoutPassword });
      } else {
        res.json({ message: "Users already exist" });
      }
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Auth routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      
      const existing = await storage.getUserByEmail(data.email);
      if (existing) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Check if this is the first user
      const usersBefore = await storage.getAllUsers();
      const isFirstUser = usersBefore.length === 0;

      const hashedPassword = await bcrypt.hash(data.password, 10);
      let user = await storage.createUser({
        ...data,
        password: hashedPassword,
      });

      // Make first user an admin
      if (isFirstUser) {
        user = await storage.makeAdmin(user.id) || user;
      }

      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(data.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const valid = await bcrypt.compare(data.password, user.password);
      if (!valid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Admin setup route - make first user admin or by email
  app.post("/api/auth/make-admin", async (req, res) => {
    try {
      const { email } = req.body;
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const updated = await storage.makeAdmin(user.id);
      const { password, ...userWithoutPassword } = updated || user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const data = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(data);
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/products/:id", async (req, res) => {
    try {
      const data = insertProductSchema.parse(req.body);
      const product = await storage.updateProduct(req.params.id, data);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const success = await storage.deleteProduct(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/products/:id/toggle", async (req, res) => {
    try {
      const { isActive } = req.body;
      const product = await storage.toggleProductActive(req.params.id, isActive);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Stripe payment route for one-time payments
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { items, currency = "USD" } = req.body;
      
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Cart items are required" });
      }

      // Currency conversion rates
      const rates: Record<string, number> = {
        USD: 1,
        EUR: 0.92,
        GBP: 0.79,
      };

      const conversionRate = rates[currency] || 1;

      // Calculate total from server-side product prices
      let total = 0;
      for (const item of items) {
        const product = await storage.getProduct(item.productId);
        if (!product) {
          return res.status(404).json({ message: `Product ${item.productId} not found` });
        }
        if (!product.isActive) {
          return res.status(400).json({ message: `Product ${product.name} is no longer available` });
        }
        if (product.stock < item.quantity) {
          return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
        }
        total += parseFloat(product.price) * item.quantity;
      }

      if (total <= 0) {
        return res.status(400).json({ message: "Invalid cart total" });
      }

      // Apply currency conversion
      const convertedTotal = total * conversionRate;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(convertedTotal * 100), // Convert to cents
        currency: currency.toLowerCase(),
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          itemCount: items.length,
        },
      });

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        amount: convertedTotal,
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Order routes - ENHANCED VERSION
  app.post("/api/orders", async (req, res) => {
    try {
      const { order, items } = req.body;
      
      if (!order || !items) {
        return res.status(400).json({ message: "Order data and items are required" });
      }

      // Validate and create order
      const orderData = insertOrderSchema.parse({
        ...order,
        status: order.status || "completed",
        createdAt: new Date().toISOString(),
      });
      
      const createdOrder = await storage.createOrder(orderData);

      // Create order items and update stock
      for (const item of items) {
        const itemData = insertOrderItemSchema.parse({
          ...item,
          orderId: createdOrder.id,
          price: parseFloat(item.price) || parseFloat(item.product?.price) || 0
        });
        
        await storage.createOrderItem(itemData);

        // Update product stock
        const product = await storage.getProduct(item.productId);
        if (product) {
          const newStock = product.stock - item.quantity;
          await storage.updateProduct(item.productId, {
            ...product,
            stock: Math.max(0, newStock) // Ensure stock doesn't go negative
          });
        }
      }

      console.log(`Order created successfully: ${createdOrder.id} for customer ${order.customerEmail}`);
      
      res.json({
        ...createdOrder,
        items: items.map((item: any) => ({
          productName: item.productName,
          quantity: item.quantity,
          price: item.price
        }))
      });
    } catch (error: any) {
      console.error("Error creating order:", error);
      res.status(400).json({ 
        message: error.message || "Failed to create order",
        details: error.errors || "Validation error"
      });
    }
  });

  // Get order by ID
  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      const orderItems = await storage.getOrderItems(req.params.id);
      res.json({
        ...order,
        items: orderItems
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get all orders (admin only)
  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const items = await storage.getOrderItems(order.id);
          return {
            ...order,
            items
          };
        })
      );
      res.json(ordersWithItems);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Health check endpoint for payment system
  app.get("/api/payment/health", async (req, res) => {
    res.json({
      stripe: {
        configured: !!stripe,
        mode: stripe ? "live" : "mock",
        apiVersion: "2023-10-16"
      },
      environment: process.env.NODE_ENV || "development"
    });
  });

  // Blog routes
  app.get("/api/blog", async (req, res) => {
    try {
      const posts = await storage.getBlogPosts();
      res.json(posts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/blog/:id", async (req, res) => {
    try {
      const post = await storage.getBlogPost(req.params.id);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      res.json(post);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/blog", async (req, res) => {
    try {
      const data = insertBlogPostSchema.parse(req.body);
      const post = await storage.createBlogPost(data);
      res.json(post);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/blog/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteBlogPost(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      res.json({ message: "Blog post deleted successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Sync endpoints for Render
  app.post("/api/sync", async (req, res) => {
    try {
      const syncToken = req.headers["x-sync-token"];
      const expectedToken = process.env.SYNC_TOKEN || "default-sync-token";
      
      if (syncToken !== expectedToken) {
        return res.status(401).json({ message: "Invalid sync token" });
      }

      const { products, users, orders, orderItems } = req.body;

      // Update storage with synced data
      if (products) {
        Object.assign(storage["data"].products, products);
      }
      if (users) {
        Object.assign(storage["data"].users, users);
      }
      if (orders) {
        Object.assign(storage["data"].orders, orders);
      }
      if (orderItems) {
        Object.assign(storage["data"].orderItems, orderItems);
      }

      res.json({ message: "Data synced successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/sync/product", async (req, res) => {
    try {
      const syncToken = req.headers["x-sync-token"];
      const expectedToken = process.env.SYNC_TOKEN || "default-sync-token";
      
      if (syncToken !== expectedToken) {
        return res.status(401).json({ message: "Invalid sync token" });
      }

      const { product } = req.body;
      if (!product || !product.id) {
        return res.status(400).json({ message: "Invalid product data" });
      }

      storage["data"].products[product.id] = product;
      res.json({ message: "Product synced successfully", product });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/sync/product/:id", async (req, res) => {
    try {
      const syncToken = req.headers["x-sync-token"];
      const expectedToken = process.env.SYNC_TOKEN || "default-sync-token";
      
      if (syncToken !== expectedToken) {
        return res.status(401).json({ message: "Invalid sync token" });
      }

      const { id } = req.params;
      delete storage["data"].products[id];
      res.json({ message: "Product deletion synced successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/sync/blog", async (req, res) => {
    try {
      const syncToken = req.headers["x-sync-token"];
      const expectedToken = process.env.SYNC_TOKEN || "default-sync-token";
      
      if (syncToken !== expectedToken) {
        return res.status(401).json({ message: "Invalid sync token" });
      }

      const { post } = req.body;
      if (!post || !post.id) {
        return res.status(400).json({ message: "Invalid blog post data" });
      }

      if (!storage["data"].blogPosts) {
        storage["data"].blogPosts = {};
      }
      storage["data"].blogPosts[post.id] = post;
      res.json({ message: "Blog post synced successfully", post });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/sync/blog/:id", async (req, res) => {
    try {
      const syncToken = req.headers["x-sync-token"];
      const expectedToken = process.env.SYNC_TOKEN || "default-sync-token";
      
      if (syncToken !== expectedToken) {
        return res.status(401).json({ message: "Invalid sync token" });
      }

      const { id } = req.params;
      if (storage["data"].blogPosts) {
        delete storage["data"].blogPosts[id];
      }
      res.json({ message: "Blog post deletion synced successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Product Reviews endpoints
  app.get("/api/products/:id/reviews", async (req, res) => {
    try {
      const reviews = await storage.getProductReviews(req.params.id);
      res.json(reviews);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/products/:id/reviews", async (req, res) => {
    try {
      const data = insertProductReviewSchema.parse({
        ...req.body,
        productId: req.params.id,
      });
      const review = await storage.createProductReview(data);
      res.json(review);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/products/reviews/:id", async (req, res) => {
    try {
      const success = await storage.deleteProductReview(req.params.id);
      res.json({ success, message: "Review deleted" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Restock Notification endpoints
  app.post("/api/restock/notify", async (req, res) => {
    try {
      const { productId, userEmail } = req.body;
      if (!productId || !userEmail) {
        return res.status(400).json({ message: "Product ID and email required" });
      }
      
      const notification = await storage.createRestockNotification({
        productId,
        userEmail,
      });
      res.json(notification);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/restock/notifications/:productId", async (req, res) => {
    try {
      const notifications = await storage.getRestockNotifications(req.params.productId);
      res.json(notifications);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/restock/pending", async (req, res) => {
    try {
      const notifications = await storage.getUnnotifiedRestockNotifications();
      res.json(notifications);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/restock/notify/:notificationId/mark-sent", async (req, res) => {
    try {
      const success = await storage.markRestockNotificationAsNotified(
        req.params.notificationId
      );
      res.json({ success });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/restock/notifications/:id", async (req, res) => {
    try {
      const success = await storage.deleteRestockNotification(req.params.id);
      res.json({ success });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Search History endpoints
  app.get("/api/search/history", async (req, res) => {
    try {
      const userId = (req as any).user?.id;
      const limit = parseInt(req.query.limit as string) || 10;
      const history = await storage.getSearchHistory(userId, limit);
      res.json(history);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/search/suggestions", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query || query.length < 2) {
        return res.json([]);
      }
      const suggestions = await storage.getSearchSuggestions(query, 5);
      res.json(suggestions);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/search/history", async (req, res) => {
    try {
      const userId = (req as any).user?.id;
      const { query, resultCount } = req.body;
      
      if (!query || query.trim().length === 0) {
        return res.status(400).json({ message: "Query is required" });
      }

      const record = await storage.createSearchHistory(userId, {
        query: query.trim(),
        resultCount: resultCount || 0,
      });
      res.json(record);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/search/history", async (req, res) => {
    try {
      const userId = (req as any).user?.id;
      const success = await storage.clearSearchHistory(userId);
      res.json({ success });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Coupon endpoints
  app.get("/api/coupons/:code", async (req, res) => {
    try {
      const coupon = await storage.getCoupon(req.params.code);
      if (!coupon) {
        return res.status(404).json({ message: "Coupon not found or expired" });
      }
      res.json(coupon);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/coupons", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const user = (req as any).user;
      
      // Only admins can create coupons
      if (!user || !user.isAdmin) {
        return res.status(403).json({ message: "Only admins can create coupons" });
      }

      const data = insertCouponSchema.parse(req.body);
      const coupon = await storage.createCoupon(data);
      res.json(coupon);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/coupons/:code/use", async (req, res) => {
    try {
      const used = await storage.useCoupon(req.params.code);
      if (!used) {
        return res.status(404).json({ message: "Coupon not found" });
      }
      res.json({ message: "Coupon applied successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Orders endpoint
  app.get("/api/orders", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Admins get all orders, users get their own
      if (user.isAdmin) {
        const orders = await storage.getAllOrders();
        res.json(orders);
      } else {
        const orders = await storage.getOrdersByUserId(user.id);
        res.json(orders);
      }
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Update order endpoint (admin only)
  app.patch("/api/orders/:id", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user || !user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { status, trackingNumber } = req.body;
      const order = await storage.updateOrder(req.params.id, {
        status: status || undefined,
      });

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json(order);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // User profile routes
  app.get("/api/user/orders", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const orders = await storage.getOrdersByUserId(user.id);
      res.json(orders);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/user/wishlist", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const wishlist = await storage.getUserWishlist(user.id);
      res.json(wishlist || []);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // User Addresses routes
  app.get("/api/user/addresses", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const addresses = await storage.getUserAddresses(user.id);
      res.json(addresses);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/user/addresses", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const address = await storage.createUserAddress({
        ...req.body,
        userId: user.id,
      });
      res.json(address);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/user/addresses/:id", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const address = await storage.updateUserAddress(req.params.id, req.body);
      if (!address) {
        return res.status(404).json({ message: "Address not found" });
      }
      res.json(address);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/user/addresses/:id", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const deleted = await storage.deleteUserAddress(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Address not found" });
      }
      res.json({ message: "Address deleted" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/user/addresses/:id/default", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const success = await storage.setDefaultUserAddress(user.id, req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Address not found" });
      }
      res.json({ message: "Default address updated" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Order Status History routes
  app.get("/api/orders/:id/status-history", async (req, res) => {
    try {
      const history = await storage.getOrderStatusHistory(req.params.id);
      res.json(history);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/orders/:id/status", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user || !user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const status = await storage.updateOrderStatus(req.params.id, {
        orderId: req.params.id,
        ...req.body,
      });
      res.json(status);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Review Moderation routes
  app.get("/api/admin/reviews/moderation", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user || !user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { status } = req.query;
      const queue = await storage.getReviewModerationQueue(status as string | undefined);
      res.json(queue);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/admin/reviews/:id/moderate", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user || !user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const moderation = await storage.updateReviewModeration(req.params.id, {
        ...req.body,
        moderatedBy: user.id,
      });
      if (!moderation) {
        return res.status(404).json({ message: "Review not found" });
      }
      res.json(moderation);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Guest Checkout Session routes
  app.post("/api/guest/checkout/session", async (req, res) => {
    try {
      const session = await storage.createGuestCheckoutSession(req.body);
      res.json(session);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/guest/checkout/session/:token", async (req, res) => {
    try {
      const session = await storage.getGuestCheckoutSession(req.params.token);
      if (!session) {
        return res.status(404).json({ message: "Session not found or expired" });
      }
      res.json(session);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Analytics routes
  app.post("/api/analytics/event", async (req, res) => {
    try {
      const user = (req as any).user;
      const event = await storage.createAnalyticsEvent({
        userId: user?.id,
        ...req.body,
      });
      res.json(event);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/admin/stats", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user || !user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { dateFrom, dateTo } = req.query;
      const stats = await storage.getSalesStats(dateFrom as string | undefined, dateTo as string | undefined);
      res.json(stats);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/admin/analytics", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user || !user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { eventType, productId, dateFrom, dateTo } = req.query;
      const events = await storage.getAnalyticsEvents({
        eventType: eventType as string | undefined,
        productId: productId as string | undefined,
        dateFrom: dateFrom as string | undefined,
        dateTo: dateTo as string | undefined,
      });
      res.json(events);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Admin Coupon Management Routes
  app.get("/api/admin/coupons", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user || !user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const coupons = await storage.getAllCoupons();
      res.json(coupons);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/admin/coupons", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user || !user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const data = insertCouponSchema.parse(req.body);
      const coupon = await storage.createCoupon(data);
      res.json(coupon);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/admin/coupons/:id", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user || !user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { code, discountType, discountValue, maxUses, expiresAt, isActive } = req.body;
      const coupon = await storage.updateCoupon(req.params.id, {
        code,
        discountType,
        discountValue,
        maxUses,
        expiresAt,
        isActive,
      });
      res.json(coupon);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/admin/coupons/:id", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user || !user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.deleteCoupon(req.params.id);
      res.json({ message: "Coupon deleted successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
