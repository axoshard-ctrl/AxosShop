import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import { ProductDetailModal } from "@/components/ProductDetailModal";
import { CartDrawer } from "@/components/CartDrawer";
import { AdvancedSearch } from "@/components/AdvancedSearch";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ChevronDown, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/lib/cartContext";
import { useCurrency } from "@/lib/currencyContext";
import type { Product } from "@shared/schema";
import heroImage from "@assets/hero-purple-axolotl-mascot_1762939234262.png";
import fanArt1 from "@assets/fan-art/Untitled33_20250913153858.png";
import fanArt2 from "@assets/fan-art/image.png";
import fanArt3 from "@assets/fan-art/Untitled467_20250913205036.png";
import fanArt4 from "@assets/fan-art/Screenshot_20250914-105932.png";
import fanArt5 from "@assets/fan-art/rn_image_picker_lib_temp_782271f3-50e3-4d53-a645-671978902b12.jpg";
import fanArt6 from "@assets/fan-art/20250914_195321.jpg";
import fanArt7 from "@assets/fan-art/IMG_3879.webp";
import fanArt8 from "@assets/fan-art/Unbenannt_49.webp";
import fanArt9 from "@assets/fan-art/download_8.webp";
import fanArt10 from "@assets/fan-art/IMG_2078.webp";
import fanArt11 from "@assets/fan-art/Untitled910_20250925220856.webp";
import { Github, Instagram, Twitter, Mail, Youtube } from "lucide-react";

// Fan art data
const fanArtworks = [
  {
    id: 1,
    title: "In Memory of Axo's Old Name",
    artist: "butter_cup4ever",
    description: "A clean line art sketch of the adorable axolotl",
    image: fanArt5
  },
  {
    id: 2,
    title: "Purple Axolotl",
    artist: "butter_cup4ever",
    description: "A vibrant digital illustration with magical effects",
    image: fanArt4
  },
  {
    id: 3,
    title: "Happy Axolotl",
    artist: "butter_cup4ever",
    description: "A cheerful axolotl character with personality",
    image: fanArt3
  },
  {
    id: 4,
    title: "Neon Axolotl",
    artist: "qubbi",
    description: "A bold neon-style digital art piece",
    image: fanArt2
  },
  {
    id: 5,
    title: "Axolotl Sketch",
    artist: "butter_cup4ever",
    description: "A beautiful sketch of a powerful axolotl warrior",
    image: fanArt1
  },
  {
    id: 6,
    title: "Cool Axolotl",
    artist: "butter_cup4ever",
    description: "An awesome digital art piece with style",
    image: fanArt6
  },
  {
    id: 7,
    title: "Mystical Axolotl",
    artist: "spire6969_",
    description: "A stunning mystical interpretation of the axolotl",
    image: fanArt7
  },
  {
    id: 8,
    title: "Elegant Axolotl",
    artist: "grace23_wolf",
    description: "A graceful and elegant axolotl artwork",
    image: fanArt8
  },
  {
    id: 9,
    title: "Artistic Expression",
    artist: "idkrocks",
    description: "A creative and unique take on the axolotl",
    image: fanArt9
  },
  {
    id: 10,
    title: "Featured Axolotl Art",
    artist: "idkrocks",
    description: "The original artwork that started it all",
    image: fanArt10
  },
  {
    id: 11,
    title: "Pixelated Joy",
    artist: "jellyfish.arlo",
    description: "A charming pixelated axolotl character",
    image: fanArt11
  }
];

