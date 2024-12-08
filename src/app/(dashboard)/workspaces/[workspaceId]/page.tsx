import { getCurrent } from "@/features/auth/query";
import { getWorkspaces } from "@/features/workspaces/query";
import { redirect } from "next/navigation";

const workspaceId = async () => {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");
  const workspace = await getWorkspaces();
  if (workspace.total === 0) {
    redirect("/workspaces/create");
  }
  return <div>workspaceId</div>;
};

export default workspaceId;
