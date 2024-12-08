import { Models } from "node-appwrite";


export type Project = Models.Document & {
    name: string
    imageUrl: string
    workspaceId: string
}

export type Chat = Models.Document & {
    userPrompt: string
    AIResponse: string
    projectId: string
}