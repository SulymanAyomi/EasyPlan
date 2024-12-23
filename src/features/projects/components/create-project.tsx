"use client";
import { z } from "zod";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowUp, StopCircleIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { useCreateProject } from "../api/use-create-project";
import { useValidatePrompt } from "../api/use-validate-prompt";
import { createProjectSchema } from "../schema";

import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";

import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const CreateProject = () => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const { mutate, isPending } = useValidatePrompt();
  const { mutate: createProject, isPending: isCreateProjectPending } =
    useCreateProject();

  const form = useForm<z.infer<typeof createProjectSchema>>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      userPrompt: "",
      workspaceId,
    },
  });
  const quickProject = (value: string) => {
    form.setValue("userPrompt", value);

    onSubmit({ workspaceId: workspaceId, userPrompt: value, image: "" });
  };
  const onSubmit = (values: z.infer<typeof createProjectSchema>) => {
    console.log(values);
    const finalValues = {
      ...values,
      image: values.image instanceof File ? values.image : "",
    };
    mutate(
      { form: finalValues },
      {
        onSuccess: ({ data }) => {
          if (data.valid) {
            createProject(
              { form: finalValues },
              {
                onSuccess: ({ data }) => {
                  router.push(
                    `/workspaces/${data.workspaceId}/projects/create/${data.$id}`
                  );
                },
              }
            );
          } else {
            console.log(data);
          }
          form.reset();
        },
      }
    );
  };

  return (
    <div className="flex h-full w-full flex-col items-center">
      <div className="flex-1 flex flex-col justify-center items-center gap-[50px]">
        <div className="flex items-center opacity-20 gap-5">
          <Image src="/logo.svg" alt="" height={64} width={64} />
          <h1 className="lg:text-6xl text-4xl">EasyPlanAI</h1>
        </div>
        <div className="flex flex-row w-full justify-between gap-4 text-center">
          <div
            onClick={() =>
              quickProject(
                "Create a task list for preparing a financial statement, including deadlines"
              )
            }
            className="flex flex-1 flex-col gap-5 font-light text-sm border p-8 border-neutral-200 rounded-lg h-full items-center justify-between cursor-pointer"
          >
            <Image
              src="/image1.svg"
              alt=""
              height={40}
              width={40}
              className="object-cover"
            />
            <span>Financial statement preparation.</span>
          </div>
          <div
            onClick={() => quickProject("Plan a bungalow project")}
            className="flex flex-1 flex-col gap-5 font-light text-sm border p-8 border-neutral-200 rounded-lg h-full items-center justify-between cursor-pointer"
          >
            <Image
              src="/image2.svg"
              alt=""
              height={40}
              width={40}
              className="object-cover"
            />
            <span>Plan a bungalow project</span>
          </div>
          <div
            onClick={() => quickProject("Plan a new product launch")}
            className="flex flex-1 flex-col gap-5 font-light text-sm border p-8 border-neutral-200 rounded-lg h-full items-center justify-between cursor-pointer"
          >
            <Image
              src="/image3.svg"
              alt=""
              height={40}
              width={40}
              className="object-cover"
            />
            <span>Plan a new product launch</span>
          </div>
        </div>
      </div>
      <div className="mt-auto w-full md:w-3/6 flex rounded-md">
        <Form {...form}>
          <form className="flex flex-1" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="relative w-full">
              <FormField
                control={form.control}
                name="userPrompt"
                render={({ field }) => (
                  <FormItem className="relative">
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder="What can I help you with?"
                        className="border-none focus:border-none focus-visible:border-none bg-neutral-100"
                      />
                    </FormControl>
                  </FormItem>
                )}
              ></FormField>
              <Button
                disabled={isPending || isCreateProjectPending}
                className="flex justify-center items-center absolute h-full right-0 top-0"
              >
                {isPending || isCreateProjectPending ? (
                  <StopCircleIcon />
                ) : (
                  <ArrowUp />
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};
