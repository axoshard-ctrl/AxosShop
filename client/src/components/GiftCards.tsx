import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Gift, Plus, Trash2 } from "lucide-react";
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
  DialogTrigger,
} from "@/components/ui/dialog";

interface GiftCard {
  id: string;
  code: string;
  amount: number;
  balance: number;
  recipientEmail?: string;
  status: "active" | "redeemed" | "expired";
  createdAt: string;
  expiresAt: string;
}

export function GiftCards() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [amount, setAmount] = useState("25");
  const [recipientEmail, setRecipientEmail] = useState("");

  const { data: giftCards, isLoading, refetch } = useQuery<GiftCard[]>({
    queryKey: ["/api/gift-cards"],
  });

  const createGiftCard = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/gift-cards/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(amount),
          recipientEmail: recipientEmail || undefined,
        }),
      });
      if (!response.ok) throw new Error("Failed to create gift card");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Gift card created!", description: "Email sent to recipient" });
      setAmount("25");
      setRecipientEmail("");
      setIsDialogOpen(false);
      refetch();
    },
  });

  const redeemGiftCard = useMutation({
    mutationFn: async (code: string) => {
      const response = await fetch("/api/gift-cards/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!response.ok) throw new Error("Invalid gift card code");
      return response.json();
    },
    onSuccess: (data) => {
      toast({ title: "Success!", description: `${data.amount} added to your account` });
    },
  });

  const activeCards = giftCards?.filter(card => card.status === "active") || [];
  const totalValue = activeCards.reduce((sum, card) => sum + card.balance, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Gift Cards
          </CardTitle>
          <CardDescription>
            Create and manage gift cards
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Active Cards</p>
              <p className="text-2xl font-bold text-foreground">{activeCards.length}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Total Value</p>
              <p className="text-2xl font-bold text-foreground">${totalValue.toFixed(2)}</p>
            </div>
          </div>

          {/* Create Button */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full gap-2">
                <Plus className="w-4 h-4" />
                Create Gift Card
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a Gift Card</DialogTitle>
                <DialogDescription>
                  Gift cards never expire and can be used for any purchase
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Amount</label>
                  <div className="flex items-center gap-2 mt-2">
                    <span>$</span>
                    <Input
                      type="number"
                      min="5"
                      max="500"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="25"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Recipient Email (Optional)</label>
                  <Input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="friend@example.com"
                    className="mt-2"
                  />
                </div>
                <Button
                  onClick={() => createGiftCard.mutate()}
                  disabled={createGiftCard.isPending || !amount}
                  className="w-full"
                >
                  Create & Send
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Gift Cards List */}
          {isLoading ? (
            <div>Loading...</div>
          ) : giftCards && giftCards.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Recipient</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {giftCards.map((card) => (
                    <TableRow key={card.id}>
                      <TableCell className="font-mono text-sm">{card.code}</TableCell>
                      <TableCell>${card.amount.toFixed(2)}</TableCell>
                      <TableCell>${card.balance.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={card.status === "active" ? "default" : "secondary"}>
                          {card.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{card.recipientEmail || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No gift cards yet. Create one to get started!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
