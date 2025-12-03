# WebSocket Real-Time Features Guide

## Overview

WebSocket support has been added to AxosShop for real-time notifications, order updates, inventory changes, and live chat functionality.

## Architecture

### Server Components

**`server/websocket.ts`** - WebSocketManager class handles:
- Connection lifecycle management
- User-based and broadcast messaging
- Connection pooling and status tracking
- Specific notification methods (restock, order creation, status changes)

Key methods:
- `notifyUser(userId, payload)` - Send notification to specific user
- `broadcast(payload)` - Send to all connected clients
- `notifyRestock(productId)` - Product back in stock notification
- `notifyOrderCreated(orderId, email, amount)` - New order notification
- `notifyOrderStatusChange(orderId, status, email)` - Order status update
- `getStats()` - Connection statistics

### Client Components

**`client/src/hooks/useWebSocket.ts`** - React hook for WebSocket connections:
```typescript
const { isConnected, send, error } = useWebSocket({
  userId: "user123",           // Optional: for user-specific messages
  onMessage: (msg) => {},      // Handle incoming messages
  onConnect: () => {},          // Connection established
  onDisconnect: () => {},       // Connection lost
  autoConnect: true             // Auto-reconnect with exponential backoff
});
```

**`client/src/context/NotificationContext.tsx`** - React Context provider:
```typescript
<NotificationProvider>
  <App />
</NotificationProvider>

// In components:
const { notifications, isConnected, unreadCount } = useNotifications();
```

## Usage Examples

### Server: Emit Restock Notification
```typescript
import { wsManager } from "./routes";

// When product is restocked
await wsManager?.notifyRestock(productId);
```

### Server: Emit Order Created Notification
```typescript
// When order is created
wsManager?.notifyOrderCreated(orderId, customerEmail, totalAmount);
```

### Server: Broadcast Custom Notification
```typescript
wsManager?.broadcast({
  type: "custom.event",
  data: { key: "value" }
});
```

### Client: Listen for Notifications
```typescript
import { useNotifications } from "@/context/NotificationContext";

function NotificationCenter() {
  const { notifications, isConnected, unreadCount, markAsRead } = useNotifications();

  return (
    <div>
      <span>Unread: {unreadCount}</span>
      {notifications.map(notif => (
        <div key={notif.id} onClick={() => markAsRead(notif.id)}>
          <h3>{notif.title}</h3>
          <p>{notif.message}</p>
          <time>{notif.timestamp.toLocaleString()}</time>
        </div>
      ))}
      <p>Status: {isConnected ? "Connected" : "Disconnected"}</p>
    </div>
  );
}
```

### Client: Send Custom WebSocket Message
```typescript
import { useWebSocket } from "@/hooks/useWebSocket";

function ChatComponent() {
  const { send, isConnected } = useWebSocket({
    onMessage: (msg) => {
      if (msg.type === "chat.message") {
        console.log("New message:", msg.data.text);
      }
    }
  });

  const handleSendMessage = (text: string) => {
    send({
      type: "chat.message",
      data: { text, timestamp: new Date().toISOString() }
    });
  };

  return (
    <div>
      <button disabled={!isConnected} onClick={() => handleSendMessage("Hello")}>
        Send Message
      </button>
    </div>
  );
}
```

## Integration Points

### In App.tsx or main layout:
```typescript
import { NotificationProvider } from "@/context/NotificationContext";

export default function App() {
  return (
    <NotificationProvider>
      {/* Rest of app */}
    </NotificationProvider>
  );
}
```

### In Admin Dashboard:
```typescript
// Use notifications to show real-time order updates
const { notifications } = useNotifications();

const recentOrders = notifications
  .filter(n => n.type === "order")
  .slice(0, 5);
```

## WebSocket Events

### Server → Client

**Product Restock**
```json
{
  "type": "product.restocked",
  "data": {
    "productId": "123",
    "productName": "Widget Pro",
    "stock": 50
  }
}
```

**Order Created**
```json
{
  "type": "order.created",
  "data": {
    "orderId": "ORD-001",
    "customerEmail": "user@example.com",
    "totalAmount": "99.99"
  }
}
```

**Order Status Changed**
```json
{
  "type": "order.status_changed",
  "data": {
    "orderId": "ORD-001",
    "status": "shipped"
  }
}
```

**Low Inventory Alert**
```json
{
  "type": "inventory.low",
  "data": {
    "productId": "123",
    "productName": "Widget Pro",
    "currentStock": 5,
    "minimumThreshold": 10
  }
}
```

### Client → Server

**Ping (Keep-alive)**
```json
{
  "type": "ping"
}
```

**Subscribe to Channel**
```json
{
  "type": "subscribe",
  "data": {
    "channel": "orders"
  }
}
```

**Unsubscribe from Channel**
```json
{
  "type": "unsubscribe",
  "data": {
    "channel": "orders"
  }
}
```

## Monitoring

### WebSocket Connection Statistics
```bash
curl http://localhost:3000/api/ws/stats
```

Response:
```json
{
  "websocketEnabled": true,
  "stats": {
    "totalConnections": 5,
    "userConnections": 3,
    "anonymousConnections": 2,
    "connectedUsers": 2
  }
}
```

## Performance Considerations

1. **Connection Limits**: Default WebSocket allows up to 65,000 connections per process
2. **Memory**: Each connection uses ~1KB memory (minimal overhead)
3. **Reconnection**: Automatic exponential backoff (1s → 2s → 4s → ... → 30s max)
4. **Message Rate**: Throttle high-frequency messages to prevent network congestion
5. **Storage**: Notifications kept in memory (limited to 50 recent per client)

## Security

1. **User Isolation**: Messages are routed by userId when provided
2. **Authentication**: Can be enhanced with JWT token validation in websocket.ts
3. **Broadcast Safety**: Sensitive data should not be broadcast to all users
4. **Path Security**: WebSocket path is `/ws`, should be whitelisted in proxies

## Future Enhancements

1. Persistent notification storage (database)
2. Notification preferences/channels per user
3. JWT authentication for WebSocket connections
4. Message queue (Redis) for distributed systems
5. Presence tracking (who's online)
6. Read receipt tracking
7. File sharing in chat
8. Typing indicators

## Troubleshooting

**WebSocket connection fails**
- Check browser console for connection errors
- Verify server is running on expected host/port
- Ensure proxy/load balancer supports WebSocket upgrades
- Check CORS/HTTPS configuration

**Messages not received**
- Verify connection is established (check isConnected state)
- Check server logs for message send errors
- Ensure message type matches handler expectations

**High memory usage**
- Check for memory leaks in message handlers
- Limit notification history size
- Monitor number of concurrent connections

**Frequent disconnections**
- Check network stability
- Adjust reconnection timeout thresholds
- Monitor server load and connection handling capacity
