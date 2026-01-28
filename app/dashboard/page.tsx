"use client";

import { useAuthStore } from "@/store/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({ children: children }: { children: React.ReactNode }) {
    const { isLoading } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;

        // Always redirect to main from dashboard ("/dashboard")
        router.replace("/dashboard/main");
    }, [isLoading, router]);

    // Show loading state while redirecting
    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-prima border-t-transparent"></div>
            </div>
        );
    }

    return <>{children}</>;
}
