import { apiRequest } from './client';
import { User } from '../types';

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
}

export const authApi = {
  login: (email: string, password: string): Promise<AuthResponse> =>
    apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (
    email: string,
    password: string,
    confirmPassword: string
  ): Promise<AuthResponse> =>
    apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, confirmPassword }),
    }),

  uwoLogin: (data: {
    email: string;
    name?: string;
    uwo_token?: string;
    uwo_user_id?: string;
  }): Promise<AuthResponse> =>
    apiRequest<AuthResponse>('/auth/uwo-login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateProfile: (profileData: Partial<User>): Promise<{ success: boolean; user: User }> =>
    apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),
};
