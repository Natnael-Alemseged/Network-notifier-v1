import { useState, useEffect } from "react"
import type { Contact } from "@/hooks/useContacts"
import PhoneInput, { isValidPhoneNumber, type Value } from "react-phone-number-input"
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks"
import { updateSettings } from "@/lib/features/settings/settingsThunk"

interface AddContactModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (data: any) => Promise<void>
    onSaveList: (data: any) => Promise<void>
    onDelete: (id: string) => Promise<void>
    editingContact: Contact | null
    priorityFrequencies: { L1: number; L2: number; L3: number }
}

export function AddContactModal({
    isOpen,
    onClose,
    onSave,
    onSaveList,
    onDelete,
    editingContact,
    priorityFrequencies,
}: AddContactModalProps) {
    const dispatch = useAppDispatch()
    const { pingTemplates, theme } = useAppSelector((state) => state.settings)

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        lastInteraction: "",
        profileLink: "",
        phoneNumber: "",
        priority: "L1" as "L1" | "L2" | "L3",
        lastContactedDays: "",
        pingTemplate: "",
    })

    const [isAddingTemplate, setIsAddingTemplate] = useState(false)
    const [newTemplate, setNewTemplate] = useState("")

    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    useEffect(() => {
        if (editingContact) {
            setFormData({
                name: editingContact.name,
                description: editingContact.description,
                lastInteraction: editingContact.lastInteraction,
                profileLink: editingContact.profileLink,
                phoneNumber: editingContact.phoneNumber,
                priority: editingContact.priority,
                lastContactedDays: editingContact.lastContactedDays.toString(),
                pingTemplate: editingContact.pingTemplate || "",
            })
        } else {
            setFormData({
                name: "",
                description: "",
                lastInteraction: "",
                profileLink: "",
                phoneNumber: "",
                priority: "L1",
                lastContactedDays: "",
                pingTemplate: "",
            })
        }

        setErrorMessage(null)
        setIsAddingTemplate(false)
        setNewTemplate("")
    }, [editingContact, isOpen])

    if (!isOpen) return null

    const handleSave = () => {
        setErrorMessage(null)

        const normalizeProfileLink = (raw: string): string | null => {
            const trimmed = raw.trim()
            if (!trimmed) return ""
            if (/\s/.test(trimmed)) return null

            const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`

            try {
                const url = new URL(withProtocol)
                if (url.protocol !== "http:" && url.protocol !== "https:") return null
                if (!url.hostname) return null
                if (url.hostname !== "localhost" && !url.hostname.includes(".")) return null
                return url.toString()
            } catch {
                return null
            }
        }

        const name = formData.name.trim()
        if (!name) {
            setErrorMessage("Name is required")
            return
        }

        const priority = formData.priority
        if (!priority) {
            setErrorMessage("Priority is required")
            return
        }

        const lastContactedRaw = formData.lastContactedDays.trim()
        if (lastContactedRaw === "") {
            setErrorMessage("Last contacted is required")
            return
        }

        const lastContactedDays = Number.parseInt(lastContactedRaw, 10)
        if (Number.isNaN(lastContactedDays) || lastContactedDays < 0) {
            setErrorMessage("Last contacted must be a valid non-negative number")
            return
        }

        const profileLink = formData.profileLink.trim()
        const phoneNumber = formData.phoneNumber.trim()
        const hasPhone = phoneNumber.length > 0
        const hasProfile = profileLink.length > 0
        if (!hasPhone && !hasProfile) {
            setErrorMessage("Enter either a phone number or a profile link")
            return
        }

        if (hasPhone && !isValidPhoneNumber(phoneNumber)) {
            setErrorMessage("Enter a valid phone number")
            return
        }

        const normalizedProfileLink = hasProfile ? normalizeProfileLink(profileLink) : ""
        if (hasProfile && normalizedProfileLink === null) {
            setErrorMessage("Enter a valid profile link")
            return
        }

        const normalizedPhoneNumber = hasPhone ? phoneNumber : ""

        const contactData = {
            name,
            description: formData.description,
            lastInteraction: formData.lastInteraction,
            profileLink: normalizedProfileLink ?? "",
            phoneNumber: normalizedPhoneNumber,
            priority,
            frequencyDays: priorityFrequencies[formData.priority],
            lastContactedDays,
            pingTemplate: formData.pingTemplate,
        }
        onSave(contactData)
    }

    const handleAddNewTemplate = async () => {
        if (!newTemplate.trim()) return
        const updatedTemplates = [...pingTemplates, newTemplate.trim()]
        try {
            await dispatch(updateSettings({
                theme: theme,
                priorityFrequencies,
                pingTemplates: updatedTemplates
            })).unwrap()
        } catch (error) {
            console.error("Failed to update settings with new template:", error)
        }
        setFormData({ ...formData, pingTemplate: newTemplate.trim() })
        setNewTemplate("")
        setIsAddingTemplate(false)
    }

    const handleSaveList = () => {
        const names = formData.name
            .split(",")
            .map((name) => name.trim())
            .filter((name) => name)

        if (names.length === 0) return

        const newContacts = names.map((name) => ({
            name: name,
            description: "",
            lastInteraction: "",
            profileLink: "",
            phoneNumber: "",
            priority: "L1" as "L1" | "L2" | "L3",
            frequencyDays: priorityFrequencies["L1"],
            lastContactedDays: 0,
        }))
        onSaveList(newContacts)
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
            <div className="border border-gray-600 bg-black w-full max-w-md rounded-md">
                <div className="flex justify-between items-center p-6 border-b border-gray-700">
                    <h2 className="text-lg font-light tracking-wider">{editingContact ? "EDIT CONTACT" : "ADD CONTACT"}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">
                        ×
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    {errorMessage && (
                        <div className="w-full border border-red-500 text-red-500 p-3 text-xs tracking-wider text-center rounded-md">
                            {errorMessage}
                        </div>
                    )}
                    <input
                        type="text"
                        placeholder={editingContact ? "NAME" : "NAME OR COMMA-SEPARATED LIST"}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-black border border-gray-700 p-3 text-white placeholder-gray-500 font-mono text-sm tracking-wider focus:border-white focus:outline-none rounded-md"
                    />
                    <input
                        type="text"
                        placeholder="DESCRIPTION"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full bg-black border border-gray-700 p-3 text-white placeholder-gray-500 font-mono text-sm tracking-wider focus:border-white focus:outline-none rounded-md"
                    />
                    <textarea
                        placeholder="NOTES ABOUT INTERACTION"
                        value={formData.lastInteraction}
                        onChange={(e) => setFormData({ ...formData, lastInteraction: e.target.value })}
                        className="w-full bg-black border border-gray-700 p-3 text-white placeholder-gray-500 h-20 resize-none font-mono text-sm tracking-wider focus:border-white focus:outline-none rounded-md"
                    />
                    <input
                        type="text"
                        placeholder="PROFILE/SOCIAL LINK"
                        value={formData.profileLink}
                        onChange={(e) => setFormData({ ...formData, profileLink: e.target.value })}
                        className="w-full bg-black border border-gray-700 p-3 text-white placeholder-gray-500 font-mono text-sm tracking-wider focus:border-white focus:outline-none rounded-md"
                    />
                    <PhoneInput
                        placeholder="PHONE NUMBER"
                        defaultCountry="US"
                        value={formData.phoneNumber}
                        onChange={(value: Value) => setFormData({ ...formData, phoneNumber: value ?? "" })}
                        className="w-full"
                        countrySelectProps={{
                            className:
                                "bg-black border border-gray-700 p-3 text-white font-mono text-sm tracking-wider focus:border-white focus:outline-none rounded-md",
                        }}
                        numberInputProps={{
                            className:
                                "w-full bg-black border border-gray-700 p-3 text-white placeholder-gray-500 font-mono text-sm tracking-wider focus:border-white focus:outline-none rounded-md",
                        }}
                    />
                    <div>
                        <label className="block text-xs font-medium mb-2 tracking-wider text-gray-400">PRIORITY</label>
                        <select
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value as "L1" | "L2" | "L3" })}
                            className="w-full bg-black border border-gray-700 p-3 text-white font-mono text-sm tracking-wider focus:border-white focus:outline-none rounded-md"
                        >
                            <option value="L1">L1 ({priorityFrequencies.L1} DAYS)</option>
                            <option value="L2">L2 ({priorityFrequencies.L2} DAYS)</option>
                            <option value="L3">L3 ({priorityFrequencies.L3} DAYS)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium mb-2 tracking-wider text-gray-400">
                            LAST CONTACTED (DAYS AGO)
                        </label>
                        <input
                            type="number"
                            placeholder="0"
                            value={formData.lastContactedDays}
                            onChange={(e) => setFormData({ ...formData, lastContactedDays: e.target.value })}
                            min={0}
                            step={1}
                            className="w-full bg-black border border-gray-700 p-3 text-white placeholder-gray-500 font-mono text-sm tracking-wider focus:border-white focus:outline-none rounded-md"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium mb-2 tracking-wider text-gray-400">PING TEMPLATE</label>
                        {!isAddingTemplate ? (
                            <div className="flex gap-2">
                                <select
                                    value={formData.pingTemplate}
                                    onChange={(e) => {
                                        if (e.target.value === "__NEW__") {
                                            setIsAddingTemplate(true)
                                        } else {
                                            setFormData({ ...formData, pingTemplate: e.target.value })
                                        }
                                    }}
                                    className="w-full bg-black border border-gray-700 p-3 text-white font-mono text-sm tracking-wider focus:border-white focus:outline-none rounded-md"
                                >
                                    <option value="">DEFAULT (NONE)</option>
                                    {pingTemplates.map((template, idx) => (
                                        <option key={idx} value={template}>
                                            {template.length > 40 ? template.substring(0, 40) + "..." : template}
                                        </option>
                                    ))}
                                    {formData.pingTemplate && !pingTemplates.includes(formData.pingTemplate) && (
                                        <option value={formData.pingTemplate}>
                                            {formData.pingTemplate.length > 40 ? formData.pingTemplate.substring(0, 40) + "..." : formData.pingTemplate}
                                        </option>
                                    )}
                                    <option value="__NEW__">+ ADD NEW TEMPLATE</option>
                                </select>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="ENTER NEW TEMPLATE (Use {name})"
                                    value={newTemplate}
                                    onChange={(e) => setNewTemplate(e.target.value)}
                                    className="flex-1 bg-black border border-gray-700 p-3 text-white placeholder-gray-500 font-mono text-sm tracking-wider focus:border-white focus:outline-none rounded-md"
                                />
                                <button
                                    onClick={handleAddNewTemplate}
                                    className="px-3 border border-green-500 text-green-500 hover:bg-green-500 hover:text-black rounded-md font-mono text-xs tracking-wider"
                                >
                                    SAVE
                                </button>
                                <button
                                    onClick={() => setIsAddingTemplate(false)}
                                    className="px-3 border border-gray-600 text-gray-400 hover:border-white hover:text-white rounded-md font-mono text-xs tracking-wider"
                                >
                                    X
                                </button>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleSave}
                        className="w-full border border-green-500 hover:border-green-400 hover:bg-green-500 hover:text-black py-3 text-green-500 font-mono text-sm tracking-wider transition-all mt-6 rounded-md"
                    >
                        {editingContact ? "UPDATE CONTACT" : "ADD CONTACT"}
                    </button>
                    {/*{!editingContact && (*/}
                    {/*    <button*/}
                    {/*        onClick={handleSaveList}*/}
                    {/*        className="w-full border border-gray-600 hover:border-white hover:bg-white hover:text-black py-3 text-white font-mono text-sm tracking-wider transition-all mt-2 rounded-md"*/}
                    {/*    >*/}
                    {/*        ADD LIST*/}
                    {/*    </button>*/}
                    {/*)}*/}
                    {editingContact && (
                        <button
                            onClick={() => onDelete(editingContact.id)}
                            className="w-full border border-red-500 hover:border-red-400 hover:bg-red-500 hover:text-white py-3 text-red-500 font-mono text-sm tracking-wider transition-all mt-2 rounded-md"
                        >
                            DELETE CONTACT
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
