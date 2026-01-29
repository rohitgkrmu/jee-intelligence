"use client";

import * as React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ConfirmSubmitModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  stats: {
    answered: number;
    unanswered: number;
    marked: number;
    total: number;
  };
  timeRemaining: number;
  loading?: boolean;
}

export function ConfirmSubmitModal({
  open,
  onClose,
  onConfirm,
  stats,
  timeRemaining,
  loading,
}: ConfirmSubmitModalProps) {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${secs}s`;
  };

  const hasUnanswered = stats.unanswered > 0;
  const hasMarked = stats.marked > 0;

  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent className="max-w-md">
        <ModalHeader onClose={onClose}>Confirm Submission</ModalHeader>
        <ModalBody className="space-y-4">
          {/* Warning if unanswered or marked questions */}
          {(hasUnanswered || hasMarked) && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <AlertTriangle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-300">
                {hasUnanswered && (
                  <p>
                    You have <strong>{stats.unanswered}</strong> unanswered
                    question{stats.unanswered > 1 ? "s" : ""}.
                  </p>
                )}
                {hasMarked && (
                  <p>
                    You have <strong>{stats.marked}</strong> question
                    {stats.marked > 1 ? "s" : ""} marked for review.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Stats summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-[var(--background-elevated)] text-center">
              <div className="text-2xl font-bold text-green-400">
                {stats.answered}
              </div>
              <div className="text-xs text-[var(--text-muted)]">Answered</div>
            </div>
            <div className="p-3 rounded-lg bg-[var(--background-elevated)] text-center">
              <div className="text-2xl font-bold text-red-400">
                {stats.unanswered}
              </div>
              <div className="text-xs text-[var(--text-muted)]">Unanswered</div>
            </div>
            <div className="p-3 rounded-lg bg-[var(--background-elevated)] text-center">
              <div className="text-2xl font-bold text-purple-400">
                {stats.marked}
              </div>
              <div className="text-xs text-[var(--text-muted)]">
                Marked for Review
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[var(--background-elevated)] text-center">
              <div className="text-2xl font-bold text-[var(--zenith-cyan)]">
                {formatTime(timeRemaining)}
              </div>
              <div className="text-xs text-[var(--text-muted)]">
                Time Remaining
              </div>
            </div>
          </div>

          <p className="text-sm text-[var(--text-secondary)] text-center">
            Are you sure you want to submit your test? This action cannot be
            undone.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Go Back
          </Button>
          <Button
            variant="gradient"
            onClick={onConfirm}
            loading={loading}
          >
            Submit Test
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
