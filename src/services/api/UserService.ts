import { apiService } from './ApiService';
import { API_ENDPOINTS } from './ApiConfig';
import type { ProfileDTO } from '../../types/api';

export interface SkinAnalysisResult {
  skinType: string;
  concerns: string[];
  recommendations: {
    ingredients: { focus: string[]; avoid: string[] };
    products: number[]; // Product IDs
    lifestyle: string[];
  };
}

export interface UserPreferences {
  notificationSettings: {
    pushEnabled: boolean;
    emailEnabled: boolean;
    routineReminders: boolean;
    productAlerts: boolean;
  };
  privacySettings: {
    shareProfile: boolean;
    shareReviews: boolean;
    shareRoutines: boolean;
  };
}

class UserService {
  async getProfile(): Promise<ProfileDTO> {
    const response = await apiService.get<ProfileDTO>(API_ENDPOINTS.USER.PROFILE);
    return response.data!;
  }

  async updateProfile(profile: Partial<ProfileDTO>): Promise<ProfileDTO> {
    const response = await apiService.put<ProfileDTO>(API_ENDPOINTS.USER.PROFILE, profile);
    return response.data!;
  }

  async analyzeSkinImage(imageData: FormData): Promise<SkinAnalysisResult> {
    const response = await apiService.post<SkinAnalysisResult>(
      `${API_ENDPOINTS.USER.PROFILE}/skin-analysis`,
      imageData,
      {
        headers: {
          // Remove default JSON content type for FormData
          'Content-Type': undefined,
        },
      }
    );
    return response.data!;
  }

  async updatePreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const response = await apiService.put<UserPreferences>(
      API_ENDPOINTS.USER.PREFERENCES,
      preferences
    );
    return response.data!;
  }

  async updateAllergies(allergies: string[]): Promise<ProfileDTO> {
    const response = await apiService.put<ProfileDTO>(
      API_ENDPOINTS.USER.ALLERGIES,
      { allergies }
    );
    return response.data!;
  }

  async getPersonalizedRecommendations(): Promise<{
    ingredients: { focus: string[]; avoid: string[] };
    products: number[];
    routines: number[];
  }> {
    const response = await apiService.get<{
      ingredients: { focus: string[]; avoid: string[] };
      products: number[];
      routines: number[];
    }>(`${API_ENDPOINTS.USER.PROFILE}/recommendations`);

    // Ensure we always return a correctly shaped object
    return (response.data as {
      ingredients: { focus: string[]; avoid: string[] };
      products: number[];
      routines: number[];
    }) || { ingredients: { focus: [], avoid: [] }, products: [], routines: [] };
  }

  // AI-powered skin condition tracking
  async trackSkinCondition(data: {
    date: string;
    images: string[];
    symptoms: string[];
    products: number[];
    notes: string;
  }): Promise<{
    analysis: {
      changes: { type: string; severity: string }[];
      recommendations: string[];
    };
  }> {
    const response = await apiService.post<{
      analysis: {
        changes: { type: string; severity: string }[];
        recommendations: string[];
      };
    }>(`${API_ENDPOINTS.USER.PROFILE}/skin-tracking`, data);

    // Provide a fallback shape if the server returned an empty payload
    return (response.data as {
      analysis: {
        changes: { type: string; severity: string }[];
        recommendations: string[];
      };
    }) || { analysis: { changes: [], recommendations: [] } };
  }
}

export const userService = new UserService();
