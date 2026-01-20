import { Schedule } from '@/types/domain/schedules';
import { apiClient } from './apiClient';
import { APIResponse } from '@/types'; // Import from barrel file

// Filter Parameters for the Service
export interface ScheduleSearchParams {
      hospital_id?: string; // public_id or internal ID based on your API logic
      doctor_id?: string;   // doctor's public_id
      day_of_week?: number; // 0-6
      specialization_id?: string; // specialization's internal ID
      page?: number;
      limit?: number;
}

// API Response Structure
export interface ScheduleListResponse extends APIResponse<Schedule[]> {
      pagination: {
            totalCount: number;
            totalPages: number;
            currentPage: number;
            pageSize: number;
      };
      schedules: Schedule[];
}
export const scheduleService = {
      // 1. Get all schedules (with optional filters)
      getAll: async (params?: ScheduleSearchParams) => {
            const query = new URLSearchParams();

            if (params) {
                  if (params.hospital_id) query.append('hospital_id', params.hospital_id);
                  if (params.doctor_id) query.append('doctor_id', params.doctor_id);
                  if (params.day_of_week !== undefined) query.append('day_of_week', params.day_of_week.toString());
                  if (params.specialization_id) query.append('specialization_id', params.specialization_id);
                  if (params.page) query.append('page', params.page.toString());
                  if (params.limit) query.append('limit', params.limit.toString());
            }

            return apiClient.get<ScheduleListResponse>(`/schedules?${query.toString()}`);
      },

      // 2. (Optional) Get specific schedule details if needed later
      // getById: async (id: string) => { ... }
};