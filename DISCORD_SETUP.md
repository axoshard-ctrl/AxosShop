# Discord Order Management Integration Guide

## Overview

AxosShop now integrates with Discord for real-time order notifications and management. Admins and customers can check order status, view order details, and manage orders directly from Discord using slash commands.

## Features

✅ **Order Status Checking** - View current status of any order  
✅ **Order Details** - Get complete order information including items and amounts  
✅ **List Orders** - View recent orders with optional filtering by status  
✅ **Order Updates** - Admin command to update order status  
✅ **Auto Notifications** - Automatic Discord messages when orders are created/updated  
✅ **Role-Based Access** - Admin-only commands with Discord role verification

## Setup Instructions

### Step 1: Create a Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Name it "AxosShop Bot" (or your preferred name)
4. Go to the "Bot" section
5. Click "Add Bot"
6. Under TOKEN, click "Copy" and save it somewhere safe

### Step 2: Configure Bot Permissions

1. In Developer Portal, go to "OAuth2" > "URL Generator"
2. Select these scopes:
   - `bot`
   - `applications.commands`

3. Select these permissions:
   - Send Messages
   - Embed Links
   - Read Message History
   - Use Slash Commands

4. Copy the generated URL and open it in your browser
5. Select your Discord server and authorize the bot

### Step 3: Get Required IDs

#### Bot Client ID
- In Developer Portal > General Information, copy the "APPLICATION ID"

#### Guild ID (Server ID)
- Enable Developer Mode in Discord (User Settings > Advanced > Developer Mode)
- Right-click your server name and "Copy Server ID"

#### Orders Channel ID (Optional)
- Right-click the channel where you want order notifications
- "Copy Channel ID"

#### Admin Role ID (Optional)
- Right-click the admin role
- "Copy Role ID"

### Step 4: Configure Environment Variables

Add these to your `.env` file:

```env
# Discord Configuration
DISCORD_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_application_id_here
DISCORD_GUILD_ID=your_server_id_here
DISCORD_ORDERS_CHANNEL_ID=your_channel_id_here
DISCORD_ADMIN_ROLE_ID=your_admin_role_id_here
```

### Step 5: Register Slash Commands

Run this command to register the slash commands with Discord:

```bash
# Using Node (with tsx)
tsx server/discordCommands.ts

# Or with npm script (after adding to package.json)
npm run discord:register
```

You should see:
```
✅ Registered 4 commands for guild <GUILD_ID>
```

### Step 6: Integrate into Application

In your `server/index.ts`, initialize Discord service:

```typescript
import { discordService } from './discordService';

// In your startup code
await discordService.initialize();
console.log('[Discord] Service status:', discordService.getStatus());
```

### Step 7: Hook into Order Events

In your order creation/update routes, trigger Discord notifications:

```typescript
import { discordService } from './discordService';

// When creating an order
wsManager?.broadcast({
  type: 'order.created',
  data: { orderId, customerEmail, totalAmount }
});

// Notify Discord
await discordService.notifyOrderCreated(orderId, customerEmail, totalAmount);

// When updating order status
await discordService.notifyOrderUpdate(orderId, newStatus, customerEmail);
```

## Available Commands

### `/order-status <order_id>`
Check the current status of an order.

**Example:**
```
/order-status order_id: ORD-001
```

**Response:**
```
Order #ORD-001
Status: shipped
Total: $99.99
Customer: customer@example.com
Created: 12/3/2025
Items: 2 items
```

---

### `/list-orders [status] [limit]`
List recent orders with optional filtering.

**Parameters:**
- `status` (optional): Filter by status (pending, confirmed, shipped, delivered, cancelled)
- `limit` (optional): Number of orders to show (default: 10, max: 50)

**Example:**
```
/list-orders status: shipped limit: 5
```

**Response:**
```
Orders (5 of 12)
#ORD-001 - shipped - $99.99 - customer@example.com
#ORD-002 - pending - $149.99 - user@example.com
#ORD-003 - delivered - $299.99 - admin@example.com
...
```

---

### `/order-details <order_id>`
Get complete details about an order including items and amounts.

**Example:**
```
/order-details order_id: ORD-001
```

**Response:**
```
Order #ORD-001 - Details
Status: shipped
Customer: customer@example.com
Shipping Address: 123 Main St, City, State
Items:
• Widget Pro (x2) - $50.00
• Axolotl Plushie (x1) - $29.99

Subtotal: $129.99
Tax: $10.40
Shipping: $5.99
Total: $145.38
Payment Method: stripe
Created: 12/3/2025 14:30:45
```

---

### `/update-order <order_id> <status>` (Admin Only)
Update an order's status. Requires admin role.

**Parameters:**
- `order_id` (required): The order to update
- `status` (required): New status (pending, confirmed, shipped, delivered, cancelled)

**Example:**
```
/update-order order_id: ORD-001 status: delivered
```

**Response:**
```
Order Updated
Order ID: #ORD-001
New Status: delivered
Updated By: AdminName
```

## Automatic Notifications

### Order Created Notification
When a new order is placed, Discord receives an automatic notification in the orders channel:

