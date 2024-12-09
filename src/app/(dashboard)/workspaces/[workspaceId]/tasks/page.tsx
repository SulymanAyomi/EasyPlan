import { getCurrent } from "@/features/auth/query";
import { TaskViewSwitcher } from "@/features/tasks/components/task-view-switcher";
import { redirect } from "next/navigation";

const TaskIdPage = async () => {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  return (
    <div className="h-full flex flex-col">
      <TaskViewSwitcher />
    </div>
  );
};
