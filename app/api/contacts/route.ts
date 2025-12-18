import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession, getSessionFromRequest } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    console.log('inside get contacts');
    const session = await getSessionFromRequest(request);
    // console.log(request);
    console.log(session)
    if (!session || !session.userId) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const contacts = await db.contact.findMany({
            where: { userId: session.userId as string },
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(contacts)
    } catch (error) {
        console.error("Error fetching contacts:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    const session = await getSessionFromRequest(req)
    if (!session || !session.userId) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const body = await req.json()

        // Handle batch insert
        if (Array.isArray(body)) {
            const contactsData = body.map((contact: any) => ({
                userId: session.userId as string,
                name: contact.name,
                description: contact.description || "",
                lastInteraction: contact.lastInteraction || "",
                profileLink: contact.profileLink || "",
                phoneNumber: contact.phoneNumber || "",
                priority: contact.priority,
                frequencyDays: contact.frequencyDays,
                lastContactedDays: contact.lastContactedDays || 0,
                pingTemplate: contact.pingTemplate || null
            }))

            const newContacts = await db.contact.createMany({
                data: contactsData
            })
            // For simplicity, return the count or fetch them again if needed.
            // Currently the frontend reloads contacts after save.
            return NextResponse.json(newContacts)
        }

        const { name, description, lastInteraction, profileLink, phoneNumber, priority, frequencyDays, lastContactedDays } = body

        const contact = await db.contact.create({
            data: {
                userId: session.userId as string,
                name,
                description,
                lastInteraction,
                profileLink,
                phoneNumber,
                priority,
                frequencyDays,
                lastContactedDays,
                pingTemplate: body.pingTemplate || null,
            }
        })
        return NextResponse.json(contact)
    } catch (error) {
        console.error("Error creating contact:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
