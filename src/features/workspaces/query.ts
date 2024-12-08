import { cookies } from "next/headers";
import { Account, Client, Databases, Query } from "node-appwrite";

import { AUTH_COOKIE } from "@/features/auth/constants";
import { DATEBASE_ID, MEMBERS_ID, WORKSPACES_ID } from "@/config";
import { getMember } from "../members/utils";
import { Workspace } from "./types";
import { createSessionClient } from "@/lib/appwrite";
import workspaceId from "@/app/(dashboard)/workspaces/[workspaceId]/page";

export const getWorkspaces = async () => {
    const { account, databases } = await createSessionClient()

    const user = await account.get()


    const members = await databases.listDocuments(
        DATEBASE_ID,
        MEMBERS_ID,
        [Query.equal("userId", user.$id)]
    )
    if (members.total === 0) {
        return { data: { documents: [], total: 0 } }
    }
    const workspaceIds = members.documents.map((members) => members.workspaceId);


    const workspaces = await databases.listDocuments<Workspace>(
        DATEBASE_ID,
        WORKSPACES_ID,
        [Query.orderDesc("$createdAt"),
        Query.contains("$id", workspaceIds)]
    )

    return { documents: workspaces.documents ?? [], total: workspaces.total }


}

interface GetWorkspaceProps {
    workspaceId: string
}
export const getWorkspace = async ({ workspaceId }: GetWorkspaceProps) => {
    const { account, databases } = await createSessionClient()

    const user = await account.get()

    const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id
    })

    if (!member) {
        throw new Error("Unauthourize")
    }


    const workspace = await databases.getDocument<Workspace>(
        DATEBASE_ID,
        WORKSPACES_ID,
        workspaceId
    )

    return workspace


}

interface GetWorkspaceInfoProps {
    workspaceId: string
}

export const getWorkspaceInfo = async ({ workspaceId }: GetWorkspaceInfoProps) => {
    const { databases, account } = await createSessionClient()
    const workspace = await databases.getDocument<Workspace>(
        DATEBASE_ID,
        WORKSPACES_ID,
        workspaceId
    )

    return { name: workspace.name }

}