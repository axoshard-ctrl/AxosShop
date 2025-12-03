import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Loader2 } from "lucide-react";

interface ImageUploadProps {
  onImageUpload: (imageUrl: string, filename: string) => void;
  productId?: string;
  currentImage?: string;
  maxSizeMB?: number;
  disabled?: boolean;
}

export function ImageUpload({
  onImageUpload,
  productId,
  currentImage,
  maxSizeMB = 5,
  disabled = false,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (file: File) => {
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File",
          description: "Please select an image file (JPEG, PNG, GIF, or WebP)",
          variant: "destructive",
        });
        return;
      }

      // Validate file size
      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > maxSizeMB) {
        toast({
          title: "File Too Large",
          description: `File size must be less than ${maxSizeMB}MB. Current: ${sizeMB.toFixed(2)}MB`,
          variant: "destructive",
        });
        return;
      }

      setIsLoading(true);

      // Convert to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64String = e.target?.result as string;
        
        try {
          const response = await fetch("/api/upload-image", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              file: base64String,
              filename: file.name,
              productId: productId || null,
            }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message);
          }

          const result = await response.json();
          
          // Show preview
          setPreview(result.imageUrl);
          
          // Call callback
          onImageUpload(result.imageUrl, result.filename);

          toast({
            title: "Success",
            description: "Image uploaded successfully",
          });
        } catch (error: any) {
          toast({
            title: "Upload Failed",
            description: error.message || "Failed to upload image",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };

      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process image",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    if (!disabled && !isLoading) {
      fileInputRef.current?.click();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
    // Reset input so same file can be selected again
    e.currentTarget.value = "";
  };

  const clearPreview = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full space-y-4">
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          relative w-full border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
          ${disabled || isLoading ? "opacity-50 cursor-not-allowed" : "hover:border-primary"}
          ${preview ? "border-green-500 bg-green-50 dark:bg-green-950" : "border-muted-foreground"}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled || isLoading}
        />

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {preview ? (
          <div className="space-y-4">
            <img
              src={preview}
              alt="Preview"
              className="max-h-64 mx-auto rounded-lg object-contain"
            />
            <p className="text-sm text-muted-foreground">Image ready to upload</p>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <p className="text-base font-medium text-foreground">
                Drag and drop your image here, or click to select
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                PNG, JPG, GIF, or WebP up to {maxSizeMB}MB
              </p>
            </div>
          </div>
        )}
      </div>

      {preview && (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearPreview}
            disabled={disabled || isLoading}
            className="flex-1"
          >
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleClick}
            disabled={disabled || isLoading}
            className="flex-1"
          >
            <Upload className="h-4 w-4 mr-2" />
            Choose Another
          </Button>
        </div>
      )}
    </div>
  );
}
