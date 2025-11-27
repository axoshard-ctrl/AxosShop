import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
} from "recharts";
import {
  TrendingUp,
  Users,
  ShoppingCart,
  Clock,
  Award,
  Zap,
  Download,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { format, subDays, startOfDay } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface AnalyticsData {
  dailyRevenue: Array<{ date: string; revenue: number; orders: number }>;
  productPerformance: Array<{
    productId: string;
    name: string;
    sales: number;
    revenue: number;
    avgRating: number;
  }>;
  userMetrics: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    conversionRate: number;
  };
  categoryBreakdown: Array<{
    category: string;
    sales: number;
    revenue: number;
  }>;
  customerLoyalty: Array<{
    purchases: number;
    count: number;
  }>;
}

const COLORS = [
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
];

export function Analytics() {
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "all">("30d");

  const getDateRange = () => {
    const now = new Date();
    let from: Date;

    switch (dateRange) {
      case "7d":
        from = subDays(now, 7);
        break;
      case "30d":
        from = subDays(now, 30);
        break;
      case "90d":
        from = subDays(now, 90);
        break;
      default:
        from = subDays(now, 365);
    }

    return {
      dateFrom: startOfDay(from).toISOString(),
      dateTo: startOfDay(now).toISOString(),
    };
  };

  const { dateFrom, dateTo } = getDateRange();

  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/admin/analytics", dateRange],
    queryFn: async () => {
      const response = await fetch(
        `/api/admin/analytics?dateFrom=${dateFrom}&dateTo=${dateTo}`
      );
      if (!response.ok) throw new Error("Failed to fetch analytics");
      return response.json();
    },
  });

  // Export data to CSV
  const handleExportCSV = () => {
    if (!analytics) return;

    const csvContent = [
      ["AxosShop Analytics Report", format(new Date(), "PPP")],
      [],
      ["Key Metrics"],
      ["Total Revenue", `$${analytics.dailyRevenue.reduce((sum, d) => sum + d.revenue, 0).toFixed(2)}`],
      ["Total Orders", analytics.dailyRevenue.reduce((sum, d) => sum + d.orders, 0)],
      ["Conversion Rate", `${(analytics.userMetrics.conversionRate * 100).toFixed(1)}%`],
      [],
      ["Daily Revenue Trend"],
      ["Date", "Revenue", "Orders"],
      ...analytics.dailyRevenue.map(d => [d.date, d.revenue.toFixed(2), d.orders]),
      [],
      ["Top Products"],
      ["Product Name", "Sales", "Revenue", "Avg Rating"],
      ...analytics.productPerformance.map(p => [p.name, p.sales, p.revenue.toFixed(2), p.avgRating.toFixed(1)]),
      [],
      ["Category Breakdown"],
      ["Category", "Sales", "Revenue"],
      ...analytics.categoryBreakdown.map(c => [c.category, c.sales, c.revenue.toFixed(2)]),
    ]
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `analytics-${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const totalRevenue = analytics?.dailyRevenue?.reduce(
    (sum, d) => sum + d.revenue,
    0
  ) || 0;
  const totalOrders = analytics?.dailyRevenue?.reduce(
    (sum, d) => sum + d.orders,
    0
  ) || 0;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const userMetrics = analytics?.userMetrics || {
    totalUsers: 0,
    activeUsers: 0,
    newUsers: 0,
    conversionRate: 0,
  };

  return (
    <div className="space-y-6">
      {/* Header with date range selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Advanced Analytics</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Detailed insights into your store's performance
          </p>
        </div>
        <div className="flex gap-2 items-center">
          {(["7d", "30d", "90d", "all"] as const).map((range) => (
            <Button
              key={range}
              variant={dateRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setDateRange(range)}
            >
              {range === "7d"
                ? "7 Days"
                : range === "30d"
                ? "30 Days"
                : range === "90d"
                ? "90 Days"
                : "All Time"}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={!analytics}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold text-foreground mt-2">
                ${totalRevenue.toFixed(2)}
              </p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>

        {/* Total Orders */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="text-2xl font-bold text-foreground mt-2">
                {totalOrders}
              </p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        {/* Avg Order Value */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Order Value</p>
              <p className="text-2xl font-bold text-foreground mt-2">
                ${avgOrderValue.toFixed(2)}
              </p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <Award className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        {/* Conversion Rate */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Conversion Rate</p>
              <p className="text-2xl font-bold text-foreground mt-2">
                {(userMetrics.conversionRate * 100).toFixed(1)}%
              </p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
              <Zap className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Revenue Trend */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Revenue Trend
        </h3>
        {analytics?.dailyRevenue && analytics.dailyRevenue.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analytics.dailyRevenue}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(date) => format(new Date(date), "MMM d")}
              />
              <YAxis />
              <Tooltip
                formatter={(value: any) => `$${(value as number).toFixed(2)}`}
                labelFormatter={(label) =>
                  format(new Date(label), "MMM d, yyyy")
                }
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#8b5cf6"
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            No data available
          </div>
        )}
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders Over Time */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Orders Over Time
          </h3>
          {analytics?.dailyRevenue && analytics.dailyRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => format(new Date(date), "MMM d")}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(label) =>
                    format(new Date(label), "MMM d, yyyy")
                  }
                />
                <Bar dataKey="orders" fill="#06b6d4" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No data available
            </div>
          )}
        </Card>

        {/* Category Breakdown */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Sales by Category
          </h3>
          {analytics?.categoryBreakdown &&
          analytics.categoryBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={analytics.categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, sales }) => `${category}: ${sales}`}
                  outerRadius={80}
                  fill="#8b5cf6"
                  dataKey="sales"
                >
                  {analytics.categoryBreakdown.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No data available
            </div>
          )}
        </Card>
      </div>

      {/* User Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Users */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total Users</p>
              <p className="text-xl font-bold text-foreground mt-1">
                {userMetrics.totalUsers}
              </p>
            </div>
            <Users className="h-5 w-5 text-blue-500" />
          </div>
        </Card>

        {/* Active Users */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Active Users</p>
              <p className="text-xl font-bold text-foreground mt-1">
                {userMetrics.activeUsers}
              </p>
            </div>
            <Zap className="h-5 w-5 text-green-500" />
          </div>
        </Card>

        {/* New Users */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">New Users</p>
              <p className="text-xl font-bold text-foreground mt-1">
                {userMetrics.newUsers}
              </p>
            </div>
            <TrendingUp className="h-5 w-5 text-purple-500" />
          </div>
        </Card>

        {/* Active Rate */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Active Rate</p>
              <p className="text-xl font-bold text-foreground mt-1">
                {userMetrics.totalUsers > 0
                  ? (
                      (userMetrics.activeUsers / userMetrics.totalUsers) *
                      100
                    ).toFixed(1)
                  : 0}
                %
              </p>
            </div>
            <Clock className="h-5 w-5 text-orange-500" />
          </div>
        </Card>
      </div>

      {/* Top Products */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Top Performing Products
        </h3>
        {analytics?.productPerformance &&
        analytics.productPerformance.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Product Name
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Sales
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Revenue
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Avg Rating
                  </th>
                </tr>
              </thead>
              <tbody>
                {analytics.productPerformance.map((product) => (
                  <tr
                    key={product.productId}
                    className="border-b hover:bg-muted/50 transition"
                  >
                    <td className="py-3 px-4 text-foreground font-medium">
                      {product.name}
                    </td>
                    <td className="py-3 px-4 text-right text-foreground font-semibold">
                      {product.sales}
                    </td>
                    <td className="py-3 px-4 text-right text-foreground font-semibold">
                      ${product.revenue.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                        ⭐ {product.avgRating.toFixed(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            No product data available
          </div>
        )}
      </Card>

      {/* Customer Loyalty */}
      {analytics?.customerLoyalty && analytics.customerLoyalty.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Customer Loyalty Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.customerLoyalty}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="purchases"
                label={{
                  value: "Number of Purchases",
                  position: "insideBottomRight",
                  offset: -5,
                }}
              />
              <YAxis label={{ value: "Number of Customers", angle: -90, position: "insideLeft" }} />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
}
