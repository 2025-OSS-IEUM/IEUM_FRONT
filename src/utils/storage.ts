import AsyncStorage from '@react-native-async-storage/async-storage';

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
  clearAuth: async () => {
    await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY, USER_INFO_KEY]);
  },
};

