const RAW_URL = import.meta.env.VITE_API_URL || "";
const API_BASE_URL = RAW_URL.replace(/\/+$/, "");

export const apiUrl = (endpoint) => {
  const path = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  return `${API_BASE_URL}${path}`;
};