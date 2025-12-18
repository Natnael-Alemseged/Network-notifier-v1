import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createToken } from "@/lib/auth";

// 1. Force the route to be dynamic to prevent build-time evaluation issues
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: "Email and Password are Required" }, { status: 400 });
        }

        // 2. Access the secret INSIDE the function.
        // This prevents the build from crashing if the env var is missing on Vercel.
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.error("Critical: JWT_SECRET environment variable is missing.");
            return NextResponse.json({ message: "Internal Server Configuration Error" }, { status: 500 });
        }

        const user = await prisma.user.findUnique({ where: { email: email } });

        if (!user) {
            return NextResponse.json({ message: "Incorrect email/password" }, { status: 401 });
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (isPasswordValid) {
            const token = await createToken(user.id);

            return NextResponse.json({
                message: "Login successful",
                data: {
                    token: token,
                    user: {
                        id: user.id,
                        email: user.email,
                        // Don't return the password hash to the frontend
                    },
                }
            }, { status: 200 });
        } else {
            return NextResponse.json({ message: "Incorrect email/password" }, { status: 401 });
        }

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}