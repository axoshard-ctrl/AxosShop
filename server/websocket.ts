import { Server as HTTPServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";

interface WebSocketClient {
  ws: WebSocket;
  userId?: string;
  connectedAt: Date;
}

interface NotificationPayload {
  type: string;
  data: any;
  timestamp?: string;
}

class WebSocketManager {
  private wss: WebSocketServer;
  private clients: Map<string, WebSocketClient[]> = new Map();
  private globalClients: Set<WebSocketClient> = new Set();

  constructor(server: HTTPServer) {
    this.wss = new WebSocketServer({ server, path: "/ws" });
    this.setupConnections();
  }

  private setupConnections() {
    this.wss.on("connection", (ws: WebSocket, req) => {
      const client: WebSocketClient = {
        ws,
        connectedAt: new Date(),
      };

      // Parse user ID from query params if provided
      const url = new URL(req.url || "", `http://${req.headers.host}`);
      const userId = url.searchParams.get("userId");

      if (userId) {
        client.userId = userId;
        if (!this.clients.has(userId)) {
          this.clients.set(userId, []);
        }
        this.clients.get(userId)!.push(client);
        console.log(`[WebSocket] User ${userId} connected`);
      } else {
        this.globalClients.add(client);
        console.log(`[WebSocket] Anonymous client connected`);
      }

      // Handle incoming messages
      ws.on("message", (data: string) => {
        try {
          const message = JSON.parse(data);
          this.handleMessage(client, message);
        } catch (error) {
          console.error("[WebSocket] Error parsing message:", error);
          ws.send(
            JSON.stringify({
              type: "error",
              message: "Invalid message format",
            })
          );
        }
      });

      // Handle client disconnect
      ws.on("close", () => {
        this.removeClient(client);
      });

      ws.on("error", (error) => {
        console.error("[WebSocket] Connection error:", error);
        this.removeClient(client);
      });

      // Send welcome message
      ws.send(
        JSON.stringify({
          type: "connected",
          message: "WebSocket connection established",
          userId: userId || "anonymous",
        })
      );
    });
  }

  private removeClient(client: WebSocketClient) {
    if (client.userId) {
      const userClients = this.clients.get(client.userId);
      if (userClients) {
        const index = userClients.indexOf(client);
        if (index > -1) {
          userClients.splice(index, 1);
        }
        if (userClients.length === 0) {
          this.clients.delete(client.userId);
        }
      }
      console.log(`[WebSocket] User ${client.userId} disconnected`);
    } else {
      this.globalClients.delete(client);
      console.log(`[WebSocket] Anonymous client disconnected`);
    }
  }

  private handleMessage(client: WebSocketClient, message: any) {
    const { type, data } = message;

    switch (type) {
      case "ping":
        client.ws.send(JSON.stringify({ type: "pong" }));
        break;

      case "subscribe":
        // Client can subscribe to specific channels
        console.log(`[WebSocket] Client subscribed to: ${data.channel}`);
        break;

      case "unsubscribe":
        console.log(`[WebSocket] Client unsubscribed from: ${data.channel}`);
        break;

      default:
        console.log(`[WebSocket] Unknown message type: ${type}`);
    }
  }

  // Send notification to specific user
  public notifyUser(userId: string, payload: NotificationPayload) {
    const userClients = this.clients.get(userId);
    if (userClients) {
      const message = JSON.stringify({
        ...payload,
        timestamp: payload.timestamp || new Date().toISOString(),
      });

      userClients.forEach((client) => {
        if (client.ws.readyState === WebSocket.OPEN) {
          client.ws.send(message);
        }
      });

      console.log(
        `[WebSocket] Notification sent to user ${userId}: ${payload.type}`
      );
    }
  }

  // Broadcast to all connected clients
  public broadcast(payload: NotificationPayload) {
    const message = JSON.stringify({
      ...payload,
      timestamp: payload.timestamp || new Date().toISOString(),
    });

    // Send to all global clients
    this.globalClients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(message);
      }
    });

    // Send to all user clients
    this.clients.forEach((userClients) => {
      userClients.forEach((client) => {
        if (client.ws.readyState === WebSocket.OPEN) {
          client.ws.send(message);
        }
      });
    });

    console.log(`[WebSocket] Broadcast sent: ${payload.type}`);
  }

  // Notify about restock
  public async notifyRestock(productId: string) {
    const product = await storage.getProduct(productId);
    if (!product) return;

    const payload: NotificationPayload = {
      type: "product.restocked",
      data: {
        productId,
        productName: product.name,
        stock: product.stock,
      },
    };

    this.broadcast(payload);
  }

  // Notify about new order
  public notifyOrderCreated(
    orderId: string,
    customerEmail: string,
    totalAmount: string
  ) {
    const payload: NotificationPayload = {
      type: "order.created",
      data: {
        orderId,
        customerEmail,
        totalAmount,
      },
    };

    this.broadcast(payload);
  }

  // Notify about order status change
  public notifyOrderStatusChange(
    orderId: string,
    newStatus: string,
    customerEmail?: string
  ) {
    const userPayload: NotificationPayload = {
      type: "order.status_changed",
      data: {
        orderId,
        status: newStatus,
      },
    };

    if (customerEmail) {
      // Try to find user by email and notify them
      this.broadcast(userPayload);
    } else {
      this.broadcast(userPayload);
    }
  }

  // Get connection stats
  public getStats() {
    let totalConnections = this.globalClients.size;
    let userConnections = 0;

    this.clients.forEach((userClients) => {
      totalConnections += userClients.length;
      userConnections += userClients.length;
    });

    return {
      totalConnections,
      userConnections,
      anonymousConnections: this.globalClients.size,
      connectedUsers: this.clients.size,
    };
  }
}

export { WebSocketManager, NotificationPayload };
