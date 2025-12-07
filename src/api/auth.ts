import apiClient from "./axios";
import {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  UserInDB,
  CheckAvailabilityResponse,
  UsernameLookupRequest,
  UsernameLookupResponse,
  PasswordResetRequest,
  PasswordResetResponse,
  PasswordResetConfirmRequest,
  PasswordResetConfirmResponse,
} from "../types/api";

export const authService = {
  // Get Auth Status
  getAuthStatus: async (): Promise<string> => {
    const response = await apiClient.get<string>("/auth/status");
    return response.data;
  },

  // Signup
  signup: async (data: SignupRequest): Promise<UserInDB> => {
    const response = await apiClient.post<UserInDB>("/auth/signup", data);
    return response.data;
  },

  // Login
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>("/auth/login", data);
    return response.data;
  },

  // Check Username Availability
  checkUsername: async (username: string): Promise<CheckAvailabilityResponse> => {
    const response = await apiClient.get<CheckAvailabilityResponse>("/auth/check-username", {
      params: { username },
    });
    return response.data;
  },

  // Check Email Availability
  checkEmail: async (email: string): Promise<CheckAvailabilityResponse> => {
    const response = await apiClient.get<CheckAvailabilityResponse>("/auth/check-email", {
      params: { email },
    });
    return response.data;
  },

  // Username Lookup
  lookupUsername: async (data: UsernameLookupRequest): Promise<UsernameLookupResponse> => {
    const response = await apiClient.post<UsernameLookupResponse>("/auth/username/lookup", data);
    return response.data;
  },

  // Request Password Reset
  requestPasswordReset: async (data: PasswordResetRequest): Promise<PasswordResetResponse> => {
    const response = await apiClient.post<PasswordResetResponse>("/auth/password/reset", data);
    return response.data;
  },

  // Confirm Password Reset
  confirmPasswordReset: async (data: PasswordResetConfirmRequest): Promise<PasswordResetConfirmResponse> => {
    const response = await apiClient.post<PasswordResetConfirmResponse>("/auth/password/confirm", data);
    return response.data;
  },
};
