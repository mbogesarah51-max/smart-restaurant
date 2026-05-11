import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

export interface UploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export async function uploadToCloudinary(
  file: string,
  options?: {
    folder?: string;
    transformation?: Record<string, unknown>[];
    resourceType?: "image" | "video" | "raw" | "auto";
  }
): Promise<UploadResult> {
  const result = await cloudinary.uploader.upload(file, {
    folder: options?.folder ?? "chopwise",
    resource_type: options?.resourceType ?? "auto",
    transformation: options?.transformation ?? [
      { quality: "auto", fetch_format: "auto" },
    ],
    timeout: 60000,
  });

  return {
    secure_url: result.secure_url,
    public_id: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
  };
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}
