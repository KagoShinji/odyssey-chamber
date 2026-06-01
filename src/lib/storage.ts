import { supabase } from "./supabase";

/**
 * Uploads an image file to the 'chamber-assets' storage bucket under a specific folder.
 * Returns the public URL of the uploaded image.
 */
export async function uploadImage(file: File, folder: string): Promise<string> {
  // 1. Create a clean unique filename
  const fileExt = file.name.split('.').pop() || 'jpg';
  const cleanFileName = file.name
    .replace(/\.[^/.]+$/, "") // Remove extension
    .replace(/[^a-zA-Z0-9]/g, "_") // Replace non-alphanumeric with underscores
    .toLowerCase();
  
  const uniqueId = Math.random().toString(36).substring(2, 10);
  const filePath = `${folder}/${cleanFileName}_${uniqueId}.${fileExt}`;

  // 2. Perform the upload
  const { error } = await supabase.storage
    .from("chamber-assets")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  // 3. Get public URL
  const { data: publicUrlData } = supabase.storage
    .from("chamber-assets")
    .getPublicUrl(filePath);

  if (!publicUrlData || !publicUrlData.publicUrl) {
    throw new Error("Could not retrieve public URL for uploaded file.");
  }

  return publicUrlData.publicUrl;
}
