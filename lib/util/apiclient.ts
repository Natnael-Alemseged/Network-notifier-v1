// src/common/utils/apiclient.ts
import axios from "axios";

import { BASE_URL } from "../constants/api_const";

export const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 60000,
    withCredentials: true,
    // Don't set default Content-Type - let each request set it as needed
});

// Helper to set/remove token globally (used by store.subscribe and logout)
export const setAuthToken = (token: string | null) => {
    console.log("ApiClient: Setting auth token", token);

    if (token) {
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
        delete apiClient.defaults.headers.common["Authorization"];
    }
};

// 👇 NEW: Request Interceptor to conditionally remove Authorization per request
apiClient.interceptors.request.use(
    (config) => {
        // If request explicitly says token is NOT needed, remove Authorization header
        if (config.headers?.["X-Token-Needed"] === "false") {
            delete config.headers["Authorization"];
            // Optional: clean up the flag so it doesn't go to server
            delete config.headers["X-Token-Needed"];
        }
        
        // Set Content-Type for JSON requests only
        if (config.data && !(config.data instanceof FormData) && !config.headers?.["Content-Type"]) {
            config.headers["Content-Type"] = "application/json";
        }
        
        // For FormData requests, ensure no Content-Type is set
        if (config.data instanceof FormData) {
            delete config.headers["Content-Type"];
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);