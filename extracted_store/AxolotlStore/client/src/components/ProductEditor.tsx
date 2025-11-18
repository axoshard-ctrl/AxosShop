import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema, type Product, type InsertProduct } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface ProductEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: InsertProduct) => Promise<void>;
  product?: Product | null;
}

export function ProductEditor({ isOpen, onClose, onSave, product }: ProductEditorProps) {
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<InsertProduct>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: product
      ? {
          name: product.name,
          description: product.description,
          price: product.price,
          imageUrl: product.imageUrl,
          stock: product.stock,
          isActive: product.isActive,
        }
      : {
          name: "",
          description: "",
          price: "0.00",
          imageUrl: "",
          stock: 0,
          isActive: true,
        },
  });

  const handleSubmit = async (data: InsertProduct) => {
    setIsSaving(true);
    try {
      await onSave(data);
      onClose();
      form.reset();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Add New Product"}</DialogTitle>
          <DialogDescription>
            {product ? "Update product details below" : "Create a new product for your store"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Purple Axolotl Plushie" {...field} data-testid="input-product-name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Adorable purple axolotl with Minecraft-inspired texture..."
                      rows={3}
                      {...field}
                      data-testid="input-product-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="19.99"
                        {...field}
                        data-testid="input-product-price"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="100"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        data-testid="input-product-stock"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <>
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="/images/product.png or https://..."
                        {...field}
                        data-testid="input-product-image"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>

                  {field.value && (
                    <div className="rounded-md border p-4 mt-4">
                      <Label className="text-sm text-muted-foreground mb-2 block">Preview</Label>
                      <img
                        src={field.value}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-md"
                        onError={(e) => {
                          e.currentTarget.src = "https://via.placeholder.com/150?text=Invalid+URL";
                        }}
                      />
                    </div>
                  )}
                </>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-md border p-4">
                  <div>
                    <FormLabel className="text-base">Product Active</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Show this product in the store
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="switch-product-active"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel">
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving} data-testid="button-save">
                {isSaving ? "Saving..." : product ? "Update Product" : "Create Product"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
