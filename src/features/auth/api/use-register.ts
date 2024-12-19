import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type ResponseType = InferResponseType<typeof client.api.auth.register["$post"]>
type RequestType = InferRequestType<typeof client.api.auth.register["$post"]>


export const useRegister = () => {
    const router = useRouter()
    const queryClient = useQueryClient()

    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async ({ json }) => {
            const response = await client.api.auth.register["$post"]({ json })
            return response.json()
        },
        onSuccess: async () => {
            toast.success("User registered successfully")
            router.refresh()
            queryClient.invalidateQueries({ queryKey: ["current"] })
            queryClient.invalidateQueries({ queryKey: ["workspaces"] })
        },
        onError: async () => {
            toast.success("User registration failed")

        }
    })
    return mutation
}