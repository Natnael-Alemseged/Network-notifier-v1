import { createAsyncThunk } from '@reduxjs/toolkit';
import { ApiService } from '@/lib/util/apiService';
import { ENDPOINTS } from '@/lib/constants/api_const';

type ApiErrorShape = {
  message?: unknown;
  error?: {
    errors?: unknown;
  };
};

const extractErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === 'string') return error;

  if (error && typeof error === 'object') {
    const maybeAxiosError = error as { response?: { data?: unknown } };
    const data = maybeAxiosError.response?.data;

    if (typeof data === 'string') return data;
    if (data && typeof data === 'object') {
      const shaped = data as ApiErrorShape;
      if (typeof shaped.message === 'string') return shaped.message;

      const firstError = shaped.error?.errors;
      if (Array.isArray(firstError) && typeof firstError[0] === 'string') return firstError[0];

      try {
        return JSON.stringify(data);
      } catch {
        return fallback;
      }
    }
  }

  return fallback;
};

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name?: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
}

export const loginUser = createAsyncThunk<unknown, LoginCredentials, { rejectValue: string }>(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await ApiService.post(ENDPOINTS.LOGIN, credentials, undefined, false);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(extractErrorMessage(error, 'Login failed'));
    }
  }
);

export const registerUser = createAsyncThunk<unknown, RegisterCredentials, { rejectValue: string }>(
  'auth/register',
  async (credentials: RegisterCredentials, { rejectWithValue }) => {
    try {
      const response = await ApiService.post(ENDPOINTS.REGISTER, credentials, undefined, false);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(extractErrorMessage(error, 'Registration failed'));
    }
  }
);

export const forgotPassword = createAsyncThunk<unknown, ForgotPasswordData, { rejectValue: string }>(
  'auth/forgotPassword',
  async (data: ForgotPasswordData, { rejectWithValue }) => {
    try {
      const response = await ApiService.post(ENDPOINTS.FORGOT_PASSWORD, data, undefined, false);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(extractErrorMessage(error, 'Password reset request failed'));
    }
  }
);

export const changePassword = createAsyncThunk<unknown, ChangePasswordData, { rejectValue: string }>(
  'auth/changePassword',
  async (data: ChangePasswordData, { rejectWithValue }) => {
    try {
      const response = await ApiService.post(ENDPOINTS.CHANGE_PASSWORD, data);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(extractErrorMessage(error, 'Password change failed'));
    }
  }
);

export const refreshToken = createAsyncThunk<unknown, void, { rejectValue: string }>(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ApiService.post(ENDPOINTS.REFRESH_TOKEN);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(extractErrorMessage(error, 'Token refresh failed'));
    }
  }
);

export const fetchUserProfile = createAsyncThunk<unknown, void, { rejectValue: string }>(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ApiService.get(ENDPOINTS.ME);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(extractErrorMessage(error, 'Failed to fetch user profile'));
    }
  }
);

export const updateUserProfile = createAsyncThunk<unknown, Record<string, unknown>, { rejectValue: string }>(
  'auth/updateProfile',
  async (profileData: Record<string, unknown>, { rejectWithValue }) => {
    try {
      const response = await ApiService.put(ENDPOINTS.UPDATE_PROFILE, profileData);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(extractErrorMessage(error, 'Failed to update profile'));
    }
  }
);

export const logoutUser = createAsyncThunk<unknown, void, { rejectValue: string }>(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
        console.log('in logout thunk');
      await ApiService.post(ENDPOINTS.LOGOUT);
      return { success: true };
    } catch (error: unknown) {
      return rejectWithValue(extractErrorMessage(error, 'Logout failed'));
    }
  }
);
