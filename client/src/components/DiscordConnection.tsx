import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Link as LinkIcon, LogOut } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  getDiscordAuthUrl,
  getDiscordBotInviteUrl,
  getDiscordProfile,
  disconnectDiscord,
  DiscordUser,
} from '@/lib/discordUtils';
import { useToast } from '@/hooks/use-toast';

export function DiscordConnection() {
  const [isConnected, setIsConnected] = useState(false);
  const [profile, setProfile] = useState<DiscordUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const discordProfile = await getDiscordProfile();
      if (discordProfile) {
        setIsConnected(true);
        setProfile(discordProfile);
      }
    } catch (error) {
      console.error('Error checking Discord connection:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = () => {
    const authUrl = getDiscordAuthUrl();
    if (authUrl) {
      window.location.href = authUrl;
    } else {
      toast({
        title: 'Configuration Error',
        description: 'Discord OAuth is not configured. Please set VITE_DISCORD_CLIENT_ID.',
        variant: 'destructive',
      });
    }
  };

  const handleDisconnect = async () => {
    try {
      const success = await disconnectDiscord();
      if (success) {
        setIsConnected(false);
        setProfile(null);
        toast({
          title: 'Disconnected',
          description: 'Your Discord account has been disconnected.',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to disconnect Discord account.',
        variant: 'destructive',
      });
    }
  };

  const handleJoinServer = () => {
    window.open(getDiscordBotInviteUrl(), '_blank');
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Discord Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Loading Discord status...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>🎮</span>
          Discord Integration
        </CardTitle>
        <CardDescription>
          Connect your Discord account to receive order notifications and manage orders via Discord
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isConnected && profile ? (
          <>
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Connected to Discord as <strong>{profile.username}</strong>
              </AlertDescription>
            </Alert>

            <div className="space-y-3 rounded-lg bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Discord User</p>
                  <p className="text-xs text-gray-600">@{profile.username}</p>
                </div>
                {profile.avatar && (
                  <img
                    src={`https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`}
                    alt={profile.username}
                    className="h-10 w-10 rounded-full"
                  />
                )}
              </div>
              {profile.email && (
                <div>
                  <p className="text-sm text-gray-600">{profile.email}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Commands Available:</p>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• <code className="bg-gray-100 px-2 py-1 rounded">/order-status</code> - Check order status</li>
                <li>• <code className="bg-gray-100 px-2 py-1 rounded">/list-orders</code> - View recent orders</li>
                <li>• <code className="bg-gray-100 px-2 py-1 rounded">/order-details</code> - Get order details</li>
                <li>• <code className="bg-gray-100 px-2 py-1 rounded">/update-order</code> - Update status (admin)</li>
              </ul>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={handleJoinServer} className="gap-2">
                <LinkIcon className="h-4 w-4" />
                Join Test Server
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDisconnect}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Disconnect
              </Button>
            </div>
          </>
        ) : (
          <>
            <Alert className="border-blue-200 bg-blue-50">
              <LinkIcon className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Connect your Discord account to enable order notifications and management
              </AlertDescription>
            </Alert>

            <div className="space-y-3 text-sm text-gray-600">
              <p className="font-medium">Benefits:</p>
              <ul className="list-inside space-y-1">
                <li>✓ Real-time order notifications</li>
                <li>✓ Check order status anytime</li>
                <li>✓ Admin order management</li>
                <li>✓ Order updates in Discord</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Button onClick={handleConnect} className="w-full gap-2" size="lg">
                <span>🎮</span>
                Connect Discord Account
              </Button>
              <Button
                variant="outline"
                onClick={handleJoinServer}
                className="w-full gap-2"
              >
                <LinkIcon className="h-4 w-4" />
                Join Test Server (discord.gg/7Gg5sgUJ5c)
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
