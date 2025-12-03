/**
 * Discord OAuth2 helper functions
 */

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string;
  email?: string;
}

/**
 * Get Discord OAuth2 authorization URL
 */
export function getDiscordAuthUrl(): string {
  const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID;
  if (!clientId) {
    console.warn('VITE_DISCORD_CLIENT_ID not configured');
    return '';
  }

  const redirectUri = `${window.location.origin}/auth/discord/callback`;
  const scopes = ['identify', 'email', 'guilds'];
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scopes.join(' '),
  });

  return `https://discord.com/api/oauth2/authorize?${params}`;
}

/**
 * Exchange Discord code for access token
 */
export async function exchangeDiscordCode(code: string): Promise<any> {
  try {
    const response = await fetch('/api/auth/discord/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange Discord code');
    }

    return await response.json();
  } catch (error) {
    console.error('Discord OAuth error:', error);
    throw error;
  }
}

/**
 * Get current Discord connection status
 */
export async function getDiscordStatus(): Promise<any> {
  try {
    const response = await fetch('/api/discord/status');
    return await response.json();
  } catch (error) {
    console.error('Failed to get Discord status:', error);
    return null;
  }
}

/**
 * Get Discord user profile
 */
export async function getDiscordProfile(): Promise<DiscordUser | null> {
  try {
    const response = await fetch('/api/user/discord-profile');
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Failed to get Discord profile:', error);
    return null;
  }
}

/**
 * Disconnect Discord account
 */
export async function disconnectDiscord(): Promise<boolean> {
  try {
    const response = await fetch('/api/user/disconnect-discord', {
      method: 'POST',
    });
    return response.ok;
  } catch (error) {
    console.error('Failed to disconnect Discord:', error);
    return false;
  }
}

/**
 * Get Discord bot invite URL
 */
export function getDiscordBotInviteUrl(): string {
  const botId = import.meta.env.VITE_DISCORD_BOT_ID;
  if (!botId) {
    return 'https://discord.gg/7Gg5sgUJ5c'; // Fallback to community server
  }

  const params = new URLSearchParams({
    client_id: botId,
    scope: 'bot applications.commands',
    permissions: '274877934592', // Send Messages, Embed Links, Read Message History
  });

  return `https://discord.com/api/oauth2/authorize?${params}`;
}
