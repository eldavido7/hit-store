"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ChevronDown, Edit, Filter, Loader2, Search } from "lucide-react";
import { RiArrowLeftSLine, RiArrowRightSLine } from "react-icons/ri";
import { toast } from "@/components/ui/use-toast";
import type { Product, ProductVariant } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@tremor/react";
import { CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function InventoryPage() {
  const { products, updateProduct, fetchProducts, updateVariant } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [newInventory, setNewInventory] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [scannedBarcode, setScannedBarcode] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const itemsPerPage = 10;

  // Fetch products if not loaded
  useEffect(() => {
    if (products.length === 0) {
      fetchProducts()
        .then(() => {
          console.log("[FETCHED_PRODUCTS]", useStore.getState().products);
          setLoading(false);
        })
        .catch((err) => {
          console.error("[FETCH_PRODUCTS_ERROR]", err);
          toast({
            title: "Error",
            description: "Failed to fetch products.",
            variant: "destructive",
          });
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  // Handle barcode scanning
  useEffect(() => {
    const handleBarcodeScan = (e: KeyboardEvent) => {
      if (!isUpdateDialogOpen || !selectedProduct || e.key !== "Enter") return;
      const expectedBarcode = selectedVariant?.sku ?? selectedProduct.barcode;
      if (scannedBarcode === expectedBarcode) {
        setNewInventory((prev) => prev + 1);
        setScannedBarcode("");
        toast({
          title: "Barcode Scanned",
          description: `Inventory for ${selectedProduct.title}${selectedVariant ? ` - ${selectedVariant.name}` : ''} increased by 1.`,
        });
      } else {
        toast({
          title: "Invalid Barcode",
          description: `Scanned barcode does not match ${selectedProduct.title}${selectedVariant ? ` - ${selectedVariant.name}` : ''}.`,
          variant: "destructive",
        });
      }
    };

    if (isUpdateDialogOpen) {
      window.addEventListener("keypress", handleBarcodeScan);
    }

    return () => {
      window.removeEventListener("keypress", handleBarcodeScan);
    };
  }, [isUpdateDialogOpen, selectedProduct, selectedVariant, scannedBarcode]);

  // Filter products by search and category
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter
      ? product.category === categoryFilter
      : true;
    return matchesSearch && matchesCategory;
  });

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Get unique categories
  const categories = Array.from(
    new Set(products.map((product) => product.category))
  );

  // Open edit modal
  const handleEditInventory = (product: Product) => {
    setSelectedProduct(product);
    setSelectedVariant(null);
    setNewInventory(product.variants?.length ? 0 : product.inventory ?? 0);
    setScannedBarcode("");
    setIsUpdateDialogOpen(true);
  };

  // Update inventory
  const handleUpdateInventory = async () => {
    setIsUpdating(true);

    if (!selectedProduct || newInventory < 0) {
      setIsUpdateDialogOpen(false);
      return;
    }

    try {
      if (selectedProduct.variants?.length && selectedVariant) {
        await updateVariant(selectedProduct.id, selectedVariant.id, { inventory: newInventory });
        toast({
          title: "Inventory Updated",
          description: `Inventory for ${selectedProduct.title} - ${selectedVariant.name} updated to ${newInventory}.`,
        });
      } else {
        await updateProduct(selectedProduct.id, { inventory: newInventory });
        toast({
          title: "Inventory Updated",
          description: `Inventory for ${selectedProduct.title} updated to ${newInventory}.`,
        });
      }
      setIsUpdateDialogOpen(false);
      setSelectedProduct(null);
      setSelectedVariant(null);
      setNewInventory(0);
    } catch (err) {
      console.error("[UPDATE_INVENTORY]", err);
      toast({
        title: "Error",
        description: "Failed to update inventory.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
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
            <div className="space-y-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-10 w-full" />
            </div>

            <Skeleton className="h-24 w-full" />

            <div className="space-y-2">
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="flex justify-end space-x-2">
              <Skeleton className="h-10 w-[100px]" />
              <Skeleton className="h-10 w-[150px]" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <h2 className="text-3xl font-bold tracking-tight">Inventory</h2>
      <p className="text-muted-foreground">Manage your product inventory</p>

      {filteredProducts.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-medium">No products found</h3>
            <p className="text-muted-foreground">
              Create some and they'll appear here
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="md:flex grid grid-cols-1 items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <Input
                  placeholder="Search products by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-3xl bg-gray-100 border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
            </div>

            <div className="flex items-center justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 bg-transparent rounded-lg">
                    <Filter className="h-4 w-4" />
                    {categoryFilter || "All Categories"}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setCategoryFilter(null)}>
                    All Categories
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {categories.map((category) => (
                    <DropdownMenuItem
                      key={category}
                      onClick={() => setCategoryFilter(category)}
                    >
                      {category}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground rounded-l-xl">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Inventory
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground w-[80px] rounded-r-xl">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <p className="text-muted-foreground text-lg mb-2">No products found</p>
                          <p className="text-muted-foreground text-sm">
                            {searchQuery || categoryFilter
                              ? "Try adjusting your filters or search terms"
                              : "Create some and they'll appear here"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedProducts.map((product) => (
                      <tr key={product.id} className="border-b last:border-0">
                        <td className="px-4 py-4 text-sm font-medium">{product.title}</td>
                        <td className="px-4 py-4 text-sm">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${(product.variants?.length
                              ? product.variants.reduce((sum, v) => sum + v.inventory, 0)
                              : product.inventory ?? 0) < 10
                              ? "bg-red-100 text-red-800"
                              : (product.variants?.length
                                ? product.variants.reduce((sum, v) => sum + v.inventory, 0)
                                : product.inventory ?? 0) < 30
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                              }`}
                          >
                            {product.variants?.length
                              ? product.variants.reduce((sum, v) => sum + v.inventory, 0)
                              : product.inventory ?? 0}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleEditInventory(product)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit inventory</span>
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Edit Inventory Modal */}
          <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Update Inventory</DialogTitle>
                <DialogDescription>
                  {selectedProduct && (
                    <span>Update inventory for {selectedProduct.title}{selectedVariant ? ` - ${selectedVariant.name}` : ''}</span>
                  )}
                </DialogDescription>
              </DialogHeader>

              {selectedProduct && (
                <div className="grid gap-4 py-4">
                  {(selectedProduct.variants?.length ?? 0) > 0 && (
                    <div className="grid gap-2">
                      <Label htmlFor="variant">Variant</Label>
                      <Select
                        value={selectedVariant?.id || ""}
                        onValueChange={(value) => {
                          const variant = selectedProduct.variants?.find((v) => v.id === value);
                          setSelectedVariant(variant || null);
                          setNewInventory(variant ? variant.inventory : 0);
                          setScannedBarcode("");
                        }}
                      >
                        <SelectTrigger id="variant">
                          <SelectValue placeholder="Select a variant" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedProduct.variants?.map((variant) => (
                            <SelectItem key={variant.id} value={variant.id}>
                              {variant.name} (Stock: {variant.inventory})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="grid gap-2">
                    <Label htmlFor="barcode">Scan Barcode</Label>
                    <Input
                      id="barcode"
                      value={scannedBarcode}
                      onChange={(e) => setScannedBarcode(e.target.value)}
                      placeholder="Scan or enter barcode"
                      autoFocus
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="inventory">Inventory</Label>
                    <Input
                      id="inventory"
                      type="number"
                      min="0"
                      value={newInventory}
                      onChange={(e) => {
                        const value = Number.parseInt(e.target.value);
                        setNewInventory(isNaN(value) ? 0 : value);
                      }}
                    />
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsUpdateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateInventory}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Inventory"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <div className="flex items-center justify-between pt-6">
            <Button
              variant="ghost"
              className="gap-2 rounded-lg border"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <RiArrowLeftSLine /> Back
            </Button>

            <div className="flex items-center gap-2">
              {(() => {
                const buttons = []
                const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
                const maxVisiblePages = 5

                if (totalPages <= maxVisiblePages) {
                  for (let i = 1; i <= totalPages; i++) {
                    buttons.push(
                      <Button
                        key={i}
                        variant={currentPage === i ? "outline" : "ghost"}
                        size="sm"
                        className="h-8 w-8 p-0 bg-transparent"
                        onClick={() => setCurrentPage(i)}
                      >
                        {i}
                      </Button>,
                    )
                  }
                } else {
                  buttons.push(
                    <Button
                      key={1}
                      variant={currentPage === 1 ? "outline" : "ghost"}
                      size="sm"
                      className="h-8 w-8 p-0 bg-transparent"
                      onClick={() => setCurrentPage(1)}
                    >
                      1
                    </Button>,
                  )

                  if (currentPage > 3) {
                    buttons.push(
                      <span key="ellipsis1" className="text-muted-foreground">
                        ...
                      </span>,
                    )
                  }

                  const start = Math.max(2, currentPage - 1)
                  const end = Math.min(totalPages - 1, currentPage + 1)

                  for (let i = start; i <= end; i++) {
                    buttons.push(
                      <Button
                        key={i}
                        variant={currentPage === i ? "outline" : "ghost"}
                        size="sm"
                        className="h-8 w-8 p-0 bg-transparent"
                        onClick={() => setCurrentPage(i)}
                      >
                        {i}
                      </Button>,
                    )
                  }

                  if (currentPage < totalPages - 2) {
                    buttons.push(
                      <span key="ellipsis2" className="text-muted-foreground">
                        ...
                      </span>,
                    )
                  }

                  if (totalPages > 1) {
                    buttons.push(
                      <Button
                        key={totalPages}
                        variant={currentPage === totalPages ? "outline" : "ghost"}
                        size="sm"
                        className="h-8 w-8 p-0 bg-transparent"
                        onClick={() => setCurrentPage(totalPages)}
                      >
                        {totalPages}
                      </Button>,
                    )
                  }
                }

                return buttons
              })()}
            </div>

            <Button
              variant="ghost"
              className="gap-2 rounded-lg border"
              onClick={() => setCurrentPage(Math.min(Math.ceil(filteredProducts.length / itemsPerPage), currentPage + 1))}
              disabled={currentPage === Math.ceil(filteredProducts.length / itemsPerPage)}
            >
              Next <RiArrowRightSLine />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
