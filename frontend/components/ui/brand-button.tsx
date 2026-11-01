import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type BrandButtonProps = Omit<React.ComponentProps<typeof Button>, "variant"> & {
  tone?: "radial" | "ink";
};

function BrandButton({ className, tone = "radial", ...props }: BrandButtonProps) {
  const appearance = tone === "ink"
    ? "rounded-md !bg-workspace-action !text-white !bg-none hover:!bg-workspace-action-hover"
    : "rounded-full bg-[radial-gradient(130%_120%_at_50%_0%,var(--brand-button-top)_0%,var(--brand-button-bottom)_100%)] text-brand-button-ink hover:bg-[radial-gradient(130%_120%_at_50%_0%,var(--brand-button-top)_0%,var(--brand-button-hover)_100%)]";

  return (
    <Button
      {...props}
      variant="default"
      className={cn(
        `cursor-pointer border-transparent transition-[background-color,background-image,transform] duration-150 ease-out active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 ${appearance}`,
        className,
      )}
    />
  )
}

export { BrandButton }
