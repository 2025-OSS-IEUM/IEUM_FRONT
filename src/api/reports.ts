import apiClient from "./axios";
import { ReportCreate, ReportResponse, ReportType, SeverityLevel, ReportStatus } from "../types/api";

export const reportsService = {
  createReport: async (data: ReportCreate): Promise<ReportResponse> => {
    console.log("[reportsService.createReport] 제보 생성 요청:", {
      type: data.type,
      description: data.description,
      location: data.location,
      photoUrls: data.photoUrls?.length || 0,
      severity: data.severity,
      status: data.status,
    });

    try {
      const response = await apiClient.post<ReportResponse>("/reports/", data);

      console.log("[reportsService.createReport] 제보 생성 성공:", {
        id: response.data.id,
        createdAt: response.data.createdAt,
        status: response.data.status,
        fullResponse: response.data,
      });

      return response.data;
    } catch (error: any) {
      console.error("[reportsService.createReport] 제보 생성 실패:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        errorData: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  getReports: async (params: {
    min_lon: number;
    min_lat: number;
    max_lon: number;
    max_lat: number;
    type?: ReportType;
    severity?: SeverityLevel;
    status?: ReportStatus;
    limit?: number;
  }): Promise<ReportResponse[]> => {
    const response = await apiClient.get<ReportResponse[]>("/reports/", {
      params,
    });
    return response.data;
  },

  // Get current user's reports
  // 백엔드가 제보 생성 시 JWT 토큰에서 user_id를 추출해서 저장한다면,
  // GET /reports/ 호출 시에도 JWT 토큰을 확인해서 현재 사용자의 제보만 필터링해줄 수 있습니다.
  // 또는 GET /users/me/reports 엔드포인트를 추가해야 합니다.
  getMyReports: async (): Promise<ReportResponse[]> => {
    try {
      // Option 1: 전용 엔드포인트 시도 (백엔드가 구현했다면)
      const response = await apiClient.get<ReportResponse[]>("/users/me/reports");
      return response.data;
    } catch (error: any) {
      // 404: 전용 엔드포인트가 없음 → Option 2 시도
      if (error.response?.status === 404) {
        console.log(
          "[reportsService.getMyReports] /users/me/reports 엔드포인트가 없습니다. " +
            "넓은 범위로 조회하여 백엔드가 JWT 기반 필터링을 해주는지 확인합니다."
        );

        try {
          // Option 2: 넓은 범위로 조회 (백엔드가 JWT 토큰에서 user_id를 추출해서 필터링해줄 것으로 기대)
          // 백엔드가 제보 생성 시 JWT에서 user_id를 저장한다면, 조회 시에도 필터링해줄 수 있습니다.
          const response = await apiClient.get<ReportResponse[]>("/reports/", {
            params: {
              min_lon: -180,
              min_lat: -90,
              max_lon: 180,
              max_lat: 90,
              limit: 1000,
            },
          });

          // 백엔드가 자동 필터링을 해준다면 여기서 현재 사용자의 제보만 반환됩니다.
          // 만약 모든 제보가 반환된다면, 백엔드에 필터링 로직 추가가 필요합니다.
          console.log(`[reportsService.getMyReports] ${response.data.length}개의 제보를 받았습니다.`);
          return response.data;
        } catch (fallbackError: any) {
          console.error(
            "[reportsService.getMyReports] 넓은 범위 조회도 실패했습니다:",
            fallbackError.response?.status,
            fallbackError.response?.data
          );

          // 500 에러: 백엔드가 넓은 범위를 처리하지 못하거나, 필터링 로직이 없을 수 있음
          if (fallbackError.response?.status === 500) {
            console.error(
              "[reportsService.getMyReports] 백엔드 서버 에러. " +
                "백엔드에 다음 중 하나를 구현해야 합니다:\n" +
                "1. GET /users/me/reports 엔드포인트 추가\n" +
                "2. GET /reports/ 에서 JWT 토큰 기반 사용자 필터링 추가"
            );
          }

          return [];
        }
      }

      // 다른 에러는 그대로 throw
      throw error;
    }
  },
};
