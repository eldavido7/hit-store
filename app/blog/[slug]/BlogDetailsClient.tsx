"use client";

import { useState, useEffect } from "react";
import Header from "@/components/headeruser";
import Footer from "@/components/footer";
import Image from "next/image";
import Link from "next/link";
import { useContentStore } from "@/store/store";
import { toast } from "@/components/ui/use-toast";
import { Blog } from "@/types";
import { useParams } from "next/navigation";

const MAX_DESC_LENGTH = 100;

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

  if (!category) {
    return colors[0];
  }

  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    const char = category.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

// NEW: Props type - receive server data
type Props = {
  blog: Blog | null;
  otherBlogs: Blog[];
};

// Initialize with server data, but can be updated from store
export default function BlogDetailsClient({
  blog: serverBlog,
  otherBlogs: serverOtherBlogs,
}: Props) {
  const params = useParams<{ slug: string }>();
  const blogSlug = params.slug;

  const { blogs, fetchBlogs } = useContentStore();

  // Initialize with server data, but can be updated from store
  const [loading, setLoading] = useState<boolean>(!serverBlog);
  const [blog, setBlog] = useState<Blog | null>(serverBlog);
  const [otherBlogs, setOtherBlogs] = useState<Blog[]>(serverOtherBlogs);

  // Fetch from store if needed (for client-side navigation)
  useEffect(() => {
    const loadBlog = async () => {
      // Only fetch if we don't have server data and store is empty
      if (!serverBlog && blogs.length === 0) {
        try {
          await fetchBlogs();
        } catch (error) {
          toast({
            title: "Failed to fetch blogs",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      } else if (serverBlog) {
        // We have server data, no loading needed
        setLoading(false);
      }
    };

    loadBlog();
  }, [serverBlog, blogs.length, fetchBlogs]);

  // Update from store when available (for client-side navigation)
  useEffect(() => {
    if (blogs.length > 0) {
      const currentBlog = blogs.find((b: Blog) => b.slug === blogSlug);

      // Only update if we found it in store and don't have server data
      if (currentBlog && !serverBlog) {
        setBlog(currentBlog);
      }

      const others = blogs
        .filter((b: Blog) => b.slug !== blogSlug && b.status === "published")
        .slice(0, 3);

      // Only update if we don't have server data
      if (!serverBlog || serverOtherBlogs.length === 0) {
        setOtherBlogs(others);
      }
    }
  }, [blogs, blogSlug, serverBlog, serverOtherBlogs]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-gray-500">Loading...</div>
        </div>
        <Footer />
      </div>
    );
  }

  // Not found state
  if (!blog) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Blog not found
          </h1>
          <Link href="/blog" className="text-[#bf5925] hover:underline">
            ← Back to blogs
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const color = getCategoryColor(blog.category);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-[1200px] mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <Link href="/blog" className="hover:text-[#bf5925]">
            Blog
          </Link>
          <span>&gt;</span>
          <span>Blog Details</span>
        </nav>

        {/* Blog Header */}
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {blog.title}
          </h1>

          <div className="flex items-center gap-4 mb-6">
            <span
              className={`${color.text} ${color.border} ${color.bg} border px-3 py-1 rounded-full text-sm font-medium`}
            >
              {blog.category || "Uncategorized"}
            </span>
            <span className="text-gray-500">
              {" "}
              {new Date(blog.dateCreated).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            <span className="text-gray-500">By {blog.author}</span>
          </div>

          {/* Summary */}
          {blog.summary && (
            <div className="py-6 rounded-xl mb-8">
              <p className="text-lg text-gray-700 leading-relaxed italic">
                {blog.summary}
              </p>
            </div>
          )}

          {/* Hero Image */}
          {blog.thumbnail && (
            <div className="aspect-[16/9] rounded-[50px] overflow-hidden mb-8">
              <Image
                src={blog.thumbnail}
                alt={blog.title}
                width={800}
                height={450}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </header>

        {/* Blog Content */}
        <article
          className="prose prose-lg max-w-none 
  [&_ul]:list-disc [&_ul]:ml-6 
  [&_ol]:list-decimal [&_ol]:ml-6 
  [&_li]:my-1 
  [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600 
  [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:my-4 
  [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:my-3 
  [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:my-3
  [&_h4]:text-base [&_h4]:font-semibold [&_h4]:my-2
  [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono
  [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-4
  [&_a]:text-blue-600 [&_a]:underline [&_a]:hover:text-blue-800
  [&_div:has(>a>img)]:border-2 [&_div:has(>a>img)]:border-blue-200 [&_div:has(>a>img)]:rounded-lg [&_div:has(>a>img)]:p-3 [&_div:has(>a>img)]:bg-blue-50/50 [&_div:has(>a>img)]:my-4
  [&_a:has(img)]:block [&_a:has(img)]:no-underline
  [&_a:has(img)_div]:mt-2 [&_a:has(img)_div]:text-sm [&_a:has(img)_div]:text-blue-600
  [&_table]:w-full [&_table]:border-collapse [&_table]:my-4
  [&_table_th]:border [&_table_th]:border-gray-300 [&_table_th]:bg-gray-100 [&_table_th]:px-3 [&_table_th]:py-2 [&_table_th]:text-left [&_table_th]:font-semibold
  [&_table_td]:border [&_table_td]:border-gray-300 [&_table_td]:px-3 [&_table_td]:py-2
  [&_table_tr]:hover:bg-gray-50"
        >
          <div
            className="mb-8 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: blog.content?.html || "" }}
          />
        </article>

        {/* Media Content */}
        {blog.type === "video" && blog.videoUrl ? (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Watch Video
            </h2>
            {(() => {
              const processVideoUrl = (url: string) => {
                if (url.includes("youtube.com") || url.includes("youtu.be")) {
                  const videoId =
                    url.split("v=")[1]?.split("&")[0] ||
                    url.split("youtu.be/")[1]?.split("?")[0];
                  return {
                    embedUrl: `https://www.youtube.com/embed/${videoId}`,
                    platform: "youtube",
                  };
                } else if (url.includes("vimeo.com")) {
                  const videoId = url.split("vimeo.com/")[1]?.split("?")[0];
                  return {
                    embedUrl: `https://player.vimeo.com/video/${videoId}`,
                    platform: "vimeo",
                  };
                } else if (
                  url.includes("instagram.com/p/") ||
                  url.includes("instagram.com/reel/")
                ) {
                  const match = url.match(/\/(p|reel)\/([A-Za-z0-9_-]+)/);
                  if (match) {
                    return {
                      embedUrl: `https://www.instagram.com/p/${match[2]}/embed`,
                      platform: "instagram",
                    };
                  }
                } else if (
                  url.includes("facebook.com") ||
                  url.includes("fb.watch")
                ) {
                  const encodedUrl = encodeURIComponent(url);
                  return {
                    embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodedUrl}&show_text=false&width=560`,
                    platform: "facebook",
                  };
                } else if (url.includes("tiktok.com")) {
                  const match = url.match(/tiktok\.com\/.*\/video\/(\d+)/);
                  if (match) {
                    return {
                      embedUrl: `https://www.tiktok.com/embed/v2/${match[1]}`,
                      platform: "tiktok",
                    };
                  }
                }
                return { embedUrl: "", platform: "upload" };
              };

              const { embedUrl, platform } = processVideoUrl(blog.videoUrl);

              const getContainerClass = () => {
                switch (platform) {
                  case "instagram":
                    return "w-full max-w-[540px] mx-auto rounded-xl overflow-hidden";
                  case "tiktok":
                    return "w-full max-w-[325px] mx-auto rounded-xl overflow-hidden";
                  case "facebook":
                  case "youtube":
                  case "vimeo":
                    return "aspect-video rounded-xl overflow-hidden";
                  default:
                    return "aspect-video rounded-xl overflow-hidden";
                }
              };

              const getIframeClass = () => {
                if (platform === "instagram") return "w-full h-[600px]";
                if (platform === "tiktok") return "w-full h-[740px]";
                return "w-full h-full";
              };

              return (
                <div className={getContainerClass()}>
                  {platform === "youtube" || platform === "vimeo" ? (
                    <iframe
                      src={embedUrl}
                      className={getIframeClass()}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={blog.title}
                    />
                  ) : platform === "instagram" ? (
                    <iframe
                      src={embedUrl}
                      className={getIframeClass()}
                      frameBorder="0"
                      scrolling="no"
                      allowTransparency
                      title={blog.title}
                    />
                  ) : platform === "facebook" ? (
                    <iframe
                      src={embedUrl}
                      className={getIframeClass()}
                      frameBorder="0"
                      scrolling="no"
                      allowFullScreen
                      title={blog.title}
                    />
                  ) : platform === "tiktok" ? (
                    <iframe
                      src={embedUrl}
                      className={getIframeClass()}
                      frameBorder="0"
                      scrolling="no"
                      allowFullScreen
                      title={blog.title}
                    />
                  ) : (
                    <video
                      controls
                      src={blog.videoUrl + "#t=0.1"}
                      className="w-full h-full"
                      poster={blog.thumbnail || undefined}
                    >
                      Your browser does not support the video element.
                    </video>
                  )}
                </div>
              );
            })()}
          </div>
        ) : blog.type === "video" ? (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Watch Video
            </h2>
            <div className="aspect-video rounded-xl bg-gray-200 flex items-center justify-center">
              <p className="text-gray-500">Video unavailable</p>
            </div>
          </div>
        ) : null}

        {blog.type === "audio" && blog.audioFile && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Listen to Audio
            </h2>
            <audio controls className="w-full" src={blog.audioFile} />
          </div>
        )}

        {/* FAQ Section (if exists) */}
        {blog.faq && blog.faq.length > 0 && (
          <div className="mb-8 mt-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {blog.faq.map((faqItem: any, index: number) => (
                <div key={index} className="border-l-4 border-[#bf5925] pl-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {faqItem.question}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {faqItem.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Read Other Blogs Section */}
      {otherBlogs.length > 0 && (
        <section className="py-16 px-6">
          <div className="max-w-[1200px] mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Read Other Blogs
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {otherBlogs.map((otherBlog: Blog) => {
                const isTruncated =
                  otherBlog.summary &&
                  otherBlog.summary.length > MAX_DESC_LENGTH;
                const preview = isTruncated
                  ? otherBlog.summary.slice(0, MAX_DESC_LENGTH) + "..."
                  : otherBlog.summary || "";

                const otherColor = getCategoryColor(otherBlog.category);

                return (
                  <Link
                    key={otherBlog.id}
                    href={`/blog/${otherBlog.slug}`}
                    className="group cursor-pointer block"
                  >
                    <div className="bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-300">
                      <div className="aspect-[4/3] overflow-hidden">
                        <Image
                          width={500}
                          height={375}
                          src={otherBlog.thumbnail || "/placeholder.svg"}
                          alt={otherBlog.title || "Blog post"}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      <div className="p-6 space-y-3">
                        <h3 className="text-xl font-bold text-gray-900 leading-tight group-hover:text-[#bf5925] transition-colors line-clamp-2">
                          {otherBlog.title || "Untitled"}
                        </h3>

                        <div className="flex items-center gap-3">
                          <span
                            className={`${otherColor.text} ${otherColor.border} ${otherColor.bg} border px-3 py-1 rounded-full text-sm font-medium`}
                          >
                            {otherBlog.category || "Uncategorized"}
                          </span>
                          <span className="text-gray-500 text-sm">
                            {" "}
                            {new Date(otherBlog.dateCreated).toLocaleDateString(
                              "en-GB",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              }
                            )}
                          </span>
                        </div>

                        <p className="text-gray-700 leading-relaxed line-clamp-3">
                          {preview}
                        </p>
                        {isTruncated && (
                          <div className="mt-2">
                            <span className="text-[#bf5925] hover:underline text-sm font-medium">
                              Read more →
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
