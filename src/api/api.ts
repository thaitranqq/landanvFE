import type { ApiResponse } from '../types/api';
const API_BASE_URL = "https://api.ladanv.id.vn/api/v1";

// --- Token Management --- //
export const getToken = (): string | null => {
  try {
    return localStorage.getItem('jwt_token');
  } catch (err) {
    console.error('Failed to read token from localStorage', err);
    return null;
  }
};

export const setToken = (token: string): void => {
  try {
    localStorage.setItem('jwt_token', token);
  } catch (err) {
    console.error("Failed to save token to localStorage", err);
  }
};

export const removeToken = (): void => {
  try {
    localStorage.removeItem('jwt_token');
  } catch (err) {
    console.error("Failed to remove token from localStorage", err);
  }
};

// --- API Fetcher --- //
const extractAuthorization = (headers?: HeadersInit): string | undefined => {
  if (!headers) return undefined;
  if (headers instanceof Headers) return headers.get('Authorization') ?? undefined;
  if (Array.isArray(headers)) {
    const found = headers.find(([k]) => k.toLowerCase() === 'authorization');
    return found ? found[1] : undefined;
  }
  // headers is Record<string,string>
  return (headers as Record<string, string>)['Authorization'] ?? (headers as Record<string, string>)['authorization'];
};

const fetcher = async (path: string, options: RequestInit = {}): Promise<unknown> => {
  // Log the request for debugging purposes
  console.log(`[API] Making request: ${options.method || 'GET'} ${API_BASE_URL}${path}`);
  const authHeader = extractAuthorization(options.headers as HeadersInit | undefined);
  if (authHeader) {
    console.log('[API] Authorization header sent:', authHeader);
  } else {
    console.warn('[API] No Authorization header sent for this request.');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, options);

  const text = await response.text();
  try {
    // Try to parse JSON; if parsing fails, return a generic ApiResponse-shaped error
    return text ? JSON.parse(text) : {};
  } catch (err) {
    console.error('Failed to parse JSON response:', text, err);
    // Return a generic error-shaped object
    return { success: false, error: { code: 'INVALID_JSON', message: 'Invalid JSON response' } };
  }
};

// --- API Methods --- //

const getPrivateHeaders = (): HeadersInit => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Provide typed wrappers so callers can use generics like api.get<T>(...)
const privateApi = {
  get: async <T = unknown>(path: string): Promise<ApiResponse<T>> => {
    const res = await fetcher(path, { headers: getPrivateHeaders() });
    return res as ApiResponse<T>;
  },
  post: async <T = unknown>(path: string, data: unknown): Promise<ApiResponse<T>> => {
    const res = await fetcher(path, {
      method: 'POST',
      headers: getPrivateHeaders(),
      body: JSON.stringify(data),
    });
    return res as ApiResponse<T>;
  },
  put: async <T = unknown>(path: string, data: unknown): Promise<ApiResponse<T>> => {
    const res = await fetcher(path, {
      method: 'PUT',
      headers: getPrivateHeaders(),
      body: JSON.stringify(data),
    });
    return res as ApiResponse<T>;
  },
  delete: async <T = unknown>(path: string): Promise<ApiResponse<T>> => {
    const res = await fetcher(path, {
      method: 'DELETE',
      headers: getPrivateHeaders(),
    });
    return res as ApiResponse<T>;
  },
};

const publicApi = {
  post: async <T = unknown>(path: string, data: unknown): Promise<ApiResponse<T>> => {
    const res = await fetcher(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res as ApiResponse<T>;
  },
};

export const api = { ...privateApi, public: publicApi };
