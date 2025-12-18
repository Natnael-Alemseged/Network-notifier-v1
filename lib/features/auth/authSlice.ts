import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  loginUser,
  registerUser,
  forgotPassword,
  changePassword,
  refreshToken,
  fetchUserProfile,
  updateUserProfile,
  logoutUser,
} from './authThunk';

export interface User {
  id: string;
  email: string;
  name?: string;
  [key: string]: any;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loading: boolean;
  error: string | null;
  message: string | null;
  passwordResetSent: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  loading: false,
  error: null,
  message: null,
  passwordResetSent: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string; refreshToken?: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }
      state.isAuthenticated = true;
      state.error = null;
    },
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setMessage: (state, action: PayloadAction<string>) => {
      state.message = action.payload;
    },
    clearMessage: (state) => {
      state.message = null;
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      state.message = null;
      state.isLoading = false;
      state.loading = false;
    },
    resetPasswordResetStatus: (state) => {
      state.passwordResetSent = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.loading = false;
        state.user = action.payload.user || action.payload.data?.user;
        state.token = action.payload.token || action.payload.data?.token || action.payload.access_token;
        state.refreshToken = action.payload.refreshToken || action.payload.data?.refreshToken || action.payload.refresh_token;
        state.isAuthenticated = true;
        state.error = null;
        state.message = action.payload.message || null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.loading = false;
        // state.user = action.payload.user || action.payload.data?.user;
        // state.token = action.payload.token || action.payload.data?.token || action.payload.access_token;
        // state.refreshToken = action.payload.refreshToken || action.payload.data?.refreshToken || action.payload.refresh_token;
        // state.isAuthenticated = true;
        // state.error = null;
        // state.message = action.payload.message || null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.passwordResetSent = false;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.passwordResetSent = true;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.passwordResetSent = false;
      })
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(refreshToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token || action.payload.data?.token || action.payload.access_token;
        if (action.payload.refreshToken || action.payload.data?.refreshToken || action.payload.refresh_token) {
          state.refreshToken = action.payload.refreshToken || action.payload.data?.refreshToken || action.payload.refresh_token;
        }
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.token = null;
        state.refreshToken = null;
      })
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user || action.payload.data || action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user || action.payload.data || action.payload;
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        console.log('logoutUser.fulfilled');
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = null;
        state.message = null;
        state.isLoading = false;
        state.loading = false;
      });
  },
});

export const {
  setCredentials,
  clearCredentials,
  setError,
  clearError,
  setMessage,
  clearMessage,
  clearAuth,
  resetPasswordResetStatus,
} = authSlice.actions;

export default authSlice.reducer;
