import { apiService } from './ApiService';
import { API_ENDPOINTS } from './ApiConfig';
import type { IngredientDTO } from '../../types/api';

export interface IngredientSearchParams {
  query?: string;
  riskLevel?: string;
  function?: string;
  page?: number;
  size?: number;
}

export interface IngredientAnalysisResult {
  ingredientId: number;
  riskLevel: string;
  concerns: string[];
  recommendations: string[];
  alternatives?: IngredientDTO[];
}

class IngredientService {
  async searchIngredients(params: IngredientSearchParams): Promise<IngredientDTO[]> {
    const queryParams = new URLSearchParams();
    if (params.query) queryParams.append('query', params.query);
    if (params.riskLevel) queryParams.append('riskLevel', params.riskLevel);
    if (params.function) queryParams.append('function', params.function);
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size) queryParams.append('size', params.size.toString());

    const response = await apiService.get<IngredientDTO[]>(`${API_ENDPOINTS.INGREDIENTS.SEARCH}?${queryParams}`);
    return response.data || [];
  }

  async getIngredientById(id: number): Promise<IngredientDTO> {
    const response = await apiService.get<IngredientDTO>(`${API_ENDPOINTS.INGREDIENTS.BASE}/${id}`);
    return response.data!;
  }

  async analyzeIngredients(ingredientIds: number[], userProfile?: { pregnant?: boolean; allergies?: string[] }): Promise<IngredientAnalysisResult[]> {
    const response = await apiService.post<IngredientAnalysisResult[]>(API_ENDPOINTS.INGREDIENTS.ANALYSIS, {
      ingredientIds,
      userProfile
    });
    return response.data || [];
  }

  async getSafeAlternatives(ingredientId: number): Promise<IngredientDTO[]> {
    const response = await apiService.get<IngredientDTO[]>(`${API_ENDPOINTS.INGREDIENTS.BASE}/${ingredientId}/alternatives`);
    return response.data || [];
  }

  async getIngredientInteractions(ingredientIds: number[]): Promise<{
    conflicts: { ingredients: [string, string], reason: string }[];
    synergies: { ingredients: [string, string], benefit: string }[];
  }> {
    const queryParams = new URLSearchParams();
    ingredientIds.forEach(id => queryParams.append('ids', id.toString()));

    const response = await apiService.get<{
      conflicts: { ingredients: [string, string], reason: string }[];
      synergies: { ingredients: [string, string], benefit: string }[];
    }>(`${API_ENDPOINTS.INGREDIENTS.BASE}/interactions?${queryParams}`);
    return response.data ?? { conflicts: [], synergies: [] };
  }
}

export const ingredientService = new IngredientService();
