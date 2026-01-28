// app/story/[slug]/page.tsx
import { Metadata } from "next";
import Script from "next/script";
import StoryDetailsClient from "./StoryDetailsClient";

type Props = {
  params: Promise<{ slug: string }>;
};

// Helper function to fetch story data
async function getStoryData(slug: string) {
  try {
    const res = await fetch(
      `https://herimmigranttales.org/api/stories/${slug}`,
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error("Error fetching story:", error);
    return null;
  }
}

// Helper to fetch other stories
async function getOtherStories(currentSlug: string) {
  try {
    const res = await fetch(`https://herimmigranttales.org/api/stories`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return [];
    }

    const stories = await res.json();
    return stories
      .filter((b: any) => b.slug !== currentSlug && b.status === "published")
      .slice(0, 3);
  } catch (error) {
    console.error("Error fetching other stories:", error);
    return [];
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const story = await getStoryData(slug);

  if (!story) {
    return {
      title: {
        absolute: "Story",
      },
      description:
        "Read inspiring stories from immigrant women around the world.",
      openGraph: {
        title: "Story",
        description:
          "Read inspiring stories from immigrant women around the world.",
        images: ["https://herimmigranttales.org/logo1.svg"],
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title: "Story",
        description:
          "Read inspiring stories from immigrant women around the world.",
        images: ["https://herimmigranttales.org/logo1.svg"],
      },
    };
  }

  return {
    title: {
      absolute: story.metaTitle || story.title || "Story",
    },
    description:
      story.metaDescription ||
      story.summary ||
      "Read inspiring stories from immigrant women",
    keywords: story.primaryKeyword || story.title,
    authors: [{ name: story.author, url: "https://herimmigranttales.org" }],
    openGraph: {
      title: story.metaTitle || story.title,
      description: story.metaDescription || story.summary,
      images: [
        story.metaImage ||
          story.thumbnail ||
          "https://herimmigranttales.org/logo1.svg",
      ],
      type: "article",
      url: `https://herimmigranttales.org/stories/${story.slug}`,
      siteName: "Her Immigrant Tales",
      publishedTime: story.dateCreated,
      modifiedTime: story.lastUpdated || story.dateCreated,
      authors: [story.author],
    },
    twitter: {
      card: "summary_large_image",
      title: story.metaTitle || story.title,
      description: story.metaDescription || story.summary,
      images: [
        story.metaImage ||
          story.thumbnail ||
          "https://herimmigranttales.org/logo1.svg",
      ],
      creator: story.author,
    },
    alternates: {
      canonical: `https://herimmigranttales.org/stories/${story.slug}`,
    },
  };
}

// Server Component - crawlers see this
export default async function StoryPage({ params }: Props) {
  const { slug } = await params;

  // Fetch data server-side for SEO
  const story = await getStoryData(slug);
  const otherStories = await getOtherStories(slug);

  if (!story) {
    return <StoryDetailsClient story={null} otherStories={[]} />;
  }

  // Generate individual schemas (like contact page)
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: story.metaTitle || story.title,
    description: story.metaDescription || story.summary,
    image: story.metaImage || story.thumbnail,
    author: {
      "@type": "Person",
      name: story.author,
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
    datePublished: story.dateCreated,
    dateModified: story.lastUpdated || story.dateCreated,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://herimmigranttales.org/stories/${story.slug}`,
    },
    keywords: story.primaryKeyword || story.title,
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
        name: "Stories",
        item: "https://herimmigranttales.org/stories",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: story.title,
        item: `https://herimmigranttales.org/stories/${story.slug}`,
      },
    ],
  };

  const faqSchema =
    story.faq && story.faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: story.faq.map((f: any) => ({
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
      articleSchema,
      breadcrumbSchema,
      ...(faqSchema ? [faqSchema] : []),
    ],
  };

  return (
    <>
      {/* Single combined schema using Next.js Script component for proper head placement */}
      <Script
        id="story-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedSchema) }}
        strategy="afterInteractive"
      />

      {/* Pass server data to client component */}
      <StoryDetailsClient story={story} otherStories={otherStories} />
    </>
  );
}
