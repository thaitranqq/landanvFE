import { apiService } from './ApiService';
import { API_ENDPOINTS } from './ApiConfig';
import type { PageProductDTO, Product } from '../../types/api';

interface ProductSearchParams {
  query?: string;
  page?: number;
  size?: number;
  sort?: string;
  skinType?: string;
  concerns?: string[];
}

class ProductService {
  async searchProducts(params: ProductSearchParams): Promise<PageProductDTO> {
    // Create a clean params object, excluding any undefined or null values.
    const cleanParams: Record<string, string> = {
      page: (params.page ?? 0).toString(),
      size: (params.size ?? 20).toString(),
      sort: params.sort || 'name,asc'
    };
    if (params.query) cleanParams.query = params.query;
    if (params.skinType) cleanParams.skinType = params.skinType;
    if (params.concerns && params.concerns.length > 0) cleanParams.concerns = params.concerns.join(',');

    const queryParams = new URLSearchParams(cleanParams).toString();

    const response = await apiService.get<PageProductDTO>(
      `${API_ENDPOINTS.PRODUCTS.BASE}?${queryParams}`
    );
    if (!response.data) {
      throw new Error('API response data for search products is empty or invalid.');
    }
    return response.data;
  }

  async getProductById(productId: number): Promise<Product> {
    const response = await apiService.get<Product>(
      `${API_ENDPOINTS.PRODUCTS.BASE}/${productId}`
    );
    if (!response.data) {
      throw new Error(`API response data for product ${productId} is empty or invalid.`);
    }
    return response.data;
  }

  // Restored the barcode search method
  async getProductByBarcode(barcode: string): Promise<Product> {
    const response = await apiService.get<Product>(
      `${API_ENDPOINTS.PRODUCTS.BARCODE}/${barcode}`
    );
    if (!response.data) {
      throw new Error(`API response data for barcode ${barcode} is empty or invalid.`);
    }
    return response.data;
  }
}

export const productService = new ProductService();
