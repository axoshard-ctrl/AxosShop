import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Send, Eye, CheckCircle, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface EmailCampaign {
  id: string;
  name: string;
  type: "post-purchase" | "birthday" | "winback" | "upsell";
  status: "active" | "paused" | "completed";
  recipientCount: number;
  sentCount: number;
  openRate: number;
  clickRate: number;
  lastSent: string;
}

export function EmailMarketing() {
  const { data: campaigns, isLoading } = useQuery<EmailCampaign[]>({
    queryKey: ["/api/admin/email-campaigns"],
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const stats = {
    totalCampaigns: campaigns?.length || 0,
    totalSent: campaigns?.reduce((sum, c) => sum + c.sentCount, 0) || 0,
    avgOpenRate: campaigns ? (campaigns.reduce((sum, c) => sum + c.openRate, 0) / campaigns.length).toFixed(1) : 0,
    avgClickRate: campaigns ? (campaigns.reduce((sum, c) => sum + c.clickRate, 0) / campaigns.length).toFixed(1) : 0,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total Campaigns</p>
              <p className="text-2xl font-bold text-foreground mt-2">{stats.totalCampaigns}</p>
            </div>
            <Mail className="h-5 w-5 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total Sent</p>
              <p className="text-2xl font-bold text-foreground mt-2">{stats.totalSent}</p>
            </div>
            <Send className="h-5 w-5 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Avg Open Rate</p>
              <p className="text-2xl font-bold text-foreground mt-2">{stats.avgOpenRate}%</p>
            </div>
            <Eye className="h-5 w-5 text-purple-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Avg Click Rate</p>
              <p className="text-2xl font-bold text-foreground mt-2">{stats.avgClickRate}%</p>
            </div>
            <CheckCircle className="h-5 w-5 text-orange-500" />
          </div>
        </Card>
      </div>

      {/* Campaign Types */}
      <Card>
        <CardHeader>
          <CardTitle>Email Campaign Types</CardTitle>
          <CardDescription>Automated marketing campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                type: "post-purchase",
                name: "Post-Purchase Follow-ups",
                desc: "Thank you emails with recommendations",
              },
              {
                type: "birthday",
                name: "Birthday/Anniversary",
                desc: "Special offers on customer milestones",
              },
              {
                type: "winback",
                name: "Winback Campaign",
                desc: "Re-engage inactive customers",
              },
              {
                type: "upsell",
                name: "Upsell Sequences",
                desc: "Product recommendations based on purchases",
              },
            ].map((campaign) => (
              <div key={campaign.type} className="p-4 border rounded-lg">
                <h3 className="font-semibold">{campaign.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{campaign.desc}</p>
                <Badge variant="outline" className="mt-3">
                  {campaign.type}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Campaigns */}
      {campaigns && campaigns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead>Open Rate</TableHead>
                    <TableHead>Click Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell className="font-medium">{campaign.name}</TableCell>
                      <TableCell className="text-sm capitalize">{campaign.type}</TableCell>
                      <TableCell>
                        <Badge variant={campaign.status === "active" ? "default" : "secondary"}>
                          {campaign.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{campaign.sentCount}</TableCell>
                      <TableCell>{campaign.openRate.toFixed(1)}%</TableCell>
                      <TableCell>{campaign.clickRate.toFixed(1)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
