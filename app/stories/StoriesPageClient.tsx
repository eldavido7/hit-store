"use client";

import { useState, useEffect } from "react";
import Header from "@/components/headeruser";
import Footer from "@/components/footer";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useContentStore } from "@/store/store";
import { toast } from "@/components/ui/use-toast";
import { Story } from "@/types";

const MAX_DESC_LENGTH = 100;

type Props = {
  serverStories?: Story[];
};

export default function StoriesPage({ serverStories }: Props) {
  const { stories, fetchStories } = useContentStore();
  const [visibleCount, setVisibleCount] = useState(6);
  const [loading, setLoading] = useState(
    !serverStories || serverStories.length === 0
  );
  const [hasClickedLoadMore, setHasClickedLoadMore] = useState<boolean>(false);
  const [localStories, setLocalStories] = useState<Story[]>(
    serverStories && serverStories.length > 0 ? serverStories : stories
  );

  // Initialize: prefer store data when available, otherwise use serverStories
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (stories.length === 0) {
        if (serverStories && serverStories.length > 0) {
          setLocalStories(serverStories);
          if (mounted) setLoading(false);
          return;
        }

        try {
          await fetchStories();
        } catch (err) {
          toast({
            title: "Failed to fetch stories",
            variant: "destructive",
          });
        } finally {
          if (mounted) setLoading(false);
        }
      } else {
        setLocalStories(stories.filter((s: Story) => s.status === "published"));
        if (mounted) setLoading(false);
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, [serverStories, stories.length, fetchStories]);

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
  // Remove the date filter that's too restrictive - just filter by published status
  const filteredStories = localStories
    .filter((story) => story.status === "published")
    .sort(compareByDateDesc);
  const featuredStory = filteredStories.find((s: Story) => s.isFeatured);
  const otherStories = filteredStories
    .filter((s: Story) => !s.isFeatured)
    .slice(0, visibleCount);
  const hasMore =
    visibleCount < filteredStories.filter((s: Story) => !s.isFeatured).length;

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

      {/* Hero Section with Text */}
      <section className="px-4 py-16 max-w-[1440px] mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-cormorant text-[#353336] mb-6 leading-tight">
          Discover the Voices of <br />{" "}
          <span className="text-[#bf5925] italic">Immigrant Women </span>
          Worldwide
        </h1>
        <p className="text-lg text-[#353336] mb-8 max-w-2xl mx-auto leading-relaxed">
          Every journey is different, shaped by unique challenges and triumphs,
          but every story holds power, purpose, and the ability to inspire
          change.
        </p>
      </section>

      {/* Featured Story Section */}
      {featuredStory && (
        <section className="bg-black px-4 py-16">
          <div className="max-w-[1440px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left side - Image */}
              <div className="aspect-[4/3] rounded-2xl overflow-hidden">
                <Image
                  width={600}
                  height={450}
                  src={featuredStory.thumbnail || "/placeholder.svg"}
                  alt={featuredStory.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Right side - Content */}
              <div className="text-white">
                <div className="inline-block mb-4">
                  <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
                    Featured Story
                  </span>
                </div>

                <h2 className="text-3xl font-bold mb-4 leading-tight">
                  {featuredStory.title}
                </h2>

                <p className="text-gray-300 mb-4">by {featuredStory.author}</p>

                <p className="text-white/90 text-lg leading-relaxed mb-8">
                  {featuredStory.summary}
                </p>

                <Link href={`/stories/${featuredStory.slug}`}>
                  <Button className="bg-white text-gray-900 hover:bg-gray-100 px-6 py-3 rounded-full font-medium inline-flex items-center gap-2">
                    Read full story
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Recent Stories Section */}
      <section className="px-4 py-16 mx-auto bg-gray-100">
        <div className="max-w-[1440px] mx-auto">
          {filteredStories.length > 0 && (
            <h2 className="text-3xl font-bold text-gray-900 mb-12">
              Recent Stories
            </h2>
          )}
          {filteredStories.length === 0 ? (
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-12 flex flex-col items-center text-center">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-[#fff1e6] to-[#fff7ed] mb-6">
                <ArrowRight className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-2 text-gray-900">
                No stories available
              </h3>
              <p className="text-gray-500 mb-6 max-w-xl">
                There are no published stories right now. We're working on
                curating voices from the community — check back soon or share
                your story with us.
              </p>
              <div className="flex gap-3">
                <Link
                  href="/"
                  className="inline-flex items-center px-5 py-3 bg-primary text-white rounded-full hover:bg-primary/80 transition-colors"
                >
                  Visit Homepage
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center px-5 py-3 border border-gray-200 rounded-full text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Share your story
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {otherStories.map((story: Story) => {
                const isTruncated =
                  story.summary && story.summary.length > MAX_DESC_LENGTH;
                const preview = isTruncated
                  ? story.summary.slice(0, MAX_DESC_LENGTH) + "..."
                  : story.summary || "";

                return (
                  <Link
                    key={story.id}
                    href={`/stories/${story.slug}`}
                    className="group cursor-pointer block"
                  >
                    <div className="bg-white rounded-3xl hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                      <div className="p-4 rounded-3xl overflow-hidden">
                        <Image
                          width={500}
                          height={375}
                          src={story.thumbnail || "/placeholder.svg"}
                          alt={story.title}
                          className="w-full h-full rounded-3xl object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      <div className="p-6 space-y-3">
                        <h3 className="text-xl line-clamp-1 font-bold text-gray-900 leading-tight group-hover:text-[#bf5925] transition-colors">
                          {story.title || "Untitled"}
                        </h3>

                        <p className="text-sm text-gray-700 leading-relaxed">
                          {preview}
                          {isTruncated && (
                            <span className="text-blue-600 hover:underline text-sm">
                              {" "}
                              See more
                            </span>
                          )}
                        </p>

                        <div className="flex items-center gap-3">
                          <span className="text-gray-500 text-sm">
                            {" "}
                            {new Date(story.dateCreated).toLocaleDateString(
                              "en-GB",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              }
                            )}
                          </span>
                          <span className="text-gray-400 text-sm">
                            By {story.author}
                          </span>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                          <div className="ml-auto p-2 bg-gray-100 rounded-full">
                            <ArrowUpRight className="w-5 h-5 text-black group-hover:text-[#bf5925] transition-colors" />
                          </div>
                        </div>
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
                  That's all our latest stories for now
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
