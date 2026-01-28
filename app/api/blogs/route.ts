// app/api/blogs/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Blog } from "@/types";

// GET /api/blogs
export async function GET() {
    try {
        const blogs = await prisma.blog.findMany();
        return NextResponse.json(blogs);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch blogs" }, { status: 500 });
    }
}

// POST /api/blogs
export async function POST(request: Request) {
    const data = await request.json() as Blog;
    try {
        // If this blog is being marked as featured, unfeature all others
        if (data.isFeatured) {
            await prisma.blog.updateMany({
                data: { isFeatured: false }
            });
        }

        const blog = await prisma.blog.create({
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
            isFeatured: data.isFeatured || false,
            status: data.status,
            slug: data.slug,
            metaTitle: data.metaTitle || data.title,
            metaDescription:
              data.metaDescription || data.summary?.slice(0, 160) + "...",
            metaImage: data.metaImage || data.thumbnail,
            faq: data.faq ?? [],
            primaryKeyword: data.primaryKeyword || null,
          },
        });

        return NextResponse.json(blog, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create blog" }, { status: 500 });
    }
}