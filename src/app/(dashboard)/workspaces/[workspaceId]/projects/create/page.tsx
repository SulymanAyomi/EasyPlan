import { CreateProject } from "@/features/projects/components/create-project";
import { CreateWorkspaceForm } from "@/features/workspaces/components/create-workspace-form";

const WorkspaceCreatePage = () => {
  return (
    <div className="w-full h-[calc(100vh-88px)]">
      <CreateProject />
    </div>
  );
};

export default WorkspaceCreatePage;
