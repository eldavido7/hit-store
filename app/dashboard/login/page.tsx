"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/components/ui/use-toast";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const { user, login, isLoading } = useAuthStore();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push("/dashboard/main");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const success = await login(email, password);

    if (success) {
      const currentUser = useAuthStore.getState().user;

      if (currentUser) {
        toast({
          title: "Login successful",
          description: `Welcome ${currentUser.name || currentUser.email}!`,
        });
      }

      router.push("/dashboard/main");
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div className="absolute inset-0 bg-black/20"></div>
        <Image
          src="/left1.png"
          alt="Her Immigrant Tales"
          fill
          className="object-cover object-center"
          priority
        />

        {/* Logo */}
        <div className="absolute top-8 left-8 z-10 pl-8">
          <Image
            src="https://herimmigranttales.org/logo1.svg"
            alt="HER IMMIGRANT TALES Logo"
            width={250}
            height={50}
            priority
          />
        </div>

        {/* Bottom Content */}
        <div className="absolute bottom-8 left-8 right-8 pl-8 text-white z-10">
          <h3 className="text-6xl font-cormorant  mb-4 leading-tight">
            Your Impact Starts Here
          </h3>
          <p className="text-lg opacity-90 leading-relaxed">
            Every update you make plays a part in amplifying the voices of
            immigrant women, strengthening our community, and ensuring their
            stories continue to inspire and reach the world.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="flex md:hidden absolute top-8 left-8 z-10 pl-8">
            <Image
              src="https://herimmigranttales.org/logo1.svg"
              alt="HER IMMIGRANT TALES Logo"
              width={250}
              height={50}
              priority
            />
          </div>

          {/* Welcome Back Header */}
          <div className="text-left space-y-2">
            <h2 className="text-3xl font-bold text-gray-900">Welcome Back!</h2>
            <p className="text-gray-600">
              Manage everything from one simple dashboard
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 px-4 rounded-3xl border-gray-300 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 px-4 pr-12 rounded-3xl border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              className="w-full h-12 rounded-3xl bg-app-primary hover:bg-[#bf5925]/90 text-white font-medium transition-colors"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="text-center text-sm text-gray-500 bg-gray-100 p-3 rounded-md">
            <p>Demo credentials: admin@hit.com / password123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
