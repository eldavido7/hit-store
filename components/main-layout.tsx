"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/store";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, isLoading } = useAuthStore();
  const router = useRouter();

  // Admin area lives under /dashboard
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isLoginPage = pathname === "/dashboard/login";

  // Redirect unauthenticated users away from protected admin pages
  useEffect(() => {
    if (isLoading) return; // Wait until hydration is complete

    if (isDashboardRoute && !isLoginPage && !user) {
      router.push("/dashboard/login");
    }
  }, [user, isLoading, isDashboardRoute, isLoginPage, router]);

  // If it's /dashboard/login → don't wrap
  if (isDashboardRoute && isLoginPage) {
    return <>{children}</>;
  }

  // Loading spinner while checking auth (for dashboard routes only)
  if (isDashboardRoute && isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Authenticated dashboard routes → full layout
  if (isDashboardRoute && user) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto">
            <div className="p-4 md:p-6">{children}</div>
          </main>
        </div>
      </div>
    );
  }

  // Public routes (root) → no layout
  return <>{children}</>;
}