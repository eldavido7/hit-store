"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useParams } from "next/navigation"
import { useContentStore } from "@/store/store"
import { toast } from "@/components/ui/use-toast"

export default function ViewStoryPage() {
  const params = useParams<{ slug: string }>()
  const storySlug = params.slug
  const { stories, fetchStories } = useContentStore()
  const [loading, setLoading] = useState(true)
  const story = stories.find((b) => b.slug === storySlug)

  useEffect(() => {
    if (stories.length === 0) {
      fetchStories()
        .catch(() => {
          toast({
            title: "Failed to fetch stories",
            variant: "destructive",
          })
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!story) {
    return <div>Story not found</div>
  }

  return (
    <div className="min-h-screen">
      <main className="max-w-[1200px] mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-8">
          <Link href="/dashboard/stories" className="hover:text-[#bf5925]">
            Stories
          </Link>
          <span>&gt;</span>
          <span>Story Details</span>
        </nav>

        {/* Story Header */}
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/dashboard/stories">
              <Button variant="ghost" size="sm" className="hover:bg-gray-100">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Stories
              </Button>
            </Link>
            <Link href={`/dashboard/stories/${story.slug}/edit`}>
              <Button className="bg-primary hover:bg-primary/90">
                Edit Story
              </Button>
            </Link>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            {story.title}
          </h1>
          {/* Story Summary */}
          <div className="mb-8">
            {/* <h2 className="text-2xl font-bold mb-4">Summary</h2> */}
            <p className="leading-relaxed">{story.summary}</p>
          </div>
          <div className="flex items-center gap-4 mb-8">
            <Badge
              variant={story.status === "published" ? "default" : "secondary"}
              className={
                story.status === "published"
                  ? "bg-green-100 text-green-800 hover:bg-green-100"
                  : "bg-orange-100 text-orange-800 hover:bg-orange-100"
              }
            >
              {story.status.charAt(0).toUpperCase() + story.status.slice(1)}
            </Badge>
            <span className="text-gray-500">
              {" "}
              {new Date(story.dateCreated).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            <span className="text-gray-500">
              Type: {story.type.charAt(0).toUpperCase() + story.type.slice(1)}
            </span>
          </div>

          {/* Hero Image */}
          {story.thumbnail && (
            <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-8">
              <Image
                src={story.thumbnail || "/placeholder.svg"}
                alt={story.title}
                width={800}
                height={450}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Video Embed */}
          {story.type === "video" && story.videoUrl ? (
            (() => {
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
                    return "w-full max-w-[540px] mx-auto rounded-2xl overflow-hidden mb-8";
                  case "tiktok":
                    return "w-full max-w-[325px] mx-auto rounded-2xl overflow-hidden mb-8";
                  case "facebook":
                  case "youtube":
                  case "vimeo":
                    return "aspect-video rounded-2xl overflow-hidden mb-8";
                  default:
                    return "aspect-video rounded-2xl overflow-hidden mb-8";
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
            })()
          ) : story.type === "video" ? (
            <div className="aspect-video rounded-2xl bg-gray-200 flex items-center justify-center mb-8">
              <p className="text-gray-500">Video unavailable</p>
            </div>
          ) : null}

          {/* Audio Player */}
          {story.type === "audio" && story.audioFile && (
            <div className="mb-8">
              <audio controls className="w-full">
                <source src={story.audioFile} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
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
      </main>
    </div>
  );
}
