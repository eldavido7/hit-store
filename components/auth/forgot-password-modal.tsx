import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useCustomerAuthStore } from "@/store/store";
import { Loader2, X, Mail, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ForgotPasswordModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSwitchToSignIn: () => void;
}

export function ForgotPasswordModal({
    open,
    onOpenChange,
    onSwitchToSignIn,
}: ForgotPasswordModalProps) {
    const [email, setEmail] = useState("");
    const [emailSent, setEmailSent] = useState(false);
    const { forgotPassword, isLoading } = useCustomerAuthStore();
    const { toast } = useToast();

    const handleSubmit = async () => {
        if (!email) {
            toast({
                title: "Error",
                description: "Please enter your email address",
                variant: "destructive",
            });
            return;
        }

        const result = await forgotPassword(email);

        if (result.success) {
            setEmailSent(true);
            toast({
                title: "Email sent!",
                description: result.message || "Check your email for reset instructions.",
            });
        } else {
            toast({
                title: "Error",
                description: result.message || "Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleReset = () => {
        setEmail("");
        setEmailSent(false);
    };

    const handleClose = () => {
        onOpenChange(false);
        handleReset();
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !emailSent) {
            handleSubmit();
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
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
                                {emailSent ? "Check your email" : "Reset password"}
                            </DialogTitle>
                            <p className="text-gray-600 text-center text-sm">
                                {emailSent
                                    ? `We've sent password reset instructions to ${email}`
                                    : "Enter your email and we'll send you reset instructions"
                                }
                            </p>
                        </DialogHeader>

                        <div className="px-6 pb-6 space-y-4">
                            {emailSent ? (
                                <>
                                    <div className="flex justify-center py-8">
                                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                            <Mail className="w-8 h-8 text-green-600" />
                                        </div>
                                    </div>

                                    <div className="text-center space-y-4">
                                        <p className="text-sm text-gray-600">
                                            If an account with that email exists, you'll receive password reset instructions shortly.
                                        </p>

                                        <Button
                                            onClick={handleClose}
                                            className="w-full bg-[#bf5925] hover:bg-[#bf5925]/90 text-white rounded-xl py-3"
                                        >
                                            Done
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="Enter your email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            onKeyDown={handleKeyPress}
                                            className="rounded-xl"
                                            disabled={isLoading}
                                        />
                                    </div>

                                    <Button
                                        onClick={handleSubmit}
                                        className="w-full bg-[#bf5925] hover:bg-[#bf5925]/90 text-white rounded-xl py-3"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            "Send Reset Instructions"
                                        )}
                                    </Button>
                                </>
                            )}

                            <div className="text-center pt-4">
                                <Button
                                    type="button"
                                    variant="link"
                                    className="p-0 h-auto text-sm text-[#bf5925] hover:text-[#bf5925]/80"
                                    onClick={onSwitchToSignIn}
                                    disabled={isLoading}
                                >
                                    <ArrowLeft className="mr-1 h-3 w-3" />
                                    Back to sign in
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}