export default function Home() {
  const { toast } = useToast();
  const { cart, addToCart, updateQuantity, removeItem, cartItemCount, removeDisabledProducts } = useCart();
  const { formatPrice } = useCurrency();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isArtCreditOpen, setIsArtCreditOpen] = useState(false);
  const [isFanArtOpen, setIsFanArtOpen] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState<typeof fanArtworks[0] | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [showFilters, setShowFilters] = useState(false);

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Remove disabled products from cart whenever products change
  if (products) {
    const activeProductIds = products.filter((p) => p.isActive).map((p) => p.id);
    removeDisabledProducts(activeProductIds);
  }

  const activeProducts = products?.filter((p) => p.isActive) || [];
  
  // Get unique categories from products, filtering out undefined/null values
  const categories = ["all", ...Array.from(new Set(activeProducts.map(p => p.category).filter(Boolean)))];

  // Apply all filters and sorting
  let filteredProducts = activeProducts.filter((product) => {
    // Search filter
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Category filter
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    
    // Price filter
    const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
    const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  // Apply sorting
  filteredProducts = [...filteredProducts].sort((a, b) => {
    const priceA = typeof a.price === 'string' ? parseFloat(a.price) : a.price;
    const priceB = typeof b.price === 'string' ? parseFloat(b.price) : b.price;
    
    switch (sortBy) {
      case "price-low":
        return priceA - priceB;
      case "price-high":
        return priceB - priceA;
      case "name":
        return a.name.localeCompare(b.name);
      case "newest":
      default:
        return 0; // Keep original order (newest first from DB)
    }
  });

  const handleAddToCart = (product: Product, size?: string) => {
    let availableSizes: string[] = [];
    if (product.availableSizes) {
      try {
        availableSizes = JSON.parse(product.availableSizes);
      } catch {
        availableSizes = [];
      }
    }

    // Check if product requires a size but none was selected
    if (availableSizes.length > 0 && !size) {
      setSelectedProduct(product);
      setIsDetailModalOpen(true);
      toast({
        title: "Select a size",
        description: "Please select a size before adding to cart",
        variant: "destructive",
      });
      return;
    }

    const existing = cart.find(
      (item) => item.product.id === product.id && item.size === size
    );
    if (existing && existing.quantity >= product.stock) {
      toast({
        title: "Cannot add more",
        description: "Maximum stock reached for this item",
        variant: "destructive",
      });
      return;
    }

    addToCart({ product, quantity: 1, size });
    const sizeText = size ? ` (Size: ${size})` : "";
    toast({
      title: "Added to cart",
      description: `${product.name}${sizeText} has been added to your cart`,
    });
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailModalOpen(true);
  };

  const handleAddFromModal = (product: Product, size: string, color?: string) => {
    const existing = cart.find(
      (item) => item.product.id === product.id && item.size === size && item.color === color
    );
    if (existing && existing.quantity >= product.stock) {
      toast({
        title: "Cannot add more",
        description: "Maximum stock reached for this item",
        variant: "destructive",
      });
      return;
    }

    addToCart({ product, quantity: 1, size, color });
    const sizeText = size ? ` (Size: ${size})` : "";
    const colorText = color ? ` (${color})` : "";
    toast({
      title: "Added to cart",
      description: `${product.name}${sizeText}${colorText} has been added to your cart`,
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number, size?: string, color?: string) => {
    updateQuantity(productId, quantity, size, color);
  };

  const handleRemoveItem = (productId: string, size?: string, color?: string) => {
    removeItem(productId, size, color);
    toast({
      title: "Removed from cart",
      description: "Item has been removed from your cart",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        cartItemCount={cartItemCount}
        onCartClick={() => setIsCartOpen(true)}
        onFeaturedArtClick={() => setIsArtCreditOpen(true)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
      />

      <ProductDetailModal
        product={selectedProduct}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedProduct(null);
        }}
        onAddToCart={handleAddFromModal}
      />

      <Dialog open={isArtCreditOpen} onOpenChange={setIsArtCreditOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Featured Artists & Credits</DialogTitle>
            <DialogDescription>
              Meet the talented artists behind our community fan art
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {fanArtworks.map((art) => (
              <div 
                key={art.id} 
                className="border border-primary/20 rounded-lg p-4 hover:bg-primary/5 transition-colors cursor-pointer"
                onClick={() => {
                  setSelectedArtwork(art);
                  setIsArtCreditOpen(false);
                }}
              >
                <div className="flex gap-4">
                  <img 
                    src={art.image} 
                    alt={art.title}
                    className="h-24 w-24 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-grow">
                    <h3 className="font-semibold text-foreground">{art.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{art.description}</p>
                    <p className="text-sm font-medium text-primary">
                      Click to view artist credit
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-6 pt-4 border-t border-primary/10">
            Thank you to all our community artists for these amazing contributions! 💜
          </p>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedArtwork} onOpenChange={(open) => !open && setSelectedArtwork(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedArtwork?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <img 
              src={selectedArtwork?.image} 
              alt={selectedArtwork?.title}
              className="w-full rounded-lg object-cover"
            />
            <p className="text-sm text-muted-foreground">{selectedArtwork?.description}</p>
            <div className="text-center py-6 bg-primary/5 rounded-lg">
              <p className="text-lg font-semibold text-foreground">
                This art piece is made by <br />
                <span className="text-primary text-2xl">{selectedArtwork?.artist}</span>
                <br />
                on Discord <span className="text-xl">💜</span>
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-secondary/10" />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-conic from-primary/20 to-secondary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-conic from-secondary/20 to-primary/20 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-block">
                <span className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-semibold text-primary">
                  ✨ Official Merch Store
                </span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent leading-tight">
                Axo Shard Merch
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                Get your exclusive purple axolotl merchandise with that legendary Minecraft-inspired pixelated texture. Limited edition drops and exclusive designs for true axo fans.
              </p>
            </div>
            <div className="flex justify-center lg:justify-end items-center relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500" />
              <div className="relative w-72 h-72 sm:w-96 sm:h-96 flex items-center justify-center cursor-pointer" onClick={() => {
                setSelectedArtwork({
                  id: 0,
                  title: 'Axo Shard Mascot',
                  artist: 'jellyfish.arlo',
                  description: 'The official purple axolotl mascot for Axo Shard',
                  image: heroImage
                });
              }}>
                <img
                  src={heroImage}
                  alt="Axo Shard Mascot"
                  className="max-w-full max-h-full object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-xs font-semibold text-white bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                    Click to view artist credit
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <span className="text-sm font-semibold text-primary">🛍️ Featured Collection</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-3">Shop All Products</h2>
          <p className="text-lg text-muted-foreground">
            Find the perfect axolotl merch for you
          </p>
        </div>

        {/* Search Bar with Advanced Features */}
        <div className="mb-10">
          <div className="space-y-4">
            <div className="relative max-w-md">
              <AdvancedSearch
                placeholder="Search products by name or description..."
                value={searchQuery}
                onChange={setSearchQuery}
                onSearch={(query) => {
                  setSearchQuery(query);
                  // Log search to backend
                  fetch("/api/search/history", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      query: query.trim(),
                      resultCount: filteredProducts.length,
                    }),
                  }).catch(() => {
                    // Silently fail if backend doesn't respond
                  });
                }}
              />
              {searchQuery && (
                <p className="text-sm text-muted-foreground mt-3 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary font-semibold text-xs">
                    {filteredProducts.length}
                  </span>
                  Product{filteredProducts.length !== 1 ? "s" : ""} found
                </p>
              )}
            </div>

            {/* Filter Toggle Button */}
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/30 hover:bg-primary/20 transition-colors"
            >
              <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              <span className="text-sm font-medium">Filters & Sorting</span>
            </button>

            {/* Filter Panel */}
            {showFilters && (
              <div className="p-6 bg-card border border-primary/20 rounded-xl space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Category Filter */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-foreground">Category</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="bg-background border-primary/20">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category === "all" ? "All Categories" : category ? category.charAt(0).toUpperCase() + category.slice(1).replace(/_/g, " ") : "Unknown"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Range Filter */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-foreground">
                      Price Range: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                    </label>
                    <div className="pt-2">
                      <Slider
                        min={0}
                        max={10000}
                        step={50}
                        value={priceRange}
                        onValueChange={(value) => setPriceRange([value[0], value[1]])}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Sort Filter */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-foreground">Sort By</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="bg-background border-primary/20">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest</SelectItem>
                        <SelectItem value="name">Name (A-Z)</SelectItem>
                        <SelectItem value="price-low">Price (Low to High)</SelectItem>
                        <SelectItem value="price-high">Price (High to Low)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Reset Filters Button */}
                {(selectedCategory !== "all" || priceRange[0] !== 0 || priceRange[1] !== 10000 || sortBy !== "newest") && (
                  <button
                    onClick={() => {
                      setSelectedCategory("all");
                      setPriceRange([0, 10000]);
                      setSortBy("newest");
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/10 border border-secondary/30 hover:bg-secondary/20 transition-colors text-sm font-medium"
                  >
                    <X size={16} />
                    Reset Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg text-muted-foreground">
              {searchQuery
                ? "No products match your search. Try different keywords."
                : "No products available at the moment. Check back soon!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                onProductClick={handleProductClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Blog Section */}
      <div className="bg-gradient-to-b from-card/30 to-background border-t border-primary/10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <span className="text-sm font-semibold text-primary">📝 Latest News</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-3">Blog & Articles</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Stay updated with the latest news, tips, and stories from the AxoShard community
            </p>
            <Link href="/blog">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/40 transition-all duration-200 text-white font-semibold"
              >
                Read Our Blog
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <footer className="bg-gradient-to-b from-background via-card/30 to-background border-t border-primary/10 mt-20 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            {/* Brand Info */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src={heroImage} alt="Axo Shard" className="h-10 w-10 rounded-lg" />
                <h3 className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">AxoShard</h3>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Official axolotl merch with Minecraft-inspired pixelated texture. Made for all axolotl lovers.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Quick Links</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors duration-200">Shop</a></li>
                <li><a href="#" className="hover:text-primary transition-colors duration-200">About</a></li>
                <li><a href="#" className="hover:text-primary transition-colors duration-200">Contact</a></li>
                <li><a href="/privacy-policy" className="hover:text-primary transition-colors duration-200">Privacy Policy</a></li>
              </ul>
            </div>

            {/* Social Links */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Follow Us</h3>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://twitter.com/axoshard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-200 hover:scale-110"
                  aria-label="Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a
                  href="https://instagram.com/axoshard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-200 hover:scale-110"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="https://www.tiktok.com/@axoshard?_t=ZN-8ziqIb0T0wI&_r=1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-200 hover:scale-110"
                  aria-label="TikTok"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.1 1.75 2.9 2.9 0 0 1 2.31-4.64 2.88 2.88 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.01-.01z" />
                  </svg>
                </a>
                <a
                  href="https://www.youtube.com/@axo_shard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-200 hover:scale-110"
                  aria-label="YouTube"
                >
                  <Youtube className="w-5 h-5" />
                </a>
                <a
                  href="https://www.reddit.com/user/Myhagaby/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-orange-100 p-3 rounded-lg text-orange-600 hover:bg-orange-200 transition"
                  aria-label="Reddit"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="10" fill="currentColor" opacity="1"></circle>
                    <circle cx="9" cy="10" r="1.5" fill="white"></circle>
                    <circle cx="15" cy="10" r="1.5" fill="white"></circle>
                    <path d="M9 14c0 1.66 2.69 3 6 3s6-1.34 6-3" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"></path>
                  </svg>
                </a>
                <a
                  href="https://discord.gg/U3cgX7HDFd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-200 hover:scale-110"
                  aria-label="Discord"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M20.317 4.3671a19.8063 19.8063 0 0 0-4.885-1.515.0741.0741 0 0 0-.0785.0371c-.211.3671-.4437.8484-.6079 1.2278a18.268 18.268 0 0 0-5.487 0c-.1645-.3799-.4022-.8607-.6079-1.2278a.077.077 0 0 0-.0785-.037 19.7363 19.7363 0 0 0-4.885 1.515.0699.0699 0 0 0-.0321.0277C1.75 8.068 1.1968 11.692 2.705 15.0832a.0764.0764 0 0 0 .0945.0052c1.1164.8784 2.1909 1.2171 3.2383 1.6779a.0777.0777 0 0 0 .1692-.0277c.2424-.3933.4775-.8108.6655-1.2475a.0711.0711 0 0 0-.0383-.0922c-.784-.2956-1.528-.6679-2.2225-1.0742a.077.077 0 0 1-.0076-.1277c.1494.111.2983.2324.4406.3645a.0755.0755 0 0 0 .1174-.0274c4.568 2.285 9.534 2.285 14.051 0a.0755.0755 0 0 0 .1196.0274c.1423-.1319.2912-.2526.4406-.3645a.077.077 0 0 1-.0066.1288c-.6954.4057-1.4382.7742-2.2225 1.0742a.077.077 0 0 0-.0383.0922c.1884.4367.4226.8542.6655 1.2475a.076.076 0 0 0 .1692.0277c1.0464-.4608 2.1215-.7998 3.2383-1.6779a.0755.0755 0 0 0 .0945-.0052c1.5127-3.4407.992-6.9956-1.617-9.8159a.0528.0528 0 0 0-.0321-.0277zM8.02 12.6979c-1.1164 0-2.0425-.9852-2.0425-2.1961s.9181-2.1961 2.0425-2.1961c1.1244 0 2.062.9852 2.0425 2.1961 0 1.2108-.9181 2.1961-2.0425 2.1961zm7.9596 0c-1.1164 0-2.0425-.9852-2.0425-2.1961s.9181-2.1961 2.0425-2.1961c1.1244 0 2.062.9852 2.0425 2.1961 0 1.2108-.9181 2.1961-2.0425 2.1961z" />
                  </svg>
                </a>
                <a
                  href="mailto:contact@axoshard.com"
                  className="p-2.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-200 hover:scale-110"
                  aria-label="Email"
                >
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-primary/10 pt-8 text-center">
            <p className="text-muted-foreground text-sm">
              © 2025 AxoShard. All rights reserved.
            </p>
            <p className="text-muted-foreground text-sm mt-2">
              Made with 💜 for all axolotl lovers
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

