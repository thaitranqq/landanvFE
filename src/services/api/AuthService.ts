import { apiService } from './ApiService';
import { API_ENDPOINTS } from './ApiConfig';
import type { AuthCredentials, LoginResponse, User } from '../../types/api';

class AuthService {
  async login(credentials: AuthCredentials): Promise<LoginResponse> {
    const response = await apiService.post<LoginResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials,
      { requiresAuth: false }
    );
    return response.data!;
  }

  async signup(credentials: AuthCredentials): Promise<void> {
    await apiService.post(API_ENDPOINTS.AUTH.REGISTER, credentials, { requiresAuth: false });
  }

  async getMe(): Promise<User> {
    const response = await apiService.get<User>(API_ENDPOINTS.AUTH.ME);
    return response.data!;
  }
}

export const authService = new AuthService();
