
export type ManagementLevel = "individual_contributor" | "manager" | "executive"



export type Capability =
    | "Submit"          // Create goals, check-ins
    | "Evaluate"        // Evaluate goals
    | "Admin"           // Role/user/system management
    | "ModifyStandards" // Create/modify goal standards
    | "ModifyTemplates" // Create/modify goal templates

export const capabilityToRoutes: Record<Capability, string[]> = {
    Submit: [
        "/goals/create",
        "/check-ins",
    ],
    Evaluate: [
        "/goals/evaluate",
        "/evaluations_draft",
    ],
    ModifyStandards: [
        "/goal-standards",   // Create or modify goal standards
    ],
    ModifyTemplates: [
        "/goal-templates",   // Create or modify goal templates
    ],
    Admin: [
        "/roles",
        "/users",
        "/settings",
    ]
}

export const managementLevelCapabilities: Record<ManagementLevel, Capability[]> = {
    individual_contributor: ["Submit", "Evaluate", "ModifyStandards"], // can set own goal standards
    manager: ["Submit", "Evaluate", "ModifyStandards", "ModifyTemplates"],
    executive: ["Submit", "Evaluate", "ModifyStandards", "ModifyTemplates", "Admin"],
}

