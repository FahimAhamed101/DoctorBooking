export const BASE_URL =
  import.meta.env.VITE_BASE_URL || "https://api.trustedgplinic.co.uk";

export const NEXT_PUBLIC_SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_NEXT_PUBLIC_SOCKET_URL ||
  "https://ws.trustedgplinic.co.uk";
