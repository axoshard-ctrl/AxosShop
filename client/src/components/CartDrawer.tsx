import { Link } from "wouter";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { CartItem } from "@shared/schema";
import { useCurrency } from "@/lib/currencyContext";
import { useLanguage, t } from "@/lib/languageContext";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number, size?: string, color?: string) => void;
  onRemoveItem: (productId: string, size?: string, color?: string) => void;
}

export function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
}: CartDrawerProps) {
  const { formatPrice } = useCurrency();
  const { language } = useLanguage();

  const SIZE_PRICE_MULTIPLIERS: Record<string, number> = {
    "XS": 0.9,
    "S": 0.95,
    "M": 1.0,
    "L": 1.1,
    "XL": 1.2,
    "XXL": 1.3,
    "6x6": 1.0,
    "9x9": 1.35,
  };

  const getItemPrice = (item: CartItem): number => {
    const multiplier = item.size ? (SIZE_PRICE_MULTIPLIERS[item.size] || 1.0) : 1.0;
    return parseFloat(item.product.price) * multiplier;
  };

  const total = items.reduce(
    (sum, item) => sum + getItemPrice(item) * item.quantity,
    0
  );

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle>{t('cart.title', language)}</SheetTitle>
          <SheetDescription>
            {items.length === 0
              ? t('cart.empty', language)
              : `${items.length} ${t('cart.items', language)}`}
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            <ShoppingBag className="h-16 w-16 text-muted-foreground" />
            <p className="text-muted-foreground">Start adding items to your cart!</p>
            <Button onClick={onClose} data-testid="button-continue-shopping">
              {t('common.buy', language)}
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {items.map((item) => {
                const itemPrice = getItemPrice(item);
                return (
                  <div
                    key={`${item.product.id}-${item.size || 'no-size'}-${item.color || 'no-color'}`}
                    className="flex gap-4"
                    data-testid={`cart-item-${item.product.id}`}
                  >
                    <div className="h-20 w-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-medium text-foreground">
                            {item.product.name}
                          </h4>
                          {item.size && (
                            <p className="text-xs text-muted-foreground">
                              Size: {item.size}
                            </p>
                          )}
                          {item.color && (
                            <p className="text-xs text-muted-foreground">
                              Color: {item.color}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            {formatPrice(itemPrice)} each
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => onRemoveItem(item.product.id, item.size, item.color)}
                          data-testid={`button-remove-${item.product.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1, item.size, item.color)}
                          disabled={item.quantity <= 1}
                          data-testid={`button-decrease-${item.product.id}`}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (val > 0 && val <= item.product.stock) {
                              onUpdateQuantity(item.product.id, val, item.size, item.color);
                            }
                          }}
                          className="h-8 w-16 text-center"
                          min={1}
                          max={item.product.stock}
                          data-testid={`input-quantity-${item.product.id}`}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1, item.size, item.color)}
                          disabled={item.quantity >= item.product.stock}
                          data-testid={`button-increase-${item.product.id}`}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <p className="text-sm font-medium ml-auto">
                          {formatPrice(itemPrice * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('cart.subtotal', language)}</span>
                  <span className="font-medium">{formatPrice(total)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('cart.shipping', language)}</span>
                  <span className="font-medium">Calculated at checkout</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{t('cart.total', language)}</span>
                  <span className="text-xl font-bold" data-testid="text-cart-total">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              <Link href="/checkout">
                <Button className="w-full" size="lg" onClick={onClose} data-testid="button-checkout">
                  {t('cart.checkout', language)}
                </Button>
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
