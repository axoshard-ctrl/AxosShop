import type { User, InsertUser, Product, InsertProduct, Order, InsertOrder, OrderItem, InsertOrderItem, BlogPost, InsertBlogPost, ProductReview, InsertProductReview, Coupon, InsertCoupon, RestockNotification, InsertRestockNotification, SearchHistory, InsertSearchHistory, UserAddress, InsertUserAddress, OrderStatusHistory, InsertOrderStatusHistory, ReviewModeration, InsertReviewModeration, GuestCheckoutSession, InsertGuestCheckoutSession, AnalyticsEvent, InsertAnalyticsEvent } from "@shared/schema";
import { randomUUID } from "crypto";
import { syncProductReview, deleteProductReviewFromRender } from "./sync";
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import { syncProduct, deleteProductFromRender, syncBlogPost, deleteBlogPostFromRender } from "./sync";

const DATA_FILE = path.resolve(import.meta.dirname, "../data.json");

interface StorageData {
  users: Record<string, User>;
  products: Record<string, Product>;
  orders: Record<string, Order>;
  orderItems: Record<string, OrderItem>;
  blogPosts: Record<string, BlogPost>;
  productReviews: Record<string, ProductReview>;
  coupons: Record<string, Coupon>;
  restockNotifications: Record<string, RestockNotification>;
  searchHistory: Record<string, SearchHistory>;
  userAddresses: Record<string, UserAddress>;
  orderStatusHistory: Record<string, OrderStatusHistory>;
  reviewModerations: Record<string, ReviewModeration>;
  guestCheckoutSessions: Record<string, GuestCheckoutSession>;
  analyticsEvents: Record<string, AnalyticsEvent>;
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
  getOrdersByUserId(userId: string): Promise<(Order & { items: OrderItem[] })[]>;
  getAllOrders(): Promise<(Order & { items: OrderItem[] })[]>;
  getOrder(id: string): Promise<(Order & { items: OrderItem[] }) | undefined>;
  updateOrder(id: string, updates: Partial<Order>): Promise<Order | undefined>;
  getUserWishlist(userId: string): Promise<string[] | undefined>;
  
