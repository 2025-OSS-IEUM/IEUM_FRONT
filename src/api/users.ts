import apiClient from "./axios";
import { AxiosError } from "axios";

export const usersService = {
  // Get My Profile
  getMyProfile: async (): Promise<any> => {
    try {
      const response = await apiClient.get("/users/me");
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("[usersService.getMyProfile] 프로필 조회 실패:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          errorData: error.response?.data,
          message: error.message,
        });
      }
      throw error;
    }
  },

  // Get User By Id
  getUserById: async (userId: string): Promise<any> => {
    try {
      const response = await apiClient.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("[usersService.getUserById] 사용자 조회 실패:", {
          userId,
          status: error.response?.status,
          statusText: error.response?.statusText,
          errorData: error.response?.data,
          message: error.message,
        });
      }
      throw error;
    }
  },

  // Delete User
  deleteUser: async (): Promise<any> => {
    try {
      const response = await apiClient.delete("/users/delete");
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("[usersService.deleteUser] 회원 탈퇴 실패:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          errorData: error.response?.data,
          message: error.message,
        });
      }
      throw error;
    }
  },
};
