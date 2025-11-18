import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import type { CartItem } from "@shared/schema";
import { useLocation } from "wouter";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
}

export function CartDrawer({ isOpen, onClose, items, onUpdateQuantity, onRemoveItem }: CartDrawerProps) {
  const [, setLocation] = useLocation();

  const subtotal = items.reduce(
    (sum, item) => sum + parseFloat(item.product.price) * item.quantity,
    0
  );

  const handleCheckout = () => {
    onClose();
    setLocation("/checkout");
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-2xl">Shopping Cart</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
            <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-4">
              <ShoppingCart className="h-12 w-12 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium text-foreground">Your cart is empty</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add some adorable axolotl merch!
            </p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto -mx-6 px-6">
              <div className="space-y-4 py-4">
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex gap-4"
                    data-testid={`cart-item-${item.product.id}`}
                  >
                    <div className="h-20 w-20 rounded-md bg-muted overflow-hidden flex-shrink-0">
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground line-clamp-1">
                        {item.product.name}
                      </h4>
                      <p className="text-sm text-primary font-semibold mt-1">
                        ${parseFloat(item.product.price).toFixed(2)}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          data-testid={`button-decrease-${item.product.id}`}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-8 text-center" data-testid={`text-quantity-${item.product.id}`}>
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                          data-testid={`button-increase-${item.product.id}`}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => onRemoveItem(item.product.id)}
                      data-testid={`button-remove-${item.product.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <SheetFooter className="flex-col gap-4 -mx-6 px-6 pt-4 border-t">
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Subtotal</span>
                <span data-testid="text-subtotal">${subtotal.toFixed(2)}</span>
              </div>
              <Button
                size="lg"
                className="w-full"
                onClick={handleCheckout}
                data-testid="button-checkout"
              >
                Proceed to Checkout
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
