"use client";

import { useState, useRef } from "react";
import { ArrowLeft, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { useContentStore, useAuthStore } from "@/store/store";
import { toast } from "@/components/ui/use-toast";
import { Blog } from "@/types";

const FAQItem = ({
  item,
  onQuestionChange,
  onAnswerChange,
  onRemove,
}: {
  item: { id: string; question: string; answer: string };
  onQuestionChange: (value: string) => void;
  onAnswerChange: (value: string) => void;
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

export default function CreateBlogPage() {
  const router = useRouter();
  const { addBlog } = useContentStore();
  const { user } = useAuthStore();
  const [blogType, setBlogType] = useState<"text" | "video" | "audio">("text");
  const [videoUrl, setVideoUrl] = useState("");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState<Record<string, any>>({});
  const [category, setCategory] = useState("");
  const [author, setAuthor] = useState(user?.name || "");
  const [thumbnail, setThumbnail] = useState("");
  const [audioFile, setAudioFile] = useState("");
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const [videoFile, setVideoFile] = useState("");
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const blogCategories = [
    "Technology",
    "Lifestyle",
    "Education",
    "Health",
    "Business",
  ];

  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaImage, setMetaImage] = useState("");
  const [primaryKeyword, setPrimaryKeyword] = useState("");
  const [faq, setFaq] = useState<
    { id: string; question: string; answer: string }[]
  >([]);

  // Slug and edit-tracking for auto-generated fields
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [metaTitleEdited, setMetaTitleEdited] = useState(false);
  const [metaDescriptionEdited, setMetaDescriptionEdited] = useState(false);
  const [metaImageEdited, setMetaImageEdited] = useState(false);

  // generators for auto-filled fields
  const generateMetaTitle = (t: string) => t || "";
  const generateMetaDescription = (s: string) => {
    const desc = (s || "").trim();
    return desc.length > 160 ? desc.slice(0, 157) + "..." : desc;
  };
  const generateMetaImage = (img: string) => img || "";

  // helper for stable IDs for FAQ items
  const uid = () => Math.random().toString(36).slice(2, 9);

  // Instead of useEffect auto-sync, update auto-filled fields inline in handlers
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slugEdited) setSlug(generateSlug(val));
    if (!metaTitleEdited) setMetaTitle(generateMetaTitle(val));
  };

  const handleSummaryChange = (val: string) => {
    setSummary(val);
    if (!metaDescriptionEdited)
      setMetaDescription(generateMetaDescription(val));
  };

  const handleVideoUrlChange = (url: string) => {
    setVideoUrl(url);

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
      setThumbnail(url);
      if (!metaImageEdited) setMetaImage(generateMetaImage(url));
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
      setAudioFile(url);
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
        description: "Please select a valid video file (MP4, MOV, AVI, etc.).",
        variant: "destructive",
      });
      return;
    }

    // Frontend limit: 100MB (Cloudinary free plan)
    if (file.size > 100 * 1024 * 1024) {
      toast({
        title: "File size out of range",
        description:
          "Please select a video smaller than 100MB (Cloudinary free plan limit).",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingVideo(true);
    setUploadProgress(0);

    try {
      // Prepare FormData for backend
      const formData = new FormData();
      formData.append("file", file);

      // Use XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(percentComplete);
        }
      });

      const uploadPromise = new Promise((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error("Upload failed"));
          }
        };
        xhr.onerror = () => reject(new Error("Upload failed"));
        xhr.onabort = () => reject(new Error("Upload cancelled"));
      });

      xhr.open("POST", "/api/upload/blogs");
      xhr.send(formData);

      const response: any = await uploadPromise;

      // Set uploaded video URL
      setVideoFile(response.url);

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

  function generateSlug(title: string) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  const handleSubmit = async (status: "published" | "draft") => {
    if (!user) {
      toast({
        title: "Please log in to create a blog",
        variant: "destructive",
      });
      return;
    }
    if (!title || !summary || !category || Object.keys(content).length === 0) {
      toast({
        title: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    const setLoading = status === "draft" ? setIsSavingDraft : setIsPublishing;
    setLoading(true);
    try {
      const blog: Omit<
        Blog,
        "id" | "dateCreated" | "lastUpdated" | "isFeatured"
      > = {
        title: title.trim(),
        author: author.trim(),
        summary: summary.trim(),
        content,
        category: category.trim(),
        type: blogType,
        videoUrl: blogType === "video" ? videoFile || videoUrl : undefined,
        audioFile: blogType === "audio" ? audioFile : undefined,
        thumbnail: thumbnail || undefined,
        status,
        slug: (slug || generateSlug(title)).trim(),
        metaTitle: (metaTitle || title).trim(),
        metaDescription: (metaDescription || summary.slice(0, 160)).trim(),
        metaImage: metaImage || thumbnail,
        faq:
          faq.length > 0
            ? faq.filter((f) => f.question && f.answer)
            : undefined,
        primaryKeyword: (primaryKeyword || "").trim() || undefined,
      };
      await addBlog(blog);
      toast({
        title: `Blog ${
          status === "published" ? "published" : "saved as draft"
        } successfully`,
        variant: "default",
      });
      router.push("/dashboard/blogs");
    } catch (error) {
      console.error("[CREATE_BLOG]", error);
      toast({ title: "Failed to create blog", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const updateFaqQuestion = (id: string, question: string) => {
    setFaq((prev) => prev.map((f) => (f.id === id ? { ...f, question } : f)));
  };

  const updateFaqAnswer = (id: string, answer: string) => {
    setFaq((prev) => prev.map((f) => (f.id === id ? { ...f, answer } : f)));
  };

  const removeFaq = (id: string) => {
    setFaq((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="md:px-20 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/blogs">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold text-foreground">Create Blog</h1>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Blog Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Enter blog title"
            className="text-base"
            disabled={
              isUploadingVideo ||
              isUploadingAudio ||
              isUploadingThumbnail ||
              isSavingDraft ||
              isPublishing
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">
            Slug (auto-generated from title — editable)
          </Label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugEdited(true);
            }}
            placeholder="auto-generated-slug"
            className="text-base"
            disabled={
              isUploadingVideo ||
              isUploadingAudio ||
              isUploadingThumbnail ||
              isSavingDraft ||
              isPublishing
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="author">Author</Label>
          <Input
            id="author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Enter author name"
            className="text-base"
            disabled={
              isUploadingVideo ||
              isUploadingAudio ||
              isUploadingThumbnail ||
              isSavingDraft ||
              isPublishing
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="summary">Blog Summary/Abstract</Label>
          <Textarea
            id="summary"
            value={summary}
            onChange={(e) => handleSummaryChange(e.target.value)}
            placeholder="Enter blog summary"
            className="min-h-[100px] text-base"
            disabled={
              isUploadingVideo ||
              isUploadingAudio ||
              isUploadingThumbnail ||
              isSavingDraft ||
              isPublishing
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={category}
            onValueChange={setCategory}
            disabled={
              isUploadingVideo ||
              isUploadingAudio ||
              isUploadingThumbnail ||
              isSavingDraft ||
              isPublishing
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {blogCategories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-6 pt-8 border-t">
          <h2 className="text-xl font-semibold">SEO Settings</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Meta Title (recommended: 50–60 chars)</Label>
              <Input
                value={metaTitle}
                onChange={(e) => {
                  setMetaTitle(e.target.value);
                  setMetaTitleEdited(true);
                }}
                placeholder="Same as blog title by default"
                maxLength={70}
              />
              <p className="text-sm text-muted-foreground">
                {metaTitle.length}/70
              </p>
            </div>

            <div className="space-y-2">
              <Label>
                Primary Keywords (optional, comma spaced; i.e. keyword1,
                keyword2...)
              </Label>
              <Input
                value={primaryKeyword}
                onChange={(e) => setPrimaryKeyword(e.target.value)}
                placeholder="e.g. immigrant women health"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Meta Description (recommended: 150–160 chars)</Label>
            <Textarea
              value={metaDescription}
              onChange={(e) => {
                setMetaDescription(e.target.value);
                setMetaDescriptionEdited(true);
              }}
              placeholder="Auto-filled from summary"
              rows={3}
              maxLength={320}
            />
            <p className="text-sm text-muted-foreground">
              {metaDescription.length}/320
            </p>
          </div>

          <div className="space-y-2">
            <Label>Social Share Image (OG Image)</Label>
            <Input
              value={metaImage}
              onChange={(e) => {
                setMetaImage(e.target.value);
                setMetaImageEdited(true);
              }}
              placeholder="Defaults to thumbnail"
            />
            {metaImage && (
              <img
                src={metaImage}
                alt="OG preview"
                className="w-full max-w-md rounded border"
              />
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>FAQ Schema (optional but great for rich results)</Label>
              <Button
                size="sm"
                onClick={() =>
                  setFaq([...faq, { id: uid(), question: "", answer: "" }])
                }
              >
                + Add FAQ
              </Button>
            </div>
            {faq.map((item) => (
              <FAQItem
                key={item.id}
                item={item}
                onQuestionChange={(value) => updateFaqQuestion(item.id, value)}
                onAnswerChange={(value) => updateFaqAnswer(item.id, value)}
                onRemove={() => removeFaq(item.id)}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Label>Upload Thumbnail</Label>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center bg-muted/10">
            <div className="flex flex-col items-center gap-4">
              <div className="p-3 rounded-full bg-muted">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Upload your files. PNG or JPG format, we recommend 1200x630
                  px.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFileUpload}
                  className="bg-app-primary text-primary-foreground hover:bg-primary/90"
                  disabled={
                    isUploadingVideo ||
                    isUploadingAudio ||
                    isUploadingThumbnail ||
                    isSavingDraft ||
                    isPublishing
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
              {thumbnail && (
                <img
                  src={thumbnail}
                  alt="Thumbnail preview"
                  className="mt-4 h-24 w-24 object-cover rounded"
                />
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="blog-type">Blog Type</Label>
          <Select
            value={blogType}
            onValueChange={(value: string) =>
              setBlogType(value as "text" | "video" | "audio")
            }
            disabled={
              isUploadingVideo ||
              isUploadingAudio ||
              isUploadingThumbnail ||
              isSavingDraft ||
              isPublishing
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

        {blogType === "video" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="video-url">Video URL or Upload</Label>
              <Input
                id="video-url"
                value={videoUrl}
                onChange={(e) => handleVideoUrlChange(e.target.value)}
                placeholder="Enter YouTube, Vimeo, Instagram, Facebook, or TikTok URL, or upload a video below"
                className="text-base"
                disabled={
                  isUploadingVideo ||
                  isUploadingAudio ||
                  isSavingDraft ||
                  isPublishing
                }
              />
            </div>

            {/* Video Upload Section */}
            <div className="space-y-4">
              <Label>Or Upload Video File</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center bg-muted/10">
                <div className="flex flex-col items-center gap-3">
                  <div className="p-2 rounded-full bg-muted">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Upload video file (MP4, MOV, AVI, etc.) - Up to 100MB
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Videos will be automatically optimized and compressed
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleVideoUpload}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                      disabled={
                        isUploadingVideo ||
                        isUploadingAudio ||
                        isSavingDraft ||
                        isPublishing
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
                  </div>

                  {/* Upload Progress Bar */}
                  {isUploadingVideo && (
                    <div className="w-full max-w-md">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-app-primary h-2.5 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 text-center">
                        {uploadProgress}% uploaded
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Video Preview - Shows for both URL and uploaded videos */}
            {(videoUrl || videoFile) && (
              <div className="space-y-2">
                <Label>Video Preview</Label>
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

                  // Use videoFile if available, otherwise use videoUrl
                  const urlToProcess = videoFile || videoUrl;
                  const { embedUrl, platform } = processVideoUrl(urlToProcess);

                  const getContainerClass = () => {
                    switch (platform) {
                      case "instagram":
                        return "w-full max-w-[540px] mx-auto rounded-lg overflow-hidden border";
                      case "tiktok":
                        return "w-full max-w-[325px] mx-auto rounded-lg overflow-hidden border";
                      case "facebook":
                      case "youtube":
                      case "vimeo":
                        return "aspect-video rounded-lg overflow-hidden border";
                      default:
                        return "aspect-video rounded-lg overflow-hidden border";
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
                          title="video-preview"
                          src={embedUrl}
                          className={getIframeClass()}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : platform === "instagram" ? (
                        <iframe
                          title="video-preview"
                          src={embedUrl}
                          className={getIframeClass()}
                          frameBorder="0"
                          scrolling="no"
                          allowTransparency
                        />
                      ) : platform === "facebook" ? (
                        <iframe
                          title="video-preview"
                          src={embedUrl}
                          className={getIframeClass()}
                          frameBorder="0"
                          scrolling="no"
                          allowFullScreen
                        />
                      ) : platform === "tiktok" ? (
                        <iframe
                          title="video-preview"
                          src={embedUrl}
                          className={getIframeClass()}
                          frameBorder="0"
                          scrolling="no"
                          allowFullScreen
                        />
                      ) : platform === "upload" && videoFile ? (
                        <video
                          controls
                          src={videoFile}
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

        {blogType === "audio" && (
          <div className="space-y-4">
            <Label>Upload Audio</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center bg-muted/10">
              <div className="flex flex-col items-center gap-3">
                <div className="p-2 rounded-full bg-muted">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Upload audio file (MP3, WAV, etc.)
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAudioUpload}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={
                      isUploadingAudio ||
                      isSavingDraft ||
                      isPublishing ||
                      isUploadingThumbnail ||
                      isUploadingVideo
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
                {audioFile && (
                  <audio
                    controls
                    src={audioFile}
                    className="mt-4 w-full max-w-md"
                  >
                    Your browser does not support the audio element.
                  </audio>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <Label className="text-sm font-medium mb-2 block">Blog Content</Label>
          <RichTextEditor
            content={content}
            onChange={setContent}
            placeholder="Write your blog content here..."
            disabled={
              isSavingDraft ||
              isPublishing ||
              isUploadingThumbnail ||
              isUploadingAudio ||
              isUploadingVideo
            }
          />
        </div>

        <div className="flex items-center justify-end gap-4 pt-6">
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleSubmit("draft")}
            disabled={
              isUploadingVideo ||
              isUploadingAudio ||
              isUploadingThumbnail ||
              isSavingDraft ||
              isPublishing
            }
          >
            {isSavingDraft ? "Saving..." : "Save as draft"}
          </Button>
          <Button
            size="lg"
            className="bg-app-primary hover:bg-primary/90"
            onClick={() => handleSubmit("published")}
            disabled={
              isSavingDraft ||
              isPublishing ||
              isUploadingThumbnail ||
              isUploadingVideo ||
              isUploadingAudio
            }
          >
            {isPublishing ? "Publishing..." : "Publish"}
          </Button>
        </div>
      </div>
    </div>
  );
}
