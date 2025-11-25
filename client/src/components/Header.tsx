import { Link } from "wouter";
import { ShoppingCart, LogOut, User as UserIcon, Heart, Search, Moon, Sun, Globe, Settings } from "lucide-react";
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
import { useTheme } from '@/lib/themeContext';
import { useCurrency } from '@/lib/currencyContext';
import { CURRENCIES } from '@shared/schema';
import { ColorThemeSelector } from '@/components/ColorThemeSelector';
import heroImage from "@assets/hero-purple-axolotl-mascot_1762939234262.png";

interface HeaderProps {
  cartItemCount: number;
  onCartClick: () => void;
  onFeaturedArtClick?: () => void;
  onSearch?: (query: string) => void;
}

export function Header({ cartItemCount, onCartClick, onFeaturedArtClick, onSearch }: HeaderProps) {
  const { user, logout, isAdmin, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { currency, setCurrency } = useCurrency();

  if (!isLoading && user) {
    console.log("Header rendering with user:", { name: user.name, email: user.email, id: user.id });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-primary/10 bg-background/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-2">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center gap-2 hover:scale-105 transition-transform duration-200 -ml-2 pl-2 pr-2 py-1 rounded-lg cursor-pointer group flex-shrink-0" data-testid="link-home">
            <div className="relative h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-secondary p-0.5 group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-200">
              <img src={heroImage} alt="Axo Shard" className="h-full w-full rounded-md object-cover" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Axo Shard</h1>
              <p className="text-xs text-muted-foreground">Official Merch</p>
            </div>
          </div>
        </Link>

        {/* Center Navigation - Hidden on mobile */}
        <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
          <Link href="/blog">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary hover:bg-primary/10 font-medium transition-colors"
            >
              Blog
            </Button>
          </Link>
          {onFeaturedArtClick && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onFeaturedArtClick}
              className="text-primary hover:bg-primary/10 font-medium transition-colors"
            >
              Featured Art
            </Button>
          )}
          <Link href="/staff">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary hover:bg-primary/10 font-medium transition-colors"
            >
              Staff
            </Button>
          </Link>
          <Link href="/wishlist">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary hover:bg-primary/10 font-medium transition-colors"
            >
              <Heart className="mr-2 h-4 w-4" />
              Wishlist
            </Button>
          </Link>
        </nav>

        {/* Right Section - Compact */}
        <div className="flex items-center gap-1">
          {/* Admin Button */}
          {isLoading ? (
            <div className="text-xs text-muted-foreground hidden sm:block">Loading...</div>
          ) : user ? (
            <>
              {isAdmin && (
                <Link href="/admin">
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 hidden sm:flex"
                    data-testid="link-admin"
                  >
                    Add Merch
                  </Button>
                </Link>
              )}
            </>
          ) : null}

          {/* Settings Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                <Settings className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Settings</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* Color Theme */}
              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Color Theme</DropdownMenuLabel>
              <div className="px-2 py-2">
                <ColorThemeSelector />
              </div>
              <DropdownMenuSeparator />
              
              {/* Theme Toggle */}
              <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer">
                {theme === 'light' ? (
                  <>
                    <Moon className="mr-2 h-4 w-4" />
                    <span>Dark Mode</span>
                  </>
                ) : (
                  <>
                    <Sun className="mr-2 h-4 w-4" />
                    <span>Light Mode</span>
                  </>
                )}
              </DropdownMenuItem>
              
              {/* Currency Selector */}
              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground mt-2">Currency</DropdownMenuLabel>
              {Object.entries(CURRENCIES).map(([curr]) => (
                <DropdownMenuItem 
                  key={curr}
                  onClick={() => setCurrency(curr as any)}
                  className={`cursor-pointer ${currency === curr ? 'bg-primary/20' : ''}`}
                >
                  <span>{curr}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Wishlist Button - Mobile */}
          <Link href="/wishlist" className="lg:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              className="hover:bg-primary/10"
            >
              <Heart className="h-5 w-5" />
            </Button>
          </Link>

          {/* Cart Button */}
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

          {/* User Menu */}
          {isLoading ? (
            <div className="text-xs text-muted-foreground">...</div>
          ) : user ? (
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
                <Link href="/profile">
                  <DropdownMenuItem className="cursor-pointer hover:bg-primary/10">
                    <UserIcon className="mr-2 h-4 w-4 text-primary" />
                    <span>My Profile</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/orders">
                  <DropdownMenuItem className="cursor-pointer hover:bg-primary/10">
                    <span>Order History</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer hover:bg-destructive/10" data-testid="button-logout">
                  <LogOut className="mr-2 h-4 w-4 text-destructive" />
                  <span className="text-destructive">Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/login" className="hidden sm:block">
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
        </div>
      </div>
    </header>
  );
}
