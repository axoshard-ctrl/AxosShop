import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearch } from "@/lib/searchContext";
import { useWishlist } from "@/lib/wishlistContext";

interface ProductRecommendationsProps {
  limit?: number;
  className?: string;
}

export function ProductRecommendations({
  limit = 6,
  className = "",
}: ProductRecommendationsProps) {
  const { searchHistory } = useSearch();
  const { getWishlistItems } = useWishlist();
  const wishlistItems = getWishlistItems();

  const { data: products = [] } = useQuery({
    queryKey: ["/api/products"],
  });

  // Get recommendations based on search history and wishlist
  const recommendations = useMemo(() => {
    const productList = (products as any[]) || [];
    if (productList.length === 0) return [];

    // Keywords from search history
    const searchKeywords = searchHistory.flatMap((query) =>
      query.toLowerCase().split(/\s+/)
    );

    // Score products based on keyword matches
    const scored = productList.map((product: any) => {
      const name = product.name.toLowerCase();
      const description = product.description.toLowerCase();
      let score = 0;

      // Match search keywords
      searchKeywords.forEach((keyword) => {
        if (keyword.length > 2) {
          if (name.includes(keyword)) score += 3;
          if (description.includes(keyword)) score += 1;
        }
      });

      // Avoid showing already wishlisted items
      if (wishlistItems.includes(product.id)) {
        score = 0;
      }

      return { ...product, score };
    });

    return scored
      .filter((p: any) => p.score > 0)
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, limit);
  }, [products, searchHistory, wishlistItems, limit]);

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Recommended for You
        </h2>
        <p className="text-muted-foreground">
          Based on your interests and search history
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {recommendations.map((product: any) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={() => {}}
            onProductClick={() => {}}
          />
        ))}
      </div>
    </div>
  );
}

export function ProductRecommendationsSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-60 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
