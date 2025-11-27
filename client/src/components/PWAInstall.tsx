import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Download, Bell } from "lucide-react";

export function PWAInstall() {
  const features = [
    "📱 Install as app on your phone",
    "🔔 Push notifications for orders",
    "📴 Browse offline with cached content",
    "⚡ Lightning-fast load times",
    "🔐 Secure like a native app",
    "💾 Automatic updates in background",
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Install as App
          </CardTitle>
          <CardDescription>
            Progressive Web App - Install on any device
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg border">
            <p className="font-semibold mb-2">Get AxosShop App</p>
            <p className="text-sm text-muted-foreground mb-4">
              Download to your home screen and access like a native app
            </p>
            <Button className="gap-2 w-full">
              <Download className="w-4 h-4" />
              Install Now
            </Button>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-sm">App Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {features.map((feature, idx) => (
                <div key={idx} className="text-sm flex items-center gap-2 text-muted-foreground">
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t space-y-3">
            <h3 className="font-semibold text-sm">Notifications</h3>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-sm font-medium">Order Updates</p>
                  <p className="text-xs text-muted-foreground">Shipping & delivery notifications</p>
                </div>
              </div>
              <Badge>Enabled</Badge>
            </div>
          </div>

          <div className="pt-4 border-t space-y-2 text-xs text-muted-foreground">
            <p>Works on:</p>
            <div className="flex gap-2">
              <Badge variant="outline">iOS Safari 15+</Badge>
              <Badge variant="outline">Android Chrome</Badge>
              <Badge variant="outline">Edge</Badge>
              <Badge variant="outline">Firefox</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
