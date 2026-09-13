export const imageBaseUrl =
  import.meta.env.VITE_IMAGE_BASE_URL ||
  import.meta.env.VITE_BASE_URL ||
  "https://api.trustedgpclinic.com";

export const getImageUrl = (imagePath, fallback = "/src/assets/user.png") => {
  if (!imagePath) return fallback;
  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://") ||
    imagePath.startsWith("blob:") ||
    imagePath.startsWith("data:")
  ) {
    return imagePath;
  }
  const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  return `${imageBaseUrl.replace(/\/$/, "")}${cleanPath}`;
};