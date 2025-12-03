import React, { createContext, useContext, useCallback } from "react";
import { useWebSocket, WebSocketMessage } from "../hooks/useWebSocket";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: any;
}

interface NotificationContextType {
  notifications: Notification[];
  isConnected: boolean;
  addNotification: (notification: Omit<Notification, "id" | "timestamp">) => void;
  markAsRead: (id: string) => void;
  clearNotifications: () => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const { toast } = useToast();
  const currentUserIdRef = React.useRef<string | undefined>();

  const addNotification = useCallback((notification: Omit<Notification, "id" | "timestamp">) => {
    const id = `notif_${Date.now()}_${Math.random()}`;
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date(),
    };

    setNotifications((prev) => [newNotification, ...prev].slice(0, 50)); // Keep last 50

    // Show toast for unread notifications
    if (!notification.read) {
      toast({
        title: notification.title,
        description: notification.message,
        duration: 4000,
      });
    }
  }, [toast]);

  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case "connected":
        console.log("[Notification] Connected to WebSocket server");
        break;

      case "product.restocked":
        addNotification({
          type: "restock",
          title: "Product Restocked",
          message: `${message.data?.productName} is now back in stock!`,
          read: false,
          data: message.data,
        });
        break;

      case "order.created":
        addNotification({
          type: "order",
          title: "New Order",
          message: `Order #${message.data?.orderId} created for $${message.data?.totalAmount}`,
          read: false,
          data: message.data,
        });
        break;

      case "order.status_changed":
        addNotification({
          type: "order_status",
          title: "Order Status Updated",
          message: `Order #${message.data?.orderId} is now ${message.data?.status}`,
          read: false,
          data: message.data,
        });
        break;

      case "inventory.low":
        addNotification({
          type: "warning",
          title: "Low Inventory",
          message: message.data?.message || "An item is running low on stock",
          read: false,
          data: message.data,
        });
        break;

      case "system.alert":
        addNotification({
          type: "alert",
          title: "System Alert",
          message: message.data?.message || "System alert",
          read: false,
          data: message.data,
        });
        break;

      default:
        // Generic notification
        if (message.type && message.type !== "pong") {
          console.log("[Notification] Unknown message type:", message.type);
        }
    }
  }, [addNotification]);

  const { isConnected } = useWebSocket({
    userId: currentUserIdRef.current,
    onMessage: handleWebSocketMessage,
    onConnect: () => console.log("[Notification] WebSocket connected"),
    onDisconnect: () => console.log("[Notification] WebSocket disconnected"),
  });

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        isConnected,
        addNotification,
        markAsRead,
        clearNotifications,
        unreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
}
