import { Doctor } from './doctors';
import { AppointmentStatus } from '../shared';


export interface Hospital {
  hospital_id: string;
  name: string;
  address?: string;
  city?: string;
  phone_number?: string;
  public_id: string;
}

export interface Patient {
  patient_id: string;
  name: string;
  phone_number: string;
  email?: string | null;
  nic?: string | null;
}

export interface Appointment {
  appointment_id: string;
  public_id: string;
  patient_id: string;
  doctor_id: string;
  hospital_id: string;
  
  // Times come as ISO strings from API
  start_time: string; 
  end_time: string;
  
  status: AppointmentStatus;
  payment_link?: string | null;
  payment_confirmation_code?: string | null;
  
  created_at: string;
  updated_at: string;
  
  // Relations
  patient?: Patient;
  doctor?: Doctor;
  hospital?: Hospital;
}

// Payload for Creating an Appointment
export interface CreateAppointmentRequest {
  patient_id?: string | null; // Null if new patient
  patient_details?: {
    name: string;
    phone_number: string;
    email?: string;
    nic: string;
  };
  appointment: {
    doctor_id: string;
    hospital_id: string;
    start_time: string; // ISO String
    end_time: string;   // ISO String
  };
}