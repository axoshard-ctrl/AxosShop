import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  Plus,
  Minus,
  Save,
  Package,
  TrendingDown,
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Product } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const LOW_STOCK_THRESHOLD = 10;

export function AdminInventory() {
  const { toast } = useToast();
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [stockChanges, setStockChanges] = useState<Record<string, number>>({});
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    queryFn: async () => {
      const response = await fetch("/api/products");
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json();
    },
  });

  const updateStockMutation = useMutation({
    mutationFn: (data: { id: string; newStock: number }) =>
      apiRequest("PATCH", `/api/products/${data.id}`, { stock: data.newStock }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Success",
        description: "Stock updated successfully",
      });
      setEditingProductId(null);
      setStockChanges({});
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update stock",
        variant: "destructive",
      });
    },
  });

  const handleStockChange = (productId: string, delta: number) => {
    const product = products?.find((p) => p.id === productId);
    if (!product) return;

    const currentStock = parseInt(product.stock.toString());
    const newStock = Math.max(0, currentStock + (stockChanges[productId] || 0) + delta);

    setStockChanges({
      ...stockChanges,
      [productId]: newStock - currentStock,
    });
  };

  const handleSaveStock = (productId: string) => {
    const product = products?.find((p) => p.id === productId);
    if (!product) return;

    const delta = stockChanges[productId] || 0;
    const newStock = parseInt(product.stock.toString()) + delta;

    updateStockMutation.mutate({ id: productId, newStock });
  };

  const handleBulkRestock = (product: Product) => {
    const restockAmount = 50;
    const newStock = parseInt(product.stock.toString()) + restockAmount;
    updateStockMutation.mutate({ id: product.id, newStock });
  };

  const filteredProducts = products?.filter((p) => {
    const stock = parseInt(p.stock.toString());
    return filterLowStock ? stock <= LOW_STOCK_THRESHOLD : true;
  }) || [];

  const lowStockProducts = products?.filter(
    (p) => parseInt(p.stock.toString()) <= LOW_STOCK_THRESHOLD
  ) || [];

  const outOfStockProducts = products?.filter(
    (p) => parseInt(p.stock.toString()) === 0
  ) || [];

  const totalStock = products?.reduce(
    (sum, p) => sum + parseInt(p.stock.toString()),
    0
  ) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Inventory Management</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor and manage product stock levels
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Stock */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Stock</p>
              <p className="text-2xl font-bold text-foreground mt-2">
                {isLoading ? "..." : totalStock}
              </p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        {/* Products in Stock */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Products in Stock</p>
              <p className="text-2xl font-bold text-foreground mt-2">
                {isLoading ? "..." : products?.length || 0}
              </p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <Plus className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        {/* Low Stock Alert */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Low Stock Items</p>
              <p className="text-2xl font-bold text-foreground mt-2">
                {isLoading ? "..." : lowStockProducts.length}
              </p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </Card>

        {/* Out of Stock */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Out of Stock</p>
              <p className="text-2xl font-bold text-foreground mt-2">
                {isLoading ? "..." : outOfStockProducts.length}
              </p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-red-100 dark:bg-red-900 flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-4 items-center">
        <Button
          variant={filterLowStock ? "default" : "outline"}
          onClick={() => setFilterLowStock(!filterLowStock)}
        >
          {filterLowStock ? "Showing Low Stock Only" : "Show Low Stock"}
        </Button>
        <span className="text-sm text-muted-foreground">
          Low stock threshold: {LOW_STOCK_THRESHOLD} units
        </span>
      </div>

      {/* Inventory Table */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Product Inventory</h3>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Product
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Category
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Current Stock
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Status
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Adjust Stock
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const currentStock = parseInt(product.stock.toString());
                  const adjustedStock = currentStock + (stockChanges[product.id] || 0);
                  const isEditing = editingProductId === product.id;
                  const isLowStock = currentStock <= LOW_STOCK_THRESHOLD;
                  const isOutOfStock = currentStock === 0;

                  return (
                    <tr
                      key={product.id}
                      className={`border-b hover:bg-muted/50 transition ${
                        isOutOfStock ? "bg-red-50 dark:bg-red-950/20" : ""
                      } ${isLowStock ? "bg-yellow-50 dark:bg-yellow-950/20" : ""}`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-10 w-10 object-cover rounded-md"
                          />
                          <div>
                            <p className="font-medium text-foreground">{product.name}</p>
                            <p className="text-xs text-muted-foreground">{product.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-foreground capitalize">
                        {product.category}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isEditing ? (
                          <Input
                            type="number"
                            value={adjustedStock}
                            readOnly
                            className="w-20 text-center"
                          />
                        ) : (
                          <span className="font-semibold text-foreground">
                            {currentStock}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                            Out of Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                            In Stock
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleStockChange(product.id, -1)
                              }
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-12 text-center font-semibold">
                              {adjustedStock}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleStockChange(product.id, 1)
                              }
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingProductId(product.id);
                              setStockChanges({});
                            }}
                          >
                            Edit
                          </Button>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {isEditing ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() =>
                                handleSaveStock(product.id)
                              }
                              disabled={updateStockMutation.isPending}
                            >
                              <Save className="h-4 w-4 mr-1" />
                              Save
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingProductId(null);
                                setStockChanges({});
                              }}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleBulkRestock(product)}
                            disabled={updateStockMutation.isPending}
                          >
                            Restock +50
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            No products found
            {filterLowStock && " with low stock"}
          </div>
        )}
      </Card>

      {/* Low Stock Alert Section */}
      {lowStockProducts.length > 0 && (
        <Card className="p-6 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
                Low Stock Alert
              </h3>
              <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-2">
                {lowStockProducts.length} product{lowStockProducts.length !== 1 ? "s" : ""} have
                low stock levels (≤ {LOW_STOCK_THRESHOLD} units). Consider restocking these items.
              </p>
              <div className="mt-4 space-y-2">
                {lowStockProducts.slice(0, 5).map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-yellow-900 dark:text-yellow-100">
                      {product.name}
                    </span>
                    <span className="font-semibold text-yellow-900 dark:text-yellow-100">
                      {product.stock} units
                    </span>
                  </div>
                ))}
                {lowStockProducts.length > 5 && (
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    ... and {lowStockProducts.length - 5} more
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
