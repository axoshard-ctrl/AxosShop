import { Link } from "wouter";
import { ShoppingCart, LogOut, User as UserIcon, Heart, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/authContext";
import heroImage from "@assets/hero-purple-axolotl-mascot_1762939234262.png";

interface HeaderProps {
  cartItemCount: number;
  onCartClick: () => void;
  onFeaturedArtClick?: () => void;
  onSearch?: (query: string) => void;
}

export function Header({ cartItemCount, onCartClick, onFeaturedArtClick, onSearch }: HeaderProps) {
  const { user, logout, isAdmin, isLoading } = useAuth();

  if (!isLoading && user) {
    console.log("Header rendering with user:", { name: user.name, email: user.email, id: user.id });
  }

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-primary/5 via-background to-secondary/5 backdrop-blur-sm border-b border-primary/10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/">
            <div className="flex items-center gap-3 hover:scale-105 transition-transform duration-200 -ml-2 pl-2 pr-3 py-1 rounded-lg cursor-pointer group" data-testid="link-home">
              <div className="relative h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-secondary p-0.5 group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-200">
                <img src={heroImage} alt="Axo Shard" className="h-full w-full rounded-md object-cover" />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Axo Shard</h1>
                <p className="text-xs text-muted-foreground">Official Merch</p>
              </div>
            </div>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2">
            <Link href="/blog">
              <Button 
                variant="ghost" 
                size="sm" 
                className="hidden sm:flex text-primary hover:bg-primary/10 font-medium transition-colors"
              >
                Blog
              </Button>
            </Link>
            {onFeaturedArtClick && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onFeaturedArtClick}
                className="hidden sm:flex text-primary hover:bg-primary/10 font-medium transition-colors"
              >
                Featured Art
              </Button>
            )}
            <Link href="/wishlist">
              <Button 
                variant="ghost" 
                size="sm" 
                className="hidden sm:flex text-primary hover:bg-primary/10 font-medium transition-colors"
              >
                <Heart className="mr-2 h-4 w-4" />
                Wishlist
              </Button>
            </Link>
            {isLoading ? (
              <div className="text-xs text-muted-foreground">Loading...</div>
            ) : user ? (
              <>
                {isAdmin && (
                  <>
                    <Link href="/admin">
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/30 transition-all duration-200"
                        data-testid="link-admin"
                      >
                        Add Merch
                      </Button>
                    </Link>
                  </>
                )}
                <div className="flex flex-col items-end mr-4 gap-0.5">
                  <p className="text-sm font-semibold text-foreground whitespace-nowrap">{user.name}</p>
                  <p className="text-xs text-muted-foreground whitespace-nowrap">{user.email}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="hover:bg-primary/10" data-testid="button-user-menu">
                      <UserIcon className="h-5 w-5 text-primary" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="cursor-pointer hover:bg-destructive/10" data-testid="button-logout">
                      <LogOut className="mr-2 h-4 w-4 text-destructive" />
                      <span className="text-destructive">Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="hover:bg-primary/10 text-primary font-medium" data-testid="link-login">
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/30 transition-all duration-200" data-testid="link-signup">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-primary/10 transition-colors"
              onClick={onCartClick}
              data-testid="button-cart"
            >
              <ShoppingCart className="h-5 w-5 text-primary" />
              {cartItemCount > 0 && (
                <Badge
                  variant="default"
                  className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center px-1 text-xs bg-gradient-to-r from-accent to-secondary shadow-lg shadow-accent/40"
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
