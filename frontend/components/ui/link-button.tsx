import Link, { type LinkProps } from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/styles/cn";

type LinkButtonVariant = "primary" | "secondary" | "ghost";

type LinkButtonProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
    children: ReactNode;
    variant?: LinkButtonVariant;
  };

const variantClasses: Record<LinkButtonVariant, string> = {
  primary:
    "border-[rgba(176,106,179,0.35)] bg-[#b06ab3] text-white hover:bg-[#9e56a2]",
  secondary:
    "border-[rgba(176,106,179,0.25)] bg-[rgba(255,255,255,0.06)] text-[#f0f0f0] hover:bg-[rgba(255,255,255,0.1)]",
  ghost:
    "border-transparent bg-transparent text-[#d4a5d6] hover:bg-[rgba(255,255,255,0.06)] hover:text-[#f0d2f2]",
};

export function LinkButton({
  children,
  className,
  variant = "primary",
  ...props
}: LinkButtonProps) {
  return (
    <Link
      className={cn(
        "inline-flex h-11 items-center justify-center rounded-md border px-6 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d4a5d6]",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
