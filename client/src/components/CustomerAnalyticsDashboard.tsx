import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { Users, TrendingUp, RefreshCw, DollarSign, Award } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface CustomerSegment {
  name: string;
  count: number;
  avgLTV: number;
  avgOrderValue: number;
  repeatPurchaseRate: number;
}

interface CustomerAnalytics {
  totalCustomers: number;
  activeCustomers: number;
  averageLTV: number;
  totalLTV: number;
  repeatCustomersRate: number;
  segments: CustomerSegment[];
  ltv_trend: Array<{ date: string; value: number }>;
  customerAgeDistribution: Array<{ range: string; count: number }>;
}

const COLORS = ["#8b5cf6", "#ec4899", "#06b6d4", "#f59e0b", "#10b981"];

export function CustomerAnalyticsDashboard() {
  const { data: analytics, isLoading } = useQuery<CustomerAnalytics>({
    queryKey: ["/api/admin/customer-analytics"],
    queryFn: async () => {
      const response = await fetch("/api/admin/customer-analytics");
      if (!response.ok) throw new Error("Failed to fetch customer analytics");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total Customers</p>
              <p className="text-2xl font-bold text-foreground mt-2">
                {analytics?.totalCustomers || 0}
              </p>
            </div>
            <Users className="h-6 w-6 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Active Customers</p>
              <p className="text-2xl font-bold text-foreground mt-2">
                {analytics?.activeCustomers || 0}
              </p>
            </div>
            <TrendingUp className="h-6 w-6 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Avg Customer LTV</p>
              <p className="text-2xl font-bold text-foreground mt-2">
                ${(analytics?.averageLTV || 0).toFixed(0)}
              </p>
            </div>
            <DollarSign className="h-6 w-6 text-purple-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total LTV</p>
              <p className="text-2xl font-bold text-foreground mt-2">
                ${(analytics?.totalLTV || 0).toFixed(0)}
              </p>
            </div>
            <Award className="h-6 w-6 text-amber-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Repeat Purchase Rate</p>
              <p className="text-2xl font-bold text-foreground mt-2">
                {(analytics?.repeatCustomersRate || 0).toFixed(1)}%
              </p>
            </div>
            <RefreshCw className="h-6 w-6 text-pink-500" />
          </div>
        </Card>
      </div>

      {/* Customer Segments */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Customer Segments</h3>
        {analytics?.segments && analytics.segments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4 font-semibold text-muted-foreground">Segment</th>
                  <th className="text-right py-2 px-4 font-semibold text-muted-foreground">Customers</th>
                  <th className="text-right py-2 px-4 font-semibold text-muted-foreground">Avg LTV</th>
                  <th className="text-right py-2 px-4 font-semibold text-muted-foreground">Avg Order Value</th>
                  <th className="text-right py-2 px-4 font-semibold text-muted-foreground">Repeat Rate</th>
                </tr>
              </thead>
              <tbody>
                {analytics.segments.map((segment) => (
                  <tr key={segment.name} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium text-foreground">{segment.name}</td>
                    <td className="py-3 px-4 text-right text-foreground">{segment.count}</td>
                    <td className="py-3 px-4 text-right font-semibold text-foreground">
                      ${segment.avgLTV.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-foreground">
                      ${segment.avgOrderValue.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                        {segment.repeatPurchaseRate.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">No customer segments data</div>
        )}
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LTV Trend */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">LTV Trend</h3>
          {analytics?.ltv_trend && analytics.ltv_trend.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={analytics.ltv_trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: any) => `$${(value as number).toFixed(2)}`} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No data available
            </div>
          )}
        </Card>

        {/* Customer Age Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Customer Age Distribution</h3>
          {analytics?.customerAgeDistribution && analytics.customerAgeDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.customerAgeDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No data available
            </div>
          )}
        </Card>
      </div>

      {/* Segment Distribution */}
      {analytics?.segments && analytics.segments.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Segment Distribution by LTV</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.segments}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, count }) => `${name}: ${count}`}
                outerRadius={80}
                fill="#8b5cf6"
                dataKey="count"
              >
                {analytics.segments.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
}
