import apiClient from "./axios";

export const usersService = {
  // Get My Profile
  getMyProfile: async (): Promise<any> => {
    const response = await apiClient.get("/users/me");
    return response.data;
  },

  // Get User By Id
  getUserById: async (userId: string): Promise<any> => {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  },

  // Delete User
  deleteUser: async (): Promise<any> => {
    const response = await apiClient.delete("/users/delete");
    return response.data;
  },
};
