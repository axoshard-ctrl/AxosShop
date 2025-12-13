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
  Mail,
  Map,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@assets/hero-purple-axolotl-mascot_1762939234262.png";
import { useLanguage } from "@/lib/languageContext";
import { t } from "@/lib/translations";

export function AdminSidebar() {
  const [location] = useLocation();
  const { language } = useLanguage();

  const mainMenuItems = [
    {
      title: t('admin.dashboard', language),
      url: "/admin/dashboard",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      title: t('admin.products', language),
      url: "/admin/products",
      icon: Package,
      badge: null,
    },
  ];

  const managementMenuItems = [
    {
      title: t('admin.inventory', language),
      url: "/admin/inventory",
      icon: Warehouse,
      badge: null,
    },
    {
      title: t('admin.orders', language),
      url: "/admin/orders",
      icon: FileText,
      badge: null,
    },
    {
      title: t('admin.reviews', language),
      url: "/admin/reviews",
      icon: CheckCircle2,
      badge: null,
    },
    {
      title: t('admin.users', language),
      url: "/admin/users",
      icon: Users,
      badge: null,
    },
    {
      title: t('admin.coupons', language),
      url: "/admin/coupons",
      icon: Percent,
      badge: null,
    },
    {
      title: t('admin.gift_cards', language),
      url: "/admin/gift-cards",
      icon: Gift,
      badge: null,
    },
  ];

  const analyticsMenuItems = [
    {
      title: t('admin.analytics', language),
      url: "/admin/analytics",
      icon: TrendingUp,
      badge: null,
    },
    {
      title: t('admin.customer_analytics', language),
      url: "/admin/customer-analytics",
      icon: BarChart3,
      badge: null,
    },
    {
      title: t('admin.abandoned_carts', language),
      url: "/admin/abandoned-carts",
      icon: AlertCircle,
      badge: null,
    },
    {
      title: t('admin.bulk_import', language),
      url: "/admin/bulk-import",
      icon: Upload,
      badge: null,
    },
  ];

  const marketingMenuItems = [
    {
      title: t('admin.sitemap', language),
      url: "/admin/sitemap",
      icon: Map,
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
              <span className="text-xs text-muted-foreground">v3.2.0</span>
            </div>
          </Button>
        </Link>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider">
            {t('admin.sidebar_main', language)}
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
            {t('admin.sidebar_management', language)}
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
            {t('admin.sidebar_analytics', language)}
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

        {/* Marketing & Growth */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider">
            {t('admin.sidebar_marketing', language)}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {marketingMenuItems.map((item) => (
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
            {t('admin.sidebar_quick_links', language)}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/shop">
                    <ShoppingBag className="h-4 w-4" />
                    <span>{t('admin.view_store', language)}</span>
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
            <span className="text-xs">{t('admin.logout', language)}</span>
          </Link>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
