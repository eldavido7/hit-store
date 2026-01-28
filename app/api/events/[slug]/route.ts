// app/api/events/[slug]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";
import { Event } from "@/types";

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Extract public_id from Cloudinary URL
const getPublicIdFromUrl = (url: string): string | null => {
    if (!url.includes("res.cloudinary.com")) return null;
    const parts = url.split("/upload/")[1]?.split(".")[0];
    return parts ? parts.split("/").slice(1).join("/") : null;
};

// GET /api/events/[slug]
export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
    const params = await context.params;
    try {
        const event = await prisma.event.findUnique({ where: { slug: params.slug } });
        if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
        return NextResponse.json(event);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 });
    }
}

// PUT /api/events/[slug]
export async function PUT(request: Request, context: { params: Promise<{ slug: string }> }) {
    const params = await context.params;
    const data = await request.json() as Event;
    try {
        // If this event is being marked as featured, unfeature all others
        if (data.featured) {
            await prisma.event.updateMany({
                where: {
                    featured: true,
                    slug: { not: params.slug },
                },
                data: { featured: false },
            });
        }

        const event = await prisma.event.update({
            where: { slug: params.slug },
            data: {
                title: data.title,
                date: data.date,
                location: data.location,
                description: data.description,
                image: data.image,
                meetingLink: data.meetingLink,
                status: data.status,
                time: data.time,
                slug: data.slug,
                featured: data.featured,
            },
        });
        return NextResponse.json(event);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
    }
}

// DELETE /api/events/[slug]
export async function DELETE(request: Request, context: { params: Promise<{ slug: string }> }) {
    try {
        const params = await context.params;
        const event = await prisma.event.findUnique({ where: { slug: params.slug } });
        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        // Delete image from Cloudinary if it exists
        if (event.image && event.image.includes("res.cloudinary.com")) {
            const publicId = getPublicIdFromUrl(event.image);
            if (publicId) {
                try {
                    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
                    console.log(`[DELETE_EVENT_MEDIA] Deleted image: ${publicId}`);
                } catch (error) {
                    console.error(`[DELETE_EVENT_MEDIA] Failed to delete image ${publicId}:`, error);
                }
            }
        }

        // Delete event from database
        await prisma.event.delete({ where: { slug: params.slug } });
        return NextResponse.json({ message: "Event deleted" });
    } catch (error) {
        console.error("[DELETE_EVENT]", error);
        return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
    }
}