import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";

type ResponseType = InferResponseType<typeof client.api.projects.validate["$post"], 200>
type RequestType = InferRequestType<typeof client.api.projects.validate["$post"]>


export const useValidatePrompt = () => {
    const router = useRouter()
    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async ({ form }) => {
            const response = await client.api.projects.validate["$post"]({ form })
            if (!response.ok) {
                throw new Error("something went wrong")
            }
            return await response.json()
        },
        onSuccess: ({ data }) => {
            if (data.valid) {
                toast.success("Initializing project...")
            }
            router.refresh()
        },
        onError: (error) => {
            toast.error("Failed to create project")
            throw new Error(error.message)
        }
    })
    return mutation
}