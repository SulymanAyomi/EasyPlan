import styles from "./create-project-chat.module.css";
import { DottedSeparator } from "@/components/dotted-separator";
import { Button } from "@/components/ui/button";
import { CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ArrowUp } from "lucide-react";
import { Chat, Project } from "../types";
import Markdown from "react-markdown";

interface CreateProjectChatProps {
  initialValues: Project;
  chat: Chat;
}

export const CreateProjectChat = ({
  initialValues,
  chat,
}: CreateProjectChatProps) => {
  return (
    <div className="h-full  flex flex-col items-center">
      <div className="flex-1 w-full flex justify-center">
        <div className=" w-full lg:w-3/6 flex flex-col gap-5">
          <div
            className={cn(
              "p-5 bg-neutral-100 rounded-xl w-full md:max-w-[80%] self-end"
            )}
          >
            {chat.userPrompt}
          </div>
          <div
            className={cn(
              "p-5 bg-neutral-100 rounded-xl max-w-full self-start"
            )}
          >
            <Markdown>{chat.AIResponse}</Markdown>
          </div>

          <div className="fixed bottom-1 text-center w-[80%] lg:w-[40%]">
            <form className="flex flex-1 relative">
              <Input
                type="text"
                placeholder=""
                className="border-none focus:border-none focus-visible:border-none bg-neutral-100 w-full"
              />
              <Button className="flex justify-center items-center absolute h-full right-0">
                <ArrowUp />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
