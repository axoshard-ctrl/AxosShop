import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
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
} from "recharts";
import {
  DollarSign,
  ShoppingCart,
  Package,
  TrendingUp,
} from "lucide-react";
import { format, subDays, startOfDay } from "date-fns";
import { useState } from "react";

interface SalesStats {
  totalRevenue: number;
  totalOrders: number;
  topProducts: Array<{
    productId: string;
    name: string;
    count: number;
    revenue: number;
  }>;
}

const COLORS = ["#8b5cf6", "#ec4899", "#06b6d4", "#f59e0b", "#10b981", "#3b82f6"];

export function AdminDashboard() {
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "all">("30d");

  // Calculate date range
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

  const { data: stats, isLoading } = useQuery<SalesStats>({
    queryKey: ["/api/admin/stats", dateRange],
    queryFn: async () => {
      const response = await fetch(`/api/admin/stats?dateFrom=${dateFrom}&dateTo=${dateTo}`);
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
  });

  // Prepare chart data for top products
  const chartData = stats?.topProducts?.map((p) => ({
    name: p.name,
    sales: p.count,
    revenue: p.revenue,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header with date range selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Sales Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Track your store's performance
          </p>
        </div>
        <div className="flex gap-2">
          {(["7d", "30d", "90d", "all"] as const).map((range) => (
            <Button
              key={range}
              variant={dateRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setDateRange(range)}
            >
              {range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : range === "90d" ? "90 Days" : "All Time"}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold text-foreground mt-2">
                {isLoading ? "..." : `$${(stats?.totalRevenue || 0).toFixed(2)}`}
              </p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>

        {/* Total Orders */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="text-2xl font-bold text-foreground mt-2">
                {isLoading ? "..." : stats?.totalOrders || 0}
              </p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        {/* Average Order Value */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Average Order Value</p>
              <p className="text-2xl font-bold text-foreground mt-2">
                {isLoading
                  ? "..."
                  : `$${(
                      (stats?.totalRevenue || 0) / Math.max(stats?.totalOrders || 1, 1)
                    ).toFixed(2)}`}
              </p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-pink-100 dark:bg-pink-900 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-pink-600 dark:text-pink-400" />
            </div>
          </div>
        </Card>

        {/* Top Products Count */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Top Products</p>
              <p className="text-2xl font-bold text-foreground mt-2">
                {isLoading ? "..." : stats?.topProducts?.length || 0}
              </p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-teal-100 dark:bg-teal-900 flex items-center justify-center">
              <Package className="h-6 w-6 text-teal-600 dark:text-teal-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products by Revenue */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Top Products by Revenue</h3>
          {isLoading ? (
            <div className="h-80 flex items-center justify-center text-muted-foreground">
              Loading chart...
            </div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center text-muted-foreground">
              No data available
            </div>
          )}
        </Card>

        {/* Top Products by Sales Count */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Top Products by Sales</h3>
          {isLoading ? (
            <div className="h-80 flex items-center justify-center text-muted-foreground">
              Loading chart...
            </div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, sales }) => `${name}: ${sales}`}
                  outerRadius={80}
                  fill="#8b5cf6"
                  dataKey="sales"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center text-muted-foreground">
              No data available
            </div>
          )}
        </Card>
      </div>

      {/* Top Products Table */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Top 10 Products</h3>
        {isLoading ? (
          <div className="text-center text-muted-foreground py-8">Loading...</div>
        ) : stats?.topProducts && stats.topProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Product Name
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Units Sold
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Revenue
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Avg Price
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.topProducts.map((product) => (
                  <tr key={product.productId} className="border-b hover:bg-muted/50 transition">
                    <td className="py-3 px-4 text-foreground">{product.name}</td>
                    <td className="py-3 px-4 text-right text-foreground font-medium">
                      {product.count}
                    </td>
                    <td className="py-3 px-4 text-right text-foreground font-medium">
                      ${product.revenue.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right text-foreground">
                      ${(product.revenue / product.count).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">No sales data available</div>
        )}
      </Card>
    </div>
  );
}
