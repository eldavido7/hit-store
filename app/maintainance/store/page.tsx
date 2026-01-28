"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, X } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { StoreHeader } from "./components/store-header";
import { useToast } from "@/hooks/use-toast";
import type { Product, ProductVariant } from "@/types";
import { Toaster } from "@/components/ui/toaster";
import { useStore } from "@/store/store";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useCustomerAuthStore } from "@/store/store";
import Header from "@/components/headeruser";
import Footer from "@/components/footer";

const ITEMS_PER_PAGE = 9;

export default function StorePage() {
  const { addItem, items } = useCart();
  const { toast } = useToast();
  const { products } = useStore();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  const {
    customer,
    verifyToken,
    addToWishlist,
    removeFromWishlist,
    isInWishlist
  } = useCustomerAuthStore();

  useEffect(() => {
    const products = useStore.getState().products;
    if (!products || products.length === 0) {
      useStore
        .getState()
        .fetchProducts()
        .then(() => {
          setLoading(false);
        })
        .catch((error) => {
          console.error("Fetch products error:", error);
          setLoading(false);
          toast({
            title: "Error",
            description: "Failed to load products. Please try again.",
            variant: "destructive",
          });
        });
    } else {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  const categories = [
    "all",
    ...Array.from(new Set(products.map((p) => p.category))),
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.tags?.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    const totalInventory = product.variants?.length
      ? product.variants.reduce((sum, v) => sum + (v.inventory ?? 0), 0)
      : product.inventory ?? 0;
    return matchesSearch && matchesCategory && totalInventory > 0;
  });

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Keep this exact function in your main store file
  const toggleWishlist = async (productId: string, variantId?: string) => {
    if (!customer) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add items to your wishlist",
        variant: "destructive",
      });
      return;
    }

    // Find the product to check if it has variants
    const product = products.find(p => p.id === productId);
    if (!product) return;

    // If product has variants but no variant was specified, open the product modal
    if (product.variants && product.variants.length > 0 && !variantId) {
      handleOpenProduct(product);
      toast({
        title: "Select a variant",
        description: "Please select a specific variant to add to your wishlist",
      });
      return;
    }

    const inWishlist = isInWishlist(productId, variantId);

    if (inWishlist) {
      const result = await removeFromWishlist(productId, variantId);
      if (result.success) {
        toast({
          title: "Removed from wishlist",
          description: "Item has been removed from your wishlist.",
        });
      }
    } else {
      const result = await addToWishlist(productId, variantId);
      if (result.success) {
        toast({
          title: "Added to wishlist",
          description: "Item has been added to your wishlist.",
        });
      }
    }
  };

  const handleOpenProduct = (product: Product) => {
    setSelectedProduct(product);
    setSelectedVariant(null);
  };

  const handleAddToCart = (product: Product, variant?: ProductVariant) => {
    const availableInventory = variant
      ? variant.inventory
      : product.variants?.length
        ? product.variants.reduce((sum, v) => sum + (v.inventory ?? 0), 0)
        : product.inventory ?? 0;
    if (availableInventory <= 0) {
      toast({
        title: "Out of stock",
        description: `${product.title}${variant ? ` (${variant.name})` : ''} is out of stock.`,
        variant: "destructive",
      });
      return;
    }
    const effectivePrice = variant?.price ?? product.price;
    if (effectivePrice == null || effectivePrice <= 0) {
      toast({
        title: "Invalid price",
        description: `No valid price found for ${product.title}${variant ? ` (${variant.name})` : ''}.`,
        variant: "destructive",
      });
      return;
    }
    addItem(product, 1, variant);
    toast({
      title: "Added to cart",
      description: `${product.title}${variant ? ` - ${variant.name}` : ''} has been added to your cart.`,
    });
  };

  const isInCart = (product: Product, variant?: ProductVariant) => {
    const targetVariantId = variant?.id ?? undefined;
    return items.some(
      (item) =>
        item.product.id === product.id &&
        item.variantId == targetVariantId
    );
  };

  const isAnyVariantInCart = (product: Product) => {
    if (!product.variants?.length) {
      return isInCart(product);
    }
    return items.some(item => item.product.id === product.id);
  };

  if (isLoading || loading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-[300px]" />
          <Skeleton className="h-10 w-[120px]" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[200px] mb-2" />
            <Skeleton className="h-4 w-[300px]" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      <Header />
      <div className="text-center relative h-[200px]">
        <div className="w-full h-full z-10 overflow-hidden">
          <Image src="/storehero.png" alt="Background frame" fill className="object-cover object-center" />
        </div>

        <div className="absolute inset-0 z-20 md:p-6 flex flex-col items-center justify-center">
          <div className="max-w-2xl mx-auto px-6">
            <h1 className="text-4xl md:text-4xl font-cormorant text-white md:m-6 leading-tight">
              Shop with Purpose
            </h1>
            <p className="text-lg text-white mb-8 leading-relaxed">
              Every purchase supports our mission to share stories, empower voices, and build community
            </p>
          </div>
        </div>
      </div>

      <StoreHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
      />

      <main className="py-8">
        <div className="container mx-auto px-4">

          {currentProducts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Image
                src="/basket.png"
                alt="Empty basket"
                width={120}
                height={120}
                className="mx-auto mb-4 opacity-70"
              />
              <p>
                No products found
              </p>
              <p>
                Check back soon, exciting products are on the way!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {currentProducts.map((product) => {
                const productInCart = product.variants?.length
                  ? isAnyVariantInCart(product)
                  : isInCart(product);

                return (

                  <Card
                    key={product.id}
                    onClick={() => handleOpenProduct(product)}
                    className="overflow-hidden hover:shadow-lg  rounded-3xltransition cursor-pointer relative"
                  >
                    <CardHeader className="p-0">
                      <div className="relative h-72 w-full">
                        <Image
                          src={product.imageUrl || "/placeholder.svg"}
                          alt={product.title}
                          fill
                          className="object-cover p-3 rounded-3xl"
                        />
                        <Badge
                          className={cn(
                            "absolute top-5 right-4 px-2 py-1",
                            (product.variants?.length
                              ? product.variants.reduce((sum, v) => sum + (v.inventory ?? 0), 0)
                              : product.inventory ?? 0) < 10
                              ? "bg-red-100 text-red-800"
                              : "bg-white text-black"
                          )}
                        >
                          {product.variants?.length
                            ? `${product.variants.reduce((sum, v) => sum + (v.inventory ?? 0), 0)} in stock`
                            : `${product.inventory ?? 0} in stock`}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <h3 className="text-2xl font-semibold line-clamp-1">
                        {product.title}
                      </h3>
                      <p className="text-gray-600 text-md line-clamp-2">
                        {product.description}
                      </p>
                      <span className="text-3xl font-bold font-cormorant block mt-2">
                        {product.variants?.length
                          ? `from ₦${Math.min(
                            ...product.variants
                              .map((v) => v.price)
                              .filter((price): price is number => price != null)
                          ).toLocaleString()}`
                          : `₦${product.price?.toLocaleString() ?? 'N/A'}`}
                      </span>
                    </CardContent>
                    <CardFooter className="flex items-center gap-2">
                      <Button
                        className="flex-1 bg-[#bf5925] hover:bg-[#bf5925]/90 text-white rounded-xl py-2"
                        disabled={productInCart}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!product.variants?.length) {
                            handleAddToCart(product);
                          } else {
                            handleOpenProduct(product);
                          }
                        }}
                      >
                        {productInCart ? "Added to Cart" : "Add to Cart"}
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-10 w-10 rounded-xl border bg-orange-50 border-gray-200 hover:bg-gray-100 ${
                          // Only show as wishlisted if it's actually wishlisted (no variants or specific variant)
                          (!product.variants?.length && isInWishlist(product.id)) ? "text-[#bf5925]" : "text-[#bf5925]"
                          }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(product.id);
                        }}
                      >
                        <Heart
                          className="h-5 w-5"
                          fill={(!product.variants?.length && isInWishlist(product.id)) ? "currentColor" : "none"}
                        />
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  onClick={() => setCurrentPage(page)}
                  className={
                    currentPage === page
                      ? "bg-green-600 hover:bg-green-700"
                      : ""
                  }
                >
                  {page}
                </Button>
              ))}
            </div>
          )}
        </div>
      </main>

      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogOverlay className="fixed inset-0 bg-black/0 backdrop-blur-sm" />
        {/* Make the default DialogContent an invisible container */}
        <DialogContent className="max-w-lg bg-transparent p-0 shadow-none border-0">
          {selectedProduct && (
            // Create a new relative container for positioning
            <div className="relative">
              {/* The close button is now positioned relative to this new container */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute -right-12 top-0 z-50 h-8 w-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                onClick={() => setSelectedProduct(null)}
              >
                <X className="h-4 w-4" />
              </Button>

              {/* This is now your VISIBLE modal content */}
              <div className="bg-white rounded-[30px] overflow-hidden">
                <DialogHeader className="p-3 relative">
                  <div className="relative h-72 w-full">
                    <Image
                      src={selectedProduct.imageUrl || "/placeholder.svg"}
                      alt={selectedProduct.title}
                      fill
                      className="object-cover rounded-[30px] object-center"
                    />
                    {/* Stock Badge */}
                    <Badge
                      className={cn(
                        "absolute top-4 right-4 z-10 px-2 py-1",
                        (selectedProduct.variants?.length
                          ? selectedProduct.variants.reduce((sum, v) => sum + (v.inventory ?? 0), 0)
                          : selectedProduct.inventory ?? 0) < 10
                          ? "bg-red-100 text-red-800"
                          : "bg-white text-black"
                      )}
                    >
                      {selectedProduct.variants?.length
                        ? `${selectedProduct.variants.reduce((sum, v) => sum + (v.inventory ?? 0), 0)} in stock`
                        : `${selectedProduct.inventory ?? 0} in stock`}
                    </Badge>
                  </div>
                </DialogHeader>

                <div className="p-6 space-y-4">
                  <DialogTitle className="text-2xl font-semibold">{selectedProduct.title}</DialogTitle>
                  <p className="text-gray-700">{selectedProduct.description}</p>

                  {(!selectedProduct.variants || selectedProduct.variants.length === 0) && (
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-bold font-cormorant">₦{selectedProduct.price?.toLocaleString() ?? 'N/A'}</span>
                    </div>
                  )}

                  {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.variants.map((variant) => (
                        <div key={variant.id} className="relative">
                          <Button
                            variant={
                              selectedVariant?.id === variant.id
                                ? "default"
                                : "outline"
                            }
                            onClick={() => setSelectedVariant(variant)}
                            className="rounded-full"
                          >
                            {variant.name} – ₦{variant.price?.toLocaleString() ?? 'N/A'}
                          </Button>
                          <Badge
                            className={cn(
                              "absolute top-0 right-0 -translate-y-1/2 translate-x-1/2",
                              (variant.inventory ?? 0) < 10
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            )}
                          >
                            {variant.inventory ?? 0}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-[#bf5925] hover:bg-[#bf5925/80 text-white rounded-xl"
                      disabled={
                        (selectedProduct.variants && selectedProduct.variants.length > 0 && !selectedVariant) ||
                        isInCart(selectedProduct, selectedVariant || undefined)
                      }
                      onClick={() => handleAddToCart(selectedProduct, selectedVariant || undefined)}
                    >
                      {isInCart(selectedProduct, selectedVariant || undefined)
                        ? "Added to Cart"
                        : "Add to Cart"}
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-10 w-10 rounded-xl border bg-orange-50 border-gray-200 hover:bg-gray-100 ${isInWishlist(selectedProduct.id, selectedVariant?.id)
                        ? "text-[#bf5925]"
                        : "text-[#bf5925]"
                        }`}
                      onClick={() => toggleWishlist(selectedProduct.id, selectedVariant?.id)}
                      disabled={(selectedProduct.variants?.length ?? 0) > 0 && !selectedVariant}
                    >
                      <Heart
                        className="h-5 w-5"
                        fill={isInWishlist(selectedProduct.id, selectedVariant?.id) ? "currentColor" : "none"}
                      />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Footer />
    </div>
  );
}