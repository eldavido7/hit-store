"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { Upload, X, Loader2, ImageIcon, Plus, Trash } from "lucide-react";
import Image from "next/image";
import type { Product, ProductVariant } from "@/types";

// --- Category + Subcategory map ---
const CATEGORY_MAP: Record<string, string[]> = {
  Clothing: ["T-Shirts", "Sweatshirts", "Caps", "Bags"],
  "Health & Nutrition": ["Protein Formula", "Supplements"],
  Mugs: ["Ceramic", "Glass"],
  Journals: ["Notebooks", "Planners"],
  Stickers: ["Vinyl", "Paper"],
};

interface AddProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddProduct: (product: Product) => void;
}

export function AddProductModal({
  open,
  onOpenChange,
  onAddProduct,
}: AddProductModalProps) {
  const [productForm, setProductForm] = useState<Partial<Product>>({
    title: "",
    description: "",
    price: 0,
    inventory: 0,
    category: "",
    subcategory: "",
    tags: [],
    barcode: "",
    imageUrl: "",
    imagePublicId: "",
    variants: [],
  });

  const [isUploading, setIsUploading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>("");
  const hasVariants = productForm.variants && productForm.variants.length > 0;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Variants handling ---
  const handleAddVariant = () => {
    const newVariant: ProductVariant = {
      id: crypto.randomUUID(),
      productId: "", // backend will assign
      sku: "",
      name: "",
      price: null,
      inventory: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setProductForm({
      ...productForm,
      variants: [...(productForm.variants || []), newVariant],
    });
  };

  const handleRemoveVariant = (id: string) => {
    setProductForm({
      ...productForm,
      variants: productForm.variants?.filter((v) => v.id !== id) || [],
    });
  };

  const handleVariantChange = (
    id: string,
    field: keyof ProductVariant,
    value: string | number | null
  ) => {
    setProductForm({
      ...productForm,
      variants: productForm.variants?.map((variant) =>
        variant.id === id ? { ...variant, [field]: value } : variant
      ),
    });
  };

  // --- Image upload ---
  const handleImageUpload = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const { imageUrl, imagePublicId } = await response.json();
      setProductForm({ ...productForm, imageUrl, imagePublicId });
      setPreviewImage(imageUrl);

      toast({ title: "Image uploaded", description: "Upload successful." });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
  };

  const removeImage = () => {
    setProductForm({
      ...productForm,
      imageUrl: "",
      imagePublicId: "",
    });
    setPreviewImage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // --- Save product ---
  const handleAddProduct = async () => {
    setIsAdding(true);
    try {
      if (!productForm.title || !productForm.description || !productForm.category) {
        toast({
          title: "Missing fields",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }

      const hasVariants = productForm.variants && productForm.variants.length > 0;

      if (!hasVariants && (!productForm.price || productForm.price <= 0)) {
        toast({ title: "Invalid price", description: "Price is required if no variants exist.", variant: "destructive" });
        return;
      }

      if (!hasVariants && (productForm.inventory == null || productForm.inventory < 0)) {
        toast({ title: "Invalid inventory", description: "Inventory is required if no variants exist.", variant: "destructive" });
        return;
      }

      const productData: Product = {
        id: crypto.randomUUID(),
        title: productForm.title!,
        description: productForm.description!,
        price: productForm.price!,
        inventory: productForm.inventory ?? 0,
        category: productForm.category!,
        subcategory: productForm.subcategory || undefined,
        tags: productForm.tags || [],
        barcode: productForm.barcode || "",
        imageUrl: productForm.imageUrl || "",
        imagePublicId: productForm.imagePublicId || "",
        variants: productForm.variants || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await onAddProduct(productData);
      onOpenChange(false);
      resetForm();
      toast({
        title: "Product Added",
        description: `${productForm.title} has been added successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const resetForm = () => {
    setProductForm({
      title: "",
      description: "",
      price: 0,
      inventory: 0,
      category: "",
      subcategory: "",
      tags: [],
      barcode: "",
      imageUrl: "",
      imagePublicId: "",
      variants: [],
    });
    setPreviewImage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Fill in the details to add a new product to your inventory.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">


          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title *
            </Label>
            <Input
              id="title"
              value={productForm.title}
              onChange={(e) =>
                setProductForm({ ...productForm, title: e.target.value })
              }
              placeholder="Enter product title"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description *
            </Label>
            <Textarea
              id="description"
              value={productForm.description}
              onChange={(e) =>
                setProductForm({ ...productForm, description: e.target.value })
              }
              placeholder="Enter product description"
            />
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price">
              Price (₦) *
            </Label>
            <Input
              id="price"
              type="number"
              min="1"
              value={productForm.price}
              onChange={(e) =>
                setProductForm({
                  ...productForm,
                  price: Number.parseFloat(e.target.value) || 0,
                })
              }
              placeholder="0"
              disabled={hasVariants}
            />
            {hasVariants && (
              <p className="text-xs text-muted-foreground">
                Price is now controlled by variants. Add prices in the variants section below.
              </p>
            )}
          </div>

          {/* Inventory */}
          <div className="space-y-2">
            <Label htmlFor="inventory">
              Inventory
            </Label>
            <Input
              id="inventory"
              type="number"
              min="0"
              value={productForm.inventory}
              onChange={(e) =>
                setProductForm({
                  ...productForm,
                  inventory: Number.parseInt(e.target.value) || 0,
                })
              }
              placeholder="0"
              disabled={hasVariants}
            />
            {hasVariants && (
              <p className="text-xs text-muted-foreground">
                Inventory is now controlled by variants. Add inventory quantities in the variants section below.
              </p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">
              Category *
            </Label>
            <Select
              onValueChange={(value) =>
                setProductForm({ ...productForm, category: value, subcategory: "" })
              }
              value={productForm.category}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(CATEGORY_MAP).map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subcategory (depends on category) */}
          {productForm.category && (
            <div className="space-y-2">
              <Label htmlFor="subcategory">
                Subcategory
              </Label>
              <Select
                onValueChange={(value) =>
                  setProductForm({ ...productForm, subcategory: value })
                }
                value={productForm.subcategory || ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_MAP[productForm.category]?.map((sub) => (
                    <SelectItem key={sub} value={sub}>
                      {sub}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">
              Tags
            </Label>
            <Input
              id="tags"
              placeholder="Comma separated tags"
              value={productForm.tags?.join(",") || ""}
              onChange={(e) =>
                setProductForm({
                  ...productForm,
                  tags: e.target.value
                    ? e.target.value.split(",").map((tag) => tag.trim())
                    : [],
                })
              }
            />
          </div>

          {/* IMAGE UPLOAD */}
          <div className="space-y-2">
            <Label>Upload Image</Label>
            <p className="text-sm text-gray-500">
              Optional. Max file size: 5MB. Supported formats: JPG, PNG, GIF, WebP
            </p>

            {previewImage ? (
              <div className="relative w-full h-48 border-2 border-dashed border-orange-300 rounded-lg overflow-hidden bg-orange-50">
                <Image
                  src={previewImage}
                  alt="Product preview"
                  fill
                  className="object-cover"
                  sizes="(max-width: 650px) 100vw, 650px"
                />
                <button
                  title="remove image"
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 shadow-lg"
                  disabled={isUploading}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                className="w-full h-48 p-4 border-2 border-dashed border-primary rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-orange-400 transition-colors bg-orange-50"
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploading ? (
                  <Loader2 className="w-12 h-12 animate-spin text-primary" />
                ) : (
                  <>
                    <div className="w-16 h-16 mb-4 text-primary">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </div>
                    <p className="text-lg font-medium text-gray-700 mb-1">
                      Drop file or browse
                    </p>
                    <p className="text-sm text-gray-500">
                      Format: .jpeg, .png & Max file size: 5 MB
                    </p>
                    <Button
                      type="button"
                      className="mt-4 bg-primary hover:bg-primary/80 text-white"
                      size="default"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      disabled={isUploading}
                    >
                      Browse Files
                    </Button>
                  </>
                )}
              </div>
            )}

            <input
              title="Product Image"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />
          </div>

          {/* Variants Section */}
          <div className="space-y-2">
            <Label className="font-medium">Variants</Label>
            <div className="space-y-3">
              {productForm.variants?.map((variant) => (
                <div
                  key={variant.id}
                  className="grid grid-cols-12 gap-2 items-center border p-2 rounded-md"
                >
                  <Input
                    placeholder="Name (e.g. Red/XL)"
                    value={variant.name || ""}
                    onChange={(e) =>
                      handleVariantChange(variant.id, "name", e.target.value)
                    }
                    className="col-span-3"
                  />
                  <Input
                    placeholder="Barcode(Optional)"
                    value={variant.sku || ""}
                    onChange={(e) =>
                      handleVariantChange(variant.id, "sku", e.target.value)
                    }
                    className="col-span-3"
                  />
                  <Input
                    type="number"
                    placeholder="Price (₦)"
                    value={variant.price ?? ""}
                    onChange={(e) =>
                      handleVariantChange(
                        variant.id,
                        "price",
                        e.target.value ? Number(e.target.value) : null
                      )
                    }
                    className="col-span-3"
                  />
                  <Input
                    type="number"
                    placeholder="Inventory"
                    value={variant.inventory}
                    onChange={(e) =>
                      handleVariantChange(
                        variant.id,
                        "inventory",
                        Number.parseInt(e.target.value) || 0
                      )
                    }
                    className="col-span-2"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveVariant(variant.id)}
                  >
                    <Trash className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddVariant}
              >
                <Plus className="h-4 w-4 mr-2" /> Add Variant
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddProduct} disabled={isUploading || isAdding}>
            {isUploading || isAdding ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isUploading ? "Uploading..." : "Processing..."}
              </>
            ) : (
              "Add Product"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
