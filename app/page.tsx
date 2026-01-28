// app/page.tsx
import { Metadata } from "next";
import HomePageClient from "./HomePageClient";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Her Immigrant Tales | Celebrating Immigrant Women's Stories",
  description:
    "Discover powerful stories, connect with a vibrant community, and help us honor the voices of immigrant women everywhere. Join our global community celebrating immigrant women's journeys.",
  keywords:
    "immigrant women stories, immigrant women health, immigrant community, women empowerment, storytelling platform",
  authors: [{ name: "Her Immigrant Tales" }],
  openGraph: {
    title: "Her Immigrant Tales | Celebrating Immigrant Women's Stories",
    description:
      "Discover powerful stories, connect with a vibrant community, and help us honor the voices of immigrant women everywhere.",
    url: "https://herimmigranttales.org",
    siteName: "Her Immigrant Tales",
    images: [
      {
        url: "https://herimmigranttales.org/logo1.svg",
        width: 1200,
        height: 630,
        alt: "Her Immigrant Tales - Celebrating Immigrant Women",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Her Immigrant Tales | Celebrating Immigrant Women's Stories",
    description:
      "Discover powerful stories, connect with a vibrant community, and help us honor the voices of immigrant women everywhere.",
    images: ["https://herimmigranttales.org/logo1.svg"],
    creator: "@HIT_Champions",
  },
  alternates: {
    canonical: "https://herimmigranttales.org",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

async function getStoriesData() {
  try {
    const res = await fetch("https://herimmigranttales.org/api/stories", {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data)
      ? data.filter((s: any) => s.status === "published")
      : [];
  } catch (err) {
    console.error("[GET_STORIES]", err);
    return [];
  }
}

export default async function HomePage() {
  const serverStories = await getStoriesData();

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Her Immigrant Tales",
    alternateName: "HIT",
    url: "https://herimmigranttales.org",
    logo: {
      "@type": "ImageObject",
      url: "https://herimmigranttales.org/logo1.svg",
      width: 1200,
      height: 630,
    },
    description:
      "A storytelling platform celebrating immigrant women's voices and journeys worldwide",
    foundingDate: "2020",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      email: "hello@herimmigranttales.org",
    },
    sameAs: [
      "https://www.facebook.com/herimmigranttales",
      "https://www.instagram.com/herimmigranttales",
      "https://www.tiktok.com/@herimmigranttales",
      "https://twitter.com/HIT_Champions",
      "https://open.spotify.com/show/herimmigranttales",
      "https://www.threads.net/@herimmigranttales",
      "https://www.youtube.com/@herimmigranttales",
    ],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Her Immigrant Tales",
    alternateName: "HIT",
    url: "https://herimmigranttales.org",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate:
          "https://herimmigranttales.org/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

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
    ],
  };

  // Combine all schemas
  const structuredData = [organizationSchema, websiteSchema, breadcrumbSchema];

  return (
    <>
      {/* Single JSON-LD script with all schemas */}
      <Script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <HomePageClient serverStories={serverStories} />
    </>
  );
}
