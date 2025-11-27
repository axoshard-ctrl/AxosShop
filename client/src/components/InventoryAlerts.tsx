import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, AlertCircle, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function InventoryAlerts() {
  const lowStockProducts = [
    { id: 1, name: "Wireless Headphones", stock: 3, threshold: 10 },
    { id: 2, name: "USB-C Cable", stock: 5, threshold: 20 },
    { id: 3, name: "Phone Case", stock: 2, threshold: 15 },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Inventory Alerts
          </CardTitle>
          <CardDescription>
            Products running low on stock
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {lowStockProducts.map((product) => (
            <div
              key={product.id}
              className="p-4 border border-orange-200 bg-orange-50 dark:bg-orange-950/20 rounded-lg flex items-center justify-between"
            >
              <div>
                <p className="font-medium text-foreground">{product.name}</p>
                <p className="text-sm text-muted-foreground">
                  Only {product.stock} units left (threshold: {product.threshold})
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="destructive" className="gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Low Stock
                </Badge>
                <Button size="sm" variant="outline">
                  Reorder
                </Button>
              </div>
            </div>
          ))}

          <Button className="w-full gap-2 mt-4">
            <Download className="w-4 h-4" />
            Download Restock Report
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
