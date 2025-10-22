import { apiService } from './ApiService';
import { API_ENDPOINTS } from './ApiConfig';
import type { RoutineDTO, RoutineItemDTO } from '../../types/api';

export interface RoutineAnalysis {
  completeness: number;  // 0-100%
  productInteractions: {
    conflictingProducts: [number, number][];
    recommendations: string[];
  };
  timeOptimization: {
    morningDuration: number;
    eveningDuration: number;
    suggestions: string[];
  };
  effectiveness: {
    targetedConcerns: string[];
    missingConcerns: string[];
    recommendedAdditions: {
      concern: string;
      productSuggestions: number[];
    }[];
  };
}

class RoutineService {
  async getRoutines(): Promise<RoutineDTO[]> {
    const response = await apiService.get<RoutineDTO[]>(API_ENDPOINTS.ROUTINES.BASE);
    return response.data || [];
  }

  async getRoutineById(routineId: number): Promise<RoutineDTO> {
    const response = await apiService.get<RoutineDTO>(`${API_ENDPOINTS.ROUTINES.BASE}/${routineId}`);
    return response.data!;
  }

  async createRoutine(data: { title: string; items?: RoutineItemDTO[] }): Promise<RoutineDTO> {
    const response = await apiService.post<RoutineDTO>(API_ENDPOINTS.ROUTINES.BASE, data);
    return response.data!;
  }

  async updateRoutine(routineId: number, data: Partial<RoutineDTO>): Promise<RoutineDTO> {
    const response = await apiService.put<RoutineDTO>(`${API_ENDPOINTS.ROUTINES.BASE}/${routineId}`, data);
    return response.data!;
  }

  async deleteRoutine(routineId: number): Promise<void> {
    await apiService.delete(`${API_ENDPOINTS.ROUTINES.BASE}/${routineId}`);
  }

  async addItemToRoutine(routineId: number, item: Omit<RoutineItemDTO, 'routineId'>): Promise<RoutineDTO> {
    const response = await apiService.post<RoutineDTO>(
      `${API_ENDPOINTS.ROUTINES.BASE}/${routineId}/items`,
      item
    );
    return response.data!;
  }

  async updateRoutineItem(
    routineId: number,
    productId: number,
    update: Partial<RoutineItemDTO>
  ): Promise<RoutineDTO> {
    const response = await apiService.put<RoutineDTO>(
      `${API_ENDPOINTS.ROUTINES.BASE}/${routineId}/items/${productId}`,
      update
    );
    return response.data!;
  }

  async removeItemFromRoutine(routineId: number, productId: number): Promise<void> {
    await apiService.delete(
      `${API_ENDPOINTS.ROUTINES.BASE}/${routineId}/items/${productId}`
    );
  }

  async analyzeRoutine(routineId: number): Promise<RoutineAnalysis> {
    const response = await apiService.get<RoutineAnalysis>(
      `${API_ENDPOINTS.ROUTINES.BASE}/${routineId}/analysis`
    );
    return response.data!;
  }

  async reorderItems(routineId: number, itemOrder: { productId: number; step: number }[]): Promise<RoutineDTO> {
    const response = await apiService.put<RoutineDTO>(
      `${API_ENDPOINTS.ROUTINES.BASE}/${routineId}/items/order`,
      { items: itemOrder }
    );
    return response.data!;
  }
}

export const routineService = new RoutineService();
