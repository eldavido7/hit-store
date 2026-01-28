// app/community/page.tsx
import { Metadata } from "next";
import CommunityClient from "./CommunityClient";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Global Community",
  description:
    "Join our global community of immigrant women sharing stories, building connections, and inspiring change across cultures and borders.",
  keywords: "global community, immigrant women",
  openGraph: {
    title: "Global Community",
    description:
      "Join our global community of immigrant women sharing stories, building connections, and inspiring change across cultures and borders.",
    url: "https://herimmigranttales.org/community",
    images: [
      {
        url: "https://herimmigranttales.org/logo1.svg",
        width: 1200,
        height: 630,
        alt: "Her Immigrant Tales",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Global Community",
    description:
      "Join our global community of immigrant women sharing stories, building connections, and inspiring change across cultures and borders.",
    images: ["https://herimmigranttales.org/logo1.svg"],
  },
  alternates: {
    canonical: "https://herimmigranttales.org/community",
  },
};

// Server component: fetch initial events for SEO and pass to client
export default async function CommunityPage() {
  let serverEvents: any[] = [];

  try {
    const res = await fetch("https://herimmigranttales.org/api/events", {
      cache: "no-store",
    });

    if (res.ok) {
      const all = await res.json();
      serverEvents = Array.isArray(all) ? all : [];
    }
  } catch (error) {
    console.error("Failed to fetch server events:", error);
    serverEvents = [];
  }

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
    ],
  };

  return (
    <>
      <Script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />

      <CommunityClient serverEvents={serverEvents} />
    </>
  );
}
