// api/events/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Event } from "@/types";

// GET /api/events
export async function GET() {
    try {
        const events = await prisma.event.findMany();
        return NextResponse.json(events);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
    }
}

// POST /api/events
export async function POST(request: Request) {
    const data = await request.json() as Event;
    try {
        // If this event is being marked as featured, unfeature all others
        if (data.featured) {
            await prisma.event.updateMany({
                where: { featured: true },
                data: { featured: false }
            });
        }

        const event = await prisma.event.create({
            data: {
                title: data.title,
                date: data.date,
                location: data.location,
                description: data.description,
                featured: data.featured || false,
                image: data.image,
                meetingLink: data.meetingLink,
                status: data.status,
                time: data.time,
                slug: data.slug,
            },
        });
        return NextResponse.json(event, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
    }
}