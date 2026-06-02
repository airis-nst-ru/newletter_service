import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Accepts { base64: string } containing a data URL or raw base64 and uploads to Cloudinary
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { base64 } = body as { base64: string };
    if (!base64) return NextResponse.json({ success: false, message: "Missing base64" }, { status: 400 });

    // Cloudinary will accept data URI or data:audio/wav;base64,...
    const upload = await cloudinary.uploader.upload(base64, {
      resource_type: "auto",
      folder: "airis/comments/voices",
    });

    return NextResponse.json({ success: true, url: upload.secure_url, raw: upload });
  } catch (err) {
    console.error("[POST /uploads/voice]", err);
    return NextResponse.json({ success: false, message: "Upload failed" }, { status: 500 });
  }
}