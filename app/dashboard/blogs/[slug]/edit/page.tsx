"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useContentStore, useAuthStore } from "@/store/store";
import { toast } from "@/components/ui/use-toast";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Blog } from "@/types";

const FAQItem = ({
  item,
  onQuestionChange,
  onAnswerChange,
  onRemove,
}: {
  item: { id: string; question: string; answer: string };
  onQuestionChange: (v: string) => void;
  onAnswerChange: (v: string) => void;
  onRemove: () => void;
}) => (
  <div className="flex gap-3 items-start border-b pb-4 mb-4">
    <div className="flex-1 space-y-3">
      <Input
        placeholder="Question"
        value={item.question}
        onChange={(e) => onQuestionChange(e.target.value)}
      />
      <Textarea
        placeholder="Answer"
        value={item.answer}
        rows={3}
        onChange={(e) => onAnswerChange(e.target.value)}
      />
    </div>
    <Button
      variant="ghost"
      size="sm"
      onClick={onRemove}
      className="text-red-600"
    >
      Remove
    </Button>
  </div>
);

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const blogSlug = params.slug;
  const { blogs, fetchBlogs, updateBlog } = useContentStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    summary: "",
    content: { html: "" } as Record<string, any>,
    category: "",
    type: "text" as "text" | "video" | "audio",
    videoUrl: "",
    videoPreview: "",
    audioFile: "",
    thumbnail: "",
    // SEO + extra
    metaTitle: "",
    metaDescription: "",
    metaImage: "",
    primaryKeyword: "",
    faq: [] as { id: string; question: string; answer: string }[],
  });
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const lastLoadedSlug = useRef<string | null>(null);

  const blogCategories = [
    "Technology",
    "Lifestyle",
    "Education",
    "Health",
    "Business",
  ];

  // helpers & edit-tracking
  const uid = () => Math.random().toString(36).slice(2, 9);
  const [slugEdited, setSlugEdited] = useState(false);
  const [metaTitleEdited, setMetaTitleEdited] = useState(false);
  const [metaDescriptionEdited, setMetaDescriptionEdited] = useState(false);
  const [metaImageEdited, setMetaImageEdited] = useState(false);

  const generateMetaTitle = (t: string) => t || "";
  const generateMetaDescription = (s: string) => {
    const desc = (s || "").trim();
    return desc.length > 160 ? desc.slice(0, 157) + "..." : desc;
  };
  const generateMetaImage = (img: string) => img || "";

  useEffect(() => {
    const init = async () => {
      // If we already loaded this slug once, don't overwrite local edits
      if (lastLoadedSlug.current === blogSlug) {
        setLoading(false);
        return;
      }

      // If no blogs yet, ask store to fetch them and wait for the next render
      if (blogs.length === 0) {
        try {
          await fetchBlogs();
        } catch (err) {
          toast({ title: "Failed to fetch blogs", variant: "destructive" });
          setLoading(false);
          return;
        }
        // After fetch, effect will re-run and pick up the blog from the store
        setLoading(false);
        return;
      }

      const blog = blogs.find((b: Blog) => b.slug === blogSlug);
      if (blog) {
        setFormData({
          title: blog.title,
          slug: blog.slug,
          summary: blog.summary,
          content: blog.content,
          category: blog.category,
          type: blog.type,
          videoUrl: blog.videoUrl || "",
          videoPreview: blog.videoUrl || "",
          audioFile: blog.audioFile || "",
          thumbnail: blog.thumbnail || "",
          metaTitle: blog.metaTitle || blog.title || "",
          metaDescription: blog.metaDescription || blog.summary || "",
          metaImage: blog.metaImage || blog.thumbnail || "",
          primaryKeyword: blog.primaryKeyword || "",
          faq: (blog.faq || []).map((f: any) => ({
            id: f.id || uid(),
            question: f.question || "",
            answer: f.answer || "",
          })),
        });
        lastLoadedSlug.current = blogSlug;
      }
      setLoading(false);
    };

    init();
  }, [blogs, blogSlug, fetchBlogs]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleContentChange = (newContent: Record<string, any>) => {
    setFormData((prev) => ({ ...prev, content: newContent }));
  };

  // Inline handlers to mirror create page behavior
  const handleTitleChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: !slugEdited ? generateSlug(val) : prev.slug,
      metaTitle: !metaTitleEdited ? generateMetaTitle(val) : prev.metaTitle,
    }));
  };

  const handleSummaryChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      summary: val,
      metaDescription: !metaDescriptionEdited
        ? generateMetaDescription(val)
        : prev.metaDescription,
    }));
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleAudioUpload = () => {
    audioInputRef.current?.click();
  };

  const handleThumbnailChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (PNG or JPG).",
        variant: "destructive",
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }
    setIsUploadingThumbnail(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/upload/blogs", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Upload failed");
      const { url } = await response.json();
      setFormData((prev) => ({
        ...prev,
        thumbnail: url,
        metaImage: !metaImageEdited ? generateMetaImage(url) : prev.metaImage,
      }));
      toast({ title: "Thumbnail uploaded", description: "Upload successful." });
    } catch (error) {
      console.error("[UPLOAD_THUMBNAIL]", error);
      toast({
        title: "Upload failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingThumbnail(false);
    }
  };

  const handleAudioChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("audio/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an audio file (MP3, WAV).",
        variant: "destructive",
      });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an audio file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }
    setIsUploadingAudio(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/upload/blogs", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Upload failed");
      const { url } = await response.json();
      setFormData((prev) => ({ ...prev, audioFile: url }));
      toast({ title: "Audio uploaded", description: "Upload successful." });
    } catch (error) {
      console.error("[UPLOAD_AUDIO]", error);
      toast({
        title: "Upload failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingAudio(false);
    }
  };

  const handleVideoUpload = () => {
    videoInputRef.current?.click();
  };

  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast({
        title: "Invalid file type",
        description: "Please select a video file (MP4, MOV, AVI, etc.).",
        variant: "destructive",
      });
      return;
    }

    // Enforce 100MB limit (Cloudinary free plan)
    if (file.size > 100 * 1024 * 1024) {
      toast({
        title: "File too large",
        description:
          "Please select a video file smaller than 100MB (Cloudinary free plan limit).",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingVideo(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Create XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(percentComplete);
        }
      });

      const uploadPromise = new Promise((resolve, reject) => {
        xhr.addEventListener("load", () => {
          if (xhr.status === 200) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error("Upload failed"));
          }
        });

        xhr.addEventListener("error", () => reject(new Error("Upload failed")));
        xhr.addEventListener("abort", () =>
          reject(new Error("Upload cancelled"))
        );
      });

      xhr.open("POST", "/api/upload/blogs");
      xhr.send(formData);

      const response: any = await uploadPromise;

      // Update formData with new video URL
      setFormData((prev) => ({
        ...prev,
        videoUrl: response.url,
        videoPreview: response.url,
      }));

      toast({
        title: "Video uploaded",
        description: "Upload successful.",
      });
    } catch (error) {
      console.error("[UPLOAD_VIDEO]", error);
      toast({
        title: "Upload failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingVideo(false);
      setUploadProgress(0);
    }
  };

  const handleVideoUrlChange = (url: string) => {
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
      } else if (url.includes("facebook.com") || url.includes("fb.watch")) {
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

    const { embedUrl } = processVideoUrl(url);
    setFormData((prev) => ({
      ...prev,
      videoUrl: url,
      videoPreview: embedUrl || url,
    }));
  };

  // FAQ helpers (stable ids + immutable updates)
  const updateFaqQuestion = (id: string, question: string) => {
    setFormData((prev) => ({
      ...prev,
      faq: prev.faq.map((f) => (f.id === id ? { ...f, question } : f)),
    }));
  };

  const updateFaqAnswer = (id: string, answer: string) => {
    setFormData((prev) => ({
      ...prev,
      faq: prev.faq.map((f) => (f.id === id ? { ...f, answer } : f)),
    }));
  };

  const removeFaq = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      faq: prev.faq.filter((f) => f.id !== id),
    }));
  };

  const handleSubmit = async (status: "published" | "draft") => {
    if (!user) {
      toast({
        title: "Please log in to update a blog",
        variant: "destructive",
      });
      return;
    }
    if (
      !formData.title ||
      !formData.summary ||
      !formData.category ||
      Object.keys(formData.content).length === 0
    ) {
      toast({
        title: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    if (!formData.slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formData.slug)) {
      toast({
        title: "Invalid slug format",
        description: "Use lowercase letters, numbers, and hyphens only.",
        variant: "destructive",
      });
      return;
    }
    const setLoading = status === "draft" ? setIsSavingDraft : setIsPublishing;
    setLoading(true);
    try {
      const updatedBlog: Partial<Blog> = {
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        summary: formData.summary.trim(),
        content: formData.content,
        category: formData.category.trim(),
        type: formData.type,
        videoUrl: formData.type === "video" ? formData.videoUrl : undefined,
        audioFile: formData.type === "audio" ? formData.audioFile : undefined,
        thumbnail: formData.thumbnail || undefined,
        metaTitle: (formData.metaTitle || "").trim() || undefined,
        metaDescription: (formData.metaDescription || "").trim() || undefined,
        metaImage: formData.metaImage || undefined,
        primaryKeyword: (formData.primaryKeyword || "").trim() || undefined,
        faq:
          formData.faq && formData.faq.length > 0
            ? formData.faq.map((f) => ({
                question: f.question.trim(),
                answer: f.answer.trim(),
              }))
            : undefined,
        status,
      };
      await updateBlog(blogSlug, updatedBlog);
      toast({
        title: `Blog ${
          status === "published" ? "updated and published" : "saved as draft"
        } successfully`,
        variant: "default",
      });
      router.push("/dashboard/blogs");
    } catch (error) {
      console.error("[UPDATE_BLOG]", error);
      toast({ title: "Failed to update blog", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!blogs.find((b: Blog) => b.slug === blogSlug)) {
    return <div>Blog not found</div>;
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto md:px-20">
        {/* Header */}
        <div className="flex items-center gap-4 md:pl-6">
          <Link href="/dashboard/blogs">
            <Button variant="ghost" size="sm" className="hover:bg-gray-100">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold ">Edit Blog</h1>
        </div>

        <div className="rounded-lg shadow-sm md:p-8 p-2">
          <div className="space-y-6">
            {/* Blog Title */}
            <div>
              <Label htmlFor="title" className="text-sm font-medium mb-2 block">
                Blog Title
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Blog Slug */}
            <div>
              <Label htmlFor="slug" className="text-sm font-medium mb-2 block">
                Slug
              </Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, slug: e.target.value }));
                  setSlugEdited(true);
                }}
                placeholder="Enter blog slug"
                className="w-full"
                disabled={
                  isSavingDraft ||
                  isPublishing ||
                  isUploadingThumbnail ||
                  isUploadingAudio
                }
              />
            </div>

            {/* Blog Summary */}
            <div>
              <Label
                htmlFor="summary"
                className="text-sm font-medium mb-2 block"
              >
                Blog Summary/Abstract
              </Label>
              <Textarea
                id="summary"
                value={formData.summary}
                onChange={(e) => handleSummaryChange(e.target.value)}
                className="w-full h-24 resize-none"
              />
            </div>

            {/* Category */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Category
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {blogCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* SEO Settings */}
            <div className="space-y-6 pt-8 border-t">
              <h2 className="text-xl font-semibold">SEO Settings</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Meta Title (recommended: 50–60 chars)</Label>
                  <Input
                    value={formData.metaTitle}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        metaTitle: e.target.value,
                      }));
                      setMetaTitleEdited(true);
                    }}
                    placeholder="Same as blog title by default"
                    maxLength={70}
                  />
                  <p className="text-sm text-muted-foreground">
                    {formData.metaTitle.length}/70
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>
                    Primary Keywords (optional, comma spaced; i.e. keyword1,
                    keyword2...)
                  </Label>
                  <Input
                    value={formData.primaryKeyword}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        primaryKeyword: e.target.value,
                      }))
                    }
                    placeholder="e.g. immigrant women health"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Meta Description (recommended: 150–160 chars)</Label>
                <Textarea
                  value={formData.metaDescription}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      metaDescription: e.target.value,
                    }));
                    setMetaDescriptionEdited(true);
                  }}
                  placeholder="Auto-filled from summary"
                  rows={3}
                  maxLength={320}
                />
                <p className="text-sm text-muted-foreground">
                  {formData.metaDescription.length}/320
                </p>
              </div>

              <div className="space-y-2">
                <Label>Social Share Image (OG Image)</Label>
                <Input
                  value={formData.metaImage}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      metaImage: e.target.value,
                    }));
                    setMetaImageEdited(true);
                  }}
                  placeholder="Defaults to thumbnail"
                />
                {formData.metaImage && (
                  <img
                    src={formData.metaImage}
                    alt="OG preview"
                    className="w-full max-w-md rounded border"
                  />
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>
                    FAQ Schema (optional but great for rich results)
                  </Label>
                  <Button
                    size="sm"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        faq: [
                          ...prev.faq,
                          { id: uid(), question: "", answer: "" },
                        ],
                      }))
                    }
                  >
                    + Add FAQ
                  </Button>
                </div>
                {formData.faq.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No FAQs added yet
                  </p>
                ) : (
                  formData.faq.map((item) => (
                    <FAQItem
                      key={item.id}
                      item={item}
                      onQuestionChange={(value) =>
                        updateFaqQuestion(item.id, value)
                      }
                      onAnswerChange={(value) =>
                        updateFaqAnswer(item.id, value)
                      }
                      onRemove={() => removeFaq(item.id)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Upload Thumbnail */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Upload Thumbnail
              </Label>
              {formData.thumbnail ? (
                <div className="mb-4">
                  <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
                    <img
                      src={formData.thumbnail}
                      alt="Thumbnail preview"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 bg-red-500 hover:bg-red-600"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, thumbnail: "" }))
                      }
                      disabled={
                        isSavingDraft ||
                        isPublishing ||
                        isUploadingThumbnail ||
                        isUploadingAudio
                      }
                    >
                      ×
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 mb-2">
                    Upload your files, JPG or PNG format, we recommend 1024 x
                    1024
                  </p>
                  <p className="text-xs text-gray-400 mb-4">
                    Drag file or browse
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-app-primary text-white border-app-primary hover:bg-orange-600"
                    onClick={handleFileUpload}
                    disabled={
                      isSavingDraft ||
                      isPublishing ||
                      isUploadingThumbnail ||
                      isUploadingAudio
                    }
                  >
                    {isUploadingThumbnail ? "Uploading..." : "Browse Files"}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    title="thumbnail"
                    onChange={handleThumbnailChange}
                  />
                </div>
              )}
            </div>

            {/* Blog Type */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Blog Type
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value: string) =>
                  setFormData((prev) => ({
                    ...prev,
                    type: value as "text" | "video" | "audio",
                  }))
                }
                disabled={
                  isSavingDraft ||
                  isPublishing ||
                  isUploadingThumbnail ||
                  isUploadingAudio
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Conditional Video URL Input */}
            {formData.type === "video" && (
              <div>
                <Label
                  htmlFor="videoUrl"
                  className="text-sm font-medium text-gray-700 mb-2 block"
                >
                  Video URL or Upload
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="videoUrl"
                    value={formData.videoUrl}
                    onChange={(e) => handleVideoUrlChange(e.target.value)}
                    placeholder="Enter YouTube, Vimeo, Instagram, Facebook, or TikTok URL, or upload below"
                    className="flex-1"
                    disabled={
                      isSavingDraft ||
                      isPublishing ||
                      isUploadingThumbnail ||
                      isUploadingAudio ||
                      isUploadingVideo
                    }
                  />
                  {formData.videoUrl && (
                    <Button
                      variant="destructive"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          videoUrl: "",
                          videoPreview: "",
                        }))
                      }
                      className="bg-red-500 hover:bg-red-600"
                      disabled={
                        isSavingDraft ||
                        isPublishing ||
                        isUploadingThumbnail ||
                        isUploadingAudio ||
                        isUploadingVideo
                      }
                    >
                      Remove
                    </Button>
                  )}
                </div>

                {/* Video Upload Section */}
                <div className="mt-4 space-y-4">
                  <Label>Or Upload Video File</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      Upload video file (MP4, MOV, AVI, etc.) - Up to 100MB
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 bg-app-primary text-white border-app-primary hover:bg-orange-600"
                      onClick={handleVideoUpload}
                      disabled={
                        isSavingDraft ||
                        isPublishing ||
                        isUploadingThumbnail ||
                        isUploadingAudio ||
                        isUploadingVideo
                      }
                    >
                      {isUploadingVideo
                        ? `Uploading... ${uploadProgress}%`
                        : "Browse Files"}
                    </Button>
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/*"
                      className="hidden"
                      title="video"
                      onChange={handleVideoChange}
                    />

                    {/* Progress Bar */}
                    {isUploadingVideo && (
                      <div className="w-full max-w-md mx-auto mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-app-primary h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1 text-center">
                          {uploadProgress}% uploaded
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Video Preview */}
                {formData.videoUrl && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Play className="w-4 h-4" />
                      <span className="text-sm font-medium">Video Preview</span>
                    </div>
                    {(() => {
                      const processVideoUrl = (url: string) => {
                        if (
                          url.includes("youtube.com") ||
                          url.includes("youtu.be")
                        ) {
                          const videoId =
                            url.split("v=")[1]?.split("&")[0] ||
                            url.split("youtu.be/")[1]?.split("?")[0];
                          return {
                            embedUrl: `https://www.youtube.com/embed/${videoId}`,
                            platform: "youtube",
                          };
                        } else if (url.includes("vimeo.com")) {
                          const videoId = url
                            .split("vimeo.com/")[1]
                            ?.split("?")[0];
                          return {
                            embedUrl: `https://player.vimeo.com/video/${videoId}`,
                            platform: "vimeo",
                          };
                        } else if (
                          url.includes("instagram.com/p/") ||
                          url.includes("instagram.com/reel/")
                        ) {
                          const match = url.match(
                            /\/(p|reel)\/([A-Za-z0-9_-]+)/
                          );
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
                          const match = url.match(
                            /tiktok\.com\/.*\/video\/(\d+)/
                          );
                          if (match) {
                            return {
                              embedUrl: `https://www.tiktok.com/embed/v2/${match[1]}`,
                              platform: "tiktok",
                            };
                          }
                        }
                        return { embedUrl: "", platform: "upload" };
                      };

                      const { embedUrl, platform } = processVideoUrl(
                        formData.videoUrl
                      );

                      const getContainerClass = () => {
                        switch (platform) {
                          case "instagram":
                            return "w-full max-w-[540px] mx-auto rounded overflow-hidden";
                          case "tiktok":
                            return "w-full max-w-[325px] mx-auto rounded overflow-hidden";
                          case "facebook":
                          case "youtube":
                          case "vimeo":
                            return "aspect-video bg-gray-200 rounded overflow-hidden";
                          default:
                            return "aspect-video bg-gray-200 rounded overflow-hidden";
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
                              title="Video preview"
                            />
                          ) : platform === "instagram" ? (
                            <iframe
                              src={embedUrl}
                              className={getIframeClass()}
                              frameBorder="0"
                              scrolling="no"
                              allowTransparency
                              title="Video preview"
                            />
                          ) : platform === "facebook" ? (
                            <iframe
                              src={embedUrl}
                              className={getIframeClass()}
                              frameBorder="0"
                              scrolling="no"
                              allowFullScreen
                              title="Video preview"
                            />
                          ) : platform === "tiktok" ? (
                            <iframe
                              src={embedUrl}
                              className={getIframeClass()}
                              frameBorder="0"
                              scrolling="no"
                              allowFullScreen
                              title="Video preview"
                            />
                          ) : platform === "upload" ? (
                            <video
                              controls
                              src={formData.videoUrl + "#t=0.1"}
                              className="w-full h-full"
                            >
                              Your browser does not support the video element.
                            </video>
                          ) : null}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* Conditional Audio Upload */}
            {formData.type === "audio" && (
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Upload Audio File
                </Label>
                {formData.audioFile ? (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium">
                        Audio File Attached
                      </span>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, audioFile: "" }))
                        }
                        className="bg-red-500 hover:bg-red-600"
                        disabled={
                          isSavingDraft ||
                          isPublishing ||
                          isUploadingThumbnail ||
                          isUploadingAudio
                        }
                      >
                        Remove
                      </Button>
                    </div>
                    <audio controls className="w-full">
                      <source src={formData.audioFile} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      Upload audio file (MP3, WAV)
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 bg-app-primary text-white border-app-primary hover:bg-orange-600"
                      onClick={handleAudioUpload}
                      disabled={
                        isSavingDraft ||
                        isPublishing ||
                        isUploadingThumbnail ||
                        isUploadingAudio
                      }
                    >
                      {isUploadingAudio ? "Uploading..." : "Browse Files"}
                    </Button>
                    <input
                      ref={audioInputRef}
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      title="audio"
                      onChange={handleAudioChange}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Rich Text Editor */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Blog Content
              </Label>
              <div className="border border-gray-300 rounded-lg">
                <RichTextEditor
                  content={formData.content}
                  onChange={handleContentChange}
                  placeholder="Write your blog content here..."
                  disabled={
                    isSavingDraft ||
                    isPublishing ||
                    isUploadingThumbnail ||
                    isUploadingAudio
                  }
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-6">
              <Button
                variant="outline"
                onClick={() => handleSubmit("draft")}
                disabled={
                  isSavingDraft ||
                  isPublishing ||
                  isUploadingThumbnail ||
                  isUploadingAudio
                }
              >
                {isSavingDraft ? "Saving..." : "Save as draft"}
              </Button>
              <Button
                onClick={() => handleSubmit("published")}
                className="bg-app-primary hover:bg-primary/90"
                disabled={
                  isSavingDraft ||
                  isPublishing ||
                  isUploadingThumbnail ||
                  isUploadingAudio
                }
              >
                {isPublishing ? "Updating..." : "Update and Publish"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
