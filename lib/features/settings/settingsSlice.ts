import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchSettings, updateSettings } from './settingsThunk';

interface SettingsState {
    theme: 'dark' | 'light';
    priorityFrequencies: { L1: number; L2: number; L3: number };
    pingTemplates: string[];
    loading: boolean;
    error: string | null;
}

const initialState: SettingsState = {
    theme: 'dark', // Default
    priorityFrequencies: { L1: 7, L2: 14, L3: 30 }, // Defaults
    pingTemplates: [
        "Hey {name}, it's been a while! How have you been?",
        "Thinking of you, {name}. Hope all is well!",
        "Hi {name}, would love to catch up soon."
    ],
    loading: false,
    error: null,
};

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        // You can add synchronous actions here if needed, e.g. toggleTheme immediately
        // For now, we rely on async thunks
    },
    extraReducers: (builder) => {
        builder
            // Fetch Settings
            .addCase(fetchSettings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSettings.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload) {
                    state.theme = action.payload.theme || state.theme;
                    state.priorityFrequencies = action.payload.priorityFrequencies || state.priorityFrequencies;
                    state.pingTemplates = action.payload.pingTemplates || state.pingTemplates;
                }
            })
            .addCase(fetchSettings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Update Settings
            .addCase(updateSettings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateSettings.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload) {
                    state.theme = action.payload.theme || state.theme;
                    state.priorityFrequencies = action.payload.priorityFrequencies || state.priorityFrequencies;
                    state.pingTemplates = action.payload.pingTemplates || state.pingTemplates;
                }
            })
            .addCase(updateSettings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default settingsSlice.reducer;
