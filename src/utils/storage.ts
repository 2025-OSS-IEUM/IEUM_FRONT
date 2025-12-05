import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserIdFromToken } from './jwt';

const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_INFO_KEY = 'userInfo';

export const storage = {
  setToken: async (token: string) => {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  },
  getToken: async () => {
    return await AsyncStorage.getItem(TOKEN_KEY);
  },
  removeToken: async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
  },
  setRefreshToken: async (token: string) => {
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, token);
  },
  getRefreshToken: async () => {
    return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  },
  removeRefreshToken: async () => {
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
  },
  setUserInfo: async (user: any) => {
    await AsyncStorage.setItem(USER_INFO_KEY, JSON.stringify(user));
  },
  getUserInfo: async () => {
    const user = await AsyncStorage.getItem(USER_INFO_KEY);
    return user ? JSON.parse(user) : null;
  },
  /**
   * 현재 로그인한 사용자의 user_id를 가져옵니다.
   * 1. storage의 userInfo에서 user_id 추출 시도
   * 2. 실패 시 JWT 토큰에서 user_id 추출 시도
   * @returns user_id 또는 null
   */
  getCurrentUserId: async (): Promise<string | null> => {
    try {
      // 1. storage의 userInfo에서 user_id 추출
      const userInfo = await storage.getUserInfo();
      if (userInfo) {
        const userId = userInfo.user_id || userInfo.userId || userInfo.id;
        if (userId) {
          console.log("[storage.getCurrentUserId] Found user_id from storage:", userId);
          return userId;
        }
      }

      // 2. JWT 토큰에서 user_id 추출
      const token = await storage.getToken();
      if (token) {
        const userIdFromToken = getUserIdFromToken(token);
        if (userIdFromToken) {
          console.log("[storage.getCurrentUserId] Found user_id from JWT token:", userIdFromToken);
          return userIdFromToken;
        }
      }

      console.warn("[storage.getCurrentUserId] Could not find user_id");
      return null;
    } catch (error) {
      console.error("[storage.getCurrentUserId] Error getting user_id:", error);
      return null;
    }
  },
  clearAuth: async () => {
    await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY, USER_INFO_KEY]);
  },
};

