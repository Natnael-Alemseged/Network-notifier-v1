import {NextResponse} from 'next/server';
import {ENDPOINTS, BASE_URL} from '@/lib/constants/api_const';
import {User} from "lucide-react";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import {notFound} from "next/navigation";
import {SALT_ROUNDS} from "@/app/api/auth/signup/route";
import {SignJWT} from "jose";
import {createToken} from "@/lib/auth"; // Centralized Prisma client

const secret = new TextEncoder().encode(process.env.JWT_SECRET);


export async function POST(request: Request) {
    try {

        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is not defined");
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
        }
        const {email, password} = await request.json();

        // return NextResponse.json({message: "testing"}, {status: 400});
        if (!email || !password) {
            return NextResponse.json({error: "Email and Password are Required"});
        }

        const user = await prisma.user.findUnique({where: {email: email}});

        if (!user) {
            // return notFound();
            return NextResponse.json({message: "Incorrect email/password"}, {status: 401});

        }

        // const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (isPasswordValid) {


            // const token = await new SignJWT({
            //     userId: user.id
            // })
            //     .setProtectedHeader({alg: "HS256"})
            //     .setIssuedAt()
            //     .setExpirationTime("30d") // Token expires in 1 day
            //     .sign(secret);

            const token=await createToken(user.id);

            return NextResponse.json({
                message: "Login successful",
                data: {
                    token: token,
                    user: user,
                }
            }, {status: 200});
        } else {
            console.log(user);
            return NextResponse.json({message: "Incorrect email/password"}, {status: 401});
        }


    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            {message: 'Internal Server Error'},
            {status: 500}
        );
    }
}
