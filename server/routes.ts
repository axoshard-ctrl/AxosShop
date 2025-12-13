// Improved by Python11235:)
import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, loginSchema, insertProductSchema, insertOrderSchema, insertOrderItemSchema, insertBlogPostSchema, insertProductReviewSchema, insertCouponSchema } from "@shared/schema";
import { emailService } from "./emailService";
import { discordService } from "./discordService";
import { WebSocketManager } from "./websocket";
import { createPayPalOrder, capturePayPalOrder, getPayPalOrderDetails, createPayPalPayout, getPayoutBatchStatus, refundPayPalCapture } from "./paypalService";
import { createManualTransaction, completeManualTransaction, failManualTransaction, refundManualTransaction, getManualTransaction, getOrderTransactions, getTransactionSummary } from "./manualTransactions";
import bcrypt from "bcrypt";
import "dotenv/config";

// WebSocket manager instance
export let wsManager: WebSocketManager | null = null;

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

  // Discord OAuth2 callback
  app.post("/api/auth/discord/callback", async (req, res) => {
    try {
      const { code } = req.body;
      const user = (req as any).user;

      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      if (!code) {
        return res.status(400).json({ message: "Discord code is required" });
      }

      // TODO: Exchange code for Discord token and store it
      // For now, just return success
      res.json({
        message: "Discord account connected successfully",
        discordConnected: true,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get Discord profile
  app.get("/api/user/discord-profile", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // TODO: Return stored Discord profile
      // For now, return mock data
      res.json({
        id: "123456789",
        username: "AxoShard",
        discriminator: "0001",
        avatar: "a_1234567890abcdef",
        email: user.email,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Disconnect Discord account
  app.post("/api/user/disconnect-discord", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // TODO: Remove Discord connection from user
      res.json({ message: "Discord account disconnected" });
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
      
      // Send WebSocket notification
      wsManager?.broadcast({
        type: 'order.created',
        data: {
          orderId: createdOrder.id,
          customerEmail: order.customerEmail,
          totalAmount: order.totalAmount,
        }
      });

      // Send Discord notification
      await discordService.notifyNewOrder(
        createdOrder.id,
        order.customerEmail,
        order.totalAmount
      );

      // Send email notification
      await emailService.sendOrderConfirmation(order.customerEmail, {
        orderId: createdOrder.id,
        customerName: order.customerName || 'Customer',
        totalAmount: order.totalAmount,
        items: items.map((item: any) => ({
          productName: item.productName,
          quantity: item.quantity,
          price: item.price
        }))
      });
      
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

  app.post("/api/user/wishlist", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { productId } = req.body;
      if (!productId) {
        return res.status(400).json({ message: "Product ID is required" });
      }

      await storage.addToUserWishlist(user.id, productId);
      res.json({ message: "Added to wishlist" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/user/wishlist/:productId", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { productId } = req.params;
      await storage.removeFromUserWishlist(user.id, productId);
      res.json({ message: "Removed from wishlist" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // User Loyalty endpoint
  app.get("/api/user/loyalty", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Get user's orders to calculate loyalty
      const orders = await storage.getOrdersByUserId(user.id);
      
      // Calculate loyalty stats
      let totalSpent = 0;
      let totalOrders = 0;
      let pointsThisMonth = 0;
      
      const now = new Date();
      const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
      
      orders.forEach((order: any) => {
        if (order.status === "completed") {
          totalSpent += parseFloat(order.totalAmount);
          totalOrders += 1;
          
          const orderDate = new Date(order.createdAt);
          if (orderDate >= monthAgo) {
            pointsThisMonth += Math.floor(parseFloat(order.totalAmount));
          }
        }
      });
      
      // Calculate tier and points
      const totalPoints = Math.floor(totalSpent);
      
      let tier: "bronze" | "silver" | "gold" | "platinum" = "bronze";
      let nextTierPoints = 500;
      
      if (totalPoints >= 2000) {
        tier = "platinum";
        nextTierPoints = 5000;
      } else if (totalPoints >= 1000) {
        tier = "gold";
        nextTierPoints = 2000;
      } else if (totalPoints >= 500) {
        tier = "silver";
        nextTierPoints = 1000;
      }
      
      const availableRewards = Math.floor(totalPoints / 100);
      
      res.json({
        userId: user.id,
        totalPoints,
        pointsThisMonth,
        totalSpent,
        totalOrders,
        tier,
        nextTierPoints,
        availableRewards,
      });
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

      // Get order details for notifications
      const order = await storage.getOrder(req.params.id);

      // Send WebSocket notification
      wsManager?.broadcast({
        type: 'order.status_changed',
        data: {
          orderId: req.params.id,
          status: status.status,
        }
      });

      // Send Discord notification
      await discordService.notifyOrderUpdate(
        req.params.id,
        status.status,
        order?.customerEmail
      );

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

      const { dateFrom, dateTo } = req.query;
      
      // Get sales stats
      const stats = await storage.getSalesStats(
        dateFrom as string | undefined,
        dateTo as string | undefined
      );

      // Get all orders to calculate daily revenue
      const allOrders = await storage.getAllOrders();
      const dateFromObj = dateFrom ? new Date(dateFrom as string) : new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000);
      const dateToObj = dateTo ? new Date(dateTo as string) : new Date();

      // Build daily revenue chart data
      const dailyData: Record<string, { revenue: number; orders: number }> = {};
      for (let d = new Date(dateFromObj); d <= dateToObj; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split("T")[0];
        dailyData[dateStr] = { revenue: 0, orders: 0 };
      }

      allOrders.forEach((order) => {
        const dateStr = order.createdAt.split("T")[0];
        if (dailyData[dateStr]) {
          dailyData[dateStr].revenue += parseFloat(order.totalAmount);
          dailyData[dateStr].orders += 1;
        }
      });

      const dailyRevenue = Object.entries(dailyData).map(([date, data]) => ({
        date,
        ...data,
      }));

      // Get products for performance data
      const products = await storage.getProducts();
      const productPerformance = stats.topProducts.map((p) => {
        const product = products.find((pr) => pr.id === p.productId);
        return {
          ...p,
          avgRating: 4.5, // Default rating
        };
      });

      // Get category breakdown
      const categoryBreakdown = products.reduce(
        (acc: Record<string, { sales: number; revenue: number }>, product) => {
          const category = product.category || "general";
          if (!acc[category]) {
            acc[category] = { sales: 0, revenue: 0 };
          }
          const topProduct = stats.topProducts.find(
            (p) => p.productId === product.id
          );
          if (topProduct) {
            acc[category].sales += topProduct.count;
            acc[category].revenue += topProduct.revenue;
          }
          return acc;
        },
        {}
      );

      const categoryBreakdownArray = Object.entries(categoryBreakdown).map(
        ([category, data]) => ({
          category,
          ...data,
        })
      );

      // User metrics
      const allUsers = await storage.getAllUsers();
      const userMetrics = {
        totalUsers: allUsers.length,
        activeUsers: Math.floor(allUsers.length * 0.7), // Mock: 70% active
        newUsers: Math.floor(allUsers.length * 0.15), // Mock: 15% new
        conversionRate: allOrders.length / Math.max(allUsers.length, 1),
      };

      // Customer loyalty
      const purchaseCounts: Record<number, number> = {};
      allOrders.forEach((order) => {
        const userId = order.userId || "guest";
        const count = allOrders.filter((o) => o.userId === userId).length;
        purchaseCounts[count] = (purchaseCounts[count] || 0) + 1;
      });

      const customerLoyalty = Object.entries(purchaseCounts)
        .map(([purchases, count]) => ({
          purchases: parseInt(purchases),
          count,
        }))
        .sort((a, b) => a.purchases - b.purchases);

      res.json({
        dailyRevenue,
        productPerformance,
        userMetrics,
        categoryBreakdown: categoryBreakdownArray,
        customerLoyalty,
      });
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

  // Admin User Management Routes
  app.get("/api/admin/users", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user || !user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const users = await storage.getAllUsers();
      // Remove passwords from response
      const safeUsers = users.map(({ password, ...userWithoutPassword }) => userWithoutPassword);
      res.json(safeUsers);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/admin/users/promote", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user || !user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const targetUser = await storage.getUserByEmail(email.toLowerCase());
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }

      if (targetUser.isAdmin) {
        return res.status(400).json({ message: "User is already an admin" });
      }

      const promotedUser = await storage.makeAdmin(targetUser.id);
      if (!promotedUser) {
        return res.status(400).json({ message: "Failed to promote user" });
      }

      const { password, ...userWithoutPassword } = promotedUser;
      res.json({ message: "User promoted to admin", user: userWithoutPassword });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/admin/users/revoke", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user || !user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const targetUser = await storage.getUser(userId);
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!targetUser.isAdmin) {
        return res.status(400).json({ message: "User is not an admin" });
      }

      // Prevent revoking the current user's own admin status
      if (user.id === userId) {
        return res.status(400).json({ message: "Cannot revoke your own admin privileges" });
      }

      // Update user to remove admin status
      const updatedUser = await storage.updateUser(userId, {
        ...targetUser,
        isAdmin: false,
      });

      if (!updatedUser) {
        return res.status(400).json({ message: "Failed to revoke admin status" });
      }

      const { password, ...userWithoutPassword } = updatedUser;
      res.json({ message: "Admin privileges revoked", user: userWithoutPassword });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ============ Newsletter Endpoints ============
  app.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      const { email, userId } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const subscription = await storage.subscribeNewsletter({ email, userId });
      res.json({ message: "Successfully subscribed to newsletter", subscription });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/newsletter/unsubscribe", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const success = await storage.unsubscribeNewsletter(email);
      if (!success) {
        return res.status(404).json({ message: "Email not found in newsletter" });
      }

      res.json({ message: "Successfully unsubscribed from newsletter" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/admin/newsletter/subscribers", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user || !user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const subscribers = await storage.getNewsletterSubscribers(true);
      res.json(subscribers);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ============ Product Tracking Endpoints ============
  app.post("/api/price-tracking", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { productId, targetPrice } = req.body;
      if (!productId) {
        return res.status(400).json({ message: "Product ID is required" });
      }

      const tracking = await storage.createPriceTracking({
        userId: user.id,
        productId,
        targetPrice,
      });

      res.json({ message: "Price tracking added", tracking });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/price-tracking", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const tracking = await storage.getUserPriceTracking(user.id);
      res.json(tracking);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/price-tracking/:id", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const success = await storage.removePriceTracking(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Price tracking not found" });
      }

      res.json({ message: "Price tracking removed" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ============ Recently Viewed Products Endpoints ============
  app.post("/api/viewed-products", async (req, res) => {
    try {
      const user = (req as any).user;
      const { productId, sessionId } = req.body;

      if (!productId) {
        return res.status(400).json({ message: "Product ID is required" });
      }

      const viewed = await storage.trackViewedProduct({
        userId: user?.id,
        sessionId,
        productId,
      });

      res.json({ message: "Product view tracked", viewed });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/viewed-products", async (req, res) => {
    try {
      const user = (req as any).user;
      const sessionId = (req.query.sessionId as string) || undefined;
      const limit = parseInt(req.query.limit as string) || 10;

      const viewedProducts = await storage.getRecentlyViewed(
        user?.id,
        sessionId,
        limit
      );
      res.json(viewedProducts);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ============ Abandoned Cart Recovery Endpoints ============
  app.get("/api/admin/abandoned-carts", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user || !user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Get all carts and filter for abandoned ones (no orders from user in last 24 hours)
      const allUsers = await storage.getAllUsers();
      const abandonedCarts = [];
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      for (const customer of allUsers) {
        const orders = await storage.getOrdersByUserId(customer.id);
        const hasRecentOrder = orders.some(o => o.createdAt > oneDayAgo);
        
        if (!hasRecentOrder && orders.length > 0) {
          // Simulate abandoned cart data - in production, track actual carts
          const lastOrder = orders[orders.length - 1];
          abandonedCarts.push({
            id: `cart-${customer.id}`,
            userId: customer.id,
            userEmail: customer.email,
            userName: customer.name,
            cartItems: lastOrder.items.map(item => ({
              productId: item.productId,
              name: `Product ${item.productId}`,
              quantity: item.quantity,
              price: item.price,
            })),
            cartValue: lastOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            abandonedAt: lastOrder.createdAt,
            reminderSentAt: undefined,
            recovered: false,
          });
        }
      }

      res.json(abandonedCarts);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/admin/abandoned-carts/:cartId/send-reminder", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user || !user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      // In production, send actual email via emailService
      res.json({ message: "Reminder email sent successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/admin/abandoned-carts/send-all-reminders", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user || !user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      // In production, send bulk emails
      res.json({ message: "All reminders sent", count: 5 });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ============ Customer Analytics Endpoints ============
  app.get("/api/admin/customer-analytics", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user || !user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const allUsers = await storage.getAllUsers();
      const allOrders = await storage.getAllOrders();

      // Calculate metrics
      let totalLTV = 0;
      const customerLTVs: Record<string, number> = {};

      for (const order of allOrders) {
        const orderTotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        totalLTV += orderTotal;
        customerLTVs[order.userId] = (customerLTVs[order.userId] || 0) + orderTotal;
      }

      const averageLTV = allUsers.length > 0 ? totalLTV / allUsers.length : 0;
      
      // Calculate repeat purchase rate
      const customerOrderCounts = allOrders.reduce((acc: Record<string, number>, order) => {
        acc[order.userId] = (acc[order.userId] || 0) + 1;
        return acc;
      }, {});

      const repeatCustomers = Object.values(customerOrderCounts).filter(count => count > 1).length;
      const repeatCustomersRate = allUsers.length > 0 ? (repeatCustomers / allUsers.length) * 100 : 0;

      // Create segments
      const segments = [
        {
          name: "Bronze",
          count: Object.values(customerLTVs).filter(ltv => ltv < 100).length,
          avgLTV: 50,
          avgOrderValue: 25,
          repeatPurchaseRate: 10,
        },
        {
          name: "Silver",
          count: Object.values(customerLTVs).filter(ltv => ltv >= 100 && ltv < 500).length,
          avgLTV: 300,
          avgOrderValue: 75,
          repeatPurchaseRate: 40,
        },
        {
          name: "Gold",
          count: Object.values(customerLTVs).filter(ltv => ltv >= 500 && ltv < 1000).length,
          avgLTV: 750,
          avgOrderValue: 150,
          repeatPurchaseRate: 70,
        },
        {
          name: "Platinum",
          count: Object.values(customerLTVs).filter(ltv => ltv >= 1000).length,
          avgLTV: 2000,
          avgOrderValue: 300,
          repeatPurchaseRate: 90,
        },
      ];

      // LTV trend (mock)
      const ltv_trend = Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        value: Math.floor(Math.random() * 1000) + 500,
      }));

      // Customer age distribution (mock)
      const customerAgeDistribution = [
        { range: "18-24", count: 10 },
        { range: "25-34", count: 25 },
        { range: "35-44", count: 20 },
        { range: "45-54", count: 15 },
        { range: "55+", count: 8 },
      ];

      res.json({
        totalCustomers: allUsers.length,
        activeCustomers: Math.floor(allUsers.length * 0.7),
        averageLTV,
        totalLTV,
        repeatCustomersRate,
        segments,
        ltv_trend,
        customerAgeDistribution,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ============ Two-Factor Authentication Endpoints ============
  app.post("/api/auth/2fa/sms/enable", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) return res.status(401).json({ message: "Not authenticated" });
      
      // In production, send SMS via Twilio
      res.json({ message: "SMS 2FA enabled, verification code sent" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/2fa/authenticator/enable", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) return res.status(401).json({ message: "Not authenticated" });
      
      // In production, generate TOTP secret
      const secret = "JBSWY3DPEBLW64TMMQ====";
      res.json({ secret, message: "Setup authenticator app" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/2fa/:method/verify", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) return res.status(401).json({ message: "Not authenticated" });
      
      res.json({ message: "2FA verified successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/2fa/disable", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) return res.status(401).json({ message: "Not authenticated" });
      
      res.json({ message: "2FA disabled" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ============ Referral Program Endpoints ============
  app.get("/api/user/referral", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) return res.status(401).json({ message: "Not authenticated" });
      
      res.json({
        referralCode: `REF${user.id.slice(0, 8).toUpperCase()}`,
        successfulReferrals: 3,
        totalRewards: 30,
        referredEmails: ["friend1@example.com", "friend2@example.com"],
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/referral/send-invite", async (req, res) => {
    try {
      const { email } = req.body;
      // In production, send email with referral link
      res.json({ message: "Invite sent successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ============ Gift Cards Endpoints ============
  app.get("/api/gift-cards", async (req, res) => {
    try {
      const user = (req as any).user;
      res.json([
        {
          id: "gc1",
          code: "GIFT-ABC123",
          amount: 50,
          balance: 25,
          recipientEmail: "recipient@example.com",
          status: "active",
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/gift-cards/create", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) return res.status(401).json({ message: "Not authenticated" });
      
      const { amount, recipientEmail } = req.body;
      const giftCard = {
        id: `gc-${Date.now()}`,
        code: `GIFT-${Math.random().toString(36).substring(7).toUpperCase()}`,
        amount,
        balance: amount,
        recipientEmail,
        status: "active",
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      };
      res.json(giftCard);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/gift-cards/redeem", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) return res.status(401).json({ message: "Not authenticated" });
      
      res.json({ amount: 25, message: "Gift card redeemed successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ============ Email Marketing Endpoints ============
  app.get("/api/admin/email-campaigns", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user || !user.isAdmin) return res.status(403).json({ message: "Admin access required" });
      
      res.json([
        {
          id: "camp1",
          name: "Welcome Series",
          type: "post-purchase",
          status: "active",
          recipientCount: 1250,
          sentCount: 1200,
          openRate: 35.5,
          clickRate: 8.2,
          lastSent: new Date().toISOString(),
        },
      ]);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ============ Wishlist Sharing Endpoints ============
  app.post("/api/wishlist/share", async (req, res) => {
    try {
      const user = (req as any).user;
      const { wishlistId, recipientEmail } = req.body;
      // In production, send email with wishlist link
      res.json({ message: "Wishlist shared successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ============ Sitemap Endpoints ============
  app.get("/api/sitemap.xml", async (req, res) => {
    try {
      res.set("Content-Type", "application/xml");
      const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://axosshop.com/</loc></url>
  <url><loc>https://axosshop.com/products</loc></url>
  <url><loc>https://axosshop.com/about</loc></url>
  <url><loc>https://axosshop.com/contact</loc></url>
</urlset>`;
      res.send(sitemapXml);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ============ Password Reset Endpoints ============
  // Request password reset - sends token via email (mocked for now)
  app.post("/api/auth/password-reset-request", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if user exists for security
        return res.json({ message: "If the email exists, you will receive password reset instructions" });
      }

      // Generate a simple reset token (in production, use crypto.randomBytes and store expiration)
      const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      // In production, store token with expiration in database
      // For now, we'll just log it and return success
      console.log(`Password reset token for ${email}: ${resetToken}`);
      
      // Send email with reset link containing token
      const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/password-reset?token=${resetToken}&email=${encodeURIComponent(email)}`;
      await emailService.sendPasswordResetEmail(email, resetToken, resetLink);

      res.json({ message: "If the email exists, you will receive password reset instructions" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Confirm password reset - validate token and update password
  app.post("/api/auth/password-reset-confirm", async (req, res) => {
    try {
      const { email, token, newPassword } = req.body;
      
      if (!email || !token || !newPassword) {
        return res.status(400).json({ message: "Email, token, and new password are required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      // In production, validate token and expiration from database
      // For now, accept any token for demo purposes
      if (!token || token.length < 10) {
        return res.status(400).json({ message: "Invalid reset token" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const updatedUser = await storage.updateUser(user.id, { password: hashedPassword });
      
      // Send confirmation email
      await emailService.sendEmail(
        email,
        "Password Reset Successful",
        `Your password has been reset successfully. You can now log in with your new password.`,
        `<h2>Password Reset Successful</h2>
         <p>Your password has been reset successfully. You can now log in with your new password.</p>
         <p>If you did not request this change, please contact our support team immediately.</p>`
      );
      
      const { password, ...userWithoutPassword } = updatedUser;
      res.json({ message: "Password reset successfully", user: userWithoutPassword });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Image upload endpoint
  app.post("/api/upload-image", async (req, res) => {
    try {
      const { file, filename, productId } = req.body;
      
      if (!file || !filename) {
        return res.status(400).json({ message: "File and filename are required" });
      }

      // Validate file size (max 5MB)
      const base64Data = file.split(',')[1] || file;
      const sizeInBytes = Buffer.byteLength(base64Data, 'base64');
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (sizeInBytes > maxSize) {
        return res.status(400).json({ message: `File size exceeds 5MB limit. Current: ${(sizeInBytes / 1024 / 1024).toFixed(2)}MB` });
      }

      // Validate file type (images only)
      const validMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const mimeType = file.split(';')[0].replace('data:', '');
      
      if (!validMimeTypes.includes(mimeType)) {
        return res.status(400).json({ message: "Only JPEG, PNG, GIF, and WebP images are allowed" });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(7);
      const ext = filename.split('.').pop() || 'jpg';
      const uniqueFilename = `${timestamp}-${random}.${ext}`;
      const imagePath = `/uploads/${uniqueFilename}`;

      // For production, you would save to S3/cloud storage here
      // For now, return a data URL or path for the image
      const imageUrl = file.startsWith('data:') ? file : `data:${mimeType};base64,${file}`;

      // If productId provided, update the product with the new image
      if (productId) {
        const product = await storage.getProduct(productId);
        if (!product) {
          return res.status(404).json({ message: "Product not found" });
        }

        // Update product with new image URL
        const updatedProduct = await storage.updateProduct(productId, {
          ...product,
          imageUrl: imageUrl
        });

        return res.json({
          success: true,
          imageUrl: imageUrl,
          filename: uniqueFilename,
          productId: productId,
          product: updatedProduct
        });
      }

      // Return image data if no productId
      res.json({
        success: true,
        imageUrl: imageUrl,
        filename: uniqueFilename,
        path: imagePath,
        message: "Image uploaded successfully"
      });
    } catch (error: any) {
      console.error("Image upload error:", error);
      res.status(400).json({ message: error.message || "Image upload failed" });
    }
  });

  // Get product images endpoint
  app.get("/api/products/:id/images", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json({
        productId: product.id,
        productName: product.name,
        mainImage: product.imageUrl,
        // In future, could store multiple images in product.galleryImages
        gallery: [product.imageUrl]
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // WebSocket status endpoint
  app.get("/api/ws/stats", (req, res) => {
    if (wsManager) {
      res.json({
        websocketEnabled: true,
        stats: wsManager.getStats()
      });
    } else {
      res.json({
        websocketEnabled: false,
        stats: null
      });
    }
  });

  // Discord status endpoint
  app.get("/api/discord/status", (req, res) => {
    const discordStatus = discordService.getStatus();
    res.json({
      discordEnabled: discordStatus.enabled,
      isInitialized: discordStatus.isInitialized,
      botName: discordStatus.botName
    });
  });

  // ============ PayPal Endpoints ============

  // PayPal - Create order
  app.post("/api/paypal/create-order", async (req, res) => {
    try {
      const { amount, orderId, email, firstName, lastName, address, city, state, zip } = req.body;

      if (!amount || !email) {
        return res.status(400).json({ message: "Amount and email are required" });
      }

      const paypalOrder = await createPayPalOrder(amount, "USD", `AxosShop Order ${orderId}`, {
        orderId,
        email,
        firstName,
        lastName,
        address,
        city,
        state,
        zip,
      });

      res.json({ orderId: paypalOrder.orderId });
    } catch (error: any) {
      console.error("Error creating PayPal order:", error);
      res.status(400).json({ message: error.message || "Failed to create PayPal order" });
    }
  });

  // PayPal - Capture order (complete payment)
  app.post("/api/paypal/capture-order", async (req, res) => {
    try {
      const { orderId } = req.body;

      if (!orderId) {
        return res.status(400).json({ message: "Order ID is required" });
      }

      const capture = await capturePayPalOrder(orderId);
      const captureId = capture.purchaseUnits?.[0]?.payments?.captures?.[0]?.id || orderId;

      res.json({
        success: true,
        captureId,
        status: capture.status,
        orderId: capture.orderId,
      });
    } catch (error: any) {
      console.error("Error capturing PayPal order:", error);
      res.status(400).json({ message: error.message || "Failed to capture payment" });
    }
  });

  // PayPal - Get order details
  app.get("/api/paypal/order/:orderId", async (req, res) => {
    try {
      const { orderId } = req.params;

      if (!orderId) {
        return res.status(400).json({ message: "Order ID is required" });
      }

      const order = await getPayPalOrderDetails(orderId);
      res.json(order);
    } catch (error: any) {
      console.error("Error getting PayPal order details:", error);
      res.status(400).json({ message: error.message });
    }
  });

  // PayPal - Refund capture
  app.post("/api/paypal/refund/:captureId", async (req, res) => {
    try {
      const { captureId } = req.params;
      const { amount } = req.body;

      if (!captureId) {
        return res.status(400).json({ message: "Capture ID is required" });
      }

      const refund = await refundPayPalCapture(captureId, amount);
      res.json({
        success: true,
        refundId: refund.refundId,
        status: refund.status,
      });
    } catch (error: any) {
      console.error("Error refunding PayPal capture:", error);
      res.status(400).json({ message: error.message });
    }
  });

  // PayPal - Create payout batch for sellers
  app.post("/api/paypal/payout", async (req, res) => {
    try {
      const { payoutItems } = req.body;

      if (!payoutItems || !Array.isArray(payoutItems)) {
        return res.status(400).json({ message: "Payout items array is required" });
      }

      const payout = await createPayPalPayout(payoutItems);
      res.json({
        success: true,
        batchId: payout.batchId,
        status: payout.status,
      });
    } catch (error: any) {
      console.error("Error creating PayPal payout:", error);
      res.status(400).json({ message: error.message });
    }
  });

  // PayPal - Get payout batch status
  app.get("/api/paypal/payout/:batchId", async (req, res) => {
    try {
      const { batchId } = req.params;

      if (!batchId) {
        return res.status(400).json({ message: "Batch ID is required" });
      }

      const batch = await getPayoutBatchStatus(batchId);
      res.json(batch);
    } catch (error: any) {
      console.error("Error getting PayPal payout status:", error);
      res.status(400).json({ message: error.message });
    }
  });

  // ============ Manual Transactions (Bank Transfer, Cash, Check, etc.) ============

  // Create manual transaction
  app.post("/api/transactions/manual", async (req, res) => {
    try {
      const { orderId, amount, paymentMethod, notes } = req.body;

      if (!orderId || !amount || !paymentMethod) {
        return res.status(400).json({ 
          message: "orderId, amount, and paymentMethod are required" 
        });
      }

      const transaction = await createManualTransaction(orderId, amount, paymentMethod, notes);
      res.json({ 
        success: true, 
        transaction 
      });
    } catch (error: any) {
      console.error("Error creating manual transaction:", error);
      res.status(400).json({ message: error.message });
    }
  });

  // Complete manual transaction (mark as paid)
  app.post("/api/transactions/manual/:transactionId/complete", async (req, res) => {
    try {
      const { transactionId } = req.params;
      const { processedBy } = req.body;

      if (!transactionId) {
        return res.status(400).json({ message: "Transaction ID is required" });
      }

      const transaction = await completeManualTransaction(transactionId, processedBy);
      res.json({ 
        success: true, 
        transaction 
      });
    } catch (error: any) {
      console.error("Error completing transaction:", error);
      res.status(400).json({ message: error.message });
    }
  });

  // Fail manual transaction
  app.post("/api/transactions/manual/:transactionId/fail", async (req, res) => {
    try {
      const { transactionId } = req.params;
      const { reason } = req.body;

      if (!transactionId) {
        return res.status(400).json({ message: "Transaction ID is required" });
      }

      const transaction = await failManualTransaction(transactionId, reason || "Payment failed");
      res.json({ 
        success: true, 
        transaction 
      });
    } catch (error: any) {
      console.error("Error failing transaction:", error);
      res.status(400).json({ message: error.message });
    }
  });

  // Refund manual transaction
  app.post("/api/transactions/manual/:transactionId/refund", async (req, res) => {
    try {
      const { transactionId } = req.params;
      const { refundAmount } = req.body;

      if (!transactionId) {
        return res.status(400).json({ message: "Transaction ID is required" });
      }

      const transaction = await refundManualTransaction(transactionId, refundAmount);
      res.json({ 
        success: true, 
        transaction 
      });
    } catch (error: any) {
      console.error("Error refunding transaction:", error);
      res.status(400).json({ message: error.message });
    }
  });

  // Get transaction details
  app.get("/api/transactions/manual/:transactionId", async (req, res) => {
    try {
      const { transactionId } = req.params;

      if (!transactionId) {
        return res.status(400).json({ message: "Transaction ID is required" });
      }

      const transaction = await getManualTransaction(transactionId);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      res.json(transaction);
    } catch (error: any) {
      console.error("Error getting transaction:", error);
      res.status(400).json({ message: error.message });
    }
  });

  // Get all transactions for an order
  app.get("/api/orders/:orderId/transactions", async (req, res) => {
    try {
      const { orderId } = req.params;

      if (!orderId) {
        return res.status(400).json({ message: "Order ID is required" });
      }

      const transactions = await getOrderTransactions(orderId);
      res.json({ transactions });
    } catch (error: any) {
      console.error("Error getting order transactions:", error);
      res.status(400).json({ message: error.message });
    }
  });

  // Get transaction summary (dashboard stats)
  app.get("/api/transactions/summary", async (req, res) => {
    try {
      const { status, paymentMethod, startDate, endDate } = req.query;

      const summary = await getTransactionSummary({
        status: status as string,
        paymentMethod: paymentMethod as string,
        startDate: startDate as string,
        endDate: endDate as string,
      });

      res.json(summary);
    } catch (error: any) {
      console.error("Error getting transaction summary:", error);
      res.status(400).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  
  // Initialize WebSocket manager
  wsManager = new WebSocketManager(httpServer);
  console.log("[WebSocket] Manager initialized");

  return httpServer;
}
