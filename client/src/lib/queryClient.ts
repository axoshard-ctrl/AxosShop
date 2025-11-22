import { QueryClient, QueryFunction } from "@tanstack/react-query";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

function getAuthToken(): string | null {
  try {
    const userJson = localStorage.getItem("axo-user");
    if (userJson) {
      const user = JSON.parse(userJson);
      // Encode user as base64 for Authorization header using btoa (native browser API)
      return "Bearer " + btoa(JSON.stringify(user));
    }
  } catch (e) {
    // Ignore errors
  }
  return null;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<any> {
  const fullUrl = `${API_BASE_URL}${url}`;
  const headers: Record<string, string> = data ? { "Content-Type": "application/json" } : {};
  
  const authToken = getAuthToken();
  if (authToken) {
    headers["Authorization"] = authToken;
  }

  const res = await fetch(fullUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return await res.json();
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const fullUrl = `${API_BASE_URL}${queryKey.join("/")}`;
    const headers: Record<string, string> = {};
    
    const authToken = getAuthToken();
    if (authToken) {
      headers["Authorization"] = authToken;
    }

    const res = await fetch(fullUrl, {
      headers,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

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
