import { Hospital } from './appointments'; 

// --- Specializations & Illnesses ---

export interface Specialization {
  specialization_id: string; // BigInt -> string
  name: string;
  // Optional relations (if you fetch them)
  illnesses?: Illness[]; 
}

export interface Illness {
  illness_id: string;       // BigInt -> string
  illness_name: string;
  specialization_id?: string | null;
  // Optional relation
  specialization?: Specialization;
}

// --- Doctor Types (Existing) ---

export interface DoctorSchedule {
  schedule_id: string;
  doctor_id: string;
  hospital_id: string;
  day_of_week: number; 
  start_time: string; 
  end_time: string;
  valid_from: string; 
  valid_until?: string | null;
  hospitals?: Hospital;
}

export interface Doctor {
  doctor_id: string;
  name: string;
  specialization_id?: string;
  profile_description?: string;
  public_id: string;
  consultant_fee: number;
  
  // Updated Relations
  specializations?: Specialization;
  doctor_schedules?: DoctorSchedule[];
  doctor_hospital_affiliations?: {
    affiliation_id: string;
    hospital: Hospital;
  }[];
}

// ... Filters interface