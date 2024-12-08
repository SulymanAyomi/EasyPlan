"use ";
import { CreateProject } from "@/features/projects/components/create-project";
import { CreateProjectChat } from "@/features/projects/components/create-project-chat";
import { useProjectsId } from "@/features/projects/hooks/use-projects-id";
import { getProject, getProjectChats } from "@/features/projects/query";
import { CreateWorkspaceForm } from "@/features/workspaces/components/create-workspace-form";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { redirect } from "next/navigation";

interface ProjectIdSettingsPageProps {
  params: {
    projectId: string;
  };
}
const CreateProjectChatPage = async ({
  params,
}: ProjectIdSettingsPageProps) => {
  const initialValues = await getProject({ projectId: params.projectId });
  const userChat = await getProjectChats({ projectId: params.projectId });
  // if (!initialValues || !userChat) {
  //   redirect(`/`);
  // }
  return (
    <div className="w-full ">
      <CreateProjectChat initialValues={initialValues} chat={userChat} />
    </div>
  );
};

export default CreateProjectChatPage;
