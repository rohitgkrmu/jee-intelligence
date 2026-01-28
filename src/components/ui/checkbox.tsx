"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string | React.ReactNode;
  error?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const generatedId = React.useId();
    const checkboxId = id || generatedId;

    return (
      <div className="flex flex-col">
        <div className="flex items-start gap-3">
          <div className="relative flex items-center">
            <input
              type="checkbox"
              id={checkboxId}
              ref={ref}
              className="peer sr-only"
              {...props}
            />
            <div
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all",
                "border-[var(--border-light)] bg-[var(--background-card)]",
                "peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--zenith-cyan)] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[var(--background-dark)]",
                "peer-checked:border-[var(--zenith-cyan)] peer-checked:bg-[var(--zenith-cyan)]",
                "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
                error && "border-[var(--error)]",
                className
              )}
            >
              <Check className="h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100" />
            </div>
          </div>
          {label && (
            <label
              htmlFor={checkboxId}
              className="text-sm text-[var(--text-secondary)] cursor-pointer select-none leading-snug peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
            >
              {label}
            </label>
          )}
        </div>
        {error && (
          <p className="mt-1 text-xs text-[var(--error)]">{error}</p>
        )}
      </div>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
