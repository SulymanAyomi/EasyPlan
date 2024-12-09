import { CreateProjectChat } from "@/features/projects/components/create-project-chat";
import { getProject, getProjectChats } from "@/features/projects/query";
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
  if (!initialValues || !userChat) {
    redirect(`/`);
  }
  return (
    <div className="w-full ">
      <CreateProjectChat initialValues={initialValues} chat={userChat} />
    </div>
  );
};

export default CreateProjectChatPage;
