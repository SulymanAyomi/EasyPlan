
import { CHATS_ID, DATABASE_ID, PROJECTS_ID, } from "@/config";
import { getMember } from "../members/utils";
import { createSessionClient } from "@/lib/appwrite";
import { Chat, Project } from "./types";
import { Query } from "node-appwrite";

interface GetProjectProps {
    projectId: string;
}


export const getProject = async ({ projectId }: GetProjectProps) => {
    try {

        const { account, databases } = await createSessionClient()

        const user = await account.get()

        const project = await databases.getDocument<Project>(
            DATABASE_ID,
            PROJECTS_ID,
            projectId
        )
        const member = await getMember({
            databases,
            workspaceId: project.workspaceId,
            userId: user.$id
        })

        if (!member) {
            throw new Error("unauthorized")
        }

        return project

    } catch (error) {
        console.log(error);

        return null
    }
}

export const getProjectChats = async ({ projectId }: GetProjectProps) => {
    try {

        const { account, databases } = await createSessionClient()

        const user = await account.get()

        const project = await databases.getDocument<Project>(
            DATABASE_ID,
            PROJECTS_ID,
            projectId
        )
        const member = await getMember({
            databases,
            workspaceId: project.workspaceId,
            userId: user.$id
        })

        if (!member) {
            throw new Error("unauthorized")
        }
        const chat = await databases.listDocuments(
            DATABASE_ID,
            CHATS_ID,
            [Query.equal("projectId", project.$id),
            Query.orderDesc("$createdAt")
            ]
        )
        console.log(chat)

        return chat.documents[0] as Chat

    } catch (error) {
        console.log(error);

        return null
    }
}