```
🔔 New Order Received
Order ID: #ORD-001
Customer: customer@example.com
Amount: $99.99
Timestamp: 12/3/2025 14:30:45
```

### Order Status Update Notification
When order status changes (via command, webhook, or API), Discord is notified:

```
📦 Order Status Updated
Order ID: #ORD-001
New Status: shipped
Customer: customer@example.com
Timestamp: 12/3/2025 15:45:20
```

## Troubleshooting

### Bot not showing in server
- Check if bot has been invited (OAuth2 URL step)
- Verify bot has "View Channels" permission
- Check if bot is online (look for "online" status)

### Commands not appearing
- Run command registration again: `tsx server/discordCommands.ts`
- Wait 1-5 minutes for Discord to sync
- Restart bot if commands still don't appear
- Ensure `DISCORD_GUILD_ID` is set for faster registration

### No notifications appearing
- Verify `DISCORD_ORDERS_CHANNEL_ID` is correct
- Check bot has "Send Messages" and "Embed Links" permissions in that channel
- Verify Discord service is initialized in `server/index.ts`
- Check server logs for error messages

### "Unknown command" error
- Verify commands are registered with `/` prefix
- Ensure bot is in the guild
- Commands may be in a different app (check app name in command hint)

### Admin commands not working
- Verify user has the role specified in `DISCORD_ADMIN_ROLE_ID`
- Check role ID is correct
- If no `DISCORD_ADMIN_ROLE_ID` set, commands accessible to all

### Bot goes offline
- Check bot token in `.env`
- Verify internet connection
- Check Discord API status
- Review server logs for connection errors

## Security Considerations

1. **Token Security**: Keep `DISCORD_TOKEN` secret. Never commit to git.
2. **Role-Based Access**: Use `DISCORD_ADMIN_ROLE_ID` to restrict sensitive commands.
3. **Data Privacy**: Ephemeral replies (`ephemeral: true`) keep data private.
4. **Rate Limiting**: Discord has rate limits; built-in protection prevents abuse.
5. **Audit Trail**: All admin actions logged to Discord and server logs.

## Advanced Configuration

### Multiple Channels
To send different notifications to different channels:

```typescript
// In discordService.ts
async notifyOrderCreated(orderId, customerEmail, totalAmount) {
  // Send to orders channel
  const ordersChannel = await this.client.channels.fetch(this.config.ordersChannelId);
  
  // Also send to admin channel
  const adminChannel = await this.client.channels.fetch(ADMIN_CHANNEL_ID);
  
  // Or send DM to admin
  const admin = await this.client.users.fetch(ADMIN_USER_ID);
  await admin.send({ embeds: [embed] });
}
```

### Custom Messages
Customize Discord embed messages by modifying the `EmbedBuilder` calls in `discordService.ts`:

```typescript
const embed = new EmbedBuilder()
  .setColor('#3498db')           // Change color
  .setTitle('Custom Title')
  .setThumbnail('image_url')     // Add thumbnail
  .setImage('image_url')         // Add image
  .setFooter({ text: 'Custom footer' })
  .setTimestamp();
```

### Dashboard Integration
Create a Discord dashboard showing stats:

```typescript
// Add new command
case 'dashboard':
  const orders = await storage.getAllOrders();
  const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);
  const embed = new EmbedBuilder()
    .setTitle('📊 Sales Dashboard')
    .addFields(
      { name: 'Total Orders', value: String(orders.length), inline: true },
      { name: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, inline: true }
    );
  await interaction.reply({ embeds: [embed], ephemeral: true });
  break;
```

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DISCORD_TOKEN` | Yes | Bot token from Developer Portal |
| `DISCORD_CLIENT_ID` | Yes | Application ID from Developer Portal |
| `DISCORD_GUILD_ID` | No | Server ID (required for slash commands) |
| `DISCORD_ORDERS_CHANNEL_ID` | No | Channel for order notifications |
| `DISCORD_ADMIN_ROLE_ID` | No | Role ID for admin-only commands |

## Support & Resources

- [Discord.js Documentation](https://discord.js.org/)
- [Discord Developer Portal](https://discord.com/developers)
- [Discord API Documentation](https://discord.com/developers/docs)
- [Slash Commands Guide](https://discord.com/developers/docs/interactions/application-commands)

## Example .env Configuration

```env
# Discord Configuration
DISCORD_TOKEN=MTk4NjIyNDgzNzYx.Clwa7A.dF_7D8O7tL8t9Oh7trOLVzXgK1a
DISCORD_CLIENT_ID=123456789012345678
DISCORD_GUILD_ID=987654321098765432
DISCORD_ORDERS_CHANNEL_ID=111222333444555666
DISCORD_ADMIN_ROLE_ID=999888777666555444
```

## Features Roadmap

- [ ] Scheduled order summary reports
- [ ] Customer DM notifications
- [ ] Interactive order buttons (quick status update)
- [ ] Rich message formatting with product images
- [ ] Order search by date range
- [ ] Inventory alerts via Discord
- [ ] Revenue tracking and analytics
- [ ] Support ticket integration
