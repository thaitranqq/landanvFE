// This file holds mock data for properties that are not directly in IngredientDTO
// but are used by our frontend logic (e.g., for recommendations or specific warnings).
// In a real API integration, these might come from extended ingredient details or a separate endpoint.

interface IngredientEnhancement {
  solves?: string[];
  notes?: string; // e.g., 'pregnancy-unsafe'
}

export const mockIngredientEnhancements: { [inciName: string]: IngredientEnhancement } = {
  'Glycerin': { solves: ['Cải thiện kết cấu da'] },
  'Alcohol Denat.': {},
  'Silica': { solves: ['Lỗ chân lông to'] },
  'Zinc PCA': { solves: ['Giảm mụn'] },
  'Sodium Hyaluronate': { solves: ['Chống lão hóa', 'Cải thiện kết cấu da'] },
  'Retinol': { solves: ['Chống lão hóa', 'Thâm nám', 'Giảm mụn'], notes: 'pregnancy-unsafe' },
};
