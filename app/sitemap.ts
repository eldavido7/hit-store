// app/sitemap.ts
import type { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://herimmigranttales.org";

  const staticPages = [
    "/",
    "/about",
    "/blog",
    "/stories",
    "/community",
    "/community/events",
    "/faq",
    "/contact",
  ];

  const [blogs, stories] = await Promise.all([
    prisma.blog.findMany({ select: { slug: true, lastUpdated: true } }),
    prisma.story.findMany({ select: { slug: true, lastUpdated: true } }),
  ]);

  const dynamicBlogs = blogs.map((b) => `/blog/${b.slug}`);
  const dynamicStories = stories.map((s) => `/stories/${s.slug}`);

  const allRoutes = [...staticPages, ...dynamicBlogs, ...dynamicStories];

  return allRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority:
      route === ""
        ? 1.0
        : route.includes("/blog/") || route.includes("/stories/")
        ? 0.8
        : 0.7,
  }));
}

export const dynamic = "force-dynamic";
