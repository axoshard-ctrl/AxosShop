import { REST } from 'discord.js';
import { Routes } from 'discord.js';
import 'dotenv/config';

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const GUILD_ID = process.env.DISCORD_GUILD_ID;

const commands = [
  {
    name: 'order-status',
    description: 'Check the status of an order',
    options: [
      {
        name: 'order_id',
        description: 'The order ID to check',
        type: 3, // STRING
        required: true,
      },
    ],
  },
  {
    name: 'list-orders',
    description: 'List recent orders',
    options: [
      {
        name: 'status',
        description: 'Filter by order status (pending, confirmed, shipped, delivered, cancelled)',
        type: 3, // STRING
        required: false,
      },
      {
        name: 'limit',
        description: 'Number of orders to show (max 50)',
        type: 4, // INTEGER
        required: false,
      },
    ],
  },
  {
    name: 'order-details',
    description: 'Get detailed information about an order',
    options: [
      {
        name: 'order_id',
        description: 'The order ID to check',
        type: 3, // STRING
        required: true,
      },
    ],
  },
  {
    name: 'update-order',
    description: '[Admin only] Update order status',
    options: [
      {
        name: 'order_id',
        description: 'The order ID to update',
        type: 3, // STRING
        required: true,
      },
      {
        name: 'status',
        description: 'New status (pending, confirmed, shipped, delivered, cancelled)',
        type: 3, // STRING
        required: true,
      },
    ],
  },
];

async function registerCommands() {
  if (!TOKEN || !CLIENT_ID) {
    console.error('❌ DISCORD_TOKEN and DISCORD_CLIENT_ID environment variables are required');
    process.exit(1);
  }

  const rest = new REST({ version: '10' }).setToken(TOKEN);

  try {
    console.log('🔄 Registering Discord slash commands...');

    if (GUILD_ID) {
      // Register commands for specific guild (faster for testing)
      await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
        body: commands,
      });
      console.log(`✅ Registered ${commands.length} commands for guild ${GUILD_ID}`);
    } else {
      // Register global commands
      await rest.put(Routes.applicationCommands(CLIENT_ID), {
        body: commands,
      });
      console.log(`✅ Registered ${commands.length} global commands`);
    }
  } catch (error) {
    console.error('❌ Failed to register commands:', error);
    process.exit(1);
  }
}

registerCommands();
