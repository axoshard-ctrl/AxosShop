import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Upload, AlertCircle, CheckCircle, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface ProductRow {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: string;
  imageUrl: string;
  isActive?: string;
  discountType?: string;
  discountValue?: string;
}

interface ImportStatus {
  success: number;
  failed: number;
  errors: Array<{ row: number; error: string }>;
}

export function BulkProductImport() {
  const { toast } = useToast();
  const [csvData, setCsvData] = useState<ProductRow[]>([]);
  const [importStatus, setImportStatus] = useState<ImportStatus | null>(null);

  const importMutation = useMutation({
    mutationFn: (products: ProductRow[]) =>
      Promise.all(
        products.map((product) =>
          apiRequest("POST", "/api/products", {
            name: product.name,
            description: product.description,
            price: product.price,
            stock: parseInt(product.stock),
            category: product.category,
            imageUrl: product.imageUrl,
            isActive: product.isActive !== "false",
            discountType: product.discountType || null,
            discountValue: product.discountValue ? parseFloat(product.discountValue) : null,
          }).catch((error) => ({ error }))
        )
      ),
    onSuccess: (results) => {
      const successful = results.filter((r) => !r.error).length;
      const failed = results.filter((r) => r.error).length;
      setImportStatus({
        success: successful,
        failed: failed,
        errors: results
          .map((r, idx) => ({ row: idx + 1, error: r.error?.message }))
          .filter((e) => e.error),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Import Complete",
        description: `${successful} products imported, ${failed} failed`,
        variant: failed > 0 ? "destructive" : "default",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to import products",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split("\n").filter((line) => line.trim());
        const headers = lines[0].split(",").map((h) => h.trim());

        const products: ProductRow[] = lines.slice(1).map((line) => {
          const values = line.split(",").map((v) => v.trim());
          return {
            name: values[headers.indexOf("name")] || "",
            description: values[headers.indexOf("description")] || "",
            price: values[headers.indexOf("price")] || "0",
            stock: values[headers.indexOf("stock")] || "0",
            category: values[headers.indexOf("category")] || "other",
            imageUrl: values[headers.indexOf("imageUrl")] || "",
            isActive: values[headers.indexOf("isActive")] || "true",
            discountType: values[headers.indexOf("discountType")] || undefined,
            discountValue: values[headers.indexOf("discountValue")] || undefined,
          };
        });

        setCsvData(products);
        setImportStatus(null);
        toast({
          title: "CSV Loaded",
          description: `${products.length} products ready to import`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Invalid CSV format",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Bulk Import Products</CardTitle>
          <CardDescription>
            Upload a CSV file to import multiple products at once
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Template Download */}
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">
              CSV Template Format:
            </p>
            <code className="text-xs bg-background p-2 rounded block overflow-x-auto">
              name,description,price,stock,category,imageUrl,isActive,discountType,discountValue
            </code>
          </div>

          {/* Upload Input */}
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-upload"
            />
            <Button variant="outline" asChild>
              <label htmlFor="csv-upload" className="cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                Choose CSV File
              </label>
            </Button>

            <Button
              onClick={() => importMutation.mutate(csvData)}
              disabled={csvData.length === 0 || importMutation.isPending}
            >
              Import {csvData.length > 0 && `(${csvData.length})`}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Table */}
      {csvData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>
              Review the data before importing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>Discount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {csvData.slice(0, 5).map((product, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium line-clamp-1">
                        {product.name}
                      </TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>${parseFloat(product.price).toFixed(2)}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>
                        <Badge variant={product.isActive !== "false" ? "default" : "secondary"}>
                          {product.isActive !== "false" ? "Yes" : "No"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {product.discountType
                          ? `${product.discountType} ${product.discountValue}${
                              product.discountType === "percentage" ? "%" : ""
                            }`
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {csvData.length > 5 && (
                <p className="text-sm text-muted-foreground mt-4">
                  ...and {csvData.length - 5} more products
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Results */}
      {importStatus && (
        <Card className={importStatus.failed > 0 ? "border-orange-200" : "border-green-200"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {importStatus.failed > 0 ? (
                <>
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  Import Complete with Errors
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Import Successful
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
                <p className="text-sm text-green-600 dark:text-green-400">Successful</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {importStatus.success}
                </p>
              </div>
              <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">Failed</p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                  {importStatus.failed}
                </p>
              </div>
            </div>

            {importStatus.errors.length > 0 && (
              <div className="space-y-2">
                <p className="font-semibold text-foreground">Errors:</p>
                {importStatus.errors.map((err, idx) => (
                  <div key={idx} className="bg-destructive/10 p-2 rounded text-sm">
                    <p className="font-medium">Row {err.row}</p>
                    <p className="text-muted-foreground">{err.error}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
