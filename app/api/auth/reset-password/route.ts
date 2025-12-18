import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
    const session = await getSession()
    if (!session || !session.userId) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const { password } = await req.json()

        if (!password || password.length < 6) {
            return new NextResponse("Password must be at least 6 characters", { status: 400 })
        }

        const passwordHash = await bcrypt.hash(password, 10)

        await db.user.update({
            where: { id: session.userId as string },
            data: { passwordHash }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error updating password:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
