import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

function getCustomerIdFromToken(request: NextRequest): string | null {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) return null;

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { customerId: string };
        return decoded.customerId;
    } catch {
        return null;
    }
}

// GET - Fetch customer's wishlist
export async function GET(request: NextRequest) {
    try {
        const customerId = getCustomerIdFromToken(request);

        if (!customerId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const wishlistItems = await prisma.wishlistItem.findMany({
            where: { customerId },
            include: {
                product: {
                    include: {
                        variants: true,
                    },
                },
                variant: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({
            success: true,
            wishlistItems,
        });
    } catch (error) {
        console.error("[WISHLIST_GET_ERROR]", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}

// POST - Add to wishlist
export async function POST(request: NextRequest) {
    try {
        const customerId = getCustomerIdFromToken(request);

        if (!customerId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { productId, variantId } = await request.json();

        if (!productId) {
            return NextResponse.json(
                { success: false, message: "Product ID is required" },
                { status: 400 }
            );
        }

        // Check if product exists
        const product = await prisma.product.findUnique({
            where: { id: productId },
            include: { variants: true },
        });

        if (!product) {
            return NextResponse.json(
                { success: false, message: "Product not found" },
                { status: 404 }
            );
        }

        // If variantId is provided, check if variant exists
        if (variantId) {
            const variant = product.variants?.find(v => v.id === variantId);
            if (!variant) {
                return NextResponse.json(
                    { success: false, message: "Product variant not found" },
                    { status: 404 }
                );
            }
        }

        // Check if item is already in wishlist
        const existingWishlistItem = await prisma.wishlistItem.findFirst({
            where: {
                customerId,
                productId,
                variantId: variantId || null,
            },
        });

        if (existingWishlistItem) {
            return NextResponse.json(
                { success: false, message: "Item already in wishlist" },
                { status: 409 }
            );
        }

        // Add to wishlist
        const wishlistItem = await prisma.wishlistItem.create({
            data: {
                customerId,
                productId,
                variantId: variantId || null,
            },
            include: {
                product: {
                    include: {
                        variants: true,
                    },
                },
                variant: true,
            },
        });

        return NextResponse.json({
            success: true,
            wishlistItem,
            message: "Item added to wishlist",
        });
    } catch (error) {
        console.error("[WISHLIST_POST_ERROR]", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}

// DELETE - Remove from wishlist
export async function DELETE(request: NextRequest) {
    try {
        const customerId = getCustomerIdFromToken(request);

        if (!customerId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');
        const variantId = searchParams.get('variantId');

        if (!productId) {
            return NextResponse.json(
                { success: false, message: "Product ID is required" },
                { status: 400 }
            );
        }

        // Find and delete the wishlist item
        const wishlistItem = await prisma.wishlistItem.findFirst({
            where: {
                customerId,
                productId,
                variantId: variantId || null,
            },
        });

        if (!wishlistItem) {
            return NextResponse.json(
                { success: false, message: "Item not found in wishlist" },
                { status: 404 }
            );
        }

        await prisma.wishlistItem.delete({
            where: { id: wishlistItem.id },
        });

        return NextResponse.json({
            success: true,
            message: "Item removed from wishlist",
        });
    } catch (error) {
        console.error("[WISHLIST_DELETE_ERROR]", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}