// src/common/utils/apiService.ts
import {AxiosRequestConfig, AxiosResponse} from "axios";

import {apiClient} from "./apiclient";
import {buildQueryParam} from "./queryBuilder";
import {toastBar, ToastType} from "@/components/Toast";

// Attach a response interceptor for error handling (keep as-is)
apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: any) => {
        const status = error.response?.status;
        console.log(`API Error: ${JSON.stringify(error.response?.data, null, 2)}`);
        console.log(`API Error 1: ${JSON.stringify(error.response, null, 2)}`);

        if (status === 401) {
            const specificErrorMessage = error.response?.data?.error?.errors?.[0];

            if (specificErrorMessage === "Invalid Login Credentials") {
                toastBar(specificErrorMessage, ToastType.DANGER);
            } else {
                // toastBar("Session expired. Please login again.", ToastType.DANGER);
                toastBar(error.response?.data?.error?.errors?.[0] ||
                    error.response?.data?.message || "Session expired. Please login again.", ToastType.DANGER);
            }
        } else {
            const message =
                error.response?.data?.error?.errors?.[0] ||
                error.response?.data?.message ||
                "Something went wrong";
            toastBar(message, ToastType.DANGER);
        }

        return Promise.reject(error);
    }
);

// Helper to merge tokenNeeded flag into headers
const withTokenFlag = (config: AxiosRequestConfig | undefined, tokenNeeded: boolean, signal?: AbortSignal): AxiosRequestConfig => {
    return {
        ...config,
        headers: {
            ...config?.headers,
            "X-Token-Needed": String(tokenNeeded),
        },
        ...(signal ? {signal} : {}),
    };
};

// Expose a clean service API with tokenNeeded support
export const ApiService = {
    get: (url: string, config?: AxiosRequestConfig, tokenNeeded: boolean = true) =>
        apiClient.get(url, withTokenFlag(config, tokenNeeded)),

    getWithQuery: async (
        endpoint: string,
        queryProps?: any,
        tokenNeeded: boolean = true,
        config?: AxiosRequestConfig,
        signal?: AbortSignal
    ) => {
        let url = endpoint;
        if (queryProps) {
            const query = buildQueryParam(queryProps);
            url += `?query=${query}`;
        }

        return apiClient.get(url, withTokenFlag(config, tokenNeeded, signal));
    },

    getWithPaginationQuery: async (
        endpoint: string,
        queryProps?: any,
        tokenNeeded: boolean = true,
        config?: AxiosRequestConfig,
        signal?: AbortSignal
    ) => {
        let url = endpoint;
        if (queryProps) {
            const query = new URLSearchParams(queryProps).toString();
            url += `?${query}`;
        }

        return apiClient.get(url, withTokenFlag(config, tokenNeeded, signal));
    },

    postWithQuery: async (
        endpoint: string,
        body: any,
        queryProps?: any,
        tokenNeeded: boolean = true,
        config?: AxiosRequestConfig,
        signal?: AbortSignal
    ) => {
        let url = endpoint;
        if (queryProps) {
            const query = buildQueryParam(queryProps);
            url += `?query=${query}`;
        }

        return apiClient.post(url, body, withTokenFlag(config, tokenNeeded, signal));
    },


    post: (url: string, body?: any, config?: AxiosRequestConfig, tokenNeeded: boolean = true) =>
        apiClient.post(url, body, withTokenFlag(config, tokenNeeded)),

    patch: (url: string, body?: any, config?: AxiosRequestConfig, tokenNeeded: boolean = true) =>
        apiClient.patch(url, body, withTokenFlag(config, tokenNeeded)),


    put: (url: string, body?: any, config?: AxiosRequestConfig, tokenNeeded: boolean = true) =>
        apiClient.put(url, body, withTokenFlag(config, tokenNeeded)),

    delete: (url: string, body?: any, config?: AxiosRequestConfig, tokenNeeded: boolean = true) =>
        apiClient.delete(url, {
            ...withTokenFlag(config, tokenNeeded),
            data: body, // Pass the body as config.data
        }),

    uploadFile: (url: string, file: any, tokenNeeded: boolean = true) => {
        const formData = new FormData();
        formData.append("file", file);

        // For React Native, don't set Content-Type manually - let the browser/RN set it
        const config = withTokenFlag({
            headers: {
                // Remove Content-Type to let React Native set it automatically with boundary
            },
            transformRequest: (data: any) => {
                return data; // Don't transform FormData
            },
        }, tokenNeeded);
        console.log(`upload url is ${url}`);

        return apiClient.post(url, formData, config);
    },

    uploadFiles: (url: string, files: any[], tokenNeeded: boolean = true) => {
        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));
        return apiClient.post(url, formData, withTokenFlag({
            headers: {"Content-Type": "multipart/form-data"},
        }, tokenNeeded));
    },
};