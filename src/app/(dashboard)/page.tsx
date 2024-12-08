import { getCurrent } from "@/features/auth/query";
import { getWorkspaces } from "@/features/workspaces/query";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");
  const workspace = await getWorkspaces();
  if (workspace.total === 0) {
    redirect("/workspaces/create");
  } else {
    redirect(`/workspaces/${workspace?.documents[0].$id}`);
  }
  return <div className="flex gap-5">Home Page</div>;
}
