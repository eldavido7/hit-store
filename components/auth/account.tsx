import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCustomerAuthStore } from "@/store/store";
import { LogOut, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CustomerAccountDropdownProps {
    customerName: string;
}

export function CustomerAccountDropdown({ customerName }: CustomerAccountDropdownProps) {
    const { signOut } = useCustomerAuthStore();
    const { toast } = useToast();

    const handleSignOut = () => {
        signOut();
        toast({
            title: "Signed out",
            description: "You've been signed out successfully.",
        });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className="bg-white hover:bg-gray-50 text-black border-0 rounded-xl px-4 py-2"
                >
                    <User className="w-4 h-4" />
                    {customerName}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56 rounded-xl">
                <div className="px-3 py-2">
                    <p className="text-sm font-medium">{customerName}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 rounded-lg mx-1"
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}