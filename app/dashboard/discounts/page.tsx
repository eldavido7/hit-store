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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Edit,
  MoreHorizontal,
  Percent,
  Plus,
  Search,
  Tag,
  Trash,
} from "lucide-react";
import type { Discount } from "@/types";
import { format } from "date-fns";
import { AddDiscountModal } from "./components/add-discount-modal";
import { EditDiscountModal } from "./components/edit-discount-modal";
import { DeleteDiscountModal } from "./components/delete-discount-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@tremor/react";
import { CardContent, CardHeader } from "@/components/ui/card";
import { useShallow } from "zustand/react/shallow";
import { toast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RiArrowLeftSLine, RiArrowRightSLine } from "react-icons/ri";

export default function DiscountsPage() {
  const {
    discounts,
    products,
    fetchDiscounts,
    fetchProducts,
    addDiscount,
    updateDiscount,
    deleteDiscount,
  } = useStore(
    useShallow((state) => ({
      discounts: state.discounts,
      products: state.products,
      fetchDiscounts: state.fetchDiscounts,
      fetchProducts: state.fetchProducts,
      addDiscount: state.addDiscount,
      updateDiscount: state.updateDiscount,
      deleteDiscount: state.deleteDiscount,
    }))
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("discounts");
  const [isAddDiscountOpen, setIsAddDiscountOpen] = useState(false);
  const [isEditDiscountOpen, setIsEditDiscountOpen] = useState(false);
  const [isDeleteDiscountOpen, setIsDeleteDiscountOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const discounts = useStore.getState().discounts;
    const products = useStore.getState().products;
    if (!discounts || discounts.length === 0 || !products || products.length === 0) {
      Promise.all([useStore.getState().fetchDiscounts(), useStore.getState().fetchProducts()])
        .then(() => {
          const updatedDiscounts = useStore.getState().discounts;
          console.log("[FETCHED_DISCOUNTS]", updatedDiscounts);
          setLoading(false);
        })
        .catch((error) => {
          console.error("[FETCH_DISCOUNTS_OR_PRODUCTS]", error);
          toast({
            title: "Error",
            description: "Failed to fetch discounts or products.",
            variant: "destructive",
          });
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [toast]);

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

  const filteredDiscounts = discounts.filter(
    (discount) =>
      discount.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (discount.description &&
        discount.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const paginatedDiscounts = filteredDiscounts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAddDiscount = async (discountData: Discount) => {
    try {
      await addDiscount(discountData);
      await fetchDiscounts();
      toast({
        title: "Discount Created",
        description: "Discount has been created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create discount. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateDiscount = async (
    id: string,
    updatedData: Partial<Discount>
  ) => {
    try {
      await updateDiscount(id, updatedData);
      await fetchDiscounts();
      toast({
        title: "Discount Updated",
        description: `${updatedData.code} has been updated successfully.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "There was a problem updating the discount.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDiscount = async (id: string) => {
    try {
      await deleteDiscount(id);
      await fetchDiscounts();
      toast({
        title: "Discount Deleted",
        description: `${selectedDiscount?.code} has been deleted.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "There was a problem deleting the discount.",
        variant: "destructive",
      });
    }
  };

  const openEditModal = (discount: Discount) => {
    setSelectedDiscount(discount);
    setIsEditDiscountOpen(true);
  };

  const openDeleteModal = (discount: Discount) => {
    setSelectedDiscount(discount);
    setIsDeleteDiscountOpen(true);
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Discounts</h2>
        <Button onClick={() => setIsAddDiscountOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Discount
        </Button>
      </div>

      <div className="flex items-center gap-4 flex-1 mt-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search discounts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-3xl bg-gray-100 border-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground rounded-l-xl">
                    Code
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Value
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Usage
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Dates
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground w-[100px] rounded-r-xl">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedDiscounts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <p className="text-muted-foreground text-lg mb-2">No discounts found</p>
                        <p className="text-muted-foreground text-sm">
                          {searchQuery
                            ? "Try adjusting your search terms"
                            : "Create your first discount to get started"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedDiscounts.map((discount) => (
                    <tr key={discount.id} className="border-b last:border-0">
                      <td className="px-4 py-4 text-sm font-medium">{discount.code}</td>
                      <td className="px-4 py-4 text-sm text-muted-foreground">
                        {discount.type === "percentage" ? (
                          <span className="flex items-center">
                            <Percent className="h-4 w-4 mr-1" />
                            Percentage
                          </span>
                        ) : discount.type === "fixed_amount" ? (
                          <span className="flex items-center">
                            <Tag className="h-4 w-4 mr-1" />
                            Fixed Amount
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <Tag className="h-4 w-4 mr-1" />
                            Free Shipping
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-muted-foreground">
                        {discount.type === "percentage"
                          ? `${discount.value}%`
                          : discount.type === "fixed_amount"
                            ? `₦${discount.value}`
                            : "Free"}
                      </td>
                      <td className="px-4 py-4 text-sm text-muted-foreground">
                        {discount.usageCount} / {discount.usageLimit ? discount.usageLimit : "∞"}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <div
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${discount.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                            }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${discount.isActive ? "bg-green-500" : "bg-red-500"
                              }`}
                          />
                          <span>{discount.isActive ? "Active" : "Inactive"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-muted-foreground">
                        <div className="text-xs">
                          <div>Start: {format(discount.startsAt, "MMM dd, yyyy")}</div>
                          {discount.endsAt && <div>End: {format(discount.endsAt, "MMM dd, yyyy")}</div>}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-xs text-muted-foreground mb-2">
                          {discount.products?.length ? (
                            <div>Products: {discount.products.map((p) => p.title).join(", ")}</div>
                          ) : null}
                          {discount.variants?.length ? (
                            <div>Variants: {discount.variants.map((v) => `${v.name} (${v.sku || 'N/A'})`).join(", ")}</div>
                          ) : null}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditModal(discount)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openDeleteModal(discount)}>
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

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
            const totalPages = Math.ceil(filteredDiscounts.length / itemsPerPage)
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
          onClick={() => setCurrentPage(Math.min(Math.ceil(filteredDiscounts.length / itemsPerPage), currentPage + 1))}
          disabled={currentPage === Math.ceil(filteredDiscounts.length / itemsPerPage)}
        >
          Next <RiArrowRightSLine />
        </Button>
      </div>

      {/* Modals */}
      <AddDiscountModal
        open={isAddDiscountOpen}
        onOpenChange={setIsAddDiscountOpen}
        onAddDiscount={handleAddDiscount}
      />

      <EditDiscountModal
        open={isEditDiscountOpen}
        onOpenChange={setIsEditDiscountOpen}
        discount={selectedDiscount}
        onUpdateDiscount={(updated) => {
          if (selectedDiscount) {
            return handleUpdateDiscount(selectedDiscount.id, updated);
          }
        }}
      />

      <DeleteDiscountModal
        open={isDeleteDiscountOpen}
        onOpenChange={setIsDeleteDiscountOpen}
        discount={selectedDiscount}
        onDeleteDiscount={() => {
          if (selectedDiscount) {
            handleDeleteDiscount(selectedDiscount.id);
          }
        }}
      />
    </div>
  );
}
