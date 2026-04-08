import { readFile } from "node:fs/promises";
import { extname } from "node:path";
import { getSupabaseConfig } from "./env.mjs";

const MIME_TYPES = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

/**
 * Upload a local file to Supabase Storage and return the public URL.
 * @param {string} localPath - Path to the local file
 * @param {string} bucketPath - Path within the bucket (e.g. "knowledgebase/export-assets-list.webp")
 * @returns {Promise<string>} Public URL of the uploaded file
 */
export async function upload(localPath, bucketPath) {
  const { url, serviceKey, bucket } = getSupabaseConfig();
  const ext = extname(localPath).toLowerCase();
  const mimeType = MIME_TYPES[ext];

  if (!mimeType) {
    throw new Error(`Unsupported file type: ${ext}`);
  }

  const fileBuffer = await readFile(localPath);

  const endpoint = `${url}/storage/v1/object/${bucket}/${bucketPath}`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": mimeType,
      "x-upsert": "true",
    },
    body: fileBuffer,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Upload failed (${res.status}): ${errorText}`);
  }

  return `${url}/storage/v1/object/public/${bucket}/${bucketPath}`;
}
