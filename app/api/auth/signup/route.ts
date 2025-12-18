import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Centralized Prisma client
import { createToken, setAuthCookie } from "@/lib/auth"; // Auth/JWT functions
import bcrypt from "bcryptjs";

// Define the number of salt rounds for bcrypt
export const SALT_ROUNDS = 10;

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
    try {
        const {
            name,
            email,
            password,

        } = await req.json();

        // 1. Validate Input
        // if (!name || !email || !password || !employmentType || !managementLevel) {
        if (!name || !email || !password) {
            return NextResponse.json({
                success: false,
                error: "All fields are required"
            }, { status: 400 });
        }

        // 2. Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: email },
        });

        if (existingUser) {
            return NextResponse.json({
                success: false,
                error: "A user with this email already exists"
            }, { status: 409 });
        }

        // 3. Hash Password
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        // 4. Create User in Database
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
            },
        });

        // 5. Create and Set Session Token (Immediate Login)
        // const token = await createToken(newUser.id);

        // Prepare successful response
        const response = NextResponse.json({
            success: true,
            data: {
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    name: newUser.name,
                }
            },
            message: "Account created successfully. You can now Login!"
        }, { status: 201 });

        // Use the helper to set the secure, HTTP-only cookie
        // setAuthCookie(response, token);

        return response;
    } catch (err) {
        console.error("Sign-up server error:", err);
        return NextResponse.json({
            success: false,
            error: "Server error during account creation."
        }, { status: 500 });
    }
}
