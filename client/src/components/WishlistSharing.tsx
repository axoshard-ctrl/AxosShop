import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Share2, Mail, Copy, Check } from "lucide-react";

interface WishlistSharingProps {
  wishlistId: string;
  itemCount: number;
}

export function WishlistSharing({ wishlistId, itemCount }: WishlistSharingProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");

  const shareLink = `${window.location.origin}/wishlist/${wishlistId}`;

  const shareWishlist = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/wishlist/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wishlistId, recipientEmail }),
      });
      if (!response.ok) throw new Error("Failed to share wishlist");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Shared!", description: "Wishlist shared successfully" });
      setRecipientEmail("");
    },
  });

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied!", description: "Wishlist link copied to clipboard" });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="w-4 h-4" />
          Share Wishlist
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Your Wishlist</DialogTitle>
          <DialogDescription>
            Share your {itemCount} wishlist items with friends and family
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Copy Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Share Link</label>
            <div className="flex gap-2">
              <Input value={shareLink} readOnly className="text-sm" />
              <Button
                onClick={copyLink}
                size="sm"
                variant="outline"
                className="gap-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Email Share */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Send via Email</label>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="friend@example.com"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
              />
              <Button
                onClick={() => shareWishlist.mutate()}
                disabled={shareWishlist.isPending || !recipientEmail}
                size="sm"
                className="gap-2"
              >
                <Mail className="w-4 h-4" />
                Send
              </Button>
            </div>
          </div>

          {/* Social Share */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-xs">Share on Social Media</label>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm">
                Facebook
              </Button>
              <Button variant="outline" size="sm">
                Twitter
              </Button>
              <Button variant="outline" size="sm">
                Pinterest
              </Button>
            </div>
          </div>

          {/* Import from other sites */}
          <div className="pt-4 border-t">
            <label className="text-sm font-medium">Import from Other Sites</label>
            <div className="flex gap-2 mt-2 flex-wrap">
              {["Amazon", "Target", "Etsy"].map((site) => (
                <Badge key={site} variant="outline" className="cursor-pointer hover:bg-muted">
                  {site}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
