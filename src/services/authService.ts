// src/services/authService.ts
import { apiClient } from './apiClient';
import { getSession, signOut, signIn } from 'next-auth/react';
import { 
  CallCenterUser, 
  CreateUserRequest, 
  UpdateUserRequest, 
  APIResponse 
} from '@/types'; 

export const authService = {
  
  // --- SESSION MANAGEMENT ---

  // Get current session (User details + Role)
  getSession: async () => {
    return await getSession();
  },

  // Logout (wraps NextAuth signOut)
  logout: async (redirectUrl: string = '/login') => {
    await signOut({ callbackUrl: redirectUrl });
  },

  // Login (wraps NextAuth signIn) - Note: Usually called directly in component, but can be here
  login: async (credentials: { email: string; password: string }) => {
    return await signIn('credentials', {
      ...credentials,
      redirect: false,
    });
  },

  // --- ACCOUNT MANAGEMENT (Self) ---

  // Change Password (Used for Activation or voluntary change)
  changePassword: async (newPassword: string) => {
    return apiClient.patch<{ message: string }>(
      '/auth/change-password', 
      { newPassword }
    );
  },

  // --- USER MANAGEMENT (Admin Only) ---

  // Create a new user (Admin creates Agent, Super Admin creates Admin)
  createUser: async (userData: CreateUserRequest) => {
    return apiClient.post<{ message: string; user: CallCenterUser }>(
      '/admin/users', 
      userData
    );
  },

  // Update a user (Admin updates Agent)
  updateUser: async (userId: string, updateData: UpdateUserRequest) => {
    return apiClient.patch<{ message: string; user: CallCenterUser }>(
      `/admin/users/${userId}`, 
      updateData
    );
  },

  // Get list of users (for Admin Dashboard)
  // You might need to implement GET /api/admin/users in backend if not done yet
  getAllUsers: async (filters?: { role?: string; status?: string }) => {
    const params = new URLSearchParams(filters as any).toString();
    return apiClient.get<{ users: CallCenterUser[] }>(
      `/admin/users?${params}`
    );
  },
  
  // Get single user details
  getUserById: async (userId: string) => {
    return apiClient.get<{ user: CallCenterUser }>(
      `/admin/users/${userId}`
    );
  }
};