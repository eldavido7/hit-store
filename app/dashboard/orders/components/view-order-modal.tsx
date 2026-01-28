"use client";

import { useEffect, useState } from "react";
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
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import type { Order } from "@/types";
import { useSettingsStore } from "@/store/store";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ViewOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
  onUpdateStatus: (orderId: string, status: string) => void;
}

export function ViewOrderModal({
  open,
  onOpenChange,
  order,
  onUpdateStatus,
}: ViewOrderModalProps) {
  if (!order) return null;

  const [loading, setLoading] = useState(true);

  const { shippingOptions } = useSettingsStore();

  const selectedShippingOption = shippingOptions.find(
    (option) => option.id === order.shippingOptionId
  );

  useEffect(() => {
    if (!shippingOptions.length && order.shippingOptionId) {
      useSettingsStore
        .getState()
        .fetchSettings()
        .then(() => {
          console.log("[FETCHED_SHIPPING_OPTIONS]", useSettingsStore.getState().shippingOptions);
          setLoading(false);
        })
        .catch((error) => {
          console.error("[FETCH_SETTINGS_ERROR]", error);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [order.shippingOptionId]); // Depend on order.shippingOptionId

  const originalTotal = order.items.reduce(
    (sum, item) => sum + item.subtotal,
    0
  );

  let discountedTotal = originalTotal;

  if (order.discount) {
    if (order.discount.type === "percentage") {
      discountedTotal = originalTotal * (1 - order.discount.value / 100);
    } else if (order.discount.type === "fixed_amount") {
      discountedTotal = Math.max(0, originalTotal - order.discount.value);
    }
  }

  const [selectedStatus, setSelectedStatus] = useState<string>(
    order.status ?? "PENDING"
  );

  // Update local state whenever a new order is loaded
  useEffect(() => {
    setSelectedStatus(order.status ?? "PENDING");
  }, [order]);

  const [statusToUpdate, setStatusToUpdate] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Overlay */}
      <DialogOverlay className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" />

      {/* Keep DialogContent as an invisible centered container so Radix centers correctly */}
      <DialogContent className="max-w-[650px] bg-transparent p-0 shadow-none border-0">
        {order && (
          <div className="relative">
            {/* Close button positioned relative to this wrapper */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute -right-20 top-0 z-50 h-10 w-10 rounded-full bg-white hover:bg-gray-200"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>

            {/* VISIBLE modal box (controls scrolling & max height) */}
            <div className="bg-white rounded-[20px] overflow-y-auto max-h-[85vh] shadow-lg">
              <div className="p-6 space-y-6">
                <DialogHeader className="flex flex-row items-center justify-between p-0">
                  <DialogTitle>Order Details</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Order Information Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Order Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Order ID</span>
                        <span className="text-sm font-medium">#{order.id}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Order Date</span>
                        <span className="text-sm font-medium">
                          {format(new Date(order.createdAt), "MMM dd, yyyy")}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Order Status</span>
                        <span className="text-sm font-medium">
                          <span
                            className={`inline-flex items-center rounded-2xl py-1 px-2 gap-1 ${selectedStatus === "DELIVERED"
                              ? "bg-green-100 text-green-600"
                              : selectedStatus === "SHIPPED"
                                ? "text-purple-600 bg-purple-100"
                                : selectedStatus === "PROCESSING"
                                  ? "text-blue-600 bg-blue-100"
                                  : selectedStatus === "PENDING"
                                    ? "text-yellow-600 bg-yellow-100"
                                    : "text-red-600 bg-red-100"
                              }`}
                          >
                            <span className="w-2 h-2 rounded-full bg-current"></span>
                            {selectedStatus.charAt(0) + selectedStatus.slice(1).toLowerCase()}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Customer Information Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Name</span>
                        <span className="text-sm font-medium">
                          {order.firstName} {order.lastName}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Email</span>
                        <span className="text-sm font-medium">{order.email}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Phone</span>
                        <span className="text-sm font-medium">{order.phone}</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-sm text-gray-600">Shipping Address</span>
                        <span className="text-sm font-medium text-right">
                          {order.address}, {order.city}, {order.state} {order.postalCode}
                          <br />
                          {order.country}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Information Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Payment Method</span>
                        <span className="text-sm font-medium">Paystack</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Transaction ID</span>
                        <span className="text-sm font-medium">
                          {order.paymentReference || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Payment Status</span>
                        <span className="text-sm font-medium">
                          <span className="inline-flex items-center bg-green-100 py-1 px-2 rounded-2xl gap-1 text-green-600">
                            <span className="w-2 h-2 rounded-full bg-current"></span>
                            Confirmed
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Order Items</h3>
                    <div className="border rounded-lg divide-y">
                      {order.items.map((item) => (
                        <div key={item.id} className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{item.product.title}</p>
                              {item.variantId && item.variant && (
                                <p className="text-sm text-gray-500">({item.variant.name})</p>
                              )}
                              <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity}</p>
                            </div>
                            <p className="font-semibold">₦{item.subtotal.toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Summary Section */}
                  <div className="rounded-lg p-4 bg-gray-100 dark:bg-transparent dark:border-white dark:border">
                    <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                    <div className="space-y-2">
                      {/* Only show discount if it exists and has a nonzero value */}
                      {order.discount && order.discount.value > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            Discount ({order.discount.code})
                          </span>
                          <span className="font-medium">
                            {order.discount.type === "percentage"
                              ? `${order.discount.value}%`
                              : `₦${order.discount.value.toFixed(2)}`}
                          </span>
                        </div>
                      )}

                      {/* Only show shipping if it's not null/undefined AND greater than 0 */}
                      {order.shippingCost !== null &&
                        order.shippingCost !== undefined &&
                        order.shippingCost > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Shipping</span>
                            <span className="font-medium">
                              ₦{order.shippingCost.toFixed(2)}
                            </span>
                          </div>
                        )}

                      {/* Always show total */}
                      <div className="flex justify-between pt-2 border-t dark:border-t-white">
                        <span className="font-semibold">Total</span>
                        <span className="font-semibold">
                          {order.discount ? (
                            <>
                              <span className="line-through text-gray-500 mr-2 text-sm">
                                ₦{originalTotal.toFixed(2)}
                              </span>
                              ₦{discountedTotal.toFixed(2)}
                            </>
                          ) : (
                            <>₦{originalTotal.toFixed(2)}</>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Fulfillment Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Fulfillment</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Payment Status</span>
                        <Select
                          value={selectedStatus}
                          onValueChange={(value) => {
                            if (value !== selectedStatus) {
                              setStatusToUpdate(value);
                              setIsConfirmModalOpen(true);
                            }
                          }}
                          disabled={selectedStatus === "DELIVERED"}
                        >
                          <SelectTrigger
                            className="w-[180px]"
                            disabled={selectedStatus === "DELIVERED"}
                          >
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="PROCESSING">Processing</SelectItem>
                            <SelectItem value="SHIPPED">Shipped</SelectItem>
                            <SelectItem value="DELIVERED">Delivered</SelectItem>
                            <SelectItem value="CANCELED">Canceled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {order.shippingOptionId && selectedShippingOption && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Shipping Option</span>
                          <span className="text-sm font-medium text-right">
                            {selectedShippingOption.name} (₦{selectedShippingOption.price.toFixed(2)} - {selectedShippingOption.deliveryTime})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>

      {/* Confirm update nested dialog */}
      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm Status Update</DialogTitle>
            <DialogDescription>
              Are you sure you want to update the status to <strong>{statusToUpdate}</strong>?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsConfirmModalOpen(false);
                setStatusToUpdate(null);
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90 text-white"
              onClick={() => {
                setSelectedStatus(statusToUpdate!);
                onUpdateStatus(order.id, statusToUpdate!);
                setIsConfirmModalOpen(false);
                setStatusToUpdate(null);
              }}
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>

  );
}
