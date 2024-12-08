"use client";
import { DottedSeparator } from "@/components/dotted-separator";
import { Button } from "@/components/ui/button";
import { CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowBigUp,
  ArrowUp,
  StopCircle,
  StopCircleIcon,
  UploadCloud,
  UploadCloudIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { createProjectSchema } from "../schema";
import { useRouter } from "next/navigation";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { z } from "zod";
import { useCreateProject } from "../api/use-create-project";
import { useValidatePrompt } from "../api/use-validate-prompt";

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
                  console.log(data, "projjjjjjjjjjjj");
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
          <Image src="/upload.png" alt="" height={64} width={64} />
          <h1 className="lg:text-6xl text-4xl">EasyPlanAI</h1>
        </div>
        <div className="flex flex-row w-full justify-between gap-4">
          <div
            onClick={() => quickProject("Plan a marketing campaign")}
            className="flex flex-1 flex-col gap-5 font-light text-sm border p-8 border-neutral-200 rounded-lg h-full items-center justify-between cursor-pointer"
          >
            <Image
              src="/offerProduct.png"
              alt=""
              height={40}
              width={40}
              className="object-cover"
            />
            <span>Plan a marketing campaign</span>
          </div>
          <div
            onClick={() => quickProject("Plan a bungalow project")}
            className="flex flex-1 flex-col gap-5 font-light text-sm border p-8 border-neutral-200 rounded-lg h-full items-center justify-between cursor-pointer"
          >
            <Image
              src="/offerProduct.png"
              alt=""
              height={40}
              width={40}
              className="object-cover"
            />
            <span>Plan a bungalow project</span>
          </div>
          <div
            onClick={() => quickProject("Plan a fitness program")}
            className="flex flex-1 flex-col gap-5 font-light text-sm border p-8 border-neutral-200 rounded-lg h-full items-center justify-between cursor-pointer"
          >
            <Image
              src="/offerProduct.png"
              alt=""
              height={40}
              width={40}
              className="object-cover"
            />
            <span>Plan a fitness program</span>
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
              <Button className="flex justify-center items-center absolute h-full right-0 top-0">
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
