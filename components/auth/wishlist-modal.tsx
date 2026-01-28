import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogOverlay,
    DialogTitle,
} from "@/components/ui/dialog";
import { useCustomerAuthStore } from "@/store/store";
import { useCart } from "@/contexts/cart-context";
import { X, Heart, ShoppingCart, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

interface WishlistModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function WishlistModal({ open, onOpenChange }: WishlistModalProps) {
    const {
        wishlistItems,
        removeFromWishlist,
        fetchWishlist,
        customer
    } = useCustomerAuthStore();
    const { addItem } = useCart();
    const { toast } = useToast();

    // useEffect(() => {
    //     if (open && customer) {
    //         fetchWishlist();
    //     }
    // }, [open, customer, fetchWishlist]);

    const handleClose = () => {
        onOpenChange(false);
    };

    const handleRemoveFromWishlist = async (productId: string, variantId?: string) => {
        const result = await removeFromWishlist(productId, variantId);
        if (result.success) {
            toast({
                title: "Removed from wishlist",
                description: "Item has been removed from your wishlist.",
            });
        } else {
            toast({
                title: "Error",
                description: result.message || "Failed to remove from wishlist.",
                variant: "destructive",
            });
        }
    };

    const handleAddToCart = (wishlistItem: any) => {
        const { product, variant } = wishlistItem;

        // Check inventory
        const availableInventory = variant
            ? variant.inventory
            : product.variants?.length
                ? product.variants.reduce((sum: number, v: any) => sum + (v.inventory ?? 0), 0)
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

    if (!customer) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogOverlay className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
                {/* Make the default DialogContent an invisible container */}
                <DialogContent className="max-w-md bg-transparent p-0 shadow-none border-0">
                    {/* Create a new relative container for positioning */}
                    <div className="relative">
                        {/* The close button is now positioned relative to this new container */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute -right-20 top-0 z-50 h-8 w-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                            onClick={handleClose}
                        >
                            <X className="h-4 w-4" />
                        </Button>

                        {/* This is now your VISIBLE modal content */}
                        <div className="bg-white rounded-[30px] overflow-hidden">

                            <DialogHeader className="px-6 pt-6">
                                <DialogTitle className="text-2xl font-cormorant text-center">
                                    Sign in required
                                </DialogTitle>
                            </DialogHeader>

                            <div className="px-6 pb-6 text-center">
                                <p className="text-gray-600 mb-6">
                                    Please sign in to view your wishlist
                                </p>
                                <Button
                                    onClick={() => onOpenChange(false)}
                                    className="bg-[#bf5925] hover:bg-[#bf5925]/90 text-white rounded-xl"
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogOverlay className="fixed inset-0 bg-black/0 backdrop-blur-sm" />
            {/* Make the default DialogContent an invisible container */}
            <DialogContent className="max-w-md bg-transparent p-0 shadow-none border-0">
                {/* Create a new relative container for positioning */}
                <div className="relative">
                    {/* The close button is now positioned relative to this new container */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -right-20 top-0 z-50 h-8 w-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                        onClick={handleClose}
                    >
                        <X className="h-4 w-4" />
                    </Button>

                    {/* This is now your VISIBLE modal content */}
                    <div className="bg-white rounded-[30px] overflow-hidden">

                        <DialogHeader className="px-6 pt-6">
                            <DialogTitle className="text-2xl font-cormorant text-center flex items-center justify-center gap-2">
                                <Heart className="w-6 h-6 text-[#bf5925]" />
                                My Wishlist
                            </DialogTitle>
                            <p className="text-gray-600 text-center text-sm">
                                {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
                            </p>
                        </DialogHeader>

                        <div className="px-6 pb-6">
                            {wishlistItems.length === 0 ? (
                                <div className="text-center py-12">
                                    <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        Your wishlist is empty
                                    </h3>
                                    <p className="text-gray-600 mb-6">
                                        Save items you love to your wishlist
                                    </p>
                                    <Button
                                        onClick={() => onOpenChange(false)}
                                        className="bg-[#bf5925] hover:bg-[#bf5925]/90 text-white rounded-xl"
                                    >
                                        Continue Shopping
                                    </Button>
                                </div>
                            ) : (
                                <div className="max-h-96 overflow-y-auto space-y-4">
                                    {wishlistItems.map((item) => (
                                        <Card key={`${item.productId}-${item.variantId || 'default'}`} className="overflow-hidden">
                                            <CardContent className="p-4">
                                                <div className="flex gap-4">
                                                    <div className="relative w-20 h-20 flex-shrink-0">
                                                        <Image
                                                            src={item.product.imageUrl || "/placeholder.svg"}
                                                            alt={item.product.title}
                                                            fill
                                                            className="object-cover rounded-lg"
                                                        />
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-medium text-sm line-clamp-2">
                                                            {item.product.title}
                                                        </h4>

                                                        {item.variant && (
                                                            <Badge variant="outline" className="text-xs mt-1">
                                                                {item.variant.name}
                                                            </Badge>
                                                        )}

                                                        <div className="flex items-center justify-between mt-2">
                                                            <span className="font-semibold text-[#bf5925]">
                                                                ₦{(item.variant?.price ?? item.product.price ?? 0).toLocaleString()}
                                                            </span>

                                                            <Badge
                                                                variant={
                                                                    (item.variant?.inventory ?? item.product.inventory ?? 0) > 0
                                                                        ? "default"
                                                                        : "destructive"
                                                                }
                                                                className="text-xs"
                                                            >
                                                                {(item.variant?.inventory ?? item.product.inventory ?? 0) > 0
                                                                    ? "In Stock"
                                                                    : "Out of Stock"
                                                                }
                                                            </Badge>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-8 w-8 p-0"
                                                            onClick={() => handleAddToCart(item)}
                                                            disabled={(item.variant?.inventory ?? item.product.inventory ?? 0) <= 0}
                                                        >
                                                            <ShoppingCart className="h-3 w-3" />
                                                        </Button>

                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                                                            onClick={() => handleRemoveFromWishlist(item.productId, item.variantId || undefined)}
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}