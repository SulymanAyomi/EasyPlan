import { toast } from "sonner";
import { QueryClient, useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";

type ResponseType = InferResponseType<typeof client.api.tasks[":taskId"]["$patch"], 200>
type RequestType = InferRequestType<typeof client.api.tasks[":taskId"]["$patch"]>


export const useEditTask = () => {
    const queryClient = useQueryClient()
    const router = useRouter()
    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async ({ json, param }) => {            // 
            const response = await client.api.tasks[":taskId"]["$patch"]({ json, param })
            if (!response.ok) {
                throw new Error("Failed to update task")
            }
            return await response.json()
        },
        onSuccess: ({ data }) => {
            toast.success("Task updated successfully")
            queryClient.invalidateQueries({ queryKey: ["tasks"] })
            queryClient.invalidateQueries({ queryKey: ["task", data.$id] })
        },
        onError: () => {
            toast.error("Failed to create task")
        }
    })
    return mutation
}