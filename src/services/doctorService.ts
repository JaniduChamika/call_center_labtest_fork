import { apiClient } from './apiClient';
import { Doctor } from '@/types';
export interface TimeSlot {
  slot: string;   // "14.00 - 14.10"
  status: "Available" | "Reserved";
}
export interface AvailabilityResponse {
  date: string;
  hospital_id: string;
  slots: TimeSlot[];
}
export const doctorService = {
  // Get all doctors
  getAll: async () => {
    return apiClient.get<{ doctors: Doctor[] }>('/doctors');
  },

  // Get by ID
  getById: async (id: string) => {
    return apiClient.get<{ doctor: Doctor }>(`/doctors/${id}`);
  },

  // Search/Filter
  search: async (params: { city?: string; name?: string }) => {
    const queryString = new URLSearchParams(params as any).toString();
    return apiClient.get<{ doctors: Doctor[] }>(`/doctors?${queryString}`);
  },
  getAvailability: async (publicDoctorId: string, hospitalId: string, date: string) => {
    // URL: /doctors/DOC-001/availability?hospital=HOSP-001&date=2025-12-21
    return apiClient.get<AvailabilityResponse>(
      `/doctors/${publicDoctorId}/available?hospital=${hospitalId}&date=${date}`
    );
  },
};