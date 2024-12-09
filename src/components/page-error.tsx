"use client";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

interface PageErrorProps {
  message: string;
}
export const PageError = ({
  message = "Something went wrong",
}: PageErrorProps) => {
  return (
    <div className="h-full flex flex-col gap-y-4 items-center justify-center">
      <AlertTriangle className="size-6 text-muted-foreground mb-2" />
      <p className="text-sm font-medium text-muted-foreground">{message}</p>
      {/* <Button variant="secondary" size="sm" asChild>
        <Link href="/">Back to home</Link>
      </Button> */}
    </div>
  );
};
