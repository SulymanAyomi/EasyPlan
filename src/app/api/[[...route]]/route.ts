import { Hono } from "hono"
import { cors } from 'hono/cors'
import { handle } from "hono/vercel"
import auth from "@/features/auth/server/route"
import workspace from "@/features/workspaces/server/route"
import members from "@/features/members/server/route"
import projects from "@/features/projects/server/route"
import tasks from "@/features/tasks/server/route"

const app = new Hono().basePath("/api")
app.use('/api/*', cors())

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const routes = app
    .route("/auth", auth)
    .route("/workspaces", workspace)
    .route("/members", members)
    .route("/projects", projects)
    .route("/tasks", tasks)

export const GET = handle(app)
export const POST = handle(app)
export const DELETE = handle(app)
export const PATCH = handle(app)

export type AppType = typeof routes