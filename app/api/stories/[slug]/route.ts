// api/stories/[slug]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";
import { Story } from "@/types";

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

// GET /api/stories/[slug]
export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
    const params = await context.params;
    try {
        const story = await prisma.story.findUnique({ where: { slug: params.slug } });
        if (!story) return NextResponse.json({ error: "Story not found" }, { status: 404 });
        return NextResponse.json(story);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch story" }, { status: 500 });
    }
}

// PUT /api/stories/[slug]
export async function PUT(request: Request, context: { params: Promise<{ slug: string }> }) {
    const params = await context.params;
    const data = await request.json() as Story;
    try {
        // If this story is being marked as featured, unfeature all others
        if (data.isFeatured) {
            await prisma.story.updateMany({
                where: {
                    isFeatured: true,
                    slug: { not: params.slug },
                },
                data: { isFeatured: false },
            });
        }

        const story = await prisma.story.update({
          where: { slug: params.slug },
          data: {
            title: data.title,
            author: data.author,
            summary: data.summary,
            content: data.content,
            type: data.type,
            videoUrl: data.videoUrl,
            audioFile: data.audioFile,
            thumbnail: data.thumbnail,
            status: data.status,
            slug: data.slug,
            isFeatured: data.isFeatured,
            metaTitle: data.metaTitle || data.title,
            metaDescription:
              data.metaDescription || data.summary?.slice(0, 160) + "...",
            metaImage: data.metaImage || data.thumbnail,
            faq: data.faq ?? [],
            primaryKeyword: data.primaryKeyword || null,
          },
        });
        return NextResponse.json(story);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update story" }, { status: 500 });
    }
}

// DELETE /api/stories/[slug]
export async function DELETE(request: Request, context: { params: Promise<{ slug: string }> }) {
    try {
        const params = await context.params;
        const story = await prisma.story.findUnique({ where: { slug: params.slug } });
        if (!story) {
            return NextResponse.json({ error: "Story not found" }, { status: 404 });
        }

        // Delete media from Cloudinary
        const mediaFields = [
            { url: story.thumbnail, resourceType: "image" },
            { url: story.videoUrl, resourceType: "video" },
            { url: story.audioFile, resourceType: "video" },
        ];

        for (const { url, resourceType } of mediaFields) {
            if (url && url.includes("res.cloudinary.com")) {
                const publicId = getPublicIdFromUrl(url);
                if (publicId) {
                    try {
                        await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
                        console.log(`[DELETE_STORY_MEDIA] Deleted ${resourceType}: ${publicId}`);
                    } catch (error) {
                        console.error(`[DELETE_STORY_MEDIA] Failed to delete ${resourceType} ${publicId}:`, error);
                    }
                }
            }
        }

        // Delete story from database
        await prisma.story.delete({ where: { slug: params.slug } });
        return NextResponse.json({ message: "Story deleted" });
    } catch (error) {
        console.error("[DELETE_STORY]", error);
        return NextResponse.json({ error: "Failed to delete story" }, { status: 500 });
    }
}