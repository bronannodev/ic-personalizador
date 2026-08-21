const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'ggn5svzi';
const API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY || '313162537483471';
const API_SECRET = import.meta.env.VITE_CLOUDINARY_API_SECRET || 'mddcJa0_3kBCN0K3-WmBcHaAvbc';

async function sha1(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export interface CloudinaryUploadResult {
  secureUrl: string;
  publicId: string;
}

export async function uploadToCloudinary(
  dataUrlOrBlob: string,
  folder: string = 'pedidos'
): Promise<CloudinaryUploadResult | null> {
  try {
    const timestamp = Math.round(Date.now() / 1000);
    const strToSign = `folder=${folder}&timestamp=${timestamp}${API_SECRET}`;
    const signature = await sha1(strToSign);

    const formData = new FormData();
    formData.append('file', dataUrlOrBlob);
    formData.append('api_key', API_KEY);
    formData.append('timestamp', timestamp.toString());
    formData.append('folder', folder);
    formData.append('signature', signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      console.warn('Cloudinary upload error:', await response.text());
      return null;
    }

    const data = await response.json();
    if (data.secure_url && data.public_id) {
      return {
        secureUrl: data.secure_url,
        publicId: data.public_id,
      };
    }
    return null;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return null;
  }
}

export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  try {
    const timestamp = Math.round(Date.now() / 1000);
    const strToSign = `public_id=${publicId}&timestamp=${timestamp}${API_SECRET}`;
    const signature = await sha1(strToSign);

    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('api_key', API_KEY);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      console.warn('Cloudinary destroy error:', await response.text());
      return false;
    }

    const data = await response.json();
    return data.result === 'ok';
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return false;
  }
}
