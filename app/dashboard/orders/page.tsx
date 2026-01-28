"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { useStore } from "@/store/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { CreateOrderModal } from "./components/create-order-modal";
import { ViewOrderModal } from "./components/view-order-modal";
import { EditOrderModal } from "./components/edit-order-modal";
import { RiArrowLeftSLine, RiArrowRightSLine } from "react-icons/ri";
import {
  Check,
  ChevronDown,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
} from "lucide-react";
import type { Order } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function OrdersPage() {
  const { orders, addOrder, updateOrder, fetchProducts, fetchOrders } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [createOrderOpen, setCreateOrderOpen] = useState(false);
  const [editOrderOpen, setEditOrderOpen] = useState(false);
  const [viewOrderOpen, setViewOrderOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const statuses = [
    { label: "All Orders", value: null },
    { label: "Pending", value: "PENDING" },
    { label: "Processing", value: "PROCESSING" },
    { label: "Shipped", value: "SHIPPED" },
    { label: "Delivered", value: "DELIVERED" },
    { label: "Cancelled", value: "CANCELLED" },
  ];

  // Filter orders based on search query and status filter
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        searchQuery === "" ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${order.firstName} ${order.lastName}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        order.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === null || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    if (!orders || orders.length === 0) {
      fetchOrders()
        .then(() => {
          console.log("[FETCHED_ORDERS]", useStore.getState().orders);
          setLoading(false);
        })
        .catch((error) => {
          console.error("[FETCH_ORDERS_ERROR]", error);
          toast({
            title: "Error",
            description: "Failed to fetch orders.",
            variant: "destructive",
          });
          setLoading(false);
        });
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

  // Handle view order
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setViewOrderOpen(true);
  };

  // Handle edit order
  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order);
    setEditOrderOpen(true);
  };

  // Handle update order status
  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    const orderToUpdate = orders.find((o) => o.id === orderId);
    if (!orderToUpdate) return;

    try {
      // Validate inventory for SHIPPED/DELIVERED statuses
      if (newStatus === "SHIPPED" || newStatus === "DELIVERED") {
        const products = useStore.getState().products;
        for (const item of orderToUpdate.items) {
          const product = products.find((p) => p.id === item.productId);
          if (!product) throw new Error(`Product ${item.productId} not found`);

          const availableInventory = item.variantId
            ? product.variants?.find((v) => v.id === item.variantId)?.inventory ?? 0
            : product.inventory ?? 0;

          if (availableInventory < item.quantity) {
            // Improved error message that shows variant name if applicable
            const itemName = item.variantId && item.variant
              ? `${product.title} (${item.variant.name})`
              : product.title;
            throw new Error(
              `${itemName} is out of stock. Available: ${availableInventory}, Required: ${item.quantity}`
            );
          }
        }
      }

      // Recalculate subtotal and total
      const products = useStore.getState().products;
      const itemsWithSubtotal = orderToUpdate.items.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (!product) throw new Error(`Product ${item.productId} not found`);
        const variant = item.variantId
          ? product.variants?.find((v) => v.id === item.variantId) || null
          : null;
        const price = variant?.price ?? product.price ?? 0;
        return {
          ...item,
          subtotal: price * item.quantity,
          product,
          variant,
        };
      });

      const subtotal = itemsWithSubtotal.reduce((sum, item) => sum + item.subtotal, 0);
      let total = subtotal + (orderToUpdate.shippingCost ?? 0);
      let shippingCost = orderToUpdate.shippingCost ?? 0;
      const discount = orderToUpdate.discountId
        ? useStore.getState().discounts.find((d) => d.id === orderToUpdate.discountId) ?? null
        : null;

      if (discount) {
        if (
          !discount.isActive ||
          (discount.usageLimit && discount.usageCount >= discount.usageLimit) ||
          (discount.startsAt && new Date() < new Date(discount.startsAt)) ||
          (discount.endsAt && new Date() > new Date(discount.endsAt)) ||
          (discount.minSubtotal && subtotal < discount.minSubtotal) ||
          (discount.products?.length && !itemsWithSubtotal.some((item) =>
            discount.products?.some((p) => p.id === item.productId)
          )) ||
          (discount.variants?.length && !itemsWithSubtotal.some((item) =>
            discount.variants?.some((v) => v.id === item.variantId)
          ))
        ) {
          throw new Error("Discount is not applicable");
        }

        if (discount.type === "percentage") {
          total = subtotal * (1 - discount.value / 100) + shippingCost;
        } else if (discount.type === "fixed_amount") {
          total = Math.max(0, subtotal - discount.value) + shippingCost;
        } else if (discount.type === "free_shipping") {
          total = subtotal;
          shippingCost = 0;
        }
      }

      await updateOrder(orderId, {
        status: newStatus as Order["status"],
        firstName: orderToUpdate.firstName,
        lastName: orderToUpdate.lastName,
        email: orderToUpdate.email,
        phone: orderToUpdate.phone,
        address: orderToUpdate.address,
        city: orderToUpdate.city,
        state: orderToUpdate.state,
        postalCode: orderToUpdate.postalCode,
        country: orderToUpdate.country,
        subtotal,
        total,
        shippingCost,
        discountId: orderToUpdate.discountId ?? null,
        items: itemsWithSubtotal,
        shippingOptionId: orderToUpdate.shippingOptionId,
        paymentReference: orderToUpdate.paymentReference ?? null,
      });

      // Send email notification
      try {
        const emailRes = await fetch("/api/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: orderToUpdate.email,
            firstName: orderToUpdate.firstName,
            lastName: orderToUpdate.lastName,
            orderId,
            status: newStatus,
            orderDetails: {
              items: itemsWithSubtotal.map((item) => ({
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity,
                subtotal: item.subtotal,
                product: {
                  title: item.product.title,
                  price: item.variant?.price ?? item.product.price ?? 0,
                  imageUrl: item.product.imageUrl,
                },
                variant: item.variant ? { name: item.variant.name } : null,
              })),
              discount,
              address: orderToUpdate.address,
              city: orderToUpdate.city,
              state: orderToUpdate.state,
              postalCode: orderToUpdate.postalCode,
              country: orderToUpdate.country,
              shippingCost,
              subtotal,
            },
          }),
        });
        if (!emailRes.ok) {
          const errorData = await emailRes.json().catch(() => ({}));
          console.error("Failed to send email:", errorData);
          toast({
            variant: "destructive",
            title: "Email Error",
            description: `Failed to send email notification: ${errorData.error || 'Unknown error'}`,
          });
        } else {
          console.log("Email sent successfully for order:", orderId);
        }
      } catch (emailError) {
        console.error("Email sending error:", emailError);
        toast({
          variant: "destructive",
          title: "Email Error",
          description: "Failed to send email notification.",
        });
      }

      toast({
        title: "Order Status Updated",
        description: `Order #${orderId} status updated to ${newStatus}`,
      });
    } catch (err) {
      console.error("[UPDATE_ORDER]", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update order status.",
      });
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-500";
      case "PROCESSING":
        return "bg-blue-500";
      case "SHIPPED":
        return "bg-purple-500";
      case "DELIVERED":
        return "bg-green-500";
      case "CANCELLED":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="flex flex-col gap-8 md:p-8 p-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            Manage and track customer orders
          </p>

        </div>

      </div>

      <div className="md:flex grid grid-cols-1 items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Customer name or order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-3xl bg-gray-100 border-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </div>

        <div className="flex w-full items-center gap-3 md:w-auto md:justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 bg-transparent rounded-lg">
                <Filter className="h-4 w-4" />
                {statusFilter ? `Status: ${statusFilter}` : "Filter by Status"}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="min-w-[180px]">
              {statuses.map((status) => {
                const isActive = statusFilter === status.value;
                return (
                  <DropdownMenuItem
                    key={status.value ?? "all"}
                    onClick={() => setStatusFilter(status.value)}
                    className={`flex items-center justify-between ${isActive ? "bg-orange-100 text-primary" : ""
                      }`}
                  >
                    <span>{status.label}</span>
                    {isActive && <Check className="h-4 w-4" />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={() => setCreateOrderOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create Order
          </Button>
        </div>
      </div>

      <div className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 w-[100px] text-left text-sm font-medium text-muted-foreground rounded-l-xl">
                  Order ID
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Date
                </th>

                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Total
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground w-[80px] rounded-r-xl">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <p className="text-muted-foreground text-lg mb-2">No orders found</p>
                      <p className="text-muted-foreground text-sm">
                        {searchQuery || statusFilter
                          ? "Try adjusting your filters or search terms"
                          : "Create some and they'll appear here"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => (
                  <tr key={order.id} className="border-b last:border-0">
                    <td className="px-4 py-4 text-sm font-medium">
                      {order.id}
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">
                      {`${order.firstName} ${order.lastName}`}
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">
                      {format(new Date(order.createdAt), "MMM d, yyyy")}
                    </td>

                    <td className="px-4 py-4 text-sm">
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">
                      <div>
                        <div>₦{(order.total).toFixed(2)}</div>
                        {order.discount && (
                          <span className="text-xs text-muted-foreground italic">
                            Discount Applied ({order.discount.code})
                          </span>
                        )}
                        {order.items.some((item) => item.variantId) && (
                          <span className="text-xs text-muted-foreground block">
                            Includes variants
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleViewOrder(order)}
                          >
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEditOrder(order)}
                            disabled={order.status === "DELIVERED"}
                          >
                            Edit Order
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
            const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
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
          onClick={() => setCurrentPage(Math.min(Math.ceil(filteredOrders.length / itemsPerPage), currentPage + 1))}
          disabled={currentPage === Math.ceil(filteredOrders.length / itemsPerPage)}
        >
          Next <RiArrowRightSLine />
        </Button>
      </div>

      {/* Create Order Modal */}
      <CreateOrderModal
        open={createOrderOpen}
        onOpenChange={setCreateOrderOpen}
        onAddOrder={addOrder}
      />

      {/* Edit Order Modal */}
      {selectedOrder && (
        <EditOrderModal
          open={editOrderOpen}
          onOpenChange={setEditOrderOpen}
          order={selectedOrder}
          onUpdateOrder={updateOrder}
        />
      )}

      {/* View Order Modal */}
      {selectedOrder && (
        <ViewOrderModal
          open={viewOrderOpen}
          onOpenChange={setViewOrderOpen}
          order={selectedOrder}
          onUpdateStatus={(orderId, status) =>
            handleUpdateStatus(orderId, status)
          }
        />
      )}
    </div>
  );
}
