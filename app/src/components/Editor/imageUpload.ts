import { uploadImage } from "@/modules/article/article.controller";
import { createImageUpload } from "novel/plugins";
import { toast } from "sonner";

const onUpload = async (file: File) => {
  // immediate local preview (blob URL)
  const localUrl = typeof window !== 'undefined' ? URL.createObjectURL(file) : null;

  // emit a placeholder event so consumers can insert local preview immediately
  if (typeof window !== 'undefined' && localUrl) {
    window.dispatchEvent(new CustomEvent('novel:image-upload-placeholder', {
      detail: { localUrl, name: file.name, size: file.size }
    }));
  }

  // start server upload
  try {
    const uploadResponse = await uploadImage(file);

    if (uploadResponse && uploadResponse.url) {
      const { url } = uploadResponse;

      // wait for uploaded image to be reachable and loadable
      await new Promise<void>((resolve, reject) => {
        const image = new Image();
        image.src = url;
        image.onload = () => resolve();
        image.onerror = () => reject(new Error('Failed to load uploaded image'));
      });

      // notify listeners that external url is ready and replace placeholder
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('novel:image-upload-complete', {
          detail: { localUrl, url, name: file.name }
        }));
      }

      // revoke local url if we created one
      if (localUrl) URL.revokeObjectURL(localUrl);

      return url;
    }

    // upload didn't return url; keep local preview to avoid UX break
    return localUrl;
  } catch (err) {
    console.error('Error uploading image:', err);
    // notify of failure and return local preview so UI remains usable
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('novel:image-upload-error', {
        detail: { localUrl, name: file.name, error: String(err) }
      }));
    }
    if (localUrl) return localUrl;
    throw err;
  }
};

export const uploadFn = createImageUpload({
  onUpload,
  validateFn: (file) => {
    if (!file.type.includes("image/")) {
      toast.error("File type not supported.");
      return false;
    } else if (file.size / 1024 / 1024 > 20) {
      toast.error("File size too big (max 20MB).");
      return false;
    }
    return true;
  },
});
