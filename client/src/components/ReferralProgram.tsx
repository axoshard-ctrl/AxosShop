import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Share2, Copy, Check, Users } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Referral {
  id: string;
  referralCode: string;
  referredEmails: string[];
  successfulReferrals: number;
  totalRewards: number;
  createdAt: string;
}

export function ReferralProgram() {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const { data: referralData, isLoading } = useQuery<Referral>({
    queryKey: ["/api/user/referral"],
  });

  const sendInvite = useMutation({
    mutationFn: async (email: string) => {
      const response = await fetch("/api/referral/send-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) throw new Error("Failed to send invite");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Invite sent!", description: "Your friend will receive the referral link" });
    },
  });

  const copyReferralLink = () => {
    if (referralData?.referralCode) {
      const link = `${window.location.origin}/signup?ref=${referralData.referralCode}`;
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Copied!", description: "Referral link copied to clipboard" });
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Referral Program
          </CardTitle>
          <CardDescription>
            Earn rewards by referring friends
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Referral Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-2xl font-bold text-foreground">{referralData?.successfulReferrals || 0}</p>
              <p className="text-xs text-muted-foreground">Successful Referrals</p>
            </div>
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-2xl font-bold text-foreground">${referralData?.totalRewards || 0}</p>
              <p className="text-xs text-muted-foreground">Total Rewards</p>
            </div>
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-2xl font-bold text-foreground">{referralData?.referredEmails?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Invites Sent</p>
            </div>
          </div>

          {/* Referral Link */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Your Referral Link</label>
            <div className="flex gap-2">
              <Input
                value={
                  referralData?.referralCode
                    ? `${window.location.origin}/signup?ref=${referralData.referralCode}`
                    : ""
                }
                readOnly
                className="text-sm"
              />
              <Button
                onClick={copyReferralLink}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Share this link with friends to earn $10 for each successful signup
            </p>
          </div>

          {/* Share Buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="w-4 h-4" />
              Share on Facebook
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="w-4 h-4" />
              Share on Twitter
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="w-4 h-4" />
              Share via Email
            </Button>
          </div>

          {/* Recent Referrals */}
          {referralData?.referredEmails && referralData.referredEmails.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Recent Referrals</h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reward</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referralData.referredEmails.map((email, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="text-sm">{email}</TableCell>
                        <TableCell>
                          <Badge>Pending</Badge>
                        </TableCell>
                        <TableCell>$10</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
