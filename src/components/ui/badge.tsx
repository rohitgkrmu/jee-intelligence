import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[var(--zenith-primary)] text-white",
        secondary:
          "border-transparent bg-[var(--background-elevated)] text-[var(--text-secondary)]",
        success:
          "border-transparent bg-green-500/10 text-green-400 border-green-500/20",
        warning:
          "border-transparent bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        error:
          "border-transparent bg-red-500/10 text-red-400 border-red-500/20",
        info:
          "border-transparent bg-blue-500/10 text-blue-400 border-blue-500/20",
        outline:
          "text-[var(--text-secondary)] border-[var(--border-light)]",
        cyan:
          "border-transparent bg-[var(--zenith-cyan)]/10 text-[var(--zenith-cyan)] border-[var(--zenith-cyan)]/20",
        purple:
          "border-transparent bg-[var(--zenith-purple)]/10 text-[var(--zenith-purple)] border-[var(--zenith-purple)]/20",
        accent:
          "border-transparent bg-[var(--zenith-accent)]/10 text-[var(--zenith-accent)] border-[var(--zenith-accent)]/20",
        rising:
          "border-transparent bg-green-500/10 text-green-400 border-green-500/20",
        falling:
          "border-transparent bg-red-500/10 text-red-400 border-red-500/20",
        stable:
          "border-transparent bg-slate-500/10 text-slate-400 border-slate-500/20",
      },
      size: {
        sm: "text-[10px] px-2 py-0",
        md: "text-xs px-2.5 py-0.5",
        lg: "text-sm px-3 py-1",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
