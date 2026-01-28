import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomInt, randomBytes } from "crypto";
import { sendVerificationEmail, sendResetPasswordEmail } from "@/lib/email";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

function generateVerificationCode(): string {
    return randomInt(100000, 999999).toString();
}

function generateResetToken(): string {
    return randomBytes(32).toString('hex');
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action } = body;

        switch (action) {
            case "signin":
                return handleSignIn(body);

            case "signup":
                return handleSignUp(body);

            case "verify-email":
                return handleEmailVerification(body);

            case "forgot-password":
                return handleForgotPassword(body);

            case "reset-password":
                return handleResetPassword(body);

            case "verify-token":
                return handleTokenVerification(request);

            default:
                return NextResponse.json(
                    { success: false, message: "Invalid action" },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error("[CUSTOMER_AUTH_ERROR]", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}

async function handleSignIn(body: any) {
    const { email, password } = body;

    if (!email || !password) {
        return NextResponse.json(
            { success: false, message: "Email and password are required" },
            { status: 400 }
        );
    }

    const customer = await prisma.customer.findUnique({
        where: { email: email.toLowerCase() },
    });

    if (!customer) {
        return NextResponse.json(
            { success: false, message: "Invalid credentials" },
            { status: 401 }
        );
    }

    const isValidPassword = await bcrypt.compare(password, customer.password);
    if (!isValidPassword) {
        return NextResponse.json(
            { success: false, message: "Invalid credentials" },
            { status: 401 }
        );
    }

    if (!customer.isEmailVerified) {
        return NextResponse.json(
            { success: false, message: "Please verify your email address first" },
            { status: 403 }
        );
    }

    const token = jwt.sign({ customerId: customer.id }, JWT_SECRET, { expiresIn: '7d' });

    const { password: _, ...customerData } = customer;

    return NextResponse.json({
        success: true,
        customer: customerData,
        token,
    });
}

async function handleSignUp(body: any) {
    const { name, email, password } = body;

    if (!name || !email || !password) {
        return NextResponse.json(
            { success: false, message: "All fields are required" },
            { status: 400 }
        );
    }

    if (password.length < 6) {
        return NextResponse.json(
            { success: false, message: "Password must be at least 6 characters" },
            { status: 400 }
        );
    }

    const existingCustomer = await prisma.customer.findUnique({
        where: { email: email.toLowerCase() },
    });

    if (existingCustomer) {
        if (existingCustomer.isEmailVerified) {
            // If the account is already verified, it's a true conflict.
            return NextResponse.json(
                { success: false, message: "Email already registered" },
                { status: 409 }
            );
        } else {
            // If the account exists but is unverified, update it and resend the code.
            const hashedPassword = await bcrypt.hash(password, 12);
            const verificationCode = generateVerificationCode();
            const verificationExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

            const updatedCustomer = await prisma.customer.update({
                where: { email: email.toLowerCase() },
                data: {
                    name, // Update name in case it changed
                    password: hashedPassword, // Update to the new password
                    emailVerificationToken: verificationCode,
                    emailVerificationExpires: verificationExpires,
                },
            });

            try {
                await sendVerificationEmail(email, verificationCode, name);
            } catch (emailError) {
                console.error("[EMAIL_ERROR]", emailError);
            }

            const { password: _, ...customerData } = updatedCustomer;

            return NextResponse.json({
                success: true,
                customer: customerData,
                message: "A new verification code has been sent to your email.",
            });
        }
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationCode = generateVerificationCode();
    const verificationExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    const customer = await prisma.customer.create({
        data: {
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            emailVerificationToken: verificationCode,
            emailVerificationExpires: verificationExpires,
        },
    });

    try {
        await sendVerificationEmail(email, verificationCode, name);
    } catch (emailError) {
        console.error("[EMAIL_ERROR]", emailError);
        // Continue anyway - customer is created, they can request new verification
    }

    const { password: _, ...customerData } = customer;

    return NextResponse.json({
        success: true,
        customer: customerData,
        message: "Account created! Please check your email for verification code.",
    });
}

async function handleEmailVerification(body: any) {
    const { email, code } = body;

    if (!email || !code) {
        return NextResponse.json(
            { success: false, message: "Email and code are required" },
            { status: 400 }
        );
    }

    const customer = await prisma.customer.findUnique({
        where: { email: email.toLowerCase() },
    });

    if (!customer) {
        return NextResponse.json(
            { success: false, message: "Customer not found" },
            { status: 404 }
        );
    }

    if (customer.isEmailVerified) {
        return NextResponse.json(
            { success: false, message: "Email already verified" },
            { status: 400 }
        );
    }

    if (!customer.emailVerificationToken || !customer.emailVerificationExpires) {
        return NextResponse.json(
            { success: false, message: "No verification code found" },
            { status: 400 }
        );
    }

    if (new Date() > customer.emailVerificationExpires) {
        return NextResponse.json(
            { success: false, message: "Verification code expired" },
            { status: 400 }
        );
    }

    if (customer.emailVerificationToken !== code) {
        return NextResponse.json(
            { success: false, message: "Invalid verification code" },
            { status: 400 }
        );
    }

    const updatedCustomer = await prisma.customer.update({
        where: { id: customer.id },
        data: {
            isEmailVerified: true,
            emailVerificationToken: null,
            emailVerificationExpires: null,
        },
    });

    const token = jwt.sign({ customerId: updatedCustomer.id }, JWT_SECRET, { expiresIn: '7d' });

    const { password: _, ...customerData } = updatedCustomer;

    return NextResponse.json({
        success: true,
        customer: customerData,
        token,
        message: "Email verified successfully!",
    });
}

async function handleForgotPassword(body: any) {
    const { email } = body;

    if (!email) {
        return NextResponse.json(
            { success: false, message: "Email is required" },
            { status: 400 }
        );
    }

    const customer = await prisma.customer.findUnique({
        where: { email: email.toLowerCase() },
    });

    if (!customer) {
        // Don't reveal if email exists or not for security
        return NextResponse.json({
            success: true,
            message: "If the email exists, you'll receive a password reset link.",
        });
    }

    const resetToken = generateResetToken();
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.customer.update({
        where: { id: customer.id },
        data: {
            passwordResetToken: resetToken,
            passwordResetExpires: resetExpires,
        },
    });

    try {
        await sendResetPasswordEmail(email, resetToken, customer.name);
    } catch (emailError) {
        console.error("[EMAIL_ERROR]", emailError);
    }

    return NextResponse.json({
        success: true,
        message: "If the email exists, you'll receive a password reset link.",
    });
}

async function handleResetPassword(body: any) {
    const { token, password } = body;

    if (!token || !password) {
        return NextResponse.json(
            { success: false, message: "Token and password are required" },
            { status: 400 }
        );
    }

    if (password.length < 6) {
        return NextResponse.json(
            { success: false, message: "Password must be at least 6 characters" },
            { status: 400 }
        );
    }

    const customer = await prisma.customer.findFirst({
        where: {
            passwordResetToken: token,
            passwordResetExpires: {
                gt: new Date(),
            },
        },
    });

    if (!customer) {
        return NextResponse.json(
            { success: false, message: "Invalid or expired reset token" },
            { status: 400 }
        );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.customer.update({
        where: { id: customer.id },
        data: {
            password: hashedPassword,
            passwordResetToken: null,
            passwordResetExpires: null,
        },
    });

    return NextResponse.json({
        success: true,
        message: "Password reset successfully!",
    });
}

async function handleTokenVerification(request: NextRequest) {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
        return NextResponse.json(
            { success: false, message: "No token provided" },
            { status: 401 }
        );
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { customerId: string };

        const customer = await prisma.customer.findUnique({
            where: { id: decoded.customerId },
        });

        if (!customer) {
            return NextResponse.json(
                { success: false, message: "Customer not found" },
                { status: 404 }
            );
        }

        const { password: _, ...customerData } = customer;

        return NextResponse.json({
            success: true,
            customer: customerData,
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, message: "Invalid token" },
            { status: 401 }
        );
    }
}

export async function GET(request: NextRequest) {
    return handleTokenVerification(request);
}