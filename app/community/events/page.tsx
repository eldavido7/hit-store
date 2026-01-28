// app/events/page.tsx
import { Metadata } from "next";
import EventsClient from "./EventsClient";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Discover upcoming events hosted by Her Immigrant Tales. Connect, collaborate, and grow together in a space built on trust, truth, and shared humanity.",
  keywords: "events, community events, immigrant women events, networking",
  openGraph: {
    title: "Events",
    description:
      "Discover upcoming events hosted by Her Immigrant Tales. Connect, collaborate, and grow together.",
    url: "https://herimmigranttales.org/events",
    images: [
      {
        url: "https://herimmigranttales.org/logo1.svg",
        width: 1200,
        height: 630,
        alt: "Her Immigrant Tales",
      },
    ],
    type: "website",
    siteName: "Her Immigrant Tales",
  },
  twitter: {
    card: "summary_large_image",
    title: "Events",
    description: "Discover upcoming events hosted by Her Immigrant Tales",
    images: ["https://herimmigranttales.org/logo1.svg"],
  },
  alternates: {
    canonical: "https://herimmigranttales.org/events",
  },
};

// Helper to fetch events server-side
async function getEvents() {
  try {
    const res = await fetch("https://herimmigranttales.org/api/events", {
      cache: "no-store",
    });

    if (!res.ok) {
      return [];
    }

    const allEvents = await res.json();
    return Array.isArray(allEvents)
      ? allEvents.filter((e: any) => e.status === "active")
      : [];
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
}

// Generate structured data
function generateStructuredData(events: any[]) {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://herimmigranttales.org",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Community",
        item: "https://herimmigranttales.org/community",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Events",
        item: "https://herimmigranttales.org/events",
      },
    ],
  };

  // If there are events, add EventSeries schema
  if (events.length > 0) {
    const eventSchemas = events.map((event) => ({
      "@context": "https://schema.org",
      "@type": "Event",
      name: event.title,
      description: event.description,
      startDate: event.date,
      location: {
        "@type": "Place",
        name: event.location,
      },
      image: event.image,
      organizer: {
        "@type": "Organization",
        name: "Her Immigrant Tales",
        url: "https://herimmigranttales.org",
      },
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
    }));

    return [breadcrumbSchema, ...eventSchemas];
  }

  return [breadcrumbSchema];
}

// Server Component
export default async function EventsPage() {
  // Fetch events server-side
  const serverEvents = await getEvents();

  // Generate structured data
  const structuredData = generateStructuredData(serverEvents);

  return (
    <>
      {/* JSON-LD Structured Data */}
      <Script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      {/* Pass server data to client component */}
      <EventsClient serverEvents={serverEvents} />
    </>
  );
}
