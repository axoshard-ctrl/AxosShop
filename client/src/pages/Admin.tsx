import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminDashboard } from "@/components/AdminDashboard";
import { ReviewModeration } from "@/components/ReviewModeration";
import { AdminInventory } from "@/components/AdminInventory";
import { OrderFulfillment } from "@/components/OrderFulfillment";
import { CouponManagement } from "@/components/CouponManagement";
import { Analytics } from "@/components/Analytics";
import { AdminUserManagement } from "@/components/AdminUserManagement";
import { ProductEditor } from "@/components/ProductEditor";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, ShieldAlert, Search, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/authContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Product, InsertProduct } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function Admin() {
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  const [location, setLocation] = useLocation();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!user) {
      toast({
        title: "Access Denied",
        description: "Please log in to access the admin panel",
        variant: "destructive",
      });
      setLocation("/login");
      return;
    }

    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "You do not have permission to access the admin panel",
        variant: "destructive",
      });
      setLocation("/");
    }
  }, [user, isAdmin, setLocation, toast]);

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertProduct) =>
      apiRequest("POST", "/api/products", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Success",
        description: "Product created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create product",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: InsertProduct }) =>
      apiRequest("PATCH", `/api/products/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest("DELETE", `/api/products/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      apiRequest("PATCH", `/api/products/${id}/toggle`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update product status",
        variant: "destructive",
      });
    },
  });

  const handleSave = async (data: InsertProduct) => {
    if (editingProduct) {
      await updateMutation.mutateAsync({ id: editingProduct.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsEditorOpen(true);
  };

  const handleDelete = async () => {
    if (deletingProductId) {
      await deleteMutation.mutateAsync(deletingProductId);
      setDeletingProductId(null);
    }
  };

  const handleToggleActive = (product: Product) => {
    toggleActiveMutation.mutate({
      id: product.id,
      isActive: !product.isActive,
    });
  };

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full p-8 text-center space-y-4">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <ShieldAlert className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Access Restricted</h2>
            <p className="text-muted-foreground mt-2">
              Admin access is limited to authorized personnel only.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const style = {
    "--sidebar-width": "16rem",
  };

  // Determine which page to show
  const isProductsPage = location === "/admin/products" || location === "/admin";
  const isDashboardPage = location === "/admin/dashboard";
  const isOrdersPage = location === "/admin/orders";
  const isReviewsPage = location === "/admin/reviews";
  const isAnalyticsPage = location === "/admin/analytics";
  const isInventoryPage = location === "/admin/inventory";
  const isCouponsPage = location === "/admin/coupons";
  const isUsersPage = location === "/admin/users";

  // Get page title
  const getPageTitle = () => {
    if (isDashboardPage) return { title: "Sales Dashboard", desc: "Monitor store performance" };
    if (isInventoryPage) return { title: "Inventory", desc: "Manage stock levels" };
    if (isOrdersPage) return { title: "Orders", desc: "Track customer orders" };
    if (isReviewsPage) return { title: "Review Moderation", desc: "Manage product reviews" };
    if (isAnalyticsPage) return { title: "Analytics", desc: "View detailed analytics" };
    if (isCouponsPage) return { title: "Coupons", desc: "Create and manage promotions" };
    if (isUsersPage) return { title: "User Management", desc: "Manage customer accounts" };
    return { title: "Product Management", desc: "Add, edit, and manage products" };
  };

  const pageInfo = getPageTitle();

  // Filter products based on search
  const filteredProducts = products?.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full bg-background">
        <AdminSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Modern Header */}
          <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center justify-between gap-4 p-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger data-testid="button-sidebar-toggle" className="lg:hidden" />
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    {pageInfo.title}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {pageInfo.desc}
                  </p>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
              {isDashboardPage ? (
                <AdminDashboard />
              ) : isInventoryPage ? (
                <AdminInventory />
              ) : isOrdersPage ? (
                <OrderFulfillment />
              ) : isCouponsPage ? (
                <CouponManagement />
              ) : isReviewsPage ? (
                <ReviewModeration />
              ) : isAnalyticsPage ? (
                <Analytics />
              ) : isUsersPage ? (
                <AdminUserManagement />
              ) : (
                <div className="space-y-6">
                  {/* Products Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search products by name or description..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Button
                      onClick={() => {
                        setEditingProduct(null);
                        setIsEditorOpen(true);
                      }}
                      className="whitespace-nowrap"
                      data-testid="button-add-product"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  </div>

                  {/* Products Count */}
                  <div className="text-sm text-muted-foreground">
                    {isLoading ? (
                      <Skeleton className="h-4 w-32" />
                    ) : (
                      <p>
                        Showing <span className="font-semibold text-foreground">{filteredProducts.length}</span> of{" "}
                        <span className="font-semibold text-foreground">{products?.length || 0}</span> products
                      </p>
                    )}
                  </div>

                  {/* Products Table */}
                  <Card className="overflow-hidden">
                    {isLoading ? (
                      <div className="p-6 space-y-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Skeleton key={i} className="h-16 w-full" />
                        ))}
                      </div>
                    ) : filteredProducts.length > 0 ? (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="hover:bg-transparent">
                              <TableHead className="w-12">Image</TableHead>
                              <TableHead className="min-w-48">Name</TableHead>
                              <TableHead>Price</TableHead>
                              <TableHead className="text-center">Stock</TableHead>
                              <TableHead className="text-center">Active</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredProducts.map((product) => (
                              <TableRow
                                key={product.id}
                                className="hover:bg-muted/50 transition-colors"
                                data-testid={`row-product-${product.id}`}
                              >
                                <TableCell>
                                  <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="h-10 w-10 object-cover rounded-md border"
                                  />
                                </TableCell>
                                <TableCell>
                                  <div className="font-medium text-foreground">{product.name}</div>
                                  <div className="text-xs text-muted-foreground truncate">
                                    {product.description?.substring(0, 50)}
                                  </div>
                                </TableCell>
                                <TableCell className="font-semibold">
                                  ${parseFloat(product.price).toFixed(2)}
                                </TableCell>
                                <TableCell className="text-center">
                                  <span className={product.stock > 10 ? "text-green-600 font-medium" : product.stock > 0 ? "text-yellow-600 font-medium" : "text-red-600 font-medium"}>
                                    {product.stock}
                                  </span>
                                </TableCell>
                                <TableCell className="text-center">
                                  <Switch
                                    checked={product.isActive}
                                    onCheckedChange={() => handleToggleActive(product)}
                                    data-testid={`switch-active-${product.id}`}
                                  />
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="hover:bg-muted hover:text-foreground"
                                      onClick={() => handleEdit(product)}
                                      data-testid={`button-edit-${product.id}`}
                                    >
                                      <Pencil className="h-4 w-4" />
                                      <span className="sr-only">Edit</span>
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                                      onClick={() => setDeletingProductId(product.id)}
                                      data-testid={`button-delete-${product.id}`}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      <span className="sr-only">Delete</span>
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="p-12 text-center space-y-4">
                        <Package className="h-12 w-12 text-muted-foreground mx-auto opacity-50" />
                        <div>
                          <p className="text-lg font-medium text-foreground">
                            {searchQuery ? "No products found" : "No products yet"}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {searchQuery
                              ? "Try adjusting your search criteria"
                              : "Add your first product to get started"}
                          </p>
                        </div>
                      </div>
                    )}
                  </Card>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      <ProductEditor
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSave}
        product={editingProduct}
      />

      <AlertDialog
        open={!!deletingProductId}
        onOpenChange={(open) => !open && setDeletingProductId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} data-testid="button-confirm-delete">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}
