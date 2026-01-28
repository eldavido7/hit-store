// app/api/blogs/[slug]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";
import { Blog } from "@/types";

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

// GET /api/blogs/[slug]
export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
    const params = await context.params;
    try {
        const blog = await prisma.blog.findUnique({ where: { slug: params.slug } });
        if (!blog) return NextResponse.json({ error: "Blog not found" }, { status: 404 });
        return NextResponse.json(blog);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch blog" }, { status: 500 });
    }
}

// PUT /api/blogs/[slug]
export async function PUT(request: Request, context: { params: Promise<{ slug: string }> }) {
    const params = await context.params;
    const data = await request.json() as Blog;
    try {
        // If this blog is being marked as featured, unfeature all others first
        if (data.isFeatured) {
            await prisma.blog.updateMany({
                where: { slug: { not: params.slug } },
                data: { isFeatured: false },
            });
        }

        const blog = await prisma.blog.update({
          where: { slug: params.slug },
          data: {
            title: data.title,
            author: data.author,
            summary: data.summary,
            content: data.content,
            category: data.category,
            type: data.type,
            videoUrl: data.videoUrl,
            audioFile: data.audioFile,
            thumbnail: data.thumbnail,
            status: data.status,
            slug: data.slug,
            isFeatured: data.isFeatured,
            metaTitle: data.metaTitle,
            metaDescription: data.metaDescription,
            metaImage: data.metaImage,
            primaryKeyword: data.primaryKeyword,
            faq: data.faq ?? [],
          },
        });

        return NextResponse.json(blog);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update blog" }, { status: 500 });
    }
}

// DELETE /api/blogs/[slug]
export async function DELETE(request: Request, context: { params: Promise<{ slug: string }> }) {
    try {
        const params = await context.params;
        const blog = await prisma.blog.findUnique({ where: { slug: params.slug } });
        if (!blog) {
            return NextResponse.json({ error: "Blog not found" }, { status: 404 });
        }

        // Delete media from Cloudinary
        const mediaFields = [
            { url: blog.thumbnail, resourceType: "image" },
            { url: blog.videoUrl, resourceType: "video" },
            { url: blog.audioFile, resourceType: "video" },
        ];

        for (const { url, resourceType } of mediaFields) {
            if (url && url.includes("res.cloudinary.com")) {
                const publicId = getPublicIdFromUrl(url);
                if (publicId) {
                    try {
                        await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
                        console.log(`[DELETE_BLOG_MEDIA] Deleted ${resourceType}: ${publicId}`);
                    } catch (error) {
                        console.error(`[DELETE_BLOG_MEDIA] Failed to delete ${resourceType} ${publicId}:`, error);
                    }
                }
            }
        }

        // Delete blog from database
        await prisma.blog.delete({ where: { slug: params.slug } });
        return NextResponse.json({ message: "Blog deleted" });
    } catch (error) {
        console.error("[DELETE_BLOG]", error);
        return NextResponse.json({ error: "Failed to delete blog" }, { status: 500 });
    }
}