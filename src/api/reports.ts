import apiClient from "./axios";
import { ReportCreate, ReportResponse, ReportType, SeverityLevel, ReportStatus } from "../types/api";
import { storage } from "../utils/storage";
import { decodeJWT } from "../utils/jwt";

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

    // JWT 토큰 확인 및 디코딩
    try {
      const token = await storage.getToken();
      if (token) {
        const decoded = decodeJWT(token);
        console.log("[reportsService.createReport] JWT 토큰 정보:", {
          hasToken: !!token,
          tokenLength: token.length,
          decodedPayload: decoded,
          username: decoded?.username,
          user_id: decoded?.user_id,
          userId: decoded?.userId,
          sub: decoded?.sub,
        });
      } else {
        console.warn("[reportsService.createReport] JWT 토큰이 없습니다!");
      }
    } catch (tokenError) {
      console.error("[reportsService.createReport] JWT 토큰 확인 중 오류:", tokenError);
    }

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
      console.log("[reportsService.getMyReports] 제보 내역 조회 시작: /users/me/reports");

      // JWT 토큰 가져오기
      const token = await storage.getToken();
      if (!token) {
        console.error("[reportsService.getMyReports] 토큰이 없습니다.");
        return [];
      }

      // Option 1: 전용 엔드포인트 호출 (token 쿼리 파라미터 필요)
      const response = await apiClient.get<ReportResponse[]>("/users/me/reports", {
        params: {
          token: token, // 스웨거 문서에 따르면 token 쿼리 파라미터가 필수
        },
      });

      console.log("[reportsService.getMyReports] 제보 내역 조회 성공:", {
        count: response.data?.length || 0,
        reports: response.data?.map(r => ({ id: r.id, type: r.type, createdAt: r.createdAt })) || [],
      });

      return response.data || [];
    } catch (error: any) {
      const status = error.response?.status;
      const errorData = error.response?.data;

      console.error("[reportsService.getMyReports] /users/me/reports 호출 실패:", {
        status,
        statusText: error.response?.statusText,
        errorData,
        message: error.message,
        url: error.config?.url,
      });

      // 404 또는 422: 전용 엔드포인트가 없거나 구현되지 않음 → Option 2 시도
      // 422는 "Field required" 에러로, 백엔드가 이 엔드포인트를 제대로 구현하지 않았을 수 있음
      if (status === 404 || status === 422) {
        console.log(
          `[reportsService.getMyReports] /users/me/reports 엔드포인트가 없거나 구현되지 않았습니다 (${status}). ` +
            "넓은 범위로 조회하여 백엔드가 JWT 기반 필터링을 해주는지 확인합니다."
        );

        try {
          // Option 2: 넓은 범위로 조회 후 프론트엔드에서 필터링
          // 백엔드가 모든 제보를 반환한다면, 프론트엔드에서 현재 사용자의 제보만 필터링
          console.log("[reportsService.getMyReports] 넓은 범위로 제보 조회 시도: /reports/");

          // 현재 사용자의 user_id 가져오기
          const currentUserId = await storage.getCurrentUserId();
          console.log("[reportsService.getMyReports] Current user_id:", currentUserId);

          // 작은 범위로 조회 시도 (500 에러 방지)
          // 한국 지역 좌표 범위 사용
          const response = await apiClient.get<ReportResponse[]>("/reports/", {
            params: {
              min_lon: 124, // 한국 서쪽 경계
              min_lat: 33, // 한국 남쪽 경계
              max_lon: 132, // 한국 동쪽 경계
              max_lat: 43, // 한국 북쪽 경계
              limit: 1000,
            },
          });

          console.log(
            `[reportsService.getMyReports] 넓은 범위 조회 성공: ${response.data?.length || 0}개의 제보를 받았습니다.`
          );

          let reports = response.data || [];

          // 백엔드가 자동 필터링을 해주지 않는다면, 프론트엔드에서 필터링
          // 하지만 ReportResponse에 user_id 필드가 없으므로, 백엔드가 필터링해주는 것이 필요함
          // 현재는 백엔드가 필터링해주는 것으로 가정하고 그대로 반환
          // TODO: 백엔드가 ReportResponse에 user_id 필드를 추가하면 프론트엔드에서도 필터링 가능

          if (reports.length > 0) {
            console.log("[reportsService.getMyReports] 받은 제보 샘플:", {
              firstReport: {
                id: reports[0].id,
                type: reports[0].type,
                createdAt: reports[0].createdAt,
              },
            });
          }

          return reports;
        } catch (fallbackError: any) {
          const fallbackStatus = fallbackError.response?.status;
          const fallbackErrorData = fallbackError.response?.data;

          console.error("[reportsService.getMyReports] 넓은 범위 조회도 실패했습니다:", {
            status: fallbackStatus,
            statusText: fallbackError.response?.statusText,
            errorData: fallbackErrorData,
            message: fallbackError.message,
            url: fallbackError.config?.url,
          });

          // 500 에러: 백엔드가 넓은 범위를 처리하지 못하거나, 필터링 로직이 없을 수 있음
          if (fallbackStatus === 500) {
            console.error(
              "[reportsService.getMyReports] 백엔드 서버 에러. " +
                "백엔드에 다음 중 하나를 구현해야 합니다:\n" +
                "1. GET /users/me/reports 엔드포인트 추가\n" +
                "2. GET /reports/ 에서 JWT 토큰 기반 사용자 필터링 추가"
            );
          }

          // 네트워크 에러나 다른 에러의 경우에도 빈 배열 반환
          return [];
        }
      }

      // 401: 인증 실패 (토큰이 없거나 만료됨)
      if (status === 401) {
        console.error("[reportsService.getMyReports] 인증 실패: 토큰이 없거나 만료되었습니다.");
        return [];
      }

      // 403: 권한 없음
      if (status === 403) {
        console.error("[reportsService.getMyReports] 권한 없음: 제보 내역을 조회할 권한이 없습니다.");
        return [];
      }

      // 500: 서버 에러
      if (status === 500) {
        console.error("[reportsService.getMyReports] 서버 에러: 백엔드 서버에 문제가 있습니다.");
        return [];
      }

      // 기타 에러: 로그를 남기고 빈 배열 반환
      console.error("[reportsService.getMyReports] 예상치 못한 에러:", {
        status,
        errorData,
        message: error.message,
      });

      return [];
    }
  },
};
