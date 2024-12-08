import { useParams } from "next/navigation"

export const useProjectsId = () => {
    const params = useParams();
    return params.projectsId as string;
}