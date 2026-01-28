import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useCustomerAuthStore } from "@/store/store";
import { Loader2, X, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SignUpModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSwitchToSignIn: () => void;
}

export function SignUpModal({
    open,
    onOpenChange,
    onSwitchToSignIn,
}: SignUpModalProps) {
    const [step, setStep] = useState<"signup" | "verify">("signup");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const { signUp, verifyEmail, isLoading } = useCustomerAuthStore();
    const { toast } = useToast();

    const handleSignUp = async () => {
        if (!name || !email || !password || !confirmPassword) {
            toast({
                title: "Error",
                description: "Please fill in all fields",
                variant: "destructive",
            });
            return;
        }

        if (password !== confirmPassword) {
            toast({
                title: "Error",
                description: "Passwords don't match",
                variant: "destructive",
            });
            return;
        }

        if (password.length < 6) {
            toast({
                title: "Error",
                description: "Password must be at least 6 characters",
                variant: "destructive",
            });
            return;
        }

        if (!agreedToTerms) {
            toast({
                title: "Error",
                description: "Please agree to the terms and privacy policy",
                variant: "destructive",
            });
            return;
        }

        const result = await signUp(name, email, password);

        if (result.success) {
            setStep("verify");
            toast({
                title: "Account created!",
                description: "Please check your email for the verification code.",
            });
        } else {
            toast({
                title: "Sign up failed",
                description: result.message || "Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleVerifyEmail = async () => {
        if (!verificationCode) {
            toast({
                title: "Error",
                description: "Please enter the verification code",
                variant: "destructive",
            });
            return;
        }

        const result = await verifyEmail(email, verificationCode);

        if (result.success) {
            toast({
                title: "Welcome!",
                description: "Your email has been verified successfully.",
            });
            onOpenChange(false);
            handleReset();
        } else {
            toast({
                title: "Verification failed",
                description: result.message || "Please check the code and try again.",
                variant: "destructive",
            });
        }
    };

    const handleReset = () => {
        setStep("signup");
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setVerificationCode("");
        setAgreedToTerms(false);
    };

    const handleClose = () => {
        onOpenChange(false);
        handleReset();
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            if (step === "signup") {
                handleSignUp();
            } else {
                handleVerifyEmail();
            }
        }
    };

    if (step === "verify") {
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
                                    Check your email
                                </DialogTitle>
                                <p className="text-gray-600 text-center text-sm">
                                    We've sent a verification code to {email}
                                </p>
                            </DialogHeader>

                            <div className="px-6 pb-6 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="code">Verification Code</Label>
                                    <Input
                                        id="code"
                                        type="text"
                                        placeholder="Enter 6-digit code"
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value)}
                                        onKeyDown={handleKeyPress}
                                        className="rounded-xl text-center text-2xl tracking-widest"
                                        disabled={isLoading}
                                        maxLength={6}
                                    />
                                </div>

                                <Button
                                    onClick={handleVerifyEmail}
                                    className="w-full bg-[#bf5925] hover:bg-[#bf5925]/90 text-white rounded-xl py-3"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Verifying...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="mr-2 h-4 w-4" />
                                            Verify Email
                                        </>
                                    )}
                                </Button>

                                <div className="text-center pt-2">
                                    <Button
                                        type="button"
                                        variant="link"
                                        className="p-0 h-auto text-sm text-[#bf5925] hover:text-[#bf5925]/80"
                                        onClick={() => setStep("signup")}
                                        disabled={isLoading}
                                    >
                                        Back to sign up
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

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
                                Create account
                            </DialogTitle>
                            <p className="text-gray-600 text-center text-sm">
                                Join us and start shopping
                            </p>
                        </DialogHeader>

                        <div className="px-6 pb-6 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Enter your full name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    className="rounded-xl"
                                    disabled={isLoading}
                                />
                            </div>

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
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Create a password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    className="rounded-xl"
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="Confirm your password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    className="rounded-xl"
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="terms"
                                    checked={agreedToTerms}
                                    onCheckedChange={(checked) => setAgreedToTerms(!!checked)}
                                    disabled={isLoading}
                                />
                                <Label htmlFor="terms" className="text-sm text-gray-600">
                                    I agree to the{" "}
                                    <span className="text-[#bf5925] hover:underline cursor-pointer">
                                        Terms of Service
                                    </span>
                                    {" "}and{" "}
                                    <span className="text-[#bf5925] hover:underline cursor-pointer">
                                        Privacy Policy
                                    </span>
                                </Label>
                            </div>

                            <Button
                                onClick={handleSignUp}
                                className="w-full bg-[#bf5925] hover:bg-[#bf5925]/90 text-white rounded-xl py-3"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating account...
                                    </>
                                ) : (
                                    "Create Account"
                                )}
                            </Button>

                            <div className="text-center pt-4">
                                <span className="text-sm text-gray-600">
                                    Already have an account?{" "}
                                    <Button
                                        type="button"
                                        variant="link"
                                        className="p-0 h-auto text-sm text-[#bf5925] hover:text-[#bf5925]/80"
                                        onClick={onSwitchToSignIn}
                                        disabled={isLoading}
                                    >
                                        Sign in
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