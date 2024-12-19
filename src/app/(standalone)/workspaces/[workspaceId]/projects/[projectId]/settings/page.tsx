import { getCurrent } from "@/features/auth/query";
import { EditProjectForm } from "@/features/projects/components/edit-project-form";
import { getProject } from "@/features/projects/query";
import { redirect } from "next/navigation";
import { ProjectIdSettingsClient } from "./client";

interface ProjectIdSettingsPageProps {
  params: {
    projectId: string;
  };
}

const ProjectIdSettingsPage = async ({
  params,
}: ProjectIdSettingsPageProps) => {
  const user = await getCurrent();

  if (!user) redirect("/sign-in");

  return <ProjectIdSettingsClient />;
};

export default ProjectIdSettingsPage;
