// src/services/specializationService.ts
import { apiClient } from './apiClient';
import { Specialization } from '@/types'; // Ensure you have this type defined

interface SpecializationResponse {
  message: string;
  generatedAt: string;
  specializations: Specialization[];
}

export const specializationService = {
  // Get all specializations (for dropdowns)
  getAll: async () => {
    return apiClient.get<SpecializationResponse>('/specializations');
  },
};