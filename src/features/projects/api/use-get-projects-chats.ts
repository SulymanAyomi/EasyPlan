import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc"

interface useGetProjectsChatsProps {
    projectId: string;
}

export const useGetProjectsChats = ({ projectId }: useGetProjectsChatsProps) => {
    const query = useQuery({
        queryKey: ["chats", projectId],
        queryFn: async () => {
            const response = await client.api.projects.chats["$get"]({ query: { projectId } });

            if (!response.ok) {
                throw new Error("Failed to fetch workspace")
            }
            const { data } = await response.json();
            return data;
        }
    })

    return query
}