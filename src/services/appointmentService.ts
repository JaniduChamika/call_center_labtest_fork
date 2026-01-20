import { apiClient } from './apiClient';
import { Appointment, CreateAppointmentRequest } from '@/types'; // Your types
export interface CreateAppointmentPayload {
  patient_id: string | null;
  patient_details?: {
    name: string;
    phone_number: string;
    email?: string;
    nic: string;
    refundProtection?: boolean;//////udan damme
  } | null;
  appointment: {
    doctor_id: string;
    hospital_id: string;
    start_time: string; // ISO String
    // end_time is calculated on backend, so it's optional or ignored here
  };
}

export const appointmentService = {
  // Create a new booking
  create: async (payload: CreateAppointmentPayload) => {
    console.log("Creating appointment with payload:", payload);
    return apiClient.post<{
        patient: any; message: string; appointment: Appointment 
}>(
      '/appointments',
      payload
    );
  },

  // Get all (with filters)
  getAll: async (filters: { date?: string; doctor_id?: string; view_mode?: string }) => {
    const params = new URLSearchParams(filters as any).toString();
    return apiClient.get<{ appointments: Appointment[] }>(`/appointments?${params}`);
  },

  // Cancel
  cancel: async (publicId: string) => {
    return apiClient.patch<{ message: string }>(`/appointments/${publicId}`, { status: 'cancelled' });
  },

  // Reschedule
  reschedule: async (publicId: string, newTimes: { start_time: string; end_time: string }) => {
    return apiClient.patch<{ message: string }>(`/appointments/${publicId}`, newTimes);
  }
};