import apiClient from "./axios";
import { RouteRequest, RouteResponse, SafeRouteResponse, RerouteRequest } from "../types/api";
import { AxiosError } from "axios";

export const routesService = {
  // Get Route Candidates (Kakao Directions)
  getRouteCandidates: async (data: RouteRequest): Promise<RouteResponse> => {
    try {
      const response = await apiClient.post<RouteResponse>("/route/", data);
      return response.data;
    } catch (error) {
      // AxiosError를 더 자세히 처리
      if (error instanceof AxiosError) {
        const status = error.response?.status;
        const statusText = error.response?.statusText;
        const errorData = error.response?.data;

        console.error("[routesService.getRouteCandidates] 경로 조회 실패:", {
          status,
          statusText,
          errorData,
          message: error.message,
          url: error.config?.url,
        });

        // 사용자 친화적인 에러 메시지와 함께 에러를 재throw
        const errorMessage =
          status === 400
            ? "잘못된 경로 요청입니다"
            : status === 404
            ? "경로를 찾을 수 없습니다"
            : status === 500
            ? "서버 오류가 발생했습니다"
            : status === 503
            ? "서비스를 일시적으로 사용할 수 없습니다"
            : error.message || "경로 조회에 실패했습니다";

        const enhancedError = new Error(errorMessage);
        (enhancedError as any).originalError = error;
        (enhancedError as any).status = status;
        throw enhancedError;
      }
      throw error;
    }
  },

  // Get Safe Route With Scores
  getSafeRouteWithScores: async (data: RouteRequest): Promise<SafeRouteResponse> => {
    try {
      console.log("[routesService.getSafeRouteWithScores] 안전 경로 조회 요청:", data);

      // Note: Using /routes/reroute because it accepts coordinates and returns safe routes with scores.
      // The /routes/safe endpoint expects 'routes' array which we want to avoid building in frontend.
      const payload: RerouteRequest = {
        current_lat: data.start_lat,
        current_lon: data.start_lon,
        dest_lat: data.end_lat,
        dest_lon: data.end_lon,
      };

      const response = await apiClient.post<SafeRouteResponse>("/routes/reroute", payload);

      console.log("[routesService.getSafeRouteWithScores] 안전 경로 조회 성공:", {
        routesCount: response.data.routes?.length || 0,
        bestRouteIndex: response.data.bestRouteIndex,
        routes: response.data.routes?.map(r => ({
          distance: r.distance,
          duration: r.duration,
          safetyScore: r.safetyScore,
          pathSegments: r.path?.length || 0,
        })),
      });

      return response.data;
    } catch (error) {
      // AxiosError를 더 자세히 처리
      if (error instanceof AxiosError) {
        const status = error.response?.status;
        const statusText = error.response?.statusText;
        const errorData = error.response?.data;

        console.error("[routesService.getSafeRouteWithScores] 안전 경로 조회 실패:", {
          status,
          statusText,
          errorData,
          message: error.message,
          url: error.config?.url,
        });

        // 사용자 친화적인 에러 메시지와 함께 에러를 재throw
        const errorMessage =
          status === 400
            ? "잘못된 경로 요청입니다"
            : status === 404
            ? "안전 경로를 찾을 수 없습니다"
            : status === 500
            ? "서버 오류가 발생했습니다"
            : status === 503
            ? "서비스를 일시적으로 사용할 수 없습니다"
            : error.message || "안전 경로 조회에 실패했습니다";

        const enhancedError = new Error(errorMessage);
        (enhancedError as any).originalError = error;
        (enhancedError as any).status = status;
        throw enhancedError;
      }
      throw error;
    }
  },
};
