// Common Enums matching your Prisma Schema
export type UserRole = 'ADMIN' | 'CALL_AGENT' | 'DOCTOR' | 'SUPER_ADMIN';

export type AppointmentStatus = 'pending_payment' | 'confirmed' | 'cancelled' | 'completed';

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

// Standard API Response Wrapper
export interface APIResponse<T> {
  message: string;
  data?: T;
  error?: string;
  // Pagination metadata (optional but recommended)
  pagination?: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}