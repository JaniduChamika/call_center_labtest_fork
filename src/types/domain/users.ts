import { UserRole, UserStatus } from '../shared';

export interface CallCenterUser {
  user_id: number; // Note: Your schema uses Int for users, but BigInt for others. Keep as number.
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  last_login_at?: string | null;
  created_at?: string;
  // Sensitive data like password/verification_code should NOT be in the frontend type
}

export interface CreateUserRequest {
  name: string;
  email: string;
  role: UserRole;
  password?: string; 
  status?: UserStatus;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: UserRole;
  status?: UserStatus;
  password?: string;
}