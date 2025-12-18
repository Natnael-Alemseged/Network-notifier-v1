// src/common/constants/api.ts

/**
 * API-related constants and endpoints.
 * This file centralizes all API configuration for easier management.
 */

// Base URL for the API.
// You can change this to your production URL later.
export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// export const BASE_URL ='https://api.boingo.ai';

// Define endpoints for your application.
// This is a good way to keep your routes organized and consistent.
export const ENDPOINTS = {
    // Authentication
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    GOOGLE_CALLBACK: '/auth/callback',
    FACEBOOK_CALLBACK: '/auth/callback/facebook',
    REGISTER: '/auth/signup',
    FORGOT_PASSWORD: '/auth/forgot_password',
    REFRESH_TOKEN: '/auth/refresh-token',
    LISTING_INQUIRIES: "/listing-inqueries",

    ME: '/auth',

    SPONSORSHIP_CHECKOUT: "/subscriptions/checkout",

    // Properties
    FAVORITES_PROPERTIES: '/listing-favorites',

    // Listings
    MY_LISTINGS: '/listings/my-listings',
    LISTINGS: '/listings',
    // DELETE_LISTINGS: '/listings/delete',
    SPONSORED_LISTINGS: '/sponsored-listing/my-listings',

    // Notification
    NOTIFICATION_GET: '/notification/get',
    NOTIFICATION: '/notification',

    // Search
    SEARCH_PROPERTIES: '/listings/algolia-search',
    SEARCH_PROPERTIES_IN_DETAILS: '/listings/algolia-search/detail',

    // User Profile_old
    GET_PROFILE: '/users/account',
    UPDATE_PROFILE: '/users',

    // Data
    GET_ITEMS: '/items',
    ROLES: "/roles/selected-roles",
    UPLOAD_FILE: "/files/single",
    AFFILIATE: "/users/affiliate",
    // AFFILIATE_REFERRALS: "/affiliate/referrals",
    AFFILIATE_REFERRALS: "/affiliate/earnings/",

    SUBSCRIPTIONS_TYPES: "/subscription-types",
    SUBSCRIPTIONS_CONFIG: "/configs",
    MY_SPONSORED_LISTINGS: "/sponsored-listing/my-listings",


    CHANGE_PASSWORD: "/auth/change_password",
    MY_SUBSCRIPTIONS: "/subscriptions/my?",
    ADD_WEBSITE_IMPORT: "/scraping-target/external-source",
    ADD_PROPERTY: "",
    LISTING_TYPES: "/listing-types",
    CATEGORIES: "/categories",
    FEATURES: "/features",
    NOTIFICATION_FILTER: "/notification/filter",
    PROPERTIES_BY_ID: "/listings/find-by-id/",
    GET_ITEM_BY_ID: (id: string) => `/items/${id}`,
    CREATE_ITEM: '/items',

    //Tasks
    TASKS: '/tasks',

};
