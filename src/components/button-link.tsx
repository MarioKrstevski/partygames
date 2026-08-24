import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { ComponentProps } from "react";

type ButtonProps = ComponentProps<typeof Button>;

/**
 * A link that looks like a button — shadcn's `asChild` pattern wrapped once so
 * call sites stay a single tag.
 */
export function ButtonLink({
  variant,
  size,
  className,
  ...props
}: ComponentProps<typeof Link> & {
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
}) {
  return (
    <Button asChild variant={variant} size={size} className={className}>
      <Link {...props} />
    </Button>
  );
}
