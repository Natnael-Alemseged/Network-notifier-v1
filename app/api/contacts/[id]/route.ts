import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession, getSessionFromRequest } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> } // In Next 15+ params is a promise
) {
    // const session = await getSession()
    const session = await getSessionFromRequest(req)

    if (!session || !session.userId) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    // Await params if it is a promise
    const { id } = await params;

    try {
        const body = await req.json()
        const { name, description, lastInteraction, profileLink, phoneNumber, priority, frequencyDays, lastContactedDays } = body

        // Ensure user owns contact
        const existingContact = await db.contact.findUnique({
            where: { id: id }
        })

        if (!existingContact) {
            return new NextResponse("Not Found", { status: 404 })
        }

        if (existingContact.userId !== session.userId) {
            return new NextResponse("Forbidden", { status: 403 })
        }

        const updatedContact = await db.contact.update({
            where: { id: id },
            data: {
                name,
                description,
                lastInteraction,
                profileLink,
                phoneNumber,
                priority,
                frequencyDays,
                lastContactedDays,
            }
        })

        return NextResponse.json(updatedContact)
    } catch (error) {
        console.error("Error updating contact:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    // const session = await getSession()
    const session = await getSessionFromRequest(req)

    if (!session || !session.userId) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    const { id } = await params;

    try {
        // Ensure user owns contact
        const existingContact = await db.contact.findUnique({
            where: { id: id }
        })

        if (!existingContact) {
            return new NextResponse("Not Found", { status: 404 })
        }

        if (existingContact.userId !== session.userId) {
            return new NextResponse("Forbidden", { status: 403 })
        }

        await db.contact.delete({
            where: { id: id }
        })

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error("Error deleting contact:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
