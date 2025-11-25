import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/authContext";

interface RecentlyViewedProps {
  limit?: number;
  className?: string;
}

export function RecentlyViewed({ limit = 5, className = "" }: RecentlyViewedProps) {
  const { user } = useAuth();
  const [sessionId] = useState(() => sessionStorage.getItem("sessionId") || Date.now().toString());

  useEffect(() => {
    sessionStorage.setItem("sessionId", sessionId);
  }, [sessionId]);

  const { data: viewedProducts = [] } = useQuery({
    queryKey: ["/api/viewed-products", user?.id, sessionId],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: limit.toString() });
      if (sessionId) {
        params.append("sessionId", sessionId);
      }
      const response = await fetch(`/api/viewed-products?${params}`);
      return response.json();
    },
  });

  const { data: products = [] } = useQuery({
    queryKey: ["/api/products"],
  });

  const viewedProductsData = (products as any[]).filter((p: any) =>
    viewedProducts.some((v: any) => v.productId === p.id)
  );

  if (viewedProductsData.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Recently Viewed</h2>
        <p className="text-muted-foreground">Products you've looked at</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {viewedProductsData.map((product: any) => (
          <div key={product.id} className="group">
            <ProductCard
              product={product}
              onAddToCart={() => {}}
              onProductClick={() => {}}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function RecentlyViewedSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-60 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
