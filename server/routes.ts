// Improved by Python11235:)
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, loginSchema, insertProductSchema, insertOrderSchema, insertOrderItemSchema } from "@shared/schema";
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

  // Stripe payment routes - ENHANCED VERSION
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { items } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "No items in cart" });
      }

      const SIZE_PRICE_MULTIPLIERS: Record<string, number> = {
        // Clothing sizes
        "XS": 0.9,
        "S": 0.95,
        "M": 1.0,
        "L": 1.1,
        "XL": 1.2,
        "XXL": 1.3,
        // Bag sizes
        "S": 0.85,
        "M": 1.0,
        "L": 1.15,
        // Plushie sizes
        "6x6": 1.0,
        "9x9": 1.35,
      };

      const calculateItemPrice = (basePrice: number, size?: string): number => {
        if (!size) return basePrice;
        const multiplier = SIZE_PRICE_MULTIPLIERS[size] || 1.0;
        return basePrice * multiplier;
      };

      let totalAmount = 0;
      const orderItems = [];

      // Calculate total and validate items
      for (const item of items) {
        const product = await storage.getProduct(item.productId);
        if (!product) {
          return res.status(404).json({ message: `Product ${item.productId} not found` });
        }
        if (item.quantity > product.stock) {
          return res.status(400).json({ 
            message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}` 
          });
        }

        const itemPrice = calculateItemPrice(parseFloat(product.price), item.size);
        const itemTotal = itemPrice * item.quantity;
        totalAmount += itemTotal;

        orderItems.push({
          productId: product.id,
          productName: product.name,
          quantity: item.quantity,
          price: itemPrice,
          size: item.size,
          total: itemTotal
        });
      }

      // Ensure minimum amount for Stripe
      if (totalAmount < 0.5) {
        totalAmount = 0.5; // Stripe minimum
      }

      if (!stripe) {
        // Mock payment intent for development without valid Stripe key
        console.log("Using mock Stripe payment intent for development");
        const mockClientSecret = "pi_mock_" + Math.random().toString(36).substr(2, 24) + "_secret_" + Math.random().toString(36).substr(2, 24);
        
        return res.json({
          clientSecret: mockClientSecret,
          amount: totalAmount,
          orderItems,
          isMock: true
        });
      }

      // Real Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalAmount * 100), // Convert to cents
        currency: "usd",
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          items_count: items.length.toString(),
          total_items: items.reduce((sum, item) => sum + item.quantity, 0).toString()
        },
      });

      console.log(`Created Stripe payment intent: ${paymentIntent.id} for amount: $${totalAmount}`);

      res.json({
        clientSecret: paymentIntent.client_secret,
        amount: totalAmount,
        orderItems,
        paymentIntentId: paymentIntent.id
      });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ 
        message: error.message || "Failed to create payment intent",
        details: error.type || "Unknown error"
      });
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

  const httpServer = createServer(app);
  return httpServer;
}
