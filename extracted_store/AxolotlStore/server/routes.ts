import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { insertProductSchema, insertOrderSchema, insertOrderItemSchema } from "@shared/schema";

// Use direct paths to images
const toteBagImage = "/attached_assets/product-totebag-purple-axolotl_1762939234250.png";
const mugImage = "/attached_assets/product-mug-purple-axolotl_1762939234252.png";
const stickersImage = "/attached_assets/product-stickers-purple-axolotl_1762939234253.png";
const hoodieImage = "/attached_assets/product-hoodie-purple-axolotl_1762939234254.png";
const tshirtImage = "/attached_assets/product-tshirt-purple-axolotl_1762939234255.png";
const phoneCaseImage = "/attached_assets/product-phonecase-purple-axolotl_1762939234259.png";
const plushieImage = "/attached_assets/product-plushie-purple-axolotl_1762939234260.png";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing required Stripe secret: STRIPE_SECRET_KEY");
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-11-20.acacia",
});

// Initialize with sample products
async function initializeProducts() {
  const products = await storage.getProducts();
  if (products.length === 0) {
    const sampleProducts = [
      {
        name: "Purple Axolotl Tote Bag",
        description: "Spacious tote bag featuring the adorable sleeping purple axolotl with pixelated texture. Perfect for carrying all your essentials!",
        price: "24.99",
        imageUrl: toteBagImage,
        stock: 50,
        isActive: true,
      },
      {
        name: "Purple Axolotl Mug",
        description: "Start your day with this cute purple axolotl ceramic mug. Microwave and dishwasher safe!",
        price: "16.99",
        imageUrl: mugImage,
        stock: 100,
        isActive: true,
      },
      {
        name: "Purple Axolotl Sticker Pack",
        description: "6 different adorable purple axolotl stickers with various expressions. Perfect for laptops, water bottles, and more!",
        price: "8.99",
        imageUrl: stickersImage,
        stock: 200,
        isActive: true,
      },
      {
        name: "Purple Axolotl Hoodie",
        description: "Cozy premium hoodie with embroidered purple axolotl design. Soft, warm, and perfect for axolotl fans!",
        price: "49.99",
        imageUrl: hoodieImage,
        stock: 30,
        isActive: true,
      },
      {
        name: "Purple Axolotl T-Shirt",
        description: "Comfortable cotton t-shirt featuring the magical purple axolotl. Available in unisex sizing.",
        price: "24.99",
        imageUrl: tshirtImage,
        stock: 75,
        isActive: true,
      },
      {
        name: "Purple Axolotl Phone Case",
        description: "Protect your phone with this adorable purple axolotl case. Durable and lightweight with hearts design!",
        price: "19.99",
        imageUrl: phoneCaseImage,
        stock: 60,
        isActive: true,
      },
      {
        name: "Purple Axolotl Plushie",
        description: "Super soft and huggable purple axolotl plushie. The perfect companion for any axolotl enthusiast!",
        price: "34.99",
        imageUrl: plushieImage,
        stock: 40,
        isActive: true,
      },
    ];

    for (const product of sampleProducts) {
      await storage.createProduct(product);
    }
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize sample products
  await initializeProducts();

  // Get all products
  app.get("/api/products", async (_req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching products: " + error.message });
    }
  });

  // Get single product
  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching product: " + error.message });
    }
  });

  // Create product
  app.post("/api/products", async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error: any) {
      res.status(400).json({ message: "Error creating product: " + error.message });
    }
  });

  // Update product
  app.patch("/api/products/:id", async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.updateProduct(req.params.id, validatedData);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ message: "Error updating product: " + error.message });
    }
  });

  // Toggle product active status
  app.patch("/api/products/:id/toggle", async (req, res) => {
    try {
      const { isActive } = req.body;
      if (typeof isActive !== "boolean") {
        return res.status(400).json({ message: "isActive must be a boolean" });
      }
      const product = await storage.toggleProductActive(req.params.id, isActive);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ message: "Error toggling product: " + error.message });
    }
  });

  // Delete product
  app.delete("/api/products/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteProduct(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: "Error deleting product: " + error.message });
    }
  });

  // Stripe payment route for one-time payments
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { items } = req.body;
      
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Cart items are required" });
      }

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

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(total * 100), // Convert to cents
        currency: "usd",
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          itemCount: items.length,
        },
      });

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        amount: total,
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Create order
  app.post("/api/orders", async (req, res) => {
    try {
      const { order, items } = req.body;
      
      const validatedOrder = insertOrderSchema.parse(order);
      const createdOrder = await storage.createOrder(validatedOrder);

      for (const item of items) {
        const validatedItem = insertOrderItemSchema.parse({
          ...item,
          orderId: createdOrder.id,
        });
        await storage.createOrderItem(validatedItem);
      }

      res.status(201).json(createdOrder);
    } catch (error: any) {
      res.status(400).json({ message: "Error creating order: " + error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
