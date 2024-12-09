import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { ID, Query } from "node-appwrite"

import { DATEBASE_ID, IMAGE_BUCKET_ID, MEMBERS_ID, WORKSPACES_ID, PROJECTS_ID, CHATS_ID, TASKS_ID } from "@/config";
import { MemberRole } from "@/features/members/types";

import { getMember } from "@/features/members/utils";
import { sessionMiddleware } from "@/lib/session-middleware";
import { createProjectSchema, updateProjectSchema } from "../schema";
import { Project } from "../types";
import model from "@/lib/gemini";
import { json } from "stream/consumers";
import { validationPrompt, createProjectPrompt, createProjectTaskJson } from "@/lib/prompt";
import { TaskActions } from "@/features/tasks/components/task-actions";
import { TaskStatus } from "@/features/tasks/types";

const app = new Hono()
    .get("/",
        sessionMiddleware,
        zValidator("query", z.object({ workspaceId: z.string() })),
        async (c) => {
            const user = c.get("user");
            const databases = c.get("databases");
            const { workspaceId } = c.req.valid("query")

            if (!workspaceId) {
                return c.json({ error: "Workspace missing" }, 400)
            }
            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            })
            if (!member) {
                return c.json({ error: "unauthorized" }, 401);
            }

            const projects = await databases.listDocuments(
                DATEBASE_ID,
                PROJECTS_ID,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.orderDesc("$createdAt")
                ]

            )

            return c.json({ data: projects })

        }
    )
    .get("/chats",
        sessionMiddleware,
        zValidator("query", z.object({ projectId: z.string() })),
        async (c) => {
            const user = c.get("user");
            const databases = c.get("databases");
            const { projectId } = c.req.valid("query")

            if (!projectId) {
                return c.json({ error: "Project missing" }, 400)
            }
            const project = await databases.getDocument(
                DATEBASE_ID,
                PROJECTS_ID,
                projectId
            )
            if (!project) {
                return c.json({ error: "Project missing" }, 400)
            }
            const member = await getMember({
                databases,
                workspaceId: project.$id,
                userId: user.$id
            })
            if (!member) {
                return c.json({ error: "unauthorized" }, 401);
            }

            const chats = await databases.listDocuments(
                DATEBASE_ID,
                CHATS_ID,
                [
                    Query.equal("projectId", projectId),
                    Query.orderDesc("$createdAt")
                ]

            )

            return c.json({ data: chats })

        }
    )
    .post("/",
        zValidator("form", createProjectSchema),
        sessionMiddleware,
        async (c) => {
            const databases = c.get("databases");
            const storage = c.get("storage");
            const user = c.get("user");

            const { userPrompt, image, workspaceId } = c.req.valid("form")

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            })
            if (!member) {
                return c.json({ error: "unauthorized" }, 400);
            }

            let uploadedImageUrl: string | undefined

            if (image instanceof File) {
                const file = await storage.createFile(
                    IMAGE_BUCKET_ID,
                    ID.unique(),
                    image
                )
                const arrayBuffer = await storage.getFilePreview(
                    IMAGE_BUCKET_ID,
                    file.$id
                )
                uploadedImageUrl = `data:image/png;base64,${Buffer.from(arrayBuffer).toString("base64")}`

            }




            const result = await model.generateContent(createProjectPrompt(userPrompt))

            const AIResponse = result.response.text()
            const result2 = await model.generateContent(createProjectTaskJson(userPrompt))
            const jsonResponse = result2.response.text()
            const slicedResponse = jsonResponse.slice(8, -4)
            const objResponse = JSON.parse(slicedResponse)
            


            const projectName = objResponse.projectName
            const projectTasks = objResponse.tasks as Array<{
                name: string,
                status: string,
                dueDate: string,
                description: string
            }>

            const project = await databases.createDocument(
                DATEBASE_ID,
                PROJECTS_ID,
                ID.unique(),
                {
                    name: projectName,
                    imageUrl: uploadedImageUrl,
                    workspaceId
                }
            )
            console.log(projectName)

            await databases.createDocument(
                DATEBASE_ID,
                CHATS_ID,
                ID.unique(),
                {
                    userPrompt,
                    AIResponse,
                    projectId: project.$id
                }
            )
            console.log("chattt")

            async function createTaskWithAi() {
                const tasks = projectTasks.map(async (task, index) => {
                    const position = 1000 * (index + 1)
                    await databases.createDocument(
                        DATEBASE_ID,
                        TASKS_ID,
                        ID.unique(),
                        {
                            name: task.name,
                            status: TaskStatus.TODO,
                            workspaceId,
                            projectId: project.$id,
                            dueDate: new Date(task.dueDate),
                            assigneeId: user.$id,
                            position,
                            description: task.description
                        }
                    )
                })
                const newTasks = await Promise.all(tasks)
            }

            createTaskWithAi()

            return c.json({ data: project })


        }


    )
    .post("/validate",
        // sessionMiddleware,
        zValidator("form", createProjectSchema),
        async (c) => {
            try {
                const { userPrompt, image, workspaceId } = c.req.valid("form")

                const result = await model.generateContent(validationPrompt(userPrompt))

                const validPrompt = result.response.text().trim()
                if (validPrompt.startsWith('valid')) {
                    return c.json({ data: { valid: true, feedback: null } });
                } else if (validPrompt.startsWith('invalid')) {
                    const feedback = validPrompt.replace('invalid:', '').trim();
                    return c.json({ data: { valid: false, feedback: feedback } }, 200)
                } else {
                    throw new Error('Unexpected response format from Gemini');
                }

            } catch (error) {
                console.error(error)
                return c.json({ error: "'Failed to validate prompt'" }, 500);

            }
        }
    )
    .patch(
        "/:projectId",
        sessionMiddleware,
        zValidator("form", updateProjectSchema),
        async (c) => {
            const databases = c.get("databases")
            const storage = c.get("storage")
            const user = c.get("user")

            const { projectId } = c.req.param()
            const { name, image } = c.req.valid("form")

            const existingProject = await databases.getDocument<Project>(
                DATEBASE_ID,
                PROJECTS_ID,
                projectId
            )

            const member = await getMember({
                databases,
                workspaceId: existingProject.workspaceId,
                userId: user.$id
            })

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401)
            }

            let uploadedImageUrl: string | undefined

            if (image instanceof File) {
                const file = await storage.createFile(
                    IMAGE_BUCKET_ID,
                    ID.unique(),
                    image
                )
                const arrayBuffer = await storage.getFilePreview(
                    IMAGE_BUCKET_ID,
                    file.$id
                )
                uploadedImageUrl = `data:image/png;base64,${Buffer.from(arrayBuffer).toString("base64")}`

            } else {
                uploadedImageUrl = image;
            }
            const project = await databases.updateDocument(
                DATEBASE_ID,
                PROJECTS_ID,
                projectId,
                {
                    name,
                    imageUrl: uploadedImageUrl,
                }
            )

            return c.json({ data: project })

        }

    )
    .delete(
        "/:projectId",
        sessionMiddleware,
        async (c) => {
            const databases = c.get("databases")
            const user = c.get("user")

            const { projectId } = c.req.param()


            const existingProject = await databases.getDocument<Project>(
                DATEBASE_ID,
                PROJECTS_ID,
                projectId
            )

            const member = await getMember({
                databases,
                workspaceId: existingProject.workspaceId,
                userId: user.$id
            })
            if (!member) {
                return c.json({ error: "Unauthorized" }, 401)
            }
            await databases.deleteDocument(
                DATEBASE_ID,
                PROJECTS_ID,
                projectId,

            )

            return c.json({ data: { $id: projectId } })

        }

    )



export default app