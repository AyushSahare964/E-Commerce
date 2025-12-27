const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export interface ApiError extends Error {
  status?: number;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const err: ApiError = new Error(
      (data && (data.message as string)) || `Request failed with status ${response.status}`,
    );
    err.status = response.status;
    throw err;
  }

  return data as T;
}

export const api = {
  get: <T>(path: string, token?: string | null) => request<T>(path, { method: "GET" }, token),
  post: <T>(path: string, body: unknown, token?: string | null) =>
    request<T>(
      path,
      {
        method: "POST",
        body: JSON.stringify(body ?? {}),
      },
      token,
    ),
  put: <T>(path: string, body: unknown, token?: string | null) =>
    request<T>(
      path,
      {
        method: "PUT",
        body: JSON.stringify(body ?? {}),
      },
      token,
    ),
};

export default api;
