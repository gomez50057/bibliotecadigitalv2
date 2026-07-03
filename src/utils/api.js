export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function apiUrl(path) {
  return `${API_URL}${path}`;
}

export function apiErrorMessage(data, fallback = "Request failed") {
  if (!data || typeof data !== "object") return fallback;
  const first = Object.values(data).flat().find(Boolean);
  return typeof first === "string" ? first : data.detail || fallback;
}

export async function apiFetch(path, options = {}) {
  const response = await fetch(apiUrl(path), { credentials: "include", ...options });
  const data = response.headers.get("content-type")?.includes("application/json")
    ? await response.json()
    : null;
  if (!response.ok) {
    const error = new Error(apiErrorMessage(data));
    error.status = response.status;
    throw error;
  }
  return data;
}

export async function apiBlobFetch(path, options = {}) {
  const response = await fetch(apiUrl(path), { credentials: "include", ...options });
  if (!response.ok) {
    throw new Error("Request failed");
  }
  return response.blob();
}
