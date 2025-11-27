import { Badge } from "@/components/ui/badge";
import { AlertCircle, TrendingDown, CheckCircle } from "lucide-react";
import { useLanguage, t } from "@/lib/languageContext";

interface InventoryStatusProps {
  stock: number;
  lowStockThreshold?: number;
  restockEmail?: string;
}

export function InventoryStatus({
  stock,
  lowStockThreshold = 5,
  restockEmail,
}: InventoryStatusProps) {
  const { language } = useLanguage();
  
  if (stock === 0) {
    return (
      <div className="space-y-2">
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="w-3 h-3" />
          {t('product.out_of_stock', language)}
        </Badge>
        {restockEmail && (
          <p className="text-xs text-gray-600">
            ✓ {t('product.notify_restock', language)}
          </p>
        )}
      </div>
    );
  }

  if (stock <= lowStockThreshold) {
    return (
      <div className="space-y-2">
        <Badge className="gap-1 bg-orange-500 hover:bg-orange-600">
          <TrendingDown className="w-3 h-3" />
          {t('product.only_left', language, { count: stock })}
        </Badge>
        <p className="text-xs text-gray-600 font-medium">
          {t('product.limited_availability', language)}
        </p>
      </div>
    );
  }

  if (stock <= 15) {
    return (
      <div className="space-y-2">
        <Badge className="gap-1 bg-yellow-500 hover:bg-yellow-600">
          <TrendingDown className="w-3 h-3" />
          {t('product.low_stock', language)}
        </Badge>
        <p className="text-xs text-gray-600">
          {t('product.items_available', language, { count: stock })}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Badge className="gap-1 bg-green-500 hover:bg-green-600">
        <CheckCircle className="w-3 h-3" />
        {t('product.in_stock', language)}
      </Badge>
      <p className="text-xs text-gray-600">
        {t('product.items_available', language, { count: stock })}
      </p>
    </div>
  );
}
