// app/blog/page.tsx
import { Metadata } from "next";
import BlogPageClient from "./BlogPageClient";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Her Immigrant Tales blog shares inspiring stories and industry updates, highlighting immigrant women's journeys, empowerment, and community growth.",
  keywords: "blog, industry update",
  openGraph: {
    title: "Blog",
    description:
      "Her Immigrant Tales blog shares inspiring stories and industry updates, highlighting immigrant women's journeys, empowerment, and community growth.",
    url: "https://herimmigranttales.org/blog",
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
    title: "Blog",
    description:
      "Her Immigrant Tales blog shares inspiring stories and industry updates, highlighting immigrant women's journeys, empowerment, and community growth.",
    images: ["https://herimmigranttales.org/logo1.svg"],
  },
  alternates: {
    canonical: "https://herimmigranttales.org/blog",
  },
};

// Server component: fetch initial blogs for SEO and pass to client
export default async function BlogPage() {
  let serverBlogs: any[] = [];

  try {
    const res = await fetch("https://herimmigranttales.org/api/blogs", {
      cache: "no-store",
    });

    if (res.ok) {
      const all = await res.json();
      serverBlogs = Array.isArray(all)
        ? all.filter((b: any) => b.status === "published")
        : [];
    }
  } catch (error) {
    console.error("Failed to fetch server blogs:", error);
    serverBlogs = [];
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
        name: "Blog",
        item: "https://herimmigranttales.org/blog",
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

      <BlogPageClient serverBlogs={serverBlogs} />
    </>
  );
}
