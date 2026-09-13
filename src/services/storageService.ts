import { supabase } from "../lib/supabase";
import * as FileSystem from "expo-file-system/legacy";
import * as ImageManipulator from "expo-image-manipulator";
import { decode } from "base64-arraybuffer";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ITEM_IMAGES_BUCKET = "item-images";

// ─────────────────────────────────────────────────
// Item images
// ─────────────────────────────────────────────────

/**
 * Validates, compresses, and uploads an item image to Supabase Storage.
 *
 * Pipeline:
 *   validate (≤ 5 MB)
 *     → compress (800px, 80% quality, WebP)
 *       → upload as Blob (no base64 overhead)
 *         → return storage path
 *
 * Path format: business_{businessId}/item_{itemId}.webp
 * Use getItemImageUrl(path) to generate the display URL.
 */
export async function checkImageSizeAsync(localUri: string): Promise<boolean> {
  const fileInfo = await FileSystem.getInfoAsync(localUri);
  if (!fileInfo.exists) return false;
  
  if (fileInfo.size && fileInfo.size > MAX_FILE_SIZE_BYTES) {
    return false;
  }
  return true;
}

export async function uploadItemImageAsync(
  localUri: string,
  businessId: string,
  itemId: string,
): Promise<string> {
  // 1. Validate file size
  const fileInfo = await FileSystem.getInfoAsync(localUri);
  if (!fileInfo.exists) throw new Error("Image file does not exist.");
  if (fileInfo.size && fileInfo.size > MAX_FILE_SIZE_BYTES) {
    throw new Error("Image exceeds the maximum allowed size of 5 MB.");
  }

  // 2. Compress — resize to 800px width, 80% quality, WebP
  const compressed = await ImageManipulator.manipulateAsync(
    localUri,
    [{ resize: { width: 800 } }],
    { compress: 0.8, format: ImageManipulator.SaveFormat.WEBP },
  );

  // 3. Convert to ArrayBuffer via base64
  // We use this pattern because React Native's fetch().blob() causes warnings and 
  // actually uses base64 under the hood anyway. The file is small (~100-300KB) after compression.
  const base64 = await FileSystem.readAsStringAsync(compressed.uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const arrayBuffer = decode(base64);

  const storagePath = `business_${businessId}/item_${itemId}.webp`;

  const { data, error } = await supabase.storage
    .from(ITEM_IMAGES_BUCKET)
    .upload(storagePath, arrayBuffer, {
      contentType: "image/webp",
      upsert: true, // safe to overwrite on retry
    });

  if (error) throw error;
  return data.path;
}

/**
 * Returns the public display URL for an item image given its storage path.
 * Call this at render time — do NOT store the URL in the database.
 */
export function getItemImageUrl(imagePath: string): string {
  const { data } = supabase.storage
    .from(ITEM_IMAGES_BUCKET)
    .getPublicUrl(imagePath);
  return data.publicUrl;
}
