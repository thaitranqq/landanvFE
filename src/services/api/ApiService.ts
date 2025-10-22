import { API_CONFIG } from './ApiConfig';
import type { ApiResponse } from '../../types/api';

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

class ApiError extends Error {
  status: number | null;
  retryable: boolean;
  original?: unknown;

  constructor(message: string, status: number | null = null, retryable = true, original?: unknown) {
    super(message);
    this.status = status;
    this.retryable = retryable;
    this.original = original;
    this.name = 'ApiError';
  }
}

class ApiService {
  private static instance: ApiService;

  private constructor() {}

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private async getHeaders(requiresAuth: boolean = true): Promise<HeadersInit> {
    const headers: HeadersInit = { ...API_CONFIG.HEADERS };

    if (requiresAuth) {
      const token = localStorage.getItem('jwt_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      const errorMessage = await this.getErrorMessage(response);

      // Detect non-retryable server-side input conversion errors
      if (response.status === 500 && /Failed to convert value of type/i.test(errorMessage)) {
        throw new ApiError(
          `Server Error (invalid input): ${errorMessage}`,
          response.status,
          false
        );
      }

      if (response.status === 500) {
        throw new ApiError(`Server Error: ${errorMessage}. Please try again later or contact support if the problem persists.`, response.status, true);
      }

      throw new ApiError(errorMessage, response.status, false);
    }

    const text = await response.text();
    try {
      if (!text) {
        // Some endpoints return empty body for 204 etc.; return a minimal successful ApiResponse
        return { success: true } as ApiResponse<T>;
      }
      const parsedAny = JSON.parse(text) as unknown;
      // If server already returned an ApiResponse-like object (has success or data), return it as-is
      if (parsedAny && (Object.prototype.hasOwnProperty.call(parsedAny, 'success') || Object.prototype.hasOwnProperty.call(parsedAny, 'data'))) {
        return parsedAny as ApiResponse<T>;
      }
      // Otherwise, wrap the raw payload into the ApiResponse shape so consumers can rely on response.data
      return { success: true, data: parsedAny as T } as ApiResponse<T>;
    } catch (err) {
      console.error('Failed to parse JSON response:', text, err);
      throw new ApiError('Invalid response format from server', null, false, err);
    }
  }

  private async getErrorMessage(response: Response): Promise<string> {
    try {
      const errorData = await response.json();
      // Safely extract message fields from unknown parsed JSON
      if (errorData && typeof errorData === 'object') {
        const obj = errorData as Record<string, unknown>;
        const errField = obj['error'];
        if (errField && typeof errField === 'object') {
          const errObj = errField as Record<string, unknown>;
          const msg = errObj['message'];
          if (typeof msg === 'string') return msg;
        }
        const topMessage = obj['message'];
        if (typeof topMessage === 'string') return topMessage;
      }
      return `Error: ${response.status} - ${response.statusText}`;
    } catch {
      return `Network error (${response.status}). Please check your connection and try again.`;
    }
  }

  async fetchWithRetry<T>(url: string, options: RequestOptions = {}, retries = 2): Promise<ApiResponse<T>> {
    const headers = await this.getHeaders(options.requiresAuth);

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

        // Merge and sanitize headers: remove keys with undefined so browsers set correct Content-Type for FormData
        const rawHeaders = { ...headers, ...(options.headers || {}) } as Record<string, unknown>;
        const finalHeaders: Record<string, string> = {};
        Object.keys(rawHeaders).forEach(k => {
          const v = rawHeaders[k];
          if (v !== undefined && v !== null) finalHeaders[k] = String(v);
        });

        // For fetch, when body is FormData, we must not set Content-Type header (browser sets it with boundary)
        const isFormData = options.body instanceof FormData;
        if (isFormData && finalHeaders['Content-Type']) {
          delete finalHeaders['Content-Type'];
        }

        const response = await fetch(url, {
          ...options,
          headers: finalHeaders,
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        return await this.handleResponse<T>(response);
      } catch (error) {
        // If it's our ApiError, respect its retryable flag
        if (error instanceof ApiError) {
          if (!error.retryable) {
            // Don't retry non-retryable server errors
            throw error;
          }
          if (attempt === retries) throw error;
          // retryable ApiError (e.g., 500 transient)
          await new Promise<void>(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
          continue;
        }

        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            throw new ApiError('Request timed out. Please try again.', null, true);
          }

          // network or other generic errors
          const isNetwork = /Network error/i.test(error.message) || /Failed to fetch/i.test(error.message);
          if (!isNetwork) {
            // unknown non-network error; don't retry
            throw new ApiError(error.message, null, false, error);
          }

          if (attempt === retries) {
            throw new ApiError(error.message, null, true, error);
          }

          // exponential backoff before retrying
          await new Promise<void>(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    throw new ApiError('Maximum retry attempts reached', null, false);
  }

  async get<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.fetchWithRetry<T>(`${API_CONFIG.BASE_URL}${endpoint}`, {
      ...options,
      method: 'GET'
    });
  }

  async post<T>(endpoint: string, data: unknown, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    // If data is FormData, send it directly; otherwise stringify
    const body = data instanceof FormData ? data : JSON.stringify(data as unknown);
    return this.fetchWithRetry<T>(`${API_CONFIG.BASE_URL}${endpoint}`, {
      ...options,
      method: 'POST',
      body
    });
  }

  async put<T>(endpoint: string, data: unknown, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const body = data instanceof FormData ? data : JSON.stringify(data as unknown);
    return this.fetchWithRetry<T>(`${API_CONFIG.BASE_URL}${endpoint}`, {
      ...options,
      method: 'PUT',
      body
    });
  }

  async delete<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.fetchWithRetry<T>(`${API_CONFIG.BASE_URL}${endpoint}`, {
      ...options,
      method: 'DELETE'
    });
  }
}

export const apiService = ApiService.getInstance();
