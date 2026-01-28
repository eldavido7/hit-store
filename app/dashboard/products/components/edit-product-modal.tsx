"use client";

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
import type { Product, ProductVariant } from "@/types";
import { useEffect, useRef, useState } from "react";
import { Upload, X, Loader2, ImageIcon, Plus, Trash2 } from "lucide-react";
import Image from "next/image";

interface EditProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onUpdateProduct: (id: string, product: Partial<Product>) => void;
}

export function EditProductModal({
  open,
  onOpenChange,
  product,
  onUpdateProduct,
}: EditProductModalProps) {
  const [productForm, setProductForm] = useState<Partial<Product>>({
    title: "",
    description: "",
    price: 0,
    inventory: 0,
    category: "",
    subcategory: "",
    tags: [],
    imageUrl: "",
    imagePublicId: "",
    variants: [],
  });

  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product) {
      setProductForm({
        title: product.title,
        description: product.description,
        price: product.price,
        inventory: product.inventory,
        category: product.category,
        subcategory: product.subcategory || "",
        tags: product.tags || [],
        imageUrl: product.imageUrl,
        imagePublicId: product.imagePublicId,
        variants: product.variants || [],
      });
      setPreviewImage(product.imageUrl || "");
    }
  }, [product]);

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file type", description: "Please select an image file.", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please select an image smaller than 5MB.", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", { method: "POST", body: formData });
      if (!response.ok) throw new Error("Upload failed");

      const { imageUrl, imagePublicId } = await response.json();
      setProductForm((prev) => ({ ...prev, imageUrl, imagePublicId }));
      setPreviewImage(imageUrl);

      toast({ title: "Image uploaded", description: "Product image has been uploaded successfully." });
    } catch (error) {
      console.error("Upload error:", error);
      toast({ title: "Upload failed", description: "Failed to upload image. Please try again.", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
  };

  const removeImage = () => {
    setProductForm({ ...productForm, imageUrl: "", imagePublicId: "" });
    setPreviewImage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // --- Variants Management ---
  const addVariant = () => {
    setProductForm((prev) => ({
      ...prev,
      variants: [
        ...(prev.variants || []),
        { id: crypto.randomUUID(), sku: "", name: "", price: 0, inventory: 0 } as ProductVariant,
      ],
    }));
  };

  const updateVariant = (index: number, key: keyof ProductVariant, value: string | number) => {
    setProductForm((prev) => {
      const updated = [...(prev.variants || [])];
      updated[index] = { ...updated[index], [key]: value };
      return { ...prev, variants: updated };
    });
  };

  const removeVariant = (index: number) => {
    setProductForm((prev) => {
      const updated = [...(prev.variants || [])];
      updated.splice(index, 1);
      return { ...prev, variants: updated };
    });
  };

  const saveProductChanges = async () => {
    setIsSaving(true);
    if (!product) return;

    try {
      // Just call the store function - it handles the API call and state update
      await onUpdateProduct(product.id, productForm);

      onOpenChange(false);

      toast({
        title: "Product Updated",
        description: `${productForm.title} has been updated successfully.`
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "There was a problem updating the product.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const CATEGORY_MAP: Record<string, string[]> = {
    Clothing: ["T-Shirts", "Sweatshirts", "Caps", "Bags"],
    "Health & Nutrition": ["Protein Formula", "Supplements"],
    Mugs: ["Ceramic", "Glass"],
    Journals: ["Notebooks", "Planners"],
    Stickers: ["Vinyl", "Paper"],
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>Update the product details.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">


          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              value={productForm.title}
              onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={productForm.description}
              onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
            />
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="edit-price">Price</Label>
            <Input
              id="edit-price"
              type="number"
              value={productForm.price || 0}
              onChange={(e) => setProductForm({ ...productForm, price: Number.parseFloat(e.target.value) })}
              disabled={(productForm.variants?.length || 0) > 0}
            />
            {(productForm.variants?.length || 0) > 0 && (
              <p className="text-xs text-muted-foreground">
                Cannot edit price when variants exist. Update variant prices instead.
              </p>
            )}
          </div>

          {/* Inventory */}
          <div className="space-y-2">
            <Label htmlFor="edit-inventory">Inventory</Label>
            <Input
              id="edit-inventory"
              type="number"
              value={productForm.inventory || 0}
              onChange={(e) => setProductForm({ ...productForm, inventory: Number.parseInt(e.target.value) })}
              disabled={(productForm.variants?.length || 0) > 0}
            />
            {(productForm.variants?.length || 0) > 0 && (
              <p className="text-xs text-muted-foreground">
                Cannot edit inventory when variants exist. Update variant inventory instead.
              </p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="edit-category">Category</Label>
            <Select
              value={productForm.category}
              onValueChange={(value) => {
                setProductForm({ ...productForm, category: value, subcategory: "" });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(CATEGORY_MAP).map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subcategory */}
          <div className="space-y-2">
            <Label htmlFor="edit-subcategory">Subcategory</Label>
            <Select
              value={productForm.subcategory || ""}
              onValueChange={(value) => setProductForm({ ...productForm, subcategory: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Optional subcategory" />
              </SelectTrigger>
              <SelectContent>
                {(CATEGORY_MAP[productForm.category ?? ""] || []).map((sub) => (
                  <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="edit-tags">Tags</Label>
            <Input
              id="edit-tags"
              placeholder="Comma separated tags"
              value={productForm.tags?.join(",") || ""}
              onChange={(e) => setProductForm({ ...productForm, tags: e.target.value ? e.target.value.split(",").map((tag) => tag.trim()) : [] })}
            />
          </div>

          {/* IMAGE UPLOAD */}
          <div className="space-y-2">
            <Label>Upload Image</Label>
            <p className="text-sm text-gray-500">
              Optional. Max file size: 5MB. Supported formats: JPG, PNG, GIF, WebP
            </p>

            {previewImage ? (
              <div className="relative w-full h-48 border-2 border-dashed border-primary rounded-lg overflow-hidden bg-primary/5">
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
                className="w-full h-48 p-4 border-2 border-dashed border-primary rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/70 transition-colors bg-primary/5"
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
                      className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground"
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

          {/* Variants */}
          <div className="space-y-2">
            <Label className="font-medium">Variants</Label>
            <div className="space-y-3">
              {(productForm.variants || []).map((variant, index) => (
                <div key={variant.id} className="flex items-center gap-2 border p-2 rounded-lg">
                  <Input
                    placeholder="SKU"
                    value={variant.sku || ""}
                    onChange={(e) => updateVariant(index, "sku", e.target.value)}
                    className="w-24"
                  />
                  <Input
                    placeholder="Name"
                    value={variant.name || ""}
                    onChange={(e) => updateVariant(index, "name", e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Price"
                    type="number"
                    value={variant.price || 0}
                    onChange={(e) => updateVariant(index, "price", Number.parseFloat(e.target.value))}
                    className="w-24"
                  />
                  <Input
                    placeholder="Inventory"
                    type="number"
                    value={variant.inventory || 0}
                    onChange={(e) => updateVariant(index, "inventory", Number.parseInt(e.target.value))}
                    className="w-28"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeVariant(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addVariant}
            >
              <Plus className="w-4 h-4 mr-2" /> Add Variant
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={saveProductChanges}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
