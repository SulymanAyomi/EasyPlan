import { z } from "zod";
import model from "@/lib/gemini";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { ID, Query } from "node-appwrite"
import { endOfMonth, startOfMonth, subMonths } from "date-fns";

import { DATABASE_ID, IMAGE_BUCKET_ID, PROJECTS_ID, CHATS_ID, TASKS_ID } from "@/config";

import { getMember } from "@/features/members/utils";
import { sessionMiddleware } from "@/lib/session-middleware";

import { createProjectSchema, updateProjectSchema } from "../schema";

import { validationPrompt, createProjectPrompt, createProjectTaskJson } from "@/lib/prompt";

import { TaskStatus } from "@/features/tasks/types";
import { Project } from "../types";



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

            const projects = await databases.listDocuments<Project>(
                DATABASE_ID,
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
                DATABASE_ID,
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
                DATABASE_ID,
                CHATS_ID,
                [
                    Query.equal("projectId", projectId),
                    Query.orderDesc("$createdAt")
                ]

            )

            return c.json({ data: chats })

        }
    ).get("/:projectId",
        sessionMiddleware,
        async (c) => {
            const user = c.get("user");
            const databases = c.get("databases")
            const { projectId } = c.req.param()

            const project = await databases.getDocument<Project>(
                DATABASE_ID,
                PROJECTS_ID,
                projectId,
            )

            const member = await getMember(
                {
                    databases,
                    workspaceId: project.workspaceId,
                    userId: user.$id
                }
            )
            if (!member) {
                return c.json({ error: "Unauthorized" }, 401)
            }

            return c.json({ data: project })
        })
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
                DATABASE_ID,
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
                DATABASE_ID,
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
                        DATABASE_ID,
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
                await Promise.all(tasks)
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
                const { userPrompt } = c.req.valid("form")

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
                DATABASE_ID,
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
                DATABASE_ID,
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
                DATABASE_ID,
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
                DATABASE_ID,
                PROJECTS_ID,
                projectId,

            )

            return c.json({ data: { $id: projectId } })

        }

    )
    .get("/:projectId/analytics",
        sessionMiddleware,
        async (c) => {
            const user = c.get("user");
            const databases = c.get("databases")
            const { projectId } = c.req.param()

            const project = await databases.getDocument(
                DATABASE_ID,
                PROJECTS_ID,
                projectId,
            )

            const member = await getMember(
                {
                    databases,
                    workspaceId: project.workspaceId,
                    userId: user.$id
                }
            )
            if (!member) {
                return c.json({ error: "Unauthorized" }, 401)
            }

            const now = new Date()
            const thisMonthStart = startOfMonth(now)
            const thisMonthEnd = endOfMonth(now)
            const lastMonthStart = startOfMonth(subMonths(now, 1))
            const lastMonthEnd = endOfMonth(subMonths(now, 1))

            const thisMonthTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("projectId", projectId),
                    Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString())
                ]
            )

            const lastMonthTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("projectId", projectId),
                    Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString())
                ]
            )

            const taskCount = thisMonthTasks.total
            const taskDifference = taskCount - lastMonthTasks.total

            const thisMonthAssignedTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("projectId", projectId),
                    Query.equal("assigneeId", member.$id),
                    Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString())
                ]
            )

            const lastMonthAssignedTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("projectId", projectId),
                    Query.equal("assigneeId", member.$id),
                    Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString())
                ]
            )

            const assignedTaskCount = thisMonthAssignedTasks.total
            const assignedTaskDifference = assignedTaskCount - lastMonthAssignedTasks.total

            const thisMonthIncompleteTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("projectId", projectId),
                    Query.notEqual("status", TaskStatus.DONE),
                    Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString())
                ]
            )

            const lastMonthIncompleteTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("projectId", projectId),
                    Query.notEqual("status", TaskStatus.DONE),
                    Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString())
                ]
            )

            const incompleteTaskCount = thisMonthIncompleteTasks.total
            const incompleteTaskDifference =
                incompleteTaskCount - lastMonthIncompleteTasks.total

            const thisMonthCompletedTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("projectId", projectId),
                    Query.equal("status", TaskStatus.DONE),
                    Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString())
                ]
            )

            const lastMonthCompletedTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("projectId", projectId),
                    Query.equal("status", TaskStatus.DONE),
                    Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString())
                ]
            )

            const completedTaskCount = thisMonthCompletedTasks.total
            const completedTaskDifference =
                completedTaskCount - lastMonthCompletedTasks.total

            const thisMonthOverdueTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("projectId", projectId),
                    Query.notEqual("status", TaskStatus.DONE),
                    Query.lessThan("dueDate", now.toISOString()),
                    Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString())
                ]
            )

            const lastMonthOverdueTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("projectId", projectId),
                    Query.notEqual("status", TaskStatus.DONE),
                    Query.lessThan("dueDate", now.toISOString()),
                    Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString())
                ]
            )

            const overDueTaskCount = thisMonthOverdueTasks.total
            const overDueTaskCountDifference =
                overDueTaskCount - lastMonthOverdueTasks.total
            return c.json({
                data: {
                    taskCount,
                    taskDifference,
                    assignedTaskCount,
                    assignedTaskDifference,
                    completedTaskCount,
                    completedTaskDifference,
                    incompleteTaskCount,
                    incompleteTaskDifference,
                    overDueTaskCount,
                    overDueTaskCountDifference
                }
            })
        })



export default app