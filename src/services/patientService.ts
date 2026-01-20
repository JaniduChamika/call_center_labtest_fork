// src/services/patientService.ts
import { apiClient } from './apiClient';
import { Patient } from '@/types'; // Import your shared types

// Define the shape of the search parameters
interface PatientSearchParams {
  search?: string; // Single search term (name, phone, or NIC)
  page?: number;
  limit?: number;
}

// Define the shape of the response wrapper (based on your API structure)
interface PatientsResponse {
  message: string;
  filters: { search?: string };
  pagination: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
  patients: Patient[];
}

export const patientService = {
  
  // 1. Search for patients (GET /api/patients?search=...)
  search: async (params: PatientSearchParams) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());

    return apiClient.get<PatientsResponse>(`/patients?${query.toString()}`);
  },

  // 2. Get a single patient by NIC (GET /api/patients/[nic])
  getByNIC: async (nic: string) => {
    return apiClient.get<{ message: string; patient: Patient }>(`/patients/${nic}`);
  },

  // 3. Create a new patient (POST /api/patients)
  // Note: Usually handled via appointments/create, but this is for standalone creation
  create: async (data: { name: string; phone_number: string; email?: string; nic?: string }) => {
    return apiClient.post<{ message: string; patient: Patient }>('/patients', data);
  },
};