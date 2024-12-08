import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { client } from "@/lib/rpc";
import { InferResponseType } from "hono";


type ResponseType = InferResponseType<typeof client.api.auth.logout["$post"]>

export const useLogout = () => {
    const queryClient = useQueryClient()
    const router = useRouter()
    const mutation = useMutation<
        ResponseType,
        Error
    >({
        mutationFn: async () => {
            const response = await client.api.auth.logout["$post"]()
            if (!response.ok) {
                toast.error("Logged out failed")
                return await response.json()

            }
            return await response.json()
        },
        onSuccess: () => {
            toast.success("Logged out!")
            router.refresh()
            queryClient.invalidateQueries({ queryKey: ["current"] })

        }
    })
    return mutation
}