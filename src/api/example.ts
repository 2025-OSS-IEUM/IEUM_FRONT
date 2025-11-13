import apiClient from './axios';
import { ApiResponse } from '../types';

// 예제 API 서비스
export const exampleService = {
  // GET 요청 예제
  getData: async <T>(): Promise<ApiResponse<T>> => {
    const response = await apiClient.get('/example');
    return response.data;
  },

  // POST 요청 예제
  postData: async <T>(data: unknown): Promise<ApiResponse<T>> => {
    const response = await apiClient.post('/example', data);
    return response.data;
  },

  // PUT 요청 예제
  putData: async <T>(id: string, data: unknown): Promise<ApiResponse<T>> => {
    const response = await apiClient.put(`/example/${id}`, data);
    return response.data;
  },

  // DELETE 요청 예제
  deleteData: async <T>(id: string): Promise<ApiResponse<T>> => {
    const response = await apiClient.delete(`/example/${id}`);
    return response.data;
  },
};

