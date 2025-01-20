import { uploadImage } from "@/modules/article/article.controller";
import { createImageUpload } from "novel/plugins";
import { toast } from "sonner";

const onUpload = async (file: File) => {
  const uploadResponse = await uploadImage(file);
  return new Promise((resolve) => {
    if (uploadResponse.url) {
      const { url } = uploadResponse;
      const image = new Image();
      image.src = url;
      image.onload = () => {
        resolve(url);
      };
    } else {
      resolve(file);
      throw new Error(`Error uploading image. Please try again.`);
    }
  });
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
