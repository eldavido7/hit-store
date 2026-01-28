// app/stories/page.tsx
import { Metadata } from "next";
import StoriesPageClient from "./StoriesPageClient";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Stories",
  description:
    "Discover inspiring immigrant stories and voices of immigrant women, sharing experiences, resilience, and industry updates from around the world.",
  keywords: "immigrant stories, voices of immigrant women",
  openGraph: {
    title: "Immigrant Women Stories",
    description:
      "Discover inspiring immigrant stories and voices of immigrant women, sharing experiences, resilience, and industry updates from around the world.",
    url: "https://herimmigranttales.org/stories",
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
    title: "Stories",
    description:
      "Discover inspiring immigrant stories and voices of immigrant women, sharing experiences, resilience, and industry updates from around the world.",
    images: ["https://herimmigranttales.org/logo1.svg"],
  },
  alternates: {
    canonical: "https://herimmigranttales.org/stories",
  },
};

// Server component: fetch initial stories for SEO and pass to client
export default async function StoriesPage() {
  let serverStories: any[] = [];

  try {
    const res = await fetch("https://herimmigranttales.org/api/stories", {
      cache: "no-store",
    });

    if (res.ok) {
      const all = await res.json();
      serverStories = Array.isArray(all)
        ? all.filter((s: any) => s.status === "published")
        : [];
    }
  } catch (error) {
    // swallow - client can fetch
    console.error("Failed to fetch server stories:", error);
    serverStories = [];
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
        name: "Stories",
        item: "https://herimmigranttales.org/stories",
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

      <StoriesPageClient serverStories={serverStories} />
    </>
  );
}
