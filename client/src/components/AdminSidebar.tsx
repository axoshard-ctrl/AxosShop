import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Package,
  LayoutDashboard,
  ShoppingBag,
  TrendingUp,
  FileText,
  CheckCircle2,
  Warehouse,
  Percent,
  Users,
  Gift,
  Upload,
  LogOut,
  AlertCircle,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@assets/hero-purple-axolotl-mascot_1762939234262.png";

export function AdminSidebar() {
  const [location] = useLocation();

  const mainMenuItems = [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      title: "Products",
      url: "/admin/products",
      icon: Package,
      badge: null,
    },
  ];

  const managementMenuItems = [
    {
      title: "Inventory",
      url: "/admin/inventory",
      icon: Warehouse,
      badge: null,
    },
    {
      title: "Orders",
      url: "/admin/orders",
      icon: FileText,
      badge: null,
    },
    {
      title: "Reviews",
      url: "/admin/reviews",
      icon: CheckCircle2,
      badge: null,
    },
    {
      title: "Users",
      url: "/admin/users",
      icon: Users,
      badge: null,
    },
  ];

  const analyticsMenuItems = [
    {
      title: "Analytics",
      url: "/admin/analytics",
      icon: TrendingUp,
      badge: null,
    },
    {
      title: "Customer Analytics",
      url: "/admin/customer-analytics",
      icon: BarChart3,
      badge: null,
    },
    {
      title: "Coupons",
      url: "/admin/coupons",
      icon: Percent,
      badge: null,
    },
    {
      title: "Loyalty Program",
      url: "/admin/loyalty",
      icon: Gift,
      badge: null,
    },
    {
      title: "Abandoned Carts",
      url: "/admin/abandoned-carts",
      icon: AlertCircle,
      badge: null,
    },
    {
      title: "Bulk Import",
      url: "/admin/bulk-import",
      icon: Upload,
      badge: null,
    },
  ];

  return (
    <Sidebar className="border-r bg-background">
      {/* Header */}
      <SidebarHeader className="border-b p-4">
        <Link href="/admin/dashboard" asChild>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-auto px-2 py-2 font-semibold"
          >
            <div className="flex items-center justify-center h-8 w-8 rounded-md bg-gradient-to-br from-purple-500 to-purple-600">
              <img src={heroImage} alt="Axo Shard" className="h-8 w-8 rounded-md" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-bold">Axo Admin</span>
              <span className="text-xs text-muted-foreground">v3.1.0</span>
            </div>
          </Button>
        </Link>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider">
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    className="relative"
                    data-testid={`sidebar-${item.title.toLowerCase()}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Management */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider">
            Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`sidebar-${item.title.toLowerCase()}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Analytics & Promotions */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider">
            Analytics
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {analyticsMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`sidebar-${item.title.toLowerCase()}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Access */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider">
            Quick Links
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/shop">
                    <ShoppingBag className="h-4 w-4" />
                    <span>View Store</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t p-4">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          asChild
        >
          <Link href="/logout">
            <LogOut className="h-4 w-4 mr-2" />
            <span className="text-xs">Logout</span>
          </Link>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
