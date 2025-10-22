import type { Product as ApiProduct, ProductDTO, IngredientDTO } from '../types/api';
import type { ProfileDTO } from '../types/api';

// Accept either fully enhanced Product or ProductDTO-like objects
export const getRecommendedProducts = (products: (ApiProduct | ProductDTO)[], profile: ProfileDTO): ApiProduct[] => {
  const recommendations = products.map(product => {
    // Use safe accessors; skinTypeScore may be missing on ProductDTO
    const skinScore = (product as ApiProduct).skinTypeScore ? (product as ApiProduct).skinTypeScore[profile.skinType] || 0 : 0;
    let score = 0;
    score += skinScore;

    const ingredients: (IngredientDTO & { solves?: string[]; notes?: string })[] = (product as ApiProduct).ingredients || [];

    // 2. Check for allergens (heavy penalty)
    const hasAllergen = ingredients.some(ing =>
      profile.allergies.includes((ing.inciName || '').toLowerCase().trim())
    );
    if (hasAllergen) score -= 100;

    // 3. Pregnancy unsafe
    if (profile.pregnant) {
      const hasPregnancyUnsafe = ingredients.some(ing => ing.notes === 'pregnancy-unsafe');
      if (hasPregnancyUnsafe) score -= 200;
    }

    // 4. Concerns
    (profile.concerns || []).forEach(concern => {
      const hasSolvingIngredient = ingredients.some(ing => ing.solves?.includes(concern));
      if (hasSolvingIngredient) score += 3;
    });

    // 5. Goals
    (profile.goals || []).forEach(goal => {
      const hasGoalIngredient = ingredients.some(ing => ing.solves?.includes(goal));
      if (hasGoalIngredient) score += 5;
    });

    return { ...(product as ApiProduct), recommendationScore: score } as ApiProduct;
  });

  return recommendations
    .filter(p => (p.recommendationScore || 0) > -50)
    .sort((a, b) => (b.recommendationScore || 0) - (a.recommendationScore || 0));
};
