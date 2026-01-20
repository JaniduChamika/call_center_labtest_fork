// src/services/hospitalService.ts
import { apiClient } from './apiClient';
import { Hospital, APIResponse } from '@/types';

// Define search/filter parameters
interface HospitalSearchParams {
  city?: string;
  name?: string; // Partial match
  page?: number;
  limit?: number;
}

// Define the response shape based on your API logic
interface HospitalListResponse extends APIResponse<Hospital[]> {
  filters: { city?: string; name?: string };
  // The APIResponse wrapper already includes 'pagination' if you updated it as suggested,
  // but if not, we can explicitly add it here:
  pagination: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
  hospitals: Hospital[]; // Your API might return data in 'hospitals' key specifically
}

export const hospitalService = {
  // 1. Get all hospitals with filters & pagination
  getAll: async (params?: HospitalSearchParams) => {
    const query = new URLSearchParams();
    if (params) {
      if (params.city) query.append('city', params.city);
      if (params.name) query.append('name', params.name);
      if (params.page) query.append('page', params.page.toString());
      if (params.limit) query.append('limit', params.limit.toString());
    }
    return apiClient.get<HospitalListResponse>(`/hospitals?${query.toString()}`);
  },

  // 2. Get a single hospital by ID (if you need a details page)
  getById: async (id: string) => {
    return apiClient.get<{ message: string; hospital: Hospital }>(`/hospitals/${id}`);
  },
};