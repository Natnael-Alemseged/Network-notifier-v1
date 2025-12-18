import { useState } from "react"
import type { Contact } from "@/hooks/useContacts"
import { ContactCard } from "./ContactCard"

interface ContactListProps {
    contacts: Contact[]
    priorityFrequencies: { L1: number; L2: number; L3: number }
    onPing: (contact: Contact) => void
    onEdit: (contact: Contact) => void
    onMarkContacted: (contactId: string) => void
    copiedId: string | null
    recentlyContacted: Set<string>
}

export function ContactList({
    contacts,
    priorityFrequencies,
    onPing,
    onEdit,
    onMarkContacted,
    copiedId,
    recentlyContacted
}: ContactListProps) {
    const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({})

    type TimingStatus = "CONTACTED" | "OVERDUE" | "REACHING" | "OK"

    const toggleSectionCollapse = (priority: string) => {
        setCollapsedSections((prev) => ({ ...prev, [priority]: !prev[priority] }))
    }

    const filteredGroupedContacts = contacts.reduce(
        (acc, contact) => {
            if (!acc[contact.priority]) {
                acc[contact.priority] = []
            }
            acc[contact.priority].push(contact)
            return acc
        },
        {} as Record<string, Contact[]>,
    )

    const getTimingStatus = (contact: Contact, isRecentlyContacted: boolean): TimingStatus => {
        if (isRecentlyContacted || contact.lastContactedDays === 0) return "CONTACTED"
        if (contact.lastContactedDays > contact.frequencyDays) return "OVERDUE"

        const thresholdDays = Math.max(contact.frequencyDays - 2, 0)
        if (contact.lastContactedDays >= thresholdDays && contact.lastContactedDays <= contact.frequencyDays) {
            return "REACHING"
        }

        return "OK"
    }

    return (
        <>
            {(["L1", "L2", "L3"] as const).map((priority) => {
                const priorityContacts = filteredGroupedContacts[priority] || []
                if (priorityContacts.length === 0) return null
                return (
                    <div key={priority} className="mb-8">
                        <div className="border border-gray-700 mb-4">
                            <button
                                onClick={() => toggleSectionCollapse(priority)}
                                className="w-full text-left p-4 bg-[#2C2C2C] border-b border-gray-700 tracking-wider flex items-center justify-between hover:bg-gray-800 transition-colors rounded-t-md"
                            >
                                <div>
                                    <span className="text-xl font-light">{priority}</span>
                                    <span className="text-base font-normal text-gray-400 ml-2">
                                        - every {priorityFrequencies[priority]} days
                                    </span>
                                </div>
                                <span
                                    className={`text-xs transition-transform duration-200 ${collapsedSections[priority] ? "rotate-180" : ""}`}
                                >
                                    ▼
                                </span>
                            </button>
                            {!collapsedSections[priority] && (
                                <div className="divide-y divide-gray-800">
                                    {priorityContacts.map((contact, index) => {
                                        const isLastContact = index === priorityContacts.length - 1
                                        const isRecently = recentlyContacted.has(contact.id)
                                        return (
                                            <div key={contact.id} className={isLastContact ? "rounded-b-md" : ""}>
                                                <ContactCard
                                                    contact={contact}
                                                    timingStatus={getTimingStatus(contact, isRecently)}
                                                    onPing={onPing}
                                                    onEdit={onEdit}
                                                    onMarkContacted={onMarkContacted}
                                                    copiedId={copiedId}
                                                    isRecentlyContacted={isRecently}
                                                    showDescription
                                                />
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )
            })}
        </>
    )
}
