"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "./button";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

function Modal({ open, onClose, children, className }: ModalProps) {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      {/* Modal content */}
      <div
        className={cn(
          "relative z-10 w-full max-w-lg mx-4 animate-slide-up",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}

type ModalContentProps = React.HTMLAttributes<HTMLDivElement>;

function ModalContent({ className, children, ...props }: ModalContentProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--border-dark)] bg-[var(--background-card)] shadow-2xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  onClose?: () => void;
}

function ModalHeader({ className, onClose, children, ...props }: ModalHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-b border-[var(--border-dark)] px-6 py-4",
        className
      )}
      {...props}
    >
      <div className="font-semibold text-[var(--text-primary)]">{children}</div>
      {onClose && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

type ModalBodyProps = React.HTMLAttributes<HTMLDivElement>;

function ModalBody({ className, children, ...props }: ModalBodyProps) {
  return (
    <div className={cn("px-6 py-4", className)} {...props}>
      {children}
    </div>
  );
}

type ModalFooterProps = React.HTMLAttributes<HTMLDivElement>;

function ModalFooter({ className, children, ...props }: ModalFooterProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-3 border-t border-[var(--border-dark)] px-6 py-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter };
