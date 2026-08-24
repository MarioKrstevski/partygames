import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

/** Standard page gutter and max width. Not a shadcn concern — just layout. */
export function PageContainer({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("mx-auto w-full max-w-5xl px-4 py-8 sm:px-6", className)}
      {...props}
    />
  );
}
