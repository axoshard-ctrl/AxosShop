import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Mail, Send, CheckCircle2, Clock } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface AbandonedCart {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  cartItems: Array<{ productId: string; name: string; quantity: number; price: number }>;
  cartValue: number;
  abandonedAt: string;
  reminderSentAt?: string;
  recovered: boolean;
}

export function AbandonedCartManagement() {
  const { toast } = useToast();
  const [selectedCart, setSelectedCart] = useState<AbandonedCart | null>(null);

  const { data: abandonedCarts, isLoading, refetch } = useQuery<AbandonedCart[]>({
    queryKey: ["/api/admin/abandoned-carts"],
    queryFn: async () => {
      const response = await fetch("/api/admin/abandoned-carts");
      if (!response.ok) throw new Error("Failed to fetch abandoned carts");
      return response.json();
    },
  });

  const sendReminder = useMutation({
    mutationFn: async (cartId: string) => {
      const response = await fetch(`/api/admin/abandoned-carts/${cartId}/send-reminder`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to send reminder");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Reminder email sent successfully",
      });
      refetch();
      setSelectedCart(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send reminder email",
        variant: "destructive",
      });
    },
  });

  const sendBulkReminders = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/admin/abandoned-carts/send-all-reminders", {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to send reminders");
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `Sent ${data.count} reminder emails`,
      });
      refetch();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send bulk reminders",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const unrecoveredCarts = abandonedCarts?.filter(c => !c.recovered) || [];
  const totalValue = unrecoveredCarts.reduce((sum, c) => sum + c.cartValue, 0);
  const remindersSent = unrecoveredCarts.filter(c => c.reminderSentAt).length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Abandoned Carts</p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {unrecoveredCarts.length}
              </p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
              <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Value</p>
              <p className="text-3xl font-bold text-foreground mt-2">
                ${totalValue.toFixed(2)}
              </p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Reminders Sent</p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {remindersSent}
              </p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <Send className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          onClick={() => sendBulkReminders.mutate()}
          disabled={sendBulkReminders.isPending || unrecoveredCarts.length === 0}
          className="gap-2"
        >
          <Send className="w-4 h-4" />
          Send All Reminders
        </Button>
      </div>

      {/* Abandoned Carts Table */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Abandoned Carts</h3>
        {unrecoveredCarts.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Cart Value</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Abandoned</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unrecoveredCarts.map((cart) => (
                  <TableRow key={cart.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{cart.userName}</p>
                        <p className="text-xs text-muted-foreground">{cart.userEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-foreground">
                      ${cart.cartValue.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {cart.cartItems.length} item{cart.cartItems.length !== 1 ? "s" : ""}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(cart.abandonedAt), "MMM d, h:mm a")}
                    </TableCell>
                    <TableCell>
                      {cart.reminderSentAt ? (
                        <Badge variant="outline" className="gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Reminded
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Not Sent</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedCart(cart)}
                        disabled={sendReminder.isPending}
                      >
                        {cart.reminderSentAt ? "Resend" : "Send"} Reminder
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No abandoned carts
          </div>
        )}
      </Card>

      {/* Send Reminder Dialog */}
      {selectedCart && (
        <AlertDialog open={!!selectedCart} onOpenChange={() => setSelectedCart(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Send Reminder Email</AlertDialogTitle>
              <AlertDialogDescription>
                Send recovery email to {selectedCart.userName} ({selectedCart.userEmail})?
                <div className="mt-4 space-y-2 text-sm text-foreground">
                  <p>Cart Value: <span className="font-semibold">${selectedCart.cartValue.toFixed(2)}</span></p>
                  <p>Items: <span className="font-semibold">{selectedCart.cartItems.length}</span></p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => sendReminder.mutate(selectedCart.id)}
              disabled={sendReminder.isPending}
            >
              Send Reminder
            </AlertDialogAction>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
