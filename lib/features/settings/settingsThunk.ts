import { createAsyncThunk } from '@reduxjs/toolkit';
import { ApiService } from '@/lib/util/apiService';

// Interfaces based on SettingsModal requirements
export interface UserSettings {
    theme?: 'dark' | 'light';
    priorityFrequencies?: { L1: number; L2: number; L3: number };
    pingTemplates?: string[];
}

export const fetchSettings = createAsyncThunk(
    'settings/fetchSettings',
    async (_, { rejectWithValue }) => {
        try {
            const response = await ApiService.get('/settings');
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch settings');
        }
    }
);

export const updateSettings = createAsyncThunk(
    'settings/updateSettings',
    async (settings: UserSettings, { rejectWithValue }) => {
        try {
            const response = await ApiService.put('/settings', settings);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update settings');
        }
    }
);
