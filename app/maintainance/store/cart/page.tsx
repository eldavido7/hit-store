"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, Loader2 } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { StoreHeader } from "../components/store-header";
import { useToast } from "@/components/ui/use-toast";
import { useStore, useSettingsStore } from "@/store/store";
import { Discount, ShippingOption, Product } from "@/types";
import Header from "@/components/headeruser";
import Footer from "@/components/footer";

declare global {
  interface Window {
    PaystackPop: any;
  }
}

export default function CartPage() {
  const router = useRouter();
  const { items, total, removeItem, updateQuantity, clearCart } = useCart();
  const { toast } = useToast();
  const { addOrder, discounts, fetchDiscounts } = useStore();
  const { shippingOptions, fetchSettings } = useSettingsStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(null);
  const [discountsLoading, setDiscountsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [selectedShippingOptionId, setSelectedShippingOptionId] = useState<string | null>(null);

  const [customerInfo, setCustomerInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const [shippingAddress, setShippingAddress] = useState({
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Nigeria",
  });

  useEffect(() => {
    const discounts = useStore.getState().discounts;
    if (!discounts || discounts.length === 0) {
      useStore
        .getState()
        .fetchDiscounts()
        .then(() => {
          setDiscountsLoading(false);
        })
        .catch((error) => {
          console.error("Fetch discounts error:", error);
          setDiscountsLoading(false);
          toast({
            title: "Error",
            description: "Failed to fetch discounts. Please try again.",
            variant: "destructive",
          });
        });
    } else {
      setDiscountsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (shippingOptions.length === 0) {
      fetchSettings()
        .then(() => {
          setLoading(false);
        })
        .catch((error) => {
          console.error("Fetch settings error:", error);
          setLoading(false);
          toast({
            title: "Error",
            description: "Failed to fetch settings. Please try again.",
            variant: "destructive",
          });
        });
    } else {
      setLoading(false);
    }
  }, [fetchSettings, toast]);

  // Calculate totals (in kobo)
  const subtotal = total;
  const shippingCost = selectedShippingOptionId
    ? shippingOptions
      .filter((s) => s.status === "ACTIVE")
      .find((s) => s.id === selectedShippingOptionId)?.price || 0
    : 0;
  const discountAmount = appliedDiscount
    ? (() => {
      const applicableItems = items.filter(
        (item) =>
          (!appliedDiscount.products?.length &&
            !appliedDiscount.variants?.length) ||
          appliedDiscount.products?.some((p) => p.id === item.product.id) ||
          appliedDiscount.variants?.some((v) => v.id === item.variantId)
      );
      const applicableSubtotal = applicableItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      if (appliedDiscount.type === "percentage") {
        return Math.round((applicableSubtotal * appliedDiscount.value) / 100);
      } else if (appliedDiscount.type === "fixed_amount") {
        return Math.min(appliedDiscount.value, applicableSubtotal);
      } else if (appliedDiscount.type === "free_shipping") {
        return applicableItems.length > 0 ? shippingCost : 0;
      }
      return 0;
    })()
    : 0;
  const finalTotal = Math.max(0, subtotal + shippingCost - discountAmount);

  // Convert to Naira for display
  const subtotalNaira = subtotal;
  const shippingCostNaira = shippingCost;
  const discountAmountNaira = discountAmount;
  const finalTotalNaira = finalTotal;

  const applyDiscount = () => {
    if (!discountCode.trim()) {
      toast({
        title: "Missing discount code",
        description: "Please enter a valid discount code.",
        variant: "destructive",
      });
      return;
    }

    const discount = discounts.find((d) => {
      if (d.code.toLowerCase() !== discountCode.toLowerCase()) return false;
      if (!d.isActive) {
        toast({
          title: "Invalid discount",
          description: `Discount ${d.code} is not active.`,
          variant: "destructive",
        });
        return false;
      }
      if (d.startsAt && new Date() < new Date(d.startsAt)) {
        toast({
          title: "Invalid discount",
          description: `Discount ${d.code} is not yet valid.`,
          variant: "destructive",
        });
        return false;
      }
      if (d.endsAt && new Date() > new Date(d.endsAt)) {
        toast({
          title: "Invalid discount",
          description: `Discount ${d.code} has expired.`,
          variant: "destructive",
        });
        return false;
      }
      if (d.usageLimit && d.usageCount >= d.usageLimit) {
        toast({
          title: "Invalid discount",
          description: `Discount ${d.code} has reached its usage limit.`,
          variant: "destructive",
        });
        return false;
      }
      if (d.minSubtotal && subtotal < d.minSubtotal) {
        toast({
          title: "Invalid discount",
          description: `Subtotal (₦${(subtotal / 100).toFixed(2)}) is below the minimum required (₦${(d.minSubtotal / 100).toFixed(2)}) for discount ${d.code}.`,
          variant: "destructive",
        });
        return false;
      }
      if (d.products?.length || d.variants?.length) {
        const matches = items.some(
          (item) =>
            (d.products?.some((p) => p.id === item.product.id) ||
              d.variants?.some((v) => v.id === item.variantId)) &&
            item.quantity > 0
        );
        if (!matches) {
          toast({
            title: "Invalid discount",
            description: `Selected items do not qualify for discount ${d.code}.`,
            variant: "destructive",
          });
          return false;
        }
      }
      return true;
    });

    if (discount) {
      setAppliedDiscount(discount);
      toast({
        title: "Discount applied!",
        description: `${discount.code} has been applied to your order.`,
      });
    } else {
      toast({
        title: "Invalid discount code",
        description: "The discount code you entered does not exist.",
        variant: "destructive",
      });
    }
  };

  const handleQuantityChange = (productId: string, variantId: string | undefined, newQuantity: number) => {
    if (newQuantity > 0) {
      updateQuantity(productId, variantId, newQuantity);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    formType: "customer" | "shipping"
  ) => {
    const { name, value } = e.target;
    if (formType === "customer") {
      setCustomerInfo((prev) => ({ ...prev, [name]: value }));
    } else {
      setShippingAddress((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = async () => {
    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checking out.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const productsRes = await fetch("/api/products");
      if (!productsRes.ok) throw new Error("Failed to fetch products");
      const products: Product[] = await productsRes.json();
      for (const item of items) {
        const product = products.find((p) => p.id === item.product.id);
        if (!product) {
          toast({
            title: "Invalid product",
            description: `${item.product.title} is no longer available.`,
            variant: "destructive",
          });
          return false;
        }
        if (item.variantId) {
          const variant = product.variants?.find((v) => v.id === item.variantId);
          if (!variant || (variant.inventory ?? 0) < item.quantity) {
            toast({
              title: "Out of stock",
              description: `${item.product.title} (${item.variantName}) does not have enough stock.`,
              variant: "destructive",
            });
            return false;
          }
        } else if ((product.inventory ?? 0) < item.quantity) {
          toast({
            title: "Out of stock",
            description: `${item.product.title} does not have enough stock.`,
            variant: "destructive",
          });
          return false;
        }
      }
    } catch (error) {
      console.error("Inventory validation error:", error);
      toast({
        title: "Error",
        description: "Failed to validate inventory. Please try again.",
        variant: "destructive",
      });
      return false;
    }

    const requiredCustomerFields = ["firstName", "lastName", "email", "phone"];
    for (const field of requiredCustomerFields) {
      if (!customerInfo[field as keyof typeof customerInfo]) {
        toast({
          title: "Missing information",
          description: `Please fill in your ${field.replace(/([A-Z])/g, " $1").toLowerCase()}.`,
          variant: "destructive",
        });
        return false;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerInfo.email)) {
      toast({
        title: "Invalid email address",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return false;
    }

    const requiredShippingFields = ["address", "city", "state", "postalCode", "country"];
    for (const field of requiredShippingFields) {
      if (!shippingAddress[field as keyof typeof shippingAddress]) {
        toast({
          title: "Missing information",
          description: `Please fill in your ${field.replace(/([A-Z])/g, " $1").toLowerCase()}.`,
          variant: "destructive",
        });
        return false;
      }
    }

    if (!/^\d+$/.test(shippingAddress.postalCode)) {
      toast({
        title: "Invalid postal code",
        description: "Postal code must contain numbers only.",
        variant: "destructive",
      });
      return false;
    }

    if (!selectedShippingOptionId) {
      toast({
        title: "Missing shipping option",
        description: "Please select a shipping method.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleCheckout = async () => {
    if (!await validateForm()) return;

    setIsSubmitting(true);

    try {
      const paystackMetadata = {
        customer: {
          firstName: customerInfo.firstName,
          lastName: customerInfo.lastName,
          email: customerInfo.email,
          phone: customerInfo.phone,
          address: shippingAddress.address,
          city: shippingAddress.city,
          state: shippingAddress.state,
          postalCode: shippingAddress.postalCode,
          country: shippingAddress.country,
        },
        items: items.map((item) => ({
          productId: item.product.id,
          variantId: item.variantId,  // Keep as is (null or string)
          quantity: item.quantity,
          price: item.price,
        })),
        shippingOptionId: selectedShippingOptionId || "",
        shippingCost: shippingCost,
        discountId: appliedDiscount?.id || null,
        discountAmount: discountAmount,
        subtotal: subtotal,
        total: finalTotal,
      };

      const handler = window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_default_key",
        amount: finalTotal * 100,
        currency: "NGN",
        email: customerInfo.email,
        metadata: paystackMetadata,
        callback: (response: { reference: string }) => {
          (async () => {
            try {
              const verifyRes = await fetch("/api/paystack/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reference: response.reference }),
              });

              const verifyData = await verifyRes.json();
              if (!verifyRes.ok || !verifyData.status) {
                throw new Error(`Payment verification failed: ${verifyData.message || "Unknown error"}`);
              }

              // Payment verified, now create the order
              const orderData = {
                firstName: customerInfo.firstName,
                lastName: customerInfo.lastName,
                email: customerInfo.email,
                phone: customerInfo.phone,
                address: shippingAddress.address,
                city: shippingAddress.city,
                state: shippingAddress.state,
                postalCode: shippingAddress.postalCode,
                country: shippingAddress.country,
                items: items.map((item) => ({
                  productId: item.product.id,
                  variantId: item.variantId,  // Send null or string directly
                  quantity: item.quantity,
                })),
                discountId: appliedDiscount?.id || null,
                shippingOptionId: selectedShippingOptionId || null,
                shippingCost: shippingCost,
                paymentReference: response.reference,
                subtotal: subtotal,
                total: finalTotal,
              };

              console.log("[ORDER_DATA_BEING_SENT]", orderData); // Add debug log

              const orderRes = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderData),
              });

              if (!orderRes.ok) {
                const errorData = await orderRes.json();
                throw new Error(`Failed to create order: ${errorData.error || "Unknown error"}`);
              }

              const order = await orderRes.json();
              console.log("[CREATED_ORDER]", order); // Add debug log

              toast({
                title: "Payment successful",
                description: "Your order has been created successfully! We will contact you about it shortly. Thank you for shopping with us!",
              });

              clearCart();
              setTimeout(() => {
                router.push("/store");
              }, 2000);
            } catch (error) {
              console.error("Payment/Order creation failed:", error);
              toast({
                title: "Payment error",
                description: error instanceof Error ? error.message : "There was an issue processing your order. Please contact support.",
                variant: "destructive",
              });
            } finally {
              setIsSubmitting(false);
            }
          })();
        },
        onClose: () => {
          toast({
            title: "Payment cancelled",
            description: "You cancelled the payment. Your order has not been placed.",
            variant: "destructive",
          });
          setIsSubmitting(false);
        },
      });

      handler.openIframe();
    } catch (error) {
      console.error("Error initiating payment:", error);
      toast({
        title: "Error",
        description: "There was a problem initiating your payment. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
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

      <main className="px-4 py-8 md:px-36">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push("/store")}
            className="mb-4 border-0 bg-transparent hover:bg-transparent text-md"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Button>
          <h1 className="text-3xl font-bold">Your Cart</h1>
        </div>

        {items.length === 0 ? (
          <Card className="py-12 text-center">
            <CardContent>
              <div className="flex flex-col items-center">
                <ShoppingBag className="mb-4 h-16 w-16 text-gray-400" />
                <h2 className="mb-2 text-2xl font-semibold">
                  Your cart is empty
                </h2>
                <p className="mb-6 text-gray-500">
                  Looks like you haven't added any products to your cart yet.
                </p>
                <Button onClick={() => router.push("/store")}>
                  Browse Products
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card className="rounded-[30px]">
                <CardHeader>
                  <CardTitle className="font-cormorant text-3xl">Cart Items ({items.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {items.map((item) => (
                    <div
                      key={`${item.product.id}-${item.variantId || 'no-variant'}`}
                      className="flex items-center border-b py-4 last:border-0"
                    >
                      <div className="relative mr-4 h-32 w-32 overflow-hidden rounded-[30px] bg-gray-100">
                        <Image
                          src={item.product.imageUrl || "/placeholder.svg?height=80&width=80"}
                          alt={item.product.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-2xl text-gray-500">
                          {item.product.title}{item.variantName ? ` (${item.variantName})` : ''}
                        </h3>
                        <p className="font-cormorant font-bold text-4xl text-black">
                          ₦{item.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-12 w-12 rounded-xl"
                          onClick={() => handleQuantityChange(item.product.id, item.variantId ?? undefined, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-xl font-bold text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-12 w-12 rounded-xl"
                          onClick={() => handleQuantityChange(item.product.id, item.variantId ?? undefined, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="ml-6 text-right  font-cormorant font-bold text-4xl">
                        ₦{(item.price * item.quantity).toFixed(2)}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-2 bg-red-50 rounded-xl"
                        onClick={() => removeItem(item.product.id, item.variantId ?? undefined)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={clearCart} className="border-0 bg-gray-100 rounded-[30px] hover:bg-gray-200">
                    Clear Cart
                  </Button>
                </CardFooter>
              </Card>

              <Card className="mt-6 rounded-[30px]">
                <CardHeader>
                  <CardTitle>Customer Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        className="rounded-xl py-6"
                        value={customerInfo.firstName}
                        onChange={(e) => handleInputChange(e, "customer")}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        className="rounded-xl py-6"
                        value={customerInfo.lastName}
                        onChange={(e) => handleInputChange(e, "customer")}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        className="rounded-xl py-6"
                        value={customerInfo.email}
                        onChange={(e) => handleInputChange(e, "customer")}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        className="rounded-xl py-6"
                        value={customerInfo.phone}
                        onChange={(e) => handleInputChange(e, "customer")}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6 rounded-[30px]">
                <CardHeader>
                  <CardTitle>Shipping Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        name="address"
                        className="rounded-xl py-6"
                        value={shippingAddress.address}
                        onChange={(e) => handleInputChange(e, "shipping")}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          name="city"
                          className="rounded-xl py-6"
                          value={shippingAddress.city}
                          onChange={(e) => handleInputChange(e, "shipping")}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          name="state"
                          className="rounded-xl py-6"
                          value={shippingAddress.state}
                          onChange={(e) => handleInputChange(e, "shipping")}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="postalCode">Postal Code</Label>
                        <Input
                          id="postalCode"
                          name="postalCode"
                          className="rounded-xl py-6"
                          value={shippingAddress.postalCode}
                          onChange={(e) => handleInputChange(e, "shipping")}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          name="country"
                          className="rounded-xl py-6"
                          value={shippingAddress.country}
                          onChange={(e) => handleInputChange(e, "shipping")}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="sticky top-24 rounded-[30px]">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading || discountsLoading ? (
                    <div className="flex justify-center">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : shippingOptions.length === 0 ? (
                    <div className="text-center text-gray-500">
                      No shipping options available. Please contact support.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="shippingOption" className="text-md">Shipping Option</Label>
                        <Select
                          value={selectedShippingOptionId || ""}
                          onValueChange={(value) => setSelectedShippingOptionId(value)}
                          required
                        >
                          <SelectTrigger id="shippingOption">
                            <SelectValue placeholder="Select shipping option" />
                          </SelectTrigger>
                          <SelectContent>
                            {shippingOptions
                              .filter((option) => option.status === "ACTIVE")
                              .map((option) => (
                                <SelectItem key={option.id} value={option.id}>
                                  {option.name} (₦{(option.price).toFixed(2)} – {option.deliveryTime})
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="discountCode" className="text-md">Discount Code</Label>
                        <div className="mt-1 flex">
                          <Input
                            id="discountCode"
                            value={discountCode}
                            onChange={(e) => setDiscountCode(e.target.value)}
                            className="rounded-r-none rounded-l-xl py-6"
                            placeholder="Enter code"
                            disabled={!!appliedDiscount}
                          />
                          <Button
                            onClick={applyDiscount}
                            className="rounded-l-none rounded-r-xl py-6 bg-[#bf5925] hover:bg-[#bf5925]/90"
                            disabled={!!appliedDiscount}
                          >
                            Apply
                          </Button>
                        </div>
                        {appliedDiscount && (
                          <p className="mt-1 text-sm text-[#bf5925]">
                            {appliedDiscount.code} applied!
                          </p>
                        )}
                      </div>

                      {/* <Separator /> */}

                      <div className="space-y-2">
                        <div className="flex-1 space-y-2 bg-gray-50 p-4 rounded-xl mb-12">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Subtotal</span>
                            <span className="font-semibold">₦{subtotalNaira.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Shipping</span>
                            <span className="font-semibold">₦{shippingCostNaira.toFixed(2)}</span>
                          </div>
                        </div>
                        {appliedDiscount && (
                          <div className="flex justify-between text-green-600">
                            <span>Discount</span>
                            <span className="font-semibold">-₦{discountAmountNaira.toFixed(2)}</span>
                          </div>
                        )}

                        {/* <Separator /> */}
                        <div className="flex font-cormorant text-3xl justify-between font-bold">
                          <span>Total</span>
                          <span>₦{finalTotalNaira.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-[#bf5925] hover:bg-[#bf5925]/90 rounded-xl"
                    onClick={handleCheckout}
                    disabled={isSubmitting || items.length === 0 || loading || discountsLoading || shippingOptions.length === 0}
                  >
                    {isSubmitting ? "Processing..." : "Checkout with Paystack"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}