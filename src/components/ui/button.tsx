"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--zenith-primary)] text-white hover:bg-[var(--zenith-primary-dark)] shadow-md hover:shadow-lg focus-visible:ring-[var(--zenith-primary)]",
        accent:
          "bg-[var(--zenith-accent)] text-white hover:bg-[var(--zenith-accent-dark)] shadow-md hover:shadow-lg focus-visible:ring-[var(--zenith-accent)]",
        cyan:
          "bg-[var(--zenith-cyan)] text-white hover:bg-[var(--zenith-cyan-dark)] shadow-md hover:shadow-lg focus-visible:ring-[var(--zenith-cyan)]",
        outline:
          "border border-[var(--border-light)] bg-transparent text-[var(--text-primary)] hover:bg-[var(--background-elevated)] hover:border-[var(--zenith-primary)]",
        ghost:
          "text-[var(--text-secondary)] hover:bg-[var(--background-elevated)] hover:text-[var(--text-primary)]",
        gradient:
          "bg-gradient-to-r from-[var(--zenith-primary)] to-[var(--zenith-cyan)] text-white hover:opacity-90 shadow-md hover:shadow-lg",
        gradientAccent:
          "bg-gradient-to-r from-[var(--zenith-accent)] to-[var(--zenith-purple)] text-white hover:opacity-90 shadow-md hover:shadow-lg",
        destructive:
          "bg-[var(--error)] text-white hover:bg-red-600 shadow-md focus-visible:ring-red-500",
        link: "text-[var(--zenith-cyan)] underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
