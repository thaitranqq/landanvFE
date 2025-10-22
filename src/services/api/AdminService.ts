import { apiService } from './ApiService';
import { API_ENDPOINTS } from './ApiConfig';
import type { ProductDTO, IngredientDTO, BrandDTO } from '../../types/api';

export interface DashboardMetrics {
  users: {
    total: number;
    active: number;
    newLast30Days: number;
    byRegion: { region: string; count: number }[];
  };
  products: {
    total: number;
    averageRating: number;
    topSearched: { name: string; searchCount: number }[];
    topScanned: { name: string; scanCount: number }[];
  };
  engagement: {
    totalReviews: number;
    totalRoutines: number;
    avgRoutineProducts: number;
    routineCompletionRate: number;
  };
  analytics: {
    popularConcerns: { concern: string; userCount: number }[];
    skinTypeDistribution: { type: string; percentage: number }[];
    featureUsage: { feature: string; usageCount: number }[];
  };
}

export interface ContentModerationQueue {
  reviews: {
    id: number;
    productId: number;
    userId: number;
    content: string;
    flags: { reason: string; count: number }[];
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
  }[];
  products: {
    id: number;
    name: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    submittedBy: number;
    issues?: string[];
  }[];
}

class AdminService {
  async getDashboardMetrics(period: 'day' | 'week' | 'month' = 'day'): Promise<DashboardMetrics> {
    const response = await apiService.get<DashboardMetrics>(
      `${API_ENDPOINTS.ADMIN.DASHBOARD}/metrics?period=${period}`
    );
    return response.data!;
  }

  // Product Management
  async createProduct(data: Partial<ProductDTO>): Promise<ProductDTO> {
    const response = await apiService.post<ProductDTO>(
      API_ENDPOINTS.ADMIN.PRODUCTS,
      data
    );
    return response.data!;
  }

  async updateProduct(productId: number, data: Partial<ProductDTO>): Promise<ProductDTO> {
    const response = await apiService.put<ProductDTO>(
      `${API_ENDPOINTS.ADMIN.PRODUCTS}/${productId}`,
      data
    );
    return response.data!;
  }

  async bulkUpdateProducts(updates: { id: number; data: Partial<ProductDTO> }[]): Promise<ProductDTO[]> {
    const response = await apiService.put<ProductDTO[]>(
      `${API_ENDPOINTS.ADMIN.PRODUCTS}/bulk`,
      { updates }
    );
    return response.data || [];
  }

  // Ingredient Management
  async createIngredient(data: Partial<IngredientDTO>): Promise<IngredientDTO> {
    const response = await apiService.post<IngredientDTO>(
      API_ENDPOINTS.ADMIN.INGREDIENTS,
      data
    );
    return response.data!;
  }

  async updateIngredient(ingredientId: number, data: Partial<IngredientDTO>): Promise<IngredientDTO> {
    const response = await apiService.put<IngredientDTO>(
      `${API_ENDPOINTS.ADMIN.INGREDIENTS}/${ingredientId}`,
      data
    );
    return response.data!;
  }

  // Brand Management
  async createBrand(data: Partial<BrandDTO>): Promise<BrandDTO> {
    const response = await apiService.post<BrandDTO>(
      `${API_ENDPOINTS.ADMIN.PRODUCTS}/brands`,
      data
    );
    return response.data!;
  }

  async updateBrand(brandId: number, data: Partial<BrandDTO>): Promise<BrandDTO> {
    const response = await apiService.put<BrandDTO>(
      `${API_ENDPOINTS.ADMIN.PRODUCTS}/brands/${brandId}`,
      data
    );
    return response.data!;
  }

  // Content Moderation
  async getModerationQueue(): Promise<ContentModerationQueue> {
    const response = await apiService.get<ContentModerationQueue>(
      `${API_ENDPOINTS.ADMIN.DASHBOARD}/moderation`
    );
    return response.data!;
  }

  async moderateReview(reviewId: number, action: 'APPROVE' | 'REJECT', reason?: string): Promise<void> {
    await apiService.post(
      `${API_ENDPOINTS.ADMIN.DASHBOARD}/moderation/reviews/${reviewId}`,
      { action, reason }
    );
  }

  async moderateProduct(productId: number, action: 'APPROVE' | 'REJECT', reason?: string): Promise<void> {
    await apiService.post(
      `${API_ENDPOINTS.ADMIN.DASHBOARD}/moderation/products/${productId}`,
      { action, reason }
    );
  }

  // Analytics & Reports
  async generateReport(params: {
    type: 'USER_ACTIVITY' | 'PRODUCT_PERFORMANCE' | 'CONTENT_QUALITY' | 'SYSTEM_HEALTH';
    startDate: string;
    endDate: string;
    format?: 'CSV' | 'PDF' | 'EXCEL';
  }): Promise<{ url: string; expiresAt: string }> {
    const response = await apiService.post<{ url: string; expiresAt: string }>(
      `${API_ENDPOINTS.ADMIN.DASHBOARD}/reports`,
      params
    );
    return response.data ?? { url: '', expiresAt: new Date().toISOString() };
  }

  // System Configuration
  async updateSystemSettings(settings: {
    contentModeration: {
      autoModeration: boolean;
      profanityFilter: boolean;
      reviewThreshold: number;
    };
    recommendations: {
      maxProducts: number;
      minConfidence: number;
      priorityFactors: string[];
    };
    notifications: {
      maxPerDay: number;
      quietHours: { start: string; end: string };
    };
  }): Promise<void> {
    await apiService.put(
      `${API_ENDPOINTS.ADMIN.DASHBOARD}/settings`,
      settings
    );
  }
}

export const adminService = new AdminService();
