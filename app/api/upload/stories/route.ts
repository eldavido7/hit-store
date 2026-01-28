import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const maxDuration = 300; // 5 minutes

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        console.log(`[UPLOAD_STORIES] Starting upload: ${file.name}, Size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);

        // Determine resource type
        let resourceType: "image" | "video" | "raw" = "image";
        if (file.type.startsWith("video") || file.type.startsWith("audio")) {
            resourceType = "video";
        }

        // Enforce 100MB limit for videos (Cloudinary free plan)
        if (resourceType === "video" && file.size > 100 * 1024 * 1024) {
            console.log(`[UPLOAD_STORIES] File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
            return NextResponse.json(
                { error: "Video file too large", details: "Maximum file size is 100MB for Cloudinary free plan" },
                { status: 400 }
            );
        }

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadOptions: any = {
            folder: "stories",
            resource_type: resourceType,
            timeout: 120000,
        };

        if (resourceType === "image") {
            uploadOptions.transformation = [
                {
                    quality: "auto",
                    fetch_format: "auto",
                },
            ];
        }

        if (resourceType === "video") {
            uploadOptions.transformation = [
                {
                    quality: "auto:good",
                    fetch_format: "mp4", // Ensure MP4 for compatibility
                },
            ];
            uploadOptions.eager = [
                {
                    streaming_profile: "hd",
                    format: "m3u8",
                },
            ];
            uploadOptions.eager_async = true;
            uploadOptions.chunk_size = 20000000; // 20MB chunks
        }

        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                uploadOptions,
                (error, result) => {
                    if (error) {
                        console.error("[UPLOAD_STORIES] Cloudinary error:", error);
                        reject(error);
                    } else {
                        console.log("[UPLOAD_STORIES] Upload successful:", result?.public_id);
                        resolve(result);
                    }
                }
            ).end(buffer);
        });

        return NextResponse.json({
            url: (result as any).secure_url,
            publicId: (result as any).public_id,
        });
    } catch (error: any) {
        console.error("[UPLOAD_STORIES] Error:", error);
        return NextResponse.json(
            {
                error: "Failed to upload file",
                details: error.message,
            },
            { status: 500 }
        );
    }
}