import { Client, GatewayIntentBits, CommandInteraction, ChatInputCommandInteraction, EmbedBuilder, ChannelType, CacheType } from 'discord.js';
import { storage } from './storage';
import 'dotenv/config';

interface DiscordServiceConfig {
  token?: string;
  clientId?: string;
  guildId?: string;
  ordersChannelId?: string;
  adminRoleId?: string;
}

export class DiscordService {
  private client: Client | null = null;
  private config: DiscordServiceConfig;
  private isInitialized = false;

  constructor() {
    this.config = {
      token: process.env.DISCORD_TOKEN,
      clientId: process.env.DISCORD_CLIENT_ID,
      guildId: process.env.DISCORD_GUILD_ID,
      ordersChannelId: process.env.DISCORD_ORDERS_CHANNEL_ID,
      adminRoleId: process.env.DISCORD_ADMIN_ROLE_ID,
    };
  }

  /**
   * Initialize Discord bot
   */
  async initialize(): Promise<boolean> {
    if (!this.config.token) {
      console.log('⚠️  Discord token not configured. Discord integration disabled.');
      return false;
    }

    try {
      this.client = new Client({
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.MessageContent,
          GatewayIntentBits.DirectMessages,
        ],
      });

      this.client.on('ready', () => {
        console.log(`✅ Discord bot logged in as ${this.client?.user?.tag}`);
        this.isInitialized = true;
      });

      this.client.on('interactionCreate', async (interaction) => {
        if (!interaction.isCommand()) return;
        await this.handleCommand(interaction);
      });

      await this.client.login(this.config.token);
      return true;
    } catch (error) {
      console.error('Failed to initialize Discord service:', error);
      return false;
    }
  }

  /**
   * Handle Discord slash commands
   */
  private async handleCommand(interaction: CommandInteraction<CacheType>): Promise<void> {
    if (!interaction.isChatInputCommand()) return;
    try {
      const { commandName } = interaction;

      switch (commandName) {
        case 'order-status':
          await this.handleOrderStatus(interaction);
          break;

        case 'list-orders':
          await this.handleListOrders(interaction);
          break;

        case 'order-details':
          await this.handleOrderDetails(interaction);
          break;

        case 'update-order':
          await this.handleUpdateOrder(interaction);
          break;

        default:
          await interaction.reply({ content: 'Unknown command', ephemeral: true });
      }
    } catch (error) {
      console.error('Error handling command:', error);
      await interaction.reply({
        content: 'An error occurred while processing your command',
        ephemeral: true,
      });
    }
  }

  /**
   * Handle /order-status command
   */
  private async handleOrderStatus(interaction: ChatInputCommandInteraction): Promise<void> {
    const orderId = interaction.options.getString('order_id');

    if (!orderId) {
      await interaction.reply({ content: 'Please provide an order ID', ephemeral: true });
      return;
    }

    const order = await storage.getOrder(orderId);

    if (!order) {
      await interaction.reply({
        content: `Order #${orderId} not found`,
        ephemeral: true,
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor('#3498db')
      .setTitle(`Order #${orderId}`)
      .addFields(
        { name: 'Status', value: order.status || 'pending', inline: true },
        { name: 'Total', value: `$${order.totalAmount}`, inline: true },
        { name: 'Customer', value: order.customerEmail || 'Unknown', inline: false },
        { name: 'Created', value: new Date(order.createdAt || '').toLocaleDateString(), inline: true },
        { name: 'Items', value: `${order.items?.length || 0} items`, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }

  /**
   * Handle /list-orders command
   */
  private async handleListOrders(interaction: ChatInputCommandInteraction): Promise<void> {
    const status = interaction.options.getString('status') || undefined;
    const limit = interaction.options.getInteger('limit') || 10;

    const orders = await storage.getAllOrders();
    const filtered = status
      ? orders.filter((o) => o.status === status)
      : orders;

    const listed = filtered.slice(0, limit);

    if (listed.length === 0) {
      await interaction.reply({
        content: status ? `No orders found with status: ${status}` : 'No orders found',
        ephemeral: true,
      });
      return;
    }

    const orderList = listed
      .map((o) => `**#${o.id}** - ${o.status || 'pending'} - $${o.totalAmount} - ${o.customerEmail}`)
      .join('\n');

    const embed = new EmbedBuilder()
      .setColor('#27ae60')
      .setTitle(`Orders (${listed.length} of ${filtered.length})`)
      .setDescription(orderList)
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }

  /**
   * Handle /order-details command
   */
  private async handleOrderDetails(interaction: ChatInputCommandInteraction): Promise<void> {
    const orderId = interaction.options.getString('order_id');

    if (!orderId) {
      await interaction.reply({ content: 'Please provide an order ID', ephemeral: true });
      return;
    }

    const order = await storage.getOrder(orderId);

    if (!order) {
      await interaction.reply({
        content: `Order #${orderId} not found`,
        ephemeral: true,
      });
      return;
    }

    const itemsText =
      order.items
        ?.map(
          (item: any) =>
            `• ${item.productName} (x${item.quantity}) - $${item.price}`
        )
        .join('\n') || 'No items';

    const embed = new EmbedBuilder()
      .setColor('#9b59b6')
      .setTitle(`Order #${orderId} - Details`)
      .addFields(
        { name: 'Status', value: order.status || 'pending', inline: false },
        { name: 'Customer', value: order.customerEmail || 'Unknown', inline: false },
        { name: 'Items', value: itemsText, inline: false },
        { name: 'Total', value: `$${order.totalAmount}`, inline: true },
        { name: 'Created', value: new Date(order.createdAt || '').toLocaleString(), inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }

  /**
   * Handle /update-order command (admin only)
   */
  private async handleUpdateOrder(interaction: ChatInputCommandInteraction): Promise<void> {
    // Check admin role
    if (!this.isAdmin(interaction)) {
      await interaction.reply({
        content: 'You do not have permission to use this command',
        ephemeral: true,
      });
      return;
    }

    const orderId = interaction.options.getString('order_id');
    const newStatus = interaction.options.getString('status');

    if (!orderId || !newStatus) {
      await interaction.reply({
        content: 'Please provide both order ID and new status',
        ephemeral: true,
      });
      return;
    }

    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(newStatus)) {
      await interaction.reply({
        content: `Invalid status. Valid options: ${validStatuses.join(', ')}`,
        ephemeral: true,
      });
      return;
    }

    try {
      const order = await storage.getOrder(orderId);
      if (!order) {
        await interaction.reply({
          content: `Order #${orderId} not found`,
          ephemeral: true,
        });
        return;
      }

      // Update order status
      await storage.updateOrder(orderId, { status: newStatus });

      const embed = new EmbedBuilder()
        .setColor('#2ecc71')
        .setTitle('Order Updated')
        .addFields(
          { name: 'Order ID', value: `#${orderId}`, inline: true },
          { name: 'New Status', value: newStatus, inline: true },
          { name: 'Updated By', value: interaction.user.username, inline: false }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });

      // Notify in orders channel
      await this.notifyOrderUpdate(orderId, newStatus, order.customerEmail);
    } catch (error) {
      console.error('Error updating order:', error);
      await interaction.reply({
        content: 'Failed to update order',
        ephemeral: true,
      });
    }
  }

  /**
   * Check if user has admin role
   */
  private isAdmin(interaction: CommandInteraction): boolean {
    if (!this.config.adminRoleId) return true; // No admin role configured, allow all

    const member = interaction.member as any;
    return member?.roles?.cache?.has(this.config.adminRoleId) || false;
  }

  /**
   * Send order notification to Discord channel
   */
  async notifyOrderCreated(orderId: string, customerEmail: string, totalAmount: string): Promise<void> {
    if (!this.client || !this.config.ordersChannelId) return;

    try {
      const channel = await this.client.channels.fetch(this.config.ordersChannelId);

      if (!channel || channel.type !== ChannelType.GuildText) return;

      // Fetch full order details for richer notification
      const order = await storage.getOrder(orderId);
      const orderItems = order?.items || [];

      const itemsText = orderItems
        .map((item: any) => `• ${item.productName} (x${item.quantity}) - $${parseFloat(item.price).toFixed(2)}`)
        .join('\n') || 'No items';

      const embed = new EmbedBuilder()
        .setColor('#3498db')
        .setTitle('🛍️ New Order Received')
        .setDescription(`A new order has been placed!`)
        .addFields(
          { name: 'Order ID', value: `#${orderId}`, inline: true },
          { name: 'Status', value: '✅ Completed', inline: true },
          { name: 'Customer Email', value: customerEmail, inline: false },
          { name: 'Items', value: itemsText, inline: false },
          { name: 'Total Amount', value: `💰 $${totalAmount}`, inline: true },
          { name: 'Timestamp', value: new Date().toLocaleString(), inline: true }
        )
        .setFooter({ text: 'AxosShop Order Notification' })
        .setTimestamp();

      await (channel as any).send({ embeds: [embed] });
      console.log(`[Discord] Order notification sent for #${orderId}`);
    } catch (error) {
      console.error('Failed to send Discord notification:', error);
    }
  }

  /**
   * Send order status update notification
   */
  async notifyOrderUpdate(orderId: string, status: string, customerEmail?: string): Promise<void> {
    if (!this.client || !this.config.ordersChannelId) return;

    try {
      const channel = await this.client.channels.fetch(this.config.ordersChannelId);

      if (!channel || channel.type !== ChannelType.GuildText) return;

      const embed = new EmbedBuilder()
        .setColor('#f39c12')
        .setTitle('Order Status Updated')
        .addFields(
          { name: 'Order ID', value: `#${orderId}`, inline: true },
          { name: 'New Status', value: status, inline: true },
          { name: 'Customer', value: customerEmail || 'Unknown', inline: false },
          { name: 'Timestamp', value: new Date().toLocaleString(), inline: false }
        )
        .setTimestamp();

      await (channel as any).send({ embeds: [embed] });
      console.log(`[Discord] Status update notification sent for #${orderId}`);
    } catch (error) {
      console.error('Failed to send Discord notification:', error);
    }
  }

  /**
   * Get Discord service status
   */
  getStatus(): {
    enabled: boolean;
    isInitialized: boolean;
    botName?: string;
  } {
    return {
      enabled: !!this.config.token,
      isInitialized: this.isInitialized,
      botName: this.client?.user?.tag,
    };
  }

  /**
   * Disconnect Discord bot
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.destroy();
      this.isInitialized = false;
    }
  }
}

export const discordService = new DiscordService();