  // Blog methods
  getBlogPosts(): Promise<BlogPost[]>;
  getBlogPost(id: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  deleteBlogPost(id: string): Promise<boolean>;
  
  // Review methods
  getProductReviews(productId: string): Promise<ProductReview[]>;
  createProductReview(review: InsertProductReview): Promise<ProductReview>;
  deleteProductReview(id: string): Promise<boolean>;
  
  // Coupon methods
  getCoupon(code: string): Promise<Coupon | undefined>;
  createCoupon(coupon: InsertCoupon): Promise<Coupon>;
  useCoupon(code: string): Promise<boolean>;
  getAllCoupons(): Promise<Coupon[]>;
  updateCoupon(id: string, updates: Partial<InsertCoupon & { isActive: boolean }>): Promise<Coupon | undefined>;
  deleteCoupon(id: string): Promise<boolean>;

  // Restock Notification methods
  createRestockNotification(notification: InsertRestockNotification): Promise<RestockNotification>;
  getRestockNotifications(productId: string): Promise<RestockNotification[]>;
  getUnnotifiedRestockNotifications(): Promise<RestockNotification[]>;
  markRestockNotificationAsNotified(id: string): Promise<boolean>;
  deleteRestockNotification(id: string): Promise<boolean>;

  // Search History methods
  getSearchHistory(userId?: string, limit?: number): Promise<SearchHistory[]>;
  getSearchSuggestions(query: string, limit?: number): Promise<string[]>;
  createSearchHistory(userId: string | undefined, history: InsertSearchHistory): Promise<SearchHistory>;
  clearSearchHistory(userId?: string): Promise<boolean>;

  // User Address methods
  getUserAddresses(userId: string): Promise<UserAddress[]>;
  getUserAddress(id: string): Promise<UserAddress | undefined>;
  createUserAddress(address: InsertUserAddress): Promise<UserAddress>;
  updateUserAddress(id: string, address: Partial<InsertUserAddress>): Promise<UserAddress | undefined>;
  deleteUserAddress(id: string): Promise<boolean>;
  setDefaultUserAddress(userId: string, addressId: string): Promise<boolean>;

  // Order Status History methods
  createOrderStatusHistory(status: InsertOrderStatusHistory): Promise<OrderStatusHistory>;
  getOrderStatusHistory(orderId: string): Promise<OrderStatusHistory[]>;
  updateOrderStatus(orderId: string, status: InsertOrderStatusHistory): Promise<OrderStatusHistory>;

  // Review Moderation methods
  createReviewModeration(moderation: InsertReviewModeration): Promise<ReviewModeration>;
  getReviewModeration(reviewId: string): Promise<ReviewModeration | undefined>;
  updateReviewModeration(id: string, moderation: Partial<InsertReviewModeration>): Promise<ReviewModeration | undefined>;
  getReviewModerationQueue(status?: string): Promise<ReviewModeration[]>;

  // Guest Checkout Session methods
  createGuestCheckoutSession(session: InsertGuestCheckoutSession): Promise<GuestCheckoutSession>;
  getGuestCheckoutSession(sessionToken: string): Promise<GuestCheckoutSession | undefined>;
  deleteExpiredGuestSessions(): Promise<number>;

  // Analytics Event methods
  createAnalyticsEvent(event: InsertAnalyticsEvent): Promise<AnalyticsEvent>;
  getAnalyticsEvents(filters?: { eventType?: string; productId?: string; userId?: string; dateFrom?: string; dateTo?: string }): Promise<AnalyticsEvent[]>;
  getSalesStats(dateFrom?: string, dateTo?: string): Promise<{ totalRevenue: number; totalOrders: number; topProducts: Array<{ productId: string; name: string; count: number; revenue: number }> }>;
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
      productReviews: {},
      coupons: {},
      restockNotifications: {},
      searchHistory: {},
      userAddresses: {},
      orderStatusHistory: {},
      reviewModerations: {},
      guestCheckoutSessions: {},
      analyticsEvents: {},
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
        availableColors: JSON.stringify(["Black", "White", "Navy", "Gray", "Purple"]),
        discountType: null,
        discountValue: null,
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
        availableColors: JSON.stringify(["Black", "Navy", "Charcoal", "Heather Gray"]),
        discountType: null,
        discountValue: null,
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
        availableColors: JSON.stringify([]),
        discountType: null,
        discountValue: null,
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
        availableColors: JSON.stringify([]),
        discountType: null,
        discountValue: null,
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
        availableColors: JSON.stringify(["Natural", "Black", "Navy", "Gray"]),
        discountType: null,
        discountValue: null,
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
        availableColors: JSON.stringify([]),
        discountType: null,
        discountValue: null,
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
        availableColors: JSON.stringify([]),
        discountType: null,
        discountValue: null,
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
    const posts = this.data.blogPosts || {};
    return Object.values(posts).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getBlogPost(id: string): Promise<BlogPost | undefined> {
    return this.data.blogPosts?.[id];
  }

  async createBlogPost(insertPost: InsertBlogPost): Promise<BlogPost> {
    const id = randomUUID();
    const post: BlogPost = {
      ...insertPost,
      id,
      createdAt: new Date().toISOString(),
    };
    if (!this.data.blogPosts) {
      this.data.blogPosts = {};
    }
    this.data.blogPosts[id] = post;
    await this.saveData();
    await syncBlogPost(post);
    return post;
  }

  async deleteBlogPost(id: string): Promise<boolean> {
    if (this.data.blogPosts && id in this.data.blogPosts) {
      delete this.data.blogPosts[id];
      await this.saveData();
      await deleteBlogPostFromRender(id);
      return true;
    }
    return false;
  }

  // Review methods
  async getProductReviews(productId: string): Promise<ProductReview[]> {
    const reviews = this.data.productReviews || {};
    return Object.values(reviews)
      .filter((r) => r.productId === productId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createProductReview(insertReview: InsertProductReview): Promise<ProductReview> {
    const id = randomUUID();
    const review: ProductReview = {
      id,
      ...insertReview,
      createdAt: new Date().toISOString(),
    };
    if (!this.data.productReviews) {
      this.data.productReviews = {};
    }
    this.data.productReviews[id] = review;
    await this.saveData();
    
    // Sync review to Render
    syncProductReview(review).catch(err => console.error("Failed to sync review:", err));
    
    return review;
  }

  async deleteProductReview(id: string): Promise<boolean> {
    if (this.data.productReviews && id in this.data.productReviews) {
      delete this.data.productReviews[id];
      await this.saveData();
      
      // Sync deletion to Render
      deleteProductReviewFromRender(id).catch(err => console.error("Failed to sync review deletion:", err));
      
      return true;
    }
    return false;
  }

  // Coupon methods
  async getCoupon(code: string): Promise<Coupon | undefined> {
    const coupons = this.data.coupons || {};
    const coupon = Object.values(coupons).find((c) => c.code === code.toUpperCase());
    if (!coupon) return undefined;
    
    // Check if expired
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return undefined;
    }
    
    // Check if max uses reached
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return undefined;
    }
    
    return coupon.isActive ? coupon : undefined;
  }

  async createCoupon(insertCoupon: InsertCoupon): Promise<Coupon> {
    const id = randomUUID();
    const coupon: Coupon = {
      id,
      code: insertCoupon.code.toUpperCase(),
      discountType: insertCoupon.discountType || "percentage",
      discountValue: insertCoupon.discountValue,
      maxUses: insertCoupon.maxUses,
      usedCount: 0,
      expiresAt: insertCoupon.expiresAt,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    if (!this.data.coupons) {
      this.data.coupons = {};
    }
    this.data.coupons[id] = coupon;
    await this.saveData();
    return coupon;
  }

  async useCoupon(code: string): Promise<boolean> {
    const coupons = this.data.coupons || {};
    const coupon = Object.values(coupons).find((c) => c.code === code.toUpperCase());
    if (!coupon) return false;
    
    coupon.usedCount += 1;
    await this.saveData();
    return true;
  }

  async getAllCoupons(): Promise<Coupon[]> {
    const coupons = this.data.coupons || {};
    return Object.values(coupons).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async updateCoupon(id: string, updates: Partial<InsertCoupon & { isActive: boolean }>): Promise<Coupon | undefined> {
    if (!this.data.coupons || !(id in this.data.coupons)) {
      return undefined;
    }
    
    const coupon = this.data.coupons[id];
    if (updates.code) coupon.code = updates.code.toUpperCase();
    if (updates.discountType) coupon.discountType = updates.discountType;
    if (updates.discountValue) coupon.discountValue = updates.discountValue;
    if (updates.maxUses !== undefined) coupon.maxUses = updates.maxUses || undefined;
    if (updates.expiresAt !== undefined) coupon.expiresAt = updates.expiresAt || undefined;
    if (updates.isActive !== undefined) coupon.isActive = updates.isActive;
    
    await this.saveData();
    return coupon;
  }

  async deleteCoupon(id: string): Promise<boolean> {
    if (this.data.coupons && id in this.data.coupons) {
      delete this.data.coupons[id];
      await this.saveData();
      return true;
    }
    return false;
  }

  async getOrdersByUserId(userId: string): Promise<(Order & { items: OrderItem[] })[]> {
    const orders = Object.values(this.data.orders || {}).filter(o => o.userId === userId);
    
    return orders.map(order => {
      const items = Object.values(this.data.orderItems || {}).filter(
        item => item.orderId === order.id
      );
      return {
        ...order,
        items
      };
    });
  }

  async getAllOrders(): Promise<(Order & { items: OrderItem[] })[]> {
    const orders = Object.values(this.data.orders || {});
    
    return orders.map(order => {
      const items = Object.values(this.data.orderItems || {}).filter(
        item => item.orderId === order.id
      );
      return {
        ...order,
        items
      };
    });
  }

  async getOrder(id: string): Promise<(Order & { items: OrderItem[] }) | undefined> {
    const order = this.data.orders?.[id];
    if (!order) return undefined;
    
    const items = Object.values(this.data.orderItems || {}).filter(
      item => item.orderId === order.id
    );
    
    return {
      ...order,
      items
    };
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | undefined> {
    if (!this.data.orders || !(id in this.data.orders)) {
      return undefined;
    }
    
    const order = this.data.orders[id];
    Object.assign(order, updates);
    await this.saveData();
    return order;
  }

  async getUserWishlist(userId: string): Promise<string[] | undefined> {
    // For now, return empty array since wishlist is managed client-side
    // In a real app, you'd store this in a wishlist table
    return [];
  }

  // Restock Notification methods
  async createRestockNotification(insert: InsertRestockNotification): Promise<RestockNotification> {
    const id = randomUUID();
    const notification: RestockNotification = {
      id,
      ...insert,
      isNotified: false,
      createdAt: new Date().toISOString(),
    };
    if (!this.data.restockNotifications) {
      this.data.restockNotifications = {};
    }
    this.data.restockNotifications[id] = notification;
    await this.saveData();
    return notification;
  }

  async getRestockNotifications(productId: string): Promise<RestockNotification[]> {
    const notifications = this.data.restockNotifications || {};
    return Object.values(notifications)
      .filter((n) => n.productId === productId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getUnnotifiedRestockNotifications(): Promise<RestockNotification[]> {
    const notifications = this.data.restockNotifications || {};
    return Object.values(notifications)
      .filter((n) => !n.isNotified)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async markRestockNotificationAsNotified(id: string): Promise<boolean> {
    if (this.data.restockNotifications && id in this.data.restockNotifications) {
      const notification = this.data.restockNotifications[id];
      notification.isNotified = true;
      notification.notifiedAt = new Date().toISOString();
      await this.saveData();
      return true;
    }
    return false;
  }

  async deleteRestockNotification(id: string): Promise<boolean> {
    if (this.data.restockNotifications && id in this.data.restockNotifications) {
      delete this.data.restockNotifications[id];
      await this.saveData();
      return true;
    }
    return false;
  }

  // Search History methods
  async getSearchHistory(userId?: string, limit = 10): Promise<SearchHistory[]> {
    const history = this.data.searchHistory || {};
    let results = Object.values(history);
    
    if (userId) {
      results = results.filter((h) => h.userId === userId);
    }
    
    return results
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async getSearchSuggestions(query: string, limit = 5): Promise<string[]> {
    const history = this.data.searchHistory || {};
    const queries = Object.values(history)
      .filter((h) => h.query.toLowerCase().includes(query.toLowerCase()))
      .map((h) => h.query)
      .filter((q, index, arr) => arr.indexOf(q) === index); // Remove duplicates
    
    return queries.slice(0, limit);
  }

  async createSearchHistory(userId: string | undefined, insert: InsertSearchHistory): Promise<SearchHistory> {
    const id = randomUUID();
    const record: SearchHistory = {
      id,
      userId,
      query: insert.query,
      resultCount: insert.resultCount || 0,
      createdAt: new Date().toISOString(),
    };
    if (!this.data.searchHistory) {
      this.data.searchHistory = {};
    }
    this.data.searchHistory[id] = record;
    await this.saveData();
    return record;
  }

  async clearSearchHistory(userId?: string): Promise<boolean> {
    if (!this.data.searchHistory) return true;
    
    if (userId) {
      Object.keys(this.data.searchHistory).forEach((key) => {
        if (this.data.searchHistory[key].userId === userId) {
          delete this.data.searchHistory[key];
        }
      });
    } else {
      this.data.searchHistory = {};
    }
    await this.saveData();
    return true;
  }

  // User Address methods
  async getUserAddresses(userId: string): Promise<UserAddress[]> {
    const addresses = this.data.userAddresses || {};
    return Object.values(addresses).filter((addr) => addr.userId === userId);
  }

  async getUserAddress(id: string): Promise<UserAddress | undefined> {
    const addresses = this.data.userAddresses || {};
    return addresses[id];
  }

  async createUserAddress(insert: InsertUserAddress): Promise<UserAddress> {
    const id = randomUUID();
    const address: UserAddress = {
      id,
      userId: insert.userId,
      type: insert.type,
      fullName: insert.fullName,
      street: insert.street,
      city: insert.city,
      state: insert.state,
      zipCode: insert.zipCode,
      country: insert.country,
      phone: insert.phone || null,
      isDefault: insert.isDefault || false,
      createdAt: new Date().toISOString(),
    };
    if (!this.data.userAddresses) {
      this.data.userAddresses = {};
    }
    this.data.userAddresses[id] = address;
    await this.saveData();
    return address;
  }

  async updateUserAddress(id: string, updates: Partial<InsertUserAddress>): Promise<UserAddress | undefined> {
    const addresses = this.data.userAddresses || {};
    const address = addresses[id];
    if (!address) return undefined;

    const updated: UserAddress = {
      ...address,
      ...updates,
    };
    this.data.userAddresses[id] = updated;
    await this.saveData();
    return updated;
  }

  async deleteUserAddress(id: string): Promise<boolean> {
    const addresses = this.data.userAddresses || {};
    if (id in addresses) {
      delete addresses[id];
      await this.saveData();
      return true;
    }
    return false;
  }

  async setDefaultUserAddress(userId: string, addressId: string): Promise<boolean> {
    const addresses = this.data.userAddresses || {};
    let found = false;

    // Unset all other defaults for this user
    Object.values(addresses).forEach((addr) => {
      if (addr.userId === userId && addr.type === addresses[addressId]?.type) {
        addr.isDefault = false;
      }
    });

    // Set the new default
    if (addressId in addresses && addresses[addressId].userId === userId) {
      addresses[addressId].isDefault = true;
      found = true;
    }

    if (found) {
      await this.saveData();
    }
    return found;
  }

  // Order Status History methods
  async createOrderStatusHistory(insert: InsertOrderStatusHistory): Promise<OrderStatusHistory> {
    const id = randomUUID();
    const history: OrderStatusHistory = {
      id,
      orderId: insert.orderId,
      status: insert.status,
      trackingNumber: insert.trackingNumber || null,
      carrier: insert.carrier || null,
      notes: insert.notes || null,
      createdAt: new Date().toISOString(),
    };
    if (!this.data.orderStatusHistory) {
      this.data.orderStatusHistory = {};
    }
    this.data.orderStatusHistory[id] = history;

    // Also update the order's status field
    if (this.data.orders[insert.orderId]) {
      this.data.orders[insert.orderId].status = insert.status;
    }

    await this.saveData();
    return history;
  }

  async getOrderStatusHistory(orderId: string): Promise<OrderStatusHistory[]> {
    const history = this.data.orderStatusHistory || {};
    return Object.values(history)
      .filter((h) => h.orderId === orderId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async updateOrderStatus(orderId: string, insert: InsertOrderStatusHistory): Promise<OrderStatusHistory> {
    return this.createOrderStatusHistory(insert);
  }

  // Review Moderation methods
  async createReviewModeration(insert: InsertReviewModeration): Promise<ReviewModeration> {
    const id = randomUUID();
    const moderation: ReviewModeration = {
      id,
      reviewId: insert.reviewId,
      status: insert.status || "pending",
      reason: insert.reason || null,
      moderatedBy: insert.moderatedBy || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (!this.data.reviewModerations) {
      this.data.reviewModerations = {};
    }
    this.data.reviewModerations[id] = moderation;
    await this.saveData();
    return moderation;
  }

  async getReviewModeration(reviewId: string): Promise<ReviewModeration | undefined> {
    const moderations = this.data.reviewModerations || {};
    return Object.values(moderations).find((m) => m.reviewId === reviewId);
  }

  async updateReviewModeration(id: string, updates: Partial<InsertReviewModeration>): Promise<ReviewModeration | undefined> {
    const moderations = this.data.reviewModerations || {};
    const moderation = moderations[id];
    if (!moderation) return undefined;

    const updated: ReviewModeration = {
      ...moderation,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    moderations[id] = updated;
    await this.saveData();
    return updated;
  }

  async getReviewModerationQueue(status?: string): Promise<ReviewModeration[]> {
    const moderations = this.data.reviewModerations || {};
    let results = Object.values(moderations);

    if (status) {
      results = results.filter((m) => m.status === status);
    }

    return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Guest Checkout Session methods
  async createGuestCheckoutSession(insert: InsertGuestCheckoutSession): Promise<GuestCheckoutSession> {
    const sessionToken = randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours
    const session: GuestCheckoutSession = {
      id: randomUUID(),
      sessionToken,
      email: insert.email,
      phone: insert.phone || null,
      cartData: insert.cartData,
      expiresAt,
      createdAt: new Date().toISOString(),
    };
    if (!this.data.guestCheckoutSessions) {
      this.data.guestCheckoutSessions = {};
    }
    this.data.guestCheckoutSessions[session.id] = session;
    await this.saveData();
    return session;
  }

  async getGuestCheckoutSession(sessionToken: string): Promise<GuestCheckoutSession | undefined> {
    const sessions = this.data.guestCheckoutSessions || {};
    const session = Object.values(sessions).find((s) => s.sessionToken === sessionToken);
    
    if (session && new Date(session.expiresAt) < new Date()) {
      // Session expired, delete it
      delete sessions[Object.keys(sessions).find((k) => sessions[k].sessionToken === sessionToken)!];
      await this.saveData();
      return undefined;
    }
    return session;
  }

  async deleteExpiredGuestSessions(): Promise<number> {
    const sessions = this.data.guestCheckoutSessions || {};
    const now = new Date();
    let count = 0;

    Object.keys(sessions).forEach((key) => {
      if (new Date(sessions[key].expiresAt) < now) {
        delete sessions[key];
        count++;
      }
    });

    if (count > 0) {
      await this.saveData();
    }
    return count;
  }

  // Analytics Event methods
  async createAnalyticsEvent(insert: InsertAnalyticsEvent): Promise<AnalyticsEvent> {
    const id = randomUUID();
    const event: AnalyticsEvent = {
      id,
      userId: insert.userId || null,
      eventType: insert.eventType,
      productId: insert.productId || null,
      value: insert.value ? insert.value.toString() : null,
      metadata: insert.metadata || null,
      createdAt: new Date().toISOString(),
    };
    if (!this.data.analyticsEvents) {
      this.data.analyticsEvents = {};
    }
    this.data.analyticsEvents[id] = event;
    await this.saveData();
    return event;
  }

  async getAnalyticsEvents(filters?: {
    eventType?: string;
    productId?: string;
    userId?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<AnalyticsEvent[]> {
    const events = this.data.analyticsEvents || {};
    let results = Object.values(events);

    if (filters?.eventType) {
      results = results.filter((e) => e.eventType === filters.eventType);
    }
    if (filters?.productId) {
      results = results.filter((e) => e.productId === filters.productId);
    }
    if (filters?.userId) {
      results = results.filter((e) => e.userId === filters.userId);
    }
    if (filters?.dateFrom) {
      const from = new Date(filters.dateFrom);
      results = results.filter((e) => new Date(e.createdAt) >= from);
    }
    if (filters?.dateTo) {
      const to = new Date(filters.dateTo);
      results = results.filter((e) => new Date(e.createdAt) <= to);
    }

    return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getSalesStats(dateFrom?: string, dateTo?: string): Promise<{
    totalRevenue: number;
    totalOrders: number;
    topProducts: Array<{ productId: string; name: string; count: number; revenue: number }>;
  }> {
    const orders = Object.values(this.data.orders || {});
    const orderItems = Object.values(this.data.orderItems || {});
    const products = this.data.products || {};

    let filteredOrders = orders;
    if (dateFrom) {
      const from = new Date(dateFrom);
      filteredOrders = filteredOrders.filter((o) => new Date(o.createdAt) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      filteredOrders = filteredOrders.filter((o) => new Date(o.createdAt) <= to);
    }

    // Only count completed orders
    filteredOrders = filteredOrders.filter((o) => o.status === "completed");

    let totalRevenue = 0;
    const productStats: Record<string, { name: string; count: number; revenue: number }> = {};

    filteredOrders.forEach((order) => {
      const revenue = parseFloat(order.total);
      totalRevenue += revenue;

      // Find items for this order
      Object.values(orderItems).forEach((item) => {
        if (item.orderId === order.id) {
          const product = products[item.productId];
          if (product) {
            if (!productStats[item.productId]) {
              productStats[item.productId] = {
                name: product.name,
                count: 0,
                revenue: 0,
              };
            }
            productStats[item.productId].count += item.quantity;
            productStats[item.productId].revenue += parseFloat(item.price) * item.quantity;
          }
        }
      });
    });

    const topProducts = Object.entries(productStats)
      .map(([productId, stats]) => ({ productId, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return {
      totalRevenue,
      totalOrders: filteredOrders.length,
      topProducts,
    };
  }
}

export const storage = new MemStorage();
