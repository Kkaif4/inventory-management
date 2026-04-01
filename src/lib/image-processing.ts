import sharp from "sharp";

/**
 * Image Processing Pipeline
 * Handles compression, optimization, Base64 encoding, and format validation
 *
 * Per IMAGE_PROCESSING.md technical report:
 * - JPEG format with 80% quality for 60-80% file reduction
 * - Max width 400px with aspect ratio preservation
 * - Base64 data URI encoding for self-contained storage
 * - Magic byte validation for format verification
 */

export interface CompressionOptions {
  quality?: number; // 1-100, default 80
  maxWidth?: number; // default 400px (per IMAGE_PROCESSING.md)
  format?: "jpeg"; // JPEG for lossy compression
}

export interface ProcessedImageData {
  buffer: Buffer;
  base64: string;
  dataUri: string;
  size: number;
  originalSize: number;
  format: string;
  mimeType: string;
  compressionRatio: number;
}

export interface ImageMetadata {
  width?: number;
  height?: number;
  format?: string;
  size: number;
  isValid: boolean;
}

/**
 * Validate image file before compression
 * Check MIME type and file size
 */
export function validateImageFile(
  file: any,
  maxSizeMB: number = 5
): { valid: boolean; error?: string } {
  const allowedMimes = ["image/jpeg", "image/png"];
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (!allowedMimes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Only JPG and PNG images are supported. Got: ${file.type}`,
    };
  }

  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit. File size: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
    };
  }

  return { valid: true };
}

/**
 * Validate image format by magic bytes
 * Prevents malformed image embedding in PDFs
 *
 * PNG: 89 50 4E 47 (‰PNG)
 * JPEG: FF D8 FF (ÿØÿ)
 */
export function validateImageMagicBytes(
  buffer: Buffer
): { valid: boolean; format?: string; error?: string } {
  if (!buffer || buffer.length < 3) {
    return { valid: false, error: "Buffer too small for format validation" };
  }

  // Check PNG magic bytes
  if (
    buffer.length > 4 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return { valid: true, format: "png" };
  }

  // Check JPEG magic bytes
  if (
    buffer.length > 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return { valid: true, format: "jpeg" };
  }

  return { valid: false, error: "Unknown or invalid image format" };
}

/**
 * Compress and convert image to JPEG with Base64 encoding
 *
 * Process:
 * 1. Resize to 400px max width (preserves aspect ratio)
 * 2. Convert to JPEG with 80% quality
 * 3. Encode to Base64
 * 4. Return data URI format
 *
 * Per IMAGE_PROCESSING.md:
 * - Typical reduction: 60-80% file size
 * - Base64 overhead: ~33% (1.33x multiplier)
 * - Final size after encoding: ~45-60KB for typical logo
 */
export async function compressAndEncodeImage(
  buffer: Buffer,
  options: CompressionOptions = {}
): Promise<ProcessedImageData> {
  const startTime = Date.now();
  const originalSize = buffer.length;

  try {
    const {
      quality = 80,
      maxWidth = 400,
    } = options;

    // Validate input metadata
    const metadata = await sharp(buffer).metadata();
    if (!metadata.format || !["jpeg", "png", "webp"].includes(metadata.format)) {
      throw new Error(
        `Invalid image format: ${metadata.format || "unknown"}. Only JPEG and PNG are supported.`
      );
    }

    // Resize with aspect ratio preservation and no enlargement
    const optimized = await sharp(buffer)
      .resize(maxWidth, undefined, {
        withoutEnlargement: true,
      })
      .jpeg({ quality })
      .toBuffer();

    const compressedSize = optimized.length;

    // Encode to Base64
    const base64String = optimized.toString("base64");
    const dataUri = `data:image/jpeg;base64,${base64String}`;

    const compressionRatio = getCompressionRatio(originalSize, compressedSize);
    const processingTime = Date.now() - startTime;

    console.log(`[ImageProcessing] Compression complete:`);
    console.log(`  Original: ${formatFileSize(originalSize)}`);
    console.log(`  Compressed: ${formatFileSize(compressedSize)}`);
    console.log(`  Reduction: ${compressionRatio}%`);
    console.log(`  Encoded: ${formatFileSize(Math.ceil(compressedSize * 1.33))}`);
    console.log(`  Time: ${processingTime}ms`);

    return {
      buffer: optimized,
      base64: base64String,
      dataUri,
      size: compressedSize,
      originalSize,
      format: "jpeg",
      mimeType: "image/jpeg",
      compressionRatio,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`[ImageProcessing] Compression failed: ${errorMessage}`);
    throw new Error(`Image compression failed: ${errorMessage}`);
  }
}

/**
 * Get image metadata without processing
 * Useful for validation and preview
 */
export async function getImageMetadata(buffer: Buffer): Promise<ImageMetadata> {
  try {
    const magicBytes = validateImageMagicBytes(buffer);
    const metadata = await sharp(buffer).metadata();

    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: buffer.length,
      isValid: magicBytes.valid,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`[ImageProcessing] Metadata read failed: ${errorMessage}`);
    throw new Error(`Failed to read image metadata: ${errorMessage}`);
  }
}

/**
 * Extract binary data from Base64 data URI
 *
 * Handles format: "data:image/jpeg;base64,<base64_content>"
 * Also handles raw base64 strings without data URI prefix
 */
export function extractBase64FromDataUri(dataUri: string): Buffer {
  try {
    const base64Content = dataUri.includes(",")
      ? dataUri.split(",")[1]
      : dataUri;

    if (!base64Content) {
      throw new Error("No Base64 content found in data URI");
    }

    return Buffer.from(base64Content, "base64");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to extract Base64 from data URI: ${errorMessage}`);
  }
}

/**
 * Calculate compression ratio
 */
export function getCompressionRatio(
  originalSize: number,
  compressedSize: number
): number {
  if (originalSize === 0) return 0;
  return Math.round(((originalSize - compressedSize) / originalSize) * 100);
}

/**
 * Calculate Base64 encoding overhead
 * Base64 increases size by ~33% (1.33x multiplier)
 */
export function calculateEncodedSize(binarySize: number): number {
  return Math.ceil(binarySize * 1.33);
}

/**
 * Format bytes to human-readable size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return (
    Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  );
}
