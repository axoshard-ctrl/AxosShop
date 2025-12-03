# 🤖 Discord Integration Quick Start

## 30-Second Setup

### 1️⃣ Create Discord Application
1. Go to https://discord.com/developers/applications
2. Click "New Application" → Name it
3. Go to "Bot" tab → "Add Bot"
4. Copy the TOKEN

### 2️⃣ Invite Bot to Server
1. Go to "OAuth2" > "URL Generator"
2. Select scopes: `bot`, `applications.commands`
3. Select permissions: `Send Messages`, `Embed Links`, `Read Message History`
4. Copy URL → Open in browser → Select server

### 3️⃣ Configure Environment
Add to `.env`:
```env
DISCORD_TOKEN=your_token_here
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_GUILD_ID=your_server_id_here
DISCORD_ORDERS_CHANNEL_ID=your_channel_id_here
```

### 4️⃣ Register Commands
```bash
tsx server/discordCommands.ts
```

Done! ✅

---

## Commands Available

| Command | Purpose | Admin Only |
|---------|---------|-----------|
| `/order-status <order_id>` | Check order status | ❌ |
| `/list-orders [status] [limit]` | List orders | ❌ |
| `/order-details <order_id>` | Full order details | ❌ |
| `/update-order <id> <status>` | Change order status | ✅ |

---

## Auto Notifications

✅ New order created  
✅ Order status updated  
✅ Sent to configured channel  
✅ Embeds with full details

---

## Get IDs from Discord

**Enable Developer Mode:**
- Settings → Advanced → Developer Mode

**Copy IDs:**
- Server ID: Right-click server name
- Channel ID: Right-click channel
- Role ID: Right-click role
- Application ID: In Developer Portal > General Information

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Commands not showing | Run `tsx server/discordCommands.ts` again |
| Bot offline | Check `DISCORD_TOKEN` in `.env` |
| No notifications | Verify channel ID and bot permissions |
| "Unknown command" | Ensure bot is in the server |

---

## Full Guide
See `DISCORD_SETUP.md` for advanced configuration and features.

---

## API Endpoints

Check Discord service status:
```
GET /api/discord/status
```

Response:
```json
{
  "discordEnabled": true,
  "isInitialized": true,
  "botName": "AxosShop#1234"
}
```

---

## Files

- `server/discordService.ts` - Main Discord bot logic
- `server/discordCommands.ts` - Slash command registration
- `DISCORD_SETUP.md` - Complete setup guide

---

## Features

- 🔔 Real-time order notifications
- 📊 Order status tracking
- 👥 Customer order lookup
- 🔐 Admin-only commands
- 🎯 Role-based access control
- 📈 Order details with embeds
- 🔄 Integration with WebSocket and Email
