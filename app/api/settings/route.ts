import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
    const session = await getSessionFromRequest(request);
    if (!session || !session.userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const user = await db.user.findUnique({
            where: { id: session.userId as string },
            select: {
                theme: true,
                priorityFrequencies: true,
                pingTemplates: true,
            },
        });

        if (!user) {
            return new NextResponse("User not found", { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error("Error fetching settings:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    const session = await getSessionFromRequest(request);
    if (!session || !session.userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await request.json();
        const { theme, priorityFrequencies, pingTemplates } = body;

        const user = await db.user.update({
            where: { id: session.userId as string },
            data: {
                theme,
                priorityFrequencies,
                pingTemplates,
            },
            select: {
                theme: true,
                priorityFrequencies: true,
                pingTemplates: true
            }
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error("Error updating settings:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
