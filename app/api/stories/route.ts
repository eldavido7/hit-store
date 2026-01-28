// api/stories/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Story } from "@/types";

// GET /api/stories
export async function GET() {
    try {
        const stories = await prisma.story.findMany();
        return NextResponse.json(stories);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch stories" }, { status: 500 });
    }
}

// POST /api/stories
export async function POST(request: Request) {
    const data = await request.json() as Story;
    try {
        // If this story is being marked as featured, unfeature all others
        if (data.isFeatured) {
            await prisma.story.updateMany({
                where: { isFeatured: true },
                data: { isFeatured: false }
            });
        }

        const story = await prisma.story.create({
          data: {
            title: data.title,
            author: data.author,
            summary: data.summary,
            content: data.content,
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
        return NextResponse.json(story, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create story" }, { status: 500 });
    }
}