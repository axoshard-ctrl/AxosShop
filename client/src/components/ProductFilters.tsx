import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Filter } from "lucide-react";
import { useState } from "react";

interface ProductFiltersProps {
  onFilterChange?: (filters: any) => void;
}

export function ProductFilters({ onFilterChange }: ProductFiltersProps) {
  const [filters, setFilters] = useState({
    priceRange: [0, 1000],
    categories: [] as string[],
    ratings: [] as number[],
    brands: [] as string[],
    inStock: true,
  });

  const categories = ["Electronics", "Clothing", "Home & Garden", "Sports", "Books"];
  const brands = ["Brand A", "Brand B", "Brand C", "Brand D"];
  const ratings = [5, 4, 3, 2, 1];

  const toggleCategory = (category: string) => {
    const updated = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    setFilters({ ...filters, categories: updated });
    onFilterChange?.({ ...filters, categories: updated });
  };

  const toggleBrand = (brand: string) => {
    const updated = filters.brands.includes(brand)
      ? filters.brands.filter((b) => b !== brand)
      : [...filters.brands, brand];
    setFilters({ ...filters, brands: updated });
    onFilterChange?.({ ...filters, brands: updated });
  };

  const toggleRating = (rating: number) => {
    const updated = filters.ratings.includes(rating)
      ? filters.ratings.filter((r) => r !== rating)
      : [...filters.ratings, rating];
    setFilters({ ...filters, ratings: updated });
    onFilterChange?.({ ...filters, ratings: updated });
  };

  return (
    <div className="w-64 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="w-4 h-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Price Range */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Price</h3>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="number"
                  className="w-1/2 px-2 py-1 border rounded text-sm"
                  placeholder="Min"
                  value={filters.priceRange[0]}
                />
                <input
                  type="number"
                  className="w-1/2 px-2 py-1 border rounded text-sm"
                  placeholder="Max"
                  value={filters.priceRange[1]}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                ${filters.priceRange[0]} - ${filters.priceRange[1]}
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Category</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category} className="flex items-center gap-2">
                  <Checkbox
                    checked={filters.categories.includes(category)}
                    onChange={() => toggleCategory(category)}
                  />
                  <label className="text-sm cursor-pointer">{category}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Ratings */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Rating</h3>
            <div className="space-y-2">
              {ratings.map((rating) => (
                <div key={rating} className="flex items-center gap-2">
                  <Checkbox
                    checked={filters.ratings.includes(rating)}
                    onChange={() => toggleRating(rating)}
                  />
                  <label className="text-sm cursor-pointer flex items-center gap-1">
                    {"⭐".repeat(rating)} {rating === 5 ? "& Up" : ""}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Brands */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Brand</h3>
            <div className="space-y-2">
              {brands.map((brand) => (
                <div key={brand} className="flex items-center gap-2">
                  <Checkbox
                    checked={filters.brands.includes(brand)}
                    onChange={() => toggleBrand(brand)}
                  />
                  <label className="text-sm cursor-pointer">{brand}</label>
                </div>
              ))}
            </div>
          </div>

          {/* In Stock */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={filters.inStock}
                onChange={(checked) => setFilters({ ...filters, inStock: checked as boolean })}
              />
              <label className="text-sm cursor-pointer">In Stock Only</label>
            </div>
          </div>

          {/* Clear Button */}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setFilters({
                priceRange: [0, 1000],
                categories: [],
                ratings: [],
                brands: [],
                inStock: true,
              });
              onFilterChange?.({
                priceRange: [0, 1000],
                categories: [],
                ratings: [],
                brands: [],
                inStock: true,
              });
            }}
          >
            Clear Filters
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
