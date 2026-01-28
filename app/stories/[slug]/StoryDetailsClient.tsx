"use client";

import { useState, useEffect } from "react";
import Header from "@/components/headeruser";
import Footer from "@/components/footer";
import Image from "next/image";
import Link from "next/link";
import { useContentStore } from "@/store/store";
import { toast } from "@/components/ui/use-toast";
import { Story } from "@/types";
import { ArrowUpRight } from "lucide-react";
import { useParams } from "next/navigation";

// NEW: Props type - receive server data
type Props = {
  story: Story | null;
  otherStories: Story[];
};

// Initialize with server data, but can be updated from store
export default function StoryDetailsClient({
  story: serverStory,
  otherStories: serverOtherStories,
}: Props) {
  const params = useParams<{ slug: string }>();
  const storySlug = params.slug;

  const { stories, fetchStories } = useContentStore();

  // Initialize with server data, but can be updated from store
  const [loading, setLoading] = useState<boolean>(!serverStory);
  const [story, setStory] = useState<Story | null>(serverStory);
  const [otherStories, setOtherStories] = useState<Story[]>(serverOtherStories);

  // Fetch from store if needed (for client-side navigation)
  useEffect(() => {
    const loadStory = async () => {
      // Only fetch if we don't have server data and store is empty
      if (!serverStory && stories.length === 0) {
        try {
          await fetchStories();
        } catch (error) {
          toast({
            title: "Failed to fetch stories",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      } else if (serverStory) {
        // We have server data, no loading needed
        setLoading(false);
      }
    };

    loadStory();
  }, [serverStory, stories.length, fetchStories]);

  // Update from store when available (for client-side navigation)
  useEffect(() => {
    if (stories.length > 0) {
      const currentStory = stories.find((b: Story) => b.slug === storySlug);

      // Only update if we found it in store and don't have server data
      if (currentStory && !serverStory) {
        setStory(currentStory);
      }

      const others = stories
        .filter((b: Story) => b.slug !== storySlug && b.status === "published")
        .slice(0, 3);

      // Only update if we don't have server data
      if (!serverStory || serverOtherStories.length === 0) {
        setOtherStories(others);
      }
    }
  }, [stories, storySlug, serverStory, serverOtherStories]);

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
  if (!story) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Story not found
          </h1>
          <Link href="/stories" className="text-[#bf5925] hover:underline">
            ← Back to stories
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <article className="px-4 py-16 max-w-[1440px] mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <Link href="/stories" className="text-gray-500 hover:text-[#bf5925]">
            Stories
          </Link>
          <span className="mx-2 text-gray-400">›</span>
          <span className="text-gray-900">Story Details</span>
        </nav>

        <div className="rounded-[50px] bg-gray-50 py-12 px-6 md:px-36">
          {/* Story Header */}
          <header className="mb-8">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {story.title}
            </h1>

            <div className="flex items-center gap-4 mb-6">
              <span className="text-gray-500">
                {" "}
                {new Date(story.dateCreated).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <span className="text-gray-500">By {story.author}</span>
            </div>

            {/* Summary */}
            {story.summary && (
              <div className="py-6 rounded-xl mb-8">
                <p className="text-lg text-gray-700 leading-relaxed italic">
                  {story.summary}
                </p>
              </div>
            )}

            {/* Hero Image */}
            {story.thumbnail && (
              <div className="aspect-[16/9] rounded-[50px] overflow-hidden mb-8">
                <Image
                  width={800}
                  height={450}
                  src={story.thumbnail}
                  alt={story.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </header>

          {/* Story Content */}
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
              dangerouslySetInnerHTML={{ __html: story.content?.html || "" }}
            />
          </article>

          {/* Media Content */}
          {story.type === "video" && story.videoUrl ? (
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

                const { embedUrl, platform } = processVideoUrl(story.videoUrl);

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
                        title={story.title}
                      />
                    ) : platform === "instagram" ? (
                      <iframe
                        src={embedUrl}
                        className={getIframeClass()}
                        frameBorder="0"
                        scrolling="no"
                        allowTransparency
                        title={story.title}
                      />
                    ) : platform === "facebook" ? (
                      <iframe
                        src={embedUrl}
                        className={getIframeClass()}
                        frameBorder="0"
                        scrolling="no"
                        allowFullScreen
                        title={story.title}
                      />
                    ) : platform === "tiktok" ? (
                      <iframe
                        src={embedUrl}
                        className={getIframeClass()}
                        frameBorder="0"
                        scrolling="no"
                        allowFullScreen
                        title={story.title}
                      />
                    ) : (
                      <video
                        controls
                        src={story.videoUrl + "#t=0.1"}
                        className="w-full h-full"
                        poster={story.thumbnail || undefined}
                      >
                        Your browser does not support the video element.
                      </video>
                    )}
                  </div>
                );
              })()}
            </div>
          ) : story.type === "video" ? (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Watch Video
              </h2>
              <div className="aspect-video rounded-xl bg-gray-200 flex items-center justify-center">
                <p className="text-gray-500">Video unavailable</p>
              </div>
            </div>
          ) : null}

          {story.type === "audio" && story.audioFile && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Listen to Audio
              </h2>
              <audio controls className="w-full" src={story.audioFile} />
            </div>
          )}
        </div>
      </article>

      {/* Read Other Stories Section */}
      {otherStories.length > 0 && (
        <section className="px-4 py-16">
          <div className="max-w-[1440px] mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12">
              Read Other Stories
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {otherStories.map((otherStory: Story) => {
                const preview =
                  otherStory.summary && otherStory.summary.length > 100
                    ? otherStory.summary.slice(0, 100) + "..."
                    : otherStory.summary || "";

                return (
                  <Link
                    key={otherStory.id}
                    href={`/stories/${otherStory.slug}`}
                    className="group cursor-pointer block bg-white rounded-3xl hover:shadow-xl transition-shadow duration-300 overflow-hidden relative"
                    style={{
                      boxShadow: "0 0 60px 20px rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    <div className="p-4 rounded-3xl overflow-hidden">
                      <Image
                        width={400}
                        height={300}
                        src={otherStory.thumbnail || "/placeholder.svg"}
                        alt={otherStory.title || "Story"}
                        className="w-full h-full rounded-3xl object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <div className="p-6 space-y-3">
                      <h3 className="text-xl font-bold text-gray-900 leading-tight group-hover:text-[#bf5925] transition-colors line-clamp-2">
                        {otherStory.title || "Untitled"}
                      </h3>

                      <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                        {preview}
                      </p>

                      <div className="flex justify-between items-center pt-4">
                        <div className="flex flex-col">
                          <span className="text-gray-500 text-sm">
                            {" "}
                            {new Date(
                              otherStory.dateCreated
                            ).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </span>
                          <span className="text-gray-400 text-xs">
                            By {otherStory.author}
                          </span>
                        </div>
                        <div className="ml-auto p-2 bg-gray-100 rounded-full">
                          <ArrowUpRight className="w-5 h-5 text-black group-hover:text-[#bf5925] transition-colors" />
                        </div>
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
