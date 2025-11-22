import type { User, InsertUser, Product, InsertProduct, Order, InsertOrder, OrderItem, InsertOrderItem, BlogPost, InsertBlogPost } from "@shared/schema";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import { syncProduct, deleteProductFromRender } from "./sync";

const DATA_FILE = path.resolve(import.meta.dirname, "../data.json");

interface StorageData {
  users: Record<string, User>;
  products: Record<string, Product>;
  orders: Record<string, Order>;
  orderItems: Record<string, OrderItem>;
  blogPosts: Record<string, BlogPost>;
}

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  makeAdmin(userId: string): Promise<User | undefined>;
  
  // Product methods
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: InsertProduct): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  toggleProductActive(id: string, isActive: boolean): Promise<Product | undefined>;
  
  // Order methods
  createOrder(order: InsertOrder): Promise<Order>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  
  // Blog methods
  getBlogPosts(): Promise<BlogPost[]>;
  getBlogPost(id: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  deleteBlogPost(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private data: StorageData;

  constructor() {
    this.data = this.loadData();
    if (Object.keys(this.data.products).length === 0) {
      this.seedProducts();
    }
    // Seed default admin user if no users exist
    if (Object.keys(this.data.users).length === 0) {
      this.seedAdminUser();
    }
  }

  private loadData(): StorageData {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const content = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(content);
      }
    } catch (error) {
      console.error('Error loading data file:', error);
    }
    return {
      users: {},
      products: {},
      orders: {},
      orderItems: {},
      blogPosts: {},
    };
  }

  private saveData(): void {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error saving data file:', error);
    }
  }

  private seedProducts() {
    const productData = [
      {
        name: "Purple Axolotl T-Shirt",
        description: "Comfortable cotton t-shirt featuring our iconic purple axolotl mascot with that legendary Minecraft-inspired pixelated texture.",
        price: "24.99",
        imageUrl: "/attached_assets/product-tshirt-purple-axolotl_1762939234255.png",
        stock: 50,
        isActive: true,
        category: "tshirt",
        availableSizes: JSON.stringify(["XS", "S", "M", "L", "XL", "XXL"]),
      },
      {
        name: "Purple Axolotl Hoodie",
        description: "Cozy hoodie with a bold purple axolotl design. Perfect for staying warm while showing off your axolotl love!",
        price: "44.99",
        imageUrl: "/attached_assets/product-hoodie-purple-axolotl_1762939234254.png",
        stock: 30,
        isActive: true,
        category: "hoodie",
        availableSizes: JSON.stringify(["XS", "S", "M", "L", "XL", "XXL"]),
      },
      {
        name: "Purple Axolotl Mug",
        description: "Start your day right with this adorable purple axolotl ceramic mug. Dishwasher and microwave safe.",
        price: "14.99",
        imageUrl: "/attached_assets/product-mug-purple-axolotl_1762939234252.png",
        stock: 100,
        isActive: true,
        category: "mug",
        availableSizes: JSON.stringify([]),
      },
      {
        name: "Purple Axolotl Plushie",
        description: "Soft and cuddly purple axolotl plushie. Available in 6x6 inches or 9x9 inches!",
        price: "29.99",
        imageUrl: "/attached_assets/product-plushie-purple-axolotl_1762939234260.png",
        stock: 25,
        isActive: true,
        category: "plushie",
        availableSizes: JSON.stringify(["6x6", "9x9"]),
      },
      {
        name: "Purple Axolotl Tote Bag",
        description: "Eco-friendly canvas tote bag featuring the purple axolotl design. Great for shopping or everyday use.",
        price: "19.99",
        imageUrl: "/attached_assets/product-totebag-purple-axolotl_1762939234250.png",
        stock: 40,
        isActive: true,
        category: "bag",
        availableSizes: JSON.stringify(["S", "M", "L"]),
      },
      {
        name: "Purple Axolotl Stickers",
        description: "Pack of 5 waterproof vinyl stickers with various purple axolotl designs. Perfect for laptops, water bottles, and more!",
        price: "9.99",
        imageUrl: "/attached_assets/product-stickers-purple-axolotl_1762939234253.png",
        stock: 200,
        isActive: true,
        category: "stickers",
        availableSizes: JSON.stringify([]),
      },
      {
        name: "Purple Axolotl Phone Case",
        description: "Durable phone case with purple axolotl artwork. Available for most popular phone models.",
        price: "19.99",
        imageUrl: "/attached_assets/product-phonecase-purple-axolotl_1762939234259.png",
        stock: 60,
        isActive: true,
        category: "phone_case",
        availableSizes: JSON.stringify([]),
      },
    ];

    productData.forEach((data) => {
      const id = randomUUID();
      const product: Product = { ...data, id };
      this.data.products[id] = product;
    });
    this.saveData();
  }

  private seedAdminUser() {
    const id = randomUUID();
    // Hash password synchronously
    const hashedPassword = bcrypt.hashSync("admin123", 10);
    const adminUser: User = {
      id,
      email: "admin@axosshop.com",
      password: hashedPassword,
      name: "Admin",
      isAdmin: true,
      createdAt: new Date().toISOString(),
    };
    this.data.users[id] = adminUser;
    this.saveData();
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.data.users[id];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Object.values(this.data.users).find((user) => user.email === email);
  }

  async getAllUsers(): Promise<User[]> {
    return Object.values(this.data.users);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      isAdmin: false,
      createdAt: new Date().toISOString(),
    };
    this.data.users[id] = user;
    this.saveData();
    return user;
  }

  async makeAdmin(userId: string): Promise<User | undefined> {
    const user = this.data.users[userId];
    if (!user) return undefined;
    
    const updated = { ...user, isAdmin: true };
    this.data.users[userId] = updated;
    this.saveData();
    return updated;
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    return Object.values(this.data.products);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.data.products[id];
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = { ...insertProduct, id };
    this.data.products[id] = product;
    this.saveData();
    // Sync to Render
    await syncProduct(product);
    return product;
  }

  async updateProduct(id: string, insertProduct: InsertProduct): Promise<Product | undefined> {
    const existing = this.data.products[id];
    if (!existing) return undefined;
    
    const product: Product = { ...insertProduct, id };
    this.data.products[id] = product;
    this.saveData();
    // Sync to Render
    await syncProduct(product);
    return product;
  }

  async deleteProduct(id: string): Promise<boolean> {
    if (id in this.data.products) {
      delete this.data.products[id];
      this.saveData();
      // Sync deletion to Render
      await deleteProductFromRender(id);
      return true;
    }
    return false;
  }

  async toggleProductActive(id: string, isActive: boolean): Promise<Product | undefined> {
    const product = this.data.products[id];
    if (!product) return undefined;
    
    const updated = { ...product, isActive };
    this.data.products[id] = updated;
    this.saveData();
    // Sync to Render
    await syncProduct(updated);
    return updated;
  }

  // Order methods
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const order: Order = {
      ...insertOrder,
      id,
      createdAt: new Date().toISOString(),
    };
    this.data.orders[id] = order;
    this.saveData();
    return order;
  }

  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const id = randomUUID();
    const orderItem: OrderItem = { ...insertOrderItem, id };
    this.data.orderItems[id] = orderItem;
    this.saveData();
    return orderItem;
  }

  // Blog methods
  async getBlogPosts(): Promise<BlogPost[]> {
    return Object.values(this.data.blogPosts).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getBlogPost(id: string): Promise<BlogPost | undefined> {
    return this.data.blogPosts[id];
  }

  async createBlogPost(insertPost: InsertBlogPost): Promise<BlogPost> {
    const id = randomUUID();
    const post: BlogPost = {
      ...insertPost,
      id,
      createdAt: new Date().toISOString(),
    };
    this.data.blogPosts[id] = post;
    this.saveData();
    return post;
  }

  async deleteBlogPost(id: string): Promise<boolean> {
    if (id in this.data.blogPosts) {
      delete this.data.blogPosts[id];
      this.saveData();
      return true;
    }
    return false;
  }
}

export const storage = new MemStorage();
