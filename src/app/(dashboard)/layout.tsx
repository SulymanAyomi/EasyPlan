import Navbar from "@/components/navbar";
import Sidebar from "@/components/siderbar";
import { CreateTaskModal } from "@/features/tasks/components/create-task-modal";
import { CreateWorkspaceModal } from "@/features/workspaces/components/create-workspace-modal";
import React from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}
const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen">
      <CreateTaskModal />
      <CreateWorkspaceModal />
      <div className="flex w-full h-full">
        <div className="fixed left-0 hidden lg:block lg:w-[264px] h-full overflow-y-auto">
          <Sidebar />
        </div>
        <div className="lg:pl-[264px] w-full">
          <div className="mx-auto max-w-screen-2xl h-full">
            <Navbar />
            <main className="h-full py-8 px-6 flex flex-col">{children}</main>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DashboardLayout;
