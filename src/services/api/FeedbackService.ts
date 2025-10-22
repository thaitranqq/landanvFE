import { apiService } from './ApiService';
import { API_ENDPOINTS } from './ApiConfig';
import type { Feedback } from '../../types/api';

// Define a type for the feedback data to be submitted
interface FeedbackCreateRequest {
  userId: number;
  productId: number;
  rating: number;
  comment: string;
  status: string;
}

class FeedbackService {
  async getFeedbackForProduct(productId: number): Promise<Feedback[]> {
    const response = await apiService.get<Feedback[]>(
      // Using the correct endpoint for fetching feedback by product ID
      `${API_ENDPOINTS.FEEDBACK.BASE}/product/${productId}`
    );
    return response.data || [];
  }

  async submitFeedback(feedbackData: FeedbackCreateRequest): Promise<Feedback> {
    const response = await apiService.post<Feedback>(API_ENDPOINTS.FEEDBACK.BASE, feedbackData);
    return response.data!;
  }
}

export const feedbackService = new FeedbackService();
