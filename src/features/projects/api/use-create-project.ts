import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";

type ResponseType = InferResponseType<typeof client.api.projects["$post"], 200>
type RequestType = InferRequestType<typeof client.api.projects["$post"]>


export const useCreateProject = () => {
    const queryClient = useQueryClient()
    const router = useRouter()
    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async ({ form }) => {
            const response = await client.api.projects["$post"]({ form })
            if (!response.ok) {
                throw new Error("something went wrong")
            }
            return await response.json()
        },
        onSuccess: () => {
            toast.success("Project created")
            router.refresh()
            queryClient.invalidateQueries({ queryKey: ["workspace-analytics"] })
            queryClient.invalidateQueries({ queryKey: ["project-analytics"] })
            queryClient.invalidateQueries({ queryKey: ["projects"] })
        },
        onError: () => {
            toast.error("Failed to create project")
        }
    })
    return mutation
}