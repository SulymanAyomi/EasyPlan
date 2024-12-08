import workspaceId from "@/app/(dashboard)/workspaces/[workspaceId]/page"
import { z } from "zod"

export const createProjectSchema = z.object({
    userPrompt: z.string().trim().min(1, "Required"),
    image: z.union([
        z.instanceof(File),
        z.string().transform((value) => value === "" ? undefined : value)
    ]).optional(),
    workspaceId: z.string()
})

export const updateProjectSchema = z.object({
    name: z.string().trim().min(1, "Required").optional(),
    image: z.union([
        z.instanceof(File),
        z.string().transform((value) => value === "" ? undefined : value)
    ]).optional(),
})