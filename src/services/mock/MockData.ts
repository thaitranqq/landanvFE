import type { ProductDTO, IngredientDTO, ProfileDTO, RoutineDTO } from '../../types/api';

export const mockProducts: ProductDTO[] = [
  {
    id: 1,
    name: "Kem chống nắng La Roche-Posay Anthelios",
    upcEan: "3337875761131",
    category: "Chống nắng",
    imageUrl: "https://i.imgur.com/example1.jpg",
    country: "France",
    brandId: 1,
    brandName: "La Roche-Posay",
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    name: "Sữa rửa mặt Cetaphil Gentle Skin Cleanser",
    upcEan: "0299990003",
    category: "Làm sạch",
    imageUrl: "https://i.imgur.com/example2.jpg",
    country: "Canada",
    brandId: 2,
    brandName: "Cetaphil",
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    name: "Serum The Ordinary Niacinamide 10% + Zinc 1%",
    upcEan: "0639421019",
    category: "Serum",
    imageUrl: "https://i.imgur.com/example3.jpg",
    country: "Canada",
    brandId: 3,
    brandName: "The Ordinary",
    createdAt: new Date().toISOString()
  }
];

export const mockIngredients: IngredientDTO[] = [
  {
    id: 1,
    inciName: "Niacinamide",
    aliasVi: "Vitamin B3",
    descriptionVi: "Một dạng vitamin B3, giúp cải thiện lỗ chân lông to, giảm tiết dầu và làm đều màu da.",
    functions: "Chống viêm, Điều tiết bã nhờn, Làm sáng da",
    riskLevel: "Tốt",
    bannedIn: "",
    typicalRange: "2-10%",
    sources: "Nghiên cứu khoa học"
  },
  {
    id: 2,
    inciName: "Butylene Glycol",
    aliasVi: "Butylene Glycol",
    descriptionVi: "Hoạt chất giữ ẩm và làm mềm da thường gặp trong mỹ phẩm.",
    functions: "Giữ ẩm, Làm mềm da",
    riskLevel: "Trung bình",
    bannedIn: "",
    typicalRange: "1-5%",
    sources: "Cosmetic Ingredient Review"
  }
];

export const mockRoutines: RoutineDTO[] = [
  {
    id: 1,
    userId: 1,
    title: "Routine buổi sáng",
    items: [
      { routineId: 1, productId: 2, step: 1, timeOfDay: "Sáng" },
      { routineId: 1, productId: 1, step: 2, timeOfDay: "Sáng" }
    ]
  }
];

export const mockUserProfile: ProfileDTO = {
  userId: 1,
  skinType: "COMBINATION",
  concerns: ["Mụn", "Lỗ chân lông to"],
  allergies: ["alcohol", "fragrance"],
  pregnant: false,
  goals: ["Làm sáng da"],
  lifestyle: {}
};

export class MockApiService {
  private static delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async simulateApiCall<T>(data: T, errorRate: number = 0.1): Promise<T> {
    await this.delay(Math.random() * 1000); // Random delay 0-1000ms

    if (Math.random() < errorRate) {
      throw new Error("API Error: Internal Server Error");
    }

    return data;
  }

  static async getProducts() {
    return this.simulateApiCall(mockProducts);
  }

  static async getIngredients() {
    return this.simulateApiCall(mockIngredients);
  }

  static async getRoutines() {
    return this.simulateApiCall(mockRoutines);
  }

  static async getUserProfile() {
    return this.simulateApiCall(mockUserProfile);
  }
}
