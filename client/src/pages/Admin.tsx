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
import { BulkProductImport } from "@/components/BulkProductImport";
import { AbandonedCartManagement } from "@/components/AbandonedCartManagement";
import { CustomerAnalyticsDashboard } from "@/components/CustomerAnalyticsDashboard";
import { ProductEditor } from "@/components/ProductEditor";
import { Sitemap } from "@/components/Sitemap";
import { TwoFactorAuth } from "@/components/TwoFactorAuth";
import { LiveChat } from "@/components/LiveChat";
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
import { useLanguage, t } from '@/lib/languageContext';
import { useAuth } from "@/lib/authContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Product, InsertProduct } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function Admin() {
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  const { language } = useLanguage();
  const [location, setLocation] = useLocation();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!user) {
      toast({
        title: t('admin.access_denied_title', language),
        description: t('admin.access_denied_desc', language),
        variant: "destructive",
      });
      setLocation("/login");
      return;
    }

    if (!isAdmin) {
      toast({
        title: t('admin.access_denied_title', language),
        description: t('admin.no_permission_desc', language),
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
        title: t('common.success', language),
        description: t('admin.product_created', language),
      });
    },
    onError: () => {
      toast({
        title: t('common.error', language),
        description: t('admin.product_create_failed', language),
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
        title: t('common.success', language),
        description: t('admin.product_updated', language),
      });
    },
    onError: () => {
      toast({
        title: t('common.error', language),
        description: t('admin.product_update_failed', language),
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
        title: t('common.success', language),
        description: t('admin.product_deleted', language),
      });
    },
    onError: () => {
      toast({
        title: t('common.error', language),
        description: t('admin.product_delete_failed', language),
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
        title: t('common.error', language),
        description: t('admin.update_status_failed', language),
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
    if (user && !isAdmin) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Card className="max-w-md w-full p-8 text-center space-y-4">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <ShieldAlert className="h-8 w-8 text-destructive" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{t('admin.title', language)}</h2>
              <p className="text-muted-foreground mt-2">
                {t('admin.no_permission_desc', language)}
              </p>
            </div>
          </Card>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full p-8 text-center space-y-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-16 w-full" />
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
  const isBulkImportPage = location === "/admin/bulk-import";
  const isAbandonedCartsPage = location === "/admin/abandoned-carts";
  const isCustomerAnalyticsPage = location === "/admin/customer-analytics";
  const isGiftCardsPage = location === "/admin/gift-cards";
  const isSitemapPage = location === "/admin/sitemap";

  // Get page title
  const getPageTitle = () => {
    if (isDashboardPage) return { title: t('admin.analytics', language), desc: 'Monitor store performance' };
    if (isInventoryPage) return { title: t('admin.inventory', language), desc: 'Manage stock levels' };
    if (isOrdersPage) return { title: t('admin.orders', language), desc: 'Track customer orders' };
    if (isReviewsPage) return { title: t('admin.reviews', language), desc: 'Manage product reviews' };
    if (isAnalyticsPage) return { title: t('admin.analytics', language), desc: 'View detailed analytics' };
    if (isCouponsPage) return { title: t('admin.coupons', language), desc: 'Create and manage promotions' };
    if (isUsersPage) return { title: t('admin.users', language), desc: 'Manage customer accounts' };
    if (isBulkImportPage) return { title: t('admin.import_csv', language), desc: 'Import multiple products at once' };
    if (isAbandonedCartsPage) return { title: t('admin.reports', language), desc: 'Recover lost sales with recovery emails' };
    if (isCustomerAnalyticsPage) return { title: t('admin.analytics', language), desc: 'Understand your customers better' };
    if (isGiftCardsPage) return { title: t('admin.export_csv', language), desc: 'Create and manage gift cards' };
    if (isSitemapPage) return { title: t('admin.settings', language), desc: 'Manage XML sitemaps for SEO' };
    return { title: t('admin.create_product', language), desc: 'Add, edit, and manage products' };
  };

  const pageInfo = getPageTitle();

  // Filter products based on search
  const filteredProducts = products?.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <>
      <SidebarProvider style={style as React.CSSProperties}>
        <AdminSidebar />
        <div className="flex flex-col flex-1 overflow-hidden w-full">
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
              ) : isBulkImportPage ? (
                <BulkProductImport />
              ) : isAbandonedCartsPage ? (
                <AbandonedCartManagement />
              ) : isCustomerAnalyticsPage ? (
                <CustomerAnalyticsDashboard />
              ) : isGiftCardsPage ? (
                <GiftCards />
              ) : isSitemapPage ? (
                <Sitemap />
              ) : (
                <div className="space-y-6">
                  {/* Products Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder={t('admin.search_placeholder', language)}
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
                      {t('admin.add_product', language)}
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
                              <TableHead className="w-12">{t('admin.image', language)}</TableHead>
                              <TableHead className="min-w-48">{t('admin.name', language)}</TableHead>
                              <TableHead>{t('admin.price', language)}</TableHead>
                              <TableHead className="text-center">{t('admin.stock', language)}</TableHead>
                              <TableHead className="text-center">{t('admin.active', language)}</TableHead>
                              <TableHead className="text-right">{t('admin.actions', language)}</TableHead>
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
                                      <span className="sr-only">{t('admin.edit', language)}</span>
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                                      onClick={() => setDeletingProductId(product.id)}
                                      data-testid={`button-delete-${product.id}`}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      <span className="sr-only">{t('admin.delete', language)}</span>
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
                            {searchQuery ? t('admin.no_products_found', language) : t('admin.no_products_yet', language)}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {searchQuery
                              ? t('admin.try_adjust_search', language)
                              : t('admin.add_first_product', language)}
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
      </SidebarProvider>

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
            <AlertDialogTitle>{t('admin.are_you_sure', language)}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('admin.delete_confirm_desc', language)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">{t('common.cancel', language)}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} data-testid="button-confirm-delete">
              {t('admin.delete', language)}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
