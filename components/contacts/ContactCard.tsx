import { ExternalLink, Copy, Edit, Check, MessageSquare } from "lucide-react"
import type { Contact } from "@/hooks/useContacts"

interface ContactCardProps {
    contact: Contact
    timingStatus: "CONTACTED" | "OVERDUE" | "REACHING" | "OK"
    onPing: (contact: Contact) => void
    onEdit: (contact: Contact) => void
    onMarkContacted: (contactId: string) => void
    copiedId: string | null
    isRecentlyContacted: boolean
    showDescription?: boolean
}

export function ContactCard({
    contact,
    timingStatus,
    onPing,
    onEdit,
    onMarkContacted,
    copiedId,
    isRecentlyContacted,
    showDescription = true
}: ContactCardProps) {

    const indicatorClass =
        timingStatus === "OVERDUE"
            ? "bg-red-500"
            : timingStatus === "REACHING"
                ? "bg-amber-500"
                : timingStatus === "CONTACTED"
                    ? "bg-green-500"
                    : "bg-gray-600"

    return (
        <div className="p-6 bg-black relative">
            <div
                className={`absolute left-0 top-0 bottom-0 w-1 ${indicatorClass}`}
            />
            <div className="flex justify-between items-start mb-4 pl-4">
                <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 ${indicatorClass}`} />
                    <h3 className="text-lg font-medium tracking-wide">{contact.name.toUpperCase()}</h3>
                </div>
            </div>
            <div className="space-y-1 mb-6 text-gray-400 text-sm pl-6 font-mono">
                {showDescription && (
                    <>
                        {contact.description && <p>DESCRIPTION: {contact.description.toUpperCase()}</p>}
                        {contact.lastInteraction && (
                            <p>LAST INTERACTION: {contact.lastInteraction.toUpperCase()}</p>
                        )}
                        <p>LAST CONTACTED: {contact.lastContactedDays} DAYS AGO</p>
                    </>
                )}
                {contact.phoneNumber && (
                    <div className="flex items-center gap-2">
                        <p className="text-gray-400">{contact.phoneNumber}</p>
                        <a
                            href={`sms:${contact.phoneNumber.replace(/[^\d+]/g, "")}`}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <MessageSquare size={12} />
                        </a>
                    </div>
                )}
                {contact.profileLink && (
                    <a
                        href={contact.profileLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:text-gray-300 flex items-center gap-1 underline"
                    >
                        VIEW PROFILE <ExternalLink size={12} />
                    </a>
                )}
            </div>
            <div className="flex gap-2 pl-6">
                <button
                    onClick={() => onPing(contact)}
                    className={`px-4 py-2 flex items-center gap-2 transition-all text-xs tracking-wider rounded-md ${copiedId === contact.id
                        ? "bg-white text-black border-2 border-white"
                        : "border border-gray-600 hover:border-white hover:bg-white hover:text-black"
                        }`}
                >
                    {copiedId === contact.id ? (
                        <>
                            <Check size={12} />
                            COPIED
                        </>
                    ) : (
                        <>
                            <Copy size={12} />
                            PING
                        </>
                    )}
                </button>
                <button
                    onClick={() => onEdit(contact)}
                    className="border border-gray-600 hover:border-white hover:bg-white hover:text-black px-4 py-2 flex items-center gap-2 transition-all text-xs tracking-wider rounded-md"
                >
                    <Edit size={12} />
                    EDIT
                </button>
                <button
                    onClick={() => onMarkContacted(contact.id)}
                    className="border border-gray-600 hover:border-white hover:bg-white hover:text-black px-4 py-2 transition-all text-xs tracking-wider rounded-md"
                >
                    {isRecentlyContacted ? "UNDO" : "CONTACTED"}
                </button>
            </div>
        </div>
    )
}
