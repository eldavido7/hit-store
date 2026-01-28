"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Book,
  BookCopy,
  Calendar,
  Gift,
  Home,
  Package,
  Settings,
  ShoppingCart,
  Tag,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuthStore } from "@/store/store";
import Image from "next/image";

const routes = [
  {
    label: "Dashboard",
    icon: Home,
    href: "/dashboard/main",
  },
  {
    label: "Products",
    icon: Package,
    href: "/dashboard/products",
  },
  {
    label: "Orders",
    icon: ShoppingCart,
    href: "/dashboard/orders",
  },
  {
    label: "Blogs",
    icon: Book,
    href: "/dashboard/blogs",
  },
  {
    label: "Stories",
    icon: BookCopy,
    href: "/dashboard/stories",
  },
  {
    label: "Events",
    icon: Calendar,
    href: "/dashboard/events",
  },
  {
    label: "Discounts",
    icon: Gift,
    href: "/dashboard/discounts",
  },
  {
    label: "Inventory",
    icon: Tag,
    href: "/dashboard/inventory",
  },
  {
    label: "Analytics",
    icon: BarChart3,
    href: "/dashboard/analytics",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Sidebar({ isOpen, onClose, open, onOpenChange }: SidebarProps) {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const { user } = useAuthStore();

  // Handle initial mounting to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !user) {
    return null;
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 pt-6 text-white z-50 flex w-[300px] flex-col border-r bg-app-primary transition-transform duration-300 md:static md:z-0",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex h-16 items-center px-4">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <Image
              src="/logo2.svg"
              alt="HER IMMIGRANT TALES Logo"
              width={200}
              height={50}
              priority
            />
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="ml-auto md:hidden"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        </div>

        <ScrollArea className="flex-1 px-2 py-4">
          <nav className="flex flex-col gap-5">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                onClick={() => {
                  if (window.innerWidth < 768) {
                    onClose();
                  }
                }}
                className={cn(
                  "flex items-center gap-4 rounded-md px-9 py-2 text-sm font-medium transition-colors",
                  pathname === route.href ||
                    pathname.startsWith(`${route.href}/`)
                    ? "bg-accent text-app-primary"
                    : "text-white hover:bg-accent hover:text-app-primary"
                )}
              >
                <route.icon className="h-5 w-5" />
                {route.label}
              </Link>
            ))}
          </nav>
        </ScrollArea>

        {/* <div className="flex-shrink-0 border-t p-4">
          <div className="flex items-center">
            <div>
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </div> */}
      </div>
    </>
  );
}
