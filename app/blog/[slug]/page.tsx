// app/blog/[slug]/page.tsx
import { Metadata } from "next";
import Script from "next/script";
import BlogDetailsClient from "./BlogDetailsClient";

type Props = {
  params: Promise<{ slug: string }>;
};

// Helper function to fetch blog data
async function getBlogData(slug: string) {
  try {
    const res = await fetch(`https://herimmigranttales.org/api/blogs/${slug}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error("Error fetching blog:", error);
    return null;
  }
}

// Helper to fetch other blogs
async function getOtherBlogs(currentSlug: string) {
  try {
    const res = await fetch(`https://herimmigranttales.org/api/blogs`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return [];
    }

    const blogs = await res.json();
    return blogs
      .filter((b: any) => b.slug !== currentSlug && b.status === "published")
      .slice(0, 3);
  } catch (error) {
    console.error("Error fetching other blogs:", error);
    return [];
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogData(slug);

  if (!blog) {
    return {
      title: {
        absolute: "Blog Post",
      },
      description:
        "Read inspiring stories from immigrant women around the world.",
      openGraph: {
        title: "Blog Post",
        description:
          "Read inspiring stories from immigrant women around the world.",
        images: ["https://herimmigranttales.org/logo1.svg"],
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title: "Blog Post",
        description:
          "Read inspiring stories from immigrant women around the world.",
        images: ["https://herimmigranttales.org/logo1.svg"],
      },
    };
  }

  return {
    title: {
      absolute: blog.metaTitle || blog.title || "Blog Post",
    },
    description:
      blog.metaDescription ||
      blog.summary ||
      "Read inspiring stories from immigrant women",
    keywords: blog.primaryKeyword || blog.category,
    authors: [{ name: blog.author, url: "https://herimmigranttales.org" }],
    openGraph: {
      title: blog.metaTitle || blog.title,
      description: blog.metaDescription || blog.summary,
      images: [
        blog.metaImage ||
          blog.thumbnail ||
          "https://herimmigranttales.org/logo1.svg",
      ],
      type: "article",
      url: `https://herimmigranttales.org/blog/${blog.slug}`,
      siteName: "Her Immigrant Tales",
      publishedTime: blog.dateCreated,
      modifiedTime: blog.lastUpdated || blog.dateCreated,
      authors: [blog.author],
    },
    twitter: {
      card: "summary_large_image",
      title: blog.metaTitle || blog.title,
      description: blog.metaDescription || blog.summary,
      images: [
        blog.metaImage ||
          blog.thumbnail ||
          "https://herimmigranttales.org/logo1.svg",
      ],
      creator: blog.author,
    },
    alternates: {
      canonical: `https://herimmigranttales.org/blog/${blog.slug}`,
    },
  };
}

// Server Component - crawlers see this
export default async function BlogPage({ params }: Props) {
  const { slug } = await params;

  // Fetch data server-side for SEO
  const blog = await getBlogData(slug);
  const otherBlogs = await getOtherBlogs(slug);

  if (!blog) {
    return <BlogDetailsClient blog={null} otherBlogs={[]} />;
  }

  // Generate individual schemas (like contact page)
  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.metaTitle || blog.title,
    description: blog.metaDescription || blog.summary,
    image: blog.metaImage || blog.thumbnail,
    author: {
      "@type": "Person",
      name: blog.author,
      url: "https://herimmigranttales.org",
    },
    publisher: {
      "@type": "Organization",
      name: "Her Immigrant Tales",
      logo: {
        "@type": "ImageObject",
        url: "https://herimmigranttales.org/logo1.svg",
      },
    },
    datePublished: blog.dateCreated,
    dateModified: blog.lastUpdated || blog.dateCreated,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://herimmigranttales.org/blog/${blog.slug}`,
    },
    keywords: blog.primaryKeyword || blog.category,
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
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: "https://herimmigranttales.org/blog",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: blog.title,
        item: `https://herimmigranttales.org/blog/${blog.slug}`,
      },
    ],
  };

  const faqSchema =
    blog.faq && blog.faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: blog.faq.map((f: any) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: f.answer,
            },
          })),
        }
      : null;

  // Combine all schemas into a single @graph structure
  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [
      blogPostingSchema,
      breadcrumbSchema,
      ...(faqSchema ? [faqSchema] : []),
    ],
  };

  return (
    <>
      {/* Single combined schema using Next.js Script component for proper head placement */}
      <Script
        id="blog-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedSchema) }}
        strategy="afterInteractive"
      />

      {/* Pass server data to client component */}
      <BlogDetailsClient blog={blog} otherBlogs={otherBlogs} />
    </>
  );
}
