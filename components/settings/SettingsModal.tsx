import { useState, useEffect } from "react"
import { Edit, Trash } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { updateSettings } from "@/lib/features/settings/settingsThunk"

interface SettingsModalProps {
    isOpen: boolean
    onClose: () => void
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const dispatch = useAppDispatch()
    const { theme, priorityFrequencies, pingTemplates } = useAppSelector((state) => state.settings)

    // We keep local state for temp editing, initialized from Redux
    const [tempFrequencies, setTempFrequencies] = useState(priorityFrequencies)
    const [newTemplate, setNewTemplate] = useState("")
    const [editingTemplateIndex, setEditingTemplateIndex] = useState<number | null>(null)
    const [localTemplates, setLocalTemplates] = useState(pingTemplates)
    const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(0) // Local UI state

    useEffect(() => {
        if (isOpen) {
            setTempFrequencies(priorityFrequencies)
            setLocalTemplates(pingTemplates)
        }
    }, [priorityFrequencies, pingTemplates, isOpen])

    if (!isOpen) return null

    const handleSaveSettings = () => {
        dispatch(updateSettings({
            theme, // theme is managed directly via onThemeChange usually, or we can save it here
            priorityFrequencies: tempFrequencies,
            pingTemplates: localTemplates
        }))
        onClose()
    }

    const handleThemeChange = (newTheme: "dark" | "light") => {
        // Optimistic / Real-time update for theme? 
        // Or just save it with other settings? 
        // Let's dispatch update specifically for theme or just wait for save.
        // Usually theme switches immediately.
        dispatch(updateSettings({ theme: newTheme, priorityFrequencies, pingTemplates }))
    }

    const handleAddTemplate = () => {
        if (newTemplate.trim()) {
            setLocalTemplates([...localTemplates, newTemplate.trim()])
            setNewTemplate("")
        }
    }

    const handleEditTemplate = (index: number) => {
        setEditingTemplateIndex(index)
        setNewTemplate(localTemplates[index])
    }

    const handleUpdateTemplate = () => {
        if (editingTemplateIndex !== null && newTemplate.trim()) {
            const updated = [...localTemplates]
            updated[editingTemplateIndex] = newTemplate.trim()
            setLocalTemplates(updated)
            setEditingTemplateIndex(null)
            setNewTemplate("")
        }
    }

    const handleDeleteTemplate = (index: number) => {
        if (localTemplates.length > 1) {
            const updated = localTemplates.filter((_, i) => i !== index)
            setLocalTemplates(updated)
            if (selectedTemplateIndex >= updated.length) {
                setSelectedTemplateIndex(updated.length - 1)
            }
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
            <div className="border border-gray-600 bg-black w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-md">
                <div className="flex justify-between items-center p-6 border-b border-gray-700">
                    <h2 className="text-lg font-light tracking-wider">SETTINGS</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">
                        ×
                    </button>
                </div>
                <div className="p-6 space-y-8">
                    {/* Theme Settings */}
                    <div>
                        <h3 className="text-sm font-medium tracking-wider text-gray-400 mb-4">APPEARANCE</h3>
                        <div className="space-y-2">
                            <button
                                onClick={() => handleThemeChange("dark")}
                                className={`w-full text-left p-3 border transition-all font-mono text-sm tracking-wider rounded-md ${theme === "dark" ? "border-white bg-white text-black" : "border-gray-600 hover:border-white"
                                    }`}
                            >
                                DARK MODE
                            </button>
                            <button
                                onClick={() => handleThemeChange("light")}
                                className={`w-full text-left p-3 border transition-all font-mono text-sm tracking-wider rounded-md ${theme === "light"
                                    ? "border-white bg-white text-black"
                                    : "border-gray-600 hover:border-white"
                                    }`}
                            >
                                LIGHT MODE
                            </button>
                        </div>
                    </div>

                    {/* Contact Frequency Settings */}
                    <div>
                        <h3 className="text-sm font-medium tracking-wider text-gray-400 mb-4">CONTACT FREQUENCY (DAYS)</h3>
                        {(["L1", "L2", "L3"] as const).map((priority) => (
                            <div key={priority} className="mb-4">
                                <label className="block text-xs font-medium mb-2 tracking-wider text-gray-400">{priority}</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={tempFrequencies[priority]}
                                    onChange={(e) =>
                                        setTempFrequencies({ ...tempFrequencies, [priority]: Math.max(1, Number(e.target.value)) })
                                    }
                                    className="w-full bg-black border border-gray-700 p-3 text-white placeholder-gray-500 font-mono text-sm tracking-wider focus:border-white focus:outline-none rounded-md"
                                />
                            </div>
                        ))}
                    </div>

                    {/* Ping Templates */}
                    <div>
                        <h3 className="text-sm font-medium tracking-wider text-gray-400 mb-4">PING MESSAGE TEMPLATES</h3>
                        <p className="text-xs text-gray-500 mb-4">Use {"{name}"} to insert contact name</p>
                        <div className="space-y-2 mb-4">
                            {localTemplates.map((template, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <button
                                        onClick={() => setSelectedTemplateIndex(index)}
                                        className={`flex-1 text-left p-3 border transition-all font-mono text-xs tracking-wider rounded-md ${selectedTemplateIndex === index
                                            ? "border-white bg-white text-black"
                                            : "border-gray-700 hover:border-white"
                                            }`}
                                    >
                                        {template}
                                    </button>
                                    <button
                                        onClick={() => handleEditTemplate(index)}
                                        className="p-3 border border-gray-700 hover:border-white rounded-md text-gray-400 hover:text-white"
                                    >
                                        <Edit size={14} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteTemplate(index)}
                                        className="p-3 border border-red-900 hover:border-red-500 rounded-md text-red-500"
                                        disabled={localTemplates.length <= 1}
                                    >
                                        <Trash size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder={editingTemplateIndex !== null ? "EDIT TEMPLATE" : "NEW TEMPLATE"}
                                value={newTemplate}
                                onChange={(e) => setNewTemplate(e.target.value)}
                                className="flex-1 bg-black border border-gray-700 p-3 text-white placeholder-gray-500 font-mono text-sm tracking-wider focus:border-white focus:outline-none rounded-md"
                            />
                            {editingTemplateIndex !== null ? (
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleUpdateTemplate}
                                        className="px-4 border border-green-500 text-green-500 hover:bg-green-500 hover:text-black rounded-md font-mono text-xs tracking-wider"
                                    >
                                        UPDATE
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditingTemplateIndex(null)
                                            setNewTemplate("")
                                        }}
                                        className="px-4 border border-gray-600 text-gray-400 hover:border-white hover:text-white rounded-md font-mono text-xs tracking-wider"
                                    >
                                        CANCEL
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={handleAddTemplate}
                                    className="px-4 border border-white text-white hover:bg-white hover:text-black rounded-md font-mono text-xs tracking-wider"
                                >
                                    ADD
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-800">
                        <button
                            onClick={handleSaveSettings}
                            className="w-full bg-white text-black border border-white p-3 font-mono text-sm tracking-wider hover:bg-gray-200 transition-colors rounded-md"
                        >
                            SAVE SETTINGS
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
