import { getCurrent } from "@/features/auth/query";
import { redirect } from "next/navigation";
import { WorkspaceIdClient } from "./client";

const workspaceId = async () => {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  return <WorkspaceIdClient />;
};

export default workspaceId;
