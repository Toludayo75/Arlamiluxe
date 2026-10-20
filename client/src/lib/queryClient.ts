import { QueryClient, QueryFunction } from "@tanstack/react-query";

export const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

export function resolveAssetUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (/^(https?:)?\/\//i.test(url) || /^(data|blob):/i.test(url)) return url;
  if (url.startsWith("/uploads/") || url.startsWith("/generated_images/")) {
    return `${API_BASE_URL}${url}`;
  }
  if (!url.startsWith("/")) {
    const assetsBase = (import.meta.env.VITE_ASSETS_BASE_URL || API_BASE_URL).replace(/\/$/, "");
    return `${assetsBase}/generated_images/${url}`;
  }
  return url;
}

// Helper: throw error if response is not OK
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Generic API request (POST, PUT, DELETE, etc.)
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown
): Promise<Response> {
  const res = await fetch(API_BASE_URL + url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

// Query function for GET requests
type UnauthorizedBehavior = "returnNull" | "throw";

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = API_BASE_URL + (queryKey.join("/") as string);

    const res = await fetch(url, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

// React Query client config
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
