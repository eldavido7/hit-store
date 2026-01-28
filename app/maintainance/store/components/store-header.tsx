"use client";

import Link from "next/link";
import { ShoppingCart, Menu, X, Sun, Moon, Search, ListFilter, User, Heart, User2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/cart-context";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CustomerAccountDropdown } from "@/components/auth/account";
import { useCustomerAuthStore } from "@/store/store";
import { SignInModal } from "@/components/auth/signin-modal";
import { SignUpModal } from "@/components/auth/signup-modal";
import { ForgotPasswordModal } from "@/components/auth/forgot-password-modal";
import { WishlistModal } from "@/components/auth/wishlist-modal";
import { useToast } from "@/hooks/use-toast";

interface StoreHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  categories: string[];
}

export function StoreHeader({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  categories
}: StoreHeaderProps) {
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { setTheme, theme } = useTheme();
  const [showWishlistModal, setShowWishlistModal] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const { toast } = useToast();

  const {
    customer,
    verifyToken,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    wishlistItems
  } = useCustomerAuthStore();

  useEffect(() => {
    verifyToken();
  }, [verifyToken]);

  // Toggle theme between dark and light
  const toggleTheme = () => {
    console.log("Current theme:", theme);
    const newTheme = theme === "dark" ? "light" : "dark";
    console.log("Setting theme to:", newTheme);
    setTheme(newTheme);
  };

  // Ensure component is mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Add this function inside your component
  const toggleWishlist = async (productId: string, variantId?: string) => {
    if (!customer) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add items to your wishlist",
        variant: "destructive",
      });
      setShowSignInModal(true);
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

  return (
    <header className="sticky top-0 z-40 w-full py-6 bg-white">
      <div className="container flex items-center justify-between h-16 px-4 py-8">
        {/* Search and Filter Controls */}
        <div className="flex-1 mr-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative md:max-w-md w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-6 w-6" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 py-6 rounded-xl"
              />
            </div>
            <div className="w-auto">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
                  <ListFilter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category}
                      value={category}
                      className={category === selectedCategory ? 'bg-orange-50 text-[#bf5925] rounded-3xl' : 'hover:bg-orange-50 hover:text-[#bf5925] rounded-3xl'}
                    >
                      {category === "all" ? "All Categories" : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Desktop Buttons */}
        {/* <div className="hidden md:flex items-center space-x-1"> */}
        {/* {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          )} */}

        <div className="hidden md:flex items-center space-x-4">
          <Button
            variant="ghost"
            className="flex items-center rounded-3xl bg-gray-50 relative"
            onClick={() => setShowWishlistModal(true)}
          >
            <Heart className="w-5 h-5 mr-2" />
            Wishlist
            {wishlistItems.length > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs"
              >
                {wishlistItems.length}
              </Badge>
            )}
          </Button>

          <Link href="/store/cart" className="relative">
            <Button variant="ghost" className="flex items-center rounded-3xl bg-gray-50">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Cart
              {itemCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs"
                >
                  {itemCount}
                </Badge>
              )}
            </Button>
          </Link>

          {customer ? (
            <CustomerAccountDropdown customerName={customer.name} />
          ) : (
            <Button
              variant="outline"
              onClick={() => setShowSignInModal(true)}
              className="bg-white hover:bg-gray-50 text-black border-0 rounded-xl"
            >
              <User2 className="w-4 h-4" />Account
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="px-4 py-3 md:hidden bg-white border-t">
          <nav className="flex flex-col space-y-1">
            <Button
              variant="ghost"
              className="flex items-center justify-start p-2 text-sm font-medium rounded-md hover:bg-gray-100 relative"
              onClick={() => {
                setShowWishlistModal(true);
                setMobileMenuOpen(false);
              }}
            >
              <Heart className="w-5 h-5 mr-3" />
              Wishlist
              {wishlistItems.length > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute top-1 right-2 w-5 h-5 p-0 flex items-center justify-center text-xs"
                >
                  {wishlistItems.length}
                </Badge>
              )}
            </Button>

            <Link
              href="/store/cart"
              className="flex items-center p-2 text-sm font-medium rounded-md hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              <ShoppingCart className="w-5 h-5 mr-3" />
              Cart
              {itemCount > 0 && (
                <Badge variant="destructive" className="ml-auto">
                  {itemCount}
                </Badge>
              )}
            </Link>

            {customer ? (
              <div className="flex items-center p-2 text-sm border-0 font-medium">
                <User className="w-5 h-5" />
                {customer.name}
              </div>
            ) : (
              <Button
                variant="ghost"
                className="flex items-center justify-start p-2 text-sm font-medium rounded-md hover:bg-gray-100"
                onClick={() => {
                  setShowSignInModal(true);
                  setMobileMenuOpen(false);
                }}
              >
                <User className="w-5 h-5" />
                Account
              </Button>
            )}
          </nav>
        </div>
      )}

      {/* Add all modals before closing header */}
      <SignInModal
        open={showSignInModal}
        onOpenChange={setShowSignInModal}
        onSwitchToSignUp={() => {
          setShowSignInModal(false);
          setShowSignUpModal(true);
        }}
        onSwitchToForgotPassword={() => {
          setShowSignInModal(false);
          setShowForgotPasswordModal(true);
        }}
      />

      <SignUpModal
        open={showSignUpModal}
        onOpenChange={setShowSignUpModal}
        onSwitchToSignIn={() => {
          setShowSignUpModal(false);
          setShowSignInModal(true);
        }}
      />

      <ForgotPasswordModal
        open={showForgotPasswordModal}
        onOpenChange={setShowForgotPasswordModal}
        onSwitchToSignIn={() => {
          setShowForgotPasswordModal(false);
          setShowSignInModal(true);
        }}
      />

      <WishlistModal
        open={showWishlistModal}
        onOpenChange={setShowWishlistModal}
      />
    </header>
  );
}