
import { Specialization } from './doctors';

// Base Schedule Type
export interface Schedule {
  schedule_id: string; // serialized BigInt
  day_of_week: string; // Formatted "Monday", "Tuesday"...
  start_time: string;  // Formatted "HH:mm"
  end_time: string;    // Formatted "HH:mm"
  
  // Nested relations (flattened or objects based on your API)
  doctor: {
    public_id: string;
    name: string;
    specialization?: Specialization;
    consultant_fee?: number;
  };
  
  hospital: {
    public_id: string;
    name: string;
    city?: string;
  };
}
