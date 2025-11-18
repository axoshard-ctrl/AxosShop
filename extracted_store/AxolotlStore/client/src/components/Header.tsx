import { Link } from "wouter";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import heroImage from "@assets/hero-purple-axolotl-mascot_1762939234262.png";

interface HeaderProps {
  cartItemCount: number;
  onCartClick: () => void;
}

export function Header({ cartItemCount, onCartClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-background border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/">
            <div className="flex items-center gap-3 hover-elevate active-elevate-2 -ml-2 pl-2 pr-3 py-1 rounded-md cursor-pointer" data-testid="link-home">
              <img src={heroImage} alt="Axo Shard" className="h-10 w-10 rounded-md" />
              <div>
                <h1 className="text-lg font-bold text-foreground">Axo Shard Store</h1>
              </div>
            </div>
          </Link>

          <nav className="flex items-center gap-2">
            <Link href="/admin">
              <Button variant="ghost" size="sm" data-testid="link-admin">
                Admin
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={onCartClick}
              data-testid="button-cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <Badge
                  variant="default"
                  className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center px-1 text-xs"
                  data-testid="text-cart-count"
                >
                  {cartItemCount}
                </Badge>
              )}
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
