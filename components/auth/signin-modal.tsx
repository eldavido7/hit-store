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
import { Eye, EyeOff, Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SignInModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSwitchToSignUp: () => void;
    onSwitchToForgotPassword: () => void;
}

export function SignInModal({
    open,
    onOpenChange,
    onSwitchToSignUp,
    onSwitchToForgotPassword
}: SignInModalProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const { signIn, isLoading } = useCustomerAuthStore();
    const { toast } = useToast();

    const handleSubmit = async () => {
        if (!email || !password) {
            toast({
                title: "Error",
                description: "Please fill in all fields",
                variant: "destructive",
            });
            return;
        }

        const result = await signIn(email, password);

        if (result.success) {
            toast({
                title: "Welcome back!",
                description: "You've been signed in successfully.",
            });
            onOpenChange(false);
            setEmail("");
            setPassword("");
        } else {
            toast({
                title: "Sign in failed",
                description: result.message || "Please check your credentials and try again.",
                variant: "destructive",
            });
        }
    };

    const handleClose = () => {
        onOpenChange(false);
        setEmail("");
        setPassword("");
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
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
                                Welcome back
                            </DialogTitle>
                            <p className="text-gray-600 text-center text-sm">
                                Sign in and continue shopping
                            </p>
                        </DialogHeader>


                        <div className="px-6 pb-6 space-y-4">
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

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onKeyDown={handleKeyPress}
                                        className="rounded-xl pr-10"
                                        disabled={isLoading}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute inset-y-0 right-0 h-full px-3 text-gray-500 hover:text-gray-700"
                                        onClick={() => setShowPassword(!showPassword)}
                                        disabled={isLoading}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </Button>
                                </div>
                            </div>

                            <Button
                                type="button"
                                variant="link"
                                className="p-0 h-auto text-sm text-[#bf5925] hover:text-[#bf5925]/80"
                                onClick={onSwitchToForgotPassword}
                                disabled={isLoading}
                            >
                                Forgot your password?
                            </Button>

                            <Button
                                onClick={handleSubmit}
                                className="w-full bg-[#bf5925] hover:bg-[#bf5925]/90 text-white rounded-xl py-3"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    "Sign In"
                                )}
                            </Button>

                            <div className="text-center pt-4">
                                <span className="text-sm text-gray-600">
                                    Don't have an account?{" "}
                                    <Button
                                        type="button"
                                        variant="link"
                                        className="p-0 h-auto text-sm text-[#bf5925] hover:text-[#bf5925]/80"
                                        onClick={onSwitchToSignUp}
                                        disabled={isLoading}
                                    >
                                        Sign up
                                    </Button>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}