"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Barcode,
  Check,
  ChevronDown,
  Edit,
  MoreHorizontal,
  Plus,
  Search,
  Trash,
} from "lucide-react";
import type { Product } from "@/types";
import { AddProductModal } from "./components/add-product-modal";
import { EditProductModal } from "./components/edit-product-modal";
import { DeleteProductModal } from "./components/delete-product-modal";
import { BarcodeModal } from "./components/barcode-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@tremor/react";
import { CardContent, CardHeader } from "@/components/ui/card";
import { RiArrowLeftSLine, RiArrowRightSLine } from "react-icons/ri";
import { BiCategory } from "react-icons/bi";

const CATEGORIES = {
  "Clothing (Unisex)": ["T-Shirts", "Sweatshirts", "Caps", "Bags"],
  Supplements: ["Weight Gain", "Energy & Recovery"],
  Merchandise: ["Mugs", "Journal Notebooks", "Stickers"],
};

export default function ProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct, orders } =
    useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBarcodeDialogOpen, setIsBarcodeDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const products = useStore.getState().products;
    if (!products || products.length === 0) {
      useStore
        .getState()
        .fetchProducts()
        .then(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

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

  // Filter logic
  const filteredProducts = products.filter((product) => {
    const query = searchQuery.toLowerCase();
    const inProduct =
      product.title.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      (product.subcategory?.toLowerCase().includes(query) ?? false);
    const inVariants =
      product.variants?.some(
        (v) =>
          v.name?.toLowerCase().includes(query) ||
          v.sku?.toLowerCase().includes(query)
      ) ?? false;
    return inProduct || inVariants;
  });

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Products</h2>

      </div>
      <div className="md:flex grid grid-cols-1 items-center justify-between gap-4">
        {/* Search + Category filter */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products, variants, barcode..."
            className="w-full pl-8"
            value={searchQuery || ''}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex w-full items-center gap-3 md:w-auto md:justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="">
                <BiCategory className="mr-2 h-4 w-4" /> Categories
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="max-h-96 overflow-y-auto min-w-[200px]">
              {/* All Categories option */}
              <DropdownMenuItem
                onClick={() => setSearchQuery("")}
                className={`flex items-center justify-between ${!searchQuery ? "bg-orange-100 text-primary" : ""
                  }`}
              >
                <span>All Categories</span>
                {!searchQuery && <Check className="h-4 w-4" />}
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Categories + Subcategories */}
              {Object.entries(CATEGORIES).map(([cat, subs]) => (
                <div key={cat}>
                  <DropdownMenuLabel className="font-semibold text-gray-700">
                    {cat}
                  </DropdownMenuLabel>

                  {subs.map((sub) => {
                    const isActive = searchQuery === sub;
                    return (
                      <DropdownMenuItem
                        key={sub}
                        onClick={() => setSearchQuery(sub)}
                        className={`flex items-center justify-between ${isActive ? "bg-orange-100 text-primary" : ""
                          }`}
                      >
                        <span>{sub}</span>
                        {isActive && <Check className="h-4 w-4" />}
                      </DropdownMenuItem>
                    );
                  })}

                  <DropdownMenuSeparator />
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Products Table */}
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
          <div className="rounded-md">
            <div className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground w-[100px] rounded-l-xl">
                        Product ID
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        Category / Subcategory
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        Date Created
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        Inventory
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        Variants
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        Price
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground w-[80px]">
                        Actions
                      </th>
                      <th className="px-4 py-3 w-[50px] rounded-r-xl"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedProducts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <p className="text-muted-foreground text-lg mb-2">No products found</p>
                            <p className="text-muted-foreground text-sm">
                              {searchQuery
                                ? "Try adjusting your search terms"
                                : "Create your first product to get started"}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedProducts.map((product) => {
                        const hasVariants = product.variants && product.variants.length > 0;
                        const variantPrices = hasVariants
                          ? product.variants!
                            .map((v) => v.price ?? product.price)
                            .filter((p): p is number => p != null)
                          : [];
                        const minPrice = variantPrices.length
                          ? Math.min(...variantPrices)
                          : product.price;
                        const totalInventory = hasVariants
                          ? product.variants!.reduce(
                            (sum, v) => sum + (v.inventory ?? 0),
                            0
                          )
                          : product.inventory;

                        return (
                          <tr key={product.id} className="border-b last:border-0">
                            <td className="px-4 py-4 text-sm font-medium ">{product.id}</td>
                            <td className="px-4 py-4 text-sm font-medium">{product.title}</td>
                            <td className="px-4 py-4 text-sm text-muted-foreground">
                              {product.category}
                              {product.subcategory ? ` / ${product.subcategory}` : ""}
                            </td>
                            <td className="px-4 py-4 text-sm text-muted-foreground">
                              {new Date(product.createdAt).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })}
                            </td>
                            <td className="px-4 py-4 text-sm">
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${(totalInventory ?? 0) < 10
                                  ? "bg-red-100 text-red-800"
                                  : (totalInventory ?? 0) < 30
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-green-100 text-green-800"
                                  }`}
                              >
                                {totalInventory ?? 0}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-sm text-muted-foreground">
                              {hasVariants ? product.variants!.length : "—"}
                            </td>

                            <td className="px-4 py-4 text-sm text-muted-foreground">
                              {hasVariants
                                ? `from ₦${minPrice?.toFixed(2)}`
                                : `₦${product.price?.toFixed(2)}`}
                            </td>

                            <td className="px-4 py-4">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDeleteProduct(product)}>
                                    <Trash className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedProduct(product);
                                      setIsBarcodeDialogOpen(true);
                                    }}
                                  >
                                    <Barcode className="mr-2 h-4 w-4" />
                                    View Barcode
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-between">
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
          </div>
        </>
      )}

      {/* Modals */}
      <AddProductModal
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddProduct={addProduct}
      />
      <EditProductModal
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        product={selectedProduct}
        onUpdateProduct={updateProduct}
      />
      <DeleteProductModal
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        product={selectedProduct}
        orders={orders}
        onDeleteProduct={deleteProduct}
      />
      <BarcodeModal
        open={isBarcodeDialogOpen}
        onOpenChange={setIsBarcodeDialogOpen}
        product={selectedProduct}
        onUpdateProduct={updateProduct}
      />
    </div>
  );
}
