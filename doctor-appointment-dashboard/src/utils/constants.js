export const BASE_URL =
  import.meta.env.VITE_BASE_URL || "https://api.trustedgplinic.co.uk";

export const NEXT_PUBLIC_SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_NEXT_PUBLIC_SOCKET_URL ||
  "https://ws.trustedgplinic.co.uk";

export const getImageUrl = (path, fallback = "/default-profile.png") => {
  if (!path) return fallback;
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("blob:") ||
    path.startsWith("data:")
  ) {
    return path;
  }
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_URL.replace(/\/$/, "")}${cleanPath}`;
};
