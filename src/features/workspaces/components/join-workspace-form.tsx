"use client";
import { useRouter } from "next/navigation";
import { DottedSeparator } from "@/components/dotted-separator";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { useJoinWorkspace } from "../api/use-join-workspace";

interface JoinWorkspaceFormProps {
  initialValues: {
    name: string;
  };
  code: string;
  workspaceId: string;
}

export const JoinWorkspaceForm = ({
  initialValues,
  code,
  workspaceId,
}: JoinWorkspaceFormProps) => {
  const router = useRouter();
  const { mutate, isPending } = useJoinWorkspace();

  const onSubmit = () => {
    mutate(
      {
        param: { workspaceId },
        json: { code },
      },
      {
        onSuccess: ({ data }) => {
          router.push(`/workspaces/${data.$id}`);
        },
      }
    );
  };

  return (
    <Card className="w-full h-full border-none shadow-none">
      <CardHeader className="p-7">
        <CardTitle className="text-xl font-bold"></CardTitle>
        <CardDescription>
          You&apos;ve been invited to join <strong>{initialValues.name}</strong>{" "}
        </CardDescription>
      </CardHeader>
      <div className="px-7">
        <DottedSeparator />
      </div>
      <CardContent className="p-7">
        <div className="flex flex-col gap-y-2 gap-x-2 lg:flex-row items-center justify-between">
          <Button
            variant="secondary"
            type="button"
            asChild
            className="w-full lg:w-fit"
            size="lg"
          >
            <Link href="/"></Link>
            Cancel
          </Button>
          <Button
            size="lg"
            className="w-full lg:w-fit"
            type="button"
            disabled={isPending}
            onClick={onSubmit}
          >
            Join Workspace
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
