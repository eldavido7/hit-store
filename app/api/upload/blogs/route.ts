import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

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

        const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
        console.log(`[UPLOAD_BLOGS] Starting upload: ${file.name}, Size: ${fileSizeMB}MB`);

        // Determine resource type
        let resourceType: "image" | "video" | "raw" = "image";
        if (file.type.startsWith("video") || file.type.startsWith("audio")) {
            resourceType = "video";
        }

        // Validate video file size (<=100MB for free plan)
        if (resourceType === "video" && file.size > 100 * 1024 * 1024) {
            return NextResponse.json(
                { error: "Video file must be smaller than 100MB (Cloudinary free plan limit)" },
                { status: 400 }
            );
        }

        // Convert File to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Helper: turn Buffer into a stream
        const bufferToStream = (buffer: Buffer) => {
            const readable = new Readable();
            readable._read = () => { };
            readable.push(buffer);
            readable.push(null);
            return readable;
        };

        // Upload options
        const uploadOptions: any = {
            folder: "blogs",
            resource_type: resourceType,
            chunk_size: 20 * 1024 * 1024, // 20MB chunks
            timeout: 300000, // 5 minutes
        };

        if (resourceType === "image") {
            uploadOptions.transformation = [{ quality: "auto", fetch_format: "auto" }];
        } else if (resourceType === "video") {
            uploadOptions.transformation = [{ quality: "auto:good", fetch_format: "mp4" }];
            uploadOptions.eager = [{ streaming_profile: "hd", format: "m3u8" }];
            uploadOptions.eager_async = true;
        }

        console.log(`[UPLOAD_BLOGS] Uploading ${resourceType} with chunked streaming`);

        // Perform upload with streaming
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                uploadOptions,
                (error, result) => {
                    if (error) {
                        console.error("[UPLOAD_BLOGS] Cloudinary error:", error);
                        reject(error);
                    } else {
                        console.log("[UPLOAD_BLOGS] Upload successful:", result?.public_id);
                        resolve(result);
                    }
                }
            );

            bufferToStream(buffer).pipe(uploadStream);
        });

        return NextResponse.json({
            url: (result as any).secure_url,
            publicId: (result as any).public_id,
        });
    } catch (error: any) {
        console.error("[UPLOAD_BLOGS] Error:", error);
        return NextResponse.json(
            { error: "Failed to upload file", details: error.message },
            { status: 500 }
        );
    }
}