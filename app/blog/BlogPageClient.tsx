"use client";

import { useState, useEffect } from "react";
import Header from "@/components/headeruser";
import Footer from "@/components/footer";
import { CircleArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useContentStore } from "@/store/store";
import { toast } from "@/components/ui/use-toast";
import { Blog } from "@/types";

const MAX_DESC_LENGTH = 100;

type Props = {
  serverBlogs?: Blog[];
};

const getCategoryColor = (category: string) => {
  const colors = [
    {
      text: "text-purple-600",
      border: "border-purple-600",
      bg: "bg-purple-100",
    },
    { text: "text-green-600", border: "border-green-600", bg: "bg-green-100" },
    { text: "text-blue-600", border: "border-blue-600", bg: "bg-blue-100" },
    {
      text: "text-yellow-600",
      border: "border-yellow-600",
      bg: "bg-yellow-100",
    },
    {
      text: "text-indigo-600",
      border: "border-indigo-600",
      bg: "bg-indigo-100",
    },
    {
      text: "text-emerald-600",
      border: "border-emerald-600",
      bg: "bg-emerald-100",
    },
    { text: "text-red-600", border: "border-red-600", bg: "bg-red-100" },
    { text: "text-pink-600", border: "border-pink-600", bg: "bg-pink-100" },
    { text: "text-teal-600", border: "border-teal-600", bg: "bg-teal-100" },
    {
      text: "text-orange-600",
      border: "border-orange-600",
      bg: "bg-orange-100",
    },
    { text: "text-cyan-600", border: "border-cyan-600", bg: "bg-cyan-100" },
  ];

  // If category is not provided, return the first color
  if (!category) {
    return colors[0];
  }

  // Create a simple hash from the category string to get consistent colors
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    const char = category.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Use absolute value to ensure positive index
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

export default function BlogPage({ serverBlogs }: Props) {
  const { blogs, fetchBlogs } = useContentStore();
  const [visibleCount, setVisibleCount] = useState(6);
  const [loading, setLoading] = useState(
    !serverBlogs || serverBlogs.length === 0
  );
  const [hasClickedLoadMore, setHasClickedLoadMore] = useState(false);
  const [localBlogs, setLocalBlogs] = useState<Blog[]>(
    serverBlogs && serverBlogs.length > 0 ? serverBlogs : blogs
  );

  // Initialize: prefer store data when available, otherwise use serverBlogs
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (blogs.length === 0) {
        if (serverBlogs && serverBlogs.length > 0) {
          setLocalBlogs(serverBlogs);
          if (mounted) setLoading(false);
          return;
        }

        try {
          await fetchBlogs();
        } catch (err) {
          toast({
            title: "Failed to fetch blogs",
            variant: "destructive",
          });
        } finally {
          if (mounted) setLoading(false);
        }
      } else {
        setLocalBlogs(blogs.filter((b: Blog) => b.status === "published"));
        if (mounted) setLoading(false);
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, [serverBlogs, blogs.length, fetchBlogs]);

  const compareByDateDesc = (
    a: { dateCreated?: string },
    b: { dateCreated?: string }
  ) => {
    const ta = a?.dateCreated ? new Date(a.dateCreated).getTime() : 0;
    const tb = b?.dateCreated ? new Date(b.dateCreated).getTime() : 0;
    return tb - ta;
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filteredBlogs = localBlogs
    .filter((blog) => blog.status === "published")
    .sort(compareByDateDesc);
  const featuredBlog = filteredBlogs.find((b) => b.isFeatured);
  const otherBlogs = filteredBlogs
    .filter((b) => !b.isFeatured)
    .slice(0, visibleCount);
  const hasMore =
    visibleCount < filteredBlogs.filter((b) => !b.isFeatured).length;

  // Get featured blog color based on category, with fallback
  const featuredColor = featuredBlog
    ? getCategoryColor(featuredBlog.category)
    : getCategoryColor("Uncategorized");

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 6);
    setHasClickedLoadMore(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-[1440px] mx-auto px-4 py-16">
          {/* Hero section skeleton */}
          <div className="rounded-[50px] overflow-hidden h-[700px] bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 animate-pulse mb-16">
            <div className="p-8 h-full flex flex-col justify-end">
              <div className="max-w-2xl space-y-4">
                <div className="h-6 w-32 bg-white/30 rounded-full"></div>
                <div className="h-12 w-full bg-white/20 rounded-lg"></div>
                <div className="h-12 w-3/4 bg-white/20 rounded-lg"></div>
                <div className="flex gap-4">
                  <div className="h-8 w-24 bg-white/20 rounded-full"></div>
                  <div className="h-4 w-20 bg-white/20 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-white/20 rounded"></div>
                  <div className="h-4 w-2/3 bg-white/20 rounded"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Title skeleton */}
          <div className="h-10 w-64 bg-gray-200 rounded-lg animate-pulse mb-12"></div>

          {/* Grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-6 w-full bg-gray-200 rounded"></div>
                  <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                    <div className="h-4 w-16 bg-gray-200 rounded"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-gray-200 rounded"></div>
                    <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
                    <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      {featuredBlog && (
        <section className="px-4 py-16 max-w-[1440px] mx-auto">
          <Link href={`/blog/${featuredBlog.slug}`}>
            <div
              className="relative rounded-[50px] overflow-hidden h-[700px] bg-cover bg-center"
              style={{
                backgroundImage: `url(${
                  featuredBlog.thumbnail || "/placeholder.svg"
                })`,
              }}
            >
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="relative z-10 p-8 h-full flex flex-col justify-end">
                <div className="flex flex-col md:flex-row justify-between items-end w-full">
                  <div className="flex-1 mb-4 md:mb-0">
                    <div className="inline-block mb-4">
                      <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                        Featured Blog
                      </span>
                    </div>
                    <div className="max-w-2xl">
                      <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                        {featuredBlog.title}
                      </h2>
                      <div className="flex items-center gap-4 mb-4">
                        <span
                          className={`${featuredColor.text} ${featuredColor.border} ${featuredColor.bg} border px-3 py-1 rounded-full text-sm font-medium`}
                        >
                          {featuredBlog.category || "Uncategorized"}
                        </span>
                        <span className="text-white text-sm">
                          {new Date(
                            featuredBlog.dateCreated
                          ).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="text-white/90 text-lg leading-relaxed mb-6">
                        {featuredBlog.summary}
                      </p>
                    </div>
                  </div>
                  <div className="flex-1 flex justify-center md:justify-end">
                    <CircleArrowRight className="w-12 h-12 md:w-24 md:h-24 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </section>
      )}

      <section className="px-4 py-16 max-w-[1440px] mx-auto">
        {filteredBlogs.length > 0 && (
          <h1 className="text-4xl font-bold text-gray-900 mb-12">
            Recent Blogs
          </h1>
        )}
        {filteredBlogs.length === 0 ? (
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-12 flex flex-col items-center text-center">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-[#fff1e6] to-[#fff7ed] mb-6">
              <CircleArrowRight className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold mb-2 text-gray-900">
              No blogs published yet
            </h3>
            <p className="text-gray-500 mb-6 max-w-xl">
              We don't have any published blog posts at the moment. Check back
              later for updates or consider contributing a post to share your
              story.
            </p>
            <div className="flex gap-3">
              <Link
                href="/"
                className="inline-flex items-center px-5 py-3 bg-primary text-white rounded-full hover:bg-primary/80 transition-colors"
              >
                Go to Homepage
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center px-5 py-3 border border-gray-200 rounded-full text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Contact us
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {otherBlogs.map((blog) => {
              const isTruncated =
                blog.summary && blog.summary.length > MAX_DESC_LENGTH;
              const preview = isTruncated
                ? blog.summary.slice(0, MAX_DESC_LENGTH) + "..."
                : blog.summary || "";

              const color = getCategoryColor(blog.category);

              return (
                <Link
                  key={blog.id}
                  href={`/blog/${blog.slug}`}
                  className="group cursor-pointer block"
                >
                  <div className="rounded-2xl transition-shadow duration-300 overflow-hidden h-full">
                    <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-4">
                      <Image
                        width={500}
                        height={375}
                        src={blog.thumbnail || "/placeholder.svg"}
                        alt={blog.title || "Blog post"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-2xl line-clamp-1 font-bold text-gray-900 leading-tight group-hover:text-[#bf5925] transition-colors">
                        {blog.title || "Untitled"}
                      </h3>

                      <div className="flex items-center gap-3">
                        <span
                          className={`${color.text} ${color.border} ${color.bg} border px-3 py-1 rounded-full text-sm font-medium`}
                        >
                          {blog.category || "Uncategorized"}
                        </span>
                        <span className="text-gray-500 text-sm">
                          {new Date(blog.dateCreated).toLocaleDateString(
                            "en-GB",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </div>

                      <p className="text-md text-gray-700 leading-relaxed">
                        {preview}
                      </p>
                      {isTruncated && (
                        <div className="mt-1">
                          <span className="text-blue-600 hover:underline text-sm">
                            See more
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <div className="text-center">
          {hasMore ? (
            <Button
              onClick={handleLoadMore}
              className="bg-[#bf5925] text-white px-8 py-3 rounded-full font-medium hover:bg-[#a04920] transition-colors"
            >
              Load More
            </Button>
          ) : hasClickedLoadMore ? (
            <div className="flex flex-col items-center space-y-2">
              <p className="text-gray-500 text-lg font-medium">
                ✨ You've reached the end!
              </p>
              <p className="text-gray-400 text-sm">
                That's all our latest content for now
              </p>
            </div>
          ) : null}
        </div>
      </section>

      <Footer />
    </div>
  );
}
