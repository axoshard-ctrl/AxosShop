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
} from "@/components/ui/sidebar";
import { Package, LayoutDashboard, ShoppingBag, TrendingUp, FileText, CheckCircle2, Warehouse, Percent, Users } from "lucide-react";
import heroImage from "@assets/hero-purple-axolotl-mascot_1762939234262.png";

export function AdminSidebar() {
  const [location] = useLocation();

  const menuItems = [
    {
      title: "Store",
      url: "/shop",
      icon: ShoppingBag,
    },
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Products",
      url: "/admin/products",
      icon: Package,
    },
    {
      title: "Inventory",
      url: "/admin/inventory",
      icon: Warehouse,
    },
    {
      title: "Orders",
      url: "/admin/orders",
      icon: FileText,
    },
    {
      title: "Reviews",
      url: "/admin/reviews",
      icon: CheckCircle2,
    },
    {
      title: "Coupons",
      url: "/admin/coupons",
      icon: Percent,
    },
    {
      title: "Users",
      url: "/admin/users",
      icon: Users,
    },
    {
      title: "Analytics",
      url: "/admin/analytics",
      icon: TrendingUp,
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-3">
          <img src={heroImage} alt="Axo Shard" className="h-8 w-8 rounded-md" />
          <div>
            <p className="text-sm font-semibold">Axo Shard Admin</p>
            <p className="text-xs text-muted-foreground">Store Management</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
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
      </SidebarContent>
    </Sidebar>
  );
}
