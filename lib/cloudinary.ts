
interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

// single import of ENV
import { ENV } from '../_core/env';

function getCloudinaryConfig(): CloudinaryConfig | null {
  if (!ENV.cloudinaryCloudName || !ENV.cloudinaryApiKey || !ENV.cloudinaryApiSecret) {
    return null;
  }

  return { 
    cloudName: ENV.cloudinaryCloudName, 
    apiKey: ENV.cloudinaryApiKey, 
    apiSecret: ENV.cloudinaryApiSecret 
  };
}

/**
 * Upload image to Cloudinary
 * @param file - File object or base64 string
 * @param folder - Optional folder path in Cloudinary
 * @returns Promise with the uploaded image URL
 */
export async function uploadToCloudinary(
  file: File | string,
  folder: string = 'kashaf-al-mahdi'
): Promise<string> {
  const config = getCloudinaryConfig();
  
  if (!config) {
    throw new Error('Cloudinary credentials not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file');
  }

  const formData = new FormData();
  
  if (file instanceof File) {
    formData.append('file', file);
  } else {
    // If it's a base64 string, convert it
    formData.append('file', file);
  }
  
  formData.append('upload_preset', 'ml_default'); // You'll need to create this in Cloudinary
  formData.append('folder', folder);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Cloudinary upload failed: ${error}`);
    }

    const data = await response.json();
    return data.secure_url; // Returns the CDN URL
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
}

/**
 * Delete image from Cloudinary
 * @param publicId - The public ID of the image (extracted from URL)
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  const config = getCloudinaryConfig();
  
  if (!config) {
    throw new Error('Cloudinary credentials not configured');
  }

  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = await generateSignature(publicId, timestamp, config);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${config.cloudName}/image/destroy`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        public_id: publicId,
        timestamp,
        signature,
        api_key: config.apiKey,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Cloudinary delete failed: ${error}`);
  }
}

/**
 * Extract public ID from Cloudinary URL
 */
export function extractPublicId(url: string): string | null {
  const match = url.match(/\/v\d+\/(.+)\.\w+$/);
  return match ? match[1] : null;
}

// Helper to generate signature for authenticated requests
async function generateSignature(
  publicId: string,
  timestamp: number,
  config: CloudinaryConfig
): Promise<string> {
  // For client-side, you should do this on the server
  // For now, we'll use unsigned uploads with upload_preset
  const message = `public_id=${publicId}&timestamp=${timestamp}${config.apiSecret}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

