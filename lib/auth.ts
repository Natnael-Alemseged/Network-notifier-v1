// D:\code projects\Front End\Ordo-PMS\lib\auth.ts

import { SignJWT, jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Centralized Prisma client


// ⚠️ IMPORTANT: Set a long, secure secret in your .env file
const getSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET environment variable is required and must not be empty.');
    }
    return new TextEncoder().encode(secret);
};
const COOKIE_NAME = "auth-token";

// ----------------------------------------------------
// 1. JWT GENERATION
// ----------------------------------------------------
export async function createToken(userId: string): Promise<string> {
    return new SignJWT({ userId: userId })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("1d")
        .sign(getSecret());
}


// ----------------------------------------------------
// 2. COOKIE ACTIONS (Used in API Route)
// ----------------------------------------------------
export function setAuthCookie(response: NextResponse, token: string) {
    response.cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24, // 1 day
        path: "/",
    });
}

// ----------------------------------------------------
// 3. TOKEN VERIFICATION (Used in Middleware or /api/auth/me)
// ----------------------------------------------------
export async function verifyToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, getSecret());
        return payload; // Returns { userId: '...' }
    } catch (e) {
        // Log the error for debugging but throw a generic one for external consumers
        console.error('Token verification failed:', e);
        throw new Error('Invalid or expired token');
    }
}

export async function getSessionFromRequest(req: NextRequest): Promise<{ userId: string } | null> {
    const userId = await getAuthUserId(req)
    if (!userId) {
        return null
    }
    return { userId }
}

// ----------------------------------------------------
// 4. LOGOUT (Used in Logout API Route)
// ----------------------------------------------------
export function clearAuthCookie(response: NextResponse) {
    response.cookies.delete(COOKIE_NAME);
}

// ----------------------------------------------------
// 5. GET USER ID FROM AUTHORIZATION HEADER (For API Routes, e.g., Postman with Bearer)
// ----------------------------------------------------
export async function getAuthUserIdFromHeader(req: NextRequest): Promise<string | null> {
    const authHeader = req.headers.get("authorization");
    console.log("Received auth header:", authHeader); // Temp logging for debugging (remove in prod)

    if (!authHeader?.startsWith("Bearer ")) {
        console.log("No valid Bearer header found"); // Temp logging
        return null;
    }

    const token = authHeader.split(" ")[1];
    console.log("Extracted token (first 20 chars):", token?.substring(0, 20) + "..."); // Temp logging

    try {
        const payload = await verifyToken(token);
        console.log("Verified payload:", payload); // Temp logging
        return typeof payload.userId === "string" ? payload.userId : null;
    } catch (error) {
        console.error("Token verification failed in API route:", error);
        return null;
    }
}


// ----------------------------------------------------
// 7. GET USER ID FROM HEADER OR COOKIE (Flexible for API Routes)
// ----------------------------------------------------
export async function getAuthUserId(req: NextRequest): Promise<string | null> {
    // Try header first (for Postman/API clients)
    let token = null;
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
        console.log("Using header token (first 20 chars):", token?.substring(0, 20) + "..."); // Temp log
    } else {
        // Fallback to cookie (for browser)
        token = req.cookies.get(COOKIE_NAME)?.value;
        console.log("Using cookie token:", token); // Temp log
    }

    if (!token) {
        console.log("No token found in header or cookie");
        return null;
    }

    try {
        const payload = await verifyToken(token);
        console.log("Verified payload:", payload); // Temp log
        return typeof payload.userId === "string" ? payload.userId : null;
    } catch (error) {
        console.error("Token verification failed in API route:", error);
        return null;
    }
}

// ----------------------------------------------------
// 8. GET SESSION (For API Routes that need session object)
// ----------------------------------------------------
export async function getSession(): Promise<{ userId: string } | null> {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) {
        return null;
    }

    try {
        const payload = await verifyToken(token);
        return typeof payload.userId === "string" ? { userId: payload.userId } : null;
    } catch (error) {
        console.error("Session verification failed:", error);
        return null;
    }
}

// ----------------------------------------------------
// 9. LOGOUT (Clear session)
// ----------------------------------------------------
export async function logout(): Promise<void> {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
}

