# Discord Checkout Notifications Setup

When customers checkout on your store, orders are automatically posted to your Discord channel!

## Quick Setup (30 seconds)

### Step 1: Get Your Channel ID
1. In Discord, enable Developer Mode (User Settings → Advanced → Developer Mode)
2. Right-click the channel where you want order notifications
3. Click "Copy Channel ID"

### Step 2: Add Channel ID to .env
In your `.env` file, add:
```env
DISCORD_ORDERS_CHANNEL_ID=your_channel_id_here
```

Replace `your_channel_id_here` with the ID you just copied. Example:
```env
DISCORD_ORDERS_CHANNEL_ID=1234567890123456789
```

### Step 3: Restart the Bot
Your bot will automatically start sending order notifications to that channel!

## What You'll See

When a customer checks out, you'll get a Discord message like:

```
🛍️ New Order Received
A new order has been placed!

Order ID: #abc123def456
Status: ✅ Completed

Customer Email: customer@example.com

Items
• Axolotl T-Shirt (x2) - $29.99
• Pink Hoodie (x1) - $49.99

Total Amount: 💰 $109.97
Timestamp: 12/3/2025, 2:45:30 PM
```

## Features

✅ **Automatic Order Notifications** - Sent immediately when customer completes checkout  
✅ **Order Details** - Shows order ID, customer email, items, and total  
✅ **Item Breakdown** - Lists all products with quantities and prices  
✅ **Status Updates** - Automatic notifications when admin changes order status  
✅ **Rich Formatting** - Beautiful embeds with color coding and timestamps  

## Slash Commands in Discord

You can also use these commands in your Discord server:

- `/order-status <order_id>` - Check any order status instantly
- `/list-orders [status] [limit]` - View recent orders
- `/order-details <order_id>` - Get full order information
- `/update-order <order_id> <status>` - Update order status (admin only)

## Troubleshooting

**Orders not showing in channel?**
- Verify `DISCORD_ORDERS_CHANNEL_ID` is in your `.env`
- Check bot has "Send Messages" and "Embed Links" permissions in that channel
- Restart the server: `npm run dev`
- Check server logs for any errors

**Bot not online?**
- Verify `DISCORD_TOKEN` is correct in `.env`
- Check bot is invited to your server
- Check bot has Discord Server access

**Channel ID not working?**
- Make sure you copied the full ID (all numbers)
- Try copying again with Developer Mode enabled
- Should be a long number like: `1234567890123456789`

## Environment Variables Needed

```env
# Required
DISCORD_TOKEN=your_bot_token
DISCORD_CLIENT_ID=your_client_id
DISCORD_GUILD_ID=your_server_id
DISCORD_ORDERS_CHANNEL_ID=your_channel_id

# Optional (for admin commands)
DISCORD_ADMIN_ROLE_ID=your_admin_role_id
```

## Testing

To test if it's working:

1. Go to your checkout page
2. Add items to cart
3. Complete a checkout (use test card: 4242 4242 4242 4242)
4. Check your Discord channel for the order notification

You should see the order appear in Discord within seconds!

## Customize the Message

The notification embed can be customized in `server/discordService.ts`:
- Change colors (`.setColor('#3498db')`)
- Add/remove fields
- Change titles and descriptions
- Add thumbnail images

Contact support if you need help customizing!
