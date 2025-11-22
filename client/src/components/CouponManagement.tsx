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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Edit, Percent, DollarSign, Copy } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface Coupon {
  id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  maxUses?: number;
  usedCount: number;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
}

export function CouponManagement() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: 10,
    maxUses: 0,
    expiresAt: "",
  });

  const { data: coupons, isLoading } = useQuery<Coupon[]>({
    queryKey: ["/api/admin/coupons"],
    queryFn: async () => {
      const response = await fetch("/api/admin/coupons");
      if (!response.ok) throw new Error("Failed to fetch coupons");
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) =>
      apiRequest("POST", "/api/admin/coupons", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] });
      toast({ title: "Success", description: "Coupon created successfully" });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create coupon",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: typeof formData & { id: string }) =>
      apiRequest("PATCH", `/api/admin/coupons/${data.id}`, {
        code: data.code,
        discountType: data.discountType,
        discountValue: data.discountValue,
        maxUses: data.maxUses || null,
        expiresAt: data.expiresAt || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] });
      toast({ title: "Success", description: "Coupon updated successfully" });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update coupon",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest("DELETE", `/api/admin/coupons/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] });
      toast({ title: "Success", description: "Coupon deleted successfully" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete coupon",
        variant: "destructive",
      });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (data: { id: string; isActive: boolean }) =>
      apiRequest("PATCH", `/api/admin/coupons/${data.id}`, {
        isActive: data.isActive,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update coupon status",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      code: "",
      discountType: "percentage",
      discountValue: 10,
      maxUses: 0,
      expiresAt: "",
    });
    setEditingCoupon(null);
  };

  const handleOpenDialog = (coupon?: Coupon) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData({
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        maxUses: coupon.maxUses || 0,
        expiresAt: coupon.expiresAt?.split("T")[0] || "",
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.code.trim()) {
      toast({
        title: "Error",
        description: "Coupon code is required",
        variant: "destructive",
      });
      return;
    }

    if (formData.discountValue <= 0) {
      toast({
        title: "Error",
        description: "Discount value must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    if (formData.discountType === "percentage" && formData.discountValue > 100) {
      toast({
        title: "Error",
        description: "Percentage discount cannot exceed 100%",
        variant: "destructive",
      });
      return;
    }

    if (editingCoupon) {
      updateMutation.mutate({
        ...formData,
        id: editingCoupon.id,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const activeCoupons = coupons?.filter((c) => c.isActive).length || 0;
  const totalDiscount = coupons?.reduce(
    (sum, c) =>
      sum +
      (c.discountType === "percentage"
        ? c.discountValue
        : c.discountValue * c.usedCount),
    0
  ) || 0;
  const totalUsed = coupons?.reduce((sum, c) => sum + c.usedCount, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Coupon Management</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage promotional coupons
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          New Coupon
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Active Coupons */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Coupons</p>
              <p className="text-2xl font-bold text-foreground mt-2">
                {isLoading ? "..." : activeCoupons}
              </p>
            </div>
            <Percent className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
        </Card>

        {/* Total Coupons */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Coupons</p>
              <p className="text-2xl font-bold text-foreground mt-2">
                {isLoading ? "..." : coupons?.length || 0}
              </p>
            </div>
            <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
        </Card>

        {/* Total Used */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Times Used</p>
              <p className="text-2xl font-bold text-foreground mt-2">
                {isLoading ? "..." : totalUsed}
              </p>
            </div>
            <Copy className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
        </Card>

        {/* Total Value */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Est. Discounts</p>
              <p className="text-2xl font-bold text-foreground mt-2">
                {isLoading ? "..." : Math.round(totalDiscount)}
              </p>
            </div>
            <Percent className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
        </Card>
      </div>

      {/* Coupons Table */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Coupons</h3>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : coupons && coupons.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Code
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Discount
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Usage Limit
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Used
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Expires
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Status
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr
                    key={coupon.id}
                    className="border-b hover:bg-muted/50 transition"
                  >
                    <td className="py-3 px-4">
                      <code className="bg-muted px-2 py-1 rounded text-foreground font-semibold">
                        {coupon.code}
                      </code>
                    </td>
                    <td className="py-3 px-4 text-center text-foreground font-medium">
                      {coupon.discountType === "percentage"
                        ? `${coupon.discountValue}%`
                        : `$${coupon.discountValue}`}
                    </td>
                    <td className="py-3 px-4 text-center text-foreground">
                      {coupon.maxUses ? coupon.maxUses : "Unlimited"}
                    </td>
                    <td className="py-3 px-4 text-center text-foreground font-medium">
                      {coupon.usedCount}
                    </td>
                    <td className="py-3 px-4 text-center text-sm text-muted-foreground">
                      {coupon.expiresAt
                        ? format(new Date(coupon.expiresAt), "MMM d, yyyy")
                        : "No expiry"}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Button
                        variant={coupon.isActive ? "default" : "outline"}
                        size="sm"
                        onClick={() =>
                          toggleStatusMutation.mutate({
                            id: coupon.id,
                            isActive: !coupon.isActive,
                          })
                        }
                      >
                        {coupon.isActive ? "Active" : "Inactive"}
                      </Button>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(coupon)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => deleteMutation.mutate(coupon.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            No coupons yet. Create one to get started!
          </div>
        )}
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCoupon ? "Edit Coupon" : "Create Coupon"}
            </DialogTitle>
            <DialogDescription>
              {editingCoupon
                ? "Update coupon details"
                : "Create a new promotional coupon"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Coupon Code</label>
              <Input
                placeholder="e.g., SAVE20"
                value={formData.code}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    code: e.target.value.toUpperCase(),
                  })
                }
                className="mt-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Discount Type</label>
                <Select
                  value={formData.discountType}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      discountType: value as "percentage" | "fixed",
                    })
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Value</label>
                <Input
                  type="number"
                  placeholder="Amount"
                  value={formData.discountValue}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discountValue: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Usage Limit (0 = unlimited)</label>
              <Input
                type="number"
                placeholder="0"
                value={formData.maxUses}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxUses: parseInt(e.target.value) || 0,
                  })
                }
                className="mt-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Expiration Date (optional)</label>
              <Input
                type="date"
                value={formData.expiresAt}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    expiresAt: e.target.value,
                  })
                }
                className="mt-2"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={
                  createMutation.isPending || updateMutation.isPending
                }
              >
                {editingCoupon ? "Update" : "Create"} Coupon
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
