// src/services/illnessService.ts
import { apiClient } from './apiClient';
import { Illness } from '@/types'; // Ensure you have this type defined

interface IllnessResponse {
  message: string;
  generatedAt: string;
  illnesses: Illness[];
}

export const illnessService = {
  // Get all illnesses (usually for a dropdown or search filter)
  getAll: async () => {
    return apiClient.get<IllnessResponse>('/illnesses');
  },
};