import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/lib/cartContext";
import { AuthProvider } from "@/lib/authContext";
import { WishlistProvider } from "@/lib/wishlistContext";
import { SearchContextProvider } from "@/lib/searchContext";
import { useEasterEggs } from "@/hooks/useEasterEggs";
import { BackToTop } from "@/components/BackToTop";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Blog from "@/pages/Blog";
import Changelog from "@/pages/Changelog";
import Wishlist from "@/pages/Wishlist";
import OrderHistory from "@/pages/OrderHistory";
import UserProfile from "@/pages/UserProfile";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Checkout from "@/pages/Checkout";
import OrderConfirmation from "@/pages/OrderConfirmation";
import Admin from "@/pages/Admin";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import Staff from "@/pages/Staff";
import { OrderTracking } from "@/components/OrderTracking";
import { SavedAddresses } from "@/components/SavedAddresses";
import { GuestCheckoutFlow } from "@/components/GuestCheckoutFlow";

function Router() {
  useEasterEggs();
  
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/shop" component={Home} />
      <Route path="/blog" component={Blog} />
      <Route path="/changelog" component={Changelog} />
      <Route path="/staff" component={Staff} />
      <Route path="/profile" component={UserProfile} />
      <Route path="/wishlist" component={Wishlist} />
      <Route path="/orders" component={OrderHistory} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/order-confirmation" component={OrderConfirmation} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/admin/:page?" component={Admin} />
      <Route path="/user/addresses" component={SavedAddresses} />
      <Route path="/order-tracking/:orderId" component={OrderTracking} />
      <Route path="/guest-checkout" component={GuestCheckoutFlow} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <SearchContextProvider>
              <TooltipProvider>
                <Toaster />
                <Router />
                <BackToTop />
              </TooltipProvider>
            </SearchContextProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
