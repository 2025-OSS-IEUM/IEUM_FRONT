import axios from "axios";

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || "https://lakisha-techiest-unmercurially.ngrok-free.dev",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true", // ngrok-free.dev를 위한 헤더
  },
});

import { storage } from "../utils/storage";

// 요청 인터셉터
apiClient.interceptors.request.use(
  async config => {
    // 인증이 필요한 요청에만 토큰 추가 (회원가입, 로그인 등은 제외)
    const publicEndpoints = [
      "/auth/signup",
      "/auth/login",
      "/auth/check-username",
      "/auth/check-email",
      "/auth/username/lookup",
      "/auth/password/reset",
      "/auth/password/confirm",
    ];
    const isPublicEndpoint = publicEndpoints.some(endpoint => config.url?.includes(endpoint));

    if (!isPublicEndpoint) {
      const token = await storage.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
apiClient.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    // 에러 처리 - 상세한 로그
    if (error.response) {
      const status = error.response.status;
      const url = `${error.config?.baseURL}${error.config?.url}`;
      const method = error.config?.method?.toUpperCase() || "UNKNOWN";

      if (status >= 500) {
        console.error(`[API Error] ${status} ${method} ${url}`);
        console.error(`[API Error] Response Data:`, error.response.data);
        console.error(`[API Error] Request Data:`, error.config?.data);
      } else if (status >= 400) {
        console.warn(`[API Error] ${status} ${method} ${url}`);
        if (error.response.data) {
          console.warn(`[API Error] Response:`, error.response.data);
        }
      }
    } else if (error.request) {
      console.error(`[Network Error] ${error.config?.baseURL}${error.config?.url}`);
      console.error(`[Network Error] Request:`, error.request);
    } else {
      console.error(`[API Error]`, error.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
