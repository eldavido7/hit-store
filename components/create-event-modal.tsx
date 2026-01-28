"use client";

import { useState, useRef } from "react";
import { Upload, Calendar, MapPin, Clock, Link2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useEventStore } from "@/store/store";
import { toast } from "@/components/ui/use-toast";

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: () => void;
}

export function CreateEventModal({
  isOpen,
  onClose,
  onEventCreated,
}: CreateEventModalProps) {
  const { addEvent } = useEventStore();
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    date: "",
    time: "",
    location: "",
    description: "",
    meetingLink: "",
    image: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "title" ? { slug: generateSlug(value) } : {}),
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
    setIsUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      const response = await fetch("/api/upload/events", {
        method: "POST",
        body: uploadFormData,
      });
      if (!response.ok) throw new Error("Upload failed");
      const { url } = await response.json();
      setFormData((prev) => ({ ...prev, image: url }));
      toast({ title: "Image uploaded", description: "Upload successful." });
    } catch (error) {
      console.error("[UPLOAD_IMAGE]", error);
      toast({
        title: "Upload failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.title ||
      !formData.slug ||
      !formData.date ||
      !formData.time ||
      !formData.location ||
      !formData.description
    ) {
      toast({
        title: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formData.slug)) {
      toast({
        title: "Invalid slug format",
        description: "Use lowercase letters, numbers, and hyphens only.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await addEvent({
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        date: formData.date.trim(),
        time: formData.time.trim(),
        location: formData.location.trim(),
        description: formData.description.trim(),
        meetingLink: formData.meetingLink.trim(),
        image: formData.image,
        status: "active",
      });
      onEventCreated();
      setFormData({
        title: "",
        slug: "",
        date: "",
        time: "",
        location: "",
        description: "",
        meetingLink: "",
        image: "",
      });
      // toast({ title: "Event created successfully", variant: "default" })
    } catch (error) {
      console.error("[CREATE_EVENT]", error);
      toast({ title: "Failed to create event", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto">
        <DialogHeader className="relative">
          <DialogTitle>Create New Event</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-12 w-12 bg-gray-50 p-2 rounded-full"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter event title"
              required
              disabled={isSubmitting || isUploading}
            />
          </div>

          <div className="space-y-2 hidden">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleInputChange}
              placeholder="Enter event slug"
              required
              disabled={isSubmitting || isUploading}
            />
            <p className="text-sm text-muted-foreground">
              This will be used in the URL. Only lowercase letters, numbers, and
              hyphens are allowed.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Event Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="pl-10"
                  required
                  disabled={isSubmitting || isUploading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Event Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="time"
                  name="time"
                  type="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className="pl-10"
                  required
                  disabled={isSubmitting || isUploading}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Enter event location"
                className="pl-10"
                required
                disabled={isSubmitting || isUploading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter event description"
              className="min-h-[100px]"
              required
              disabled={isSubmitting || isUploading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meetingLink">Meeting Link (Optional)</Label>
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="meetingLink"
                name="meetingLink"
                value={formData.meetingLink}
                onChange={handleInputChange}
                placeholder="Enter Zoom, Teams, or other meeting link"
                className="pl-10"
                disabled={isSubmitting || isUploading}
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label>Event Image (Optional)</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center bg-muted/10">
              <div className="flex flex-col items-center gap-3">
                {formData.image ? (
                  <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
                    <img
                      src={formData.image}
                      alt="Event image preview"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, image: "" }))
                      }
                      disabled={isSubmitting || isUploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="p-2 rounded-full bg-muted">
                      <Upload className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Upload event image. PNG or JPG format recommended.
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                        disabled={isSubmitting || isUploading}
                      >
                        {isUploading ? "Uploading..." : "Browse Files"}
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg"
                        className="hidden"
                        onChange={handleFileUpload}
                        title="Upload Image"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting || isUploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90"
              disabled={isSubmitting || isUploading}
            >
              {isSubmitting ? "Creating..." : "Create Event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
