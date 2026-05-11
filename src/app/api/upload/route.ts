// ─── Image Upload API ────────────────────────────────────────────────────────
// Currently uses Cloudinary for cloud storage.
// To swap to AWS S3 or local filesystem:
//   1. Replace the uploadToCloudinary/deleteFromCloudinary calls below
//   2. Update the returned URL to match your storage provider
//   3. For local: save to /public/uploads/ and return "/uploads/filename.ext"
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const folder = (formData.get("folder") as string) || "general";

    // Support both single "file" and multiple "files" keys
    const files: File[] = [];
    const single = formData.get("file") as File | null;
    if (single && single instanceof File) {
      files.push(single);
    }
    const multi = formData.getAll("files");
    for (const f of multi) {
      if (f instanceof File) files.push(f);
    }

    if (files.length === 0) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (files.length > 10) {
      return NextResponse.json({ error: "Maximum 10 files per upload" }, { status: 400 });
    }

    // Validate all files before uploading any
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `"${file.name}" exceeds 5MB limit` },
          { status: 400 }
        );
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `"${file.name}" is not supported. Use JPEG, PNG, or WebP.` },
          { status: 400 }
        );
      }
    }

    // Upload all files
    const results = await Promise.all(
      files.map(async (file) => {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = buffer.toString("base64");
        const dataUri = `data:${file.type};base64,${base64}`;

        return uploadToCloudinary(dataUri, {
          folder: `chopwise/${folder}`,
          transformation: [
            { quality: "auto", fetch_format: "auto" },
            { width: 1200, crop: "limit" },
          ],
        });
      })
    );

    // Return single result for single file, array for multiple
    if (files.length === 1) {
      return NextResponse.json({ success: true, data: results[0] });
    }

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file. Please try again." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { publicId } = await req.json();

    if (!publicId || typeof publicId !== "string") {
      return NextResponse.json({ error: "Public ID is required" }, { status: 400 });
    }

    await deleteFromCloudinary(publicId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}
